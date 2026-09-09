import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Search, 
  Sparkles, 
  AlertTriangle, 
  HelpCircle, 
  BookMarked, 
  Clock, 
  Volume2, 
  CheckCircle2, 
  ExternalLink, 
  ChevronRight, 
  Download, 
  FileText, 
  FileDown, 
  Copy, 
  Check, 
  Loader2, 
  ChevronDown,
  FileEdit,
  Layout,
  Plus,
  LocateFixed
} from 'lucide-react';
import { LectureSession, TimedWord, MisspeakAlert, QuickNote } from '../types';
import { 
  downloadMarkdownFile, 
  downloadPdfTranscript, 
  generateMarkdownTranscript 
} from '../utils/transcriptExport';
import { QuickNotes } from './QuickNotes';
import { getQuickNotes } from '../utils/persistence';

interface TranscriptViewProps {
  lecture: LectureSession;
  currentMs: number;
  isPlaying?: boolean;
  onWordClick: (startMs: number) => void;
  onAskSocraticAboutWord: (term: string) => void;
  onSelectMisspeak: (misspeak: MisspeakAlert) => void;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  lecture,
  currentMs,
  isPlaying = false,
  onWordClick,
  onAskSocraticAboutWord,
  onSelectMisspeak,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<TimedWord | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<'pdf' | 'md' | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'transcript' | 'notes'>('transcript');
  const [prefillTimestampMs, setPrefillTimestampMs] = useState<number | null>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  // Track notes count for header badges and inline markers
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>(() => getQuickNotes(lecture.id));

  // Sync notes on lecture change or external additions
  useEffect(() => {
    setQuickNotes(getQuickNotes(lecture.id));

    const handleNotesUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ lectureId: string; notes: QuickNote[] }>;
      if (customEvent.detail && customEvent.detail.lectureId === lecture.id) {
        setQuickNotes(customEvent.detail.notes);
      }
    };
    window.addEventListener('scribo-notes-persisted', handleNotesUpdate);
    return () => {
      window.removeEventListener('scribo-notes-persisted', handleNotesUpdate);
    };
  }, [lecture.id]);

  const splitScrollRef = useRef<HTMLDivElement>(null);
  const fullScrollRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportPdf = () => {
    setIsExporting('pdf');
    setExportDropdownOpen(false);
    setTimeout(() => {
      try {
        downloadPdfTranscript(lecture, quickNotes);
      } catch (err) {
        console.error('Failed to export PDF:', err);
      } finally {
        setIsExporting(null);
      }
    }, 150);
  };

  const handleExportMarkdown = useCallback(() => {
    setIsExporting('md');
    setExportDropdownOpen(false);
    setTimeout(() => {
      try {
        downloadMarkdownFile(lecture, quickNotes);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 2600);
      } catch (err) {
        console.error('Failed to export Markdown notes:', err);
      } finally {
        setIsExporting(null);
      }
    }, 100);
  }, [lecture, quickNotes]);

  const handleCopyMarkdown = async () => {
    try {
      const md = generateMarkdownTranscript(lecture, quickNotes);
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  // Identify the currently spoken word based on current playhead with latching during speech pauses
  const currentWordIndex = useMemo(() => {
    if (lecture.words.length === 0) return -1;
    // 1. Exact interval match
    const exact = lecture.words.findIndex(
      (w) => currentMs >= w.startMs && currentMs <= w.endMs
    );
    if (exact !== -1) return exact;

    // 2. Before first word
    if (currentMs < lecture.words[0].startMs) return 0;

    // 3. Natural speech pauses between words: latch onto the most recently started word
    let lastSpokenIndex = -1;
    for (let i = 0; i < lecture.words.length; i++) {
      if (lecture.words[i].startMs <= currentMs) {
        lastSpokenIndex = i;
      } else {
        break;
      }
    }
    return lastSpokenIndex;
  }, [lecture.words, currentMs]);

  // Smoothly center the active word vertically in the active scroll container
  const centerActiveWord = useCallback(
    (behavior: ScrollBehavior = 'smooth', force = false) => {
      const wordEl = activeWordRef.current;
      if (!wordEl) return;

      const targetContainer = viewMode === 'split' ? splitScrollRef.current : fullScrollRef.current;
      if (!targetContainer) return;

      // Check if container has vertical scroll overflow
      const isScrollable = targetContainer.scrollHeight > targetContainer.clientHeight + 10;

      if (isScrollable) {
        const containerRect = targetContainer.getBoundingClientRect();
        const wordRect = wordEl.getBoundingClientRect();

        // Calculate vertical center points
        const wordCenter = wordRect.top + wordRect.height / 2;
        const containerCenter = containerRect.top + containerRect.height / 2;
        const delta = wordCenter - containerCenter;

        // Only scroll if delta is greater than 8px (to avoid micro-jitter on words within the same line)
        // or if explicitly forced (e.g. seeking, view mode change, or manual centering)
        if (force || Math.abs(delta) > 8) {
          targetContainer.scrollTo({
            top: Math.max(0, targetContainer.scrollTop + delta),
            behavior,
          });
        }
      } else {
        // Fallback for compact viewports where an ancestor container controls scrolling
        wordEl.scrollIntoView({
          behavior,
          block: 'center',
          inline: 'nearest',
        });
      }
    },
    [viewMode]
  );

  // Auto-scroll when active word changes during playback or seeking
  useEffect(() => {
    if (!autoScroll) return;
    if (currentWordIndex < 0) return;
    centerActiveWord('smooth', false);
  }, [currentWordIndex, autoScroll, centerActiveWord]);

  // Center immediately when playback starts or resumes
  useEffect(() => {
    if (isPlaying && autoScroll && currentWordIndex >= 0) {
      centerActiveWord('smooth', true);
    }
  }, [isPlaying, autoScroll, currentWordIndex, centerActiveWord]);

  // Re-center when switching between Split View and Full Transcript view
  useEffect(() => {
    if (autoScroll && currentWordIndex >= 0) {
      const timer = setTimeout(() => {
        centerActiveWord('auto', true);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [viewMode, autoScroll, currentWordIndex, centerActiveWord]);

  // If user explicitly scrolls with wheel or touch while playback is active, gently pause auto-scroll
  const handleUserManualScroll = () => {
    if (autoScroll && isPlaying) {
      setAutoScroll(false);
    }
  };

  // Filtered words for search
  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return false;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Pre-calculate notes timestamps for fast inline annotation mapping
  const notesByApproxMs = useMemo(() => {
    const map = new Map<number, QuickNote>();
    quickNotes.forEach((n) => {
      map.set(n.timestampMs, n);
    });
    return map;
  }, [quickNotes]);

  const findNoteNearWord = (wordStartMs: number, wordEndMs: number) => {
    return quickNotes.find(
      (n) => Math.abs(n.timestampMs - wordStartMs) <= 1200 || (n.timestampMs >= wordStartMs && n.timestampMs <= wordEndMs)
    );
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-3.5 sm:p-5 shadow-xs flex flex-col h-full">
      {/* 1. Header with Mode Switcher, Search Bar & Export Menu */}
      <div className="flex flex-col gap-3 pb-3 mb-3 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Title & Metadata */}
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Live Word-Synced Transcript
              </h2>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {lecture.words.length} Tokens
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tap any word to scrub live audio or anchor private annotations at that exact timestamp.
            </p>
          </div>

          {/* View Mode Segmented Switcher */}
          <div className="flex items-center self-start md:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('transcript')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'transcript'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Full width transcript view"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Transcript</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Dual pane: Word-synced transcript and Quick Notes side-by-side"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('notes')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'notes'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Dedicated Quick Notes annotations panel"
            >
              <FileEdit className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quick Notes</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-200">
                {quickNotes.length}
              </span>
            </button>
          </div>
        </div>

        {/* Action Controls: Search Bar & Export Menu */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors min-h-[34px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto-Scroll Playhead Centering Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !autoScroll;
                setAutoScroll(next);
                if (next) {
                  setTimeout(() => centerActiveWord('smooth', true), 50);
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all min-h-[34px] shadow-2xs border ${
                autoScroll
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200/50'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={autoScroll ? 'Auto-scroll is ON: Playing word stays centered vertically' : 'Auto-scroll paused: Click to re-center and resume'}
            >
              <LocateFixed className={`w-3.5 h-3.5 ${autoScroll ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Auto-Scroll</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                autoScroll ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {autoScroll ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Quick Note Add Shortcut Button */}
            <button
              type="button"
              onClick={() => {
                setPrefillTimestampMs(currentMs);
                if (viewMode === 'transcript') setViewMode('split');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer transition-colors min-h-[34px] shadow-2xs"
              title="Add a quick note at current playback time"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Jot Note @ {formatMs(currentMs)}</span>
            </button>

            {/* Direct 1-Click "Export Notes" Button */}
            <button
              id="export-notes-btn"
              type="button"
              onClick={handleExportMarkdown}
              disabled={isExporting !== null}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all min-h-[34px] disabled:opacity-50 whitespace-nowrap shadow-xs ${
                exportSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white'
              }`}
              title="Download Markdown study notes (.md) containing full transcript, highlighted keywords, and captured misspeak alerts"
            >
              {isExporting === 'md' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : exportSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>
                {isExporting === 'md'
                  ? 'Exporting...'
                  : exportSuccess
                  ? 'Notes Exported!'
                  : 'Export Notes'}
              </span>
            </button>

            {/* Additional Export Formats Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                disabled={isExporting !== null}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer transition-colors min-h-[34px] disabled:opacity-50 whitespace-nowrap shadow-2xs"
                title="Additional export formats (PDF, Markdown copy)"
              >
                {isExporting === 'pdf' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{isExporting === 'pdf' ? 'Exporting PDF...' : 'More Formats'}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Popover */}
              {exportDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-30 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Study Notes & Exports
                    </span>
                    {quickNotes.length > 0 && (
                      <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                        Includes {quickNotes.length} notes
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {/* Export Markdown Button */}
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-indigo-50/60 text-left transition-colors cursor-pointer group"
                    >
                      <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 mt-0.5 group-hover:bg-indigo-100 transition-colors">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Export Notes</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-mono">.md</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Markdown file with transcript, highlighted keywords & misspeak alerts
                        </p>
                      </div>
                    </button>

                    {/* Export PDF Button */}
                    <button
                      onClick={handleExportPdf}
                      className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group"
                    >
                      <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 mt-0.5 group-hover:bg-rose-100 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Export as PDF</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-mono">.pdf</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Formatted print document with overview, annotations & fact-checks
                        </p>
                      </div>
                    </button>

                    {/* Copy to Clipboard */}
                    <button
                      onClick={handleCopyMarkdown}
                      className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group"
                    >
                      <div className={`p-1.5 rounded-lg border mt-0.5 transition-colors ${
                        copied 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                          : 'bg-slate-100 border-slate-200 text-slate-600 group-hover:bg-slate-200'
                      }`}>
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{copied ? 'Copied to Clipboard!' : 'Copy Raw Markdown'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Instant clipboard copy for fast pasting into study sheets
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Body with Responsive Split / Single Layouts */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* VIEW 1: Split View (Word-synced transcript on left, Quick Notes on right) */}
        {viewMode === 'split' && (
          <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 h-full min-h-0 flex-1 overflow-y-auto md:overflow-hidden">
            {/* Left Column: Word-Synced Live Transcript */}
            <div className="w-full md:col-span-7 flex flex-col h-auto min-h-[440px] md:min-h-0 md:h-full overflow-hidden shrink-0 md:shrink">
              <div className="flex items-center justify-between pb-1.5 mb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                <span>Lecture Speech Stream</span>
                <span className="text-slate-400 font-normal">Click word to scrub audio / annotate</span>
              </div>

              <div 
                ref={splitScrollRef}
                onWheel={handleUserManualScroll}
                onTouchMove={handleUserManualScroll}
                className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 leading-relaxed font-sans text-slate-800 relative scroll-smooth"
              >
                {/* Floating Re-center Pill when auto-scroll is temporarily paused by manual scrolling */}
                {!autoScroll && (
                  <div className="sticky top-2 z-20 flex justify-center pointer-events-none">
                    <button
                      type="button"
                      onClick={() => {
                        setAutoScroll(true);
                        setTimeout(() => centerActiveWord('smooth', true), 40);
                      }}
                      className="pointer-events-auto flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold shadow-md shadow-indigo-300 transition-all cursor-pointer animate-in fade-in"
                    >
                      <LocateFixed className="w-3.5 h-3.5" />
                      <span>Re-center Current Word</span>
                    </button>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs sm:text-sm leading-loose select-text">
                  {lecture.words.map((word, idx) => {
                    const isCurrentlyPlaying = idx === currentWordIndex;
                    const isSearchHit = matchesSearch(word.text);
                    const isMisspeak = Boolean(word.isFlaggedMisspeak);
                    const isKey = Boolean(word.isKeyTerm);
                    const noteNearWord = findNoteNearWord(word.startMs, word.endMs);

                    return (
                      <span key={word.id} className="inline-block relative">
                        <span
                          ref={isCurrentlyPlaying ? activeWordRef : undefined}
                          onClick={() => {
                            onWordClick(word.startMs);
                            setSelectedWord(word);
                            setAutoScroll(true);
                            setTimeout(() => centerActiveWord('smooth', true), 40);
                            if (word.misspeakId) {
                              const found = lecture.misspeaks.find((m) => m.id === word.misspeakId);
                              if (found) onSelectMisspeak(found);
                            }
                          }}
                          className={`inline-block mr-1 my-0.5 px-1 py-0.5 rounded cursor-pointer transition-all duration-100 ${
                            isCurrentlyPlaying
                              ? 'bg-indigo-600 text-white font-bold shadow-xs scale-105 ring-2 ring-indigo-300'
                              : isMisspeak
                              ? 'bg-amber-100 text-amber-900 border-b-2 border-amber-500 font-medium hover:bg-amber-200'
                              : isKey
                              ? 'text-indigo-700 font-semibold underline decoration-indigo-300 underline-offset-4 hover:bg-indigo-50'
                              : isSearchHit
                              ? 'bg-amber-200 text-amber-950 font-bold ring-1 ring-amber-400'
                              : 'text-slate-800 hover:bg-slate-200/70'
                          }`}
                          title={`[${formatMs(word.startMs)}] • Click to Jump`}
                        >
                          {word.text}

                          {isMisspeak && (
                            <span className="inline-block w-1.5 h-1.5 ml-0.5 -mt-2 rounded-full bg-amber-500 animate-ping" />
                          )}
                        </span>

                        {/* Inline Note Tag Indicator */}
                        {noteNearWord && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onWordClick(noteNearWord.timestampMs);
                              setPrefillTimestampMs(noteNearWord.timestampMs);
                            }}
                            className="inline-flex items-center mr-1 px-1 py-0.2 rounded-md bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[9px] font-bold border border-indigo-200 cursor-pointer align-top -mt-1"
                            title={`Note @ ${noteNearWord.timeFormatted}: "${noteNearWord.text}"`}
                          >
                            📝 <span className="hidden sm:inline ml-0.5 font-mono">{noteNearWord.timeFormatted}</span>
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>

                {/* Misspeak alerts in left stream */}
                {lecture.misspeaks.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Misspeak Alerts ({lecture.misspeaks.length})</span>
                    </div>

                    {lecture.misspeaks.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onWordClick(m.timestampMs);
                          onSelectMisspeak(m);
                        }}
                        className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 hover:border-amber-300 transition-all cursor-pointer text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded font-mono bg-amber-100 text-amber-900 text-[10px] font-bold">
                            {m.timeFormatted}
                          </span>
                          <span className="text-[10px] text-indigo-600 font-semibold">Jump Audio →</span>
                        </div>
                        <div className="mt-1 text-slate-700">
                          <span className="text-slate-500">Spoken: </span>
                          <span className="italic font-medium">"{m.spokenQuote}"</span>
                        </div>
                        <div className="mt-1 text-emerald-800 font-medium text-[11px]">
                          ✓ Truth: {m.correctFact}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Quick Notes Component */}
            <div className="w-full md:col-span-5 flex flex-col h-auto min-h-[440px] md:min-h-0 md:h-full overflow-hidden shrink-0 md:shrink pb-3 md:pb-0">
              <QuickNotes
                lectureId={lecture.id}
                lectureTitle={lecture.title}
                currentMs={currentMs}
                onSeek={onWordClick}
                prefillTimestampMs={prefillTimestampMs}
                onClearPrefill={() => setPrefillTimestampMs(null)}
                onNotesUpdated={(notes) => setQuickNotes(notes)}
                className="h-full min-h-0"
              />
            </div>
          </div>
        )}

        {/* VIEW 2: Full Transcript View */}
        {viewMode === 'transcript' && (
          <div 
            ref={fullScrollRef}
            onWheel={handleUserManualScroll}
            onTouchMove={handleUserManualScroll}
            className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4 leading-relaxed font-sans text-slate-800 relative scroll-smooth"
          >
            {/* Floating Re-center Pill when auto-scroll is temporarily paused by manual scrolling */}
            {!autoScroll && (
              <div className="sticky top-2 z-20 flex justify-center pointer-events-none">
                <button
                  type="button"
                  onClick={() => {
                    setAutoScroll(true);
                    setTimeout(() => centerActiveWord('smooth', true), 40);
                  }}
                  className="pointer-events-auto flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold shadow-md shadow-indigo-300 transition-all cursor-pointer animate-in fade-in"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>Re-center Current Word</span>
                </button>
              </div>
            )}

            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-sm sm:text-base leading-loose select-text">
              {lecture.words.map((word, idx) => {
                const isCurrentlyPlaying = idx === currentWordIndex;
                const isSearchHit = matchesSearch(word.text);
                const isMisspeak = Boolean(word.isFlaggedMisspeak);
                const isKey = Boolean(word.isKeyTerm);
                const noteNearWord = findNoteNearWord(word.startMs, word.endMs);

                return (
                  <span key={word.id} className="inline-block relative">
                    <span
                      ref={isCurrentlyPlaying ? activeWordRef : undefined}
                      onClick={() => {
                        onWordClick(word.startMs);
                        setSelectedWord(word);
                        setAutoScroll(true);
                        setTimeout(() => centerActiveWord('smooth', true), 40);
                        if (word.misspeakId) {
                          const found = lecture.misspeaks.find((m) => m.id === word.misspeakId);
                          if (found) onSelectMisspeak(found);
                        }
                      }}
                      className={`inline-block mr-1.5 my-0.5 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-100 ${
                        isCurrentlyPlaying
                          ? 'bg-indigo-600 text-white font-bold shadow-xs scale-105 ring-2 ring-indigo-300'
                          : isMisspeak
                          ? 'bg-amber-100 text-amber-900 border-b-2 border-amber-500 font-medium hover:bg-amber-200'
                          : isKey
                          ? 'text-indigo-700 font-semibold underline decoration-indigo-300 underline-offset-4 hover:bg-indigo-50'
                          : isSearchHit
                          ? 'bg-amber-200 text-amber-950 font-bold ring-1 ring-amber-400'
                          : 'text-slate-800 hover:bg-slate-200/70'
                      }`}
                      title={`[${formatMs(word.startMs)}] Confidence: ${(word.confidence * 100).toFixed(0)}% • Click to Jump`}
                    >
                      {word.text}

                      {isMisspeak && (
                        <span className="inline-block w-1.5 h-1.5 ml-0.5 -mt-2 rounded-full bg-amber-500 animate-ping" />
                      )}
                    </span>

                    {/* Inline Note Tag Indicator */}
                    {noteNearWord && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWordClick(noteNearWord.timestampMs);
                          setPrefillTimestampMs(noteNearWord.timestampMs);
                          setViewMode('split');
                        }}
                        className="inline-flex items-center mr-1 px-1.5 py-0.2 rounded-md bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[10px] font-bold border border-indigo-200 cursor-pointer align-top -mt-1"
                        title={`Note @ ${noteNearWord.timeFormatted}: "${noteNearWord.text}"`}
                      >
                        📝 <span className="ml-0.5 font-mono">{noteNearWord.timeFormatted}</span>
                      </button>
                    )}
                  </span>
                );
              })}
            </div>

            {/* Fact-check misspeaks */}
            {lecture.misspeaks.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dual-Layer Fact Check: Misspeaks Detected in Lecture</span>
                </div>

                {lecture.misspeaks.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onWordClick(m.timestampMs);
                      onSelectMisspeak(m);
                    }}
                    className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 hover:border-amber-400 transition-all cursor-pointer text-xs group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md font-mono bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200">
                          {m.timeFormatted}
                        </span>
                        <span className="text-slate-600">Lecturer stated:</span>
                        <span className="text-amber-950 font-semibold italic">"{m.spokenQuote}"</span>
                      </div>
                      <button 
                        type="button"
                        className="shrink-0 flex items-center text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold cursor-pointer"
                      >
                        <span>Jump Audio</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="mt-2 text-slate-800 bg-white p-3 rounded-lg border border-emerald-200 flex items-start space-x-2 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-emerald-800">Verified Syllabus Truth:</div>
                        <div className="text-slate-700 text-xs mt-0.5 leading-relaxed">{m.correctFact}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3 text-indigo-600" />
                          <span>{m.citation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Dedicated Full Quick Notes View */}
        {viewMode === 'notes' && (
          <div className="h-full">
            <QuickNotes
              lectureId={lecture.id}
              lectureTitle={lecture.title}
              currentMs={currentMs}
              onSeek={onWordClick}
              prefillTimestampMs={prefillTimestampMs}
              onClearPrefill={() => setPrefillTimestampMs(null)}
              onNotesUpdated={(notes) => setQuickNotes(notes)}
              className="h-full"
            />
          </div>
        )}
      </div>

      {/* 3. Footer Word Inspector Bar */}
      {selectedWord && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs bg-slate-50 p-2.5 sm:p-3 rounded-xl">
          <div className="flex items-center space-x-2 flex-wrap">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-600">Selected Token:</span>
            <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
              "{selectedWord.text}"
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              @{formatMs(selectedWord.startMs)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setPrefillTimestampMs(selectedWord.startMs);
                if (viewMode === 'transcript') setViewMode('split');
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-2xs min-h-[34px] transition-colors"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Add Note @ {formatMs(selectedWord.startMs)}</span>
            </button>

            <button
              type="button"
              onClick={() => onWordClick(selectedWord.startMs)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold cursor-pointer min-h-[34px] transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>

            <button
              type="button"
              onClick={() => onAskSocraticAboutWord(selectedWord.text)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold cursor-pointer shadow-2xs min-h-[34px] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask Socratic Tutor</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Radio, 
  AlertTriangle, 
  Bookmark, 
  BookmarkCheck, 
  Repeat, 
  Sliders, 
  Plus, 
  X, 
  Check, 
  ChevronRight,
  Clock,
  Zap,
  Gauge
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { LectureSession, AudioBookmark, MisspeakAlert } from '../types';

interface AudioScrubberPlayerProps {
  lecture: LectureSession;
  currentMs: number;
  isPlaying: boolean;
  onSeek: (ms: number) => void;
  onTogglePlay: () => void;
  onSelectMisspeak?: (misspeak: MisspeakAlert) => void;
}

export const AudioScrubberPlayer: React.FC<AudioScrubberPlayerProps> = ({
  lecture,
  currentMs,
  isPlaying,
  onSeek,
  onTogglePlay,
  onSelectMisspeak,
}) => {
  // Playback speeds required: 0.5x, 1.0x, 1.5x, 2.0x
  const SPEED_OPTIONS = [0.5, 1.0, 1.5, 2.0];
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [activeSheet, setActiveSheet] = useState<'none' | 'speed' | 'loop' | 'bookmarks' | 'settings'>('none');

  // A-B Loop state
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const isLoopActive = loopA !== null && loopB !== null && loopB > loopA;

  // Bookmarks state (persistent per lecture)
  const [bookmarks, setBookmarks] = useState<AudioBookmark[]>(() => {
    try {
      const saved = localStorage.getItem(`scribo_bookmarks_${lecture.id}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Initialize with lecture misspeaks as default bookmarks
    return lecture.misspeaks.map((m) => ({
      id: `bm-${m.id}`,
      timestampMs: m.timestampMs,
      timeFormatted: m.timeFormatted,
      note: `Correction: ${m.spokenQuote.slice(0, 30)}...`,
      createdAt: 'Auto-flagged',
    }));
  });

  const [newNoteText, setNewNoteText] = useState('');
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // Scrubber drag / touch interaction state
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragPreviewMs, setDragPreviewMs] = useState<number | null>(null);

  const durationMs = lecture.durationMs || 72000;
  const activeTimeMs = isDragging && dragPreviewMs !== null ? dragPreviewMs : currentMs;
  const progressPercent = Math.min(100, Math.max(0, (activeTimeMs / durationMs) * 100));

  // Sync engine rate on mount or change
  useEffect(() => {
    audioEngine.setPlaybackRate(playbackRate);
  }, [playbackRate]);

  // Sync loop range with audioEngine
  useEffect(() => {
    if (isLoopActive && loopA !== null && loopB !== null) {
      audioEngine.setLoopRange({ startMs: loopA, endMs: loopB });
    } else {
      audioEngine.setLoopRange(null);
    }
  }, [isLoopActive, loopA, loopB]);

  // Save bookmarks
  useEffect(() => {
    try {
      localStorage.setItem(`scribo_bookmarks_${lecture.id}`, JSON.stringify(bookmarks));
    } catch {
      // ignore
    }
  }, [bookmarks, lecture.id]);

  const formatTime = (ms: number, showMillis: boolean = true) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const millis = Math.floor((Math.max(0, ms) % 1000) / 100);
    if (showMillis) {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateMsFromEvent = useCallback((clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const touchX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, touchX / rect.width));
    return ratio * durationMs;
  }, [durationMs]);

  // Touch handlers for mobile smooth dragging
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const ms = calculateMsFromEvent(e.touches[0].clientX);
    setDragPreviewMs(ms);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const ms = calculateMsFromEvent(e.touches[0].clientX);
    setDragPreviewMs(ms);
  };

  const handleTouchEnd = () => {
    if (isDragging && dragPreviewMs !== null) {
      onSeek(dragPreviewMs);
    }
    setIsDragging(false);
    setDragPreviewMs(null);
  };

  // Mouse handlers for desktop/testing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const ms = calculateMsFromEvent(e.clientX);
    setDragPreviewMs(ms);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const ms = calculateMsFromEvent(e.clientX);
    setDragPreviewMs(ms);
  };

  const handleMouseUp = () => {
    if (isDragging && dragPreviewMs !== null) {
      onSeek(dragPreviewMs);
    }
    setIsDragging(false);
    setDragPreviewMs(null);
  };

  // Speed selection handler
  const selectSpeed = (speed: number) => {
    setPlaybackRate(speed);
    audioEngine.setPlaybackRate(speed);
  };

  // Skip relative
  const skip = (deltaMs: number) => {
    const nextMs = Math.max(0, Math.min(durationMs, currentMs + deltaMs));
    onSeek(nextMs);
  };

  // A-B Loop actions
  const handleSetLoopA = () => {
    setLoopA(currentMs);
    if (loopB !== null && loopB <= currentMs) {
      setLoopB(null);
    }
  };

  const handleSetLoopB = () => {
    if (loopA === null) {
      setLoopA(Math.max(0, currentMs - 5000));
    }
    setLoopB(currentMs);
  };

  const handleClearLoop = () => {
    setLoopA(null);
    setLoopB(null);
    audioEngine.setLoopRange(null);
  };

  // Bookmarking action
  const handleAddBookmark = () => {
    const newBm: AudioBookmark = {
      id: `bm-${Date.now()}`,
      timestampMs: currentMs,
      timeFormatted: formatTime(currentMs, false),
      note: newNoteText.trim() || `Pinned Study Moment @ ${formatTime(currentMs, false)}`,
      createdAt: 'Just now',
    };
    setBookmarks([newBm, ...bookmarks]);
    setNewNoteText('');
    setShowAddNoteModal(false);
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  // Volume change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      audioEngine.setMuted(false);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setMuted(nextMute);
  };

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden select-none">
      {/* 1. Mobile Status Bar & Audio Stream Badge */}
      <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] font-bold tracking-tight">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-indigo-600 animate-pulse' : 'bg-slate-400'}`} />
            <span>NPU SYNC ENGINE</span>
          </div>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hidden xs:inline-flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-emerald-600 animate-spin" />
            140ms
          </span>
        </div>

        {/* Current Time Display (Mobile emphasized) */}
        <div className="flex items-center space-x-1 font-mono text-xs">
          <span className="font-bold text-indigo-700 text-sm tracking-tight">
            {formatTime(activeTimeMs)}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-medium">
            {formatTime(durationMs, false)}
          </span>
        </div>
      </div>

      {/* 2. Touch-Optimized Waveform Scrubber with Live Timestamp Tooltip */}
      <div className="px-4 pt-3 pb-2">
        <div
          ref={progressBarRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative h-14 w-full bg-slate-100/90 rounded-2xl p-1.5 flex items-center gap-0.5 cursor-pointer overflow-visible border border-slate-200 active:border-indigo-300 transition-colors touch-none"
        >
          {/* Floating Drag Timestamp Indicator Bubble (Follows finger/mouse clamped safely) */}
          {isDragging && dragPreviewMs !== null && (
            <div 
              className="absolute -top-9 transform -translate-x-1/2 z-30 pointer-events-none transition-all duration-75"
              style={{ left: `${Math.max(8, Math.min(92, progressPercent))}%` }}
            >
              <div className="bg-slate-900 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1 whitespace-nowrap">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>{formatTime(dragPreviewMs)}</span>
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
            </div>
          )}

          {/* A-B Loop Visual Highlight Range on the Bar */}
          {isLoopActive && loopA !== null && loopB !== null && (
            <div
              className="absolute top-0 bottom-0 bg-amber-400/25 border-x-2 border-amber-500 z-10 pointer-events-none rounded-sm"
              style={{
                left: `${(loopA / durationMs) * 100}%`,
                width: `${((loopB - loopA) / durationMs) * 100}%`,
              }}
            >
              <span className="absolute -top-3 left-0 text-[9px] font-bold bg-amber-500 text-white px-1 rounded-xs">A</span>
              <span className="absolute -top-3 right-0 text-[9px] font-bold bg-amber-500 text-white px-1 rounded-xs">B</span>
            </div>
          )}

          {/* 64 Waveform Frequency Bars */}
          {Array.from({ length: 64 }).map((_, i) => {
            const barFraction = (i / 64) * 100;
            const isPassed = barFraction <= progressPercent;
            // Harmonic wave pattern with voice amplitude representation
            const waveHeight = Math.sin(i * 0.38) * 32 + 52 + (i % 4 === 0 ? 16 : -8);

            return (
              <div key={i} className="flex-1 flex items-center justify-center h-full pointer-events-none">
                <div
                  className={`w-full rounded-full transition-all duration-75 ${
                    isPassed
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-2xs'
                      : 'bg-slate-300'
                  }`}
                  style={{ height: `${Math.max(18, Math.min(96, waveHeight))}%` }}
                />
              </div>
            );
          })}

          {/* Misspeak Warning Marker Pins on Scrubber */}
          {lecture.misspeaks.map((m) => {
            const markPct = (m.timestampMs / durationMs) * 100;
            return (
              <button
                key={m.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(m.timestampMs);
                  if (onSelectMisspeak) onSelectMisspeak(m);
                }}
                className="absolute top-0 bottom-0 w-1 bg-amber-500 z-20 cursor-pointer group flex items-center justify-center -ml-0.5"
                style={{ left: `${markPct}%` }}
                title={`Misspeak at ${m.timeFormatted}: ${m.spokenQuote}`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-125 transition-transform -top-1.5 absolute">
                  <AlertTriangle className="w-2 h-2" />
                </div>
              </button>
            );
          })}

          {/* Playhead thumb line & pill */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-indigo-600 z-20 pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="w-3.5 h-3.5 -ml-1.5 -top-1.5 absolute bg-white rounded-full border-2 border-indigo-600 shadow-md" />
          </div>
        </div>

        {/* Scrubber helper hint for mobile users */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1 font-mono">
          <span>00:00</span>
          <span className="text-slate-500 font-sans flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Drag or tap to scrub</span>
          </span>
          <span>{formatTime(durationMs, false)}</span>
        </div>
      </div>

      {/* 3. Primary Mobile Controls: Jumps, Play/Pause, and Speed Chips */}
      <div className="px-4 py-2 flex flex-col gap-3">
        {/* Main transport row with large 44px+ touch targets */}
        <div className="flex items-center justify-between gap-2">
          {/* Rewind 10s */}
          <button
            type="button"
            onClick={() => skip(-10000)}
            className="flex-1 min-h-[46px] flex items-center justify-center gap-1 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
            title="Rewind 10 seconds"
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="font-mono text-[11px] font-bold">-10s</span>
          </button>

          {/* Rewind 5s */}
          <button
            type="button"
            onClick={() => skip(-5000)}
            className="w-11 min-h-[46px] flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200 transition-all cursor-pointer"
            title="Rewind 5 seconds"
            aria-label="Rewind 5 seconds"
          >
            <span className="font-mono text-[11px] font-bold">-5s</span>
          </button>

          {/* BIG PLAY / PAUSE BUTTON (Centerpiece 54px mobile touch target) */}
          <button
            type="button"
            onClick={onTogglePlay}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-all transform active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 ring-4 ring-indigo-100'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
            }`}
            title={isPlaying ? 'Pause lecture audio' : 'Play lecture audio'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Forward 5s */}
          <button
            type="button"
            onClick={() => skip(5000)}
            className="w-11 min-h-[46px] flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200 transition-all cursor-pointer"
            title="Forward 5 seconds"
            aria-label="Forward 5 seconds"
          >
            <span className="font-mono text-[11px] font-bold">+5s</span>
          </button>

          {/* Forward 10s */}
          <button
            type="button"
            onClick={() => skip(10000)}
            className="flex-1 min-h-[46px] flex items-center justify-center gap-1 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
            title="Forward 10 seconds"
            aria-label="Forward 10 seconds"
          >
            <span className="font-mono text-[11px] font-bold">+10s</span>
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* 4. SPEED CONTROLS: Explicit 0.5x, 1.0x, 1.5x, 2.0x Mobile Selector Bar */}
        <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 pl-1.5 text-slate-600 text-xs font-semibold shrink-0">
            <Gauge className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] uppercase tracking-wider font-bold">Speed:</span>
          </div>

          <div className="flex items-center gap-1 flex-1 justify-end">
            {SPEED_OPTIONS.map((spd) => {
              const isSelected = playbackRate === spd;
              return (
                <button
                  key={spd}
                  type="button"
                  onClick={() => selectSpeed(spd)}
                  className={`flex-1 min-h-[38px] px-2 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs scale-100'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 active:scale-95'
                  }`}
                  aria-label={`Set speed to ${spd}x`}
                >
                  {spd.toFixed(1)}x
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Secondary Feature Toolbar: A-B Loop, Bookmarks, Volume */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          {/* A-B Loop Toggle Button */}
          <button
            type="button"
            onClick={() => setActiveSheet(activeSheet === 'loop' ? 'none' : 'loop')}
            className={`flex-1 min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
              isLoopActive
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : activeSheet === 'loop'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>{isLoopActive ? 'Loop Active' : 'A-B Loop'}</span>
          </button>

          {/* Bookmarks Toggle Button */}
          <button
            type="button"
            onClick={() => setActiveSheet(activeSheet === 'bookmarks' ? 'none' : 'bookmarks')}
            className={`flex-1 min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
              bookmarks.length > 0 && activeSheet !== 'bookmarks'
                ? 'bg-indigo-50/70 border-indigo-200 text-indigo-700'
                : activeSheet === 'bookmarks'
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Pins ({bookmarks.length})</span>
          </button>

          {/* Audio Equalizer & Volume Toggle Button */}
          <button
            type="button"
            onClick={() => setActiveSheet(activeSheet === 'settings' ? 'none' : 'settings')}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
              isMuted
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : activeSheet === 'settings'
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Volume and audio settings"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="font-mono text-[11px]">{isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}</span>
          </button>
        </div>

        {/* 6. Expandable Feature Sheets */}
        
        {/* A-B Loop Control Drawer */}
        {activeSheet === 'loop' && (
          <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-amber-700" />
                <span>Repeat Difficult Lecture Segment (A-B Loop)</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveSheet('none')}
                className="text-amber-800 hover:text-amber-950 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-amber-800/90 mb-2.5 leading-snug">
              Set start pin [A] and end pin [B] to continuously loop key proofs or exam points without manual rewinds.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleSetLoopA}
                className="py-2 px-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 active:scale-95 transition-all cursor-pointer min-h-[40px] flex items-center justify-center gap-1"
              >
                <span>Set [A]:</span>
                <span className="font-mono text-[11px] text-indigo-700">{loopA !== null ? formatTime(loopA, false) : '--:--'}</span>
              </button>

              <button
                type="button"
                onClick={handleSetLoopB}
                className="py-2 px-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 active:scale-95 transition-all cursor-pointer min-h-[40px] flex items-center justify-center gap-1"
              >
                <span>Set [B]:</span>
                <span className="font-mono text-[11px] text-indigo-700">{loopB !== null ? formatTime(loopB, false) : '--:--'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearLoop}
                disabled={loopA === null && loopB === null}
                className="py-2 px-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-200 disabled:opacity-50 transition-all cursor-pointer min-h-[40px]"
              >
                Clear Loop
              </button>
            </div>
          </div>
        )}

        {/* Bookmarks / Pins Drawer */}
        {activeSheet === 'bookmarks' && (
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 animate-in fade-in zoom-in-95 space-y-2.5 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">Audio Pins & Highlights</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer hover:bg-indigo-700"
                >
                  <Plus className="w-3 h-3" />
                  <span>Pin Current ({formatTime(currentMs, false)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSheet('none')}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Note Input Box */}
            {showAddNoteModal && (
              <div className="bg-white p-2.5 rounded-xl border border-indigo-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span>Add note at {formatTime(currentMs, false)}</span>
                  <button onClick={() => setShowAddNoteModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Key definition of eigenvalues, Exam question alert..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBookmark()}
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddBookmark}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  Save Pin
                </button>
              </div>
            )}

            {/* Bookmarks List */}
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {bookmarks.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No bookmarks yet. Tap "+ Pin Current" to mark important moments.
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => onSeek(bm.timestampMs)}
                      className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer group"
                    >
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {bm.timeFormatted}
                      </span>
                      <span className="text-xs text-slate-700 truncate font-medium">
                        {bm.note}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveBookmark(bm.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Remove bookmark"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Volume & Equalizer Settings Drawer */}
        {activeSheet === 'settings' && (
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 animate-in fade-in zoom-in-95 space-y-3 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Audio Engine & Volume Controls</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveSheet('none')}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lecture Playback Volume</span>
                </span>
                <span className="font-mono text-indigo-700 font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                    isMuted ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Pitch & Fidelity Indicator */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Pitch-Preserving Audio Time-Stretching</span>
              </span>
              <span className="font-mono text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                ENABLED
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

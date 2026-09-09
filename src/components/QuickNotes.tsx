import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileEdit, 
  Clock, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Copy, 
  Plus, 
  Tag, 
  Lock, 
  Search, 
  Download, 
  Sparkles, 
  Bookmark, 
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { QuickNote } from '../types';
import { getQuickNotes, saveQuickNotes } from '../utils/persistence';

interface QuickNotesProps {
  lectureId: string;
  lectureTitle: string;
  currentMs: number;
  onSeek: (ms: number) => void;
  prefillTimestampMs?: number | null;
  onClearPrefill?: () => void;
  onNotesUpdated?: (notes: QuickNote[]) => void;
  className?: string;
  isCompact?: boolean;
}

const CATEGORY_CONFIG = {
  keypoint: {
    label: 'Key Point',
    icon: '📌',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-600',
  },
  exam: {
    label: 'Exam Alert',
    icon: '🎯',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-600',
  },
  question: {
    label: 'Question / Doubt',
    icon: '❓',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-600',
  },
  general: {
    label: 'Observation',
    icon: '💡',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-600',
  },
} as const;

export const QuickNotes: React.FC<QuickNotesProps> = ({
  lectureId,
  lectureTitle,
  currentMs,
  onSeek,
  prefillTimestampMs,
  onClearPrefill,
  onNotesUpdated,
  className = '',
  isCompact = false,
}) => {
  // Initial notes loader with seed defaults
  const getInitialNotes = (): QuickNote[] => {
    const saved = getQuickNotes(lectureId);
    if (saved.length > 0) {
      return saved;
    }

    // Default seed note tailored to lecture
    if (lectureId === 'lec-cs229-01') {
      const seeds: QuickNote[] = [
        {
          id: 'note-seed-1',
          lectureId,
          timestampMs: 9100,
          timeFormatted: '00:09',
          text: 'Exam Alert: Professor emphasized positive semi-definite definition. Review Mercer theorem conditions for Quiz 1!',
          createdAt: 'Auto-synced',
          category: 'exam',
        },
        {
          id: 'note-seed-2',
          lectureId,
          timestampMs: 25400,
          timeFormatted: '00:25',
          text: 'Key distinction: Kernel trick replaces feature map φ(x) dot product with direct kernel computation K(x, z).',
          createdAt: 'Auto-synced',
          category: 'keypoint',
        },
      ];
      saveQuickNotes(lectureId, seeds);
      return seeds;
    } else if (lectureId === 'lec-bio101-02') {
      const seeds: QuickNote[] = [
        {
          id: 'note-seed-bio-1',
          lectureId,
          timestampMs: 14200,
          timeFormatted: '00:14',
          text: 'Crucial fact check: Glycolysis occurs in CYTOSOL, not mitochondrial matrix. Matrix is for Krebs cycle!',
          createdAt: 'Auto-synced',
          category: 'keypoint',
        },
      ];
      saveQuickNotes(lectureId, seeds);
      return seeds;
    }

    return [];
  };

  const [notes, setNotes] = useState<QuickNote[]>(getInitialNotes);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof CATEGORY_CONFIG>('keypoint');
  const [captureMs, setCaptureMs] = useState<number>(currentMs);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | keyof typeof CATEGORY_CONFIG>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync capture timestamp if prefilled from external word selection
  useEffect(() => {
    if (prefillTimestampMs !== undefined && prefillTimestampMs !== null) {
      setCaptureMs(prefillTimestampMs);
      textareaRef.current?.focus();
    }
  }, [prefillTimestampMs]);

  // Sync capture timestamp when lecture changes
  useEffect(() => {
    setNotes(getInitialNotes());
    setCaptureMs(currentMs);
  }, [lectureId]);

  // Listen for external note additions (e.g. from Auto-Summary or Transcript)
  useEffect(() => {
    const handleExternalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ lectureId: string; notes: QuickNote[] }>;
      if (customEvent.detail && customEvent.detail.lectureId === lectureId) {
        setNotes(customEvent.detail.notes);
      }
    };
    window.addEventListener('scribo-notes-persisted', handleExternalUpdate);
    return () => {
      window.removeEventListener('scribo-notes-persisted', handleExternalUpdate);
    };
  }, [lectureId]);

  // Persist notes & notify parent
  useEffect(() => {
    saveQuickNotes(lectureId, notes);
    if (onNotesUpdated) {
      onNotesUpdated(notes);
    }
  }, [notes, lectureId]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSnapToCurrent = () => {
    setCaptureMs(currentMs);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const timeMs = captureMs;
    const newNote: QuickNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lectureId,
      timestampMs: timeMs,
      timeFormatted: formatTime(timeMs),
      text: newNoteText.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: selectedCategory,
    };

    // Keep notes sorted by timestamp
    const updated = [...notes, newNote].sort((a, b) => a.timestampMs - b.timestampMs);
    setNotes(updated);
    setNewNoteText('');
    if (onClearPrefill) onClearPrefill();
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleStartEdit = (note: QuickNote) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, text: editingText.trim() } : n))
    );
    setEditingNoteId(null);
    setEditingText('');
  };

  const handleCopyAll = async () => {
    if (notes.length === 0) return;
    const formatted = notes
      .map((n) => `[${n.timeFormatted}] (${CATEGORY_CONFIG[n.category || 'general'].label}) ${n.text}`)
      .join('\n\n');

    const fullExport = `### Private Quick Notes: ${lectureTitle}\n\n${formatted}`;

    try {
      await navigator.clipboard.writeText(fullExport);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleClearAll = () => {
    setNotes([]);
    setShowClearConfirm(false);
  };

  // Filtered notes list
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch = searchFilter
        ? n.text.toLowerCase().includes(searchFilter.toLowerCase()) ||
          n.timeFormatted.includes(searchFilter)
        : true;
      const matchesCategory =
        activeCategoryFilter === 'all' ? true : n.category === activeCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [notes, searchFilter, activeCategoryFilter]);

  return (
    <div className={`flex flex-col h-full min-h-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs ${className}`}>
      {/* 1. Header Bar with Privacy Assurance */}
      <div className="bg-slate-50/90 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <FileEdit className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                Quick Notes & Annotations
              </h3>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {notes.length}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium">
              <Lock className="w-2.5 h-2.5 text-emerald-600" />
              <span>Private & saved on-device</span>
            </div>
          </div>
        </div>

        {/* Header Actions: Copy All, Clear */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={notes.length === 0}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
              copySuccess
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 disabled:opacity-40'
            }`}
            title="Copy all notes as Markdown formatted list"
          >
            {copySuccess ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span className="hidden xs:inline">{copySuccess ? 'Copied' : 'Copy All'}</span>
          </button>

          {notes.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 cursor-pointer transition-colors"
              title="Clear all notes for this lecture"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Clearing All Notes */}
      {showClearConfirm && (
        <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center space-x-2 text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Delete all {notes.length} private annotations for this lecture?</span>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] hover:bg-rose-700 cursor-pointer"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="px-2 py-1 bg-white text-slate-700 rounded-lg font-medium text-[11px] border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 2. New Note Creation Form */}
      <div className="p-3 bg-white border-b border-slate-100 space-y-2.5 shrink-0">
        {/* Active Timestamp & Category selector */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Timestamp Pill with Snap-to-Current Button */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200 text-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] font-bold text-slate-700">Timestamp:</span>
            <span className="font-mono font-bold text-indigo-700 px-1.5 py-0.2 rounded bg-indigo-50 border border-indigo-200 text-xs">
              {formatTime(captureMs)}
            </span>
            <button
              type="button"
              onClick={handleSnapToCurrent}
              className="ml-1 text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-0.5 cursor-pointer font-semibold underline decoration-dotted"
              title="Snap timestamp to current playback head"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Now ({formatTime(currentMs)})</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-1 overflow-x-auto py-0.5 max-w-full">
            {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((catKey) => {
              const cfg = CATEGORY_CONFIG[catKey];
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center space-x-1 shrink-0 ${
                    isSelected
                      ? `${cfg.badgeClass} ring-1 ring-indigo-400 shadow-2xs`
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={2}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleAddNote();
              }
            }}
            placeholder={`Jot down a thought, question, or exam clue for ${formatTime(captureMs)}... (Ctrl+Enter to save)`}
            className="w-full text-xs p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 resize-none transition-colors"
          />

          <div className="flex items-center justify-between mt-1 px-1">
            <span className="text-[10px] text-slate-400">
              Tip: Click any transcript token to anchor a note directly to it.
            </span>

            <button
              type="button"
              onClick={handleAddNote}
              disabled={!newNoteText.trim()}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar (if notes exist) */}
      {notes.length > 2 && (
        <div className="px-3 py-2 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
          {/* Quick filter input */}
          <div className="relative flex-1">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Filter notes..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-7 pr-2 py-1 text-[11px] rounded-lg bg-white border border-slate-200 focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1 shrink-0 text-[10px]">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All ({notes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('exam')}
              className={`px-1.5 py-0.5 rounded-md font-semibold cursor-pointer ${
                activeCategoryFilter === 'exam'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              🎯
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('keypoint')}
              className={`px-1.5 py-0.5 rounded-md font-semibold cursor-pointer ${
                activeCategoryFilter === 'keypoint'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              📌
            </button>
          </div>
        </div>
      )}

      {/* 4. Notes List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-6 px-4 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto">
              <Bookmark className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">No Quick Notes Yet</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              Jot down thoughts while listening to the lecture. Each note is saved privately and anchored to the exact millisecond.
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const cat = CATEGORY_CONFIG[note.category || 'general'];
            const isEditing = editingNoteId === note.id;

            return (
              <div
                key={note.id}
                className="pt-2 first:pt-0 group text-xs space-y-1.5"
              >
                {/* Note Header: Timestamp, Category, Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    {/* Timestamp Jump Button */}
                    <button
                      type="button"
                      onClick={() => onSeek(note.timestampMs)}
                      className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-mono text-[11px] font-bold border border-indigo-200 flex items-center gap-1 transition-colors cursor-pointer group/jump"
                      title="Jump audio to this note's timestamp"
                    >
                      <Volume2 className="w-3 h-3 group-hover/jump:animate-pulse" />
                      <span>{note.timeFormatted}</span>
                    </button>

                    {/* Category Tag */}
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-0.5 ${cat.badgeClass}`}>
                      <span>{cat.icon}</span>
                      <span className="hidden xs:inline">{cat.label}</span>
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {note.createdAt}
                    </span>
                  </div>

                  {/* Actions: Edit, Delete */}
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(note)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="Edit note text"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Cancel edit"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Note Content / Inline Edit Form */}
                {isEditing ? (
                  <div className="space-y-1.5 pl-1">
                    <textarea
                      rows={2}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-indigo-400 bg-indigo-50/30 focus:outline-none text-slate-800"
                    />
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        className="px-2 py-1 text-[11px] rounded bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(note.id)}
                        className="px-2.5 py-1 text-[11px] rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap pl-1 font-sans">
                    {note.text}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

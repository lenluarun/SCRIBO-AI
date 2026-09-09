import { QuickNote, PlaybackProgress, AssessmentProgress } from '../types';

const PLAYBACK_PREFIX = 'scribo_playback_';
const NOTES_PREFIX = 'scribo_quick_notes_';
const ASSESSMENT_PREFIX = 'scribo_assessment_';
const ACTIVE_LECTURE_KEY = 'scribo_last_active_lecture_id';

// Helper to check localStorage availability
function isStorageAvailable(): boolean {
  try {
    const testKey = '__scribo_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * PLAYBACK PROGRESS PERSISTENCE
 */
export function getPlaybackProgress(lectureId: string): PlaybackProgress | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(`${PLAYBACK_PREFIX}${lectureId}`);
    if (!raw) return null;
    return JSON.parse(raw) as PlaybackProgress;
  } catch (e) {
    console.warn('[Persistence] Error loading playback progress for', lectureId, e);
    return null;
  }
}

export function savePlaybackProgress(data: {
  lectureId: string;
  currentMs: number;
  durationMs: number;
  playbackRate?: number;
}): void {
  if (!isStorageAvailable() || !data.lectureId) return;
  try {
    const progress: PlaybackProgress = {
      lectureId: data.lectureId,
      currentMs: Math.max(0, Math.min(data.durationMs, Math.round(data.currentMs))),
      durationMs: data.durationMs,
      playbackRate: data.playbackRate || 1.0,
      lastUpdated: Date.now(),
      completed: data.currentMs >= data.durationMs - 1000,
    };
    localStorage.setItem(`${PLAYBACK_PREFIX}${data.lectureId}`, JSON.stringify(progress));
    
    // Dispatch local event for multi-component reactivity
    window.dispatchEvent(new CustomEvent('scribo-playback-persisted', { detail: progress }));
  } catch (e) {
    console.warn('[Persistence] Error saving playback progress', e);
  }
}

export function getLastActiveLectureId(): string | null {
  if (!isStorageAvailable()) return null;
  try {
    return localStorage.getItem(ACTIVE_LECTURE_KEY);
  } catch {
    return null;
  }
}

export function setLastActiveLectureId(lectureId: string): void {
  if (!isStorageAvailable() || !lectureId) return;
  try {
    localStorage.setItem(ACTIVE_LECTURE_KEY, lectureId);
  } catch (e) {
    console.warn('[Persistence] Error saving last active lecture', e);
  }
}

/**
 * QUICK NOTES PERSISTENCE
 */
export function getQuickNotes(lectureId: string): QuickNote[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(`${NOTES_PREFIX}${lectureId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[Persistence] Error loading quick notes for', lectureId, e);
    return [];
  }
}

export function saveQuickNotes(lectureId: string, notes: QuickNote[]): void {
  if (!isStorageAvailable() || !lectureId) return;
  try {
    localStorage.setItem(`${NOTES_PREFIX}${lectureId}`, JSON.stringify(notes));
    window.dispatchEvent(new CustomEvent('scribo-notes-persisted', { detail: { lectureId, notes } }));
  } catch (e) {
    console.warn('[Persistence] Error saving quick notes', e);
  }
}

export function addQuickNote(
  lectureId: string, 
  note: { text: string; timestampMs: number; category?: QuickNote['category']; timeFormatted?: string }
): QuickNote {
  const existing = getQuickNotes(lectureId);
  const timeFormatted = note.timeFormatted || formatMsToTime(note.timestampMs);
  const newNote: QuickNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    lectureId,
    timestampMs: Math.max(0, Math.round(note.timestampMs)),
    timeFormatted,
    text: note.text.trim(),
    createdAt: 'Just now',
    category: note.category || 'general',
  };

  const updated = [newNote, ...existing];
  saveQuickNotes(lectureId, updated);
  return newNote;
}

/**
 * ASSESSMENT PROGRESS PERSISTENCE
 */
export function getAssessmentProgress(lectureId: string): AssessmentProgress | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(`${ASSESSMENT_PREFIX}${lectureId}`);
    if (!raw) return null;
    return JSON.parse(raw) as AssessmentProgress;
  } catch (e) {
    console.warn('[Persistence] Error loading assessment progress for', lectureId, e);
    return null;
  }
}

export function saveAssessmentProgress(
  lectureId: string, 
  progressUpdate: Partial<AssessmentProgress>
): AssessmentProgress {
  const existing = getAssessmentProgress(lectureId) || {
    lectureId,
    selectedAnswers: {},
    lastUpdated: Date.now(),
  };

  const merged: AssessmentProgress = {
    ...existing,
    ...progressUpdate,
    lectureId,
    lastUpdated: Date.now(),
  };

  if (isStorageAvailable()) {
    try {
      localStorage.setItem(`${ASSESSMENT_PREFIX}${lectureId}`, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('scribo-assessment-persisted', { detail: merged }));
    } catch (e) {
      console.warn('[Persistence] Error saving assessment progress', e);
    }
  }

  return merged;
}

export function clearAssessmentProgress(lectureId: string): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(`${ASSESSMENT_PREFIX}${lectureId}`);
    window.dispatchEvent(new CustomEvent('scribo-assessment-cleared', { detail: { lectureId } }));
  } catch (e) {
    console.warn('[Persistence] Error clearing assessment progress', e);
  }
}

/**
 * STORAGE TELEMETRY & BACKUP / RESTORE
 */
export function getStorageAudit(): {
  isAvailable: boolean;
  totalNotes: number;
  totalAnsweredQuestions: number;
  savedLecturesCount: number;
  estimatedBytes: number;
  lastActiveLectureId: string | null;
} {
  if (!isStorageAvailable()) {
    return {
      isAvailable: false,
      totalNotes: 0,
      totalAnsweredQuestions: 0,
      savedLecturesCount: 0,
      estimatedBytes: 0,
      lastActiveLectureId: null,
    };
  }

  let totalNotes = 0;
  let totalAnsweredQuestions = 0;
  let savedLecturesCount = 0;
  let estimatedBytes = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const val = localStorage.getItem(key) || '';
      estimatedBytes += (key.length + val.length) * 2; // UTF-16 bytes

      if (key.startsWith(NOTES_PREFIX)) {
        try {
          const notes = JSON.parse(val);
          if (Array.isArray(notes)) totalNotes += notes.length;
        } catch { /* ignore */ }
      } else if (key.startsWith(ASSESSMENT_PREFIX)) {
        try {
          const assess = JSON.parse(val);
          if (assess?.selectedAnswers) {
            totalAnsweredQuestions += Object.keys(assess.selectedAnswers).length;
          }
        } catch { /* ignore */ }
      } else if (key.startsWith(PLAYBACK_PREFIX)) {
        savedLecturesCount++;
      }
    }
  } catch (e) {
    console.warn('[Persistence] Error computing storage audit', e);
  }

  return {
    isAvailable: true,
    totalNotes,
    totalAnsweredQuestions,
    savedLecturesCount,
    estimatedBytes,
    lastActiveLectureId: getLastActiveLectureId(),
  };
}

export function exportStudentDataArchive(): string {
  if (!isStorageAvailable()) return JSON.stringify({ error: 'Storage not available' });

  const exportPayload: Record<string, any> = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: 'Scribo AI',
    data: {},
  };

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith(PLAYBACK_PREFIX) ||
        key.startsWith(NOTES_PREFIX) ||
        key.startsWith(ASSESSMENT_PREFIX) ||
        key === ACTIVE_LECTURE_KEY
      ) {
        try {
          exportPayload.data[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          exportPayload.data[key] = localStorage.getItem(key);
        }
      }
    }
  } catch (e) {
    console.error('Export error:', e);
  }

  return JSON.stringify(exportPayload, null, 2);
}

function formatMsToTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  Award, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  ListChecks,
  BookmarkPlus,
  Copy,
  Check,
  Clock,
  Zap,
  Target,
  ChevronRight,
  BookOpen,
  Volume2,
  Database,
  RotateCcw,
  Save
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LectureSession, QuizQuestion, MisspeakAlert, LectureSection, ConceptBullet, SectionSummary } from '../types';
import { getAssessmentProgress, saveAssessmentProgress, addQuickNote } from '../utils/persistence';

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'During backpropagation through a standard ReLU activation layer, what is the exact local gradient d(ReLU(x))/dx for negative input activations (x < 0)?',
    options: [
      'It is strictly 0, which can lead to the "dying ReLU" phenomenon if neurons never activate.',
      'It is strictly 1, allowing gradients to pass unimpeded.',
      'It equals -1, reversing the direction of optimization.',
      'It is dynamically scaled by the learning rate parameter.'
    ],
    correctIndex: 0,
    explanation: 'For x < 0, ReLU(x) = 0, so its derivative is identically 0. If inputs stay negative, gradient propagation through that unit ceases entirely.',
    syllabusReference: 'CS-482 Unit 3.1: Activation Function Derivatives'
  },
  {
    id: 'q2',
    question: 'How do Residual Skip Connections (ResNets) fundamentally resolve the vanishing gradient issue across 50+ layer architectures?',
    options: [
      'They compress weights using singular value decomposition (SVD).',
      'They introduce an identity pathway F(x) + x, guaranteeing a +1 gradient additive term directly to shallow layers.',
      'They replace matrix multiplications with Fast Fourier Transforms.',
      'They eliminate the need for backpropagation entirely.'
    ],
    correctIndex: 1,
    explanation: 'Because d(F(x) + x)/dx = dF/dx + 1, the "+1" term ensures that even if dF/dx vanishes, an uninterrupted gradient of 1 still reaches earlier layers.',
    syllabusReference: 'CS-482 Unit 3.6: Residual Superhighways'
  },
  {
    id: 'q3',
    question: 'What is the correct formulation of Batch Normalization during the training forward pass for a mini-batch B?',
    options: [
      'Divide raw activations by the standard deviation without zero-centering.',
      'Subtract the mini-batch mean μ_B and divide by √(σ_B² + ε), followed by learnable scale γ and shift β.',
      'Compute moving average exponential decay across all historical epochs only.',
      'Clip gradient norms to the unit sphere.'
    ],
    correctIndex: 1,
    explanation: 'Batch Norm explicitly standardizes mini-batch distributions by subtracting mean μ_B, dividing by √(σ_B² + ε), then applying learnable parameters γ·x̂ + β.',
    syllabusReference: 'CS-482 Unit 3.4: Internal Covariate Shift Mitigation'
  },
  {
    id: 'q4',
    question: 'Why does the chain rule for matrix backpropagation require transposing activation vectors when calculating ∂L/∂W?',
    options: [
      'To invert the loss function surface.',
      'To satisfy dimensional consistency between the error gradient vector δ and preceding layer inputs (a^(l-1))^T.',
      'To convert floating-point tensors into sparse integers.',
      'Because GPU CUDA cores only accept row-major matrix layouts.'
    ],
    correctIndex: 1,
    explanation: 'The outer product δ · (a^(l-1))^T guarantees that the gradient tensor ∂L/∂W matches the exact dimensions of weight matrix W (rows = current layer, cols = previous layer).',
    syllabusReference: 'CS-482 Unit 3.2: Matrix Calculus in Neural Networks'
  }
];

interface AssessmentEngineProps {
  lecture: LectureSession;
  onJumpToTimestamp: (ms: number) => void;
  currentMs?: number;
  onAddNote?: (note: { text: string; timestampMs: number; category?: 'general' | 'exam' | 'question' | 'keypoint' }) => void;
}

export const AssessmentEngine: React.FC<AssessmentEngineProps> = ({
  lecture,
  onJumpToTimestamp,
  currentMs = 0,
  onAddNote,
}) => {
  // Load saved progress for the current lecture
  const initialProgress = useMemo(() => getAssessmentProgress(lecture.id), [lecture.id]);

  // Available Sub Tabs
  const [activeSubTab, setActiveSubTab] = useState<'summarize' | 'quiz' | 'misspeaks'>(
    () => initialProgress?.activeSubTab || 'summarize'
  );

  // Compute or retrieve lecture sections
  const sections: LectureSection[] = useMemo(() => {
    if (lecture.sections && lecture.sections.length > 0) {
      return lecture.sections;
    }
    // Fallback: Slice lecture duration into 3 equal sections
    const totalMs = lecture.durationMs || 60000;
    const slice = Math.floor(totalMs / 3);
    const formatTime = (ms: number) => {
      const totalSec = Math.floor(ms / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return [
      {
        id: 'sec-1',
        title: 'Part 1: Foundational Formulations',
        startMs: 0,
        endMs: slice,
        timeRangeFormatted: `00:00 - ${formatTime(slice)}`,
        description: 'Introduction and theoretical parameters.',
        keyTerms: ['Foundation', 'Parameters']
      },
      {
        id: 'sec-2',
        title: 'Part 2: Core Derivations & Mechanics',
        startMs: slice,
        endMs: slice * 2,
        timeRangeFormatted: `${formatTime(slice)} - ${formatTime(slice * 2)}`,
        description: 'Mathematical mechanics and step-by-step transformations.',
        keyTerms: ['Mechanics', 'Derivation']
      },
      {
        id: 'sec-3',
        title: 'Part 3: Critical Edge Cases & Applications',
        startMs: slice * 2,
        endMs: totalMs,
        timeRangeFormatted: `${formatTime(slice * 2)} - ${formatTime(totalMs)}`,
        description: 'Boundary conditions, convergence criteria, and synthesis.',
        keyTerms: ['Synthesis', 'Edge Cases']
      }
    ];
  }, [lecture]);

  // Determine currently active section based on currentMs
  const activeSection = useMemo(() => {
    const found = sections.find((s) => currentMs >= s.startMs && currentMs < s.endMs);
    return found || sections[0];
  }, [sections, currentMs]);

  // Selected section for viewing/summarizing (can be overridden by user)
  const [selectedSectionId, setSelectedSectionId] = useState<string>(activeSection.id);
  const [selectedSectionMode, setSelectedSectionMode] = useState<'section' | 'all'>('section');

  // Track if user manually picked a section
  const [isUserPinnedSection, setIsUserPinnedSection] = useState<boolean>(false);

  // Auto-sync selected section when playhead advances, unless pinned by user
  useEffect(() => {
    if (!isUserPinnedSection && activeSection) {
      setSelectedSectionId(activeSection.id);
    }
  }, [activeSection, isUserPinnedSection]);

  const currentViewingSection = useMemo(() => {
    return sections.find((s) => s.id === selectedSectionId) || sections[0];
  }, [sections, selectedSectionId]);

  // Summaries cache per section ID or 'all'
  const [summariesCache, setSummariesCache] = useState<Record<string, SectionSummary>>(
    () => initialProgress?.cachedSummaries || {}
  );
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [copiedBulletId, setCopiedBulletId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [addedNoteId, setAddedNoteId] = useState<string | null>(null);

  // Generate summary for target section
  const handleGenerateSummary = async (targetSection: LectureSection, forceRefresh = false) => {
    const cacheKey = selectedSectionMode === 'all' ? `all-${lecture.id}` : targetSection.id;

    if (!forceRefresh && summariesCache[cacheKey]) {
      return; // Already cached
    }

    setIsSummarizing(true);
    try {
      // Gather relevant section words
      const sectionWords = lecture.words
        .filter((w) => selectedSectionMode === 'all' || (w.startMs >= targetSection.startMs && w.startMs <= targetSection.endMs))
        .map((w) => w.text)
        .join(' ');

      // Gather relevant misspeaks
      const sectionMisspeaks = lecture.misspeaks.filter(
        (m) => selectedSectionMode === 'all' || (m.timestampMs >= targetSection.startMs && m.timestampMs <= targetSection.endMs)
      );

      const response = await fetch('/api/auto-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: lecture.title,
          courseCode: lecture.courseCode,
          courseName: lecture.courseName,
          sectionTitle: selectedSectionMode === 'all' ? `Full Lecture Synthesis: ${lecture.title}` : targetSection.title,
          timeRange: selectedSectionMode === 'all' ? `00:00 - ${formatMs(lecture.durationMs)}` : targetSection.timeRangeFormatted,
          transcriptExcerpt: sectionWords || lecture.overview,
          misspeaks: sectionMisspeaks,
          startMs: targetSection.startMs,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newSummary: SectionSummary = {
          sectionId: cacheKey,
          sectionTitle: data.sectionTitle || targetSection.title,
          timeRangeFormatted: data.timeRange || targetSection.timeRangeFormatted,
          overview: data.overview || 'Key concept breakdown generated for this lecture interval.',
          bullets: data.bullets || [],
          generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source || 'on_device_npu',
        };

        setSummariesCache((prev) => ({ ...prev, [cacheKey]: newSummary }));
      }
    } catch (err) {
      console.error('Auto-summarize error:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Auto-generate on first mount for active section
  useEffect(() => {
    if (currentViewingSection) {
      handleGenerateSummary(currentViewingSection);
    }
  }, [currentViewingSection.id, selectedSectionMode]);

  // Current active summary
  const currentSummary = useMemo(() => {
    const key = selectedSectionMode === 'all' ? `all-${lecture.id}` : currentViewingSection.id;
    return summariesCache[key];
  }, [summariesCache, selectedSectionMode, currentViewingSection.id, lecture.id]);

  // Copy single bullet
  const handleCopyBullet = (bullet: ConceptBullet) => {
    const text = `• [${bullet.timeFormatted}] ${bullet.concept}: ${bullet.bullet}`;
    navigator.clipboard.writeText(text);
    setCopiedBulletId(bullet.id);
    setTimeout(() => setCopiedBulletId(null), 1800);
  };

  // Copy all bullets as formatted markdown
  const handleCopyAllBullets = () => {
    if (!currentSummary) return;
    const mdLines = [
      `### Key Concepts: ${currentSummary.sectionTitle} (${currentSummary.timeRangeFormatted})`,
      `*${currentSummary.overview}*`,
      '',
      ...currentSummary.bullets.map(
        (b) => `* **[${b.timeFormatted}] ${b.concept}** (${b.categoryLabel}): ${b.bullet}`
      ),
      '',
      `Generated by Scribo AI (${currentSummary.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'On-Device NPU'})`
    ];
    navigator.clipboard.writeText(mdLines.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Save bullet directly to student's Quick Notes
  const handleSaveBulletToNotes = (bullet: ConceptBullet) => {
    const noteText = `[Auto-Summary] ${bullet.concept}: ${bullet.bullet}`;
    if (onAddNote) {
      onAddNote({
        text: noteText,
        timestampMs: bullet.timestampMs,
        category: bullet.category === 'exam_tip' ? 'exam' : bullet.category === 'pitfall' ? 'question' : 'keypoint',
      });
    } else {
      addQuickNote(lecture.id, {
        text: noteText,
        timestampMs: bullet.timestampMs,
        timeFormatted: bullet.timeFormatted,
        category: bullet.category === 'exam_tip' ? 'exam' : 'keypoint'
      });
    }

    setAddedNoteId(bullet.id);
    setTimeout(() => setAddedNoteId(null), 2000);
  };

  // Helper time formatter
  function formatMs(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Quiz questions state
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    if (initialProgress?.questions && initialProgress.questions.length > 0) {
      return initialProgress.questions;
    }
    return DEFAULT_QUESTIONS;
  });

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(
    () => initialProgress?.selectedAnswers || {}
  );
  const [reviewedMisspeaks, setReviewedMisspeaks] = useState<string[]>(
    () => initialProgress?.reviewedMisspeaks || []
  );
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Sync state when lecture changes
  useEffect(() => {
    const saved = getAssessmentProgress(lecture.id);
    if (saved) {
      if (saved.questions && saved.questions.length > 0) setQuestions(saved.questions);
      else setQuestions(DEFAULT_QUESTIONS);
      setSelectedAnswers(saved.selectedAnswers || {});
      setReviewedMisspeaks(saved.reviewedMisspeaks || []);
      if (saved.cachedSummaries) setSummariesCache(saved.cachedSummaries);
      if (saved.activeSubTab) setActiveSubTab(saved.activeSubTab);
    } else {
      setQuestions(DEFAULT_QUESTIONS);
      setSelectedAnswers({});
      setReviewedMisspeaks([]);
    }
  }, [lecture.id]);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex
  ).length;

  // Persist assessment progress to local storage
  useEffect(() => {
    saveAssessmentProgress(lecture.id, {
      selectedAnswers,
      questions,
      cachedSummaries: summariesCache,
      activeSubTab,
      reviewedMisspeaks,
      score: {
        answered: answeredCount,
        correct: correctCount,
        total: totalQuestions,
        percentage: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
      }
    });
  }, [lecture.id, selectedAnswers, questions, summariesCache, activeSubTab, reviewedMisspeaks, answeredCount, correctCount, totalQuestions]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (selectedAnswers[questionId] !== undefined) return;

    const newAnswers = { ...selectedAnswers, [questionId]: optionIndex };
    setSelectedAnswers(newAnswers);

    if (Object.keys(newAnswers).length === totalQuestions) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b']
      });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
  };

  const handleToggleReviewMisspeak = (misspeakId: string) => {
    setReviewedMisspeaks((prev) =>
      prev.includes(misspeakId)
        ? prev.filter((id) => id !== misspeakId)
        : [...prev, misspeakId]
    );
  };

  const handleRegenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: lecture.title,
          courseName: lecture.courseName,
          notesSummary: lecture.overview,
        }),
      });
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setSelectedAnswers({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-3 sm:p-4 md:p-5 shadow-xs flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 mb-3 border-b border-slate-100 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Dual-Layer Assessment Engine</span>
            </h2>
            <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              RAG Active
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Auto-summarizes key concepts by section, delivers Socratic mastery quizzes, and fact-checks against textbooks.
          </p>
        </div>

        {/* 3-Way Sub-tab switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {/* Tab 1: Auto-Summarize */}
          <button
            type="button"
            onClick={() => setActiveSubTab('summarize')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 min-h-[32px] ${
              activeSubTab === 'summarize'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Auto-Summarize</span>
          </button>

          {/* Tab 2: Auto-Quiz */}
          <button
            type="button"
            onClick={() => setActiveSubTab('quiz')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer min-h-[32px] ${
              activeSubTab === 'quiz'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Auto-Quiz ({answeredCount}/{totalQuestions})</span>
          </button>

          {/* Tab 3: Fact Checks */}
          <button
            type="button"
            onClick={() => setActiveSubTab('misspeaks')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 min-h-[32px] ${
              activeSubTab === 'misspeaks'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Fact Checks</span>
            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-bold border border-amber-200">
              {lecture.misspeaks.length}
            </span>
            {reviewedMisspeaks.length > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {reviewedMisspeaks.length}✓
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Content with Screen-Fitting Scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {/* ========================================================= */}
        {/* TAB 1: AUTO-SUMMARIZE SECTION KEY CONCEPTS */}
        {/* ========================================================= */}
        {activeSubTab === 'summarize' && (
          <div className="space-y-3.5 pb-2">
            {/* Section Selection Bar & Playhead Indicator */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Lecture Section Selector
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1.5">
                      (Playhead @ <span className="font-mono font-bold text-indigo-600">{formatMs(currentMs)}</span>)
                    </span>
                  </div>
                </div>

                {/* Mode toggle: Selected Section vs Full Lecture */}
                <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSectionMode('section');
                    }}
                    className={`px-2 py-1 rounded cursor-pointer font-medium transition-colors ${
                      selectedSectionMode === 'section'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Current Section
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSectionMode('all');
                    }}
                    className={`px-2 py-1 rounded cursor-pointer font-medium transition-colors ${
                      selectedSectionMode === 'all'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Full Session
                  </button>
                </div>
              </div>

              {/* Section Buttons Horizontal Scroller */}
              {selectedSectionMode === 'section' && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {sections.map((sec, idx) => {
                    const isCurrentPlaying = activeSection.id === sec.id;
                    const isSelected = selectedSectionId === sec.id;

                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => {
                          setSelectedSectionId(sec.id);
                          setIsUserPinnedSection(true);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs text-left shrink-0 transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-semibold'
                            : isCurrentPlaying
                            ? 'bg-indigo-50 text-indigo-900 border-indigo-300 font-medium'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {isCurrentPlaying && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                          <span className="font-mono text-[10px] opacity-80">{sec.timeRangeFormatted}</span>
                        </div>
                        <div className="truncate max-w-[150px] font-medium text-[11px] mt-0.5">
                          {idx + 1}. {sec.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Auto-Summary Action & Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-gradient-to-r from-indigo-50/70 to-blue-50/70 border border-indigo-100 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>
                      {selectedSectionMode === 'all' 
                        ? 'Full Lecture Key Concepts Summary' 
                        : currentViewingSection.title}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 bg-white/80 px-1.5 py-0.2 rounded border border-indigo-200">
                      {selectedSectionMode === 'all' ? `00:00 - ${formatMs(lecture.durationMs)}` : currentViewingSection.timeRangeFormatted}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>Engine:</span>
                    <span className="font-semibold text-indigo-700">
                      {currentSummary?.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'On-Device NPU (Zero-Latency)'}
                    </span>
                    {currentSummary?.generatedAt && (
                      <span className="text-slate-400">• Updated {currentSummary.generatedAt}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Regenerate & Copy All */}
              <div className="flex items-center space-x-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => handleGenerateSummary(currentViewingSection, true)}
                  disabled={isSummarizing}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer disabled:opacity-50 shadow-2xs min-h-[30px]"
                  title="Re-run concept extraction via Gemini"
                >
                  <RefreshCw className={`w-3 h-3 ${isSummarizing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
                  <span>{isSummarizing ? 'Synthesizing...' : 'Regenerate'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyAllBullets}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs min-h-[30px]"
                  title="Copy formatted markdown of all bullet points"
                >
                  {copiedAll ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAll ? 'Copied!' : 'Copy Bullets'}</span>
                </button>
              </div>
            </div>

            {/* Overview Banner */}
            {currentSummary?.overview && (
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-2xs">
                <strong className="text-slate-900 font-bold block mb-0.5">Section Theoretical Thesis:</strong>
                {currentSummary.overview}
              </div>
            )}

            {/* Loading Indicator */}
            {isSummarizing && (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-2 text-center">
                <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                <div className="text-xs font-bold text-slate-800">
                  Synthesizing Key Concepts for {currentViewingSection.title}...
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  Deconstructing spoken speech into high-yield formula mechanics, textbook fact-checks, and exam takeaways.
                </p>
              </div>
            )}

            {/* Bulleted Concepts Cards */}
            {!isSummarizing && currentSummary?.bullets && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                  <span>Bulleted Key Concepts ({currentSummary.bullets.length})</span>
                  <span className="text-slate-400 font-normal">Click timestamp to jump audio</span>
                </div>

                {currentSummary.bullets.map((bullet) => {
                  const isCopied = copiedBulletId === bullet.id;
                  const isAddedToNotes = addedNoteId === bullet.id;

                  // Category styling
                  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (bullet.category === 'definition') {
                    badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  } else if (bullet.category === 'mechanics') {
                    badgeStyle = 'bg-sky-50 text-sky-700 border-sky-200';
                  } else if (bullet.category === 'pitfall') {
                    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
                  } else if (bullet.category === 'exam_tip') {
                    badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  }

                  return (
                    <div
                      key={bullet.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all space-y-2 group"
                    >
                      {/* Top row: Category, Concept, Timestamp & Actions */}
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle}`}>
                            {bullet.categoryLabel}
                          </span>
                          {bullet.highYield && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                              <Target className="w-2.5 h-2.5" />
                              <span>High-Yield</span>
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-900">
                            {bullet.concept}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1 ml-auto">
                          {/* Jump Audio Button */}
                          <button
                            type="button"
                            onClick={() => onJumpToTimestamp(bullet.timestampMs)}
                            className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-[11px] font-mono font-bold border border-slate-200 transition-colors cursor-pointer"
                            title={`Jump audio to ${bullet.timeFormatted}`}
                          >
                            <Volume2 className="w-3 h-3 text-indigo-600" />
                            <span>{bullet.timeFormatted}</span>
                          </button>

                          {/* Save to Notes Button */}
                          <button
                            type="button"
                            onClick={() => handleSaveBulletToNotes(bullet)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                            title="Add concept bullet to Quick Notes"
                          >
                            {isAddedToNotes ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <BookmarkPlus className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Copy Bullet Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyBullet(bullet)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                            title="Copy concept to clipboard"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Bullet Text */}
                      <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                        {bullet.bullet}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SOCRATIC AUTO-QUIZ */}
        {/* ========================================================= */}
        {activeSubTab === 'quiz' && (
          <div className="space-y-3.5 pb-2">
            {/* Quiz Progress & Score Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Mastery Score: {answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0}%</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <Database className="w-2.5 h-2.5" />
                      Saved Offline
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {answeredCount} of {totalQuestions} answered ({correctCount} correct)
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {answeredCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer shadow-2xs min-h-[32px]"
                    title="Clear answers and practice again"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRegenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-all cursor-pointer disabled:opacity-50 shadow-2xs min-h-[32px]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingQuiz ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
                  <span>{isGeneratingQuiz ? 'Generating...' : 'Regenerate'}</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            {questions.map((q, qIndex) => {
              const userAnswer = selectedAnswers[q.id];
              const isAnswered = userAnswer !== undefined;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-700">
                      Question {qIndex + 1}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                      {q.syllabusReference}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {q.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswer === optIdx;
                      const isCorrect = optIdx === q.correctIndex;

                      let optionStyle = 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/30 shadow-2xs';

                      if (isAnswered) {
                        if (isCorrect) {
                          optionStyle = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold';
                        } else if (isSelected) {
                          optionStyle = 'bg-rose-50 border-rose-300 text-rose-950 font-semibold';
                        } else {
                          optionStyle = 'opacity-50 border-slate-200 text-slate-400 bg-slate-100';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start space-x-2.5 cursor-pointer ${optionStyle}`}
                        >
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                          {isAnswered && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {isAnswered && (
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 space-y-1">
                      <div className="font-bold text-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Socratic Rationale:</span>
                      </div>
                      <p className="leading-relaxed text-slate-700">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MISSPEAKS & FACT CHECKS */}
        {/* ========================================================= */}
        {activeSubTab === 'misspeaks' && (
          <div className="space-y-3.5 pb-2">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Asynchronous PDF RAG in Action:</strong> Scribo cross-checks every spoken sentence against uploaded course syllabus and standard textbooks in real time. When a professor misspoke or stated an edge case incorrectly, Scribo quietly marks it with a citation so students never learn wrong information.
            </div>

            {lecture.misspeaks.map((m) => {
              const isReviewed = reviewedMisspeaks.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all space-y-2.5 ${
                    isReviewed 
                      ? 'bg-slate-50/80 border-slate-200 opacity-85' 
                      : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 font-mono font-bold text-xs">
                        {m.timeFormatted}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Discrepancy in Lecture Audio
                      </span>
                      {isReviewed && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Reviewed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleReviewMisspeak(m.id)}
                        className={`text-xs font-medium px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                          isReviewed
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isReviewed ? 'Mark Unreviewed' : 'Mark Reviewed'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onJumpToTimestamp(m.timestampMs)}
                        className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer px-1.5 py-1"
                      >
                        <span>Jump Audio</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-950">
                    <span className="font-bold text-rose-800">Lecturer Stated: </span>
                    <em className="italic">"{m.spokenQuote}"</em>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                    <span className="font-bold text-emerald-800">Correct Academic Fact: </span>
                    <span>{m.correctFact}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono text-slate-600">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      Citation: {m.citation}
                    </span>
                    <span className="text-emerald-700 font-semibold">Fact-checked ✓</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

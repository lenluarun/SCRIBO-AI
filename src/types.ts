export interface TimedWord {
  id: string;
  text: string;
  startMs: number;
  endMs: number;
  confidence: number;
  isFlaggedMisspeak?: boolean;
  misspeakId?: string;
  isKeyTerm?: boolean;
}

export interface MisspeakAlert {
  id: string;
  spokenQuote: string;
  correctFact: string;
  citation: string;
  timestampMs: number;
  timeFormatted: string;
  severity: 'correction' | 'clarification';
  resolved?: boolean;
}

export interface VisualDiagram {
  id: string;
  title: string;
  category: 'flowchart' | 'formula' | 'skill_architecture';
  mermaidCode?: string;
  latexCode?: string;
  explanation: string;
  skillNodeId: string;
}

export interface SyllabusSkillNode {
  id: string;
  code: string;
  name: string;
  description: string;
  progressPercent: number;
  status: 'covered' | 'in_progress' | 'behind_schedule';
  lecturesMapped: number;
  misspeaksDetected: number;
}

export interface ComprehensionHeatmapPoint {
  timestampSec: number;
  timeFormatted: string;
  rewindCount: number;
  confusionIndex: number; // 0 to 100
  sentenceExcerpt: string;
}

export interface AttendanceRecord {
  studentId: string;
  name: string;
  rollNo: string;
  checkInTime: string;
  acousticHandshakeVerified: boolean;
  engagementScore: number;
  status: 'Present' | 'Late' | 'Absent';
}

export interface LectureSection {
  id: string;
  title: string;
  startMs: number;
  endMs: number;
  timeRangeFormatted: string;
  description: string;
  keyTerms: string[];
}

export interface ConceptBullet {
  id: string;
  category: 'definition' | 'mechanics' | 'pitfall' | 'exam_tip';
  categoryLabel: string;
  concept: string;
  bullet: string;
  timestampMs: number;
  timeFormatted: string;
  highYield?: boolean;
}

export interface SectionSummary {
  sectionId: string;
  sectionTitle: string;
  timeRangeFormatted: string;
  overview: string;
  bullets: ConceptBullet[];
  generatedAt: string;
  source: 'gemini-3.8-flash' | 'on_device_npu';
}

export interface LectureSession {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  date: string;
  durationMs: number;
  overview: string;
  words: TimedWord[];
  misspeaks: MisspeakAlert[];
  diagrams: VisualDiagram[];
  syllabusNodes: SyllabusSkillNode[];
  heatmaps: ComprehensionHeatmapPoint[];
  attendance: AttendanceRecord[];
  sections?: LectureSection[];
}

export interface SocraticMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  guidingQuestion?: string;
  suggestedFollowups?: string[];
  referencedTimestampMs?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  syllabusReference: string;
}

export interface NpuMetrics {
  mode: 'on_device_npu' | 'cloud_transcriber';
  chipset: string;
  latencyMs: number;
  powerConsumptionWatts: number;
  audioDataTransmittedKb: number;
  offlineStatus: boolean;
  opsPerSecondTops: number;
}

export interface AudioBookmark {
  id: string;
  timestampMs: number;
  timeFormatted: string;
  note: string;
  createdAt: string;
}

export interface QuickNote {
  id: string;
  lectureId: string;
  timestampMs: number;
  timeFormatted: string;
  text: string;
  createdAt: string;
  category?: 'general' | 'exam' | 'question' | 'keypoint';
}

export interface PlaybackProgress {
  lectureId: string;
  currentMs: number;
  durationMs: number;
  playbackRate: number;
  lastUpdated: number;
  completed?: boolean;
}

export interface AssessmentProgress {
  lectureId: string;
  selectedAnswers: Record<string, number>;
  questions?: QuizQuestion[];
  score?: {
    answered: number;
    correct: number;
    total: number;
    percentage: number;
  };
  cachedSummaries?: Record<string, SectionSummary>;
  reviewedMisspeaks?: string[];
  activeSubTab?: 'summarize' | 'quiz' | 'misspeaks';
  lastUpdated: number;
}


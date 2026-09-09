import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Cpu, 
  Activity, 
  Award,
  Layers
} from 'lucide-react';

interface PitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchDeckModal: React.FC<PitchDeckModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      page: 1,
      badge: 'iQOO HACKATHON • SMART EDUCATION TRACK',
      title: 'Hey, Scribo!!!',
      subtitle: 'On-Device AI Co-Pilot for Tutoring, Study Workflows, Assessment & Classroom Operations',
      bullets: ['● Live Transcriptor', '● Socratic Voice Tutoring', '● Auto-Graded Assessments'],
      footer: 'Prototype 01 · E2C Engineering',
    },
    {
      page: 2,
      badge: 'THE PROBLEM',
      title: 'The Classroom Dilemma',
      subtitle: 'How disjointed tools hurt both students and professors',
      content: [
        {
          title: 'Fragmented Learning Loop',
          desc: 'Students juggle disconnected apps for notes, doubt-solving, and revision. Passive verbatim transcription replaces real understanding, and doubts sit unresolved until the next class.',
        },
        {
          title: 'Invisible Classroom Signal',
          desc: 'Teachers have no real-time read on comprehension, skill gaps, or syllabus coverage. Grading and fact-verification happen manually, days after the lecture already ended.',
        },
      ],
    },
    {
      page: 3,
      badge: 'HERO INNOVATION',
      title: 'Word-Synced Audio Scrubbing',
      subtitle: 'The study-workflow engine at the core of every note',
      features: [
        {
          title: 'Millisecond Audio-Token Binding',
          desc: 'Every transcribed word is mapped to on-device audio timestamps as the lecture happens.',
        },
        {
          title: 'Tap-to-Audio Recall',
          desc: "Tap any word in your notes to instantly resume the professor's live audio from that exact millisecond.",
        },
        {
          title: 'Offline Privacy by Design',
          desc: 'All transcription and indexing run on-device. Zero audio data ever leaves the phone.',
        },
      ],
      tag: '00:14:22 · live sync',
    },
    {
      page: 4,
      badge: 'CORE CAPABILITIES',
      title: 'Three Pillars: Tutor, Assess, Skill',
      pillars: [
        {
          num: '01',
          name: 'Socratic Voice Tutor',
          tag: 'TUTORING',
          desc: 'A native audio widget where students speak their doubts aloud and receive guiding questions instead of direct answer dumps — building reasoning, not dependency.',
        },
        {
          num: '02',
          name: 'Dual-Layer Assessment Engine',
          tag: 'ASSESSMENT',
          desc: 'Asynchronous RAG against textbook and syllabus PDFs auto-generates quizzes and flags lecturer misspeaks with discreet margin citations.',
        },
        {
          num: '03',
          name: 'Visual Skill Synthesis',
          tag: 'SKILLING',
          desc: 'Spoken processes become dynamic Mermaid.js flowcharts and clean LaTeX formulas, auto-tagged to syllabus skill nodes for progress tracking.',
        },
      ],
    },
    {
      page: 5,
      badge: 'DAILY CLASSROOM OPERATIONS',
      title: 'An Operations Layer for Every Class',
      ops: [
        {
          title: 'Live Comprehension Pulse',
          desc: 'Anonymized tap-to-replay heatmaps show teachers the exact sentence that lost the room, in real time.',
        },
        {
          title: 'Auto Syllabus Coverage Tracker',
          desc: 'Every lecture auto-maps to curriculum nodes, flagging topics that are falling behind schedule.',
        },
        {
          title: 'Zero-Effort Attendance Sync',
          desc: 'On-device session logs tie directly into existing attendance and ERP systems — no extra hardware step.',
        },
        {
          title: 'One-Tap Weekly Digest',
          desc: 'An auto-compiled report of flagged misspeaks, quiz performance, and class-wide skill gaps.',
        },
      ],
    },
    {
      page: 6,
      badge: 'COMPETITIVE ADVANTAGE',
      title: 'Where Scribo AI Wins',
      isComparison: true,
    },
    {
      page: 7,
      badge: 'Built for iQOO Hackathon • Smart Education Track',
      title: 'Scribo AI',
      subtitle: 'Tutoring · Study Workflows · Assessment · Skilling · Classroom Ops',
      bullets: ['On-Device Mobile Demo Ready', 'Phase 1 Pitch Deck'],
      footer: 'E2C · Error To Clear',
    },
  ];

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-8 md:p-10 flex flex-col justify-between min-h-[480px]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Slide Content */}
        <div className="my-auto py-4">
          <div className="text-center space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200 uppercase">
              {slide.badge}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              {slide.title}
            </h2>

            {slide.subtitle && (
              <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
                {slide.subtitle}
              </p>
            )}
          </div>

          {/* Slide 1 & 7 Bullets */}
          {slide.bullets && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              {slide.bullets.map((b, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700"
                >
                  {b}
                </span>
              ))}
            </div>
          )}

          {/* Slide 2 Content */}
          {slide.content && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {slide.content.map((c, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                  <h3 className="text-base font-bold text-indigo-700">{c.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Slide 3 Features */}
          {slide.features && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {slide.features.map((f, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                  <h3 className="text-sm font-bold text-indigo-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span>{f.title}</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Slide 4 Pillars */}
          {slide.pillars && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {slide.pillars.map((p, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-indigo-600 font-mono">{p.num}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                      {p.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Slide 5 Operations */}
          {slide.ops && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {slide.ops.map((o, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1.5">
                  <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>{o.title}</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{o.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Slide 6 Comparison */}
          {slide.isComparison && (
            <div className="mt-6 text-center text-xs text-slate-600 space-y-2">
              <p className="text-slate-600">
                Scribo AI achieves sub-word precision, dual-layer fact checks, dynamic diagrams, and Socratic guidance natively on-device in 140ms.
              </p>
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm font-semibold inline-block">
                ✓ Full benchmark accessible on the main screen in the "Where Scribo Wins" tab.
              </div>
            </div>
          )}

          {slide.footer && (
            <div className="text-center text-xs font-mono text-slate-500 mt-8">
              {slide.footer}
            </div>
          )}
        </div>

        {/* Navigation Dots & Next/Prev */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-6 bg-indigo-600' : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

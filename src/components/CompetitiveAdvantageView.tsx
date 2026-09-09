import React from 'react';
import { 
  Check, 
  X, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Layers, 
  ArrowRight,
  HelpCircle,
  Clock,
  BookOpen
} from 'lucide-react';

export const CompetitiveAdvantageView: React.FC = () => {
  const comparisonMatrix = [
    {
      capability: 'Word-Synced Audio Jump',
      standard: { text: 'No', passed: false },
      genericCloud: { text: 'Paragraph only', passed: false },
      scribo: { text: 'Sub-word precision', passed: true, note: 'Millisecond audio-token binding' },
    },
    {
      capability: 'Dual-Layer Fact Check',
      standard: { text: 'No', passed: false },
      genericCloud: { text: 'No', passed: false },
      scribo: { text: 'Real-time syllabus RAG', passed: true, note: 'Flags misspeaks with textbook citations' },
    },
    {
      capability: 'Auto Flowcharts & Diagrams',
      standard: { text: 'No', passed: false },
      genericCloud: { text: 'Raw text only', passed: false },
      scribo: { text: 'Auto Mermaid & LaTeX', passed: true, note: 'Spoken formulas rendered automatically' },
    },
    {
      capability: 'Socratic Audio Answers',
      standard: { text: 'No', passed: false },
      genericCloud: { text: 'Answer dump only', passed: false },
      scribo: { text: 'Step-by-step guidance', passed: true, note: 'Guiding questions that build reasoning' },
    },
    {
      capability: 'Deployment & Latency',
      standard: { text: 'Local audio (dumb file)', passed: false },
      genericCloud: { text: 'Cloud API (880ms, data leak)', passed: false },
      scribo: { text: 'On-Device NPU (140ms, 100% offline)', passed: true, note: 'Zero audio data leaves device' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* The Problem: The Classroom Dilemma (Slide 2) */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="max-w-3xl">
          <span className="text-[11px] font-mono tracking-wider uppercase text-indigo-700 font-bold">
            T H E &nbsp; P R O B L E M
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            The Classroom Dilemma
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Why traditional lecture recording and standard transcription apps fail students and educators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-800 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span>Fragmented Learning Loop</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Students juggle disconnected apps for notes, doubt-solving, and revision. Passive verbatim transcription replaces real understanding, and doubts sit unresolved until the next class.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Invisible Classroom Signal</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Teachers have no real-time read on comprehension, skill gaps, or syllabus coverage. Grading and fact-verification happen manually, days after the lecture already ended.
            </p>
          </div>
        </div>
      </div>

      {/* Slide 6: Where Scribo AI Wins Comparison Table */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <span className="text-[11px] font-mono tracking-wider uppercase text-indigo-700 font-bold">
            C O M P E T I T I V E &nbsp; A D V A N T A G E
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Where Scribo AI Wins
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Direct capability benchmark against standard voice recorders and cloud transcribers.
          </p>
        </div>

        {/* Matrix Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-1/4">Capability</th>
                  <th className="py-3.5 px-4 w-1/4 text-slate-600">Standard Recorders</th>
                  <th className="py-3.5 px-4 w-1/4 text-slate-600">Generic Cloud Transcribers</th>
                  <th className="py-3.5 px-4 w-1/4 bg-indigo-50/80 text-indigo-950 border-l border-indigo-200 font-bold">
                    Scribo AI (On-Device)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {comparisonMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {row.capability}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <X className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{row.standard.text}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <X className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{row.genericCloud.text}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 bg-indigo-50/40 border-l border-indigo-100 text-indigo-950">
                      <div className="flex items-center space-x-1.5 font-bold text-indigo-950">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{row.scribo.text}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-normal">
                        {row.scribo.note}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide 3 & 4 Pillar Recap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-indigo-700 text-xs font-bold">PILLAR 01</span>
            <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              TUTORING
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900">Socratic Voice Tutor</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Native audio widget where students speak doubts aloud and receive guiding questions instead of direct answer dumps — building reasoning, not dependency.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-emerald-700 text-xs font-bold">PILLAR 02</span>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              ASSESSMENT
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900">Dual-Layer Assessment</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Asynchronous RAG against textbook and syllabus PDFs auto-generates quizzes and flags lecturer misspeaks with discreet margin citations.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-purple-700 text-xs font-bold">PILLAR 03</span>
            <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
              SKILLING
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900">Visual Skill Synthesis</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Spoken processes become dynamic Mermaid.js flowcharts and clean LaTeX formulas, auto-tagged to syllabus skill nodes for progress tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

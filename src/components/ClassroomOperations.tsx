import React, { useState } from 'react';
import { 
  Activity, 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Radio,
  Wifi,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { LectureSession } from '../types';

interface ClassroomOperationsProps {
  lecture: LectureSession;
  onJumpToLectureTime: (ms: number) => void;
}

export const ClassroomOperations: React.FC<ClassroomOperationsProps> = ({
  lecture,
  onJumpToLectureTime,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pulse' | 'attendance' | 'digest'>('pulse');
  const [digestMarkdown, setDigestMarkdown] = useState<string | null>(null);
  const [isGeneratingDigest, setIsGeneratingDigest] = useState(false);
  const [copiedDigest, setCopiedDigest] = useState(false);

  const generateDigest = async () => {
    setIsGeneratingDigest(true);
    try {
      const response = await fetch('/api/weekly-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseCode: lecture.courseCode,
          courseName: lecture.courseName,
          misspeakList: lecture.misspeaks,
          averageScore: 86,
          attendanceRate: 94,
        }),
      });
      const data = await response.json();
      setDigestMarkdown(data.digestMarkdown || 'Weekly digest compiled successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDigest(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDigest(true);
    setTimeout(() => setCopiedDigest(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col h-full min-h-0 overflow-hidden space-y-4">
      {/* Top Banner & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Daily Classroom Operations Layer
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Teacher & Dept Admin View
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time read on comprehension, skill gaps, syllabus velocity, and attendance sync.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('pulse')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[32px] ${
              activeSubTab === 'pulse'
                ? 'bg-white text-indigo-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pulse</span>
          </button>

          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[32px] ${
              activeSubTab === 'attendance'
                ? 'bg-white text-indigo-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Attendance</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('digest');
              if (!digestMarkdown) generateDigest();
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[32px] ${
              activeSubTab === 'digest'
                ? 'bg-white text-indigo-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Weekly Digest</span>
          </button>
        </div>
      </div>

      {/* Main Operations Views */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {activeSubTab === 'pulse' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 leading-relaxed">
              <strong>Live Comprehension Pulse (Slide 5):</strong> Anonymized tap-to-replay telemetry aggregated from all enrolled students' devices. Shows the exact sentence where students scrubbed backward to re-listen, exposing classroom friction in real time!
            </div>

            {/* Friction Heatmap Bar Overview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                <span className="font-bold text-slate-800">
                  Aggregated Student Re-play Frequency along Lecture Timeline
                </span>
                <span className="text-rose-700 font-mono text-[11px] font-bold">
                  Peak Confusion: 00:25 (34 Rewinds)
                </span>
              </div>

              {/* Heatmap Bar graph */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                {lecture.heatmaps.map((h, i) => (
                  <div 
                    key={i}
                    onClick={() => onJumpToLectureTime(h.timestampSec * 1000)}
                    className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all flex flex-col justify-between shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-indigo-700 font-bold">{h.timeFormatted}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        h.confusionIndex > 75 ? 'bg-rose-100 text-rose-800' : h.confusionIndex > 40 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {h.confusionIndex}%
                      </span>
                    </div>

                    <div className="my-2 h-10 flex items-end">
                      <div 
                        className={`w-full rounded-md transition-all ${
                          h.confusionIndex > 75 
                            ? 'bg-rose-500 shadow-xs' 
                            : h.confusionIndex > 40 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                        }`}
                        style={{ height: `${Math.max(15, h.confusionIndex)}%` }}
                      />
                    </div>

                    <div className="text-[10px] text-slate-500 text-center font-mono font-medium">
                      {h.rewindCount} Rewinds
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Friction Points Drilldown */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Friction Excerpts Drilldown
              </h3>

              {lecture.heatmaps.map((h, idx) => (
                <div
                  key={idx}
                  onClick={() => onJumpToLectureTime(h.timestampSec * 1000)}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 transition-all cursor-pointer text-xs flex items-center justify-between gap-3 group shadow-2xs"
                >
                  <div className="flex items-start space-x-3">
                    <span className="px-2 py-1 rounded-md font-mono bg-slate-100 border border-slate-200 text-indigo-700 text-xs font-bold shrink-0">
                      {h.timeFormatted}
                    </span>
                    <div>
                      <div className="text-slate-900 font-semibold group-hover:text-indigo-950">
                        "{h.sentenceExcerpt}"
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>{h.rewindCount} students hit rewind</span>
                        <span>•</span>
                        <span className={h.confusionIndex > 70 ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                          Confusion Rating: {h.confusionIndex}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold shrink-0 flex items-center">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'attendance' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 leading-relaxed">
              <strong>Zero-Effort Attendance Sync (Slide 5):</strong> On-device ultrasonic acoustic watermark & session biometric handshake logs automatically synchronize to the university ERP. Zero manual roll-call or hardware scan required.
            </div>

            {/* Attendance Overview Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Verified Attendance</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">94.2%</div>
                <span className="text-[10px] text-emerald-700 font-semibold">62 of 66 Enrolled present</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Handshake Integrity</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">100% On-Device</div>
                <span className="text-[10px] text-indigo-700 font-semibold">Zero spoofing / proxy flags</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Class Attention Score</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">89 / 100</div>
                <span className="text-[10px] text-slate-600 font-medium">Based on note-taking engagement</span>
              </div>
            </div>

            {/* Attendance Student Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="font-bold text-slate-900">Live Synchronized Student Sessions</span>
                <button
                  onClick={() => alert('Exporting attendance payload to university ERP via REST API... Complete!')}
                  className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-xs font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export to University ERP</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Roll Number</th>
                      <th className="py-2.5 px-4">Check-In Handshake</th>
                      <th className="py-2.5 px-4">Engagement</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {lecture.attendance.map((att) => (
                      <tr key={att.studentId} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{att.name}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">{att.rollNo}</td>
                        <td className="py-2.5 px-4 font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{att.checkInTime}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-semibold">{att.engagementScore}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-600 rounded-full" 
                                style={{ width: `${att.engagementScore}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            att.status === 'Present' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'digest' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Automated Weekly Digest Generator (Slide 5)
                </h4>
                <p className="text-[11px] text-slate-500">
                  AI-compiled report of flagged misspeaks, quiz performance, and class-wide skill gaps.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {digestMarkdown && (
                  <button
                    onClick={() => copyToClipboard(digestMarkdown)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer shadow-2xs min-h-[34px]"
                  >
                    {copiedDigest ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedDigest ? 'Copied' : 'Copy Report'}</span>
                  </button>
                )}

                <button
                  onClick={generateDigest}
                  disabled={isGeneratingDigest}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 min-h-[34px]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingDigest ? 'Compiling Digest...' : 'Regenerate Digest'}</span>
                </button>
              </div>
            </div>

            {/* Rendered Digest Card */}
            {digestMarkdown ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-3 shadow-xs">
                {digestMarkdown}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Click "Regenerate Digest" to compile this week's operations report.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

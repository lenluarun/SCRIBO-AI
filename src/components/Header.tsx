import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  BookOpen, 
  Activity, 
  Award, 
  ChevronDown, 
  Zap, 
  Lock,
  Layers,
  Info
} from 'lucide-react';
import { LectureSession, NpuMetrics } from '../types';

interface HeaderProps {
  activeTab: 'student' | 'operations' | 'competitive';
  setActiveTab: (tab: 'student' | 'operations' | 'competitive') => void;
  currentLecture: LectureSession;
  allLectures: LectureSession[];
  onSelectLecture: (lecture: LectureSession) => void;
  npuMetrics: NpuMetrics;
  onToggleNpuMode: () => void;
  onOpenPitchModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentLecture,
  allLectures,
  onSelectLecture,
  npuMetrics,
  onToggleNpuMode,
  onOpenPitchModal,
}) => {
  const [showLecturesMenu, setShowLecturesMenu] = useState(false);
  const [showNpuDetails, setShowNpuDetails] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      {/* Top micro-bar: Hackathon banner */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            iQOO HACKATHON
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-700 font-medium tracking-wide hidden sm:inline">SMART EDUCATION TRACK</span>
          <span className="text-slate-300 hidden md:inline">•</span>
          <span className="text-slate-500 hidden md:inline">Prototype 01 · E2C Engineering (Error To Clear)</span>
        </div>

        <div className="flex items-center space-x-3 ml-auto sm:ml-0">
          <button
            onClick={onOpenPitchModal}
            className="flex items-center space-x-1.5 text-indigo-600 hover:text-indigo-800 transition-colors font-medium cursor-pointer text-xs"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Slide Deck Vision</span>
          </button>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1.5 text-emerald-700 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Live Sync Engine</span>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 shadow-sm flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1">
                  Hey, Scribo<span className="text-indigo-600">!!!</span>
                </h1>
                <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                  v1.2 On-Device
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                On-Device AI Co-Pilot for Tutoring, Study Workflows & Operations
              </p>
            </div>
          </div>

          {/* Lecture Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLecturesMenu(!showLecturesMenu)}
              className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all text-xs cursor-pointer min-h-[38px]"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
              <div className="max-w-[130px] sm:max-w-[190px] md:max-w-[220px] truncate">
                <div className="font-semibold text-slate-800 truncate">{currentLecture.courseCode}: {currentLecture.title}</div>
                <div className="text-[10px] text-slate-500 truncate">{currentLecture.instructor}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {showLecturesMenu && (
              <div 
                className="absolute left-0 mt-2 w-80 max-w-[calc(100vw-24px)] rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowLecturesMenu(false)}
              >
                <div className="px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Select Classroom Session
                </div>
                {allLectures.map((lec) => (
                  <button
                    key={lec.id}
                    onClick={() => {
                      onSelectLecture(lec);
                      setShowLecturesMenu(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors mb-1 cursor-pointer ${
                      lec.id === currentLecture.id
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-700">{lec.courseCode}</span>
                      <span className="text-[10px] text-slate-400">{lec.date}</span>
                    </div>
                    <div className="font-medium text-slate-800 mt-0.5 truncate">{lec.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{lec.instructor}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center/Right Nav Tabs & NPU Telemetry */}
        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto sm:ml-0 flex-wrap gap-y-2">
          {/* Main Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[34px] ${
                activeTab === 'student'
                  ? 'bg-white text-indigo-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xs:inline">Student</span>
              <span className="xs:hidden">Learn</span>
            </button>

            <button
              onClick={() => setActiveTab('operations')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[34px] ${
                activeTab === 'operations'
                  ? 'bg-white text-indigo-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden xs:inline">Classroom Ops</span>
              <span className="xs:hidden">Ops</span>
            </button>

            <button
              onClick={() => setActiveTab('competitive')}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[34px] ${
                activeTab === 'competitive'
                  ? 'bg-white text-indigo-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Where Scribo Wins</span>
              <span className="md:hidden">Compare</span>
            </button>
          </div>

          {/* NPU On-Device Telemetry Pill */}
          <div className="relative">
            <button
              onClick={() => setShowNpuDetails(!showNpuDetails)}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer min-h-[34px] ${
                npuMetrics.mode === 'on_device_npu'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="font-semibold">
                {npuMetrics.mode === 'on_device_npu' ? 'NPU: 140ms' : 'Cloud: 880ms'}
              </span>
              <span className="hidden xl:inline text-[10px] opacity-75">
                {npuMetrics.mode === 'on_device_npu' ? '(0 KB audio leaked)' : '(45MB sent)'}
              </span>
            </button>

            {/* Telemetry Popover */}
            {showNpuDetails && (
              <div 
                className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-24px)] rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 text-slate-800"
                onMouseLeave={() => setShowNpuDetails(false)}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Architecture Benchmark</span>
                  </div>
                  <button
                    onClick={onToggleNpuMode}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 cursor-pointer"
                  >
                    Switch Mode
                  </button>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" /> Latency:
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {npuMetrics.latencyMs} ms
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" /> Audio Sent to Cloud:
                    </span>
                    <span className={`font-mono font-bold ${npuMetrics.audioDataTransmittedKb === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {npuMetrics.audioDataTransmittedKb} KB
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" /> Offline Privacy:
                    </span>
                    <span className="font-medium text-slate-900">
                      {npuMetrics.offlineStatus ? '100% On-Device NPU' : 'Remote Cloud Dependent'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-purple-600" /> Chipset Execution:
                    </span>
                    <span className="font-mono text-slate-800 text-[11px]">
                      {npuMetrics.chipset}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {npuMetrics.mode === 'on_device_npu' 
                    ? '🔒 Offline Privacy by Design: All transcription and token-timestamp indexing run on-device. Zero audio data ever leaves the phone.'
                    : '⚠️ Standard Cloud Transcriber: High network lag (880ms), continuous battery drain, and student voice streams sent to remote servers.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

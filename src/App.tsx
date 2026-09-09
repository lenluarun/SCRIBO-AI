import React, { useState, useEffect } from 'react';
import { 
  AudioScrubberPlayer 
} from './components/AudioScrubberPlayer';
import { 
  TranscriptView 
} from './components/TranscriptView';
import { 
  SocraticTutorWidget 
} from './components/SocraticTutorWidget';
import { 
  AssessmentEngine 
} from './components/AssessmentEngine';
import { 
  VisualSkillSynthesis 
} from './components/VisualSkillSynthesis';
import { 
  ClassroomOperations 
} from './components/ClassroomOperations';
import { 
  CompetitiveAdvantageView 
} from './components/CompetitiveAdvantageView';
import { 
  PitchDeckModal 
} from './components/PitchDeckModal';
import { 
  MobileMiniPlayer 
} from './components/MobileMiniPlayer';
import { 
  HeaderProgressBar 
} from './components/HeaderProgressBar';
import { 
  SAMPLE_LECTURES 
} from './data/lecturesData';
import { 
  LectureSession, 
  NpuMetrics, 
  MisspeakAlert 
} from './types';
import { 
  audioEngine 
} from './utils/audioEngine';
import { 
  getPlaybackProgress, 
  savePlaybackProgress, 
  getLastActiveLectureId, 
  setLastActiveLectureId 
} from './utils/persistence';
import { 
  Headphones, 
  Bot, 
  FileCheck, 
  GitBranch, 
  Activity, 
  Sparkles, 
  Radio, 
  ChevronDown, 
  Wifi, 
  Battery, 
  Cpu, 
  Award,
  Check,
  X,
  Smartphone,
  Maximize2,
  LayoutGrid,
  Columns,
  Lightbulb,
  BookOpen,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  // Navigation View Modes
  // 'studio' = Side-by-Side Dual-Grid Workspace (Desktop / Tablet)
  // 'audio' | 'assess' | 'tutor' | 'skills' | 'ops' | 'vision' = Focused Full-Width Views
  const [activeView, setActiveView] = useState<'studio' | 'audio' | 'assess' | 'tutor' | 'skills' | 'ops' | 'vision'>('studio');

  // Secondary tab inside Studio right-side panel
  const [studioRightPanel, setStudioRightPanel] = useState<'assess' | 'tutor' | 'skills' | 'ops'>('assess');

  // Mobile navigation tab (when screen is < 1024px or in phone frame)
  const [mobileTab, setMobileTab] = useState<'audio' | 'assess' | 'tutor' | 'skills' | 'ops' | 'vision'>('audio');

  // Restore last active lecture session if available
  const initialLecture = React.useMemo(() => {
    const lastId = getLastActiveLectureId();
    if (lastId) {
      const found = SAMPLE_LECTURES.find((l) => l.id === lastId);
      if (found) return found;
    }
    return SAMPLE_LECTURES[0];
  }, []);

  const [currentLecture, setCurrentLecture] = useState<LectureSession>(initialLecture);

  // Restore saved playback position for this lecture session
  const [currentMs, setCurrentMs] = useState<number>(() => {
    const saved = getPlaybackProgress(initialLecture.id);
    if (saved && saved.currentMs > 1000 && saved.currentMs < initialLecture.durationMs - 1000) {
      return saved.currentMs;
    }
    return 0;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(() => {
    const saved = getPlaybackProgress(initialLecture.id);
    return saved?.playbackRate || 1.0;
  });
  const [socraticQuery, setSocraticQuery] = useState<string | undefined>(undefined);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState<boolean>(false);
  const [showCoursePicker, setShowCoursePicker] = useState<boolean>(false);
  const [showNpuSheet, setShowNpuSheet] = useState<boolean>(false);

  // Phone Frame Simulator toggle (false by default so everything fits the screen!)
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);

  // NPU Telemetry state
  const [npuMetrics, setNpuMetrics] = useState<NpuMetrics>({
    mode: 'on_device_npu',
    chipset: 'Qualcomm Hexagon NPU / MediaTek APU 790',
    latencyMs: 140,
    powerConsumptionWatts: 1.2,
    audioDataTransmittedKb: 0,
    offlineStatus: true,
    opsPerSecondTops: 45,
  });

  // Setup audio engine duration and callbacks, seeking to restored position on initial load
  useEffect(() => {
    audioEngine.setDuration(currentLecture.durationMs);
    audioEngine.setPlaybackRate(playbackRate);
    audioEngine.setCallbacks(
      (ms) => setCurrentMs(ms),
      (playing) => setIsPlaying(playing)
    );

    // If starting with a restored non-zero timestamp, seek the audioEngine
    const saved = getPlaybackProgress(currentLecture.id);
    if (saved && saved.currentMs > 1000 && saved.currentMs < currentLecture.durationMs - 1000) {
      audioEngine.seek(saved.currentMs);
    }
  }, [currentLecture.id]);

  // Continuously persist playback progress (throttled during playback, instant on pause/seek)
  const lastSaveRef = React.useRef<number>(0);
  useEffect(() => {
    const now = Date.now();
    if (!isPlaying || now - lastSaveRef.current > 1200) {
      lastSaveRef.current = now;
      savePlaybackProgress({
        lectureId: currentLecture.id,
        currentMs,
        durationMs: currentLecture.durationMs,
        playbackRate,
      });
      setLastActiveLectureId(currentLecture.id);
    }
  }, [currentMs, isPlaying, currentLecture.id, currentLecture.durationMs, playbackRate]);

  // Persist on tab close / reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      savePlaybackProgress({
        lectureId: currentLecture.id,
        currentMs,
        durationMs: currentLecture.durationMs,
        playbackRate,
      });
      setLastActiveLectureId(currentLecture.id);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentLecture.id, currentLecture.durationMs, currentMs, playbackRate]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      audioEngine.pause();
    };
  }, []);

  const handleSeek = (targetMs: number) => {
    setCurrentMs(targetMs);
    audioEngine.seek(targetMs);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
  };

  const handleWordClick = (startMs: number) => {
    handleSeek(startMs);
  };

  const handleAskSocratic = (conceptName: string) => {
    setSocraticQuery(`Can you guide me through ${conceptName} from the lecture step-by-step?`);
    setActiveView('tutor');
    setStudioRightPanel('tutor');
    setMobileTab('tutor');
  };

  const handleSelectMisspeak = (misspeak: MisspeakAlert) => {
    handleSeek(misspeak.timestampMs);
    setActiveView('assess');
    setStudioRightPanel('assess');
    setMobileTab('assess');
  };

  const handleToggleNpuMode = () => {
    if (npuMetrics.mode === 'on_device_npu') {
      setNpuMetrics({
        mode: 'cloud_transcriber',
        chipset: 'Remote Server Farm (AWS us-east-1)',
        latencyMs: 880,
        powerConsumptionWatts: 8.4,
        audioDataTransmittedKb: 45200,
        offlineStatus: false,
        opsPerSecondTops: 0,
      });
    } else {
      setNpuMetrics({
        mode: 'on_device_npu',
        chipset: 'Qualcomm Hexagon NPU / MediaTek APU 790',
        latencyMs: 140,
        powerConsumptionWatts: 1.2,
        audioDataTransmittedKb: 0,
        offlineStatus: true,
        opsPerSecondTops: 45,
      });
    }
  };

  return (
    <div className={`h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 flex flex-col font-sans select-none ${deviceFrameMode ? 'p-2 sm:p-6 bg-slate-900 items-center justify-center' : ''}`}>
      {/* Outer framing wrapper: either full-bleed or phone simulator */}
      <div 
        className={`w-full h-full flex flex-col bg-white overflow-hidden transition-all duration-200 ${
          deviceFrameMode 
            ? 'max-w-[430px] max-h-[890px] rounded-[44px] border-[10px] border-slate-800 ring-1 ring-slate-700 shadow-2xl' 
            : 'border-0'
        }`}
      >
        {/* Phone Frame Status Bar (Only visible when Phone Frame simulator is active) */}
        {deviceFrameMode && (
          <div className="bg-slate-900 text-white px-5 pt-3 pb-1.5 flex items-center justify-between text-xs shrink-0 select-none">
            <div className="flex items-center space-x-1.5 font-semibold text-xs tracking-tight">
              <span>9:41</span>
              <span className="text-[10px] text-indigo-400 font-mono">• iQOO 5G</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-800 px-3 py-1 rounded-full text-[10px] text-slate-300 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>NPU 140ms</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Wifi className="w-3.5 h-3.5 text-slate-200" />
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <span>98%</span>
                <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              </div>
            </div>
          </div>
        )}

        {/* 1. Main Navigation Header Bar */}
        <header className="bg-white border-b border-slate-200 px-3 sm:px-5 py-2 sm:py-2.5 shrink-0 z-30 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Brand Identity & Active Course Badge */}
            <div className="flex items-center space-x-3 min-w-0">
              <div className="flex items-center space-x-2 shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 shadow-xs flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                      Scribo<span className="text-indigo-600">AI</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                      NPU
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 hidden xs:block font-medium leading-none mt-0.5">
                    On-Device Classroom Copilot
                  </p>
                </div>
              </div>

              {/* Course Selector Dropdown Button */}
              <button
                type="button"
                onClick={() => setShowCoursePicker(true)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 sm:py-1.5 text-left cursor-pointer transition-colors max-w-[200px] sm:max-w-[280px] md:max-w-[340px]"
                title="Switch active lecture session"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-xs text-indigo-950">{currentLecture.courseCode}: </span>
                  <span className="text-xs text-slate-700 font-medium truncate">{currentLecture.title}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
              </button>
            </div>

            {/* Center: Desktop Navigation Bar Switcher (Hidden in phone simulation mode) */}
            {!deviceFrameMode && (
              <nav className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveView('studio')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeView === 'studio'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Side-by-side Dual Column Studio Workspace"
                >
                  <Columns className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Studio Workspace</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('audio')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeView === 'audio'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Dedicated Audio Player & Transcript View"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Audio & Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('assess')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeView === 'assess'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Dual-Layer Assessment Engine & Auto-Summarizer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Assess & Summarize</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('tutor')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeView === 'tutor'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="AI Socratic Voice & Text Tutor"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Tutor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('skills')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeView === 'skills'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Syllabus Skill Graph & Visual Synthesis"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Skills</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('ops')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeView === 'ops'
                      ? 'bg-white text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Classroom Operations, Attendance & Digests"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Class Ops</span>
                </button>
              </nav>
            )}

            {/* Right: Quick Action Controls */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* Pitch Deck Vision Button */}
              <button
                type="button"
                onClick={() => setIsPitchModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="View Pitch Deck Presentation"
              >
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Pitch Deck</span>
              </button>

              {/* On-Device NPU Chip Status */}
              <button
                type="button"
                onClick={() => setShowNpuSheet(true)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="View On-Device NPU Telemetry"
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono text-[11px] font-bold">140ms</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden xs:inline" />
              </button>

              {/* Phone Frame Simulator Toggle Button */}
              <button
                type="button"
                onClick={() => setDeviceFrameMode(!deviceFrameMode)}
                className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  deviceFrameMode 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title={deviceFrameMode ? "Switch to Full Screen Workspace" : "Switch to Mobile Phone Simulator View"}
              >
                {deviceFrameMode ? (
                  <Maximize2 className="w-3.5 h-3.5" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5" />
                )}
                <span className="hidden md:inline text-[11px]">
                  {deviceFrameMode ? 'Full Screen' : 'Phone Mode'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Global Visual Progress Bar beneath Navigation Header */}
        <HeaderProgressBar
          lecture={currentLecture}
          currentMs={currentMs}
          isPlaying={isPlaying}
          onSeek={handleSeek}
          onTogglePlay={handleTogglePlay}
          onSelectMisspeak={handleSelectMisspeak}
        />

        {/* Responsive Mobile / Tablet View Switcher Bar (visible when width < lg and not in phone simulator) */}
        {!deviceFrameMode && (
          <div className="lg:hidden flex items-center space-x-1.5 overflow-x-auto px-3 py-2 bg-white border-b border-slate-200 shrink-0 text-xs shadow-2xs scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveView('studio')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'studio'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('audio')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'audio'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Audio & Notes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('assess')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'assess'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Assess</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('tutor')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'tutor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Tutor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('skills')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'skills'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Skills</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('ops')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'ops'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Ops</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('vision')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'vision'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Vision</span>
            </button>
          </div>
        )}

        {/* 2. Main Content Area */}
        <main className="flex-1 min-h-0 bg-slate-100/70 p-2 sm:p-3 md:p-4 overflow-hidden flex flex-col">
          {/* ========================================================= */}
          {/* DESKTOP FULL-SCREEN STUDIO WORKSPACE (Default Mode) */}
          {/* ========================================================= */}
          {!deviceFrameMode && activeView === 'studio' && (
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 md:gap-4 h-full min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
              {/* Left Column (col-span-7): Audio Scrubber Player + Interactive Transcript View */}
              <div className="w-full lg:col-span-7 flex flex-col h-auto min-h-[580px] lg:min-h-0 lg:h-full gap-3 shrink-0 lg:shrink lg:overflow-hidden">
                {/* Audio Scrubber Player Component */}
                <div className="shrink-0">
                  <AudioScrubberPlayer
                    lecture={currentLecture}
                    currentMs={currentMs}
                    isPlaying={isPlaying}
                    onSeek={handleSeek}
                    onTogglePlay={handleTogglePlay}
                    onSelectMisspeak={handleSelectMisspeak}
                  />
                </div>

                {/* Interactive Word-Synced Transcript + Split Quick Notes Component */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <TranscriptView
                    lecture={currentLecture}
                    currentMs={currentMs}
                    isPlaying={isPlaying}
                    onWordClick={handleWordClick}
                    onAskSocraticAboutWord={handleAskSocratic}
                    onSelectMisspeak={handleSelectMisspeak}
                  />
                </div>
              </div>

              {/* Right Column (col-span-5): Dual-Layer Assessment Engine, Auto-Summarizer, Tutor, Skills */}
              <div className="w-full lg:col-span-5 flex flex-col h-auto min-h-[580px] lg:min-h-0 lg:h-full gap-2.5 shrink-0 lg:shrink lg:overflow-hidden pb-4 lg:pb-0">
                {/* Right Panel Sub-tab Selector */}
                <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Studio Co-Pilot
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setStudioRightPanel('assess')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        studioRightPanel === 'assess'
                          ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Assess & Summarize
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudioRightPanel('tutor')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        studioRightPanel === 'tutor'
                          ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      AI Tutor
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudioRightPanel('skills')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        studioRightPanel === 'skills'
                          ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Skills
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudioRightPanel('ops')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        studioRightPanel === 'ops'
                          ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Ops
                    </button>
                  </div>
                </div>

                {/* Right Panel Body */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  {studioRightPanel === 'assess' && (
                    <AssessmentEngine
                      lecture={currentLecture}
                      currentMs={currentMs}
                      onJumpToTimestamp={handleSeek}
                    />
                  )}
                  {studioRightPanel === 'tutor' && (
                    <SocraticTutorWidget
                      lecture={currentLecture}
                      currentMs={currentMs}
                      initialQuery={socraticQuery}
                      onClearInitialQuery={() => setSocraticQuery(undefined)}
                    />
                  )}
                  {studioRightPanel === 'skills' && (
                    <VisualSkillSynthesis
                      lecture={currentLecture}
                      onSelectConcept={handleAskSocratic}
                    />
                  )}
                  {studioRightPanel === 'ops' && (
                    <ClassroomOperations
                      lecture={currentLecture}
                      onJumpToLectureTime={handleSeek}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FOCUSED DESKTOP VIEWS (Audio, Assess, Tutor, Skills, Ops) */}
          {/* ========================================================= */}
          {!deviceFrameMode && activeView === 'audio' && (
            <div className="max-w-7xl mx-auto w-full h-full min-h-0 flex flex-col gap-3 overflow-hidden">
              <div className="shrink-0">
                <AudioScrubberPlayer
                  lecture={currentLecture}
                  currentMs={currentMs}
                  isPlaying={isPlaying}
                  onSeek={handleSeek}
                  onTogglePlay={handleTogglePlay}
                  onSelectMisspeak={handleSelectMisspeak}
                />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <TranscriptView
                  lecture={currentLecture}
                  currentMs={currentMs}
                  isPlaying={isPlaying}
                  onWordClick={handleWordClick}
                  onAskSocraticAboutWord={handleAskSocratic}
                  onSelectMisspeak={handleSelectMisspeak}
                />
              </div>
            </div>
          )}

          {!deviceFrameMode && activeView === 'assess' && (
            <div className="max-w-5xl mx-auto w-full h-full min-h-0 flex flex-col overflow-hidden">
              <AssessmentEngine
                lecture={currentLecture}
                currentMs={currentMs}
                onJumpToTimestamp={handleSeek}
              />
            </div>
          )}

          {!deviceFrameMode && activeView === 'tutor' && (
            <div className="max-w-4xl mx-auto w-full h-full min-h-0 flex flex-col overflow-hidden">
              <SocraticTutorWidget
                lecture={currentLecture}
                currentMs={currentMs}
                initialQuery={socraticQuery}
                onClearInitialQuery={() => setSocraticQuery(undefined)}
              />
            </div>
          )}

          {!deviceFrameMode && activeView === 'skills' && (
            <div className="max-w-6xl mx-auto w-full h-full min-h-0 flex flex-col overflow-hidden">
              <VisualSkillSynthesis
                lecture={currentLecture}
                onSelectConcept={handleAskSocratic}
              />
            </div>
          )}

          {!deviceFrameMode && activeView === 'ops' && (
            <div className="max-w-5xl mx-auto w-full h-full min-h-0 flex flex-col overflow-hidden">
              <ClassroomOperations
                lecture={currentLecture}
                onJumpToLectureTime={handleSeek}
              />
            </div>
          )}

          {!deviceFrameMode && activeView === 'vision' && (
            <div className="max-w-5xl mx-auto w-full h-full min-h-0 flex flex-col overflow-y-auto">
              <CompetitiveAdvantageView />
            </div>
          )}

          {/* ========================================================= */}
          {/* MOBILE PHONE SIMULATION OR SMALL SCREEN LAYOUT */}
          {/* ========================================================= */}
          {deviceFrameMode && (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
              {/* Scrollable Mobile Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
                {mobileTab === 'audio' && (
                  <div className="space-y-3">
                    <AudioScrubberPlayer
                      lecture={currentLecture}
                      currentMs={currentMs}
                      isPlaying={isPlaying}
                      onSeek={handleSeek}
                      onTogglePlay={handleTogglePlay}
                      onSelectMisspeak={handleSelectMisspeak}
                    />
                    <div className="h-[520px]">
                      <TranscriptView
                        lecture={currentLecture}
                        currentMs={currentMs}
                        isPlaying={isPlaying}
                        onWordClick={handleWordClick}
                        onAskSocraticAboutWord={handleAskSocratic}
                        onSelectMisspeak={handleSelectMisspeak}
                      />
                    </div>
                  </div>
                )}

                {mobileTab === 'assess' && (
                  <div className="space-y-3">
                    <AssessmentEngine
                      lecture={currentLecture}
                      currentMs={currentMs}
                      onJumpToTimestamp={(ms) => {
                        handleSeek(ms);
                        setMobileTab('audio');
                      }}
                    />
                  </div>
                )}

                {mobileTab === 'tutor' && (
                  <div className="space-y-3">
                    <SocraticTutorWidget
                      lecture={currentLecture}
                      currentMs={currentMs}
                      initialQuery={socraticQuery}
                      onClearInitialQuery={() => setSocraticQuery(undefined)}
                    />
                  </div>
                )}

                {mobileTab === 'skills' && (
                  <div className="space-y-3">
                    <VisualSkillSynthesis
                      lecture={currentLecture}
                      onSelectConcept={handleAskSocratic}
                    />
                  </div>
                )}

                {mobileTab === 'ops' && (
                  <div className="space-y-3">
                    <ClassroomOperations
                      lecture={currentLecture}
                      onJumpToLectureTime={(ms) => {
                        handleSeek(ms);
                        setMobileTab('audio');
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Floating Mini Player on other tabs */}
              {mobileTab !== 'audio' && (
                <div className="sticky bottom-16 w-full z-30 px-2">
                  <MobileMiniPlayer
                    lecture={currentLecture}
                    currentMs={currentMs}
                    isPlaying={isPlaying}
                    onTogglePlay={handleTogglePlay}
                    onExpand={() => setMobileTab('audio')}
                    onSeek={handleSeek}
                    playbackRate={playbackRate}
                  />
                </div>
              )}

              {/* Bottom Mobile Navigation Bar */}
              <nav className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shrink-0 z-40 shadow-lg mt-auto">
                <div className="grid grid-cols-5 gap-1">
                  <button
                    type="button"
                    onClick={() => setMobileTab('audio')}
                    className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl min-h-[44px] transition-all cursor-pointer ${
                      mobileTab === 'audio'
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Headphones className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px]">Audio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileTab('assess')}
                    className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl min-h-[44px] transition-all cursor-pointer ${
                      mobileTab === 'assess'
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileCheck className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px]">Assess</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileTab('tutor')}
                    className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl min-h-[44px] transition-all cursor-pointer ${
                      mobileTab === 'tutor'
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Bot className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px]">Tutor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileTab('skills')}
                    className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl min-h-[44px] transition-all cursor-pointer ${
                      mobileTab === 'skills'
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <GitBranch className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px]">Skills</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileTab('ops')}
                    className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl min-h-[44px] transition-all cursor-pointer ${
                      mobileTab === 'ops'
                        ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Activity className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px]">Ops</span>
                  </button>
                </div>

                <div className="w-24 h-1 bg-slate-300 rounded-full mx-auto mt-1 pointer-events-none" />
              </nav>
            </div>
          )}
        </main>

        {/* Course Picker Modal */}
        {showCoursePicker && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-5 space-y-3 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Switch Lecture Session
                  </span>
                </div>
                <button
                  onClick={() => setShowCoursePicker(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {SAMPLE_LECTURES.map((lec) => {
                  const isCurrent = lec.id === currentLecture.id;
                  const savedProgress = getPlaybackProgress(lec.id);
                  const hasSavedResume = savedProgress && savedProgress.currentMs > 1000;
                  return (
                    <button
                      key={lec.id}
                      onClick={() => {
                        // Persist current lecture playback before switching
                        savePlaybackProgress({
                          lectureId: currentLecture.id,
                          currentMs,
                          durationMs: currentLecture.durationMs,
                          playbackRate,
                        });

                        audioEngine.pause();
                        setCurrentLecture(lec);
                        setLastActiveLectureId(lec.id);

                        const resume = getPlaybackProgress(lec.id);
                        const targetMs = (resume && resume.currentMs > 1000 && resume.currentMs < lec.durationMs - 1000)
                          ? resume.currentMs
                          : 0;

                        setCurrentMs(targetMs);
                        audioEngine.setDuration(lec.durationMs);
                        audioEngine.seek(targetMs);
                        setShowCoursePicker(false);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-indigo-700">{lec.courseCode}</span>
                        <div className="flex items-center gap-1.5">
                          {hasSavedResume && (
                            <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Resumes {Math.floor(savedProgress.currentMs / 60000)}:{(Math.floor((savedProgress.currentMs % 60000) / 1000)).toString().padStart(2, '0')}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">{lec.date}</span>
                        </div>
                      </div>
                      <div className="text-xs font-bold mt-1 text-slate-900">{lec.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{lec.instructor}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* NPU Architecture Telemetry Sheet Modal */}
        {showNpuSheet && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-5 space-y-3 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">
                    On-Device NPU Engine Telemetry
                  </span>
                </div>
                <button
                  onClick={() => setShowNpuSheet(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Active Pipeline:</span>
                  <span className="font-bold text-indigo-700">
                    {npuMetrics.mode === 'on_device_npu' ? 'Offline On-Device NPU' : 'Remote Cloud Server'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Hardware Accelerator:</span>
                  <span className="font-mono text-[11px] text-slate-800">{npuMetrics.chipset}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">End-to-End Latency:</span>
                  <span className="font-bold text-emerald-700 font-mono">{npuMetrics.latencyMs}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Power Profile:</span>
                  <span className="font-bold text-slate-800 font-mono">{npuMetrics.powerConsumptionWatts}W (Ultra-Low)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Cloud Data Leaked:</span>
                  <span className="font-bold text-emerald-700 font-mono">{npuMetrics.audioDataTransmittedKb} KB (Zero egress)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleNpuMode}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Toggle Mode (Current: {npuMetrics.mode === 'on_device_npu' ? 'NPU Offline' : 'Cloud Remote'})
              </button>
            </div>
          </div>
        )}

        {/* Pitch Deck Vision Modal */}
        <PitchDeckModal
          isOpen={isPitchModalOpen}
          onClose={() => setIsPitchModalOpen(false)}
        />
      </div>
    </div>
  );
}

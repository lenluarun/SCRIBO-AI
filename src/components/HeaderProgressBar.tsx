import React, { useState, useRef, useCallback } from 'react';
import { 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  Play, 
  Pause, 
  CheckCircle2, 
  Volume2
} from 'lucide-react';
import { LectureSession, MisspeakAlert, LectureSection } from '../types';

interface HeaderProgressBarProps {
  lecture: LectureSession;
  currentMs: number;
  isPlaying: boolean;
  onSeek: (ms: number) => void;
  onTogglePlay?: () => void;
  onSelectMisspeak?: (misspeak: MisspeakAlert) => void;
}

export const HeaderProgressBar: React.FC<HeaderProgressBarProps> = ({
  lecture,
  currentMs,
  isPlaying,
  onSeek,
  onTogglePlay,
  onSelectMisspeak,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [hoverMs, setHoverMs] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number>(0);
  const [hoverXPos, setHoverXPos] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const durationMs = lecture.durationMs > 0 ? lecture.durationMs : 72000;
  const progressPercent = Math.min(100, Math.max(0, (currentMs / durationMs) * 100));

  // Current active section
  const activeSection: LectureSection | undefined = lecture.sections?.find(
    (s) => currentMs >= s.startMs && currentMs < s.endMs
  ) || lecture.sections?.[lecture.sections.length - 1];

  // Section hovered over
  const hoveredSection: LectureSection | undefined = hoverMs !== null && lecture.sections
    ? lecture.sections.find((s) => hoverMs >= s.startMs && hoverMs < s.endMs)
    : undefined;

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateMsFromClientX = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const pct = relativeX / rect.width;
    return Math.round(pct * durationMs);
  }, [durationMs]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = (relativeX / rect.width) * 100;
    const targetMs = Math.round((pct / 100) * durationMs);
    
    setIsHovering(true);
    setHoverXPos(relativeX);
    setHoverPercent(pct);
    setHoverMs(targetMs);

    if (isDragging) {
      onSeek(targetMs);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setIsHovering(false);
      setHoverMs(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const targetMs = calculateMsFromClientX(e.clientX);
    onSeek(targetMs);

    const handleGlobalMouseMove = (moveEvent: MouseEvent) => {
      const ms = calculateMsFromClientX(moveEvent.clientX);
      onSeek(ms);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsHovering(false);
      setHoverMs(null);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    const targetMs = calculateMsFromClientX(e.touches[0].clientX);
    onSeek(targetMs);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const targetMs = calculateMsFromClientX(e.touches[0].clientX);
    onSeek(targetMs);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSeek(Math.min(durationMs, currentMs + 5000));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSeek(Math.max(0, currentMs - 5000));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onSeek(durationMs);
    } else if (e.key === ' ' && onTogglePlay) {
      e.preventDefault();
      onTogglePlay();
    }
  };

  return (
    <div 
      id="lecture-reading-progress-header"
      className="relative bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-3 sm:px-5 py-1.5 shrink-0 z-20 select-none transition-colors"
    >
      {/* Top Meta Line: Active Section, Reading State, Elapsed/Total & % */}
      <div className="flex items-center justify-between gap-2 text-[11px] mb-1.5 leading-none">
        {/* Left: Section Indicator & Playback State */}
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex items-center space-x-1.5 shrink-0">
            {onTogglePlay ? (
              <button
                type="button"
                onClick={onTogglePlay}
                className="w-5 h-5 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
                title={isPlaying ? 'Pause lecture (Space)' : 'Play lecture (Space)'}
              >
                {isPlaying ? (
                  <Pause className="w-2.5 h-2.5 fill-current text-indigo-600" />
                ) : (
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5 text-slate-600" />
                )}
              </button>
            ) : (
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            )}

            <span className="font-semibold text-slate-700 hidden xs:inline flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>Lecture Progress:</span>
            </span>
          </div>

          {/* Active section title */}
          {activeSection ? (
            <div className="flex items-center space-x-1 truncate text-slate-600">
              <span className="text-slate-300 hidden sm:inline">•</span>
              <BookOpen className="w-3 h-3 text-slate-400 shrink-0 hidden sm:inline" />
              <span className="truncate font-medium text-slate-700 hover:text-indigo-600 transition-colors" title={activeSection.title}>
                {activeSection.title}
              </span>
            </div>
          ) : (
            <span className="truncate font-medium text-slate-500">
              {lecture.title}
            </span>
          )}
        </div>

        {/* Right: Timestamp and % Completion */}
        <div className="flex items-center space-x-2 shrink-0 font-mono text-[11px]">
          <div className="flex items-center space-x-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80 text-slate-700">
            <span className="font-bold text-indigo-900">{formatTime(currentMs)}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">{formatTime(durationMs)}</span>
          </div>

          <div 
            className="flex items-center space-x-1 bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded-md border border-indigo-200/60 text-[10px]"
            title={`${progressPercent.toFixed(1)}% of lecture completed`}
          >
            {progressPercent >= 99 ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : null}
            <span>{progressPercent.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Visual Interactive Progress Bar Track */}
      <div
        ref={trackRef}
        role="progressbar"
        tabIndex={0}
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Lecture reading and playback progress"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        className="relative h-2 sm:h-2.5 w-full bg-slate-200/85 hover:bg-slate-200 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all duration-150 group overflow-visible"
        title="Click or drag to scrub reading progress"
      >
        {/* Section divider lines across the track */}
        {lecture.sections && lecture.sections.length > 1 && (
          <div className="absolute inset-0 pointer-events-none z-10 flex">
            {lecture.sections.map((section, idx) => {
              if (idx === 0) return null;
              const sectionLeftPercent = (section.startMs / durationMs) * 100;
              return (
                <div
                  key={section.id}
                  className="absolute top-0 bottom-0 w-[1.5px] bg-white/70 shadow-2xs"
                  style={{ left: `${sectionLeftPercent}%` }}
                  title={`Section starts: ${section.title} (${section.timeRangeFormatted})`}
                />
              );
            })}
          </div>
        )}

        {/* Misspeak alert markers across the timeline */}
        {lecture.misspeaks.map((m) => {
          const misspeakLeftPercent = Math.min(100, Math.max(0, (m.timestampMs / durationMs) * 100));
          return (
            <div
              key={m.id}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(m.timestampMs);
                if (onSelectMisspeak) onSelectMisspeak(m);
              }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400 border border-white shadow-xs z-20 hover:scale-150 transition-transform cursor-pointer"
              style={{ left: `${misspeakLeftPercent}%` }}
              title={`Flagged Correction at ${m.timeFormatted}: "${m.spokenQuote.slice(0, 35)}..." (Click to inspect)`}
            />
          );
        })}

        {/* Filled Progress Bar */}
        <div
          className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 rounded-full relative transition-all duration-75 shadow-xs overflow-hidden"
          style={{ width: `${progressPercent}%` }}
        >
          {/* Subtle animated shimmer if active playback is running */}
          {isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
          )}
        </div>

        {/* Leading Edge Thumb (Playhead pin) */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full border-2 border-indigo-600 shadow-md transition-transform duration-75 z-20 pointer-events-none ${
            isHovering || isDragging ? 'scale-125' : 'scale-90 sm:scale-100'
          }`}
          style={{ left: `${progressPercent}%` }}
        >
          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Hover Scrub Preview Cursor & Tooltip */}
        {isHovering && hoverMs !== null && (
          <>
            {/* Ghost vertical scrub line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-900/60 pointer-events-none z-25"
              style={{ left: `${hoverPercent}%` }}
            />

            {/* Floating Preview Tooltip */}
            <div
              className="absolute -top-10 -translate-x-1/2 pointer-events-none z-30 bg-slate-900 text-white text-[10px] sm:text-xs py-1 px-2 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 flex items-center space-x-1.5 animate-in fade-in zoom-in-95 duration-100"
              style={{ 
                left: `${Math.max(8, Math.min(92, hoverPercent))}%` 
              }}
            >
              <span className="font-mono font-bold text-indigo-300">
                {formatTime(hoverMs)}
              </span>
              {hoveredSection && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-200 max-w-[160px] sm:max-w-[220px] truncate">
                    {hoveredSection.title}
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

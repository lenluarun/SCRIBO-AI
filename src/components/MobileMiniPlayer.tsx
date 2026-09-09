import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  ChevronUp, 
  Radio, 
  Gauge, 
  AlertTriangle 
} from 'lucide-react';
import { LectureSession } from '../types';

interface MobileMiniPlayerProps {
  lecture: LectureSession;
  currentMs: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onExpand: () => void;
  onSeek: (ms: number) => void;
  playbackRate: number;
}

export const MobileMiniPlayer: React.FC<MobileMiniPlayerProps> = ({
  lecture,
  currentMs,
  isPlaying,
  onTogglePlay,
  onExpand,
  onSeek,
  playbackRate,
}) => {
  const durationMs = lecture.durationMs || 72000;
  const progressPercent = Math.min(100, Math.max(0, (currentMs / durationMs) * 100));

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-3 py-2 flex flex-col z-30 transition-all">
      {/* Progress Line */}
      <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mb-2 relative">
        <div 
          className="bg-indigo-600 h-full transition-all duration-100" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        {/* Left: Tappable Info Area (Expands Full Player) */}
        <button
          type="button"
          onClick={onExpand}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer group"
          title="Tap to expand full audio player"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 text-indigo-700 group-hover:bg-indigo-100 transition-colors">
            {isPlaying ? (
              <span className="flex items-end gap-0.5 h-3.5">
                <span className="w-0.5 h-3.5 bg-indigo-600 rounded-full animate-bounce" />
                <span className="w-0.5 h-2 bg-indigo-600 rounded-full animate-bounce delay-100" />
                <span className="w-0.5 h-3 bg-indigo-600 rounded-full animate-bounce delay-200" />
              </span>
            ) : (
              <Radio className="w-4 h-4 text-indigo-600" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-slate-900 truncate">
                {lecture.courseCode}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">
                {playbackRate}x
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <span>{formatTime(currentMs)}</span>
              <span>/</span>
              <span>{formatTime(durationMs)}</span>
            </div>
          </div>

          <div className="px-2 py-1 rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-600 text-[10px] font-semibold flex items-center gap-1 shrink-0">
            <span>Expand</span>
            <ChevronUp className="w-3 h-3" />
          </div>
        </button>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onSeek(Math.max(0, currentMs - 5000))}
            className="w-8 h-8 rounded-lg bg-slate-100 active:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer text-xs font-mono font-bold"
            title="Rewind 5s"
          >
            -5s
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-xl bg-indigo-600 active:bg-indigo-700 text-white flex items-center justify-center shadow-xs cursor-pointer ml-0.5"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => onSeek(Math.min(durationMs, currentMs + 5000))}
            className="w-8 h-8 rounded-lg bg-slate-100 active:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer text-xs font-mono font-bold"
            title="Forward 5s"
          >
            +5s
          </button>
        </div>
      </div>
    </div>
  );
};

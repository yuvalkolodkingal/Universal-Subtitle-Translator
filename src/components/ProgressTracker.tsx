import React from 'react';
import { Play, Pause, Square, Zap, Terminal } from 'lucide-react';

interface ProgressTrackerProps {
  total: number;
  current: number;
  logs: string[];
  isTranslating: boolean;
  onStart: () => void;
  onPause: () => void;
  onCancel: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  total,
  current,
  logs,
  isTranslating,
  onStart,
  onPause,
  onCancel
}) => {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-500 animate-pulse" />
          <h2 className="text-slate-200 font-mono text-sm uppercase tracking-wider font-bold">Execution & Progress Engine</h2>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-900/50 text-emerald-400">
          {percent}%
        </span>
      </div>

      {/* Control Actions */}
      <div className="flex flex-wrap gap-4">
        {!isTranslating ? (
          <button
            onClick={onStart}
            disabled={current === total && total > 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded bg-emerald-950 border border-emerald-900/50 hover:bg-emerald-900 text-emerald-300 transition-all font-mono text-xs uppercase disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> Start translation
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex items-center gap-2 px-5 py-2.5 rounded bg-amber-950 border border-amber-900/50 hover:bg-amber-900 text-amber-300 transition-all font-mono text-xs uppercase"
          >
            <Pause className="w-4 h-4" /> Pause process
          </button>
        )}
        {total > 0 && (
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 transition-all font-mono text-xs uppercase"
          >
            <Square className="w-4 h-4" /> Cancel/Reset
          </button>
        )}
      </div>

      {/* Progress Bars */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-mono text-slate-500">
          <span>Completed Blocks</span>
          <span>{current} / {total}</span>
        </div>
        <div className="w-full h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Terminal logs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5" />
          <span>Internal Translation Console</span>
        </div>
        <div className="bg-slate-950 border border-slate-900 rounded p-4 h-32 overflow-y-auto font-mono text-[11px] text-emerald-500/80 flex flex-col gap-1 select-none">
          {logs.map((log, idx) => (
            <p key={idx}>{log}</p>
          ))}
          {logs.length === 0 && <p className="text-slate-600">Engine idle. Awaiting command initiation...</p>}
        </div>
      </div>
    </div>
  );
};

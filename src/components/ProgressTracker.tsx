import React, { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';

interface ProgressTrackerProps {
  total: number;
  current: number;
  logs: string[];
  isTranslating: boolean;
  targetLabel: string;
  onStart: () => void;
  onPause: () => void;
  onCancel: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  total,
  current,
  logs,
  isTranslating,
  targetLabel,
  onStart,
  onPause,
  onCancel,
}) => {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  const done = total > 0 && current === total;
  const started = current > 0 || isTranslating;
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const status = done
    ? 'Finished'
    : isTranslating
      ? `Translating to ${targetLabel}…`
      : started
        ? 'Paused'
        : `Ready to translate to ${targetLabel}`;

  return (
    <section className="rounded-xl border border-border bg-surface shadow-panel">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Translation</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
            {done && <Check className="h-3.5 w-3.5 text-success" />}
            {status}
          </p>
        </div>
        <span className="font-mono text-2xl font-medium tabular-nums text-ink">{percent}%</span>
      </div>

      <div className="space-y-5 px-5 py-5">
        {/* Progress bar */}
        <div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-300 ease-out-quart ${done ? 'bg-success' : 'bg-accent'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-xs tabular-nums text-faint">
            {current} of {total} blocks
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {done ? (
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-all duration-150 hover:bg-surface-2 active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              Start over
            </button>
          ) : (
            <>
              {!isTranslating ? (
                <button
                  onClick={onStart}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-all duration-150 hover:bg-accent-hover active:scale-[0.98]"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {started ? 'Resume' : 'Start translating'}
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-all duration-150 hover:bg-surface-2 active:scale-[0.98]"
                >
                  <Pause className="h-4 w-4 fill-current" />
                  Pause
                </button>
              )}
              {started && !isTranslating && (
                <button
                  onClick={onCancel}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              )}
            </>
          )}
        </div>

        {/* Activity log */}
        {logs.length > 0 && (
          <div
            ref={logRef}
            className="max-h-28 overflow-y-auto rounded-lg border border-border bg-surface-2 px-3.5 py-3 font-mono text-xs leading-relaxed text-muted"
          >
            {logs.map((log, i) => (
              <p key={i} className={i === logs.length - 1 ? 'text-ink' : undefined}>
                {log}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

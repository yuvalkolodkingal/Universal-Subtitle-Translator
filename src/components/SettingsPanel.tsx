import React from 'react';
import { SUPPORTED_LANGUAGES } from '../utils/translator';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';

interface SettingsPanelProps {
  sourceLang: string;
  targetLang: string;
  chunkSize: number;
  delay: number;
  onChangeSource: (val: string) => void;
  onChangeTarget: (val: string) => void;
  onChangeChunkSize: (val: number) => void;
  onChangeDelay: (val: number) => void;
  onSwap: () => void;
  disabled: boolean;
}

const Select: React.FC<{
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
  omitAuto?: boolean;
}> = ({ id, label, value, disabled, onChange, omitAuto }) => (
  <div className="flex-1">
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-muted">
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-border bg-surface py-2.5 pl-3.5 pr-9 text-sm text-ink transition-colors duration-150 hover:border-border-strong focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-55"
      >
        {Object.entries(SUPPORTED_LANGUAGES)
          .filter(([code]) => !(omitAuto && code === 'auto'))
          .map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
    </div>
  </div>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  sourceLang,
  targetLang,
  chunkSize,
  delay,
  onChangeSource,
  onChangeTarget,
  onChangeChunkSize,
  onChangeDelay,
  onSwap,
  disabled,
}) => {
  return (
    <section className="rounded-xl border border-border bg-surface shadow-panel">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-[15px] font-semibold text-ink">Languages</h2>
        <p className="mt-0.5 text-sm text-muted">Pick what you have and what you want.</p>
      </div>

      <div className="px-5 py-5">
        <div className="flex items-end gap-2">
          <Select id="src" label="From" value={sourceLang} disabled={disabled} onChange={onChangeSource} />
          <button
            onClick={onSwap}
            disabled={disabled || sourceLang === 'auto'}
            title={sourceLang === 'auto' ? 'Set a source language to swap' : 'Swap languages'}
            aria-label="Swap source and target languages"
            className="mb-0.5 flex h-[42px] w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted transition-colors duration-150 hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <Select id="tgt" label="To" value={targetLang} disabled={disabled} onChange={onChangeTarget} omitAuto />
        </div>

        <details className="group mt-5">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink">
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
            Speed &amp; rate limits
          </summary>

          <div className="mt-4 space-y-5">
            <Slider
              label="Batch size"
              hint="Larger batches finish faster; smaller ones survive picky engines."
              value={chunkSize}
              min={1000}
              max={4500}
              step={100}
              disabled={disabled}
              display={`${chunkSize.toLocaleString()} chars`}
              onChange={onChangeChunkSize}
            />
            <Slider
              label="Pause between batches"
              hint="More pause avoids rate limits on large files."
              value={delay}
              min={0.2}
              max={5}
              step={0.1}
              disabled={disabled}
              display={`${delay.toFixed(1)}s`}
              onChange={onChangeDelay}
            />
          </div>
        </details>
      </div>
    </section>
  );
};

const Slider: React.FC<{
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  disabled: boolean;
  onChange: (v: number) => void;
}> = ({ label, hint, value, min, max, step, display, disabled, onChange }) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between">
      <label className="text-sm font-medium text-ink">{label}</label>
      <span className="font-mono text-xs tabular-nums text-muted">{display}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-accent disabled:opacity-50"
    />
    <p className="mt-1.5 text-xs text-faint">{hint}</p>
  </div>
);

import React from 'react';
import { SUPPORTED_LANGUAGES } from '../utils/translator';
import { Settings } from 'lucide-react';

interface SettingsPanelProps {
  sourceLang: string;
  targetLang: string;
  chunkSize: number;
  delay: number;
  onChangeSource: (val: string) => void;
  onChangeTarget: (val: string) => void;
  onChangeChunkSize: (val: number) => void;
  onChangeDelay: (val: number) => void;
  disabled: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  sourceLang,
  targetLang,
  chunkSize,
  delay,
  onChangeSource,
  onChangeTarget,
  onChangeChunkSize,
  onChangeDelay,
  disabled
}) => {
  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-6 flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
        <Settings className="w-5 h-5 text-emerald-500" />
        <h2 className="text-slate-200 font-mono text-sm uppercase tracking-wider font-bold">Translation Engine Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Language */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Source Language</label>
          <select
            value={sourceLang}
            onChange={(e) => onChangeSource(e.target.value)}
            disabled={disabled}
            className="bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 font-sans"
          >
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Target Language */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Target Language</label>
          <select
            value={targetLang}
            onChange={(e) => onChangeTarget(e.target.value)}
            disabled={disabled}
            className="bg-slate-900 border border-slate-800 rounded px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 font-sans"
          >
            {Object.entries(SUPPORTED_LANGUAGES)
              .filter(([code]) => code !== 'auto')
              .map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Max Characters Chunk */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Chunk Size Limit</label>
            <span className="text-xs font-mono text-emerald-500">{chunkSize} chars</span>
          </div>
          <input
            type="range"
            min="1000"
            max="4500"
            step="100"
            value={chunkSize}
            onChange={(e) => onChangeChunkSize(parseInt(e.target.value, 10))}
            disabled={disabled}
            className="accent-emerald-500 bg-slate-800 rounded-lg appearance-none h-1 cursor-pointer disabled:opacity-50"
          />
          <p className="text-[10px] text-slate-500 font-mono">Higher bundles text, lower avoids engine splits</p>
        </div>

        {/* Delay Between Chunks */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">API Intermission Delay</label>
            <span className="text-xs font-mono text-emerald-500">{delay.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="5.0"
            step="0.1"
            value={delay}
            onChange={(e) => onChangeDelay(parseFloat(e.target.value))}
            disabled={disabled}
            className="accent-emerald-500 bg-slate-800 rounded-lg appearance-none h-1 cursor-pointer disabled:opacity-50"
          />
          <p className="text-[10px] text-slate-500 font-mono">Controls throttle limit to bypass block rate limits</p>
        </div>
      </div>
    </div>
  );
};

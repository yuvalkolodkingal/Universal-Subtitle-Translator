import React from 'react';
import { SubtitleBlock, stringifySRT } from '../utils/srtParser';
import { Download, CheckCircle } from 'lucide-react';

interface DownloaderProps {
  fileName: string;
  originalBlocks: SubtitleBlock[];
  translatedBlocks: { [key: number]: string[] };
}

export const Downloader: React.FC<DownloaderProps> = ({
  fileName,
  originalBlocks,
  translatedBlocks
}) => {
  const isComplete = originalBlocks.length > 0 && originalBlocks.every(b => !!translatedBlocks[b.index]);

  const handleDownload = () => {
    // Merge translated blocks back to output structures
    const finishedBlocks = originalBlocks.map(block => ({
      ...block,
      textLines: translatedBlocks[block.index] || block.textLines
    }));

    const srtContent = stringifySRT(finishedBlocks);
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Auto download payload
    const a = document.createElement('a');
    a.href = url;
    
    const parts = fileName.split('.');
    const ext = parts.pop();
    const baseName = parts.join('.');
    a.download = `${baseName}_translated.${ext}`;
    
    document.body.appendChild(a);
    a.click();
    
    // Clean-up context
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        {isComplete ? (
          <div className="p-2 bg-emerald-950/30 border border-emerald-900/50 rounded text-emerald-500">
            <CheckCircle className="w-6 h-6" />
          </div>
        ) : (
          <div className="p-2 bg-slate-900 border border-slate-800 rounded text-slate-500">
            <Download className="w-6 h-6 animate-bounce" />
          </div>
        )}
        <div>
          <h3 className="text-slate-200 font-mono text-xs uppercase tracking-wider font-bold">Package Assembly & Exporter</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {isComplete ? 'All segments ready for deployment' : 'Available for partial translation downloads'}
          </p>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={originalBlocks.length === 0}
        className="w-full sm:w-auto px-6 py-3 rounded bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-900 disabled:text-slate-700 disabled:border-transparent text-slate-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Download className="w-4 h-4" /> Download Translated SRT
      </button>
    </div>
  );
};

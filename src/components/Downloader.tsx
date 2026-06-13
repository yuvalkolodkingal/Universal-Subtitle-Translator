import React from 'react';
import { SubtitleBlock, stringifySRT } from '../utils/srtParser';
import { Download } from 'lucide-react';

interface DownloaderProps {
  fileName: string;
  originalBlocks: SubtitleBlock[];
  translatedBlocks: { [key: number]: string[] };
}

export const Downloader: React.FC<DownloaderProps> = ({ fileName, originalBlocks, translatedBlocks }) => {
  const doneCount = originalBlocks.filter((b) => translatedBlocks[b.index]).length;
  const isComplete = originalBlocks.length > 0 && doneCount === originalBlocks.length;
  const hasAny = doneCount > 0;

  const handleDownload = () => {
    const finished = originalBlocks.map((block) => ({
      ...block,
      textLines: translatedBlocks[block.index] || block.textLines,
    }));
    const blob = new Blob([stringifySRT(finished)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const parts = fileName.split('.');
    const ext = parts.pop();
    a.download = `${parts.join('.')}.translated.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-5 py-4 shadow-panel sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[15px] font-semibold text-ink">Download result</p>
        <p className="mt-0.5 text-sm text-muted">
          {isComplete
            ? 'Every block is translated and ready.'
            : hasAny
              ? 'Save what’s done so far — untranslated blocks keep their original text.'
              : 'Translate first, then save your .srt here.'}
        </p>
      </div>
      <button
        onClick={handleDownload}
        disabled={!hasAny}
        className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
          isComplete
            ? 'bg-accent text-accent-ink hover:bg-accent-hover'
            : 'border border-border-strong bg-surface text-ink hover:bg-surface-2 disabled:hover:bg-surface'
        }`}
      >
        <Download className="h-4 w-4" />
        Download .srt
      </button>
    </div>
  );
};

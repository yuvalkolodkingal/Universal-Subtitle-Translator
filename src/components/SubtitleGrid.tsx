import React, { useState } from 'react';
import { SubtitleBlock } from '../utils/srtParser';
import { Search, Pencil, Check, X } from 'lucide-react';

interface SubtitleGridProps {
  originalBlocks: SubtitleBlock[];
  translatedBlocks: { [key: number]: string[] };
  onUpdateBlock: (index: number, newLines: string[]) => void;
}

export const SubtitleGrid: React.FC<SubtitleGridProps> = ({
  originalBlocks,
  translatedBlocks,
  onUpdateBlock,
}) => {
  const [query, setQuery] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLines, setEditLines] = useState<string[]>([]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? originalBlocks.filter((b) => {
        const orig = b.textLines.join(' ').toLowerCase();
        const trans = (translatedBlocks[b.index] || []).join(' ').toLowerCase();
        return orig.includes(q) || trans.includes(q);
      })
    : originalBlocks;

  const startEdit = (block: SubtitleBlock) => {
    setEditingIndex(block.index);
    setEditLines(translatedBlocks[block.index] || [...block.textLines]);
  };

  const saveEdit = (index: number) => {
    onUpdateBlock(index, editLines);
    setEditingIndex(null);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-panel">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Subtitles</h2>
          <p className="mt-0.5 text-sm text-muted">Review line by line. Click any translation to edit it.</p>
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            type="search"
            placeholder="Search subtitles"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-faint transition-colors duration-150 focus:border-accent focus:bg-surface focus:outline-none"
          />
        </div>
      </div>

      {/* Column header — desktop only */}
      <div className="hidden grid-cols-[5.5rem_1fr_1fr] gap-4 border-b border-border bg-surface-2 px-5 py-2 text-xs font-medium text-faint md:grid">
        <span>Time</span>
        <span>Original</span>
        <span>Translation</span>
      </div>

      <div className="max-h-[560px] divide-y divide-border overflow-y-auto">
        {filtered.map((block) => {
          const translated = translatedBlocks[block.index];
          const isEditing = editingIndex === block.index;

          return (
            <div
              key={block.index}
              className="grid grid-cols-1 gap-2 px-5 py-3.5 text-sm transition-colors duration-150 hover:bg-surface-2/60 md:grid-cols-[5.5rem_1fr_1fr] md:gap-4"
            >
              {/* Meta */}
              <div className="flex items-center gap-2 font-mono text-xs text-faint md:flex-col md:items-start md:gap-0.5">
                <span className="text-muted">#{block.index}</span>
                <span className="truncate" title={block.timestamp}>
                  {block.timestamp.split(' --> ')[0]}
                </span>
              </div>

              {/* Original */}
              <div className="text-muted [overflow-wrap:anywhere]">
                {block.textLines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              {/* Translation */}
              <div className="[overflow-wrap:anywhere]">
                {isEditing ? (
                  <div className="space-y-2">
                    {editLines.map((line, i) => (
                      <input
                        key={i}
                        autoFocus={i === 0}
                        value={line}
                        onChange={(e) => {
                          const next = [...editLines];
                          next[i] = e.target.value;
                          setEditLines(next);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(block.index);
                          if (e.key === 'Escape') setEditingIndex(null);
                        }}
                        className="w-full rounded-md border border-accent bg-surface px-2.5 py-1.5 text-sm text-ink focus:outline-none"
                      />
                    ))}
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted hover:bg-surface-2 hover:text-ink"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(block.index)}
                        className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-ink hover:bg-accent-hover"
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                    </div>
                  </div>
                ) : translated ? (
                  <button
                    onClick={() => startEdit(block)}
                    className="group flex w-full items-start justify-between gap-2 rounded-md text-left text-ink"
                  >
                    <span>
                      {translated.map((line, i) => (
                        <span key={i} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                    <Pencil className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ) : (
                  <div className="space-y-1.5 py-0.5" aria-label="Awaiting translation">
                    <span className="skeleton block h-3 w-[85%] rounded" />
                    <span className="skeleton block h-3 w-[55%] rounded" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-medium text-ink">No subtitles match “{query}”</p>
            <p className="mt-1 text-sm text-muted">Try a different word, or clear the search.</p>
          </div>
        )}
      </div>
    </section>
  );
};

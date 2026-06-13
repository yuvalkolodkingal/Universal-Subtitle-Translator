import React, { useState } from 'react';
import { SubtitleBlock } from '../utils/srtParser';
import { Search, Edit } from 'lucide-react';

interface SubtitleGridProps {
  originalBlocks: SubtitleBlock[];
  translatedBlocks: { [key: number]: string[] };
  onUpdateBlock: (index: number, newLines: string[]) => void;
}

export const SubtitleGrid: React.FC<SubtitleGridProps> = ({
  originalBlocks,
  translatedBlocks,
  onUpdateBlock
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLines, setEditLines] = useState<string[]>([]);

  const filteredBlocks = originalBlocks.filter((block) => {
    const origText = block.textLines.join(' ').toLowerCase();
    const transText = (translatedBlocks[block.index] || []).join(' ').toLowerCase();
    return origText.includes(searchQuery.toLowerCase()) || transText.includes(searchQuery.toLowerCase());
  });

  const handleStartEdit = (block: SubtitleBlock) => {
    setEditingIndex(block.index);
    setEditLines(translatedBlocks[block.index] || [...block.textLines]);
  };

  const handleSaveEdit = (index: number) => {
    onUpdateBlock(index, editLines);
    setEditingIndex(null);
  };

  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-slate-200 font-mono text-sm uppercase tracking-wider font-bold">Interactive Workspace Review</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Edit translations inline prior to downloading</p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search block contents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono w-full sm:w-64"
          />
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-12 gap-4 text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-2 px-2 hidden md:grid">
        <div className="col-span-1">Index</div>
        <div className="col-span-2">Timestamp</div>
        <div className="col-span-4">Original Text</div>
        <div className="col-span-5">Translated Text</div>
      </div>

      {/* Grid Rows */}
      <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
        {filteredBlocks.map((block) => {
          const isTranslating = !translatedBlocks[block.index];
          const isEditing = editingIndex === block.index;

          return (
            <div
              key={block.index}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-3 rounded-lg border border-slate-900 bg-slate-950/20 hover:border-slate-800/80 transition-all text-sm items-start"
            >
              {/* Metadata columns */}
              <div className="md:col-span-1 font-mono text-slate-500 text-xs md:text-sm flex md:block justify-between">
                <span className="md:hidden">Block Index</span>
                <span>#{block.index}</span>
              </div>
              <div className="md:col-span-2 font-mono text-slate-500 text-xs flex md:block justify-between">
                <span className="md:hidden">Timestamp</span>
                <span className="truncate">{block.timestamp}</span>
              </div>

              {/* Original Content */}
              <div className="md:col-span-4 text-slate-300 font-sans break-words bg-slate-900/10 p-2 rounded md:p-0 md:bg-transparent">
                {block.textLines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>

              {/* Translated Content & Editor */}
              <div className="md:col-span-5 flex flex-col justify-between h-full min-h-[40px] gap-2">
                {isEditing ? (
                  <div className="flex flex-col gap-2 w-full">
                    {editLines.map((line, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={line}
                        onChange={(e) => {
                          const updated = [...editLines];
                          updated[idx] = e.target.value;
                          setEditLines(updated);
                        }}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 font-sans"
                      />
                    ))}
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono uppercase"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(block.index)}
                        className="px-2 py-1 bg-emerald-950 border border-emerald-900/50 hover:bg-emerald-900 text-emerald-300 rounded text-xs font-mono uppercase"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-slate-100 font-sans break-words w-full">
                      {isTranslating ? (
                        <span className="text-slate-600 font-mono text-xs italic animate-pulse">Pending...</span>
                      ) : (
                        translatedBlocks[block.index].map((line, idx) => <p key={idx}>{line}</p>)
                      )}
                    </div>
                    {!isTranslating && (
                      <button
                        onClick={() => handleStartEdit(block)}
                        className="text-slate-500 hover:text-emerald-500 p-1 rounded hover:bg-slate-900 transition-all flex-shrink-0"
                        title="Edit block inline"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredBlocks.length === 0 && (
          <div className="p-8 text-center text-slate-600 font-mono text-sm border border-dashed border-slate-900 rounded-lg">
            No matching blocks found
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { SettingsPanel } from './components/SettingsPanel';
import { ProgressTracker } from './components/ProgressTracker';
import { Downloader } from './components/Downloader';
import { SubtitleGrid } from './components/SubtitleGrid';
import { SubtitleBlock, parseSRT } from './utils/srtParser';
import { translateBatch } from './utils/translator';
import { FileCode, Trash2 } from 'lucide-react';

export const App: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<SubtitleBlock[]>([]);
  const [translatedBlocks, setTranslatedBlocks] = useState<{ [key: number]: string[] }>({});
  
  // Translation settings
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [chunkSize, setChunkSize] = useState(3500);
  const [delay, setDelay] = useState(1.0);
  
  // Console state
  const [isTranslating, setIsTranslating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Use ref to hold translating loop alive correctly during settings change
  const abortControllerRef = useRef<boolean>(false);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleFileLoaded = (name: string, content: string) => {
    const parsed = parseSRT(content);
    setFileName(name);
    setBlocks(parsed);
    setTranslatedBlocks({});
    setLogs([]);
    addLog(`Successfully parsed "${name}" containing ${parsed.length} blocks.`);
  };

  const handleReset = () => {
    abortControllerRef.current = true;
    setIsTranslating(false);
    setFileName(null);
    setBlocks([]);
    setTranslatedBlocks({});
    setLogs([]);
  };

  // Build sequential non-blocking recursive loop to respect pauses cleanly
  const startTranslation = async () => {
    if (blocks.length === 0) return;
    setIsTranslating(true);
    abortControllerRef.current = false;
    addLog(`Initiating translation pipeline to language '${targetLang}'...`);

    // Collect pending translation queue blocks
    const pending: { index: number; text: string }[] = [];
    for (const block of blocks) {
      if (!translatedBlocks[block.index]) {
        pending.push({
          index: block.index,
          text: block.textLines.join('\n')
        });
      }
    }

    if (pending.length === 0) {
      addLog('All segments already completed.');
      setIsTranslating(false);
      return;
    }

    // High-performance chunker sequence
    const chunks: { index: number; text: string }[][] = [];
    let currentChunk: { index: number; text: string }[] = [];
    let currentLen = 0;

    for (const item of pending) {
      const addedLen = item.text.length + 9; // ACCOUNT DELIMITER OVERHEAD
      if (currentChunk.length > 0 && currentLen + addedLen > chunkSize) {
        chunks.push(currentChunk);
        currentChunk = [item];
        currentLen = item.text.length;
      } else {
        currentChunk.push(item);
        currentLen += addedLen;
      }
    }
    if (currentChunk.length > 0) chunks.push(currentChunk);

    addLog(`Subdividing task load into ${chunks.length} high-speed translation bundles.`);

    for (let i = 0; i < chunks.length; i++) {
      if (abortControllerRef.current) {
        addLog('Translation batch execution suspended by worker request.');
        setIsTranslating(false);
        return;
      }

      const chunk = chunks[i];
      const startIdx = chunk[0].index;
      const endIdx = chunk[chunk.length - 1].index;

      addLog(`Requesting bundle batch ${i + 1}/${chunks.length} [Segments ${startIdx}-${endIdx}]...`);

      try {
        await translateBatch(
          chunk,
          sourceLang,
          targetLang,
          delay,
          (idx, translatedLines) => {
            setTranslatedBlocks((prev) => ({
              ...prev,
              [idx]: translatedLines
            }));
          }
        );
      } catch (e: any) {
        addLog(`ERROR: Batch batch failed at segment block range: ${e.message || e}`);
        setIsTranslating(false);
        return;
      }

      // Safe sleep timer sequence to prevent hitting endpoints block
      if (i < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * 1000));
      }
    }

    addLog('Translation pipeline completed successfully.');
    setIsTranslating(false);
  };

  const handlePause = () => {
    abortControllerRef.current = true;
    setIsTranslating(false);
    addLog('Signal pause received. Suspending operations safely...');
  };

  const handleUpdateBlock = (index: number, lines: string[]) => {
    setTranslatedBlocks((prev) => ({
      ...prev,
      [index]: lines
    }));
    addLog(`Manually edited segment index #${index}`);
  };

  const completedCount = blocks.filter(b => !!translatedBlocks[b.index]).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {!fileName ? (
          <div className="max-w-2xl mx-auto w-full py-12 flex flex-col gap-6">
            <div className="text-center flex flex-col gap-2">
              <h2 className="text-4xl font-mono uppercase tracking-tight font-extrabold text-slate-100">
                UNIVERSAL SUBTITLE TRANSLATOR
              </h2>
              <p className="text-sm text-slate-500 font-mono">
                Translate SRT subtitles between any language pair with optimal throttle management.
              </p>
            </div>
            <DropZone onFileLoaded={handleFileLoaded} />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Active File Banner */}
            <div className="bg-slate-900/50 border border-slate-900 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-emerald-500">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-slate-200 font-mono text-sm font-bold truncate max-w-xs sm:max-w-lg uppercase">
                    {fileName}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Total Subtitles parsed: {blocks.length} sections
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="text-slate-500 hover:text-rose-500 p-2 rounded hover:bg-slate-950 border border-transparent hover:border-slate-800 transition-all flex items-center gap-2 text-xs font-mono uppercase"
              >
                <Trash2 className="w-4 h-4" /> Clear File
              </button>
            </div>

            {/* Config & Progress Split grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 flex flex-col gap-8">
                <SettingsPanel
                  sourceLang={sourceLang}
                  targetLang={targetLang}
                  chunkSize={chunkSize}
                  delay={delay}
                  onChangeSource={setSourceLang}
                  onChangeTarget={setTargetLang}
                  onChangeChunkSize={setChunkSize}
                  onChangeDelay={setDelay}
                  disabled={isTranslating}
                />
              </div>
              <div className="lg:col-span-6 flex flex-col gap-8">
                <ProgressTracker
                  total={blocks.length}
                  current={completedCount}
                  logs={logs}
                  isTranslating={isTranslating}
                  onStart={startTranslation}
                  onPause={handlePause}
                  onCancel={handleReset}
                />
              </div>
            </div>

            {/* Downloader Widget */}
            <Downloader
              fileName={fileName}
              originalBlocks={blocks}
              translatedBlocks={translatedBlocks}
            />

            {/* Dynamic Grid Reviews */}
            <SubtitleGrid
              originalBlocks={blocks}
              translatedBlocks={translatedBlocks}
              onUpdateBlock={handleUpdateBlock}
            />
          </div>
        )}
      </main>
    </div>
  );
};

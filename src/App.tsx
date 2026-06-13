import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { SettingsPanel } from './components/SettingsPanel';
import { ProgressTracker } from './components/ProgressTracker';
import { Downloader } from './components/Downloader';
import { SubtitleGrid } from './components/SubtitleGrid';
import { SubtitleBlock, parseSRT } from './utils/srtParser';
import { translateBatch, SUPPORTED_LANGUAGES } from './utils/translator';
import { FileText, X } from 'lucide-react';

export const App: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<SubtitleBlock[]>([]);
  const [translatedBlocks, setTranslatedBlocks] = useState<{ [key: number]: string[] }>({});

  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [chunkSize, setChunkSize] = useState(1500); // Safer batch size default to prevent delimiter mangling
  const [delay, setDelay] = useState(1.5); // Better rate-limiting safety margin

  const [isTranslating, setIsTranslating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const abortRef = useRef(false);

  const addLog = (msg: string) =>
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString([], { hour12: false })}  ${msg}`]);

  const handleFileLoaded = (name: string, content: string) => {
    const parsed = parseSRT(content);
    setFileName(name);
    setBlocks(parsed);
    setTranslatedBlocks({});
    setLogs([]);
    addLog(`Loaded ${name} — ${parsed.length} subtitle blocks.`);
  };

  const handleReset = () => {
    abortRef.current = true;
    setIsTranslating(false);
    setFileName(null);
    setBlocks([]);
    setTranslatedBlocks({});
    setLogs([]);
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const startTranslation = async () => {
    if (blocks.length === 0) return;
    setIsTranslating(true);
    abortRef.current = false;

    const targetName = SUPPORTED_LANGUAGES[targetLang] || targetLang;
    addLog(`Translating to ${targetName}…`);

    const pending: { index: number; text: string }[] = [];
    for (const block of blocks) {
      if (!translatedBlocks[block.index]) {
        pending.push({ index: block.index, text: block.textLines.join('\n') });
      }
    }

    if (pending.length === 0) {
      addLog('Everything is already translated.');
      setIsTranslating(false);
      return;
    }

    // Bundle blocks into character-bounded batches to minimise API calls.
    const chunks: { index: number; text: string }[][] = [];
    let current: { index: number; text: string }[] = [];
    let len = 0;
    for (const item of pending) {
      const added = item.text.length + 9; // delimiter overhead
      if (current.length > 0 && len + added > chunkSize) {
        chunks.push(current);
        current = [item];
        len = item.text.length;
      } else {
        current.push(item);
        len += added;
      }
    }
    if (current.length > 0) chunks.push(current);

    addLog(`Split into ${chunks.length} ${chunks.length === 1 ? 'batch' : 'batches'}.`);

    for (let i = 0; i < chunks.length; i++) {
      if (abortRef.current) {
        addLog('Paused.');
        setIsTranslating(false);
        return;
      }
      const chunk = chunks[i];
      addLog(`Batch ${i + 1} of ${chunks.length} — blocks ${chunk[0].index}–${chunk[chunk.length - 1].index}.`);

      try {
        await translateBatch(chunk, sourceLang, targetLang, delay, (idx, lines) =>
          setTranslatedBlocks((prev) => ({ ...prev, [idx]: lines })),
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        addLog(`Couldn’t reach the translation service (${msg}). Press Resume to retry.`);
        setIsTranslating(false);
        return;
      }

      if (i < chunks.length - 1) await new Promise((r) => setTimeout(r, delay * 1000));
    }

    addLog('Done.');
    setIsTranslating(false);
  };

  const handlePause = () => {
    abortRef.current = true;
    setIsTranslating(false);
  };

  const handleUpdateBlock = (index: number, lines: string[]) =>
    setTranslatedBlocks((prev) => ({ ...prev, [index]: lines }));

  const completed = blocks.filter((b) => translatedBlocks[b.index]).length;
  const targetLabel = SUPPORTED_LANGUAGES[targetLang] || targetLang;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-bg">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        {!fileName ? (
          <div className="mx-auto flex max-w-xl flex-col items-center py-10 text-center sm:py-16">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-[2.5rem] sm:leading-[1.1]">
              Translate subtitles into any language
            </h1>
            <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted">
              Drop in an <span className="font-medium text-ink">.srt</span> file, choose a language, and get a
              clean, timed translation back. It all runs in your browser — nothing is uploaded.
            </p>
            <div className="mt-9 w-full">
              <DropZone onFileLoaded={handleFileLoaded} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* File bar */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-panel">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
                  <FileText className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink" title={fileName}>
                    {fileName}
                  </p>
                  <p className="text-xs text-muted">
                    {blocks.length} blocks · {completed} translated
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SettingsPanel
                sourceLang={sourceLang}
                targetLang={targetLang}
                chunkSize={chunkSize}
                delay={delay}
                onChangeSource={setSourceLang}
                onChangeTarget={setTargetLang}
                onChangeChunkSize={setChunkSize}
                onChangeDelay={setDelay}
                onSwap={handleSwap}
                disabled={isTranslating}
              />
              <ProgressTracker
                total={blocks.length}
                current={completed}
                logs={logs}
                isTranslating={isTranslating}
                targetLabel={targetLabel}
                onStart={startTranslation}
                onPause={handlePause}
                onCancel={handleReset}
              />
            </div>

            <Downloader fileName={fileName} originalBlocks={blocks} translatedBlocks={translatedBlocks} />

            <SubtitleGrid
              originalBlocks={blocks}
              translatedBlocks={translatedBlocks}
              onUpdateBlock={handleUpdateBlock}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 text-xs text-faint sm:px-8">
          <span>Runs entirely in your browser.</span>
          <span>SubRip .srt</span>
        </div>
      </footer>
    </div>
  );
};

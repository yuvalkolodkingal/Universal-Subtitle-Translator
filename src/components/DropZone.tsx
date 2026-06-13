import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFileLoaded: (name: string, content: string) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.srt')) {
      setError(`"${file.name}" isn't an .srt file. Choose a SubRip subtitle file to continue.`);
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') onFileLoaded(file.name, result);
    };
    reader.onerror = () => setError('That file could not be read. Try selecting it again.');
    reader.readAsText(file, 'utf-8');
  };

  const handleDrag = (e: React.DragEvent, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(active);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const openPicker = () => fileInputRef.current?.click();

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a subtitle file"
        onDragEnter={(e) => handleDrag(e, true)}
        onDragOver={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDrop={handleDrop}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        className={`group flex flex-col items-center justify-center gap-5 rounded-xl border border-dashed px-6 py-16 text-center transition-colors duration-200 ease-out-quart ${
          isDragActive
            ? 'border-accent bg-accent-soft/40'
            : 'border-border-strong bg-surface hover:border-faint hover:bg-surface-2'
        }`}
      >
        <input ref={fileInputRef} type="file" accept=".srt" onChange={handleChange} className="hidden" />
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-200 ${
            isDragActive ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-muted group-hover:text-ink'
          }`}
        >
          <UploadCloud className="h-6 w-6" />
        </span>
        <div className="space-y-1">
          <p className="text-base font-medium text-ink">
            Drop a subtitle file, or{' '}
            <span className="text-accent underline decoration-accent/40 underline-offset-2">browse</span>
          </p>
          <p className="text-sm text-muted">SubRip .srt files, UTF-8. Everything stays on your device.</p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2.5 rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

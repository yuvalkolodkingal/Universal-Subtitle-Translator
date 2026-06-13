import React, { useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFileLoaded: (name: string, content: string) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (!file.name.endsWith('.srt')) {
      setError('Unsupported file type. Please upload a .srt file.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        onFileLoaded(file.name, result);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-emerald-500 bg-emerald-950/10'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".srt"
          onChange={handleChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-200 font-medium text-lg">
              Drag & drop subtitle file here, or <span className="text-emerald-500 hover:underline">browse</span>
            </p>
            <p className="text-slate-500 text-sm mt-1">Accepts UTF-8 encoded .srt files</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded bg-rose-950/30 border border-rose-900/50 flex items-center gap-3 text-rose-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, FileSpreadsheet, Image as ImageIcon, FileText, Music, Archive, Plus } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  isCompact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected, isCompact = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allow pasting files from clipboard (e.g. screenshots or copied files)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pastedFiles = Array.from(e.clipboardData.files);
        onFilesSelected(pastedFiles);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      // reset so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  if (isCompact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
        <div className="flex items-center justify-center gap-3 text-slate-300">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Plus className="w-5 h-5" />
          </div>
          <span className="font-medium text-sm">
            Arraste mais arquivos aqui ou clique para adicionar
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
        isDragging
          ? 'border-indigo-400 bg-indigo-600/10 scale-[1.01] shadow-2xl shadow-indigo-500/20'
          : 'border-slate-800 hover:border-indigo-500/50 bg-gradient-to-b from-slate-900/60 to-slate-950/80 hover:bg-slate-900/90 shadow-xl'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Decorative ambient gradient */}
      <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative px-6 py-12 sm:py-16 text-center max-w-2xl mx-auto flex flex-col items-center">
        {/* Animated Icon Circle */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <UploadCloud className="w-10 h-10 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 animate-ping opacity-75" />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
          Arraste e solte seus arquivos aqui
        </h3>
        <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
          Suporta imagens, documentos, planilhas, arquivos de áudio e dados estruturados.
          Você também pode <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">Ctrl + V</kbd> para colar direto da área de transferência!
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 active:scale-95 transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          Selecionar Arquivos no Computador
        </button>

        {/* Format categories pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="text-slate-500 font-medium">Suporta:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> Imagens (PNG, JPG, WEBP, ICO, SVG)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Planilhas (CSV, XLSX, TSV)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <FileText className="w-3.5 h-3.5 text-sky-400" /> Documentos (PDF, MD, HTML, JSON, YAML)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <Music className="w-3.5 h-3.5 text-purple-400" /> Áudio (MP3, WAV, OGG, AAC)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <Archive className="w-3.5 h-3.5 text-amber-400" /> ZIP & Hashes
          </span>
        </div>
      </div>
    </div>
  );
};

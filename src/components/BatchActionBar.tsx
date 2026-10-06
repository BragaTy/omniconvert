import React from 'react';
import { Play, Download, Trash2, CheckCircle2, Layers } from 'lucide-react';
import { FileItem } from '../types';
import { ALL_FORMATS } from '../constants/formats';

interface BatchActionBarProps {
  files: FileItem[];
  isConvertingAll: boolean;
  onConvertAll: () => void;
  onDownloadAllZip: () => void;
  onClearAll: () => void;
  onSetGlobalTarget: (target: string) => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  files,
  isConvertingAll,
  onConvertAll,
  onDownloadAllZip,
  onClearAll,
  onSetGlobalTarget
}) => {
  const completedCount = files.filter(f => f.status === 'success').length;
  const pendingCount = files.filter(f => f.status === 'idle' || f.status === 'error').length;

  // Determine common formats available if any
  const firstCategory = files[0]?.category;
  const allSameCategory = files.every(f => f.category === firstCategory);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left: Summary */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
            <span>{files.length} {files.length === 1 ? 'arquivo na fila' : 'arquivos na fila'}</span>
            {completedCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {completedCount} pronto(s)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {pendingCount > 0 ? `${pendingCount} aguardando conversão` : 'Todos os arquivos foram processados!'}
          </p>
        </div>
      </div>

      {/* Center: Global format selector if applicable */}
      {allSameCategory && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">Definir todos para:</span>
          <select
            onChange={(e) => onSetGlobalTarget(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-medium"
            defaultValue=""
          >
            <option value="" disabled>Escolher formato em lote...</option>
            {firstCategory === 'image' && (
              <>
                <option value="webp">WEBP (Compacto Web)</option>
                <option value="png">PNG (Sem perdas)</option>
                <option value="jpg">JPG (Padrão)</option>
                <option value="ico">ICO (Ícone / Favicon)</option>
                <option value="pdf">PDF (Documento)</option>
              </>
            )}
            {firstCategory === 'data' && (
              <>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="yaml">YAML</option>
              </>
            )}
            {firstCategory === 'document' && (
              <>
                <option value="pdf">PDF</option>
                <option value="html">HTML</option>
                <option value="txt">TXT</option>
                <option value="md">Markdown (MD)</option>
              </>
            )}
            {firstCategory === 'audio' && (
              <>
                <option value="wav">WAV (Estúdio)</option>
                <option value="mp3">MP3</option>
              </>
            )}
            <option value="zip">ZIP (Compactar)</option>
            <option value="hash">Checksum (SHA-256)</option>
          </select>
        </div>
      )}

      {/* Right: Batch buttons */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
        {pendingCount > 0 && (
          <button
            type="button"
            disabled={isConvertingAll}
            onClick={onConvertAll}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isConvertingAll ? 'Convertendo...' : 'Converter Todos'}</span>
          </button>
        )}

        {completedCount > 0 && (
          <button
            type="button"
            onClick={onDownloadAllZip}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Todos (.ZIP)</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClearAll}
          title="Limpar todos os arquivos da lista"
          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

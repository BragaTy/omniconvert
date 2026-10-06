import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { FileItem, ConversionOptions } from '../types';

interface SettingsModalProps {
  item: FileItem | null;
  onClose: () => void;
  onSave: (id: string, newOptions: ConversionOptions) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  item,
  onClose,
  onSave
}) => {
  if (!item) return null;

  const [options, setOptions] = useState<ConversionOptions>({ ...item.options });

  const handleSave = () => {
    onSave(item.id, options);
    onClose();
  };

  const isImageTarget = ['jpg', 'jpeg', 'webp', 'png', 'bmp', 'ico'].includes(item.targetFormat.toLowerCase());
  const isPdfTarget = item.targetFormat.toLowerCase() === 'pdf';
  const isDataTarget = ['csv', 'tsv', 'json', 'yaml', 'xml'].includes(item.targetFormat.toLowerCase());
  const isAudioTarget = item.category === 'audio';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Opções de Conversão</h3>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* IMAGE SETTINGS */}
          {isImageTarget && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Ajustes de Imagem</h4>
              
              {/* Quality slider */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Qualidade da Imagem</span>
                  <span className="text-indigo-400 font-mono font-semibold">{Math.round((options.imageQuality ?? 0.9) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={options.imageQuality ?? 0.9}
                  onChange={(e) => setOptions({ ...options, imageQuality: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Aplica-se a formatos com compressão (JPG, WEBP).</span>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Largura (px)</label>
                  <input
                    type="number"
                    placeholder="Original"
                    value={options.imageWidth || ''}
                    onChange={(e) => setOptions({ ...options, imageWidth: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Altura (px)</label>
                  <input
                    type="number"
                    placeholder="Original"
                    value={options.imageHeight || ''}
                    onChange={(e) => setOptions({ ...options, imageHeight: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={options.maintainAspectRatio ?? true}
                    onChange={(e) => setOptions({ ...options, maintainAspectRatio: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 accent-indigo-500"
                  />
                  <span>Manter proporção ao redimensionar</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={options.grayscale ?? false}
                    onChange={(e) => setOptions({ ...options, grayscale: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 accent-indigo-500"
                  />
                  <span>Converter para Preto e Branco (Escala de cinza)</span>
                </label>
              </div>
            </div>
          )}

          {/* PDF SETTINGS */}
          {isPdfTarget && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">Ajustes do PDF</h4>
              
              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Orientação da Página</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, pdfOrientation: 'portrait' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      (options.pdfOrientation ?? 'portrait') === 'portrait'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Retrato (Vertical)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, pdfOrientation: 'landscape' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      options.pdfOrientation === 'landscape'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Paisagem (Horizontal)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Tamanho do Papel</label>
                <select
                  value={options.pdfPageSize || 'a4'}
                  onChange={(e) => setOptions({ ...options, pdfPageSize: e.target.value as 'a4' | 'letter' })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                >
                  <option value="a4">A4 (210 x 297 mm)</option>
                  <option value="letter">Carta / Letter (8.5 x 11 pol)</option>
                </select>
              </div>
            </div>
          )}

          {/* DATA / CSV SETTINGS */}
          {isDataTarget && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Ajustes de Tabela & Dados</h4>
              
              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Separador de Colunas (Delimitador CSV)</label>
                <select
                  value={options.csvDelimiter || ','}
                  onChange={(e) => setOptions({ ...options, csvDelimiter: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                >
                  <option value=",">Vírgula ( , ) - Padrão Internacional</option>
                  <option value=";">Ponto e vírgula ( ; ) - Padrão Excel Brasil</option>
                  <option value="&#9;">Tabulação ( \t ) - TSV</option>
                  <option value="|">Pipe ( | )</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Formatação de JSON/YAML</label>
                <select
                  value={options.jsonIndent ?? 2}
                  onChange={(e) => setOptions({ ...options, jsonIndent: parseInt(e.target.value), yamlIndent: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                >
                  <option value="2">Indentado (2 espaços legível)</option>
                  <option value="4">Indentado (4 espaços)</option>
                  <option value="0">Minificado / Compacto</option>
                </select>
              </div>
            </div>
          )}

          {/* AUDIO SETTINGS */}
          {isAudioTarget && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Ajustes de Áudio</h4>
              
              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Taxa de Amostragem (Sample Rate)</label>
                <select
                  value={options.audioSampleRate || ''}
                  onChange={(e) => setOptions({ ...options, audioSampleRate: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                >
                  <option value="">Manter original do arquivo</option>
                  <option value="44100">44.1 kHz (Qualidade CD de Áudio)</option>
                  <option value="48000">48.0 kHz (Padrão Estúdio / Vídeo)</option>
                  <option value="22050">22.05 kHz (Compacto / Voz)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Canais de Áudio</label>
                <select
                  value={options.audioChannels || ''}
                  onChange={(e) => setOptions({ ...options, audioChannels: e.target.value ? (parseInt(e.target.value) as 1 | 2) : undefined })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                >
                  <option value="">Manter canais originais</option>
                  <option value="2">Estéreo (2 canais L/R)</option>
                  <option value="1">Mono (1 canal)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            Salvar Opções
          </button>
        </div>
      </div>
    </div>
  );
};

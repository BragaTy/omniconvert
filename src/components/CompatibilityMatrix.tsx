import React, { useState } from 'react';
import { Search, Image as ImageIcon, FileSpreadsheet, FileText, Music, Archive, ArrowRight } from 'lucide-react';
import { ALL_FORMATS, getCompatibleTargets } from '../constants/formats';
import { FileCategory } from '../types';

export const CompatibilityMatrix: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<FileCategory | 'all'>('all');

  const categories = [
    { id: 'all', label: 'Todos os Formatos', icon: null },
    { id: 'image', label: 'Imagens', icon: <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> },
    { id: 'data', label: 'Planilhas & Dados', icon: <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'document', label: 'Documentos & Texto', icon: <FileText className="w-3.5 h-3.5 text-sky-400" /> },
    { id: 'audio', label: 'Áudio', icon: <Music className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'archive', label: 'Arquivos & Hashes', icon: <Archive className="w-3.5 h-3.5 text-amber-400" /> },
  ];

  // List of primary source formats to showcase
  const sampleFormats = [
    { ext: 'png', cat: 'image' as FileCategory, name: 'PNG Image' },
    { ext: 'jpg', cat: 'image' as FileCategory, name: 'JPG / JPEG Image' },
    { ext: 'webp', cat: 'image' as FileCategory, name: 'Google WEBP' },
    { ext: 'csv', cat: 'data' as FileCategory, name: 'CSV Planilha' },
    { ext: 'xlsx', cat: 'data' as FileCategory, name: 'Excel XLSX' },
    { id: 'json', ext: 'json', cat: 'data' as FileCategory, name: 'JSON Dados' },
    { ext: 'md', cat: 'document' as FileCategory, name: 'Markdown (MD)' },
    { ext: 'html', cat: 'document' as FileCategory, name: 'HTML Web' },
    { ext: 'txt', cat: 'document' as FileCategory, name: 'Texto Puro (TXT)' },
    { ext: 'mp3', cat: 'audio' as FileCategory, name: 'Áudio MP3' },
    { ext: 'wav', cat: 'audio' as FileCategory, name: 'Áudio WAV' },
    { ext: 'zip', cat: 'archive' as FileCategory, name: 'Arquivo ZIP' },
  ];

  const filteredSamples = sampleFormats.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.cat === activeCategory;
    const matchesSearch = item.ext.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-12 border-t border-slate-900 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Matriz de Compatibilidade de Conversão
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Veja para quais formatos cada tipo de arquivo pode ser convertido instantaneamente.
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquise por formato (ex: csv, png, mp3, json)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSamples.map((sample) => {
            const targets = getCompatibleTargets(sample.ext, sample.cat);

            return (
              <div
                key={sample.ext}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono">
                        .{sample.ext.toUpperCase()}
                      </span>
                      <span>{sample.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{sample.cat}</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                    <span>Pode ser convertido para:</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  {targets.map((t) => (
                    <span
                      key={t.extension}
                      title={t.description}
                      className="px-2 py-1 rounded-md bg-slate-800/80 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border border-slate-700/60 text-[11px] font-mono transition-colors cursor-help"
                    >
                      {t.extension.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

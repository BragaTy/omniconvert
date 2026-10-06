import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileText, Image as ImageIcon, Music, Download } from 'lucide-react';
import { FileItem } from '../types';
import { formatBytes, downloadBlob } from '../utils/fileHelpers';

interface PreviewModalProps {
  item: FileItem;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ item, onClose }) => {
  const [activeTab, setActiveTab] = useState<'original' | 'converted'>('original');
  const [textContent, setTextContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [convertedAudioUrl, setConvertedAudioUrl] = useState<string>('');

  const hasResult = item.status === 'success' && item.resultBlob;

  useEffect(() => {
    // If converted file is available and user just finished, default to converted if available
    if (hasResult) {
      setActiveTab('converted');
    } else {
      setActiveTab('original');
    }
  }, [item, hasResult]);

  useEffect(() => {
    let cancel = false;

    const loadContent = async () => {
      const targetBlob = activeTab === 'converted' && item.resultBlob ? item.resultBlob : item.file;

      if (item.category === 'image') {
        // Handled via URL.createObjectURL in render
      } else if (item.category === 'audio') {
        const url = URL.createObjectURL(targetBlob);
        if (activeTab === 'original') setAudioUrl(url);
        else setConvertedAudioUrl(url);
      } else {
        // Read as text
        try {
          const slice = targetBlob.slice(0, 100000); // Read up to 100KB
          const text = await slice.text();
          if (!cancel) setTextContent(text);
        } catch {
          if (!cancel) setTextContent('Não foi possível exibir o texto deste arquivo.');
        }
      }
    };

    loadContent();

    return () => {
      cancel = true;
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (convertedAudioUrl) URL.revokeObjectURL(convertedAudioUrl);
    };
  }, [activeTab, item]);

  const handleCopy = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentBlob = activeTab === 'converted' && item.resultBlob ? item.resultBlob : item.file;
  const currentUrl = activeTab === 'converted' && item.resultUrl ? item.resultUrl : (item.previewUrl || URL.createObjectURL(item.file));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Pré-visualização: {item.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatBytes(currentBlob.size)} • {item.extension.toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasResult && (
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('original')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === 'original' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Original
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('converted')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === 'converted' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Convertido ({item.targetFormat.toUpperCase()})
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6 bg-slate-950/30 flex flex-col items-center justify-center min-h-[300px]">
          {/* Image preview */}
          {item.category === 'image' && (
            <div className="max-w-full max-h-[500px] flex items-center justify-center rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-2">
              <img
                src={currentUrl}
                alt="Preview"
                className="max-h-[450px] max-w-full object-contain rounded-lg"
              />
            </div>
          )}

          {/* Audio preview */}
          {item.category === 'audio' && (
            <div className="w-full max-w-md p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mx-auto flex items-center justify-center">
                <Music className="w-8 h-8" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-100">{item.name}</p>
                <p className="text-xs text-slate-400">Player de áudio nativo</p>
              </div>
              <audio controls className="w-full" src={activeTab === 'converted' ? convertedAudioUrl : audioUrl} />
            </div>
          )}

          {/* Text / Code / CSV / JSON preview */}
          {item.category !== 'image' && item.category !== 'audio' && (
            <div className="w-full h-full flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
                <span>Visualização dos dados (primeiros 100 KB)</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="flex-1 w-full p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-auto whitespace-pre-wrap max-h-[450px]">
                {textContent}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {activeTab === 'converted' ? 'Exibindo arquivo convertido' : 'Exibindo arquivo de origem'}
          </span>
          {hasResult && activeTab === 'converted' && (
            <button
              type="button"
              onClick={() => item.resultBlob && downloadBlob(item.resultBlob, item.resultName || `${item.name}.${item.targetFormat}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Convertido
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import { useState, useCallback } from 'react';
import { Header, AppViewMode } from './components/Header';
import { DropZone } from './components/DropZone';
import { FileItemCard } from './components/FileItemCard';
import { BatchActionBar } from './components/BatchActionBar';
import { SettingsModal } from './components/SettingsModal';
import { PreviewModal } from './components/PreviewModal';
import { FeaturesBanner } from './components/FeaturesBanner';
import { CompatibilityMatrix } from './components/CompatibilityMatrix';
import { Footer } from './components/Footer';

import { PdfToolsGrid, PdfToolItem } from './components/PdfToolsGrid';
import { PdfToolModal } from './components/PdfToolModal';
import { MediaToolsView } from './components/MediaToolsView';

import { FileItem, ConversionOptions } from './types';
import { createFileItem, downloadBlob } from './utils/fileHelpers';
import { convertSingleFile } from './converters';
import { packageToZip } from './converters/archiveConverter';
import { Sparkles, FileCode, FileSpreadsheet, Image as ImageIcon, ArrowLeftRight, FileText, Video } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<AppViewMode>('converter');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [settingsItem, setSettingsItem] = useState<FileItem | null>(null);
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);

  // Selected tool for PDF modal
  const [activePdfTool, setActivePdfTool] = useState<PdfToolItem | null>(null);

  // Add files to queue
  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const newItems = selectedFiles.map(f => createFileItem(f));
    setFiles(prev => [...prev, ...newItems]);
  }, []);

  // Update target format for a specific file
  const handleUpdateTarget = useCallback((id: string, target: string) => {
    setFiles(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, targetFormat: target, status: 'idle', resultBlob: undefined, resultUrl: undefined };
      }
      return item;
    }));
  }, []);

  // Convert single file
  const handleConvert = useCallback(async (id: string) => {
    const targetItem = files.find(f => f.id === id);
    if (!targetItem) return;

    setFiles(prev => prev.map(item => item.id === id ? { ...item, status: 'converting', progress: 10, errorMessage: undefined } : item));

    try {
      const { blob, filename } = await convertSingleFile(targetItem, (progress) => {
        setFiles(prev => prev.map(item => item.id === id ? { ...item, progress } : item));
      });

      const resultUrl = URL.createObjectURL(blob);

      setFiles(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'success',
            progress: 100,
            resultBlob: blob,
            resultUrl,
            resultName: filename,
            resultSize: blob.size
          };
        }
        return item;
      }));
    } catch (err: any) {
      setFiles(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'error',
            errorMessage: err?.message || 'Erro inesperado na conversão.'
          };
        }
        return item;
      }));
    }
  }, [files]);

  // Convert all pending files
  const handleConvertAll = useCallback(async () => {
    setIsConvertingAll(true);
    const pending = files.filter(f => f.status === 'idle' || f.status === 'error');

    for (const item of pending) {
      await handleConvert(item.id);
    }

    setIsConvertingAll(false);
  }, [files, handleConvert]);

  // Download converted single file
  const handleDownload = useCallback((id: string) => {
    const item = files.find(f => f.id === id);
    if (item && item.resultBlob && item.resultName) {
      downloadBlob(item.resultBlob, item.resultName);
    }
  }, [files]);

  // Download all converted files into one ZIP package
  const handleDownloadAllZip = useCallback(async () => {
    const completed = files.filter(f => f.status === 'success' && f.resultBlob && f.resultName);
    if (completed.length === 0) return;

    const zipList = completed.map(f => ({
      name: f.resultName!,
      blob: f.resultBlob!
    }));

    const { blob, filename } = await packageToZip(zipList, 'todos_arquivos_convertidos.zip');
    downloadBlob(blob, filename);
  }, [files]);

  // Remove single file
  const handleRemove = useCallback((id: string) => {
    setFiles(prev => {
      const removed = prev.find(f => f.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      if (removed?.resultUrl) URL.revokeObjectURL(removed.resultUrl);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  // Clear all files
  const handleClearAll = useCallback(() => {
    files.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
    });
    setFiles([]);
  }, [files]);

  // Set target format for all files
  const handleSetGlobalTarget = useCallback((target: string) => {
    setFiles(prev => prev.map(item => ({
      ...item,
      targetFormat: target,
      status: 'idle',
      resultBlob: undefined,
      resultUrl: undefined
    })));
  }, []);

  // Save customized conversion settings
  const handleSaveSettings = useCallback((id: string, newOptions: ConversionOptions) => {
    setFiles(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, options: newOptions, status: 'idle' };
      }
      return item;
    }));
  }, []);

  // Create sample test files
  const handleAddSample = (type: 'csv' | 'json' | 'image' | 'markdown') => {
    if (type === 'csv') {
      const csvData = `Nome,Cargo,Departamento,Salario\nMaria Silva,Desenvolvedora Frontend,Tecnologia,8500\nCarlos Souza,Engenheiro de Dados,Tecnologia,9800\nAna Pereira,Product Manager,Produto,11000\nLucas Lima,Designer UI/UX,Design,7200`;
      const file = new File([csvData], 'equipe_empresa.csv', { type: 'text/csv' });
      handleFilesSelected([file]);
    } else if (type === 'json') {
      const jsonData = JSON.stringify({
        sistema: "OmniConvert",
        versao: "2.0.0",
        recursos: ["Imagens", "Tabelas", "Documentos", "Áudio", "ZIP"],
        ativo: true
      }, null, 2);
      const file = new File([jsonData], 'configuracao.json', { type: 'application/json' });
      handleFilesSelected([file]);
    } else if (type === 'markdown') {
      const mdData = `# Relatório de Demonstração\n\nEste documento foi gerado para testar o **OmniConvert**.\n\n## Recursos Suportados\n- Conversão para HTML\n- Conversão para PDF\n- Exportação para TXT\n`;
      const file = new File([mdData], 'documento_exemplo.md', { type: 'text/markdown' });
      handleFilesSelected([file]);
    } else if (type === 'image') {
      const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" rx="30" fill="#4f46e5" />
  <circle cx="200" cy="200" r="90" fill="#ffffff" opacity="0.9" />
  <text x="200" y="210" font-family="sans-serif" font-size="24" font-weight="bold" fill="#1e1b4b" text-anchor="middle">OmniConvert</text>
</svg>`;
      const file = new File([svgData], 'grafico_vetorial.svg', { type: 'image/svg+xml' });
      handleFilesSelected([file]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Header currentView={currentView} onSelectView={setCurrentView} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">

        {/* MODE 1: Universal Converter */}
        {currentView === 'converter' && (
          <div className="space-y-10 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Conversor Universal 100% no Navegador • GitHub Pages Ready</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Converta <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">qualquer arquivo</span> para outro compatível
              </h1>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                Transforme imagens, documentos, planilhas, tabelas e áudios com total privacidade. 
                Sem envio para servidores na nuvem, sem filas e com download individual ou em lote (.ZIP).
              </p>

              {/* Sample quick test buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-slate-500 text-[11px] font-medium mr-1">Quer testar agora?</span>
                <button
                  type="button"
                  onClick={() => handleAddSample('csv')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-slate-300 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Testar com CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSample('json')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-slate-300 transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Testar com JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSample('markdown')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-850 text-slate-300 transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-sky-400" />
                  <span>Testar com Markdown</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSample('image')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-850 text-slate-300 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                  <span>Testar com Imagem SVG</span>
                </button>
              </div>
            </div>

            {/* Drop Zone */}
            <DropZone onFilesSelected={handleFilesSelected} />

            {/* File Queue Section */}
            {files.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <BatchActionBar
                  files={files}
                  isConvertingAll={isConvertingAll}
                  onConvertAll={handleConvertAll}
                  onDownloadAllZip={handleDownloadAllZip}
                  onClearAll={handleClearAll}
                  onSetGlobalTarget={handleSetGlobalTarget}
                />

                <div className="space-y-3">
                  {files.map(item => (
                    <FileItemCard
                      key={item.id}
                      item={item}
                      onUpdateTarget={handleUpdateTarget}
                      onConvert={handleConvert}
                      onDownload={handleDownload}
                      onRemove={handleRemove}
                      onOpenSettings={(itm) => setSettingsItem(itm)}
                      onOpenPreview={(itm) => setPreviewItem(itm)}
                    />
                  ))}
                </div>

                <DropZone onFilesSelected={handleFilesSelected} isCompact />
              </div>
            )}

            {/* Features Highlights */}
            <FeaturesBanner />

            {/* Compatibility Matrix */}
            <CompatibilityMatrix />
          </div>
        )}

        {/* MODE 2: PDF Suite (All 32 Tools) */}
        {currentView === 'pdf' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
                <FileText className="w-3.5 h-3.5" />
                <span>Suite Completa de 32 Ferramentas PDF</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Todas as ferramentas PDF que você precisa
              </h1>
              <p className="text-slate-400 text-sm">
                Junte, divida, comprima, converta, edite, assine e proteja documentos PDF.
                100% gratuito e processado diretamente no seu navegador.
              </p>
            </div>

            <PdfToolsGrid onSelectTool={(tool) => setActivePdfTool(tool)} />
          </div>
        )}

        {/* MODE 3: Video & Audio Studio */}
        {currentView === 'media' && (
          <div className="space-y-8 animate-fade-in">
            <MediaToolsView />
          </div>
        )}

      </main>

      <Footer />

      {/* Settings Modal */}
      {settingsItem && (
        <SettingsModal
          item={settingsItem}
          onClose={() => setSettingsItem(null)}
          onSave={handleSaveSettings}
        />
      )}

      {/* Preview Modal */}
      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}

      {/* PDF Tool Modal */}
      {activePdfTool && (
        <PdfToolModal
          tool={activePdfTool}
          onClose={() => setActivePdfTool(null)}
        />
      )}
    </div>
  );
}

export default App;

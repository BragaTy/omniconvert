import React, { useState, useRef } from 'react';
import { X, UploadCloud, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { PdfToolItem } from './PdfToolsGrid';
import { downloadBlob, formatBytes } from '../utils/fileHelpers';
import * as pdfEngine from '../pdf/pdfEngine';

interface PdfToolModalProps {
  tool: PdfToolItem;
  onClose: () => void;
}

export const PdfToolModal: React.FC<PdfToolModalProps> = ({ tool, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState<string>('');
  const [textResult, setTextResult] = useState<string | null>(null);

  // Dynamic tool parameters
  const [splitRange, setSplitRange] = useState('');
  const [watermarkText, setWatermarkText] = useState('CONFIDENCIAL');
  const [password, setPassword] = useState('');
  const [rotateDeg, setRotateDeg] = useState<90 | 180 | 270>(90);
  const [htmlInput, setHtmlInput] = useState('<h1>Exemplo HTML</h1><p>Documento convertido para PDF.</p>');
  const [signatureText, setSignatureText] = useState('Assinado Digitalmente');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      setError(null);
      setSuccess(false);
      setResultBlob(null);
      setTextResult(null);
    }
  };

  const handleExecute = async () => {
    if (!tool) return;
    if (files.length === 0 && tool.id !== 'html_to_pdf') {
      setError('Por favor, selecione pelo menos um arquivo.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let outputBlob: Blob | null = null;
      let filename = 'documento_resultado.pdf';

      switch (tool.id) {
        case 'merge': {
          outputBlob = await pdfEngine.mergePdfs(files);
          filename = 'documentos_juntados.pdf';
          break;
        }
        case 'split': {
          const res = await pdfEngine.splitPdf(files[0], splitRange);
          outputBlob = res[0].blob;
          filename = res[0].name;
          break;
        }
        case 'compress': {
          outputBlob = await pdfEngine.compressPdf(files[0], 0.65);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_comprimido.pdf`;
          break;
        }
        case 'pdf_to_word': {
          outputBlob = await pdfEngine.pdfToWord(files[0]);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}.docx`;
          break;
        }
        case 'pdf_to_powerpoint': {
          outputBlob = await pdfEngine.pdfToPowerPoint(files[0]);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_apresentacao.html`;
          break;
        }
        case 'pdf_to_excel': {
          outputBlob = await pdfEngine.pdfToExcel(files[0]);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}.xlsx`;
          break;
        }
        case 'word_to_pdf': {
          outputBlob = await pdfEngine.wordToPdf(files[0]);
          filename = `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`;
          break;
        }
        case 'powerpoint_to_pdf': {
          outputBlob = await pdfEngine.powerpointToPdf(files[0]);
          filename = `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`;
          break;
        }
        case 'excel_to_pdf': {
          outputBlob = await pdfEngine.excelToPdf(files[0]);
          filename = `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf`;
          break;
        }
        case 'pdf_to_jpg': {
          const imgs = await pdfEngine.pdfToJpg(files[0]);
          outputBlob = imgs[0].blob;
          filename = imgs[0].name;
          break;
        }
        case 'jpg_to_pdf': {
          outputBlob = await pdfEngine.jpgToPdf(files);
          filename = 'imagens_convertidas.pdf';
          break;
        }
        case 'sign_pdf': {
          // Create simple signature canvas stamp
          const sigCanvas = document.createElement('canvas');
          sigCanvas.width = 300;
          sigCanvas.height = 100;
          const sCtx = sigCanvas.getContext('2d')!;
          sCtx.font = 'italic bold 24px cursive';
          sCtx.fillStyle = '#1e3a8a';
          sCtx.fillText(signatureText, 10, 60);
          const sigDataUrl = sigCanvas.toDataURL('image/png');

          outputBlob = await pdfEngine.signPdf(files[0], sigDataUrl, 0, 50, 50);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_assinado.pdf`;
          break;
        }
        case 'watermark': {
          outputBlob = await pdfEngine.watermarkPdf(files[0], watermarkText);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_marca_dagua.pdf`;
          break;
        }
        case 'rotate': {
          outputBlob = await pdfEngine.rotatePdf(files[0], rotateDeg);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_rotacionado.pdf`;
          break;
        }
        case 'html_to_pdf': {
          outputBlob = await pdfEngine.htmlToPdf(htmlInput);
          filename = 'pagina_convertida.pdf';
          break;
        }
        case 'protect': {
          outputBlob = await pdfEngine.protectPdf(files[0], password || '1234');
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_protegido.pdf`;
          break;
        }
        case 'unlock': {
          outputBlob = await pdfEngine.unlockPdf(files[0], password);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_desbloqueado.pdf`;
          break;
        }
        case 'organize': {
          outputBlob = await pdfEngine.organizePdf(files[0], [0]);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_organizado.pdf`;
          break;
        }
        case 'pdf_to_pdfa': {
          outputBlob = await pdfEngine.pdfToPdfA(files[0]);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_pdfa.pdf`;
          break;
        }
        case 'repair': {
          outputBlob = await pdfEngine.repairPdf(files[0]);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_reparado.pdf`;
          break;
        }
        case 'page_numbers': {
          outputBlob = await pdfEngine.addPageNumbers(files[0]);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_paginado.pdf`;
          break;
        }
        case 'ocr': {
          const res = await pdfEngine.ocrPdf(files[0]);
          outputBlob = res.blob;
          setTextResult(res.text);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_ocr.txt`;
          break;
        }
        case 'compare': {
          if (files.length < 2) throw new Error('Selecione 2 arquivos PDF para comparar.');
          const res = await pdfEngine.comparePdf(files[0], files[1]);
          setTextResult(res.report);
          outputBlob = new Blob([res.report], { type: 'text/plain;charset=utf-8' });
          filename = 'relatorio_comparacao.txt';
          break;
        }
        case 'crop': {
          outputBlob = await pdfEngine.cropPdf(files[0], 0.08);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_recortado.pdf`;
          break;
        }
        case 'redact': {
          outputBlob = await pdfEngine.redactPdf(files[0], [{ pageIndex: 0, x: 50, y: 700, width: 200, height: 25 }]);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_ocultado.pdf`;
          break;
        }
        case 'form': {
          outputBlob = await pdfEngine.formPdf(files[0], [{ pageIndex: 0, name: 'Nome_Completo', x: 50, y: 650, width: 250, height: 25 }]);
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_formulario.pdf`;
          break;
        }
        case 'summarize': {
          const summary = await pdfEngine.summarizePdf(files[0]);
          setTextResult(summary);
          outputBlob = new Blob([summary], { type: 'text/markdown;charset=utf-8' });
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_resumo.md`;
          break;
        }
        case 'translate': {
          const res = await pdfEngine.translatePdf(files[0], 'Inglês');
          setTextResult(res.translatedText);
          outputBlob = res.blob;
          filename = `${files[0].name.replace(/\.pdf$/i, '')}_traduzido.txt`;
          break;
        }
        case 'pdf_to_markdown': {
          const res = await pdfEngine.pdfToMarkdown(files[0]);
          setTextResult(res.markdown);
          outputBlob = res.blob;
          filename = `${files[0].name.replace(/\.pdf$/i, '')}.md`;
          break;
        }
        default: {
          outputBlob = await pdfEngine.repairPdf(files[0]);
          filename = `${files[0].name}_processado.pdf`;
          break;
        }
      }

      setResultBlob(outputBlob);
      setResultName(filename);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Ocorreu um erro ao processar o arquivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {tool.icon}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{tool.name}</h3>
              <p className="text-xs text-slate-400">{tool.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* File Picker */}
          {tool.id !== 'html_to_pdf' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-rose-500/50 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/60 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={tool.accept}
                multiple={tool.multiple}
                onChange={handleFiles}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-rose-400 mx-auto mb-2" />
              <p className="font-medium text-xs text-slate-200">
                {files.length > 0
                  ? `${files.length} arquivo(s) selecionado(s): ${files.map(f => f.name).join(', ')}`
                  : `Clique para selecionar arquivo(s) (${tool.accept})`}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {tool.multiple ? 'Você pode selecionar múltiplos arquivos para esta ferramenta' : 'Selecione um arquivo para processamento'}
              </p>
            </div>
          ) : (
            <div>
              <label className="text-xs text-slate-300 block mb-1.5">Insira o código HTML para gerar PDF:</label>
              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-rose-500"
              />
            </div>
          )}

          {/* Tool specific options */}
          {tool.id === 'split' && (
            <div>
              <label className="text-xs text-slate-300 block mb-1">Intervalo de Páginas (ex: 1-3, 5):</label>
              <input
                type="text"
                placeholder="Deixe em branco para separar todas as páginas"
                value={splitRange}
                onChange={(e) => setSplitRange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 outline-none"
              />
            </div>
          )}

          {tool.id === 'watermark' && (
            <div>
              <label className="text-xs text-slate-300 block mb-1">Texto da Marca d'Água:</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 outline-none"
              />
            </div>
          )}

          {tool.id === 'protect' && (
            <div>
              <label className="text-xs text-slate-300 block mb-1">Senha de Proteção:</label>
              <input
                type="password"
                placeholder="Digite a senha desejada..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 outline-none"
              />
            </div>
          )}

          {tool.id === 'rotate' && (
            <div>
              <label className="text-xs text-slate-300 block mb-1">Ângulo de Rotação:</label>
              <div className="grid grid-cols-3 gap-2">
                {[90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setRotateDeg(deg as any)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      rotateDeg === deg
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Girar {deg}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {tool.id === 'sign_pdf' && (
            <div>
              <label className="text-xs text-slate-300 block mb-1">Texto / Nome da Assinatura:</label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 outline-none font-serif"
              />
            </div>
          )}

          {/* Text result box for AI / OCR / Markdown / Compare */}
          {textResult && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300">Resultado Extraído / Gerado:</span>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 max-h-48 overflow-auto whitespace-pre-wrap">
                {textResult}
              </pre>
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success notice */}
          {success && resultBlob && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Processamento concluído com sucesso ({formatBytes(resultBlob.size)})!</span>
              </div>
              <button
                type="button"
                onClick={() => downloadBlob(resultBlob, resultName)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow"
              >
                <Download className="w-3.5 h-3.5" /> Baixar
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            Fechar
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleExecute}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <span>Executar {tool.name}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

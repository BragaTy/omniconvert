import React, { useState } from 'react';
import { 
  FileStack, Scissors, Minimize2, FileText, Presentation, Sheet, 
  FileCheck, Edit3, Image, FileSignature, Stamp, RotateCw, Globe, 
  Lock, Unlock, LayoutGrid, Award, Wrench, Hash, Camera, Search, 
  GitCompare, EyeOff, Crop, CheckSquare, 
  Code, ArrowRight, Star
} from 'lucide-react';

export interface PdfToolItem {
  id: string;
  name: string;
  category: 'organizar' | 'converter_de' | 'converter_para' | 'seguranca';
  description: string;
  icon: React.ReactNode;
  badge?: string;
  accept: string;
  multiple?: boolean;
}

export const PDF_TOOLS: PdfToolItem[] = [
  {
    id: 'merge',
    name: 'Juntar PDF',
    category: 'organizar',
    description: 'Mesclar e juntar PDFs e colocá-los em qualquer ordem que desejar. É tudo muito fácil e rápido!',
    icon: <FileStack className="w-6 h-6 text-rose-500" />,
    accept: '.pdf',
    multiple: true
  },
  {
    id: 'split',
    name: 'Dividir PDF',
    category: 'organizar',
    description: 'Selecione um intervalo de páginas, separe uma página, ou converta cada página do documento em arquivo PDF independente.',
    icon: <Scissors className="w-6 h-6 text-amber-500" />,
    accept: '.pdf'
  },
  {
    id: 'compress',
    name: 'Comprimir PDF',
    category: 'seguranca',
    description: 'Diminua o tamanho do seu arquivo PDF, mantendo a melhor qualidade possível. Otimize seus arquivos PDF.',
    icon: <Minimize2 className="w-6 h-6 text-emerald-500" />,
    accept: '.pdf'
  },
  {
    id: 'pdf_to_word',
    name: 'PDF para Word',
    category: 'converter_de',
    description: 'Converta facilmente seus ficheiros PDF para documentos WORD DOCX simples de editar.',
    icon: <FileText className="w-6 h-6 text-blue-500" />,
    accept: '.pdf'
  },
  {
    id: 'pdf_to_powerpoint',
    name: 'PDF para PowerPoint',
    category: 'converter_de',
    description: 'Converta seus ficheiros PDF para apresentações POWERPOINT PPTX fáceis de editar.',
    icon: <Presentation className="w-6 h-6 text-orange-500" />,
    accept: '.pdf'
  },
  {
    id: 'pdf_to_excel',
    name: 'PDF para Excel',
    category: 'converter_de',
    description: 'Retire dados direto de PDFs para planilhas do Excel em poucos segundos.',
    icon: <Sheet className="w-6 h-6 text-green-500" />,
    accept: '.pdf'
  },
  {
    id: 'word_to_pdf',
    name: 'Word para PDF',
    category: 'converter_para',
    description: 'Converta seus documentos WORD para PDF com a máxima qualidade e exatamente igual que o arquivo original.',
    icon: <FileText className="w-6 h-6 text-blue-400" />,
    accept: '.docx,.doc,.txt'
  },
  {
    id: 'powerpoint_to_pdf',
    name: 'PowerPoint para PDF',
    category: 'converter_para',
    description: 'Converta suas apresentações POWERPOINT para PDF com a máxima qualidade.',
    icon: <Presentation className="w-6 h-6 text-orange-400" />,
    accept: '.pptx,.ppt,.html,.txt'
  },
  {
    id: 'excel_to_pdf',
    name: 'Excel para PDF',
    category: 'converter_para',
    description: 'Converta suas tabelas EXCEL para PDF com as colunas ajustadas à largura da página.',
    icon: <Sheet className="w-6 h-6 text-emerald-400" />,
    accept: '.xlsx,.xls,.csv'
  },
  {
    id: 'edit_pdf',
    name: 'Editar PDF',
    category: 'organizar',
    description: 'Adicione texto, imagens, formas ou anotações livres a um documento PDF.',
    icon: <Edit3 className="w-6 h-6 text-cyan-500" />,
    accept: '.pdf'
  },
  {
    id: 'pdf_to_jpg',
    name: 'PDF para JPG',
    category: 'converter_de',
    description: 'Extraia todas as imagens contidas em um arquivo PDF ou converta cada página em um arquivo JPG.',
    icon: <Image className="w-6 h-6 text-yellow-500" />,
    accept: '.pdf'
  },
  {
    id: 'jpg_to_pdf',
    name: 'JPG para PDF',
    category: 'converter_para',
    description: 'Converta suas imagens JPG para PDF. Ajuste a orientação e as margens.',
    icon: <Image className="w-6 h-6 text-yellow-400" />,
    accept: 'image/*',
    multiple: true
  },
  {
    id: 'sign_pdf',
    name: 'Assinar PDF',
    category: 'seguranca',
    description: 'Assine você mesmo ou adicione rubricas e carimbos desenhados com o mouse ou toque.',
    icon: <FileSignature className="w-6 h-6 text-violet-500" />,
    accept: '.pdf'
  },
  {
    id: 'watermark',
    name: "Marca d'água",
    category: 'seguranca',
    description: 'Escolha uma imagem ou texto para inserir sobre o seu PDF. Selecione a posição e transparência.',
    icon: <Stamp className="w-6 h-6 text-pink-500" />,
    accept: '.pdf'
  },
  {
    id: 'rotate',
    name: 'Rodar PDF',
    category: 'organizar',
    description: 'Gire o PDF que quiser. Gire várias páginas de uma só vez!',
    icon: <RotateCw className="w-6 h-6 text-indigo-400" />,
    accept: '.pdf'
  },
  {
    id: 'html_to_pdf',
    name: 'HTML para PDF',
    category: 'converter_para',
    description: 'Converta páginas Web em HTML para PDF com um clique.',
    icon: <Globe className="w-6 h-6 text-teal-400" />,
    accept: '.html,.htm,.txt'
  },
  {
    id: 'unlock',
    name: 'Desbloquear PDF',
    category: 'seguranca',
    description: 'Remova restrições e segurança dos PDFs, para usá-los como quiser.',
    icon: <Unlock className="w-6 h-6 text-red-400" />,
    accept: '.pdf'
  },
  {
    id: 'protect',
    name: 'Proteger PDF',
    category: 'seguranca',
    description: 'Protege arquivos PDF com uma senha. Encripte documentos PDF contra acessos indevidos.',
    icon: <Lock className="w-6 h-6 text-slate-300" />,
    accept: '.pdf'
  },
  {
    id: 'organize',
    name: 'Organizar PDF',
    category: 'organizar',
    description: 'Ordene as páginas de seu arquivo PDF como pretender. Exclua ou reordene páginas.',
    icon: <LayoutGrid className="w-6 h-6 text-purple-400" />,
    accept: '.pdf'
  },
  {
    id: 'pdf_to_pdfa',
    name: 'PDF para PDF/A',
    category: 'converter_de',
    description: 'Transforme seu PDF em PDF/A, a versão ISO para arquivo de longa duração.',
    icon: <Award className="w-6 h-6 text-amber-400" />,
    accept: '.pdf'
  },
  {
    id: 'repair',
    name: 'Reparar PDF',
    category: 'seguranca',
    description: 'Repare arquivos PDF danificados ou com erros de tabela XREF corrompida.',
    icon: <Wrench className="w-6 h-6 text-zinc-400" />,
    accept: '.pdf'
  },
  {
    id: 'page_numbers',
    name: 'Números de página',
    category: 'organizar',
    description: 'Adicione números de página em documentos PDF facilmente. Escolha posição e formatação!',
    icon: <Hash className="w-6 h-6 text-blue-300" />,
    accept: '.pdf'
  },
  {
    id: 'scan_to_pdf',
    name: 'Digitalize e transforme em PDF',
    category: 'converter_para',
    description: 'Capture digitalizações com sua câmera/webcam e gere um PDF limpo instantaneamente.',
    icon: <Camera className="w-6 h-6 text-emerald-400" />,
    accept: 'image/*'
  },
  {
    id: 'ocr',
    name: 'Extrair Texto do PDF',
    category: 'converter_de',
    description: 'Extraia todo o texto contido em um arquivo PDF para um documento TXT pesquisável.',
    icon: <Search className="w-6 h-6 text-cyan-400" />,
    accept: '.pdf'
  },
  {
    id: 'compare',
    name: 'Comparar PDF',
    category: 'seguranca',
    description: 'Compare dois documentos e identifique facilmente alterações e similaridade de conteúdo.',
    icon: <GitCompare className="w-6 h-6 text-indigo-400" />,
    accept: '.pdf',
    multiple: true
  },
  {
    id: 'redact',
    name: 'Ocultar PDF',
    category: 'seguranca',
    description: 'Oculte texto e gráficos para remover permanentemente informações sensíveis de um PDF.',
    icon: <EyeOff className="w-6 h-6 text-rose-400" />,
    accept: '.pdf'
  },
  {
    id: 'crop',
    name: 'Recortar PDF',
    category: 'organizar',
    description: 'Recorte as margens de documentos PDF para ajustar a leitura em qualquer dispositivo.',
    icon: <Crop className="w-6 h-6 text-teal-400" />,
    accept: '.pdf'
  },
  {
    id: 'form',
    name: 'Formulários PDF',
    category: 'organizar',
    badge: 'Novo!',
    description: 'Crie PDFs preenchíveis interativos ou adicione campos de texto editáveis.',
    icon: <CheckSquare className="w-6 h-6 text-emerald-400" />,
    accept: '.pdf'
  },
  {
    id: 'pdf_to_markdown',
    name: 'PDF para Markdown',
    category: 'converter_de',
    badge: 'Novo!',
    description: 'Converta PDFs em arquivos Markdown (.md) estruturados para documentação e anotações.',
    icon: <Code className="w-6 h-6 text-indigo-400" />,
    accept: '.pdf'
  }
];

interface PdfToolsGridProps {
  onSelectTool: (tool: PdfToolItem) => void;
}

export const PdfToolsGrid: React.FC<PdfToolsGridProps> = ({ onSelectTool }) => {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredTools = PDF_TOOLS.filter(tool => {
    const matchesCategory = filter === 'all' || tool.category === filter;
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                          tool.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: `Todos (${PDF_TOOLS.length})` },
            { id: 'organizar', label: 'Organizar & Editar' },
            { id: 'converter_de', label: 'Converter de PDF' },
            { id: 'converter_para', label: 'Converter para PDF' },
            { id: 'seguranca', label: 'Otimizar & Segurança' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar ferramenta PDF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onSelectTool(tool)}
            className="group relative p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-lg hover:shadow-rose-500/10"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-slate-800/80 group-hover:bg-slate-800 transition-colors">
                  {tool.icon}
                </div>
                {tool.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    {tool.badge}
                  </span>
                )}
              </div>

              <h4 className="font-bold text-slate-100 text-sm mb-1 group-hover:text-rose-400 transition-colors">
                {tool.name}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 group-hover:text-rose-400 font-medium">
              <span>Usar ferramenta</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { marked } from 'marked';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { ConversionOptions } from '../types';

// Ensure pdf.js worker is properly configured for browser environments
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export interface StructuredParagraph {
  text: string;
  isHeading?: boolean;
  headingLevel?: number;
  isList?: boolean;
}

export interface ExtractedDocument {
  fullText: string;
  paragraphs: StructuredParagraph[];
  pages?: { pageNum: number; lines: string[]; text: string }[];
}

export async function convertDocument(
  file: File,
  targetFormat: string,
  options: ConversionOptions
): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const inputExt = (file.name.split('.').pop() || '').toLowerCase();
  const target = targetFormat.toLowerCase();

  // 1. Special case: PDF to Images (PNG, JPG, WEBP)
  if (inputExt === 'pdf' && (target === 'png' || target === 'jpg' || target === 'jpeg' || target === 'webp')) {
    return await convertPdfToImages(file, target, options);
  }

  // 2. Special case: PDF to Excel (XLSX)
  if (inputExt === 'pdf' && target === 'xlsx') {
    const docData = await extractStructuredPdfText(file);
    const rows = docData.pages.flatMap(p => 
      p.lines.map(line => {
        if (line.includes('\t')) return line.split('\t');
        if (line.includes(';')) return line.split(';');
        if (line.includes(',')) return line.split(',');
        return line.split(/\s{2,}/);
      })
    );
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows.length > 0 ? rows : [['Nenhum dado tabular detectado no PDF']]);
    XLSX.utils.book_append_sheet(wb, ws, 'Dados_PDF');
    const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbOut], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return { blob, filename: `${baseName}.xlsx` };
  }

  // 3. Extract text and structure from input file without corrupting binary streams
  const extracted = await extractDocumentTextAndStructure(file, inputExt);

  // 4. Target: DOCX (Word Document)
  if (target === 'docx') {
    const docxBlob = await buildDocxFromStructure(baseName, extracted.paragraphs);
    return { blob: docxBlob, filename: `${baseName}.docx` };
  }

  // 5. Target: PDF (Portable Document Format)
  if (target === 'pdf') {
    const pdfBlob = buildPdfFromStructure(baseName, extracted.paragraphs, options);
    return { blob: pdfBlob, filename: `${baseName}.pdf` };
  }

  // 6. Target: HTML
  if (target === 'html') {
    let bodyHtml = '';
    if (inputExt === 'md' || inputExt === 'markdown') {
      bodyHtml = await marked.parse(extracted.fullText);
    } else {
      bodyHtml = extracted.paragraphs
        .map(p => {
          if (p.isHeading) {
            const tag = `h${Math.min(Math.max(p.headingLevel || 2, 1), 6)}`;
            return `<${tag}>${escapeHtml(p.text)}</${tag}>`;
          }
          if (p.isList) {
            return `<ul><li>${escapeHtml(p.text)}</li></ul>`;
          }
          return `<p>${escapeHtml(p.text)}</p>`;
        })
        .join('\n');
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(baseName)}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      padding: 48px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    h1, h2, h3, h4 { color: #0f172a; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; }
    h1 { font-size: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4em; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    p { margin: 1em 0; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #3b82f6; margin-left: 0; padding-left: 16px; color: #64748b; font-style: italic; }
    ul, ol { padding-left: 24px; margin: 1em 0; }
    li { margin: 0.4em 0; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .container { box-shadow: none; border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(baseName)}</h1>
    ${bodyHtml}
  </div>
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    return { blob, filename: `${baseName}.html` };
  }

  // 7. Target: Markdown (MD)
  if (target === 'md' || target === 'markdown') {
    let md = '';
    if (inputExt === 'html' || inputExt === 'htm') {
      md = htmlToMarkdown(extracted.fullText);
    } else {
      md = `# ${baseName}\n\n`;
      for (const p of extracted.paragraphs) {
        if (p.isHeading) {
          const prefix = '#'.repeat(Math.min(Math.max((p.headingLevel || 2) + 1, 2), 5));
          md += `${prefix} ${p.text}\n\n`;
        } else if (p.isList) {
          md += `- ${p.text}\n`;
        } else {
          md += `${p.text}\n\n`;
        }
      }
    }
    const blob = new Blob([md.trim()], { type: 'text/markdown;charset=utf-8' });
    return { blob, filename: `${baseName}.md` };
  }

  // 8. Target: TXT (Plain text)
  if (target === 'txt') {
    const blob = new Blob([extracted.fullText], { type: 'text/plain;charset=utf-8' });
    return { blob, filename: `${baseName}.txt` };
  }

  // Fallback: UTF-8 plain text with target extension
  const blob = new Blob([extracted.fullText], { type: 'text/plain;charset=utf-8' });
  return { blob, filename: `${baseName}.${target}` };
}

// Extract PDF text page-by-page and group text items into natural lines
export async function extractStructuredPdfText(file: File): Promise<{
  pages: { pageNum: number; lines: string[]; text: string }[];
  fullText: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const pages: { pageNum: number; lines: string[]; text: string }[] = [];
  let fullText = '';

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];

    if (items.length === 0) {
      pages.push({ pageNum: i, lines: [], text: '' });
      continue;
    }

    // Group items into visual lines by Y coordinate
    const lineBuckets: { y: number; items: any[] }[] = [];
    const yTolerance = 5; // tolerance in points

    for (const item of items) {
      const y = item.transform ? item.transform[5] : 0;
      let bucket = lineBuckets.find(b => Math.abs(b.y - y) <= yTolerance);
      if (!bucket) {
        bucket = { y, items: [] };
        lineBuckets.push(bucket);
      }
      bucket.items.push(item);
    }

    // Sort lines top to bottom (descending Y)
    lineBuckets.sort((a, b) => b.y - a.y);

    const pageLines: string[] = [];
    for (const bucket of lineBuckets) {
      // Sort items within line from left to right (ascending X)
      bucket.items.sort((a, b) => (a.transform ? a.transform[4] : 0) - (b.transform ? b.transform[4] : 0));
      const lineStr = bucket.items.map(it => it.str).join(' ').replace(/\s{2,}/g, ' ').trim();
      if (lineStr.length > 0) {
        pageLines.push(lineStr);
      }
    }

    const pageText = pageLines.join('\n');
    pages.push({ pageNum: i, lines: pageLines, text: pageText });
    fullText += (i > 1 ? `\n\n--- Página ${i} ---\n\n` : `--- Página ${i} ---\n\n`) + pageText;
  }

  return { pages, fullText: fullText.trim() };
}

// Extract DOCX text, paragraphs, and headings from word/document.xml
export async function extractDocxContent(file: File): Promise<{
  paragraphs: StructuredParagraph[];
  fullText: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  let docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    const matchKey = Object.keys(zip.files).find(k => k.endsWith('document.xml'));
    if (matchKey) {
      docXmlFile = zip.file(matchKey);
    }
  }

  if (!docXmlFile) {
    throw new Error('Não foi possível ler o documento Word (document.xml não encontrado).');
  }

  const xmlText = await docXmlFile.async('text');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

  const paragraphs: StructuredParagraph[] = [];
  const pNodes = xmlDoc.getElementsByTagName('w:p');

  for (let i = 0; i < pNodes.length; i++) {
    const pNode = pNodes[i];

    let isHeading = false;
    let headingLevel = 1;
    const pStyle = pNode.getElementsByTagName('w:pStyle')[0];
    if (pStyle) {
      const val = (pStyle.getAttribute('w:val') || '').toLowerCase();
      if (val.includes('heading') || val.includes('titulo') || val.includes('title')) {
        isHeading = true;
        const numMatch = val.match(/\d+/);
        headingLevel = numMatch ? parseInt(numMatch[0], 10) : 1;
      }
    }

    const isList = pNode.getElementsByTagName('w:numPr').length > 0;
    const tNodes = pNode.getElementsByTagName('w:t');
    let pText = '';
    for (let j = 0; j < tNodes.length; j++) {
      pText += tNodes[j].textContent || '';
    }

    const trimmed = pText.trim();
    if (trimmed.length > 0) {
      paragraphs.push({
        text: trimmed,
        isHeading,
        headingLevel,
        isList
      });
    }
  }

  const fullText = paragraphs.map(p => p.text).join('\n\n');
  return { paragraphs, fullText };
}

// Extract readable text from RTF or legacy binary DOC
export async function extractLegacyDocOrRtfText(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || '').toLowerCase();

  if (ext === 'rtf') {
    const raw = await file.text();
    return raw
      .replace(/\\par[d]?/g, '\n')
      .replace(/\\tab/g, '\t')
      .replace(/\\'[0-9a-fA-F]{2}/g, ' ')
      .replace(/\\u([0-9]{2,5})\?/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
      .replace(/\\[a-zA-Z]+(-?[0-9]+)? ?/g, '')
      .replace(/[{}]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // Legacy binary Word DOC (OLE2 format): extract printable Unicode and ASCII strings
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let asciiStr = '';

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b >= 32 && b <= 126) {
      asciiStr += String.fromCharCode(b);
    } else if (b === 10 || b === 13) {
      asciiStr += '\n';
    } else {
      asciiStr += '\x00';
    }
  }

  const chunks = asciiStr
    .split('\0')
    .map(c => c.trim())
    .filter(c => c.length > 3 && /[a-zA-Z0-9]/.test(c));

  return chunks.join('\n\n');
}

// Unified document reader: returns structured paragraphs and clean plain text
export async function extractDocumentTextAndStructure(
  file: File,
  inputExt: string
): Promise<ExtractedDocument> {
  if (inputExt === 'pdf') {
    const { pages, fullText } = await extractStructuredPdfText(file);
    const paragraphs: StructuredParagraph[] = [];

    for (const p of pages) {
      for (const line of p.lines) {
        const isHeading = line.length < 55 && !line.endsWith('.') && !line.endsWith(',');
        paragraphs.push({
          text: line,
          isHeading,
          headingLevel: line.length < 30 ? 1 : 2
        });
      }
    }

    return { fullText, paragraphs, pages };
  }

  if (inputExt === 'docx') {
    return await extractDocxContent(file);
  }

  if (inputExt === 'doc' || inputExt === 'rtf') {
    const fullText = await extractLegacyDocOrRtfText(file);
    const lines = fullText.split('\n').filter(l => l.trim().length > 0);
    const paragraphs = lines.map(line => ({ text: line.trim() }));
    return { fullText, paragraphs };
  }

  if (inputExt === 'html' || inputExt === 'htm') {
    const html = await file.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const fullText = doc.body.textContent || '';
    const paragraphs: StructuredParagraph[] = [];

    doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li').forEach(el => {
      const text = (el.textContent || '').trim();
      if (!text) return;
      const tag = el.tagName.toLowerCase();
      if (tag.startsWith('h')) {
        paragraphs.push({ text, isHeading: true, headingLevel: parseInt(tag[1], 10) });
      } else if (tag === 'li') {
        paragraphs.push({ text, isList: true });
      } else {
        paragraphs.push({ text });
      }
    });

    return { fullText: fullText.trim(), paragraphs };
  }

  // TXT or Markdown
  const fullText = await file.text();
  const lines = fullText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const paragraphs: StructuredParagraph[] = lines.map(line => {
    if (line.startsWith('#')) {
      const level = (line.match(/^#+/) || ['#'])[0].length;
      return { text: line.replace(/^#+\s*/, ''), isHeading: true, headingLevel: level };
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return { text: line.replace(/^[-*]\s*/, ''), isList: true };
    }
    return { text: line };
  });

  return { fullText, paragraphs };
}

// Build a real standard Microsoft Word .docx file
export async function buildDocxFromStructure(
  title: string,
  paragraphs: StructuredParagraph[]
): Promise<Blob> {
  const docxParagraphs: Paragraph[] = [];

  // Title paragraph
  docxParagraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { before: 240, after: 240 }
    })
  );

  for (const p of paragraphs) {
    if (p.isHeading) {
      let hl: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1;
      if (p.headingLevel === 2) hl = HeadingLevel.HEADING_2;
      else if (p.headingLevel === 3) hl = HeadingLevel.HEADING_3;
      else if (p.headingLevel && p.headingLevel >= 4) hl = HeadingLevel.HEADING_4;

      docxParagraphs.push(
        new Paragraph({
          text: p.text,
          heading: hl,
          spacing: { before: 280, after: 120 }
        })
      );
    } else if (p.isList) {
      docxParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: p.text, size: 22 })],
          bullet: { level: 0 },
          spacing: { after: 80 }
        })
      );
    } else {
      docxParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: p.text, size: 22 })],
          spacing: { after: 120, line: 276 }
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: docxParagraphs
      }
    ]
  });

  return await Packer.toBlob(doc);
}

// Render structured paragraphs to a crisp, formatted PDF using jsPDF
export function buildPdfFromStructure(
  title: string,
  paragraphs: StructuredParagraph[],
  options: ConversionOptions
): Blob {
  const doc = new jsPDF({
    orientation: options.pdfOrientation || 'portrait',
    unit: 'pt',
    format: options.pdfPageSize || 'a4'
  });

  const margin = options.pdfMargin ?? 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  const bottomThreshold = pageHeight - margin - 25;

  let y = margin + 25;
  let pageNum = 1;

  const addFooter = (p: number) => {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Página ${p}`, pageWidth / 2, pageHeight - 18, { align: 'center' });
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > bottomThreshold) {
      addFooter(pageNum);
      doc.addPage();
      pageNum++;
      y = margin + 25;
    }
  };

  // Render Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleLines = doc.splitTextToSize(title, contentWidth);
  for (const tLine of titleLines) {
    checkPageBreak(24);
    doc.text(tLine, margin, y);
    y += 24;
  }
  y += 10;

  // Render Paragraphs
  for (const p of paragraphs) {
    if (p.isHeading) {
      const fontSize = p.headingLevel === 1 ? 14 : (p.headingLevel === 2 ? 12 : 11);
      const lineHeight = fontSize + 7;
      checkPageBreak(lineHeight + 14);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(fontSize);
      doc.setTextColor(15, 23, 42);

      y += 8;
      const lines = doc.splitTextToSize(p.text, contentWidth);
      for (const line of lines) {
        checkPageBreak(lineHeight);
        doc.text(line, margin, y);
        y += lineHeight;
      }
      y += 4;
    } else {
      const fontSize = 10;
      const lineHeight = 15;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(51, 65, 85); // slate-700

      const indent = p.isList ? 14 : 0;
      const prefix = p.isList ? '• ' : '';
      const availableW = contentWidth - indent;

      const lines = doc.splitTextToSize(p.text, availableW);
      for (let i = 0; i < lines.length; i++) {
        checkPageBreak(lineHeight);
        if (i === 0 && p.isList) {
          doc.text(prefix + lines[i], margin, y);
        } else {
          doc.text(lines[i], margin + indent, y);
        }
        y += lineHeight;
      }
      y += 5; // spacing between paragraphs
    }
  }

  addFooter(pageNum);
  return doc.output('blob');
}

// Convert PDF pages to high-resolution images (single image or ZIP of images)
export async function convertPdfToImages(
  file: File,
  targetFormat: string,
  options: ConversionOptions
): Promise<{ blob: Blob; filename: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const numPages = pdfDoc.numPages;
  const mimeType = targetFormat === 'png' ? 'image/png' : (targetFormat === 'webp' ? 'image/webp' : 'image/jpeg');
  const quality = options.imageQuality ?? 0.92;
  const scale = 2.0; // High DPI for razor sharp text

  if (numPages === 1) {
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    if (targetFormat !== 'png') {
      ctx.fillStyle = options.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob = await new Promise<Blob>((res, rej) => {
      canvas.toBlob(b => b ? res(b) : rej(new Error('Falha ao renderizar página do PDF')), mimeType, quality);
    });

    return { blob, filename: `${baseName}.${targetFormat}` };
  }

  // Multi-page PDF: Render all pages and bundle into ZIP
  const zip = new JSZip();
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    if (targetFormat !== 'png') {
      ctx.fillStyle = options.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: ctx, viewport }).promise;
    const pageBlob = await new Promise<Blob>((res, rej) => {
      canvas.toBlob(b => b ? res(b) : rej(new Error(`Falha ao renderizar página ${i}`)), mimeType, quality);
    });

    zip.file(`${baseName}_pagina_${i}.${targetFormat}`, pageBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  return { blob: zipBlob, filename: `${baseName}_paginas_${targetFormat}.zip` };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue || '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();
    const childrenText = Array.from(el.childNodes).map(processNode).join('');

    switch (tagName) {
      case 'h1': return `\n# ${childrenText.trim()}\n\n`;
      case 'h2': return `\n## ${childrenText.trim()}\n\n`;
      case 'h3': return `\n### ${childrenText.trim()}\n\n`;
      case 'h4': return `\n#### ${childrenText.trim()}\n\n`;
      case 'p': return `\n${childrenText.trim()}\n\n`;
      case 'strong':
      case 'b': return `**${childrenText}**`;
      case 'em':
      case 'i': return `*${childrenText}*`;
      case 'code': return `\`${childrenText}\``;
      case 'pre': return `\n\`\`\`\n${childrenText.trim()}\n\`\`\`\n\n`;
      case 'a': return `[${childrenText}](${el.getAttribute('href') || ''})`;
      case 'li': return `- ${childrenText.trim()}\n`;
      case 'ul':
      case 'ol': return `\n${childrenText}\n`;
      case 'br': return '\n';
      case 'hr': return '\n---\n\n';
      default: return childrenText;
    }
  }

  return processNode(doc.body).replace(/\n{3,}/g, '\n\n').trim();
}

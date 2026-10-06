import { marked } from 'marked';
import { jsPDF } from 'jspdf';
import { ConversionOptions } from '../types';

export async function convertDocument(
  file: File,
  targetFormat: string,
  options: ConversionOptions
): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const inputExt = (file.name.split('.').pop() || '').toLowerCase();
  const target = targetFormat.toLowerCase();

  const textContent = await file.text();

  // MD to HTML
  if ((inputExt === 'md' || inputExt === 'markdown') && target === 'html') {
    const htmlBody = await marked.parse(textContent);
    const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${baseName}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h1, h2, h3 { color: #0f172a; margin-top: 1.5em; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #3b82f6; margin-left: 0; padding-left: 16px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; }
  </style>
</head>
<body>
${htmlBody}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    return { blob, filename: `${baseName}.html` };
  }

  // HTML to Markdown
  if ((inputExt === 'html' || inputExt === 'htm') && target === 'md') {
    const md = htmlToMarkdown(textContent);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    return { blob, filename: `${baseName}.md` };
  }

  // Any text document to PDF
  if (target === 'pdf') {
    let textToRender = textContent;
    if (inputExt === 'html' || inputExt === 'htm') {
      textToRender = stripHtmlTags(textContent);
    }

    const doc = new jsPDF({
      orientation: options.pdfOrientation || 'portrait',
      unit: 'pt',
      format: options.pdfPageSize || 'a4'
    });

    const margin = options.pdfMargin ?? 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - margin * 2;
    const lineHeight = 16;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);

    const lines = doc.splitTextToSize(textToRender, maxLineWidth);
    let y = margin + 20;
    let pageNum = 1;

    for (let i = 0; i < lines.length; i++) {
      if (y + lineHeight > pageHeight - margin) {
        // Add footer page number
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${pageNum}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

        doc.addPage();
        pageNum++;
        y = margin + 20;
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
      }
      doc.text(lines[i], margin, y);
      y += lineHeight;
    }

    // Add footer on last page
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${pageNum}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

    const pdfBlob = doc.output('blob');
    return { blob: pdfBlob, filename: `${baseName}.pdf` };
  }

  // Document to TXT
  if (target === 'txt') {
    let plainText = textContent;
    if (inputExt === 'html' || inputExt === 'htm') {
      plainText = stripHtmlTags(textContent);
    }
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    return { blob, filename: `${baseName}.txt` };
  }

  // TXT to HTML
  if (target === 'html') {
    const escaped = escapeHtml(textContent);
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${baseName}</title>
  <style>
    body { font-family: monospace; white-space: pre-wrap; padding: 2rem; background: #fafafa; color: #333; line-height: 1.5; }
  </style>
</head>
<body>${escaped}</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    return { blob, filename: `${baseName}.html` };
  }

  // Fallback to text
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  return { blob, filename: `${baseName}.${target}` };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripHtmlTags(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
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

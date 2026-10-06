import { FileCategory, FormatOption } from '../types';

export const ALL_FORMATS: Record<string, FormatOption> = {
  // Images
  png: { extension: 'png', label: 'PNG', mimeType: 'image/png', category: 'image', description: 'Imagem com transparência sem perdas' },
  jpg: { extension: 'jpg', label: 'JPG / JPEG', mimeType: 'image/jpeg', category: 'image', description: 'Imagem comprimida padrão para fotos' },
  jpeg: { extension: 'jpeg', label: 'JPEG', mimeType: 'image/jpeg', category: 'image', description: 'Formato de imagem fotográfica' },
  webp: { extension: 'webp', label: 'WEBP', mimeType: 'image/webp', category: 'image', description: 'Formato moderno do Google com alta compressão' },
  bmp: { extension: 'bmp', label: 'BMP', mimeType: 'image/bmp', category: 'image', description: 'Mapa de bits sem compressão' },
  ico: { extension: 'ico', label: 'ICO', mimeType: 'image/x-icon', category: 'image', description: 'Ícone para sites (favicon) e apps' },
  svg: { extension: 'svg', label: 'SVG', mimeType: 'image/svg+xml', category: 'image', description: 'Gráfico vetorial escalável' },
  gif: { extension: 'gif', label: 'GIF', mimeType: 'image/gif', category: 'image', description: 'Imagem / animação leve' },
  base64: { extension: 'txt', label: 'Base64 (URI)', mimeType: 'text/plain', category: 'other', description: 'Texto codificado em Base64 para código/web' },

  // Documents
  pdf: { extension: 'pdf', label: 'PDF', mimeType: 'application/pdf', category: 'document', description: 'Documento portátil legível em qualquer dispositivo' },
  docx: { extension: 'docx', label: 'Word (DOCX)', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'document', description: 'Documento editável do Microsoft Word' },
  txt: { extension: 'txt', label: 'TXT', mimeType: 'text/plain', category: 'document', description: 'Arquivo de texto puro simples' },
  md: { extension: 'md', label: 'Markdown (MD)', mimeType: 'text/markdown', category: 'document', description: 'Texto com marcação simplificada' },
  html: { extension: 'html', label: 'HTML', mimeType: 'text/html', category: 'document', description: 'Página web formatada' },

  // Data / Tables
  csv: { extension: 'csv', label: 'CSV', mimeType: 'text/csv', category: 'data', description: 'Tabela de valores separados por vírgula' },
  tsv: { extension: 'tsv', label: 'TSV', mimeType: 'text/tab-separated-values', category: 'data', description: 'Tabela separada por tabulações' },
  json: { extension: 'json', label: 'JSON', mimeType: 'application/json', category: 'data', description: 'Formato padrão para intercâmbio de dados' },
  xlsx: { extension: 'xlsx', label: 'Excel (XLSX)', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'data', description: 'Planilha eletrônica do Microsoft Excel' },
  xls: { extension: 'xls', label: 'Excel (XLS)', mimeType: 'application/vnd.ms-excel', category: 'data', description: 'Planilha legada do Excel' },
  xml: { extension: 'xml', label: 'XML', mimeType: 'application/xml', category: 'data', description: 'Marcação extensível de dados' },
  yaml: { extension: 'yaml', label: 'YAML', mimeType: 'application/x-yaml', category: 'data', description: 'Formato human-readable para configuração' },
  yml: { extension: 'yml', label: 'YML', mimeType: 'application/x-yaml', category: 'data', description: 'Arquivo YAML' },

  // Audio
  mp3: { extension: 'mp3', label: 'MP3', mimeType: 'audio/mpeg', category: 'audio', description: 'Áudio comprimido universal' },
  wav: { extension: 'wav', label: 'WAV', mimeType: 'audio/wav', category: 'audio', description: 'Áudio de estúdio de alta fidelidade sem perdas' },
  ogg: { extension: 'ogg', label: 'OGG', mimeType: 'audio/ogg', category: 'audio', description: 'Áudio de código aberto Vorbis' },
  aac: { extension: 'aac', label: 'AAC', mimeType: 'audio/aac', category: 'audio', description: 'Áudio comprimido de alta qualidade' },
  m4a: { extension: 'm4a', label: 'M4A', mimeType: 'audio/mp4', category: 'audio', description: 'Formato de áudio Apple MPEG-4' },
  flac: { extension: 'flac', label: 'FLAC', mimeType: 'audio/flac', category: 'audio', description: 'Áudio comprimido sem perdas (lossless)' },

  // Archive
  zip: { extension: 'zip', label: 'ZIP', mimeType: 'application/zip', category: 'archive', description: 'Arquivo comprimido com múltiplos arquivos' },
  
  // Hash / Checksum
  hash: { extension: 'txt', label: 'Checksum / Hash (SHA-256)', mimeType: 'text/plain', category: 'other', description: 'Verificação criptográfica de integridade' }
};

export function detectCategory(extension: string, mimeType?: string): FileCategory {
  const ext = extension.toLowerCase().replace(/^\./, '');
  
  const imageExts = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'ico', 'svg', 'gif', 'tiff', 'tif', 'avif'];
  const docExts = ['pdf', 'txt', 'md', 'markdown', 'html', 'htm', 'rtf', 'docx', 'doc'];
  const dataExts = ['csv', 'tsv', 'json', 'xlsx', 'xls', 'xml', 'yaml', 'yml'];
  const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'weba', 'wma'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];

  if (imageExts.includes(ext) || mimeType?.startsWith('image/')) return 'image';
  if (dataExts.includes(ext) || mimeType?.includes('spreadsheet') || mimeType?.includes('json') || mimeType?.includes('csv')) return 'data';
  if (docExts.includes(ext) || mimeType?.startsWith('text/') || mimeType?.includes('pdf')) return 'document';
  if (audioExts.includes(ext) || mimeType?.startsWith('audio/')) return 'audio';
  if (archiveExts.includes(ext) || mimeType?.includes('zip')) return 'archive';

  return 'other';
}

export function getCompatibleTargets(ext: string, category: FileCategory): FormatOption[] {
  const cleanExt = ext.toLowerCase().replace(/^\./, '');
  const targets: FormatOption[] = [];

  switch (category) {
    case 'image': {
      const candidates = ['png', 'jpg', 'webp', 'bmp', 'ico', 'pdf', 'svg', 'base64'];
      candidates.forEach(c => {
        if (c !== cleanExt && ALL_FORMATS[c]) {
          targets.push(ALL_FORMATS[c]);
        }
      });
      // Allow ZIP & Hash for all files
      targets.push(ALL_FORMATS['zip']);
      targets.push(ALL_FORMATS['hash']);
      break;
    }

    case 'data': {
      let candidates: string[] = [];
      if (['csv', 'tsv'].includes(cleanExt)) {
        candidates = ['xlsx', 'pdf', 'json', 'yaml', 'xml', 'html', 'txt'];
      } else if (cleanExt === 'json') {
        candidates = ['csv', 'xlsx', 'pdf', 'yaml', 'xml', 'txt'];
      } else if (['xlsx', 'xls'].includes(cleanExt)) {
        candidates = ['pdf', 'csv', 'json', 'html', 'txt', 'xml', 'yaml'];
      } else if (['yaml', 'yml'].includes(cleanExt)) {
        candidates = ['json', 'csv', 'xlsx', 'xml', 'txt'];
      } else if (cleanExt === 'xml') {
        candidates = ['json', 'csv', 'xlsx', 'yaml', 'txt'];
      } else {
        candidates = ['json', 'csv', 'xlsx', 'yaml', 'txt'];
      }

      candidates.forEach(c => {
        if (c !== cleanExt && ALL_FORMATS[c]) {
          targets.push(ALL_FORMATS[c]);
        }
      });
      targets.push(ALL_FORMATS['zip']);
      targets.push(ALL_FORMATS['hash']);
      break;
    }

    case 'document': {
      let candidates: string[] = [];
      if (cleanExt === 'pdf') {
        candidates = ['docx', 'txt', 'md', 'html', 'png', 'jpg', 'xlsx'];
      } else if (['docx', 'doc', 'rtf', 'odt'].includes(cleanExt)) {
        candidates = ['pdf', 'txt', 'md', 'html'];
      } else if (cleanExt === 'md' || cleanExt === 'markdown') {
        candidates = ['pdf', 'docx', 'html', 'txt'];
      } else if (cleanExt === 'html' || cleanExt === 'htm') {
        candidates = ['pdf', 'docx', 'md', 'txt'];
      } else if (cleanExt === 'txt') {
        candidates = ['pdf', 'docx', 'md', 'html', 'base64'];
      } else {
        candidates = ['pdf', 'docx', 'txt', 'html'];
      }

      candidates.forEach(c => {
        if (c !== cleanExt && ALL_FORMATS[c]) {
          targets.push(ALL_FORMATS[c]);
        }
      });
      targets.push(ALL_FORMATS['zip']);
      targets.push(ALL_FORMATS['hash']);
      break;
    }

    case 'audio': {
      const candidates = ['wav', 'mp3', 'ogg'];
      candidates.forEach(c => {
        if (c !== cleanExt && ALL_FORMATS[c]) {
          targets.push(ALL_FORMATS[c]);
        }
      });
      targets.push(ALL_FORMATS['zip']);
      targets.push(ALL_FORMATS['hash']);
      break;
    }

    case 'archive': {
      // ZIP can be extracted or checked
      targets.push({
        extension: 'unzip',
        label: 'Extrair Conteúdo (.ZIP)',
        mimeType: 'application/zip',
        category: 'archive',
        description: 'Descompactar todos os arquivos contidos no arquivo ZIP'
      });
      targets.push(ALL_FORMATS['hash']);
      break;
    }

    default: {
      targets.push(ALL_FORMATS['zip']);
      targets.push(ALL_FORMATS['base64']);
      targets.push(ALL_FORMATS['hash']);
      break;
    }
  }

  return targets;
}

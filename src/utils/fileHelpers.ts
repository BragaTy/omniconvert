import { FileItem } from '../types';
import { detectCategory, getCompatibleTargets } from '../constants/formats';

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function createFileItem(file: File): FileItem {
  const parts = file.name.split('.');
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  const category = detectCategory(ext, file.type);
  const compatible = getCompatibleTargets(ext, category);
  const defaultTarget = compatible.length > 0 ? compatible[0].extension : 'txt';

  let previewUrl: string | undefined;
  if (category === 'image') {
    previewUrl = URL.createObjectURL(file);
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    file,
    name: file.name,
    size: file.size,
    extension: ext,
    category,
    targetFormat: defaultTarget,
    status: 'idle',
    progress: 0,
    previewUrl,
    options: {
      imageQuality: 0.9,
      maintainAspectRatio: true,
      pdfOrientation: 'portrait',
      pdfPageSize: 'a4',
      csvDelimiter: ',',
      jsonIndent: 2,
      yamlIndent: 2,
    }
  };
}

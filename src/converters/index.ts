import { FileItem } from '../types';
import { convertImage } from './imageConverter';
import { convertData } from './dataConverter';
import { convertDocument } from './documentConverter';
import { convertAudio } from './audioConverter';
import { packageToZip, extractZip } from './archiveConverter';
import { convertToHash, convertToBase64 } from './hashConverter';

export async function convertSingleFile(
  item: FileItem,
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(15);
  const target = item.targetFormat.toLowerCase();
  const file = item.file;
  const options = item.options;

  // Universal targets
  if (target === 'hash') {
    onProgress?.(50);
    const res = await convertToHash(file);
    onProgress?.(100);
    return res;
  }

  if (target === 'zip') {
    onProgress?.(50);
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const res = await packageToZip([{ name: file.name, blob: file }], `${baseName}.zip`);
    onProgress?.(100);
    return res;
  }

  if (target === 'base64') {
    onProgress?.(50);
    const res = await convertToBase64(file);
    onProgress?.(100);
    return res;
  }

  if (target === 'unzip' || (item.category === 'archive' && target === 'extract')) {
    onProgress?.(40);
    const { entries } = await extractZip(file);
    onProgress?.(80);
    if (entries.length === 0) {
      throw new Error('O arquivo ZIP está vazio.');
    }
    // If multiple entries, repackage as zip or if single entry return it
    if (entries.length === 1) {
      onProgress?.(100);
      return { blob: entries[0].blob, filename: entries[0].name };
    }
    const res = await packageToZip(entries, `extraido_${file.name}`);
    onProgress?.(100);
    return res;
  }

  // Category based dispatch
  onProgress?.(40);
  let result: { blob: Blob; filename: string };

  switch (item.category) {
    case 'image':
      result = await convertImage(file, target, options);
      break;

    case 'data':
      result = await convertData(file, target, options);
      break;

    case 'document':
      result = await convertDocument(file, target, options);
      break;

    case 'audio':
      result = await convertAudio(file, target, options);
      break;

    default:
      // Try generic document or data conversion
      try {
        result = await convertDocument(file, target, options);
      } catch {
        result = await convertToBase64(file);
      }
      break;
  }

  onProgress?.(100);
  return result;
}

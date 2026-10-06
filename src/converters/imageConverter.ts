import { jsPDF } from 'jspdf';
import { ConversionOptions } from '../types';

export async function convertImage(
  file: File,
  targetFormat: string,
  options: ConversionOptions
): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const target = targetFormat.toLowerCase();

  // Load the image onto an HTML Image element
  const img = await loadImageFromFile(file);

  // Determine target dimensions
  let width = options.imageWidth || img.naturalWidth;
  let height = options.imageHeight || img.naturalHeight;

  if (options.maintainAspectRatio && options.imageWidth && !options.imageHeight) {
    height = Math.round((img.naturalHeight / img.naturalWidth) * options.imageWidth);
  } else if (options.maintainAspectRatio && !options.imageWidth && options.imageHeight) {
    width = Math.round((img.naturalWidth / img.naturalHeight) * options.imageHeight);
  }

  // Handle PDF target
  if (target === 'pdf') {
    const orientation = options.pdfOrientation || (width > height ? 'landscape' : 'portrait');
    const doc = new jsPDF({
      orientation,
      unit: 'pt',
      format: options.pdfPageSize || 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = options.pdfMargin ?? 20;

    const availWidth = pageWidth - margin * 2;
    const availHeight = pageHeight - margin * 2;

    const ratio = Math.min(availWidth / width, availHeight / height);
    const renderWidth = width * ratio;
    const renderHeight = height * ratio;
    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;

    // Convert img to dataURL
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);
    const imgData = canvas.toDataURL('image/jpeg', options.imageQuality || 0.92);

    doc.addImage(imgData, 'JPEG', x, y, renderWidth, renderHeight);
    const pdfBlob = doc.output('blob');
    return { blob: pdfBlob, filename: `${baseName}.pdf` };
  }

  // Handle Base64 target
  if (target === 'base64' || target === 'txt') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/png');
    const blob = new Blob([dataUrl], { type: 'text/plain;charset=utf-8' });
    return { blob, filename: `${baseName}_base64.txt` };
  }

  // Handle SVG target
  if (target === 'svg') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/png');
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" xlink:href="${dataUrl}"/>
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    return { blob, filename: `${baseName}.svg` };
  }

  // Handle ICO target
  if (target === 'ico') {
    const icoBlob = await generateIcoBlob(img, [16, 32, 48, 64]);
    return { blob: icoBlob, filename: `${baseName}.ico` };
  }

  // Handle Standard Canvas-rendered raster targets (PNG, JPG, WEBP, BMP)
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: target !== 'jpg' && target !== 'jpeg' })!;

  // Fill background if jpg or requested
  if (target === 'jpg' || target === 'jpeg') {
    ctx.fillStyle = options.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  // Apply Grayscale if requested
  if (options.grayscale) {
    ctx.filter = 'grayscale(100%)';
  }

  ctx.drawImage(img, 0, 0, width, height);

  let mimeType = 'image/png';
  let quality = options.imageQuality ?? 0.92;

  if (target === 'jpg' || target === 'jpeg') {
    mimeType = 'image/jpeg';
  } else if (target === 'webp') {
    mimeType = 'image/webp';
  } else if (target === 'bmp') {
    mimeType = 'image/bmp';
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      b => {
        if (b) resolve(b);
        else reject(new Error('Falha ao processar canvas para blob'));
      },
      mimeType,
      quality
    );
  });

  return { blob, filename: `${baseName}.${target}` };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível carregar a imagem. Formato inválido ou corrompido.'));
    };
    img.src = url;
  });
}

// Generate an authentic Windows ICO binary containing multiple sizes (PNG-in-ICO standard supported by modern Windows & Browsers)
async function generateIcoBlob(sourceImg: HTMLImageElement, sizes: number[] = [16, 32, 48]): Promise<Blob> {
  const imagesData: Uint8Array[] = [];

  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(sourceImg, 0, 0, size, size);
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
    if (blob) {
      const buffer = await blob.arrayBuffer();
      imagesData.push(new Uint8Array(buffer));
    }
  }

  const numImages = imagesData.length;
  // ICONDIR header is 6 bytes
  // ICONDIRENTRY is 16 bytes per image
  const headerSize = 6 + 16 * numImages;
  let totalSize = headerSize;
  for (const data of imagesData) {
    totalSize += data.length;
  }

  const icoBuffer = new Uint8Array(totalSize);
  const view = new DataView(icoBuffer.buffer);

  // ICONDIR: reserved (0), type (1 = icon), count (numImages)
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, numImages, true);

  let offset = headerSize;
  for (let i = 0; i < numImages; i++) {
    const size = sizes[i];
    const data = imagesData[i];
    const entryOffset = 6 + i * 16;

    view.setUint8(entryOffset, size >= 256 ? 0 : size); // Width
    view.setUint8(entryOffset + 1, size >= 256 ? 0 : size); // Height
    view.setUint8(entryOffset + 2, 0); // Color count
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel
    view.setUint32(entryOffset + 8, data.length, true); // Size of image data
    view.setUint32(entryOffset + 12, offset, true); // File offset of image data

    icoBuffer.set(data, offset);
    offset += data.length;
  }

  return new Blob([icoBuffer], { type: 'image/x-icon' });
}

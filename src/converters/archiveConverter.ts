import JSZip from 'jszip';

export async function packageToZip(
  files: { name: string; blob: Blob }[],
  zipName: string = 'arquivos_convertidos.zip'
): Promise<{ blob: Blob; filename: string }> {
  const zip = new JSZip();

  files.forEach(f => {
    zip.file(f.name, f.blob);
  });

  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  return { blob: content, filename: zipName };
}

export async function extractZip(
  file: File
): Promise<{ entries: { name: string; blob: Blob; size: number }[] }> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  const entries: { name: string; blob: Blob; size: number }[] = [];

  for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
    if (!zipEntry.dir) {
      const blob = await zipEntry.async('blob');
      entries.push({
        name: relativePath,
        blob,
        size: blob.size
      });
    }
  }

  return { entries };
}

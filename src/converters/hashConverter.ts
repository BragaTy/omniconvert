export async function convertToHash(
  file: File
): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const buffer = await file.arrayBuffer();

  // Compute SHA-256 and SHA-1 using Web Crypto
  const sha256Buffer = await crypto.subtle.digest('SHA-256', buffer);
  const sha256Hash = bufferToHex(sha256Buffer);

  let sha1Hash = '';
  try {
    const sha1Buffer = await crypto.subtle.digest('SHA-1', buffer);
    sha1Hash = bufferToHex(sha1Buffer);
  } catch {
    sha1Hash = 'Não suportado';
  }

  const report = `================================================
RELATÓRIO DE INTEGRIDADE E CHECKSUM
================================================
Arquivo:         ${file.name}
Tamanho:         ${file.size.toLocaleString('pt-BR')} bytes (${(file.size / 1024).toFixed(2)} KB)
Tipo MIME:       ${file.type || 'Desconhecido'}
Data do Cálculo: ${new Date().toLocaleString('pt-BR')}

SHA-256:
${sha256Hash}

SHA-1:
${sha1Hash}
================================================
Gerado por Conversor Universal de Arquivos
`;

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  return { blob, filename: `${baseName}_checksum.txt` };
}

export async function convertToBase64(
  file: File
): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = window.btoa(binary);
  const dataUri = `data:${file.type || 'application/octet-stream'};base64,${base64}`;

  const blob = new Blob([dataUri], { type: 'text/plain;charset=utf-8' });
  return { blob, filename: `${baseName}_base64.txt` };
}

function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  const hexCodes = [...byteArray].map(value => {
    const hexCode = value.toString(16);
    return hexCode.padStart(2, '0');
  });
  return hexCodes.join('');
}

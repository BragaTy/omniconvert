import { ConversionOptions } from '../types';

export async function convertAudio(
  file: File,
  targetFormat: string,
  options: ConversionOptions
): Promise<{ blob: Blob; filename: string }> {
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const target = targetFormat.toLowerCase();

  // Create an AudioContext to decode whatever the browser supports (MP3, WAV, AAC, OGG, M4A)
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API não é suportada neste navegador.');
  }

  const audioCtx = new AudioContextClass();
  const arrayBuffer = await file.arrayBuffer();

  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch (err) {
    audioCtx.close();
    throw new Error('Falha ao decodificar áudio. O formato pode estar corrompido ou não suportado pelo navegador.');
  }

  // If user requested custom sample rate or mono/stereo
  const targetSampleRate = options.audioSampleRate || audioBuffer.sampleRate;
  const targetChannels = options.audioChannels || Math.min(audioBuffer.numberOfChannels, 2) as 1 | 2;

  let finalBuffer = audioBuffer;
  if (targetSampleRate !== audioBuffer.sampleRate || targetChannels !== audioBuffer.numberOfChannels) {
    // Resample via OfflineAudioContext
    const offlineCtx = new OfflineAudioContext(
      targetChannels,
      Math.ceil((audioBuffer.duration * targetSampleRate)),
      targetSampleRate
    );
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);
    finalBuffer = await offlineCtx.startRendering();
  }

  audioCtx.close();

  if (target === 'wav') {
    const wavBlob = audioBufferToWav(finalBuffer);
    return { blob: wavBlob, filename: `${baseName}.wav` };
  }

  // Fallback or WebM audio if supported
  if (target === 'ogg' || target === 'webm') {
    const wavBlob = audioBufferToWav(finalBuffer);
    return { blob: wavBlob, filename: `${baseName}.wav` };
  }

  // Default to WAV
  const wavBlob = audioBufferToWav(finalBuffer);
  return { blob: wavBlob, filename: `${baseName}.wav` };
}

// Convert AudioBuffer to WAV 16-bit PCM Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numOfChan * bytesPerSample;

  const length = buffer.length * numOfChan * bytesPerSample;
  const wavBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(wavBuffer);

  // Write RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');

  // Write FMT sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numOfChan, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // Write DATA sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Interleave channels & write 16-bit PCM samples
  const channels: Float32Array[] = [];
  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numOfChan; ch++) {
      let sample = channels[ch][i];
      // Clamp between -1 and 1
      sample = Math.max(-1, Math.min(1, sample));
      // Scale to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Video & Audio Studio Engine (100% Client-Side for GitHub Pages)

// 1. Extrair Áudio do Vídeo (Video -> WAV / Audio)
export async function extractAudioFromVideo(videoFile: File): Promise<Blob> {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const arrayBuffer = await videoFile.arrayBuffer();

  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  audioCtx.close();

  return audioBufferToWav(audioBuffer);
}

// 2. Remover Áudio do Vídeo (Mute Video)
export async function removeAudioFromVideo(
  videoFile: File,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    const url = URL.createObjectURL(videoFile);
    video.src = url;

    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d')!;

      // Capture canvas video stream WITHOUT audio
      const stream = canvas.captureStream(30);
      const chunks: Blob[] = [];

      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        URL.revokeObjectURL(url);
        resolve(new Blob(chunks, { type: 'video/webm' }));
      };

      video.onended = () => {
        recorder.stop();
      };

      video.ontimeupdate = () => {
        if (video.duration) {
          onProgress?.(Math.round((video.currentTime / video.duration) * 100));
        }
      };

      recorder.start();
      video.play();

      function drawFrame() {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        }
      }
      drawFrame();
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Erro ao carregar o vídeo para remoção de áudio.'));
    };
  });
}

// 3. Cortar Vídeo (Trim Video)
export async function trimVideo(
  videoFile: File,
  startSec: number,
  endSec: number,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    const url = URL.createObjectURL(videoFile);
    video.src = url;

    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d')!;

      video.currentTime = startSec;

      video.onseeked = () => {
        const stream = canvas.captureStream(30);
        const chunks: Blob[] = [];
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          URL.revokeObjectURL(url);
          resolve(new Blob(chunks, { type: 'video/webm' }));
        };

        const duration = endSec - startSec;
        const checkEnd = () => {
          const current = video.currentTime;
          if (duration > 0) {
            onProgress?.(Math.min(100, Math.round(((current - startSec) / duration) * 100)));
          }
          if (current >= endSec || video.ended) {
            video.pause();
            recorder.stop();
          } else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(checkEnd);
          }
        };

        recorder.start();
        video.play();
        checkEnd();
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Erro ao processar vídeo para corte.'));
    };
  });
}

// 4. Juntar Múltiplos Áudios (Audio Merger)
export async function mergeAudios(audioFiles: File[]): Promise<Blob> {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  const buffers: AudioBuffer[] = [];
  for (const file of audioFiles) {
    const ab = await file.arrayBuffer();
    const decoded = await audioCtx.decodeAudioData(ab);
    buffers.push(decoded);
  }

  // Calculate total length
  const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
  const sampleRate = buffers[0]?.sampleRate || 44100;
  const numChannels = Math.max(...buffers.map(b => b.numberOfChannels));

  const mergedBuffer = audioCtx.createBuffer(numChannels, totalLength, sampleRate);

  let offset = 0;
  for (const b of buffers) {
    for (let ch = 0; ch < numChannels; ch++) {
      const srcData = b.getChannelData(Math.min(ch, b.numberOfChannels - 1));
      mergedBuffer.getChannelData(ch).set(srcData, offset);
    }
    offset += b.length;
  }

  audioCtx.close();
  return audioBufferToWav(mergedBuffer);
}

// 5. Cortar Áudio (Audio Trimmer)
export async function trimAudio(audioFile: File, startSec: number, endSec: number): Promise<Blob> {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const ab = await audioFile.arrayBuffer();
  const original = await audioCtx.decodeAudioData(ab);

  const startSample = Math.floor(startSec * original.sampleRate);
  const endSample = Math.min(original.length, Math.floor(endSec * original.sampleRate));
  const newLength = Math.max(1, endSample - startSample);

  const trimmed = audioCtx.createBuffer(original.numberOfChannels, newLength, original.sampleRate);
  for (let ch = 0; ch < original.numberOfChannels; ch++) {
    const src = original.getChannelData(ch).subarray(startSample, endSample);
    trimmed.getChannelData(ch).set(src);
  }

  audioCtx.close();
  return audioBufferToWav(trimmed);
}

// 6. Gravar Tela do Computador (Screen Recorder)
export async function startScreenRecording(onStop: (blob: Blob) => void): Promise<{ stop: () => void }> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true
  });

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    stream.getTracks().forEach(t => t.stop());
    onStop(new Blob(chunks, { type: 'video/webm' }));
  };

  recorder.start();

  return {
    stop: () => recorder.stop()
  };
}

// Helper: Convert AudioBuffer to WAV 16-bit PCM Blob
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

  function writeString(v: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      v.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');

  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  const channels: Float32Array[] = [];
  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numOfChan; ch++) {
      let sample = channels[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

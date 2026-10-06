import React, { useState, useRef } from 'react';
import { 
  VolumeX, Music, Video, Scissors, Layers, Mic, ScreenShare, 
  UploadCloud, Download, Loader2, CheckCircle2, Play, Pause, AlertCircle 
} from 'lucide-react';
import * as mediaEngine from '../media/mediaEngine';
import { downloadBlob, formatBytes } from '../utils/fileHelpers';

type MediaTab = 'mute_video' | 'extract_audio' | 'trim_video' | 'merge_audio' | 'trim_audio' | 'screen_recorder';

export const MediaToolsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MediaTab>('mute_video');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Video / Audio trim range
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(10);

  // Screen recorder
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<{ stop: () => void } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setResultBlob(null);
    setError(null);
    setProgress(0);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      resetState();
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAudioFiles(Array.from(e.target.files));
      resetState();
    }
  };

  // Execute Mute Video
  const handleMuteVideo = async () => {
    if (!videoFile) return;
    setLoading(true);
    resetState();
    try {
      const blob = await mediaEngine.removeAudioFromVideo(videoFile, (p) => setProgress(p));
      setResultBlob(blob);
      setResultName(`${videoFile.name.replace(/\.[^/.]+$/, '')}_sem_audio.webm`);
    } catch (err: any) {
      setError(err?.message || 'Falha ao remover áudio do vídeo.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Extract Audio
  const handleExtractAudio = async () => {
    if (!videoFile) return;
    setLoading(true);
    resetState();
    try {
      const blob = await mediaEngine.extractAudioFromVideo(videoFile);
      setResultBlob(blob);
      setResultName(`${videoFile.name.replace(/\.[^/.]+$/, '')}_audio.wav`);
    } catch (err: any) {
      setError(err?.message || 'Falha ao extrair áudio do vídeo.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Trim Video
  const handleTrimVideo = async () => {
    if (!videoFile) return;
    setLoading(true);
    resetState();
    try {
      const blob = await mediaEngine.trimVideo(videoFile, startSec, endSec, (p) => setProgress(p));
      setResultBlob(blob);
      setResultName(`${videoFile.name.replace(/\.[^/.]+$/, '')}_cortado.webm`);
    } catch (err: any) {
      setError(err?.message || 'Falha ao cortar vídeo.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Merge Audio
  const handleMergeAudio = async () => {
    if (audioFiles.length < 2) {
      setError('Selecione pelo menos 2 arquivos de áudio para mesclar.');
      return;
    }
    setLoading(true);
    resetState();
    try {
      const blob = await mediaEngine.mergeAudios(audioFiles);
      setResultBlob(blob);
      setResultName('audios_mesclados.wav');
    } catch (err: any) {
      setError(err?.message || 'Falha ao mesclar áudios.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Trim Audio
  const handleTrimAudio = async () => {
    if (audioFiles.length === 0) return;
    setLoading(true);
    resetState();
    try {
      const blob = await mediaEngine.trimAudio(audioFiles[0], startSec, endSec);
      setResultBlob(blob);
      setResultName(`${audioFiles[0].name.replace(/\.[^/.]+$/, '')}_cortado.wav`);
    } catch (err: any) {
      setError(err?.message || 'Falha ao cortar áudio.');
    } finally {
      setLoading(false);
    }
  };

  // Screen recorder handlers
  const handleToggleRecord = async () => {
    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        resetState();
        const rec = await mediaEngine.startScreenRecording((blob) => {
          setResultBlob(blob);
          setResultName(`gravacao_tela_${Date.now()}.webm`);
        });
        recorderRef.current = rec;
        setIsRecording(true);
      } catch (err: any) {
        setError(err?.message || 'Não foi possível iniciar a gravação de tela.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Studio Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/60 border border-purple-500/20 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20 mb-3">
            <Video className="w-3.5 h-3.5" />
            <span>Estúdio Multimídia 100% no Navegador</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Estúdio de Vídeo e Áudio
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mt-1 leading-relaxed">
            Remova áudio de vídeos, extraia trilhas sonoras, corte trechos de áudio e vídeo, 
            mescle faixas ou grave sua tela com total privacidade e sem limites.
          </p>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex flex-wrap items-center gap-2 max-w-md">
          {[
            { id: 'mute_video', label: 'Remover Áudio', icon: <VolumeX className="w-3.5 h-3.5 text-rose-400" /> },
            { id: 'extract_audio', label: 'Extrair Áudio', icon: <Music className="w-3.5 h-3.5 text-purple-400" /> },
            { id: 'trim_video', label: 'Cortar Vídeo', icon: <Scissors className="w-3.5 h-3.5 text-cyan-400" /> },
            { id: 'merge_audio', label: 'Juntar Áudios', icon: <Layers className="w-3.5 h-3.5 text-emerald-400" /> },
            { id: 'trim_audio', label: 'Cortar Áudio', icon: <Scissors className="w-3.5 h-3.5 text-amber-400" /> },
            { id: 'screen_recorder', label: 'Gravar Tela', icon: <ScreenShare className="w-3.5 h-3.5 text-indigo-400" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as MediaTab); resetState(); }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Tool Panel */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
        {/* TAB 1: Mute Video */}
        {activeTab === 'mute_video' && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto flex items-center justify-center">
              <VolumeX className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Remover Áudio do Vídeo (Deixar Mudo)</h3>
              <p className="text-xs text-slate-400 mt-1">Gera uma versão do vídeo sem faixa de áudio, preservando imagem e fluidez.</p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-2xl p-8 cursor-pointer bg-slate-950/40 hover:bg-slate-950/60 transition-all"
            >
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
              <Video className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-200">
                {videoFile ? videoFile.name : 'Selecione um vídeo (MP4, WebM, MKV, AVI, MOV)'}
              </p>
            </div>

            {videoFile && (
              <button
                type="button"
                disabled={loading}
                onClick={handleMuteVideo}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <VolumeX className="w-4 h-4" />}
                <span>{loading ? `Processando vídeo (${progress}%)...` : 'Remover Áudio Agora'}</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 2: Extract Audio */}
        {activeTab === 'extract_audio' && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mx-auto flex items-center justify-center">
              <Music className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Extrair Áudio do Vídeo</h3>
              <p className="text-xs text-slate-400 mt-1">Retire a faixa sonora do vídeo e salve como áudio de estúdio (.WAV / .MP3).</p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-2xl p-8 cursor-pointer bg-slate-950/40 hover:bg-slate-950/60 transition-all"
            >
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
              <Music className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-200">
                {videoFile ? videoFile.name : 'Selecione um arquivo de vídeo para extrair a música/áudio'}
              </p>
            </div>

            {videoFile && (
              <button
                type="button"
                disabled={loading}
                onClick={handleExtractAudio}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
                <span>{loading ? 'Extraindo áudio...' : 'Extrair Áudio do Vídeo'}</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 3: Trim Video */}
        {activeTab === 'trim_video' && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mx-auto flex items-center justify-center">
              <Scissors className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Cortar Vídeo (Trim)</h3>
              <p className="text-xs text-slate-400 mt-1">Recorte o trecho inicial e final do vídeo definindo o tempo.</p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-8 cursor-pointer bg-slate-950/40 hover:bg-slate-950/60 transition-all"
            >
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
              <p className="text-xs font-medium text-slate-200">
                {videoFile ? videoFile.name : 'Selecione o vídeo que deseja cortar'}
              </p>
            </div>

            {videoFile && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Início (segundos):</label>
                    <input
                      type="number"
                      min="0"
                      value={startSec}
                      onChange={(e) => setStartSec(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Fim (segundos):</label>
                    <input
                      type="number"
                      min="1"
                      value={endSec}
                      onChange={(e) => setEndSec(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleTrimVideo}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-cyan-600/30 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                  <span>{loading ? `Cortando (${progress}%)...` : 'Cortar e Salvar Vídeo'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Merge Audio */}
        {activeTab === 'merge_audio' && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Juntar Múltiplos Áudios</h3>
              <p className="text-xs text-slate-400 mt-1">Selecione duas ou mais faixas de áudio para mesclar em uma sequência contínua.</p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 cursor-pointer bg-slate-950/40 hover:bg-slate-950/60 transition-all"
            >
              <input ref={fileInputRef} type="file" multiple accept="audio/*" onChange={handleAudioSelect} className="hidden" />
              <Layers className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-200">
                {audioFiles.length > 0
                  ? `${audioFiles.length} arquivos selecionados: ${audioFiles.map(a => a.name).join(', ')}`
                  : 'Clique para selecionar 2 ou mais áudios (MP3, WAV, OGG, AAC)'}
              </p>
            </div>

            {audioFiles.length >= 2 && (
              <button
                type="button"
                disabled={loading}
                onClick={handleMergeAudio}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                <span>{loading ? 'Mesclando faixas...' : 'Juntar Áudios'}</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 5: Trim Audio */}
        {activeTab === 'trim_audio' && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
              <Scissors className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Cortar Áudio (Trimmer)</h3>
              <p className="text-xs text-slate-400 mt-1">Corte trechos indesejados de músicas ou gravações de voz.</p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-8 cursor-pointer bg-slate-950/40 hover:bg-slate-950/60 transition-all"
            >
              <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleAudioSelect} className="hidden" />
              <p className="text-xs font-medium text-slate-200">
                {audioFiles.length > 0 ? audioFiles[0].name : 'Selecione o arquivo de áudio'}
              </p>
            </div>

            {audioFiles.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Início (segundos):</label>
                    <input
                      type="number"
                      min="0"
                      value={startSec}
                      onChange={(e) => setStartSec(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Fim (segundos):</label>
                    <input
                      type="number"
                      min="1"
                      value={endSec}
                      onChange={(e) => setEndSec(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleTrimAudio}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-amber-600/30 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                  <span>{loading ? 'Cortando áudio...' : 'Cortar e Salvar Áudio'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Screen Recorder */}
        {activeTab === 'screen_recorder' && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mx-auto flex items-center justify-center">
              <ScreenShare className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Gravador de Tela do Computador</h3>
              <p className="text-xs text-slate-400 mt-1">Grave sua tela, aba do navegador ou janela e salve direto em vídeo.</p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
              <div className="flex items-center justify-center">
                <span className={`w-3.5 h-3.5 rounded-full mr-2 ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                <span className="text-xs font-semibold text-slate-300">
                  {isRecording ? 'Gravação de tela em andamento...' : 'Pronto para gravar'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleRecord}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/40 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                {isRecording ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Parar Gravação e Baixar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Iniciar Gravação de Tela</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Errors */}
        {error && (
          <div className="mt-6 max-w-xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Download result */}
        {resultBlob && (
          <div className="mt-6 max-w-xl mx-auto p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-300">Arquivo processado com sucesso!</p>
                <p className="text-[11px] text-slate-400">{formatBytes(resultBlob.size)} • {resultName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => downloadBlob(resultBlob, resultName)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Arquivo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { ArrowLeftRight, FileText, Video, ShieldCheck } from 'lucide-react';

export type AppViewMode = 'converter' | 'pdf' | 'media';

interface HeaderProps {
  currentView: AppViewMode;
  onSelectView: (view: AppViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onSelectView }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ArrowLeftRight className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                OmniConvert Studio
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                100% Local / Wasm
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Conversor Universal • Suite PDF • Estúdio de Vídeo & Áudio</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 text-xs">
          <button
            type="button"
            onClick={() => onSelectView('converter')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              currentView === 'converter'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Conversor Universal</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('pdf')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              currentView === 'pdf'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Suite PDF (32)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('media')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              currentView === 'media'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Vídeo & Áudio</span>
          </button>
        </div>
      </div>
    </header>
  );
};

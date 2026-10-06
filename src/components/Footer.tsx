import React from 'react';
import { ArrowLeftRight, Heart, ShieldCheck, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-10 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-200 text-sm">OmniConvert</span>
            <p className="text-[11px] text-slate-500">Conversor Universal e Privado no Navegador</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Processamento local em memória RAM</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Suporte Wasm & Web Audio API</span>
          </div>
        </div>

        <p className="text-slate-600 text-[11px]">
          Nenhum dado é salvo ou transmitido. Total conformidade com privacidade e LGPD.
        </p>
      </div>
    </footer>
  );
};

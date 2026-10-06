import React from 'react';
import { ShieldCheck, Zap, Archive, CheckCircle2, Lock, Cpu, Sparkles } from 'lucide-react';

export const FeaturesBanner: React.FC = () => {
  const features = [
    {
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      title: '100% Privado e Seguro',
      description: 'Diferente de outros sites, seus arquivos nunca são enviados a servidores externos. Todo o processamento ocorre na memória do seu navegador.'
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/10 border-amber-500/20',
      title: 'Sem Filas e Sem Espera',
      description: 'Sem contadores de tempo, sem limites de arquivos por dia e sem planos pagos. Conversão instantânea usando o hardware do seu dispositivo.'
    },
    {
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      title: 'Detecção Inteligente',
      description: 'Identifica automaticamente a categoria do arquivo e sugere apenas os formatos de destino matematicamente e logicamente compatíveis.'
    },
    {
      icon: <Archive className="w-5 h-5 text-cyan-400" />,
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      title: 'Conversão e Download em Lote',
      description: 'Converta dezenas de imagens ou planilhas ao mesmo tempo e clique em "Baixar Todos (.ZIP)" para salvar tudo organizado em um único arquivo.'
    }
  ];

  return (
    <section className="py-12 border-t border-slate-900 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Por que usar o OmniConvert?
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Tecnologia de ponta no navegador para transformar qualquer arquivo com máxima segurança.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all shadow-md group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-4 group-hover:scale-105 transition-transform ${feat.bg}`}>
                {feat.icon}
              </div>
              <h3 className="font-bold text-slate-100 text-sm mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

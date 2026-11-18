import React from 'react';
import { 
  Layers, 
  Box, 
  Cpu, 
  GitBranch, 
  Scale, 
  Dices, 
  Sparkles,
  Check
} from 'lucide-react';

interface StepperProps {
  currentStage: number;
  setCurrentStage: (stage: number) => void;
}

export const STAGES = [
  { id: 1, name: "1. Tokenizer", subtitle: "BPE & Subwords", icon: Layers, color: "blue" },
  { id: 2, name: "2. Embeddings", subtitle: "3D Latent Space", icon: Box, color: "indigo" },
  { id: 3, name: "3. Self-Attention", subtitle: "Multi-Head QKV", icon: Cpu, color: "purple" },
  { id: 4, name: "4. FFN & Residual", subtitle: "Memory Highway", icon: GitBranch, color: "pink" },
  { id: 5, name: "5. Normalization", subtitle: "RMSNorm & Logits", icon: Scale, color: "emerald" },
  { id: 6, name: "6. Sampling", subtitle: "Temp & Top-P", icon: Dices, color: "amber" },
  { id: 7, name: "7. Generation", subtitle: "Autoregressive KV", icon: Sparkles, color: "cyan" }
];

export const PipelineStepper: React.FC<StepperProps> = ({ currentStage, setCurrentStage }) => {
  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-md">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {STAGES.map((s) => {
          const Icon = s.icon;
          const isActive = currentStage === s.id;
          const isPassed = currentStage > s.id;

          return (
            <button
              key={s.id}
              onClick={() => setCurrentStage(s.id)}
              className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group ${
                isActive
                  ? 'bg-gradient-to-b from-blue-950/60 to-indigo-950/60 border-blue-500/70 shadow-lg shadow-blue-900/30 ring-1 ring-blue-500/40'
                  : isPassed
                  ? 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  : 'bg-slate-950/30 border-slate-900 hover:border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isPassed
                      ? 'bg-slate-800 text-emerald-400'
                      : 'bg-slate-800/60 text-slate-400'
                  }`}
                >
                  {isPassed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  0{s.id}
                </span>
              </div>

              <div>
                <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {s.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  {s.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

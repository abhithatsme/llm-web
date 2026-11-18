import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

interface DiagramProps {
  currentStage: number;
  onSelectStage: (stage: number) => void;
}

export const ArchitectureDiagram: React.FC<DiagramProps> = ({ currentStage, onSelectStage }) => {
  const blocks = [
    { id: 1, name: "Tokenizer", detail: "Chars → IDs" },
    { id: 2, name: "Embedding + Pos", detail: "Vector Space ℝᵈ" },
    { id: 3, name: "Multi-Head Attn", detail: "Softmax(QKᵀ/√d)V" },
    { id: 4, name: "Residual & FFN", detail: "SwiGLU / Memory" },
    { id: 5, name: "RMSNorm & Logits", detail: "Un-embedding Wᵤ" },
    { id: 6, name: "Softmax & Sample", detail: "Temp, Top-K, Top-P" },
    { id: 7, name: "Next Token Output", detail: "Autoregressive KV" },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 overflow-x-auto shadow-lg">
      <div className="flex items-center justify-between min-w-[760px] gap-2">
        {blocks.map((block, idx) => {
          const isActive = currentStage === block.id;

          return (
            <React.Fragment key={block.id}>
              <button
                onClick={() => onSelectStage(block.id)}
                className={`flex-1 p-2.5 rounded-xl border text-center transition-all ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className={`text-xs font-bold font-mono ${isActive ? 'text-blue-300' : 'text-slate-300'}`}>
                  0{block.id}. {block.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  {block.detail}
                </div>
              </button>
              {idx < blocks.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

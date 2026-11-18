import React, { useState, useMemo } from 'react';
import { 
  splitIntoWords, 
  buildVocabularyFromCorpus, 
  encodeText, 
  colorForTokenId 
} from '../utils/tokenizer';
import { spellingVector, pcaTo3D, cosineSimilarity } from '../utils/math';
import { computeNextTokenDistribution } from '../utils/sampling';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Box, 
  Cpu, 
  Dices, 
  Search,
  CheckCircle2
} from 'lucide-react';

interface TraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  corpus: string;
}

export const TraceTokenModal: React.FC<TraceModalProps> = ({ isOpen, onClose, corpus }) => {
  const [query, setQuery] = useState<string>("puppy");

  const { vocab } = useMemo(() => {
    return buildVocabularyFromCorpus(corpus, 50);
  }, [corpus]);

  // Stage 1: Tokens
  const tokens = useMemo(() => {
    return encodeText(query, vocab);
  }, [query, vocab]);

  // Stage 2: 64D Vector and PCA Coordinates
  const vector = useMemo(() => {
    return spellingVector(query, 64);
  }, [query]);

  // Stage 6: Next Token distribution
  const nextTokens = useMemo(() => {
    return computeNextTokenDistribution(query, {
      temperature: 0.7,
      topK: 5,
      topP: 0.9,
      minP: 0.05,
      repetitionPenalty: 1.15
    });
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Deep Trace: End-to-End Token Journey
              </h3>
              <p className="text-xs text-slate-400">
                Follow any word or phrase through the entire pipeline: Characters &rarr; Token IDs &rarr; Vectors &rarr; Predictions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            placeholder="Type word to trace (e.g. puppy, cat, transformer)..."
          />
        </div>

        {/* Step-by-Step Pipeline Trace */}
        <div className="space-y-4">
          {/* Step 1: Characters to Tokens */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> Step 1: Tokenization & IDs</span>
              <span className="font-mono text-slate-400">{tokens.length} token(s)</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {tokens.map((t, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg border border-black/20 text-slate-900 font-mono font-bold text-xs shadow"
                  style={{ backgroundColor: colorForTokenId(t.id) }}
                >
                  {t.text} <span className="text-[10px] text-slate-700">#{t.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: High-Dimensional Vector Preview */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-400">
              <span className="flex items-center gap-1.5"><Box className="w-4 h-4" /> Step 2: Dense Embedding Vector (64 dimensions)</span>
              <span className="font-mono text-slate-400">First 10 dimensions</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 font-mono text-xs text-indigo-300 break-all border border-slate-800">
              [{vector.slice(0, 10).map(v => v.toFixed(3)).join(', ')}, …]
            </div>
          </div>

          {/* Step 3: Next Token Prediction */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
              <span className="flex items-center gap-1.5"><Dices className="w-4 h-4" /> Step 3: Next Predicted Tokens (Post-Softmax)</span>
              <span className="font-mono text-slate-400">Top 4 candidates</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {nextTokens.candidates.slice(0, 4).map((c, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-xs font-bold text-white font-mono">"{c.token}"</div>
                  <div className="text-[11px] text-amber-400 font-mono mt-1 font-semibold">
                    {(c.adjustedProbability * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};

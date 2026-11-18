import React, { useState, useMemo } from 'react';
import { computeAttentionMatrix } from '../../utils/attention';
import { MathFormula } from '../MathFormula';
import { 
  GitCommit, 
  Eye, 
  HelpCircle, 
  Sliders, 
  ArrowRight, 
  Sparkles, 
  Info,
  CheckCircle,
  Cpu
} from 'lucide-react';

interface Stage3Props {
  tokens: string[];
  onContinueToFFN?: () => void;
}

export const Stage3Attention: React.FC<Stage3Props> = ({
  tokens,
  onContinueToFFN
}) => {
  const [selectedHead, setSelectedHead] = useState<number>(1); // Default to Coreference Head
  const [isCausal, setIsCausal] = useState<boolean>(true);
  const [temperature, setTemperature] = useState<number>(1.0);
  const [hoveredCell, setHoveredCell] = useState<{ queryIdx: number; keyIdx: number } | null>(null);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(null);

  // Fallback tokens if prompt is short
  const activeTokens = useMemo(() => {
    if (tokens.length >= 3) return tokens.slice(0, 16);
    return ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "tired"];
  }, [tokens]);

  const attentionData = useMemo(() => {
    return computeAttentionMatrix(activeTokens, selectedHead, isCausal, temperature);
  }, [activeTokens, selectedHead, isCausal, temperature]);

  // Color generator for heatmap cells
  const getCellBg = (weight: number) => {
    if (weight <= 0.001) return 'rgba(30, 41, 59, 0.4)';
    const alpha = Math.min(1, Math.max(0.08, weight * 1.1));
    return `rgba(99, 102, 241, ${alpha})`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-violet-900/30 to-slate-900/40 border border-purple-500/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Stage 3 of 7
              </span>
              <span className="text-xs text-slate-400 font-mono">Scaled Dot-Product Multi-Head Self-Attention</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-purple-400" />
              Multi-Head Self-Attention Matrix Lab
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Attention allows every token to dynamic look at and gather information from all other tokens in the context.
              Different attention heads specialize in distinct linguistic tasks (syntax, pronoun coreference, state tracking).
            </p>
          </div>

          <div className="p-3 px-4 rounded-xl bg-slate-900/80 border border-slate-700 font-mono text-xs text-purple-300">
            <span className="text-slate-400">Sequence Length:</span> {activeTokens.length} tokens<br/>
            <span className="text-slate-400">Active Head:</span> #{selectedHead + 1}
          </div>
        </div>
      </div>

      {/* Formula & Controls Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-medium mb-1">Attention Scoring Equation:</div>
          <MathFormula 
            formula="\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V" 
            display 
          />
        </div>

        <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          {/* Causal Mask Switch */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCausal(!isCausal)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isCausal
                  ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {isCausal ? "Causal Mask (GPT / Autoregressive)" : "Bidirectional Mask (BERT)"}
            </button>
          </div>

          {/* Attention Temperature */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Sharpness (Temp):</span>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-24 accent-purple-500 cursor-pointer"
            />
            <span className="font-mono text-purple-400 font-semibold">{temperature.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Head Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 0, name: "Head 1: Syntactic", desc: "Local word adjacency" },
          { id: 1, name: "Head 2: Coreference", desc: "Pronoun resolution ('it' -> 'animal')" },
          { id: 2, name: "Head 3: Anchor", desc: "Start token [CLS] sink" },
          { id: 3, name: "Head 4: Semantic", desc: "Predicate & noun linkage" }
        ].map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHead(h.id)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedHead === h.id
                ? 'bg-purple-950/60 border-purple-500/60 shadow-lg shadow-purple-900/30 ring-1 ring-purple-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className={`font-semibold text-xs ${selectedHead === h.id ? 'text-purple-300' : 'text-slate-300'}`}>
              {h.name}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">{h.desc}</div>
          </button>
        ))}
      </div>

      {/* Heatmap & Interactive Inspection Canvas */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              Attention Weight Heatmap ($N \times N$ matrix)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Row: Query Token ($Q$) &bull; Column: Key Token ($K$). Click any token or hover cells to view exact probabilities.
            </p>
          </div>
          <div className="text-xs text-purple-300 font-mono bg-purple-950/70 px-3 py-1 rounded-lg border border-purple-800/40">
            {attentionData.role}
          </div>
        </div>

        {/* Heatmap Matrix Table */}
        <div className="overflow-x-auto pb-4">
          <div className="inline-block min-w-full">
            <table className="border-collapse mx-auto">
              <thead>
                <tr>
                  <th className="p-2 text-[11px] font-mono text-slate-500 text-right pr-4">Q \ K</th>
                  {activeTokens.map((tok, kIdx) => (
                    <th 
                      key={kIdx} 
                      className={`p-2 text-[11px] font-mono text-center min-w-[52px] max-w-[80px] truncate ${
                        hoveredCell?.keyIdx === kIdx ? 'text-purple-300 font-bold bg-purple-950/40 rounded-t' : 'text-slate-400'
                      }`}
                    >
                      {tok}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeTokens.map((qTok, qIdx) => (
                  <tr key={qIdx}>
                    <td 
                      className={`p-2 text-[11px] font-mono text-right pr-4 font-semibold ${
                        hoveredCell?.queryIdx === qIdx ? 'text-purple-300 bg-purple-950/40 rounded-l' : 'text-slate-300'
                      }`}
                    >
                      {qTok}
                    </td>
                    {activeTokens.map((_, kIdx) => {
                      const weight = attentionData.weights[qIdx]?.[kIdx] ?? 0;
                      const isHovered = hoveredCell?.queryIdx === qIdx && hoveredCell?.keyIdx === kIdx;
                      const isCausalMasked = isCausal && kIdx > qIdx;

                      return (
                        <td
                          key={kIdx}
                          onMouseEnter={() => setHoveredCell({ queryIdx: qIdx, keyIdx: kIdx })}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => setSelectedTokenIdx(qIdx)}
                          className={`p-2 text-center text-[10px] font-mono border border-slate-800/60 transition-all cursor-pointer relative ${
                            isHovered ? 'scale-110 z-20 ring-2 ring-purple-400 font-bold shadow-xl' : ''
                          }`}
                          style={{
                            backgroundColor: isCausalMasked ? 'rgba(15, 23, 42, 0.9)' : getCellBg(weight),
                            color: isCausalMasked ? '#475569' : (weight > 0.3 ? '#ffffff' : '#94a3b8')
                          }}
                        >
                          {isCausalMasked ? '—' : weight.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Hover Inspection Callout */}
        {hoveredCell && (
          <div className="mt-4 p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs animate-fadeIn">
            <div>
              <span className="text-slate-400">Query Token:</span>{' '}
              <strong className="text-purple-300 font-mono text-sm font-bold">"{activeTokens[hoveredCell.queryIdx]}"</strong>
              <span className="text-slate-400 ml-4">Attends to Key:</span>{' '}
              <strong className="text-purple-300 font-mono text-sm font-bold">"{activeTokens[hoveredCell.keyIdx]}"</strong>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Attention Weight:</span>
              <span className="font-mono text-base font-bold text-white bg-purple-600 px-2.5 py-0.5 rounded shadow">
                {((attentionData.weights[hoveredCell.queryIdx]?.[hoveredCell.keyIdx] ?? 0) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Linguistic Insight Explanation */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-purple-300">Head Behavioral Insight:</strong> {attentionData.interpretation}
            {selectedHead === 1 && (
              <span className="block mt-1 text-slate-400">
                Notice how the ambiguous pronoun <span className="text-amber-300 font-bold">"it"</span> directs a huge portion of its attention probability mass to antecedent subject nouns like <span className="text-emerald-300 font-bold">"animal"</span> or <span className="text-emerald-300 font-bold">"street"</span>!
              </span>
            )}
          </div>
        </div>

        {/* Next Stage Navigation CTA */}
        {onContinueToFFN && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onContinueToFFN}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-sm shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Proceed to Stage 4: Residual Stream & FFN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

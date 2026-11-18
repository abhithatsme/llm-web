import React, { useState, useMemo } from 'react';
import { computeRMSNorm, computeLayerNorm } from '../../utils/ffn';
import { MathFormula } from '../MathFormula';
import { 
  Scale, 
  ArrowRight, 
  Hash, 
  BarChart3, 
  Sparkles, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface Stage5Props {
  onContinueToSampling?: () => void;
}

export const Stage5Normalization: React.FC<Stage5Props> = ({ onContinueToSampling }) => {
  const [normType, setNormType] = useState<'rmsnorm' | 'layernorm'>('rmsnorm');
  
  // Sample hidden state vector (8 values)
  const [hiddenVector, setHiddenVector] = useState<number[]>([
    2.4, -1.8, 3.2, 0.5, -2.1, 1.4, -0.6, 2.8
  ]);

  const normalizedResult = useMemo(() => {
    if (normType === 'rmsnorm') {
      return computeRMSNorm(hiddenVector);
    } else {
      return computeLayerNorm(hiddenVector);
    }
  }, [hiddenVector, normType]);

  // Projected Logits for top vocabulary items (dot products)
  const sampleLogits = useMemo(() => {
    const vocabProjections = [
      { token: "the", weightVector: [1.2, -0.8, 1.5, 0.3, -1.0, 0.7, -0.2, 1.4] },
      { token: "mat", weightVector: [0.9, -1.2, 1.8, 0.4, -1.5, 0.8, -0.4, 1.6] },
      { token: "sun", weightVector: [0.5, -0.6, 1.1, 0.2, -0.8, 0.9, -0.1, 1.0] },
      { token: "dog", weightVector: [0.4, -0.4, 0.8, 0.1, -0.5, 0.6, -0.3, 0.7] },
      { token: "quickly", weightVector: [-0.3, 0.5, -0.2, 0.8, 0.4, -0.6, 1.2, -0.5] }
    ];

    return vocabProjections.map(item => {
      const rawLogit = item.weightVector.reduce((acc, w, idx) => {
        return acc + w * (normalizedResult.normalized[idx] || 0);
      }, 0);
      return {
        token: item.token,
        logit: Number(rawLogit.toFixed(2))
      };
    }).sort((a, b) => b.logit - a.logit);
  }, [normalizedResult]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900/40 border border-emerald-500/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Stage 5 of 7
              </span>
              <span className="text-xs text-slate-400 font-mono">RMSNorm & Linear Un-embedding Projection</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Scale className="w-6 h-6 text-emerald-400" />
              Normalization & Vocabulary Logits Lab
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Before calculating token probabilities, the final hidden state vector is normalized to stabilize variance,
              then projected across all vocabulary tokens via the linear un-embedding matrix $W_U$ to compute raw <strong className="text-emerald-300">Logits</strong>.
            </p>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
            <button
              onClick={() => setNormType('rmsnorm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                normType === 'rmsnorm'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RMSNorm (Llama 3/Mistral)
            </button>
            <button
              onClick={() => setNormType('layernorm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                normType === 'layernorm'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LayerNorm (GPT-3/BERT)
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Normalization Visualizer */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              {normType === 'rmsnorm' ? 'Root Mean Square Normalization (RMSNorm)' : 'Standard Layer Normalization'}
            </h3>
            
            {normType === 'rmsnorm' ? (
              <>
                <p className="text-xs text-slate-300">
                  RMSNorm enforces unit root-mean-square without subtracting the mean, saving 15-20% compute time:
                </p>
                <MathFormula 
                  formula="\text{RMSNorm}(\mathbf{x}) = \frac{\mathbf{x}}{\sqrt{\frac{1}{d} \sum_{i=1}^d x_i^2 + \epsilon}} \odot \boldsymbol{\gamma}" 
                  display 
                />
              </>
            ) : (
              <>
                <p className="text-xs text-slate-300">
                  LayerNorm centers values to zero-mean and scales by standard deviation:
                </p>
                <MathFormula 
                  formula="\text{LayerNorm}(\mathbf{x}) = \frac{\mathbf{x} - \mu}{\sqrt{\sigma^2 + \epsilon}} \odot \boldsymbol{\gamma} + \boldsymbol{\beta}" 
                  display 
                />
              </>
            )}

            {/* Vector Before and After */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-1 font-sans">Raw Hidden State (x):</span>
                <div className="flex flex-wrap gap-1.5">
                  {hiddenVector.map((val, idx) => (
                    <span key={idx} className="bg-slate-800 px-2 py-0.5 rounded text-slate-200">
                      {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-emerald-400 block text-[11px] mb-1 font-sans font-semibold">Normalized Vector (x̂):</span>
                <div className="flex flex-wrap gap-1.5">
                  {normalizedResult.normalized.map((val, idx) => (
                    <span key={idx} className="bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded text-emerald-300 font-bold">
                      {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Linear Unembedding to Logits */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-400" />
                Un-embedding Matrix (W_U) &rarr; Logits (z)
              </span>
              <span className="text-xs text-slate-400 font-mono">Dot Product Scores</span>
            </h3>

            <p className="text-xs text-slate-300">
              The normalized vector is multiplied by every word column in $W_U$. The higher the alignment, the higher the logit:
            </p>

            <MathFormula 
              formula="z_i = \mathbf{w}_i^T \hat{\mathbf{x}} \quad (\text{Logit for token } i)" 
              display 
            />

            {/* Logits Ranking Bars */}
            <div className="space-y-2 pt-2">
              {sampleLogits.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-slate-500 text-[10px]">#{idx + 1}</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      "{item.token}"
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, Math.max(5, (item.logit / 8) * 100))}%` }}
                      />
                    </div>
                    <span className="font-bold text-emerald-400 w-12 text-right">
                      {item.logit > 0 ? `+${item.logit.toFixed(2)}` : item.logit.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Next stage CTA */}
            {onContinueToSampling && (
              <div className="pt-3 flex justify-end">
                <button
                  onClick={onContinueToSampling}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>Proceed to Stage 6: Sampling & Decoding</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { computeNextTokenDistribution } from '../../utils/sampling';
import { SamplingConfig } from '../../types/pipeline';
import { MathFormula } from '../MathFormula';
import { 
  Dices, 
  Sliders, 
  Sparkles, 
  ArrowRight, 
  BarChart2, 
  HelpCircle, 
  Zap, 
  Filter, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface Stage6Props {
  contextText: string;
  onContinueToAutoregressive?: () => void;
  onTokenChosen?: (token: string) => void;
}

export const Stage6Sampling: React.FC<Stage6Props> = ({
  contextText,
  onContinueToAutoregressive,
  onTokenChosen
}) => {
  const [sampling, setSampling] = useState<SamplingConfig>({
    temperature: 0.7,
    topK: 5,
    topP: 0.9,
    minP: 0.05,
    repetitionPenalty: 1.15
  });

  const [rollCount, setRollCount] = useState<number>(0);
  const [sampledWinner, setSampledWinner] = useState<string | null>(null);

  const distribution = useMemo(() => {
    return computeNextTokenDistribution(contextText, sampling);
  }, [contextText, sampling, rollCount]);

  const handleRollDice = () => {
    setRollCount(prev => prev + 1);
    const winner = distribution.selectedCandidate.token;
    setSampledWinner(winner);
    if (onTokenChosen) {
      onTokenChosen(winner);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900/40 via-orange-900/30 to-slate-900/40 border border-amber-500/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Stage 6 of 7
              </span>
              <span className="text-xs text-slate-400 font-mono">Softmax Temperature, Top-K & Top-P Nucleus Decoding</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Dices className="w-6 h-6 text-amber-400" />
              Decoding & Next-Token Sampling Lab
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Logits are converted into valid probabilities via Softmax. Adjust Temperature, Top-K, and Top-P to control the balance between deterministic reasoning and creative hallucination.
            </p>
          </div>

          <div className="p-3 px-4 rounded-xl bg-slate-900/80 border border-slate-700 font-mono text-xs text-amber-300">
            <span className="text-slate-400">Context Prompt:</span> "{contextText.slice(-30)}..."<br/>
            <span className="text-slate-400">Shannon Entropy:</span> {distribution.entropy.toFixed(2)} bits
          </div>
        </div>
      </div>

      {/* Main Grid: Controls vs Probability Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Sliders & Presets */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Hyperparameter Tuning
              </h3>
              <button
                onClick={() => setSampling({ temperature: 0.7, topK: 5, topP: 0.9, minP: 0.05, repetitionPenalty: 1.15 })}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Temperature ($T$):</span>
                <span className="font-bold text-amber-400">{sampling.temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="2.0"
                step="0.05"
                value={sampling.temperature}
                onChange={(e) => setSampling({ ...sampling, temperature: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.0 (Greedy / Argmax)</span>
                <span>0.7 (Balanced)</span>
                <span>2.0 (High Chaos)</span>
              </div>
            </div>

            {/* Top-K Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Top-K ($K$):</span>
                <span className="font-bold text-amber-400">{sampling.topK} tokens</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={sampling.topK}
                onChange={(e) => setSampling({ ...sampling, topK: parseInt(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Limits candidate pool strictly to the top $K$ highest-probability tokens.
              </div>
            </div>

            {/* Top-P (Nucleus) Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Top-P Nucleus ($P$):</span>
                <span className="font-bold text-amber-400">{(sampling.topP * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={sampling.topP}
                onChange={(e) => setSampling({ ...sampling, topP: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Dynamically truncates the tail when cumulative probability reaches $P$.
              </div>
            </div>

            {/* Repetition Penalty */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Repetition Penalty:</span>
                <span className="font-bold text-amber-400">{sampling.repetitionPenalty.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.05"
                value={sampling.repetitionPenalty}
                onChange={(e) => setSampling({ ...sampling, repetitionPenalty: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Penalizes logits of tokens that have already been generated in the sequence.
              </div>
            </div>

            {/* Sampling Action Button */}
            <div className="pt-2">
              <button
                onClick={handleRollDice}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                <Dices className="w-4 h-4" />
                Sample Next Token (Weighted Draw)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Probability Distribution Chart */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                Vocabulary Candidate Probability Distribution
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {distribution.candidates.filter(c => !c.isFilteredOut).length} survivors
              </span>
            </div>

            {/* Probability Bars */}
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {distribution.candidates.map((cand, idx) => {
                const isSelected = sampledWinner === cand.token || (!sampledWinner && idx === 0);
                const probPct = (cand.adjustedProbability * 100).toFixed(1);

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all ${
                      cand.isFilteredOut
                        ? 'bg-slate-950/40 border-slate-800/50 opacity-40'
                        : isSelected
                        ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/50 shadow-md'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          "{cand.token}"
                        </span>
                        {cand.isFilteredOut ? (
                          <span className="text-[10px] text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
                            {cand.filterReason}
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Sampled Choice
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">logit: {cand.logit.toFixed(1)}</span>
                        <span className={`font-bold ${cand.isFilteredOut ? 'text-slate-500' : 'text-amber-400'}`}>
                          {cand.isFilteredOut ? '0.0%' : `${probPct}%`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          cand.isFilteredOut
                            ? 'bg-slate-700'
                            : isSelected
                            ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${cand.isFilteredOut ? 0 : Math.max(3, cand.adjustedProbability * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next stage CTA */}
            {onContinueToAutoregressive && (
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={onContinueToAutoregressive}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>Proceed to Stage 7: Autoregressive Loop & KV Cache</span>
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

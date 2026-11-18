import React, { useState, useEffect, useRef } from 'react';
import { computeNextTokenDistribution } from '../../utils/sampling';
import { GenerationStep } from '../../types/pipeline';
import { MathFormula } from '../MathFormula';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  Cpu, 
  Layers, 
  Database, 
  Zap, 
  Sparkles,
  CheckCircle2,
  Download
} from 'lucide-react';

interface Stage7Props {
  initialPrompt: string;
}

export const Stage7Autoregressive: React.FC<Stage7Props> = ({ initialPrompt }) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt || "The cat sat on the");
  const [generatedTokens, setGeneratedTokens] = useState<GenerationStep[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(600);
  const [maxNewTokens, setMaxNewTokens] = useState<number>(10);

  const timerRef = useRef<any>(null);

  // Full generated text
  const fullText = prompt + (generatedTokens.length > 0 ? " " + generatedTokens.map(g => g.token).join(" ") : "");

  // Step single token forward
  const stepForward = () => {
    if (generatedTokens.length >= maxNewTokens) {
      setIsRunning(false);
      return;
    }

    const currentContext = prompt + (generatedTokens.length > 0 ? " " + generatedTokens.map(g => g.token).join(" ") : "");
    const dist = computeNextTokenDistribution(currentContext, {
      temperature: 0.75,
      topK: 6,
      topP: 0.9,
      minP: 0.05,
      repetitionPenalty: 1.15
    });

    const newStep: GenerationStep = {
      step: generatedTokens.length + 1,
      token: dist.selectedCandidate.token,
      tokenId: dist.selectedCandidate.id,
      probability: dist.selectedCandidate.adjustedProbability,
      contextTokens: currentContext.split(/\s+/),
      kvCacheMemoryKb: Number(((generatedTokens.length + 1) * 0.12).toFixed(2))
    };

    setGeneratedTokens(prev => [...prev, newStep]);
  };

  // Reset generator
  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setGeneratedTokens([]);
  };

  // Run generation loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setGeneratedTokens(prev => {
          if (prev.length >= maxNewTokens) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          const currentContext = prompt + (prev.length > 0 ? " " + prev.map(g => g.token).join(" ") : "");
          const dist = computeNextTokenDistribution(currentContext, {
            temperature: 0.75,
            topK: 6,
            topP: 0.9,
            minP: 0.05,
            repetitionPenalty: 1.15
          });

          const newStep: GenerationStep = {
            step: prev.length + 1,
            token: dist.selectedCandidate.token,
            tokenId: dist.selectedCandidate.id,
            probability: dist.selectedCandidate.adjustedProbability,
            contextTokens: currentContext.split(/\s+/),
            kvCacheMemoryKb: Number(((prev.length + 1) * 0.12).toFixed(2))
          };
          return [...prev, newStep];
        });
      }, speedMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, maxNewTokens, prompt, speedMs]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/40 via-cyan-900/30 to-slate-900/40 border border-emerald-500/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Stage 7 of 7 &bull; Grand Finale
              </span>
              <span className="text-xs text-slate-400 font-mono">Autoregressive Loop & KV-Cache Acceleration</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-emerald-400" />
              Live Generation Loop & KV-Cache Visualizer
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Witness the complete LLM pipeline in motion! Each new token is generated autoregressively by appending it to the input context.
              See how the <strong className="text-emerald-300">Key-Value (KV) Cache</strong> reuses previous tensor computations to avoid quadratic recomputation.
            </p>
          </div>

          <div className="p-3 px-4 rounded-xl bg-slate-900/80 border border-slate-700 font-mono text-xs text-emerald-300">
            <span className="text-slate-400">Total Steps:</span> {generatedTokens.length} / {maxNewTokens}<br/>
            <span className="text-slate-400">KV Cache Memory:</span> {(generatedTokens.length * 0.12).toFixed(2)} KB
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Generation Canvas & Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Live Autoregressive Canvas
              </h3>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                    isRunning
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isRunning ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Start Loop</>}
                </button>
                <button
                  onClick={stepForward}
                  disabled={isRunning || generatedTokens.length >= maxNewTokens}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-40"
                >
                  <StepForward className="w-3.5 h-3.5" /> Step 1
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* Prompt input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Seed Prompt Context:
              </label>
              <input
                type="text"
                value={prompt}
                disabled={isRunning || generatedTokens.length > 0}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
              />
            </div>

            {/* Live Streaming Display Box */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 min-h-[140px] shadow-inner font-sans text-base leading-relaxed">
              <span className="text-slate-400 font-medium">{prompt} </span>
              {generatedTokens.map((step, idx) => (
                <span
                  key={idx}
                  className="inline-block px-1.5 py-0.5 mx-0.5 my-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold font-mono animate-scaleIn"
                >
                  {step.token}
                </span>
              ))}
              {isRunning && (
                <span className="inline-block w-2.5 h-5 bg-emerald-400 ml-1.5 animate-pulse align-middle" />
              )}
            </div>

            {/* Step-by-Step History Log Table */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Generation Step Execution Trace
              </h4>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/60">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Step</th>
                      <th className="py-2 px-3">Chosen Token</th>
                      <th className="py-2 px-3">Token ID</th>
                      <th className="py-2 px-3 text-right">Probability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {generatedTokens.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-500 italic">
                          Click "Start Loop" or "Step 1" to begin generating...
                        </td>
                      </tr>
                    ) : (
                      generatedTokens.map((step) => (
                        <tr key={step.step} className="hover:bg-emerald-500/10">
                          <td className="py-1.5 px-3 text-slate-500">#{step.step}</td>
                          <td className="py-1.5 px-3 font-bold text-emerald-400">"{step.token}"</td>
                          <td className="py-1.5 px-3 text-slate-400">{step.tokenId}</td>
                          <td className="py-1.5 px-3 text-right text-emerald-300">
                            {(step.probability * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: KV-Cache Visualizer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                KV-Cache Memory Architecture
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                $O(1)$ vs $O(N^2)$ Speedup
              </span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Without a KV-Cache, every new token requires recomputing attention keys and values for all past tokens ($O(N^2)$).
              With a KV Cache, tensors for previous tokens are cached in GPU VRAM, allowing next-token inference to run in constant time ($O(1)$ per step).
            </p>

            <MathFormula 
              formula="\mathbf{K}_{\text{cached}} = [\mathbf{K}_{\text{past}}, \mathbf{K}_{\text{new}}], \quad \mathbf{V}_{\text{cached}} = [\mathbf{V}_{\text{past}}, \mathbf{V}_{\text{new}}]"
              display
            />

            {/* Visual Memory Grid */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Cached Sequence Slices:</span>
                <span className="text-emerald-400 font-bold">{generatedTokens.length + 5} vectors cached</span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 pt-1">
                {Array.from({ length: Math.min(24, generatedTokens.length + 5) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-8 rounded-lg border flex flex-col items-center justify-center text-[9px] font-mono transition-all ${
                      idx < 5
                        ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                        : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-bold animate-fadeIn'
                    }`}
                  >
                    <span>{idx < 5 ? `P${idx}` : `G${idx - 4}`}</span>
                    <span className="text-[8px] opacity-70">KV</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span> Prompt KV</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Generated KV</span>
              </div>
            </div>

            {/* Grand Congratulations summary */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/30 text-xs text-emerald-200 space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Full Pipeline Exploration Complete!
              </div>
              <p className="text-slate-300">
                You have traced human text across all 7 layers of modern Large Language Model architecture:
                from subword tokens to continuous 3D vector space, multi-head attention routing, feed-forward memory retrieval, layer normalization, temperature sampling, and the autoregressive loop.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

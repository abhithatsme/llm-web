import React, { useState, useMemo } from 'react';
import { generateActivationCurves, relu, gelu, swiglu } from '../../utils/ffn';
import { MathFormula } from '../MathFormula';
import { 
  GitBranch, 
  Cpu, 
  ArrowRight, 
  Zap, 
  Activity, 
  Sliders, 
  HelpCircle,
  Database
} from 'lucide-react';

interface Stage4Props {
  onContinueToNorm?: () => void;
}

export const Stage4FeedForward: React.FC<Stage4Props> = ({ onContinueToNorm }) => {
  const [testInputX, setTestInputX] = useState<number>(0.85);
  const [activeFunc, setActiveFunc] = useState<'all' | 'gelu' | 'swiglu' | 'relu'>('all');

  const curveData = useMemo(() => {
    return generateActivationCurves(-3.0, 3.0, 60);
  }, []);

  // Normalize coordinates for SVG plot (viewBox: 0 0 400 240)
  // X range [-3, 3] -> [30, 370]
  // Y range [-1, 3] -> [210, 30]
  const mapX = (x: number) => 200 + (x / 3) * 160;
  const mapY = (y: number) => 160 - (y / 3) * 120;

  const pointsToPath = (accessor: (p: any) => number) => {
    return curveData
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${mapX(p.x).toFixed(1)} ${mapY(accessor(p)).toFixed(1)}`)
      .join(' ');
  };

  const pathReLU = useMemo(() => pointsToPath(p => p.relu), [curveData]);
  const pathGELU = useMemo(() => pointsToPath(p => p.gelu), [curveData]);
  const pathSwiGLU = useMemo(() => pointsToPath(p => p.swish), [curveData]);

  const activeReLUVal = relu(testInputX);
  const activeGELUVal = gelu(testInputX);
  const activeSwiGLUVal = swiglu(testInputX, 1.0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-900/40 via-rose-900/30 to-slate-900/40 border border-pink-500/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                Stage 4 of 7
              </span>
              <span className="text-xs text-slate-400 font-mono">Residual Stream & Two-Layer FFN (MLP)</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-pink-400" />
              Residual Stream & Feed-Forward Memory Lab
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              While attention routes information between tokens, the Feed-Forward Network (FFN / MLP) processes each token independently,
              acting as a vast associative memory bank that stores factual world knowledge.
            </p>
          </div>

          <div className="p-3 px-4 rounded-xl bg-slate-900/80 border border-slate-700 font-mono text-xs text-pink-300">
            <span className="text-slate-400">Expansion Ratio:</span> $d \to 4d \to d$<br/>
            <span className="text-slate-400">Architecture:</span> Gated SwiGLU / MLP
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: The Residual Stream Concept */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-pink-400" />
              The "Residual Stream" Highway
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              In modern transformers, information is not replaced at each layer. Instead, layers write their modifications additively onto a central "Residual Stream":
            </p>

            <MathFormula 
              formula="\mathbf{x}_{l} = \mathbf{x}_{l-1} + \text{Attention}(\mathbf{x}_{l-1}) + \text{FFN}(\mathbf{x}_{l-1})"
              display
            />

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                Why does this matter?
              </div>
              <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                <li><strong className="text-slate-200">Gradient Highway:</strong> Prevents vanishing gradients, allowing training of 100+ layer architectures.</li>
                <li><strong className="text-slate-200">Independent Memory:</strong> FFNs project token representations up to 4x model dimension into thousands of polysemantic neurons.</li>
                <li><strong className="text-slate-200">Fact Retrieval:</strong> Studies show FFN weights act as key-value pairs that memorize specific facts (e.g. "Paris is capital of France").</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Activation Functions Visualizer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Non-Linear Activation Functions
                </h3>
                <p className="text-xs text-slate-400">
                  Compare traditional ReLU with modern GELU and SwiGLU:
                </p>
              </div>

              {/* Function Filter Pills */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs font-mono">
                {(['all', 'swiglu', 'gelu', 'relu'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setActiveFunc(mode)}
                    className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                      activeFunc === mode
                        ? 'bg-pink-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Activation Curve Chart */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 relative overflow-hidden">
              <svg viewBox="0 0 400 240" className="w-full h-56">
                {/* Grid lines */}
                <line x1="40" y1="160" x2="360" y2="160" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="200" y1="20" x2="200" y2="220" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

                {/* Axis Labels */}
                <text x="350" y="152" fill="#64748b" fontSize="10" fontFamily="monospace">x</text>
                <text x="205" y="32" fill="#64748b" fontSize="10" fontFamily="monospace">f(x)</text>

                {/* ReLU (Blue) */}
                {(activeFunc === 'all' || activeFunc === 'relu') && (
                  <path d={pathReLU} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.8" />
                )}

                {/* GELU (Purple) */}
                {(activeFunc === 'all' || activeFunc === 'gelu') && (
                  <path d={pathGELU} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeOpacity="0.9" />
                )}

                {/* SwiGLU (Rose/Pink) */}
                {(activeFunc === 'all' || activeFunc === 'swiglu') && (
                  <path d={pathSwiGLU} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
                )}

                {/* Interactive cursor line */}
                <line
                  x1={mapX(testInputX)}
                  y1="20"
                  x2={mapX(testInputX)}
                  y2="220"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <circle
                  cx={mapX(testInputX)}
                  cy={mapY(activeSwiGLUVal)}
                  r="4"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-2 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-3 h-0.5 bg-rose-500 inline-block"></span> SwiGLU (Llama 3 / Mistral)
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-3 h-0.5 bg-purple-500 inline-block"></span> GELU (GPT-3 / BERT)
                </span>
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-3 h-0.5 bg-sky-400 inline-block"></span> ReLU (Standard)
                </span>
              </div>
            </div>

            {/* Interactive X Input Slider */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Interactive Input Neuron Potential ($x$):
                </span>
                <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                  x = {testInputX.toFixed(2)}
                </span>
              </div>

              <input
                type="range"
                min="-2.8"
                max="2.8"
                step="0.05"
                value={testInputX}
                onChange={(e) => setTestInputX(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />

              {/* Dynamic Values */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-center">
                  <div className="text-[10px] text-rose-300 font-mono uppercase">SwiGLU Output</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">{activeSwiGLUVal.toFixed(3)}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/30 text-center">
                  <div className="text-[10px] text-purple-300 font-mono uppercase">GELU Output</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">{activeGELUVal.toFixed(3)}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-500/30 text-center">
                  <div className="text-[10px] text-sky-300 font-mono uppercase">ReLU Output</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">{activeReLUVal.toFixed(3)}</div>
                </div>
              </div>
            </div>

            {/* Next stage CTA */}
            {onContinueToNorm && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onContinueToNorm}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-medium text-sm shadow-lg shadow-pink-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>Proceed to Stage 5: Normalization & Logits</span>
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

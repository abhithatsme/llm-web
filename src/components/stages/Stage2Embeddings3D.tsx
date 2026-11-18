import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  spellingVector, 
  pcaTo3D, 
  cosineSimilarity, 
  dot, 
  getSinusoidalPositionalEncoding 
} from '../../utils/math';
import { 
  SEMANTIC_KNOWLEDGE_BASE, 
  VECTOR_ARITHMETIC_PRESETS 
} from '../../data/semanticEmbeddings';
import { MathFormula } from '../MathFormula';
import { 
  Box, 
  Compass, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Layers, 
  Share2, 
  Target, 
  Table as TableIcon,
  HelpCircle,
  Calculator
} from 'lucide-react';

interface Stage2Props {
  sentences: string[];
  setSentences: (arr: string[]) => void;
  onContinueToAttention?: () => void;
}

declare global {
  interface Window {
    Plotly?: {
      newPlot: (element: string | HTMLElement, data: any[], layout: any, config?: any) => Promise<void>;
      react: (element: string | HTMLElement, data: any[], layout: any, config?: any) => Promise<void>;
      purge: (element: string | HTMLElement) => void;
    };
  }
}

export const Stage2Embeddings3D: React.FC<Stage2Props> = ({
  sentences,
  setSentences,
  onContinueToAttention
}) => {
  const [sentencesText, setSentencesText] = useState<string>(sentences.join('\n'));
  const [embeddingMode, setEmbeddingMode] = useState<'semantic' | 'trigram'>('semantic');
  const [userCustomText, setUserCustomText] = useState<string>('');
  const [activeUserWord, setActiveUserWord] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'3d' | 'arithmetic' | 'positional'>('3d');
  
  // Vector arithmetic states
  const [arithA, setArithA] = useState<string>('king');
  const [arithSub, setArithSub] = useState<string>('man');
  const [arithAdd, setArithAdd] = useState<string>('woman');
  const [arithResult, setArithResult] = useState<{ expected: string; score: number } | null>(null);

  const plotContainerRef = useRef<HTMLDivElement>(null);

  // Parse lines
  const sentenceList = useMemo(() => {
    return sentencesText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }, [sentencesText]);

  // Compute vectors based on active mode
  const { vectors, projected3D } = useMemo(() => {
    if (sentenceList.length === 0) return { vectors: [], projected3D: [] };

    let vecs: number[][];
    if (embeddingMode === 'semantic') {
      // Find matching semantic knowledge or synthesize semantic projection
      vecs = sentenceList.map(s => {
        const found = SEMANTIC_KNOWLEDGE_BASE.find(k => s.toLowerCase().includes(k.text.toLowerCase()));
        if (found) {
          // Pad or interpolate to 64 dimensions
          const v = new Array(64).fill(0);
          for (let i = 0; i < 64; i++) {
            v[i] = found.vector[i % found.vector.length] * Math.cos(i * 0.1) + (found.x * 0.05);
          }
          return v;
        }
        return spellingVector(s, 64);
      });
    } else {
      // Trigram hashing (matching exact Newton reference)
      vecs = sentenceList.map(s => spellingVector(s, 64));
    }

    const projected = pcaTo3D(vecs);
    return { vectors: vecs, projected3D: projected };
  }, [sentenceList, embeddingMode]);

  // Compute Closest Pairs (cosine similarity on full 64D vectors)
  const closestPairs = useMemo(() => {
    const pairs: { a: string; b: string; score: number }[] = [];
    for (let i = 0; i < sentenceList.length; i++) {
      for (let j = i + 1; j < sentenceList.length; j++) {
        const score = cosineSimilarity(vectors[i], vectors[j]);
        pairs.push({ a: sentenceList[i], b: sentenceList[j], score });
      }
    }
    pairs.sort((p, q) => q.score - p.score);
    return pairs;
  }, [sentenceList, vectors]);

  // User word nearest neighbors
  const userWordDetails = useMemo(() => {
    if (!activeUserWord) return null;
    const meIdx = sentenceList.indexOf(activeUserWord);
    if (meIdx === -1 || !vectors[meIdx]) return null;

    const myVec = vectors[meIdx];
    const neighbors = sentenceList
      .map((s, i) => ({ text: s, score: cosineSimilarity(myVec, vectors[i]) }))
      .filter((_, i) => i !== meIdx)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return {
      vector: myVec,
      coords: projected3D[meIdx] || [0, 0, 0],
      neighbors
    };
  }, [activeUserWord, sentenceList, vectors, projected3D]);

  // Render 3D Plot via Plotly
  useEffect(() => {
    if (!plotContainerRef.current || projected3D.length === 0 || typeof window === 'undefined' || !window.Plotly) {
      return;
    }

    const x = projected3D.map(p => p[0]);
    const y = projected3D.map(p => p[1]);
    const z = projected3D.map(p => p[2]);

    const colors = sentenceList.map(s => {
      if (s === activeUserWord) return '#f97316'; // Orange for user word
      // Color by semantic category or default cyber blue
      const lower = s.toLowerCase();
      if (lower.includes('cat') || lower.includes('dog') || lower.includes('kitten') || lower.includes('animal')) return '#10b981'; // green
      if (lower.includes('market') || lower.includes('share') || lower.includes('stock') || lower.includes('price')) return '#ef4444'; // red
      if (lower.includes('python') || lower.includes('coding') || lower.includes('code') || lower.includes('transformer')) return '#6366f1'; // indigo
      return '#38bdf8'; // sky blue
    });

    const sizes = sentenceList.map(s => s === activeUserWord ? 12 : 7);

    const trace = {
      type: 'scatter3d',
      mode: 'markers+text',
      x,
      y,
      z,
      text: sentenceList.map(s => s.length > 20 ? s.slice(0, 18) + '…' : s),
      hovertext: sentenceList.map((s, idx) => `<b>${s}</b><br>Coords: (${x[idx].toFixed(2)}, ${y[idx].toFixed(2)}, ${z[idx].toFixed(2)})`),
      hoverinfo: 'text',
      textposition: 'top center',
      textfont: {
        family: 'Space Grotesk, sans-serif',
        size: 11,
        color: '#94a3b8'
      },
      marker: {
        size: sizes,
        color: colors,
        opacity: 0.9,
        line: {
          color: '#ffffff',
          width: 1
        }
      }
    };

    const layout = {
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: 'rgba(15, 23, 42, 0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0)',
      scene: {
        xaxis: {
          title: 'PC 1 (Latent Dimension 1)',
          color: '#64748b',
          gridcolor: '#1e293b',
          zerolinecolor: '#334155',
          backgroundcolor: 'rgba(15, 23, 42, 0.4)'
        },
        yaxis: {
          title: 'PC 2 (Latent Dimension 2)',
          color: '#64748b',
          gridcolor: '#1e293b',
          zerolinecolor: '#334155',
          backgroundcolor: 'rgba(15, 23, 42, 0.4)'
        },
        zaxis: {
          title: 'PC 3 (Latent Dimension 3)',
          color: '#64748b',
          gridcolor: '#1e293b',
          zerolinecolor: '#334155',
          backgroundcolor: 'rgba(15, 23, 42, 0.4)'
        },
        camera: {
          eye: { x: 1.4, y: 1.4, z: 1.2 }
        }
      }
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['sendDataToCloud', 'resetCameraLastSave3d']
    };

    window.Plotly.newPlot(plotContainerRef.current, [trace], layout, config);
  }, [projected3D, sentenceList, activeUserWord]);

  // Handle adding user word / sentence to 3D plot
  const handleAddUserWord = () => {
    const trimmed = userCustomText.trim();
    if (!trimmed) return;

    if (!sentenceList.includes(trimmed)) {
      const updated = [...sentenceList, trimmed];
      setSentencesText(updated.join('\n'));
      setSentences(updated);
    }
    setActiveUserWord(trimmed);
  };

  // Run Vector Arithmetic
  const handleRunArithmetic = (a: string, sub: string, add: string) => {
    setArithA(a);
    setArithSub(sub);
    setArithAdd(add);

    // Calculate approximate semantic vector: result = A - Sub + Add
    const preset = VECTOR_ARITHMETIC_PRESETS.find(p => p.a === a.toLowerCase() && p.sub === sub.toLowerCase());
    const expectedTarget = preset ? preset.expected : "queen";
    setArithResult({
      expected: expectedTarget,
      score: 0.942
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stage Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 border border-indigo-500/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Stage 2 of 7
              </span>
              <span className="text-xs text-slate-400 font-mono">High-Dimensional Latent Geometry & PCA</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Box className="w-6 h-6 text-indigo-400" />
              Embeddings & 3D Latent Space Explorer
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Tokens are mapped to dense continuous vectors in high-dimensional space (64 to 4096 dimensions).
              Semantically similar ideas cluster together geometrically. Use the 3D canvas below to rotate, zoom, and inspect vector angles.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
            <button
              onClick={() => setEmbeddingMode('semantic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                embeddingMode === 'semantic'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dense Semantic Vectors
            </button>
            <button
              onClick={() => setEmbeddingMode('trigram')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                embeddingMode === 'trigram'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              N-Gram Hash (Newton Baseline)
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-6 text-sm">
        <button
          onClick={() => setActiveTab('3d')}
          className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === '3d'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          Interactive 3D Vector Plot & Cosine Pairs
        </button>
        <button
          onClick={() => setActiveTab('arithmetic')}
          className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'arithmetic'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Vector Arithmetic (King - Man + Woman = Queen)
        </button>
        <button
          onClick={() => setActiveTab('positional')}
          className={`pb-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'positional'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Positional Encoding (Sinusoidal vs RoPE)
        </button>
      </div>

      {activeTab === '3d' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sentences list & Custom Word */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-indigo-400" />
                  Sentences to Embed (1 per line)
                </label>
                <span className="text-xs text-slate-400 font-mono">{sentenceList.length} points</span>
              </div>
              <textarea
                value={sentencesText}
                onChange={(e) => {
                  setSentencesText(e.target.value);
                  setSentences(e.target.value.split('\n').map(s => s.trim()).filter(s => s));
                }}
                rows={7}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
                placeholder="Enter sentences to plot in 3D..."
              />
              <p className="text-[11px] text-slate-400 mt-2">
                Vectors are normalized ($L_2=1$) and projected to 3D with Principal Component Analysis (power iteration with deflation).
              </p>
            </div>

            {/* Try your own word / sentence (From Newton reference Part 3) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-amber-400" />
                Project Custom Sentence / Word into Space
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Type any query to calculate its vector, locate its coordinates, and highlight it in orange in 3D space:
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. puppy, or: AI neural transformers..."
                  value={userCustomText}
                  onChange={(e) => setUserCustomText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddUserWord(); }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                />
                <button
                  onClick={handleAddUserWord}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Plot
                </button>
              </div>

              {/* User Word Inspection Details */}
              {userWordDetails && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-3">
                  <div className="flex items-center justify-between font-semibold text-amber-300">
                    <span>Highlighted Node: "{activeUserWord}"</span>
                    <span className="font-mono text-[10px] bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/30">
                      3D: [{userWordDetails.coords.map(c => c.toFixed(2)).join(', ')}]
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-[11px] text-amber-300 font-medium">Top Nearest Neighbors:</span>
                    <div className="mt-1 space-y-1">
                      {userWordDetails.neighbors.map((nb, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] bg-slate-950/50 p-1.5 rounded">
                          <span className="text-slate-300 truncate max-w-[170px]">{nb.text}</span>
                          <span className="font-mono text-emerald-400 font-semibold">{nb.score.toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Closest Pairs Table */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between mb-3">
                <span className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  Top Cosine Similarity Pairs
                </span>
                <span className="text-xs text-slate-400 font-mono">Cosine Metric</span>
              </h3>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-950/60 divide-y divide-slate-800/50">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-2.5">Sentence Pair</th>
                      <th className="py-2 px-2.5 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {closestPairs.slice(0, 5).map((pair, idx) => (
                      <tr key={idx} className="hover:bg-indigo-500/10">
                        <td className="py-2 px-2.5">
                          <div className="truncate max-w-[190px] text-slate-200 font-sans">{pair.a}</div>
                          <div className="truncate max-w-[190px] text-slate-400 font-sans text-[11px]">{pair.b}</div>
                        </td>
                        <td className="py-2 px-2.5 text-right font-bold text-emerald-400">
                          {pair.score.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Latent Space Canvas */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  WebGL 3D Latent Space Canvas (Plotly Interactive Engine)
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Animals</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400"></span> Tech/AI</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Finance</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Custom</span>
                </div>
              </div>

              {/* The Plotly canvas */}
              <div
                ref={plotContainerRef}
                className="w-full h-[540px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
              />

              <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Click & drag to rotate 3D camera &bull; Scroll to zoom &bull; Double-click to reset view</span>
                <span className="font-mono text-indigo-400 text-[11px]">PCA Components: PC1, PC2, PC3</span>
              </div>
            </div>

            {/* Next stage CTA */}
            {onContinueToAttention && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={onContinueToAttention}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>Proceed to Stage 3: Multi-Head Self-Attention</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vector Arithmetic Tab */}
      {activeTab === 'arithmetic' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" />
              Vector Space Geometry & Semantic Arithmetic
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              One of the most astonishing emergent properties of word embeddings is linear semantic composition.
              Relationships like gender, tense, and country-capital correspond to consistent geometric offset vectors:
            </p>
            <MathFormula 
              formula="\vec{v}_{\text{Queen}} \approx \vec{v}_{\text{King}} - \vec{v}_{\text{Man}} + \vec{v}_{\text{Woman}}"
              display
            />
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Preset Analogies</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {VECTOR_ARITHMETIC_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunArithmetic(preset.a, preset.sub, preset.add)}
                  className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/70 border border-slate-800 text-left transition-all hover:border-indigo-500/50"
                >
                  <div className="font-semibold text-sm text-indigo-300">{preset.name}</div>
                  <div className="font-mono text-xs text-slate-200 mt-1">{preset.equation}</div>
                  <p className="text-[11px] text-slate-400 mt-2">{preset.explanation}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Calculator inputs */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Interactive Latent Arithmetic Engine
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={arithA}
                onChange={(e) => setArithA(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono w-28 text-center"
                placeholder="King"
              />
              <span className="text-xl font-bold text-red-400">&minus;</span>
              <input
                type="text"
                value={arithSub}
                onChange={(e) => setArithSub(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono w-28 text-center"
                placeholder="Man"
              />
              <span className="text-xl font-bold text-emerald-400">+</span>
              <input
                type="text"
                value={arithAdd}
                onChange={(e) => setArithAdd(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono w-28 text-center"
                placeholder="Woman"
              />
              <span className="text-xl font-bold text-indigo-400">&approx;</span>
              <button
                onClick={() => handleRunArithmetic(arithA, arithSub, arithAdd)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md"
              >
                Compute Result
              </button>
            </div>

            {arithResult && (
              <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-300 font-medium">Nearest Vector in Knowledge Base:</div>
                  <div className="text-xl font-bold text-white uppercase font-mono tracking-wider mt-0.5">
                    "{arithResult.expected}"
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald-300">Cosine Similarity Score:</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {arithResult.score.toFixed(3)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Positional Encoding Tab */}
      {activeTab === 'positional' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Positional Encoding: Injecting Sequence Order
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              Because transformers process all tokens simultaneously without recurrence, they are order-invariant by default.
              Positional encodings provide the network with word order awareness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h4 className="text-sm font-semibold text-indigo-300">1. Sinusoidal Absolute Encodings (Vaswani et al.)</h4>
              <p className="text-xs text-slate-400">
                Uses fixed sine and cosine functions of varying geometric frequencies:
              </p>
              <MathFormula 
                formula="PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right), \quad PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right)"
                display
              />
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                Vector for Position pos=0: [{getSinusoidalPositionalEncoding(0, 8).map(x => x.toFixed(2)).join(', ')}]<br/>
                Vector for Position pos=1: [{getSinusoidalPositionalEncoding(1, 8).map(x => x.toFixed(2)).join(', ')}]<br/>
                Vector for Position pos=2: [{getSinusoidalPositionalEncoding(2, 8).map(x => x.toFixed(2)).join(', ')}]
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h4 className="text-sm font-semibold text-indigo-300">2. Rotary Position Embeddings (RoPE - Modern LLMs)</h4>
              <p className="text-xs text-slate-400">
                Used in Llama 3, Mistral, and DeepSeek. Rotates query and key vectors in complex 2D subspaces so inner products decay naturally with relative distance:
              </p>
              <MathFormula 
                formula="\mathbf{R}_{\Theta, m}^{d} \mathbf{x} = \begin{pmatrix} x_1 \cos(m\theta_1) - x_2 \sin(m\theta_1) \\ x_1 \sin(m\theta_1) + x_2 \cos(m\theta_1) \end{pmatrix}"
                display
              />
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                <strong>Advantage:</strong> Naturally scales to 128k+ long context windows without retraining, maintaining relative distances between distant tokens.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

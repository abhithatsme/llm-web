import React, { useState, useMemo } from 'react';
import { 
  buildVocabularyFromCorpus, 
  encodeText, 
  colorForTokenId, 
  getTokenStats 
} from '../../utils/tokenizer';
import { MathFormula } from '../MathFormula';
import { 
  Sparkles, 
  Sliders, 
  Search, 
  Info, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Layers,
  Zap
} from 'lucide-react';

interface Stage1Props {
  corpus: string;
  setCorpus: (val: string) => void;
  inputText: string;
  setInputText: (val: string) => void;
  onContinueToEmbeddings?: () => void;
}

export const Stage1Tokenizer: React.FC<Stage1Props> = ({
  corpus,
  setCorpus,
  inputText,
  setInputText,
  onContinueToEmbeddings
}) => {
  const [vocabLimit, setVocabLimit] = useState<number>(30);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  // Build vocabulary
  const { vocab, sortedWords, subwords } = useMemo(() => {
    return buildVocabularyFromCorpus(corpus, vocabLimit);
  }, [corpus, vocabLimit]);

  // Encode the active sentence
  const tokens = useMemo(() => {
    return encodeText(inputText, vocab);
  }, [inputText, vocab]);

  // Compute stats
  const stats = useMemo(() => {
    return getTokenStats(inputText, tokens);
  }, [inputText, tokens]);

  // Filter vocabulary rows
  const vocabEntries = useMemo(() => {
    return Object.entries(vocab)
      .map(([token, id]) => {
        const found = sortedWords.find(w => w.word === token);
        const count = found ? found.count : (token.startsWith('##') || token.length === 1 ? 'subword' : 'special');
        return { token, id, count };
      })
      .filter(item => 
        item.token.toLowerCase().includes(searchTerm.toLowerCase()) || 
        String(item.id).includes(searchTerm)
      )
      .sort((a, b) => a.id - b.id);
  }, [vocab, sortedWords, searchTerm]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stage Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/40 border border-blue-500/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Stage 1 of 7
              </span>
              <span className="text-xs text-slate-400 font-mono">BPE & WordPiece Subword Tokenization</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-400" />
              Tokenizer & Subword Vocabulary Lab
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              LLMs do not read words or letters directly. Text is converted into discrete integer IDs called <strong className="text-blue-300">Tokens</strong>.
              Watch how unknown words are broken down into subword pieces (<code className="text-amber-300 font-mono">##suffix</code>) when vocabulary shrinks.
            </p>
          </div>
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3 px-4 flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-400">Total Vocab Size</div>
              <div className="text-xl font-bold font-mono text-blue-400">{Object.keys(vocab).length}</div>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Compression</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{stats.compressionRate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Corpus & Vocab Config */}
        <div className="lg:col-span-5 space-y-6">
          {/* Corpus Training Input */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                Training Corpus (Sentences to Learn From)
              </label>
              <span className="text-xs text-slate-400 font-mono">{sortedWords.length} unique words</span>
            </div>
            <textarea
              value={corpus}
              onChange={(e) => setCorpus(e.target.value)}
              rows={6}
              className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl p-3 text-sm text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y transition-all"
              placeholder="Paste custom sentences to learn vocabulary from..."
            />
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              Words are ordered by frequency. Drag the slider below to control how many whole words survive.
            </p>

            {/* Vocab Slider (The key interactive feature from Newton reference!) */}
            <div className="mt-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Words Kept in Vocabulary
                </span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {Math.min(vocabLimit, sortedWords.length)} of {sortedWords.length} words
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(1, sortedWords.length)}
                value={Math.min(vocabLimit, sortedWords.length)}
                onChange={(e) => setVocabLimit(Number(e.target.value))}
                className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                <span>1 (Subword-heavy)</span>
                <span>50%</span>
                <span>All ({sortedWords.length})</span>
              </div>
            </div>
          </div>

          {/* Interactive Vocabulary Lookup Table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                Vocabulary Lookup Table
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter token or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 w-36 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto border border-slate-800/80 rounded-xl bg-slate-950/60 divide-y divide-slate-800/60">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 sticky top-0 backdrop-blur-sm z-10">
                  <tr>
                    <th className="py-2 px-3">Token ID</th>
                    <th className="py-2 px-3">Token Text</th>
                    <th className="py-2 px-3 text-right">Type / Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {vocabEntries.slice(0, 80).map((row) => (
                    <tr 
                      key={row.id}
                      onClick={() => setSelectedToken(row.token)}
                      className={`hover:bg-blue-500/10 cursor-pointer transition-colors ${selectedToken === row.token ? 'bg-blue-500/20 text-blue-300' : ''}`}
                    >
                      <td className="py-1.5 px-3 font-semibold text-blue-400">{row.id}</td>
                      <td className="py-1.5 px-3">
                        <span 
                          className="px-1.5 py-0.5 rounded text-[11px] font-mono inline-block border border-black/20"
                          style={{ backgroundColor: colorForTokenId(row.id), color: '#1e293b' }}
                        >
                          {row.token}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-right text-slate-400">
                        {typeof row.count === 'number' ? `${row.count}x` : row.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Sentence Encoder & Token Chip Visualizer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Live Sentence to Tokenize & Encode
              </label>
              <span className="text-xs text-slate-400 font-mono">Real-time tokenizer</span>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={3}
              className="w-full bg-slate-950/90 border border-slate-700 rounded-xl p-3.5 text-base text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/60 resize-none transition-all shadow-inner"
              placeholder="Type any sentence to inspect tokenization in real time..."
            />

            {/* Quick Sample Selector */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Quick examples:</span>
              {[
                "The dogs liked the sunny zebra.",
                "The cat sat on the mat.",
                "Transformer attention heads calculate vectors.",
                "Unprecedented astronomical discoveries occurred today."
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(sample)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-colors"
                >
                  "{sample.slice(0, 24)}..."
                </button>
              ))}
            </div>

            {/* Colored Token Chips Visualizer */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  Generated Tokens & Unique Color Signatures
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  {tokens.length} token{tokens.length !== 1 ? 's' : ''}
                </span>
              </div>

              {tokens.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-4 text-center">Type something above to see tokens...</p>
              ) : (
                <div className="flex flex-wrap gap-2.5 items-center">
                  {tokens.map((token, idx) => {
                    const bgColor = colorForTokenId(token.id);
                    return (
                      <div
                        key={`${token.id}-${idx}`}
                        onClick={() => setSelectedToken(token.text)}
                        className={`group relative px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-md transform hover:-translate-y-0.5 border border-black/20 ${
                          selectedToken === token.text ? 'ring-2 ring-white scale-105' : ''
                        }`}
                        style={{ backgroundColor: bgColor }}
                      >
                        <div className="text-slate-900 font-mono font-bold text-sm tracking-wide">
                          {token.text}
                        </div>
                        <div className="text-[10px] text-slate-700 font-mono font-semibold flex items-center justify-between gap-1 mt-0.5">
                          <span>#{token.id}</span>
                          {token.isSubword && (
                            <span className="bg-amber-900/30 text-amber-950 px-1 rounded text-[9px]">sub</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Subword Explanation banner */}
              {tokens.some(t => t.isSubword) && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">Subword Decomposition in Action:</strong> Words not in the vocabulary are split greedily into the longest known subword pieces prefixed with <code className="bg-amber-950/60 px-1 py-0.5 rounded font-mono text-amber-300">##</code>.
                    Notice how shrinking the slider breaks full words into letter combinations!
                  </div>
                </div>
              )}
            </div>

            {/* Tokenization Metric Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-medium">Characters</div>
                <div className="text-lg font-bold font-mono text-slate-100">{stats.charCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-medium">Tokens</div>
                <div className="text-lg font-bold font-mono text-blue-400">{stats.tokenCount}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-medium">Chars / Token</div>
                <div className="text-lg font-bold font-mono text-indigo-400">{stats.charsPerToken}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-medium">Subwords</div>
                <div className="text-lg font-bold font-mono text-amber-400">{stats.subwordCount}</div>
              </div>
            </div>

            {/* Next Stage Navigation CTA */}
            {onContinueToEmbeddings && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={onContinueToEmbeddings}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>Proceed to Stage 2: 3D Vector Embeddings</span>
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

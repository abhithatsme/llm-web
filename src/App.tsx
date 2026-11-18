import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PipelineStepper, STAGES } from './components/PipelineStepper';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { Stage1Tokenizer } from './components/stages/Stage1Tokenizer';
import { Stage2Embeddings3D } from './components/stages/Stage2Embeddings3D';
import { Stage3Attention } from './components/stages/Stage3Attention';
import { Stage4FeedForward } from './components/stages/Stage4FeedForward';
import { Stage5Normalization } from './components/stages/Stage5Normalization';
import { Stage6Sampling } from './components/stages/Stage6Sampling';
import { Stage7Autoregressive } from './components/stages/Stage7Autoregressive';
import { TraceTokenModal } from './components/TraceTokenModal';
import { AssignmentReportModal } from './components/AssignmentReportModal';
import { MODEL_PRESETS } from './data/presets';
import { ModelPreset } from './types/pipeline';
import { Sparkles, HelpCircle, BookOpen, Layers } from 'lucide-react';

export function App() {
  const [activePreset, setActivePreset] = useState<ModelPreset>(MODEL_PRESETS[0]);
  const [corpus, setCorpus] = useState<string>(MODEL_PRESETS[0].corpus);
  const [inputText, setInputText] = useState<string>(MODEL_PRESETS[0].sampleInput);
  const [sentences, setSentences] = useState<string[]>(MODEL_PRESETS[0].defaultSentences);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'story' | 'sandbox'>('story');
  
  const [isTraceModalOpen, setIsTraceModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Switch preset
  const handleSelectPreset = (preset: ModelPreset) => {
    setActivePreset(preset);
    setCorpus(preset.corpus);
    setInputText(preset.sampleInput);
    setSentences(preset.defaultSentences);
  };

  // Convert input text to tokens for attention
  const promptTokens = inputText.split(/\s+/).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Studio Navbar */}
      <Navbar
        activePresetId={activePreset.id}
        onSelectPreset={handleSelectPreset}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenTraceModal={() => setIsTraceModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Architecture Roadmap Header */}
        <ArchitectureDiagram 
          currentStage={currentStage} 
          onSelectStage={(stage) => {
            setCurrentStage(stage);
            if (viewMode === 'sandbox') {
              const el = document.getElementById(`stage-section-${stage}`);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }} 
        />

        {/* View Mode: Story Stepper */}
        {viewMode === 'story' && (
          <div className="space-y-6">
            <PipelineStepper 
              currentStage={currentStage} 
              setCurrentStage={setCurrentStage} 
            />

            <div className="transition-all duration-300">
              {currentStage === 1 && (
                <Stage1Tokenizer
                  corpus={corpus}
                  setCorpus={setCorpus}
                  inputText={inputText}
                  setInputText={setInputText}
                  onContinueToEmbeddings={() => setCurrentStage(2)}
                />
              )}

              {currentStage === 2 && (
                <Stage2Embeddings3D
                  sentences={sentences}
                  setSentences={setSentences}
                  onContinueToAttention={() => setCurrentStage(3)}
                />
              )}

              {currentStage === 3 && (
                <Stage3Attention
                  tokens={promptTokens}
                  onContinueToFFN={() => setCurrentStage(4)}
                />
              )}

              {currentStage === 4 && (
                <Stage4FeedForward
                  onContinueToNorm={() => setCurrentStage(5)}
                />
              )}

              {currentStage === 5 && (
                <Stage5Normalization
                  onContinueToSampling={() => setCurrentStage(6)}
                />
              )}

              {currentStage === 6 && (
                <Stage6Sampling
                  contextText={inputText}
                  onContinueToAutoregressive={() => setCurrentStage(7)}
                />
              )}

              {currentStage === 7 && (
                <Stage7Autoregressive
                  initialPrompt={inputText}
                />
              )}
            </div>
          </div>
        )}

        {/* View Mode: All-in-One Dashboard Sandbox */}
        {viewMode === 'sandbox' && (
          <div className="space-y-12">
            <div id="stage-section-1">
              <Stage1Tokenizer
                corpus={corpus}
                setCorpus={setCorpus}
                inputText={inputText}
                setInputText={setInputText}
              />
            </div>

            <div id="stage-section-2">
              <Stage2Embeddings3D
                sentences={sentences}
                setSentences={setSentences}
              />
            </div>

            <div id="stage-section-3">
              <Stage3Attention
                tokens={promptTokens}
              />
            </div>

            <div id="stage-section-4">
              <Stage4FeedForward />
            </div>

            <div id="stage-section-5">
              <Stage5Normalization />
            </div>

            <div id="stage-section-6">
              <Stage6Sampling
                contextText={inputText}
              />
            </div>

            <div id="stage-section-7">
              <Stage7Autoregressive
                initialPrompt={inputText}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">LLM Pipeline Explorer Studio</span>
            <span>&bull;</span>
            <span>Interactive Educational Sandbox</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Reference: Newton Vercel LLM Pipeline</span>
            <span>&bull;</span>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Export Assignment Report
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TraceTokenModal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        corpus={corpus}
      />

      <AssignmentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        corpus={corpus}
        sampleInput={inputText}
        sentences={sentences}
      />
    </div>
  );
}

export default App;

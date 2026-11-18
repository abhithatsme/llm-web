import React from 'react';
import { ModelPreset } from '../types/pipeline';
import { MODEL_PRESETS } from '../data/presets';
import { 
  Sparkles, 
  Layers, 
  LayoutDashboard, 
  FileCheck, 
  Search, 
  ChevronDown,
  Github,
  Compass
} from 'lucide-react';

interface NavbarProps {
  activePresetId: string;
  onSelectPreset: (preset: ModelPreset) => void;
  viewMode: 'story' | 'sandbox';
  setViewMode: (mode: 'story' | 'sandbox') => void;
  onOpenTraceModal: () => void;
  onOpenReportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePresetId,
  onSelectPreset,
  viewMode,
  setViewMode,
  onOpenTraceModal,
  onOpenReportModal
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-display text-white tracking-tight">
                LLM Pipeline Explorer
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
                Studio Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Interactive 7-Stage Neural Network & Transformer Visualizer
            </p>
          </div>
        </div>

        {/* Center / Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Preset Selector */}
          <div className="relative">
            <select
              value={activePresetId}
              onChange={(e) => {
                const found = MODEL_PRESETS.find(p => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs text-slate-200 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none font-medium transition-colors"
            >
              {MODEL_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  Preset: {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mode Switcher: Story vs Sandbox */}
          <div className="hidden md:flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('story')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'story'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Stage Stepper
            </button>
            <button
              onClick={() => setViewMode('sandbox')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'sandbox'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              All-in-One Sandbox
            </button>
          </div>

          {/* Trace Any Token Modal Trigger */}
          <button
            onClick={onOpenTraceModal}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Trace any word end-to-end"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Trace Token</span>
          </button>

          {/* Assignment Report Export */}
          <button
            onClick={onOpenReportModal}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Assignment Report</span>
            <span className="sm:hidden">Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};

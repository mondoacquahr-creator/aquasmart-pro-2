import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AIVisualizer } from './AIVisualizer';
import VisualizerApp from './visualizer';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';

interface VisualizerPageProps {
  onBack: () => void;
}

export function VisualizerPage({ onBack }: VisualizerPageProps) {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');

  return (
    <div className="relative min-h-screen" style={{ background: T.pageBg }}>
      <WaterBackground />

      {/* Header */}
      <div
        className="sticky top-0 z-20"
        style={{ background: T.cardBg, backdropFilter: 'blur(20px)', borderBottom: T.cardBorder }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5" style={{ color: T.cyan }} />
          </button>
          <h1 className="text-lg font-bold flex-1">Vizualizator bazena</h1>
          {/* Mode pills */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: T.cardBorder }}
          >
            <button
              onClick={() => setMode('ai')}
              className="px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: mode === 'ai' ? `${T.cyan}18` : 'transparent',
                color: mode === 'ai' ? T.cyan : T.muted,
                borderRight: T.cardBorder,
                ...(mode === 'ai' ? { outline: `1px solid ${T.cyan}`, outlineOffset: '-1px' } : {}),
              }}
            >
              AI vizualizacija
            </button>
            <button
              onClick={() => setMode('manual')}
              className="px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: mode === 'manual' ? `${T.cyan}18` : 'transparent',
                color: mode === 'manual' ? T.cyan : T.muted,
                ...(mode === 'manual' ? { outline: `1px solid ${T.cyan}`, outlineOffset: '-1px' } : {}),
              }}
            >
              Ručni način
            </button>
          </div>
        </div>
      </div>

      {mode === 'ai' ? (
        <AIVisualizer onManual={() => setMode('manual')} />
      ) : (
        <VisualizerApp />
      )}
    </div>
  );
}

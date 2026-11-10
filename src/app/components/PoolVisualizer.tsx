import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import VisualizerApp from './visualizer/index';

export function PoolVisualizer() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Sticky Back Button - Minimalno vidljiv, uvijek dostupan */}
      <button
        onClick={() => navigate('/app/more')}
        className="fixed top-4 left-4 z-[200] p-3 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800 transition-all text-slate-300 hover:text-white shadow-xl"
        title="Natrag na More"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Visualizer App - Pusti da koristi svoj header i navigaciju */}
      <VisualizerApp />
    </div>
  );
}
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { Home, Waves, ArrowRight, Sparkles } from 'lucide-react';

interface ProjectTypeStepProps {
  initialData?: 'interior' | 'exterior' | null;
  onNext: (type: 'interior' | 'exterior') => void;
}

export function ProjectTypeStep({ initialData, onNext }: ProjectTypeStepProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full px-6 py-2 mb-6">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-300">Profesionalni paket za preuređenje</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent mb-4">
            Dizajnirajte Vaš Prostor Iz Snova
          </h1>
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto">
            Pretvorite svoju viziju u stvarnost s preciznim mjerenjima i fotorealističnim prikazima
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Interior Option */}
          <GlassCard className="group hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-indigo-600/0 group-hover:from-indigo-600/20 group-hover:to-purple-600/20 transition-all duration-300" />
            
            <button
              onClick={() => onNext('interior')}
              className="w-full text-left p-8 md:p-10 relative z-10"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/50">
                <Home className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">
                Unutarnji Dizajn
              </h2>
              
              <p className="text-white/70 text-lg mb-6 group-hover:text-white/90 transition-colors">
                Dizajnirajte unutarnje prostore sa saunama, jacuzzijima i prilagođenim elementima uz precizna mjerenja u centimetrima
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-white/60 group-hover:text-white/80 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Unutarnje saune & wellness prostori</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 group-hover:text-white/80 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Jacuzziji & spa instalacije</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 group-hover:text-white/80 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Prilagođeni elementi prostorija</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-indigo-400 font-semibold group-hover:gap-4 transition-all">
                <span>Započni unutarnji projekt</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </GlassCard>

          {/* Exterior Option */}
          <GlassCard className="group hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/0 to-cyan-600/0 group-hover:from-cyan-600/20 group-hover:to-blue-600/20 transition-all duration-300" />
            
            <button
              onClick={() => onNext('exterior')}
              className="w-full text-left p-8 md:p-10 relative z-10"
            >
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/50">
                <Waves className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors">
                Vanjski Dizajn
              </h2>
              
              <p className="text-white/70 text-lg mb-6 group-hover:text-white/90 transition-colors">
                Transformirajte vanjske prostore s bazenima, spa zonama i uređenjem krajolika uz precizne dimenzije
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-white/60 group-hover:text-white/80 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Bazeni & vodene značajke</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 group-hover:text-white/80 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Vanjski spa & jacuzziji</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 group-hover:text-white/80 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Terase & instalacije</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-4 transition-all">
                <span>Započni vanjski projekt</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </GlassCard>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm">
            ✨ Učitajte fotografije • Crtajte granice • Dodajte objekte sa stvarnim dimenzijama • Vizualizirajte dizajn
          </p>
        </div>
      </div>
    </div>
  );
}

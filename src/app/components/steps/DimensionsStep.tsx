import { useState } from 'react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { RoomDimensions } from '../../types';
import { Ruler, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';

interface DimensionsStepProps {
  initialData: RoomDimensions | null;
  projectType: 'interior' | 'exterior' | null;
  onNext: (dimensions: RoomDimensions) => void;
  onBack: () => void;
}

export function DimensionsStep({ initialData, projectType, onNext, onBack }: DimensionsStepProps) {
  const [dimensions, setDimensions] = useState<RoomDimensions>(
    initialData || {
      width: 0,
      height: 0,
      depth: 0,
    }
  );

  const isExterior = projectType === 'exterior';
  const title = isExterior ? 'Dimenzije prostora' : 'Dimenzije prostorije';
  const description = isExterior 
    ? 'Unesite mjerenja vašeg vanjskog prostora u centimetrima'
    : 'Unesite mjerenja vašeg unutarnjeg prostora u centimetrima';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For exterior, height is not required
    const isValid = isExterior
      ? dimensions.width > 0 && dimensions.depth > 0
      : dimensions.width > 0 && dimensions.height > 0 && dimensions.depth > 0;
    
    if (isValid) {
      // Set height to 1 for exterior if not provided (to avoid division by zero)
      const finalDimensions = isExterior && !dimensions.height 
        ? { ...dimensions, height: 1 }
        : dimensions;
      onNext(finalDimensions);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <GlassCard className="w-full max-w-2xl p-8 md:p-12 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <Ruler className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                {title}
              </h1>
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-white/60 text-sm md:text-base">{description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className={`grid grid-cols-1 gap-6 ${isExterior ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              <div>
                <Label htmlFor="width" className="text-white/90 mb-2 block">Širina (X)</Label>
                <Input
                  id="width"
                  type="number"
                  step="1"
                  min="1"
                  value={dimensions.width || ''}
                  onChange={(e) =>
                    setDimensions({ ...dimensions, width: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-xs text-white/40 mt-2">
                  {isExterior ? 'Širina prostora u cm' : 'Širina prostorije u cm'}
                </p>
              </div>

              {!isExterior && (
                <div>
                  <Label htmlFor="height" className="text-white/90 mb-2 block">Visina (Y)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="1"
                    min="1"
                    value={dimensions.height || ''}
                    onChange={(e) =>
                      setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-xs text-white/40 mt-2">
                    Visina prostorije u cm
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="depth" className="text-white/90 mb-2 block">Dubina (Z)</Label>
                <Input
                  id="depth"
                  type="number"
                  step="1"
                  min="1"
                  value={dimensions.depth || ''}
                  onChange={(e) =>
                    setDimensions({ ...dimensions, depth: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-xs text-white/40 mt-2">
                  {isExterior ? 'Dubina prostora u cm' : 'Dubina prostorije u cm'}
                </p>
              </div>
            </div>

            {isExterior && dimensions.width > 0 && dimensions.depth > 0 && (
              <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-sm font-semibold text-indigo-200 mb-4">Sažetak prostora</p>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-white/60">Širina:</span>{' '}
                    <span className="font-semibold text-white block text-lg">
                      {dimensions.width} cm
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Dubina:</span>{' '}
                    <span className="font-semibold text-white block text-lg">
                      {dimensions.depth} cm
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <span className="text-white/60">Površina:</span>{' '}
                  <span className="font-semibold text-indigo-200 text-lg">
                    {((dimensions.width * dimensions.depth) / 10000).toFixed(2)} m²
                  </span>
                </div>
              </div>
            )}

            {!isExterior && dimensions.width > 0 && dimensions.height > 0 && dimensions.depth > 0 && (
              <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-sm font-semibold text-indigo-200 mb-4">Sažetak prostorije</p>
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-white/60">Širina:</span>{' '}
                    <span className="font-semibold text-white block text-lg">
                      {dimensions.width} cm
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Visina:</span>{' '}
                    <span className="font-semibold text-white block text-lg">
                      {dimensions.height} cm
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Dubina:</span>{' '}
                    <span className="font-semibold text-white block text-lg">
                      {dimensions.depth} cm
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <span className="text-white/60">Volumen:</span>{' '}
                  <span className="font-semibold text-indigo-200 text-lg">
                    {((dimensions.width * dimensions.height * dimensions.depth) / 1000000).toFixed(2)} m³
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              size="lg" 
              className="min-w-40 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/50 transition-all duration-300 hover:shadow-indigo-500/70 hover:scale-105"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Natrag
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              className="min-w-40 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/50 transition-all duration-300 hover:shadow-indigo-500/70 hover:scale-105"
            >
              Dalje
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

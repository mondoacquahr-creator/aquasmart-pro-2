import { ReactNode, useState, useEffect, useRef } from 'react';
import { Sparkles, X, Lightbulb, Wand2, MessageSquare, Check, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative bg-slate-900/80 rounded-3xl border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10 ${className}`}>
      {children}
    </div>
  );
}

export function AIAssistant({ projectType, currentStep }: { projectType: 'interior' | 'exterior' | null; currentStep: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'generate'>('suggestions');

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl shadow-purple-500/50 flex items-center justify-center hover:scale-110 transition-all duration-300 group">
        <Sparkles className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] animate-in slide-in-from-bottom-5">
          <GlassCard className="p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Asistent</h3>
                  <p className="text-xs text-white/60">Vaš dizajnerski pomoćnik</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white hover:bg-white/10">
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Minimal AI Assistant Content for brevity */}
            <div className="bg-white/5 p-4 rounded-xl text-sm text-white/80">
              AI sugestije su spremne za pomoć u dizajnu. Preporučujemo precizno označavanje kutova za optimalne rezultate perspektivne transformacije.
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}

export function StepNavigation({ currentStep, completedSteps, projectType, onNavigate }: any) {
  const steps = [
    { id: 'photo-upload', label: 'Učitaj prostor', number: 1 },
    { id: 'photo-edit', label: 'Uredi prostor', number: 2 },
    { id: 'object-upload', label: 'Učitaj objekt', number: 3 },
    { id: 'object-crop', label: 'Izreži objekt', number: 4 },
    { id: 'design-canvas', label: 'Postavi objekt', number: 5 },
  ];

  return (
    <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl">
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const isClickable = isCompleted && !isCurrent;
          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => isClickable && onNavigate(step.id)}
                disabled={!isClickable}
                className={`flex items-center gap-3 transition-all ${isClickable ? 'cursor-pointer hover:scale-105' : isCurrent ? 'cursor-default' : 'cursor-not-allowed opacity-50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isCompleted ? 'bg-green-500 text-white shadow-lg' : isCurrent ? 'bg-amber-500 text-white shadow-lg ring-4 ring-amber-400/30' : 'bg-white/10 text-white/50 border border-white/20'}`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <div className="text-left hidden md:block">
                  <div className={`text-sm font-semibold ${isCurrent ? 'text-white' : isCompleted ? 'text-green-300' : 'text-white/50'}`}>
                    {step.label}
                  </div>
                </div>
              </button>
              {index < steps.length - 1 && <ChevronRight className="w-5 h-5 text-white/30 mx-2 md:mx-4 flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Minimalized CropOverlay and ObjectTransformOverlay for file length limits
export function CropOverlay({ canvasWidth, canvasHeight, onApplyCrop, onCancel, canvasRef }: any) {
  const [points, setPoints] = useState([
    { x: canvasWidth * 0.05, y: canvasHeight * 0.05 },
    { x: canvasWidth * 0.95, y: canvasHeight * 0.05 },
    { x: canvasWidth * 0.95, y: canvasHeight * 0.95 },
    { x: canvasWidth * 0.05, y: canvasHeight * 0.95 },
  ]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Simple drag logic
  const handleMove = (e: any) => {
    if (draggingIndex === null || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvasWidth, (e.clientX || e.touches?.[0].clientX) - rect.left));
    const y = Math.max(0, Math.min(canvasHeight, (e.clientY || e.touches?.[0].clientY) - rect.top));
    const newPoints = [...points];
    newPoints[draggingIndex] = { x, y };
    setPoints(newPoints);
  };

  useEffect(() => {
    if (draggingIndex !== null) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', () => setDraggingIndex(null));
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', () => setDraggingIndex(null));
      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', () => setDraggingIndex(null));
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', () => setDraggingIndex(null));
      };
    }
  }, [draggingIndex]);

  return (
    <div className="absolute inset-0 pointer-events-auto z-50">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="transparent" stroke="#F59E0B" strokeWidth="3" strokeDasharray="5,5" />
      </svg>
      {points.map((p, i) => (
        <div key={i} className="absolute w-8 h-8 bg-amber-400 border-2 border-white rounded-full cursor-move shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{ left: p.x, top: p.y, zIndex: 1000 }}
          onMouseDown={(e) => { e.stopPropagation(); setDraggingIndex(i); }}
          onTouchStart={(e) => { e.stopPropagation(); setDraggingIndex(i); }}
        />
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto">
        <Button onClick={onCancel} variant="outline" className="bg-white/10 text-white"><X className="w-4 h-4 mr-2"/>Odustani</Button>
        <Button onClick={() => onApplyCrop(points, { x: Math.min(...points.map(p=>p.x)), y: Math.min(...points.map(p=>p.y)), width: Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x)), height: Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y)) })} className="bg-amber-600 text-white"><Check className="w-4 h-4 mr-2"/>Primijeni</Button>
      </div>
    </div>
  );
}

export function ObjectTransformOverlay({ objectPosition, objectWidth, objectHeight, onApplyTransform, onCancel }: any) {
  const [points, setPoints] = useState([
    { x: objectPosition.x, y: objectPosition.y },
    { x: objectPosition.x + objectWidth, y: objectPosition.y },
    { x: objectPosition.x + objectWidth, y: objectPosition.y + objectHeight },
    { x: objectPosition.x, y: objectPosition.y + objectHeight },
  ]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleMove = (e: any) => {
    if (draggingIndex === null) return;
    const canvas = document.querySelector('[data-canvas-container]') as HTMLElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, (e.clientX || e.touches?.[0].clientX) - rect.left));
    const y = Math.max(0, Math.min(rect.height, (e.clientY || e.touches?.[0].clientY) - rect.top));
    const newPoints = [...points];
    newPoints[draggingIndex] = { x, y };
    setPoints(newPoints);
  };

  useEffect(() => {
    if (draggingIndex !== null) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', () => setDraggingIndex(null));
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', () => setDraggingIndex(null));
      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', () => setDraggingIndex(null));
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', () => setDraggingIndex(null));
      };
    }
  }, [draggingIndex]);

  return (
    <div className="absolute inset-0 pointer-events-auto z-50">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(255, 215, 0, 0.15)" stroke="#FFD700" strokeWidth="3" />
      </svg>
      {points.map((p, i) => (
        <div key={i} className="absolute w-8 h-8 bg-yellow-400 border-2 border-white rounded-full cursor-move shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{ left: p.x, top: p.y, zIndex: 60 }}
          onMouseDown={(e) => { e.stopPropagation(); setDraggingIndex(i); }}
          onTouchStart={(e) => { e.stopPropagation(); setDraggingIndex(i); }}
        />
      ))}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-[60]">
        <Button onClick={onCancel} variant="outline" className="bg-white/10 text-white"><X className="w-5 h-5 mr-2"/>Odustani</Button>
        <Button onClick={() => onApplyTransform(points)} className="bg-yellow-500 text-black font-bold"><Check className="w-5 h-5 mr-2"/>Transformiraj</Button>
      </div>
    </div>
  );
}
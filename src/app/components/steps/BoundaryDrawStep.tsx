import { useState, useRef, useEffect } from 'react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2, MapPin } from 'lucide-react';

interface Line {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface BoundaryDrawStepProps {
  photo: string;
  initialLines?: Line[];
  onNext: (lines: Line[]) => void;
  onBack: () => void;
}

export function BoundaryDrawStep({ photo, initialLines = [], onNext, onBack }: BoundaryDrawStepProps) {
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = photo;
    img.onload = () => {
      if (canvasRef.current && containerRef.current) {
        const container = containerRef.current;
        const maxWidth = container.clientWidth;
        const maxHeight = window.innerHeight * 0.6;
        
        let width = img.width;
        let height = img.height;
        
        const scaleX = maxWidth / width;
        const scaleY = maxHeight / height;
        const scale = Math.min(scaleX, scaleY, 1);
        
        width = width * scale;
        height = height * scale;
        
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        imgRef.current = img;
        setScale(scale);
        drawCanvas();
      }
    };
  }, [photo]);

  useEffect(() => {
    drawCanvas();
  }, [lines, currentLine]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imgRef.current) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all completed lines
    lines.forEach((line) => {
      drawLine(ctx, line, '#6366f1', 4);
    });

    // Draw current line being drawn
    if (currentLine) {
      drawLine(ctx, currentLine, '#a855f7', 4);
    }
  };

  const drawLine = (ctx: CanvasRenderingContext2D, line: Line, color: string, width: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.stroke();

    // Draw endpoints
    ctx.fillStyle = color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(line.x1, line.y1, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(line.x2, line.y2, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);
    setIsDrawing(true);
    setCurrentLine({
      id: `temp`,
      x1: x,
      y1: y,
      x2: x,
      y2: y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentLine) return;

    const { x, y } = getCanvasCoordinates(e);
    setCurrentLine({
      ...currentLine,
      x2: x,
      y2: y,
    });
  };

  const handleMouseUp = () => {
    if (currentLine && isDrawing) {
      const distance = Math.sqrt(
        Math.pow(currentLine.x2 - currentLine.x1, 2) + 
        Math.pow(currentLine.y2 - currentLine.y1, 2)
      );
      
      // Only add line if it's long enough (not just a click)
      if (distance > 10) {
        setLines([...lines, { ...currentLine, id: `line-${Date.now()}` }]);
      }
    }
    setIsDrawing(false);
    setCurrentLine(null);
  };

  const handleClearAll = () => {
    setLines([]);
  };

  const handleUndo = () => {
    if (lines.length > 0) {
      setLines(lines.slice(0, -1));
    }
  };

  const handleNext = () => {
    onNext(lines);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <GlassCard className="w-full max-w-6xl p-8 md:p-12 relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              Označi granice prostora
            </h1>
            <p className="text-white/60 text-sm md:text-base">
              Nacrtajte linije za označavanje zidova, granica ili zona postavljanja objekata
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-4 mb-6 backdrop-blur-sm">
          <p className="text-sm text-white/90">
            <strong>Kako koristiti:</strong> Kliknite i povucite po slici za crtanje graničnih linija. One pomažu pri preciznom pozicioniranju objekata.
          </p>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="mb-6 flex justify-center">
          <div className="relative inline-block rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-crosshair bg-black/20"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
            <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50" />
            <span className="text-sm text-white/70">Nacrtane linije: {lines.length}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={lines.length === 0}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
          >
            <Minus className="w-4 h-4 mr-2" />
            Poništi zadnju
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={lines.length === 0}
            className="bg-white/5 border-white/10 text-white hover:bg-red-500/20 hover:border-red-500/30 disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Obriši sve
          </Button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Natrag
          </Button>
          
          <Button
            onClick={handleNext}
            size="lg"
            className="min-w-40 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/50 transition-all duration-300 hover:shadow-indigo-500/70 hover:scale-105"
          >
            Dalje
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

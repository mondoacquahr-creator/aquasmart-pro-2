import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from './ui/button';

interface Point {
  x: number;
  y: number;
}

interface ObjectTransformOverlayProps {
  objectPosition: { x: number; y: number };
  objectWidth: number;
  objectHeight: number;
  objectRotation: number;
  onApplyTransform: (points: Point[]) => void;
  onCancel: () => void;
}

export function ObjectTransformOverlay({
  objectPosition,
  objectWidth,
  objectHeight,
  objectRotation,
  onApplyTransform,
  onCancel,
}: ObjectTransformOverlayProps) {
  // Initialize 4 corner points based on object's current position and size
  const [points, setPoints] = useState<Point[]>([
    { x: objectPosition.x, y: objectPosition.y }, // Top-left
    { x: objectPosition.x + objectWidth, y: objectPosition.y }, // Top-right
    { x: objectPosition.x + objectWidth, y: objectPosition.y + objectHeight }, // Bottom-right
    { x: objectPosition.x, y: objectPosition.y + objectHeight }, // Bottom-left
  ]);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setDraggingIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    e.stopPropagation();
    setDraggingIndex(index);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingIndex === null) return;

    const canvas = document.querySelector('[data-canvas-container]');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints((prev) => {
      const newPoints = [...prev];
      newPoints[draggingIndex] = { 
        x: Math.max(0, Math.min(rect.width, x)), 
        y: Math.max(0, Math.min(rect.height, y)) 
      };
      return newPoints;
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (draggingIndex === null) return;

    const canvas = document.querySelector('[data-canvas-container]');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setPoints((prev) => {
      const newPoints = [...prev];
      newPoints[draggingIndex] = { 
        x: Math.max(0, Math.min(rect.width, x)), 
        y: Math.max(0, Math.min(rect.height, y)) 
      };
      return newPoints;
    });
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  const handleTouchEnd = () => {
    setDraggingIndex(null);
  };

  useEffect(() => {
    if (draggingIndex !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [draggingIndex]);

  const handleApply = () => {
    onApplyTransform(points);
  };

  // Calculate the center to show info
  const getCenter = () => {
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / 4;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / 4;
    return { x: centerX, y: centerY };
  };

  const center = getCenter();

  return (
    <div className="absolute inset-0 pointer-events-auto z-50">
      {/* Dark overlay over entire canvas */}
      <div className="absolute inset-0 bg-black/70 pointer-events-none" />

      {/* SVG for drawing the quad shape */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Fill the selected area */}
        <polygon
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="rgba(255, 215, 0, 0.15)"
          stroke="#FFD700"
          strokeWidth="3"
          strokeDasharray="8,4"
        />

        {/* Draw lines between points */}
        {points.map((point, i) => {
          const nextPoint = points[(i + 1) % points.length];
          return (
            <line
              key={i}
              x1={point.x}
              y1={point.y}
              x2={nextPoint.x}
              y2={nextPoint.y}
              stroke="#FFD700"
              strokeWidth="4"
            />
          );
        })}

        {/* Grid lines inside the quad for better visualization */}
        <line
          x1={points[0].x}
          y1={points[0].y}
          x2={points[2].x}
          y2={points[2].y}
          stroke="#FFD700"
          strokeWidth="1.5"
          opacity="0.4"
          strokeDasharray="4,4"
        />
        <line
          x1={points[1].x}
          y1={points[1].y}
          x2={points[3].x}
          y2={points[3].y}
          stroke="#FFD700"
          strokeWidth="1.5"
          opacity="0.4"
          strokeDasharray="4,4"
        />
      </svg>

      {/* Corner handles - 4 independent points */}
      {points.map((point, index) => (
        <div
          key={index}
          className="absolute w-10 h-10 md:w-7 md:h-7 bg-yellow-400 border-4 border-white rounded-full cursor-move shadow-2xl transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 active:scale-150 transition-transform z-[60] touch-none"
          style={{
            left: point.x,
            top: point.y,
            boxShadow: '0 0 25px rgba(255, 215, 0, 0.8), 0 0 50px rgba(255, 215, 0, 0.4)',
          }}
          onMouseDown={(e) => handleMouseDown(e, index)}
          onTouchStart={(e) => handleTouchStart(e, index)}
        >
          {/* Corner label */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg">
            {index === 0 ? 'TL' : index === 1 ? 'TR' : index === 2 ? 'BR' : 'BL'}
          </div>
        </div>
      ))}

      {/* Center info display */}
      <div
        className="absolute bg-yellow-400/95 text-black px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl backdrop-blur-sm border-2 border-white"
        style={{
          left: center.x,
          top: center.y,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      >
        <div className="text-center">
          <div className="text-xs opacity-75 mb-1">Perspektivna transformacija</div>
          <div className="font-bold">Povucite kutove</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-[60]">
        <Button
          onClick={onCancel}
          variant="outline"
          size="lg"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md shadow-2xl"
        >
          <X className="w-5 h-5 mr-2" />
          Odustani
        </Button>
        <Button
          onClick={handleApply}
          size="lg"
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold shadow-2xl shadow-yellow-500/50"
        >
          <Check className="w-5 h-5 mr-2" />
          Primijeni transformaciju
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white px-8 py-4 rounded-2xl text-sm backdrop-blur-md shadow-2xl border-2 border-yellow-400/50">
        <p className="font-bold text-lg mb-2 text-yellow-400">🎯 Perspektivna transformacija objekta</p>
        <p className="text-xs text-white/90">Povucite svaki kut neovisno da biste prilagodili perspektivu objekta prostoru</p>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../../ui/button';

interface Point {
  x: number;
  y: number;
}

interface CropOverlayProps {
  canvasWidth: number;
  canvasHeight: number;
  onApplyCrop: (points: Array<{x: number, y: number}>, cropArea: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>; // ADD: Reference to the main canvas
}

export function CropOverlay({ canvasWidth, canvasHeight, onApplyCrop, onCancel, canvasRef }: CropOverlayProps) {
  const [points, setPoints] = useState([
    { x: canvasWidth * 0.05, y: canvasHeight * 0.05 },
    { x: canvasWidth * 0.95, y: canvasHeight * 0.05 },
    { x: canvasWidth * 0.95, y: canvasHeight * 0.95 },
    { x: canvasWidth * 0.05, y: canvasHeight * 0.95 },
  ]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);

  // Store original canvas content when component mounts
  useEffect(() => {
    if (canvasRef?.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        setOriginalImageData(imageData);
      }
    }
  }, [canvasRef, canvasWidth, canvasHeight]);

  // Update canvas preview whenever points change
  useEffect(() => {
    if (!canvasRef?.current || !originalImageData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Restore original image
    ctx.putImageData(originalImageData, 0, 0);

    // Draw semi-transparent dark overlay on the area that WILL BE REMOVED (inside polygon)
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

  }, [points, canvasRef, originalImageData, canvasWidth, canvasHeight]);

  // Cleanup: restore original image when unmounting
  useEffect(() => {
    return () => {
      if (canvasRef?.current && originalImageData) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.putImageData(originalImageData, 0, 0);
        }
      }
    };
  }, [canvasRef, originalImageData]);

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

    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // Convert display coordinates to canvas pixel coordinates
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    
    const displayX = e.clientX - rect.left;
    const displayY = e.clientY - rect.top;
    
    const x = Math.max(0, Math.min(canvasWidth, displayX * scaleX));
    const y = Math.max(0, Math.min(canvasHeight, displayY * scaleY));

    setPoints((prev) => {
      const newPoints = [...prev];
      newPoints[draggingIndex] = { x, y };
      return newPoints;
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (draggingIndex === null) return;

    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // Convert display coordinates to canvas pixel coordinates
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    
    const touch = e.touches[0];
    const displayX = touch.clientX - rect.left;
    const displayY = touch.clientY - rect.top;
    
    const x = Math.max(0, Math.min(canvasWidth, displayX * scaleX));
    const y = Math.max(0, Math.min(canvasHeight, displayY * scaleY));

    setPoints((prev) => {
      const newPoints = [...prev];
      newPoints[draggingIndex] = { x, y };
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
    // Calculate the bounding box of the crop area
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    const cropArea = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
    onApplyCrop(points, cropArea);
  };

  // Calculate the area to show dimensions
  const getCenter = () => {
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / 4;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / 4;
    return { x: centerX, y: centerY };
  };

  const center = getCenter();

  // Calculate canvas display dimensions
  const canvas = document.querySelector('canvas');
  const displayWidth = canvas?.getBoundingClientRect().width || canvasWidth;
  const displayHeight = canvas?.getBoundingClientRect().height || canvasHeight;
  
  // Scale factor to convert canvas coordinates to display coordinates
  const scaleX = displayWidth / canvasWidth;
  const scaleY = displayHeight / canvasHeight;

  return (
    <div className="absolute inset-0 pointer-events-auto z-50">
      {/* Dark overlay - covers canvas area with semi-transparent dark */}
      <div className="absolute inset-0 bg-black/70 pointer-events-none" />
      
      {/* Container for the crop area - sized to match canvas display */}
      <div className="absolute inset-0 pointer-events-none">
        {/* SVG for drawing the quad shape - using viewBox to match canvas coordinates */}
        <svg 
          className="absolute inset-0 pointer-events-none w-full h-full" 
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          preserveAspectRatio="none"
        >
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
                stroke="#F59E0B"
                strokeWidth="3"
              />
            );
          })}

          {/* Grid lines inside the quad for better visualization */}
          <line
            x1={points[0].x}
            y1={points[0].y}
            x2={points[2].x}
            y2={points[2].y}
            stroke="#F59E0B"
            strokeWidth="1"
            opacity="0.4"
            strokeDasharray="3,3"
          />
          <line
            x1={points[1].x}
            y1={points[1].y}
            x2={points[3].x}
            y2={points[3].y}
            stroke="#F59E0B"
            strokeWidth="1"
            opacity="0.4"
            strokeDasharray="3,3"
          />
        </svg>

        {/* Corner handles - 4 independent points */}
        {points.map((point, index) => (
          <div
            key={index}
            className="absolute w-10 h-10 md:w-7 md:h-7 bg-amber-400 border-3 border-white rounded-full cursor-move shadow-2xl transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 active:scale-150 transition-transform pointer-events-auto touch-none"
            style={{
              left: point.x * scaleX,
              top: point.y * scaleY,
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.4)',
              zIndex: 1000,
            }}
            onMouseDown={(e) => handleMouseDown(e, index)}
            onTouchStart={(e) => handleTouchStart(e, index)}
          >
            {/* Corner label */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-400 text-black px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-lg">
              {index === 0 ? 'TL' : index === 1 ? 'TR' : index === 2 ? 'BR' : 'BL'}
            </div>
          </div>
        ))}

        {/* Center info display */}
        <div
          className="absolute bg-amber-400/95 text-black px-4 py-2 rounded-lg text-sm font-semibold shadow-2xl backdrop-blur-sm"
          style={{
            left: center.x * scaleX,
            top: center.y * scaleY,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <div className="text-center">
            <div className="text-xs opacity-75">Područje za brisanje</div>
            <div>Povucite kutove</div>
          </div>
        </div>
      </div>

      {/* Action buttons - Fixed to viewport */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto" style={{ zIndex: 2000 }}>
        <Button
          onClick={onCancel}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm shadow-xl"
        >
          <X className="w-4 h-4 mr-2" />
          Odustani
        </Button>
        <Button
          onClick={handleApply}
          className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 shadow-xl shadow-amber-500/50"
        >
          <Check className="w-4 h-4 mr-2" />
          Primijeni obrezivanje
        </Button>
      </div>

      {/* Instructions - Fixed to viewport */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-xl text-sm backdrop-blur-sm shadow-2xl border border-amber-400/30 pointer-events-none" style={{ zIndex: 2000 }}>
        <p className="font-semibold mb-1">✂ Slobodno obrezivanje prostora</p>
        <p className="text-xs text-white/80">Povucite svaki kut neovisno - tamno područje bit će obrisano</p>
      </div>
    </div>
  );
}
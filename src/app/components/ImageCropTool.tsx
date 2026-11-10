import { useState, useRef, useEffect } from 'react';
import { Crop, Check, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropToolProps {
  image: string;
  onCropComplete: (croppedImageDataUrl: string) => void;
  onCancel: () => void;
  step?: 'whole' | 'ph' | 'chlorine';
  stepTitle?: string;
  stepDescription?: string;
}

export function ImageCropTool({ image, onCropComplete, onCancel, step = 'whole', stepTitle, stepDescription }: ImageCropToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageElement(img);
      drawImage(img);
    };
    img.src = image;
    
    // Reset crop selection when image changes (new crop step)
    setCropStart(null);
    setCropEnd(null);
  }, [image]);

  useEffect(() => {
    if (imageElement) {
      drawImage(imageElement);
    }
  }, [cropStart, cropEnd, scale]);

  const drawImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    
    // Limit max width for easier cropping of details
    const maxCanvasWidth = 600; // Smaller size for easier pH/Cl cropping
    const actualWidth = Math.min(containerWidth, maxCanvasWidth);
    
    const aspectRatio = img.height / img.width;
    const canvasHeight = actualWidth * aspectRatio;

    canvas.width = actualWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw crop rectangle if exists
    if (cropStart && cropEnd) {
      const x = Math.min(cropStart.x, cropEnd.x);
      const y = Math.min(cropStart.y, cropEnd.y);
      const width = Math.abs(cropEnd.x - cropStart.x);
      const height = Math.abs(cropEnd.y - cropStart.y);

      // Darken outside area
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, y); // Top
      ctx.fillRect(0, y, x, height); // Left
      ctx.fillRect(x + width, y, canvas.width - x - width, height); // Right
      ctx.fillRect(0, y + height, canvas.width, canvas.height - y - height); // Bottom

      // Draw selection rectangle
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw corner handles
      const handleSize = 12;
      ctx.fillStyle = '#14b8a6';
      ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize); // Top-left
      ctx.fillRect(x + width - handleSize / 2, y - handleSize / 2, handleSize, handleSize); // Top-right
      ctx.fillRect(x - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize); // Bottom-left
      ctx.fillRect(x + width - handleSize / 2, y + height - handleSize / 2, handleSize, handleSize); // Bottom-right
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCropStart({ x, y });
    setCropEnd({ x, y });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCropEnd({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setCropStart({ x, y });
    setCropEnd({ x, y });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setCropEnd({ x, y });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleCropConfirm = () => {
    if (!cropStart || !cropEnd || !imageElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate crop area
    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);

    if (width < 10 || height < 10) {
      alert('Odaberite veći region za crop!');
      return;
    }

    // Scale coordinates to original image size
    const scaleX = imageElement.width / canvas.width;
    const scaleY = imageElement.height / canvas.height;

    const cropX = x * scaleX;
    const cropY = y * scaleY;
    const cropWidth = width * scaleX;
    const cropHeight = height * scaleY;

    // Create new canvas for cropped image
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    const ctx = croppedCanvas.getContext('2d');
    if (!ctx) return;

    // Draw cropped portion
    ctx.drawImage(
      imageElement,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Convert to data URL
    const croppedImageDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.95);
    onCropComplete(croppedImageDataUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 p-4 shadow-lg">
        <div className="flex flex-col gap-3 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Crop className="w-6 h-6" />
              <h2 className="text-lg font-bold">
                {stepTitle || 'Odaberi region sa testerom'}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Step Indicator */}
          {step && (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                step === 'whole' ? 'bg-white/30' : 'bg-white/10'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 'whole' ? 'bg-white text-teal-600' : 'bg-white/20 text-white/60'
                }`}>
                  1
                </div>
                <span className={`text-sm font-semibold ${
                  step === 'whole' ? 'text-white' : 'text-white/60'
                }`}>
                  Cijeli tester
                </span>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                step === 'ph' ? 'bg-white/30' : 'bg-white/10'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 'ph' ? 'bg-white text-teal-600' : 'bg-white/20 text-white/60'
                }`}>
                  2
                </div>
                <span className={`text-sm font-semibold ${
                  step === 'ph' ? 'text-white' : 'text-white/60'
                }`}>
                  pH region
                </span>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                step === 'chlorine' ? 'bg-white/30' : 'bg-white/10'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 'chlorine' ? 'bg-white text-teal-600' : 'bg-white/20 text-white/60'
                }`}>
                  3
                </div>
                <span className={`text-sm font-semibold ${
                  step === 'chlorine' ? 'text-white' : 'text-white/60'
                }`}>
                  Klor region
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-500 text-white px-4 py-3 text-center">
        <p className="text-sm font-semibold">
          {stepDescription || '✂️ Klikni i povuci da odabereš samo tester (izbaci pozadinu, ruke, sto...)'}
        </p>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          className="max-w-full border-4 border-teal-500 rounded-lg cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Action Buttons */}
      <div className="bg-slate-900 p-4 border-t border-slate-700">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Crop info */}
          {cropStart && cropEnd && (
            <div className="bg-teal-500/20 border border-teal-500 rounded-lg p-3 text-center">
              <p className="text-teal-300 text-sm">
                📐 Odabrano: {Math.abs(cropEnd.x - cropStart.x).toFixed(0)} x {Math.abs(cropEnd.y - cropStart.y).toFixed(0)} px
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Cancel Button */}
            <button
              onClick={onCancel}
              className="bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <X className="w-5 h-5" />
              Odustani
            </button>

            {/* Confirm Button */}
            <button
              onClick={handleCropConfirm}
              disabled={!cropStart || !cropEnd}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <Check className="w-5 h-5" />
              Potvrdi odabir
            </button>
          </div>

          {/* Reset Button */}
          {cropStart && cropEnd && (
            <button
              onClick={() => {
                setCropStart(null);
                setCropEnd(null);
              }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-semibold transition-all"
            >
              🔄 Ponovo odaberi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
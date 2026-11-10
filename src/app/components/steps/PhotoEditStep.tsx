import { useState, useRef, useEffect } from 'react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { ArrowRight, ArrowLeft, Eraser, RotateCcw, Check, X, Crop } from 'lucide-react';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { CropOverlay } from '../CropOverlay';
import { getThemeColors, ProjectType } from '../../utils/theme';

interface PhotoEditStepProps {
  photo: string;
  initialEditedPhoto: string | null;
  onNext: (
    editedPhoto: string,
    needsErase: boolean,
    spaceCropArea?: { x: number; y: number; width: number; height: number },
    canvasSize?: { width: number; height: number },
    spaceCropPoints?: Array<{x: number, y: number}>
  ) => void;
  onBack: () => void;
}

export function PhotoEditStep({ photo, initialEditedPhoto, onNext, onBack }: PhotoEditStepProps) {
  const [needsErase, setNeedsErase] = useState(false);
  const [needsCrop, setNeedsCrop] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [isErasing, setIsErasing] = useState(false);
  const [showCropOverlay, setShowCropOverlay] = useState(false);
  const [spaceCropArea, setSpaceCropArea] = useState<{ x: number; y: number; width: number; height: number } | undefined>(undefined);
  const [spaceCropPoints, setSpaceCropPoints] = useState<Array<{x: number, y: number}> | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  // Always use exterior theme
  const theme = getThemeColors('exterior');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const maxWidth = 1600;
      const maxHeight = 1200;
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio while fitting within max dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      if (initialEditedPhoto) {
        const editedImg = new Image();
        editedImg.onload = () => {
          ctx.drawImage(editedImg, 0, 0, width, height);
          setCanvasReady(true);
        };
        editedImg.src = initialEditedPhoto;
      } else {
        ctx.drawImage(img, 0, 0, width, height);
        setCanvasReady(true);
      }
    };
    img.src = photo;
  }, [photo, initialEditedPhoto]);

  const startErasing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!needsErase) return;
    setIsErasing(true);
    erase(e);
  };

  const erase = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isErasing || !needsErase) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    let clientX: number;
    let clientY: number;
    
    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Scale to canvas coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x * scaleX, y * scaleY, brushSize * scaleX, 0, Math.PI * 2);
    ctx.fill();
  };

  const stopErasing = () => {
    setIsErasing(false);
  };

  const handleApplyCrop = (points: Array<{x: number, y: number}>, cropArea: { x: number; y: number; width: number; height: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save the crop area AND points for later use
    setSpaceCropArea(cropArea);
    setSpaceCropPoints(points);
    console.log('✅ Space crop area saved:', cropArea);
    console.log('✅ Space crop POINTS saved:', points);
    console.log('  Point order: TL, TR, BR, BL');
    console.log('  TL:', points[0]);
    console.log('  TR:', points[1]);
    console.log('  BR:', points[2]);
    console.log('  BL:', points[3]);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Create a new canvas to hold the original image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Copy the current canvas to temp canvas
    tempCtx.drawImage(canvas, 0, 0);

    // Clear the main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create a clipping path for the INVERSE of the polygon (keep everything OUTSIDE)
    ctx.save();
    
    // First, clip to the full canvas
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    
    // Create the polygon path (this will be subtracted)
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    
    // Use evenodd fill rule to create inverse clip (keep outside, remove inside)
    ctx.clip('evenodd');
    
    // Draw the original image with the clipping applied
    ctx.drawImage(tempCanvas, 0, 0);
    
    ctx.restore();

    setShowCropOverlay(false);
    setNeedsCrop(false);
  };

  const handleCancelCrop = () => {
    setShowCropOverlay(false);
    setNeedsCrop(false);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = photo;
  };

  const handleNext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    console.log('=== PHOTO EDIT STEP - SAVING CROP DATA ===');
    console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });
    console.log('Space crop area:', spaceCropArea);
    
    if (spaceCropArea) {
      console.log('🔍 CROP AREA DETAILS:');
      console.log('  Top-Left (x, y):', spaceCropArea.x, spaceCropArea.y);
      console.log('  Bottom-Right:', spaceCropArea.x + spaceCropArea.width, spaceCropArea.y + spaceCropArea.height);
      console.log('  Size (w × h):', spaceCropArea.width, 'x', spaceCropArea.height);
    }

    const editedPhoto = canvas.toDataURL('image/png');
    onNext(editedPhoto, needsErase, spaceCropArea, { width: canvas.width, height: canvas.height }, spaceCropPoints);
  };

  return (
    <div className={`min-h-screen ${theme.bgGradient} flex items-center justify-center p-6 relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 right-1/4 w-96 h-96 ${theme.bgOrb1} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '0.5s' }} />
        <div className={`absolute bottom-1/4 left-1/4 w-96 h-96 ${theme.bgOrb2} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }} />
      </div>

      <GlassCard className="w-full max-w-7xl p-8 md:p-12 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-16 h-16 bg-gradient-to-br ${theme.iconGradient} rounded-2xl flex items-center justify-center shadow-lg ${theme.iconShadow}`}>
            <Eraser className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`}>
              Uredite vašu fotografiju
            </h1>
            <p className="text-white/60 text-sm md:text-base">
              Izrežite ili obrišite područja kako biste očistili prostor za novi objekt
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <Button
              variant={!needsErase && !needsCrop ? 'default' : 'outline'}
              onClick={() => {
                setNeedsErase(false);
                setNeedsCrop(false);
              }}
              className={!needsErase && !needsCrop
                ? `bg-gradient-to-r ${theme.buttonGradient} shadow-lg ${theme.buttonShadow.split(' ')[0]}` 
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }
            >
              <Check className="w-4 h-4 mr-2" />
              Ne, fotografija je spremna
            </Button>
            <Button
              variant={needsCrop ? 'default' : 'outline'}
              onClick={() => {
                setNeedsCrop(true);
                setNeedsErase(false);
              }}
              className={needsCrop
                ? `bg-gradient-to-r ${theme.buttonGradient} shadow-lg ${theme.buttonShadow.split(' ')[0]}` 
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }
            >
              <Crop className="w-4 h-4 mr-2" />
              Obreži fotografiju
            </Button>
            <Button
              variant={needsErase ? 'default' : 'outline'}
              onClick={() => {
                setNeedsErase(true);
                setNeedsCrop(false);
              }}
              className={needsErase
                ? `bg-gradient-to-r ${theme.buttonGradient} shadow-lg ${theme.buttonShadow.split(' ')[0]}` 
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }
            >
              <Eraser className="w-4 h-4 mr-2" />
              Obriši dijelove
            </Button>
          </div>

          {needsCrop && (
            <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowCropOverlay(true)}
                    className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 shadow-lg shadow-amber-500/50"
                  >
                    <Crop className="w-4 h-4 mr-2" />
                    Započni obrezivanje
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUndo}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetiraj
                  </Button>
                </div>
                <p className="text-sm text-white/70">
                  Kliknite "Započni obrezivanje" i povucite kutove za odabir područja
                </p>
              </div>
            </div>
          )}

          {needsErase && (
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-white/90">Veličina četke: {brushSize}px</Label>
                  <Slider
                    value={[brushSize]}
                    onValueChange={(value) => setBrushSize(value[0])}
                    min={5}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUndo}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetiraj
                  </Button>
                </div>
                <p className="text-sm text-white/70">
                  Kliknite i povucite po slici za brisanje neželjenih elemenata
                </p>
              </div>
            </div>
          )}

          <div className="border-2 border-white/10 rounded-2xl overflow-visible bg-black/20 flex items-center justify-center shadow-2xl relative" style={{ minHeight: '70vh', maxHeight: '85vh' }}>
            {/* Grid overlay when in crop mode */}
            {needsCrop && canvasRef.current && !showCropOverlay && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(251, 191, 36, 0.2) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(251, 191, 36, 0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px',
                  zIndex: 1
                }}
              >
                <div className="absolute top-4 left-4 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-lg px-3 py-2">
                  <p className="text-amber-200 text-xs font-semibold">Mreža mjerenja spremna</p>
                </div>
              </div>
            )}
            
            <div className="relative inline-block">
              <canvas
                ref={canvasRef}
                className={`max-w-full max-h-[85vh] object-contain ${needsErase ? 'cursor-crosshair' : 'cursor-default'}`}
                onMouseDown={startErasing}
                onMouseMove={erase}
                onMouseUp={stopErasing}
                onMouseLeave={stopErasing}
                onTouchStart={startErasing}
                onTouchMove={erase}
                onTouchEnd={stopErasing}
                onTouchCancel={stopErasing}
              />
              {/* Crop overlay with free transform - positioned relative to canvas */}
              {showCropOverlay && canvasRef.current && (
                <CropOverlay
                  canvasWidth={canvasRef.current.width}
                  canvasHeight={canvasRef.current.height}
                  onApplyCrop={handleApplyCrop}
                  onCancel={handleCancelCrop}
                  canvasRef={canvasRef}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-10">
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
            disabled={!canvasReady} 
            size="lg"
            className={`min-w-40 bg-gradient-to-r ${theme.buttonGradient} text-white shadow-lg transition-all duration-300 hover:scale-105 ${theme.buttonShadow}`}
          >
            Dalje
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

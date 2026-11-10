import { useState, useRef, useEffect } from 'react';
import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Scissors, Info, Eraser, RotateCcw, ZoomIn, ZoomOut, Save } from 'lucide-react';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { getThemeColors } from '../../utils/theme';

interface ObjectCropStepProps {
  photo: string;
  objectName: string;
  spaceCropArea?: { x: number; y: number; width: number; height: number };
  onNext: (croppedImage: string, cropPoints?: Point[]) => void;
  onBack: () => void;
}

interface Point {
  x: number;
  y: number;
}

export function ObjectCropStep({ photo, objectName, spaceCropArea, onNext, onBack }: ObjectCropStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const refinementCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Always use exterior theme
  const theme = getThemeColors('exterior');

  // Freeze body scroll on mount (mobile touch fix)
  useEffect(() => {
    // Save original overflow style
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    const originalPosition = document.body.style.position;
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = photo;
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas size to fit the image with aspect ratio
      // MOBILE RESPONSIVE: Use viewport dimensions
      const isMobile = window.innerWidth < 768;
      const maxWidth = isMobile ? window.innerWidth - 48 : 800; // 48px = 2×24px padding
      const maxHeight = isMobile ? window.innerHeight * 0.25 : 600; // 25% of viewport height on mobile (reduced for sticky footer)
      
      let width = img.width;
      let height = img.height;

      const scale = Math.min(maxWidth / width, maxHeight / height, 1);
      width = width * scale;
      height = height * scale;

      canvas.width = width;
      canvas.height = height;

      // Initialize default crop points - centered and tighter to fit objects better
      // All points precisely aligned for perfect rectangles
      // MOBILE SAFE: Moved away from edges to prevent accidental back swipe
      const margin = 40; // Reduced margin since canvas is smaller now
      const topY = Math.max(margin, height * 0.25);
      const bottomY = Math.min(height - margin, height * 0.75);
      const leftX = Math.max(margin, width * 0.25);
      const rightX = Math.min(width - margin, width * 0.75);
      
      const defaultPoints = [
        { x: leftX, y: topY },      // Top-left
        { x: rightX, y: topY },     // Top-right
        { x: rightX, y: bottomY },  // Bottom-right
        { x: leftX, y: bottomY },   // Bottom-left
      ];
      setPoints(defaultPoints);
      setImageLoaded(true);
    };
  }, [photo]);

  useEffect(() => {
    if (imageLoaded && imgRef.current) {
      drawCanvas();
    }
  }, [points, imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imgRef.current) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    if (points.length === 4) {
      // Draw semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear the area inside the crop polygon
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.fill();

      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';

      // Draw crop boundary lines
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Draw corner points
      points.forEach((point, index) => {
        // Larger corner points for better visibility on mobile
        const cornerSize = 15; // Increased from 10px
        
        ctx.fillStyle = '#F59E0B'; // Golden color to match theme
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4; // Thicker border
        ctx.beginPath();
        ctx.arc(point.x, point.y, cornerSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw corner labels
        ctx.fillStyle = '#000000'; // Black text on gold
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((index + 1).toString(), point.x, point.y);
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find if clicking near a point
    const threshold = 15;
    const index = points.findIndex(
      (p) => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < threshold
    );

    if (index !== -1) {
      setDraggingIndex(index);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Find if touching near a point - larger threshold for touch
    const threshold = 30; // Larger for touch
    const index = points.findIndex(
      (p) => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < threshold
    );

    if (index !== -1) {
      setDraggingIndex(index);
      e.preventDefault(); // Prevent scrolling
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // Apply safe zone margin - prevent corners from getting too close to edges
    const safeMargin = 20; // Minimum 20px from edge
    const x = Math.max(safeMargin, Math.min(canvas.width - safeMargin, e.clientX - rect.left));
    const y = Math.max(safeMargin, Math.min(canvas.height - safeMargin, e.clientY - rect.top));

    const newPoints = [...points];
    newPoints[draggingIndex] = { x, y };
    setPoints(newPoints);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (draggingIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    
    // Apply safe zone margin - prevent corners from getting too close to edges
    const safeMargin = 20; // Minimum 20px from edge
    const x = Math.max(safeMargin, Math.min(canvas.width - safeMargin, touch.clientX - rect.left));
    const y = Math.max(safeMargin, Math.min(canvas.height - safeMargin, touch.clientY - rect.top));

    const newPoints = [...points];
    newPoints[draggingIndex] = { x, y };
    setPoints(newPoints);
    e.preventDefault(); // Prevent scrolling
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  const handleTouchEnd = () => {
    setDraggingIndex(null);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current || points.length !== 4) return;

    // Create a new canvas for the cropped image - FULL SIZE, not bounding box
    const outputCanvas = document.createElement('canvas');
    const ctx = outputCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Use the FULL original image dimensions
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;

    // IMPORTANT: Clear with transparency first
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Draw the full image
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    // Get image data and create transparency mask
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Create path for checking if pixel is inside polygon
    const isPointInPolygon = (x: number, y: number, polygon: Point[]): boolean => {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const xj = polygon[j].x;
        const yj = polygon[j].y;

        const intersect =
          yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    // Apply transparency to pixels OUTSIDE the polygon (keep only the object inside)
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        if (!isPointInPolygon(x, y, points)) {
          data[index + 3] = 0; // Set alpha to 0 (transparent) for pixels OUTSIDE the selection
        }
      }
    }

    // Put the modified image data back
    ctx.putImageData(imageData, 0, 0);

    // Get the data URL with transparency - MUST be PNG to preserve alpha channel
    const croppedImageUrl = outputCanvas.toDataURL('image/png');
    
    // Debug: Log to verify transparency
    console.log('Cropped image created:', {
      format: 'image/png',
      size: croppedImageUrl.length,
      hasAlpha: croppedImageUrl.startsWith('data:image/png'),
      imageSize: { width: canvas.width, height: canvas.height }
    });
    
    // Pass the ORIGINAL polygon points (not normalized) since the image is FULL SIZE
    console.log('🔧 PASSING POLYGON POINTS:');
    console.log('  Points:', points);
    console.log('  Image size:', { width: canvas.width, height: canvas.height });
    
    onNext(croppedImageUrl, points); // Pass original points - image is full size!
  };

  const handleSkip = () => {
    // Just pass the original image without cropping
    onNext(photo);
  };

  const handlePreview = () => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas || !imgRef.current || points.length !== 4) return;

    // Calculate bounding box
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const width = maxX - minX;
    const height = maxY - minY;

    previewCanvas.width = width;
    previewCanvas.height = height;

    // Adjust points relative to bounding box
    const adjustedPoints = points.map((p) => ({
      x: p.x - minX,
      y: p.y - minY,
    }));

    // Draw the full image first
    const scaleX = width / canvas.width;
    const scaleY = height / canvas.height;
    
    const ctx = previewCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      (minX / canvas.width) * imgRef.current.width,
      (minY / canvas.height) * imgRef.current.height,
      (width / canvas.width) * imgRef.current.width,
      (height / canvas.height) * imgRef.current.height,
      0,
      0,
      width,
      height
    );

    // Get image data and create transparency mask
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Create path for checking if pixel is inside polygon
    const isPointInPolygon = (x: number, y: number, polygon: Point[]): boolean => {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const xj = polygon[j].x;
        const yj = polygon[j].y;

        const intersect =
          yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    // Apply transparency to pixels outside the polygon
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        if (!isPointInPolygon(x, y, adjustedPoints)) {
          data[index + 3] = 0; // Set alpha to 0 (transparent) for pixels OUTSIDE the selection
        }
      }
    }

    // Put the modified image data back
    ctx.putImageData(imageData, 0, 0);

    // Show preview
    setShowPreview(true);
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to fit the image
    const maxWidth = 800;
    const maxHeight = 600;
    let width = imgRef.current?.width || 0;
    let height = imgRef.current?.height || 0;

    const scale = Math.min(maxWidth / width, maxHeight / height, 1);
    width = width * scale;
    height = height * scale;

    canvas.width = width;
    canvas.height = height;

    // Initialize default crop points (full image)
    const defaultPoints = [
      { x: width * 0.1, y: height * 0.1 },     // Top-left
      { x: width * 0.9, y: height * 0.1 },     // Top-right
      { x: width * 0.9, y: height * 0.9 },     // Bottom-right
      { x: width * 0.1, y: height * 0.9 },     // Bottom-left
    ];
    setPoints(defaultPoints);
    setImageLoaded(true);
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation((prevRotation) => prevRotation + 90);
  };

  const handleSaveObject = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current || points.length !== 4) {
      toast.error('Prvo označite područje objekta!');
      return;
    }

    // Create full-size cropped image with transparency
    const outputCanvas = document.createElement('canvas');
    const ctx = outputCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const isPointInPolygon = (x: number, y: number, polygon: Point[]): boolean => {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const xj = polygon[j].x;
        const yj = polygon[j].y;
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        if (!isPointInPolygon(x, y, points)) {
          data[index + 3] = 0;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const croppedImageUrl = outputCanvas.toDataURL('image/png');

    // Save to localStorage
    try {
      const savedObjects = JSON.parse(localStorage.getItem('mondoAcquaSavedObjects') || '[]');
      const newObject = {
        id: Date.now(),
        name: objectName,
        imageUrl: croppedImageUrl,
        timestamp: new Date().toISOString()
      };
      savedObjects.push(newObject);
      localStorage.setItem('mondoAcquaSavedObjects', JSON.stringify(savedObjects));
      toast.success(`Objekt "${objectName}" spremljen! Možete ga učitati kasnije.`);
    } catch (error) {
      console.error('Error saving object:', error);
      toast.error('Greška pri spremanju objekta. Pokušajte ponovno.');
    }
  };

  return (
    <div className={`h-screen overflow-y-auto ${theme.bgGradient} flex flex-col relative`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/3 left-1/3 w-96 h-96 ${theme.bgOrb1} rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute bottom-1/3 right-1/3 w-96 h-96 ${theme.bgOrb2} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-32 md:pb-6">
        <div className="w-full max-w-6xl mx-auto relative z-10 p-3 md:p-6">
          <GlassCard className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${theme.iconGradient} rounded-2xl flex items-center justify-center shadow-lg ${theme.iconShadow}`}>
                <Scissors className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-xl md:text-3xl font-bold bg-gradient-to-r ${theme.textGradient} bg-clip-text text-transparent`}>
                  Izrežite objekt: {objectName}
                </h1>
                <p className="text-white/60 text-xs md:text-sm">
                  Povucite kutove za označavanje
                </p>
              </div>
            </div>

            {spaceCropArea && (
              <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-3 mb-4">
                <p className="text-green-400 text-xs font-semibold">
                  ✓ Bucket Fill Mode - Objekt će popuniti prostor {spaceCropArea.width.toFixed(0)}×{spaceCropArea.height.toFixed(0)}px
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <div className="relative inline-block max-w-full">
                <canvas
                  ref={canvasRef}
                  className="rounded-xl shadow-2xl border-2 border-white/10 cursor-crosshair max-w-full h-auto"
                  style={{ touchAction: 'none' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              </div>
            </div>

            {showPreview && (
              <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-3">Pregled:</h3>
                <div className="flex justify-center">
                  <div
                    className="relative inline-block rounded-xl overflow-hidden shadow-xl"
                    style={{
                      background: `
                        repeating-conic-gradient(#808080 0% 25%, #404040 0% 50%) 
                        50% / 20px 20px
                      `,
                    }}
                  >
                    <canvas
                      ref={previewCanvasRef}
                      className="block max-w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Fixed footer with action buttons - MOBILE STICKY */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto md:left-auto md:right-auto">
        <div className="w-full bg-gradient-to-t from-slate-900 via-slate-900/95 to-slate-900/80 backdrop-blur-xl border-t border-white/10 md:bg-transparent md:backdrop-blur-none md:border-t-0">
          <div className="max-w-6xl mx-auto p-3">
            <div className="flex flex-col gap-2">
              {/* Back button - subtle on mobile */}
              <Button
                variant="outline"
                onClick={onBack}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 min-h-[44px] text-sm md:hidden"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Natrag
              </Button>

              {/* Main action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 min-h-[48px] text-sm"
                >
                  Preskoči
                </Button>
                <Button
                  onClick={handleCrop}
                  disabled={points.length !== 4}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] font-bold text-sm"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Završi
                </Button>
              </div>

              {/* Save button - secondary action */}
              <Button
                onClick={handleSaveObject}
                disabled={points.length !== 4}
                className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-lg shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] text-sm"
              >
                <Save className="w-5 h-5 mr-2" />
                Spremi objekt za kasnije
              </Button>

              {/* Desktop back button */}
              <Button
                variant="outline"
                onClick={onBack}
                className="hidden md:block bg-white/5 border-white/10 text-white hover:bg-white/10 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Natrag
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

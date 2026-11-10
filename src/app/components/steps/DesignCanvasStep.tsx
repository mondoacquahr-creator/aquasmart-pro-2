import { GlassCard } from '../GlassCard';
import { Button } from '../ui/button';
import { DesignObject, RoomDimensions, Line } from '../../types';
import { ArrowLeft, Save, Info, RotateCw, Trash2, Move, Plus, Ruler, Scan, CheckCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { ObjectTransformOverlay } from '../ObjectTransformOverlay';
import { toast } from 'sonner@2.0.3';

interface ScaledObject extends DesignObject {
  displayWidth: number;
  displayHeight: number;
}

// Simple static object - no dragging or resizing
interface StaticObjectProps {
  object: ScaledObject;
  canvasElement: HTMLDivElement; // Pass canvas element to calculate scale
  spaceCropCanvasSize?: { width: number; height: number }; // Original canvas size from PhotoEditStep
  onSelect?: (id: string) => void; // ADD: onClick handler
  onMove?: (id: string, x: number, y: number) => void; // ADD: onMove handler
  isSelected?: boolean; // ADD: Is this object selected?
}

function StaticObject({ object, canvasElement, spaceCropCanvasSize, onSelect, onMove, isSelected }: StaticObjectProps) {
  console.log('=== RENDERING STATIC OBJECT ===');
  console.log('Object ID:', object.id);
  console.log('Object name:', object.name);
  console.log('Position (canvas px):', object.position);
  console.log('Display size (canvas px):', { width: object.displayWidth, height: object.displayHeight });
  console.log('Canvas element exists:', !!canvasElement);
  console.log('spaceCropCanvasSize:', spaceCropCanvasSize);
  console.log('Image URL (first 100 chars):', object.imageUrl.substring(0, 100));
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Safety check
  if (!canvasElement) {
    console.error('❌ Canvas element not ready!');
    return null;
  }

  // COORDINATE SCALING: Transform from canvas pixel space to display space
  const canvasRect = canvasElement.getBoundingClientRect();
  
  console.log('Canvas getBoundingClientRect:', canvasRect);
  
  // If we have the original canvas size, use it for scaling
  const canvasPixelWidth = spaceCropCanvasSize?.width || 800;
  const canvasPixelHeight = spaceCropCanvasSize?.height || 600;
  
  // Simple direct scaling - NO OFFSET
  const scaleX = canvasRect.width / canvasPixelWidth;
  const scaleY = canvasRect.height / canvasPixelHeight;
  
  // Apply scaling ONLY (no offset for now - debugging)
  const displayX = object.position.x * scaleX;
  const displayY = object.position.y * scaleY;
  const displayWidth = object.displayWidth * scaleX;
  const displayHeight = object.displayHeight * scaleY;
  
  console.log('🎯 FINAL POSITIONING (NO OFFSET - DEBUGGING):');
  console.log('  Canvas pixel size:', { width: canvasPixelWidth, height: canvasPixelHeight });
  console.log('  Canvas display size (getBoundingClientRect):', { width: canvasRect.width, height: canvasRect.height });
  console.log('  Scaling factors:', { scaleX, scaleY });
  console.log('  Object position (canvas px):', object.position);
  console.log('  Object displayWidth/Height (canvas px):', { width: object.displayWidth, height: object.displayHeight });
  console.log('  FINAL position (display px):', { x: displayX, y: displayY });
  console.log('  FINAL size (display px):', { width: displayWidth, height: displayHeight });

  return (
    <div
      style={{
        position: 'absolute',
        left: `${displayX}px`,
        top: `${displayY}px`,
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        pointerEvents: 'auto', // ENABLE clicks
        border: isSelected ? '3px solid cyan' : '2px solid rgba(255, 255, 255, 0.3)', // Selected: cyan, unselected: subtle white
        boxSizing: 'border-box',
        backgroundColor: 'transparent', // NO debug background
        zIndex: 100, // Ensure it's on top
        cursor: 'pointer', // Show it's clickable
      }}
      onClick={(e) => {
        e.stopPropagation(); // Prevent canvas deselect
        onSelect && onSelect(object.id);
      }}
      onPointerDown={(e) => {
        if (isSelected) {
          const rect = canvasElement.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setDragOffset({ x: x - object.position.x * scaleX, y: y - object.position.y * scaleY });
          setIsDragging(true);
        }
      }}
      onPointerMove={(e) => {
        if (isDragging && onMove) {
          const rect = canvasElement.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          onMove(object.id, (x - dragOffset.x) / scaleX, (y - dragOffset.y) / scaleY);
        }
      }}
      onPointerUp={() => {
        setIsDragging(false);
      }}
    >
      {object.imageUrl && (
        <img
          src={object.imageUrl}
          alt={object.name}
          crossOrigin="anonymous"
          onLoad={() => console.log(`✅ Image loaded for ${object.name}`)}
          onError={(e) => console.error(`❌ Image failed to load for ${object.name}:`, e)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'fill', // FILL the space exactly, no aspect ratio preservation
            display: 'block',
          }}
        />
      )}
      {/* DEBUG: Label */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        background: 'lime',
        color: 'black',
        padding: '2px 6px',
        fontSize: '10px',
        fontWeight: 'bold',
      }}>
        {object.name}
      </div>
      {/* DEBUG: Corner markers */}
      <div style={{ position: 'absolute', top: '-6px', left: '-6px', width: '12px', height: '12px', background: 'red', borderRadius: '50%', border: '2px solid white' }} />
      <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '12px', height: '12px', background: 'yellow', borderRadius: '50%', border: '2px solid white' }} />
      <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '12px', height: '12px', background: 'blue', borderRadius: '50%', border: '2px solid white' }} />
      <div style={{ position: 'absolute', bottom: '-6px', left: '-6px', width: '12px', height: '12px', background: 'cyan', borderRadius: '50%', border: '2px solid white' }} />
    </div>
  );
}

interface DesignCanvasStepProps {
  photo: string;
  roomDimensions: RoomDimensions;
  boundaryLines: Line[];
  objects: DesignObject[];
  projectType?: 'interior' | 'exterior';
  spaceCropCanvasSize?: { width: number; height: number }; // Canvas dimensions from PhotoEditStep
  spaceCropPolygonPoints?: Array<{x: number, y: number}>; // ADD: Original polygon points
  onUpdateObjects: (objects: DesignObject[]) => void;
  onBack: () => void;
  onAddAnother: () => void;
  onFinish?: (compositeImageUrl: string) => void; // ADD: Finish callback with composite image
}

export function DesignCanvasStep({
  photo,
  roomDimensions,
  boundaryLines = [],
  objects,
  projectType = 'interior',
  spaceCropCanvasSize,
  spaceCropPolygonPoints,
  onUpdateObjects,
  onBack,
  onAddAnother,
  onFinish,
}: DesignCanvasStepProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [perspectiveTransformMode, setPerspectiveTransformMode] = useState(false);
  const [widthScale, setWidthScale] = useState<number>(100); // Width scale percentage (50-200%)

  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    }
  }, []);

  // Auto-select the most recently added object
  useEffect(() => {
    if (objects.length > 0 && !selectedObjectId) {
      const mostRecentObject = objects[objects.length - 1];
      console.log('Auto-selecting most recent object:', mostRecentObject.id);
      setSelectedObjectId(mostRecentObject.id);
    }
  }, [objects.length]);

  useEffect(() => {
    console.log('DesignCanvasStep rendered with:', {
      objectCount: objects.length,
      objects: objects.map(o => ({ id: o.id, name: o.name, position: o.position, displayWidth: o.displayWidth, displayHeight: o.displayHeight })),
      selectedObjectId,
      canvasSize
    });
  }, [objects, selectedObjectId, canvasSize]);

  // Calculate pixels per unit (assuming canvas width represents room width)
  const canvasWidth = canvasSize.width || 800;
  const pixelsPerUnit = canvasWidth / roomDimensions.width;

  // Initialize displayWidth/displayHeight if not set
  const scaledObjects: ScaledObject[] = objects.map((obj) => {
    // If displayWidth/displayHeight are already set, use them; otherwise start with a good visual size
    // Default to 250px width, maintaining aspect ratio from dimensions
    const aspectRatio = obj.dimensions.width / obj.dimensions.height;
    const defaultWidth = 250; // Start at a reasonable visual size
    const defaultHeight = defaultWidth / aspectRatio;
    
    const displayWidth = obj.displayWidth !== undefined 
      ? obj.displayWidth 
      : defaultWidth;
    const displayHeight = obj.displayHeight !== undefined 
      ? obj.displayHeight 
      : defaultHeight;
    
    return {
      ...obj,
      displayWidth,
      displayHeight,
    };
  });

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

  // Sync width scale with selected object
  useEffect(() => {
    if (selectedObject) {
      // Calculate current scale percentage based on object's displayWidth
      const scaledObj = scaledObjects.find(obj => obj.id === selectedObject.id);
      if (scaledObj) {
        const aspectRatio = selectedObject.dimensions.width / selectedObject.dimensions.height;
        const defaultWidth = 250;
        const currentScale = (scaledObj.displayWidth / defaultWidth) * 100;
        setWidthScale(currentScale);
      }
    }
  }, [selectedObjectId, selectedObject]);

  // Handle width scale change
  const handleWidthScaleChange = (scale: number) => {
    if (!selectedObject) return;
    
    setWidthScale(scale);
    
    // Calculate new width based on scale percentage
    const aspectRatio = selectedObject.dimensions.width / selectedObject.dimensions.height;
    const defaultWidth = 250;
    const newWidth = (defaultWidth * scale) / 100;
    const newHeight = newWidth / aspectRatio;
    
    handleResize(selectedObject.id, newWidth, newHeight);
  };

  const handleMove = (id: string, x: number, y: number) => {
    const updated = objects.map((obj) =>
      obj.id === id ? { ...obj, position: { x, y } } : obj
    );
    onUpdateObjects(updated);
  };

  const handleResize = (id: string, newDisplayWidth: number, newDisplayHeight: number) => {
    console.log('handleResize called:', { id, newDisplayWidth, newDisplayHeight });
    
    // Store the display sizes directly so they persist
    const updated = objects.map((obj) =>
      obj.id === id
        ? {
            ...obj,
            displayWidth: newDisplayWidth,
            displayHeight: newDisplayHeight,
          }
        : obj
    );
    onUpdateObjects(updated);
  };

  const handleRotate = (id: string, rotation: number) => {
    const updated = objects.map((obj) =>
      obj.id === id ? { ...obj, rotation } : obj
    );
    onUpdateObjects(updated);
  };

  const handleRemove = (id: string) => {
    onUpdateObjects(objects.filter((obj) => obj.id !== id));
  };

  const handleApplyPerspectiveTransform = async (points: Array<{x: number, y: number}>) => {
    if (!selectedObject) return;

    console.log('Applying perspective transform with points:', points);

    // Apply perspective transform to the selected object
    const transformedImageUrl = await applyPerspectiveToImage(
      selectedObject.imageUrl,
      points,
      scaledObjects.find(obj => obj.id === selectedObjectId)!.displayWidth,
      scaledObjects.find(obj => obj.id === selectedObjectId)!.displayHeight
    );

    console.log('Transformed image URL created:', transformedImageUrl ? 'Success' : 'Failed');

    const updated = objects.map((obj) =>
      obj.id === selectedObjectId
        ? {
            ...obj,
            perspectivePoints: points,
            transformedImageUrl: transformedImageUrl || obj.imageUrl,
          }
        : obj
    );

    onUpdateObjects(updated);
    setPerspectiveTransformMode(false);
  };

  const applyPerspectiveToImage = (
    imageUrl: string,
    points: Array<{x: number, y: number}>,
    width: number,
    height: number
  ): Promise<string | null> => {
    return new Promise<string | null>((resolve) => {
      // Create a canvas to draw the transformed image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        resolve(null);
        return;
      }

      console.log('Creating perspective transform canvas with points:', points);

      // Calculate bounding box
      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      const minY = Math.min(...points.map(p => p.y));
      const maxY = Math.max(...points.map(p => p.y));

      canvas.width = maxX - minX;
      canvas.height = maxY - minY;

      console.log('Canvas size:', canvas.width, 'x', canvas.height);

      // Load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('Image loaded for perspective transform');
        
        // Adjust points relative to bounding box
        const adjustedPoints = points.map(p => ({
          x: p.x - minX,
          y: p.y - minY
        }));

        console.log('Adjusted points:', adjustedPoints);

        // Create clipping path
        ctx.beginPath();
        ctx.moveTo(adjustedPoints[0].x, adjustedPoints[0].y);
        for (let i = 1; i < adjustedPoints.length; i++) {
          ctx.lineTo(adjustedPoints[i].x, adjustedPoints[i].y);
        }
        ctx.closePath();
        ctx.clip();

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        console.log('Generated transformed image data URL');
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        console.error('Failed to load image for perspective transform');
        resolve(null);
      };
      
      img.src = imageUrl;
    });
  };

  const selectedScaledObject = scaledObjects.find(obj => obj.id === selectedObjectId);

  // Capture the canvas as a composite image
  const handleFinish = async () => {
    console.log('🎯 FINISH BUTTON CLICKED!');;
    console.log('canvasRef.current:', canvasRef.current);
    console.log('onFinish exists:', !!onFinish);
    
    if (!canvasRef.current || !onFinish) {
      console.error('❌ Cannot finish - missing canvasRef or onFinish callback');
      toast.error('Greška - ne mogu spremiti projekt');
      return;
    }

    try {
      toast.loading('Generiranje finalne vizualizacije...');
      console.log('📸 Starting MANUAL canvas capture (no html2canvas)...');
      
      // NOVI PRISTUP: Manual Canvas API rendering (NO html2canvas!)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Set canvas size based on original space photo dimensions
      const canvasPixelWidth = spaceCropCanvasSize?.width || 800;
      const canvasPixelHeight = spaceCropCanvasSize?.height || 600;
      
      canvas.width = canvasPixelWidth;
      canvas.height = canvasPixelHeight;
      
      console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });
      
      // Fill background black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw background photo
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => {
          console.log('✅ Background image loaded');
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        bgImg.onerror = () => reject(new Error('Failed to load background image'));
        bgImg.src = photo;
      });
      
      // Draw each object
      console.log(`📦 Drawing ${objects.length} objects...`);
      for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        console.log(`\n🎨 Drawing object ${i + 1}/${objects.length}: ${obj.name}`);
        console.log('  Position:', obj.position);
        console.log('  Display size:', { width: obj.displayWidth, height: obj.displayHeight });
        console.log('  Rotation:', obj.rotation);
        console.log('  Image URL length:', obj.imageUrl.length);
        
        const objImg = new Image();
        objImg.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve, reject) => {
          objImg.onload = () => {
            console.log(`  ✅ Object image loaded: ${obj.name}`);
            console.log(`     Image natural size: ${objImg.width}x${objImg.height}`);
            
            // Check if this is a full-canvas object (perspective/bucket fill mode)
            // Full canvas objects have position (0,0) and size matching canvas
            const isFullCanvasObject = (
              obj.position.x === 0 && 
              obj.position.y === 0 && 
              obj.displayWidth === canvasPixelWidth && 
              obj.displayHeight === canvasPixelHeight
            );
            
            console.log(`     Is full-canvas object: ${isFullCanvasObject}`);
            
            if (isFullCanvasObject) {
              // Full-canvas mode: image is already transformed and positioned
              // Just draw it directly at (0, 0) covering entire canvas
              console.log(`     Drawing FULL CANVAS object directly`);
              ctx.drawImage(objImg, 0, 0, canvasPixelWidth, canvasPixelHeight);
            } else {
              // Regular object: apply transformations
              console.log(`     Drawing REGULAR object with transformations`);
              
              // Save context state
              ctx.save();
              
              // Apply rotation if needed
              if (obj.rotation && obj.rotation !== 0) {
                const centerX = obj.position.x + obj.displayWidth / 2;
                const centerY = obj.position.y + obj.displayHeight / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate((obj.rotation * Math.PI) / 180);
                ctx.translate(-centerX, -centerY);
                console.log(`     Applied rotation: ${obj.rotation}°`);
              }
              
              // Draw the object image
              console.log(`     Drawing at: x=${obj.position.x}, y=${obj.position.y}, w=${obj.displayWidth}, h=${obj.displayHeight}`);
              ctx.drawImage(
                objImg,
                obj.position.x,
                obj.position.y,
                obj.displayWidth,
                obj.displayHeight
              );
              
              // Restore context state
              ctx.restore();
            }
            
            console.log(`  ✅ Object drawn successfully`);
            resolve();
          };
          objImg.onerror = (e) => {
            console.error(`❌ Failed to load object image: ${obj.name}`, e);
            resolve(); // Continue even if one object fails
          };
          objImg.src = obj.imageUrl;
        });
      }
      
      console.log('✅ All objects rendered successfully');
      
      const compositeImageUrl = canvas.toDataURL('image/png');
      console.log('✅ Composite image created:', compositeImageUrl.substring(0, 50) + '...');
      console.log('   Image data length:', compositeImageUrl.length);
      
      toast.dismiss();
      toast.success('Vizualizacija spremna!');
      
      onFinish(compositeImageUrl);
      console.log('✅ onFinish called successfully!');
    } catch (error) {
      console.error('❌ Failed to capture canvas:', error);
      console.error('   Error details:', error);
      toast.dismiss();
      toast.error('Greška pri generiranju vizualizacije: ' + (error instanceof Error ? error.message : 'Nepoznata greška'));
    }
  };

  // Dynamic colors based on project type
  const bgGradient = projectType === 'exterior'
    ? 'from-sky-950 via-blue-950 to-indigo-950'
    : 'from-slate-950 via-indigo-950 to-purple-950';
  
  const accentColor = projectType === 'exterior' ? 'blue' : 'indigo';
  const secondaryColor = projectType === 'exterior' ? 'sky' : 'purple';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-3 md:p-6 relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-${accentColor}-500/20 rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-${secondaryColor}-500/20 rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <GlassCard className="p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent mb-1">
                Dizajnirajte Vaš Prostor
              </h1>
              <p className="text-white/60 text-sm md:text-base">
                Povucite, promijenite veličinu i transformirajte objekte na željenu poziciju
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onFinish && objects.length > 0 && (
                <Button 
                  onClick={handleFinish}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/50 text-lg px-6"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Završi
                </Button>
              )}
              {onAddAnother && (
                <Button 
                  onClick={onAddAnother}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj još jedan objekt
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={onBack}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Natrag
              </Button>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white">Room Info</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-white/60">Width:</span>
                  <span className="font-semibold text-white">
                    {roomDimensions.width} cm
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-white/60">Height:</span>
                  <span className="font-semibold text-white">
                    {roomDimensions.height} cm
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-white/60">Depth:</span>
                  <span className="font-semibold text-white">
                    {roomDimensions.depth} cm
                  </span>
                </div>
              </div>
            </GlassCard>

            {objects.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="font-semibold text-white mb-4">Placed Objects ({objects.length})</h3>
                <div className="space-y-2">
                  {objects.map((obj) => (
                    <div
                      key={obj.id}
                      className="bg-gradient-to-r from-white/5 to-white/10 p-3 rounded-xl text-sm border border-white/10"
                    >
                      <div className="font-medium text-white">{obj.name}</div>
                      <div className="text-xs text-white/60 mt-1">
                        {obj.dimensions.width.toFixed(1)} × {obj.dimensions.height.toFixed(1)} ×{' '}
                        {obj.dimensions.depth.toFixed(1)} cm
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            <GlassCard className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-white/90">
                  <p className="font-medium mb-2">Tips:</p>
                  <ul className="space-y-1.5 text-xs text-white/70">
                    <li>• Drag objects to position</li>
                    <li>• Resize from corners</li>
                    <li>• Dimensions scale accurately</li>
                    <li> Hover to see details</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-3">
            <GlassCard className="p-6">
              {/* Canvas container - Responsive, scales based on screen size */}
              <div className="relative w-full flex justify-center">
                <div
                  ref={canvasRef}
                  data-canvas-container
                  className="relative bg-black/30 rounded-2xl border border-white/10 w-full max-w-4xl"
                  style={{
                    aspectRatio: (spaceCropCanvasSize?.width || 800) / (spaceCropCanvasSize?.height || 600),
                  }}
                  onClick={() => setSelectedObjectId(null)}
                >
                  {/* Background image as actual img element for html2canvas compatibility */}
                  <img
                    src={photo}
                    alt="Background"
                    crossOrigin="anonymous"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                      zIndex: 0,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Boundary Lines SVG Overlay */}
                  {boundaryLines.length > 0 && (
                    <svg
                      ref={svgRef}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ zIndex: 5 }}
                    >
                      {boundaryLines.map((line) => (
                        <g key={line.id}>
                          <line
                            x1={line.x1}
                            y1={line.y1}
                            x2={line.x2}
                            y2={line.y2}
                            stroke="#6366f1"
                            strokeWidth="3"
                            strokeLinecap="round"
                            filter="drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))"
                          />
                          <circle
                            cx={line.x1}
                            cy={line.y1}
                            r="5"
                            fill="#6366f1"
                            filter="drop-shadow(0 0 6px rgba(99, 102, 241, 0.8))"
                          />
                          <circle
                            cx={line.x2}
                            cy={line.y2}
                            r="5"
                            fill="#6366f1"
                            filter="drop-shadow(0 0 6px rgba(99, 102, 241, 0.8))"
                          />
                        </g>
                      ))}
                    </svg>
                  )}
                  
                  {/* DEBUG: Space Crop Polygon Overlay */}
                  {spaceCropPolygonPoints && spaceCropPolygonPoints.length === 4 && canvasRef.current && (() => {
                    const canvasRect = canvasRef.current.getBoundingClientRect();
                    const canvasPixelWidth = spaceCropCanvasSize?.width || 800;
                    const canvasPixelHeight = spaceCropCanvasSize?.height || 600;
                    const scaleX = canvasRect.width / canvasPixelWidth;
                    const scaleY = canvasRect.height / canvasPixelHeight;
                    
                    // Scale the points to display coordinates
                    const scaledPoints = spaceCropPolygonPoints.map(p => ({
                      x: p.x * scaleX,
                      y: p.y * scaleY
                    }));
                    
                    console.log('🔵 Drawing polygon overlay:', {
                      originalPoints: spaceCropPolygonPoints,
                      scaledPoints,
                      scaleFactors: { scaleX, scaleY }
                    });
                    
                    return (
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{ zIndex: 999 }}
                      >
                        {/* The polygon fill */}
                        <polygon
                          points={scaledPoints.map(p => `${p.x},${p.y}`).join(' ')}
                          fill="rgba(0, 255, 255, 0.1)"
                          stroke="cyan"
                          strokeWidth="3"
                          strokeDasharray="10 5"
                        />
                        {/* Corner dots */}
                        {scaledPoints.map((p, i) => (
                          <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="8"
                            fill="cyan"
                            stroke="white"
                            strokeWidth="2"
                          />
                        ))}
                        {/* Labels */}
                        <text x={scaledPoints[0].x} y={scaledPoints[0].y - 15} fill="cyan" fontSize="12" fontWeight="bold">TL</text>
                        <text x={scaledPoints[1].x} y={scaledPoints[1].y - 15} fill="yellow" fontSize="12" fontWeight="bold">TR</text>
                        <text x={scaledPoints[2].x} y={scaledPoints[2].y + 25} fill="blue" fontSize="12" fontWeight="bold">BR</text>
                        <text x={scaledPoints[3].x} y={scaledPoints[3].y + 25} fill="magenta" fontSize="12" fontWeight="bold">BL</text>
                      </svg>
                    );
                  })()}
                  
                  {/* No objects message */}
                  {scaledObjects.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
                        <Plus className="w-16 h-16 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60 text-lg">
                          Nema dodanih objekata
                        </p>
                        <p className="text-white/40 text-sm mt-2">
                          Kliknite "Dodaj još jedan objekt" za početak
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Objects rendered inside canvas at exact positions */}
                  {canvasRef.current && scaledObjects.map((obj) => (
                    <StaticObject
                      key={obj.id}
                      object={obj}
                      canvasElement={canvasRef.current!}
                      spaceCropCanvasSize={spaceCropCanvasSize}
                      onSelect={setSelectedObjectId}
                      onMove={handleMove}
                      isSelected={selectedObjectId === obj.id}
                    />
                  ))}

                  {/* Perspective Transform Overlay */}
                  {perspectiveTransformMode && selectedScaledObject && (
                    <ObjectTransformOverlay
                      objectPosition={selectedScaledObject.position}
                      objectWidth={selectedScaledObject.displayWidth}
                      objectHeight={selectedScaledObject.displayHeight}
                      objectRotation={selectedScaledObject.rotation}
                      onApplyTransform={handleApplyPerspectiveTransform}
                      onCancel={() => setPerspectiveTransformMode(false)}
                    />
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Fixed Control Panel */}
            <GlassCard className="p-6 mt-4">
              {selectedObject ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedObject.name}</h3>
                      <p className="text-sm text-white/60 mt-1">
                        {selectedObject.dimensions.width.toFixed(1)} × {selectedObject.dimensions.height.toFixed(1)} × {selectedObject.dimensions.depth.toFixed(1)} cm
                      </p>
                    </div>
                    <div className="text-sm text-white/70">
                      Rotation: <span className="font-semibold text-white">{selectedObject.rotation}°</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => setPerspectiveTransformMode(true)}
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white shadow-lg shadow-yellow-500/50"
                    >
                      <Scan className="w-4 h-4 mr-2" />
                      Perspektivna transformacija
                    </Button>

                    <Button
                      onClick={() => handleRotate(selectedObject.id, (selectedObject.rotation + 90) % 360)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/50"
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Rotate 90°
                    </Button>
                    
                    <Button
                      onClick={() => handleRotate(selectedObject.id, (selectedObject.rotation - 90 + 360) % 360)}
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      <RotateCw className="w-4 h-4 mr-2 scale-x-[-1]" />
                      Rotate -90°
                    </Button>
                    
                    <Button
                      onClick={() => handleRotate(selectedObject.id, 0)}
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      Reset Rotation
                    </Button>
                    
                    <Button
                      onClick={() => {
                        handleRemove(selectedObject.id);
                        setSelectedObjectId(null);
                      }}
                      variant="destructive"
                      className="ml-auto"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Object
                    </Button>
                  </div>

                  {/* Width Scale Slider */}
                  <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-white flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-indigo-400" />
                        Širina objekta
                      </label>
                      <span className="text-lg font-bold text-indigo-300">{Math.round(widthScale)}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="1"
                      value={widthScale}
                      onChange={(e) => handleWidthScaleChange(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
                      style={{
                        background: `linear-gradient(to right, #6366f1 0%, #8b5cf6 ${widthScale / 2}%, rgba(255,255,255,0.1) ${widthScale / 2}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-white/50 mt-2">
                      <span>50%</span>
                      <span>100%</span>
                      <span>200%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Move className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">Click on an object to select it and access controls</p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Download, Scissors, Check, X, RefreshCw } from 'lucide-react';

type Point = { x: number; y: number };

export default function VisualizerApp() {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [poolImage, setPoolImage] = useState<string | null>(null);
  
  // Polygon selection for destination (background)
  const [destPoints, setDestPoints] = useState<Point[]>([]);
  const [isSelectingDest, setIsSelectingDest] = useState(false);
  
  // Polygon selection for source (pool)
  const [sourcePoints, setSourcePoints] = useState<Point[]>([]);
  const [isSelectingSource, setIsSelectingSource] = useState(false);
  
  const [step, setStep] = useState<'dest' | 'source' | 'done'>('dest');
  
  // Store display dimensions before DOM elements disappear
  const [destDisplaySize, setDestDisplaySize] = useState({ width: 0, height: 0 });
  const [sourceDisplaySize, setSourceDisplaySize] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const destCanvasRef = useRef<HTMLDivElement>(null);
  const sourceCanvasRef = useRef<HTMLDivElement>(null);

  // Upload background (destination photo)
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
        setDestPoints([]);
        setIsSelectingDest(false);
        setStep('dest');
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload pool image (source)
  const handlePoolUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPoolImage(event.target?.result as string);
        setSourcePoints([]);
        setIsSelectingSource(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle click on destination image
  const handleDestClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelectingDest || destPoints.length >= 4) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDestPoints([...destPoints, { x, y }]);
    
    if (destPoints.length === 3) {
      setIsSelectingDest(false);
    }
  };

  // Handle click on source image
  const handleSourceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelectingSource || sourcePoints.length >= 4) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSourcePoints([...sourcePoints, { x, y }]);
    
    if (sourcePoints.length === 3) {
      setIsSelectingSource(false);
    }
  };

  // Start selecting destination polygon
  const startDestSelection = () => {
    setDestPoints([]);
    setIsSelectingDest(true);
  };

  // Start selecting source polygon
  const startSourceSelection = () => {
    setSourcePoints([]);
    setIsSelectingSource(true);
  };

  // Confirm destination selection
  const confirmDestSelection = () => {
    if (destPoints.length === 4) {
      setStep('source');
    }
  };

  // Confirm source selection and render
  const confirmSourceSelection = () => {
    if (sourcePoints.length === 4 && destPoints.length === 4) {
      // CAPTURE display dimensions BEFORE elements disappear
      const destCanvas = destCanvasRef.current;
      const sourceCanvas = sourceCanvasRef.current;
      
      if (destCanvas && sourceCanvas) {
        const destImg = destCanvas.querySelector('img');
        const sourceImg = sourceCanvas.querySelector('img');
        
        if (destImg && sourceImg) {
          const destSize = {
            width: destImg.clientWidth,
            height: destImg.clientHeight
          };
          const sourceSize = {
            width: sourceImg.clientWidth,
            height: sourceImg.clientHeight
          };
          
          console.log('💾 Captured display sizes:', {
            dest: destSize,
            source: sourceSize
          });
          
          // Save to state for later use
          setDestDisplaySize(destSize);
          setSourceDisplaySize(sourceSize);
          
          setStep('done');
          
          // Pass sizes directly to avoid async state issues
          setTimeout(() => renderComposite(destSize, sourceSize), 100);
        }
      }
    }
  };

  // Perspective transform and composite rendering
  const renderComposite = (destSize: { width: number; height: number }, sourceSize: { width: number; height: number }) => {
    if (!canvasRef.current || !backgroundImage || !poolImage) {
      console.log('❌ Canvas or images not ready');
      return;
    }
    
    // Validate saved display sizes
    if (destSize.width === 0 || sourceSize.width === 0) {
      console.log('❌ Display sizes not saved');
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('❌ No context');
      return;
    }

    const bgImg = new Image();
    const poolImg = new Image();
    
    bgImg.onload = () => {
      console.log('✅ Background loaded:', bgImg.width, 'x', bgImg.height);
      canvas.width = bgImg.width;
      canvas.height = bgImg.height;
      
      // Draw background first
      ctx.drawImage(bgImg, 0, 0);
      console.log('✅ Background drawn');
      
      poolImg.onload = () => {
        console.log('✅ Pool loaded:', poolImg.width, 'x', poolImg.height);
        console.log('📍 Dest points (screen coords):', destPoints);
        console.log('📍 Source points (screen coords):', sourcePoints);
        console.log('💾 Using saved display sizes:', { dest: destSize, source: sourceSize });
        
        // Use saved display dimensions
        const destScaleX = bgImg.width / destSize.width;
        const destScaleY = bgImg.height / destSize.height;
        const sourceScaleX = poolImg.width / sourceSize.width;
        const sourceScaleY = poolImg.height / sourceSize.height;
        
        console.log('⚖️ Dest scale:', destScaleX, destScaleY);
        console.log('⚖️ Source scale:', sourceScaleX, sourceScaleY);
        
        // Scale points to actual image coordinates
        const scaledDestPoints = destPoints.map(p => ({
          x: p.x * destScaleX,
          y: p.y * destScaleY
        }));
        
        const scaledSourcePoints = sourcePoints.map(p => ({
          x: p.x * sourceScaleX,
          y: p.y * sourceScaleY
        }));
        
        console.log('📍 Scaled dest points:', scaledDestPoints);
        console.log('📍 Scaled source points:', scaledSourcePoints);
        
        // Calculate bounding boxes
        const destMinX = Math.min(...scaledDestPoints.map(p => p.x));
        const destMinY = Math.min(...scaledDestPoints.map(p => p.y));
        const destMaxX = Math.max(...scaledDestPoints.map(p => p.x));
        const destMaxY = Math.max(...scaledDestPoints.map(p => p.y));
        
        const sourceMinX = Math.min(...scaledSourcePoints.map(p => p.x));
        const sourceMinY = Math.min(...scaledSourcePoints.map(p => p.y));
        const sourceMaxX = Math.max(...scaledSourcePoints.map(p => p.x));
        const sourceMaxY = Math.max(...scaledSourcePoints.map(p => p.y));
        
        console.log('📦 Dest bbox:', { minX: destMinX, minY: destMinY, maxX: destMaxX, maxY: destMaxY });
        console.log('📦 Source bbox:', { minX: sourceMinX, minY: sourceMinY, maxX: sourceMaxX, maxY: sourceMaxY });
        
        // Create clipping path from destination polygon
        ctx.save();
        ctx.beginPath();
        scaledDestPoints.forEach((p, i) => {
          if (i === 0) {
            ctx.moveTo(p.x, p.y);
            console.log(`  moveTo(${p.x}, ${p.y})`);
          } else {
            ctx.lineTo(p.x, p.y);
            console.log(`  lineTo(${p.x}, ${p.y})`);
          }
        });
        ctx.closePath();
        ctx.clip();
        console.log('✂️ Clipping path created');
        
        // Draw the pool image cropped and stretched
        const sourceWidth = sourceMaxX - sourceMinX;
        const sourceHeight = sourceMaxY - sourceMinY;
        const destWidth = destMaxX - destMinX;
        const destHeight = destMaxY - destMinY;
        
        console.log('🎨 Drawing pool image:');
        console.log('  Source rect:', sourceMinX, sourceMinY, sourceWidth, sourceHeight);
        console.log('  Dest rect:', destMinX, destMinY, destWidth, destHeight);
        
        ctx.drawImage(
          poolImg,
          sourceMinX, sourceMinY, sourceWidth, sourceHeight,
          destMinX, destMinY, destWidth, destHeight
        );
        
        ctx.restore();
        
        console.log('✅✅✅ RENDERING COMPLETE!');
      };
      
      poolImg.onerror = (e) => {
        console.log('❌ Pool image load error:', e);
      };
      
      poolImg.src = poolImage;
    };
    
    bgImg.onerror = (e) => {
      console.log('❌ Background image load error:', e);
    };
    
    bgImg.src = backgroundImage;
  };

  // Download composite
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'pool_visualization.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  // Reset everything
  const handleReset = () => {
    setBackgroundImage(null);
    setPoolImage(null);
    setDestPoints([]);
    setSourcePoints([]);
    setIsSelectingDest(false);
    setIsSelectingSource(false);
    setStep('dest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-amber-500/20 p-4">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 text-center">
          MONDO ACQUA Pool Visualizer
        </h1>
        <p className="text-center text-white/60 text-sm mt-2">
          {step === 'dest' && 'Step 1: Mark pool area on destination photo (4 points)'}
          {step === 'source' && 'Step 2: Mark pool area on source photo (4 points)'}
          {step === 'done' && 'Done! Download your visualization'}
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/30 backdrop-blur-sm border-b border-white/10 p-4 flex gap-4 justify-center flex-wrap">
        <label className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg cursor-pointer flex items-center gap-2 transition-all">
          <Camera className="w-4 h-4" />
          Upload Destination Photo
          <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
        </label>

        <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer flex items-center gap-2 transition-all">
          <Upload className="w-4 h-4" />
          Upload Pool Source
          <input type="file" accept="image/*" onChange={handlePoolUpload} className="hidden" />
        </label>

        {step === 'dest' && backgroundImage && (
          <button
            onClick={startDestSelection}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Scissors className="w-4 h-4" />
            Mark Destination Area ({destPoints.length}/4)
          </button>
        )}

        {step === 'dest' && destPoints.length === 4 && (
          <button
            onClick={confirmDestSelection}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Check className="w-4 h-4" />
            Confirm Destination
          </button>
        )}

        {step === 'source' && poolImage && (
          <button
            onClick={startSourceSelection}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Scissors className="w-4 h-4" />
            Mark Source Area ({sourcePoints.length}/4)
          </button>
        )}

        {step === 'source' && sourcePoints.length === 4 && (
          <button
            onClick={confirmSourceSelection}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Check className="w-4 h-4" />
            Apply Transform
          </button>
        )}

        {step === 'done' && (
          <>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Result
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Start Over
            </button>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Destination Image */}
        {step !== 'done' && (
          <div>
            <h3 className="text-white text-lg mb-3 font-semibold">1. Destination Photo</h3>
            {!backgroundImage ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border-2 border-dashed border-amber-500/30 p-24 text-center">
                <Camera className="w-12 h-12 text-amber-400/50 mx-auto mb-3" />
                <p className="text-white/60">Upload destination photo</p>
              </div>
            ) : (
              <div
                ref={destCanvasRef}
                className="relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl cursor-crosshair"
                onClick={handleDestClick}
              >
                <img
                  src={backgroundImage}
                  alt="Destination"
                  className="w-full h-auto"
                />
                
                {/* Render destination points */}
                {destPoints.map((point, i) => (
                  <div
                    key={i}
                    className="absolute w-6 h-6 bg-amber-500 border-4 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                    style={{ left: point.x, top: point.y }}
                  >
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                ))}
                
                {/* Draw polygon lines */}
                {destPoints.length > 1 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <polygon
                      points={destPoints.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="rgba(251, 191, 36, 0.1)"
                      stroke="rgb(251, 191, 36)"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>
        )}

        {/* Source Image */}
        {step === 'source' && (
          <div>
            <h3 className="text-white text-lg mb-3 font-semibold">2. Pool Source Photo</h3>
            {!poolImage ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border-2 border-dashed border-blue-500/30 p-24 text-center">
                <Upload className="w-12 h-12 text-blue-400/50 mx-auto mb-3" />
                <p className="text-white/60">Upload pool source photo</p>
              </div>
            ) : (
              <div
                ref={sourceCanvasRef}
                className="relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl cursor-crosshair"
                onClick={handleSourceClick}
              >
                <img
                  src={poolImage}
                  alt="Source"
                  className="w-full h-auto"
                />
                
                {/* Render source points */}
                {sourcePoints.map((point, i) => (
                  <div
                    key={i}
                    className="absolute w-6 h-6 bg-blue-500 border-4 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                    style={{ left: point.x, top: point.y }}
                  >
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                ))}
                
                {/* Draw polygon lines */}
                {sourcePoints.length > 1 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <polygon
                      points={sourcePoints.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="rgba(59, 130, 246, 0.1)"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>
        )}

        {/* Final Result */}
        {step === 'done' && (
          <div className="lg:col-span-2">
            <h3 className="text-white text-lg mb-3 font-semibold text-center">Final Result</h3>
            <div className="max-w-4xl mx-auto bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
              <canvas
                ref={canvasRef}
                className="w-full h-auto"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Camera, Upload, Download, Scissors, Check, RefreshCw, Undo, Grid3x3, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  
  // UI helpers - VISUAL ONLY!
  const [showGrid, setShowGrid] = useState(false);
  const [showDarkOverlay, setShowDarkOverlay] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const gridSize = 20;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const destCanvasRef = useRef<HTMLDivElement>(null);
  const sourceCanvasRef = useRef<HTMLDivElement>(null);

  // Snap to grid helper
  const snapPoint = (point: Point): Point => {
    if (!snapToGrid) return point;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  };

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
    
    const point = snapPoint({ x, y });
    setDestPoints([...destPoints, point]);
    
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
    
    const point = snapPoint({ x, y });
    setSourcePoints([...sourcePoints, point]);
    
    if (sourcePoints.length === 3) {
      setIsSelectingSource(false);
    }
  };

  // Undo last point - VISUAL HELPER
  const undoDestPoint = () => {
    if (destPoints.length > 0) {
      setDestPoints(destPoints.slice(0, -1));
      setIsSelectingDest(true);
    }
  };

  const undoSourcePoint = () => {
    if (sourcePoints.length > 0) {
      setSourcePoints(sourcePoints.slice(0, -1));
      setIsSelectingSource(true);
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
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
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
        
        // ✨ PERSPECTIVE TRANSFORM using quad subdivision (mesh warping)
        console.log('🔷 Starting perspective transform with quad subdivision');
        
        // DEBUG: Show point order
        console.log('📍 Point order check:');
        console.log('  Dest[0] (top-left?):', scaledDestPoints[0]);
        console.log('  Dest[1] (top-right?):', scaledDestPoints[1]);
        console.log('  Dest[2] (bottom-right?):', scaledDestPoints[2]);
        console.log('  Dest[3] (bottom-left?):', scaledDestPoints[3]);
        console.log('  Source[0]:', scaledSourcePoints[0]);
        console.log('  Source[1]:', scaledSourcePoints[1]);
        console.log('  Source[2]:', scaledSourcePoints[2]);
        console.log('  Source[3]:', scaledSourcePoints[3]);
        
        // Subdivide quad into grid for better perspective approximation
        const subdivisions = 40; // 40x40 = 3200 triangles for ultra-smooth warp!
        
        ctx.save();
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        let triangleCount = 0;
        
        // Iterate through grid
        for (let i = 0; i < subdivisions; i++) {
          for (let j = 0; j < subdivisions; j++) {
            const u0 = i / subdivisions;
            const v0 = j / subdivisions;
            const u1 = (i + 1) / subdivisions;
            const v1 = (j + 1) / subdivisions;
            
            // Get 4 corners of this grid cell in source and dest
            const srcP00 = interpolateQuad(scaledSourcePoints, u0, v0);
            const srcP10 = interpolateQuad(scaledSourcePoints, u1, v0);
            const srcP01 = interpolateQuad(scaledSourcePoints, u0, v1);
            const srcP11 = interpolateQuad(scaledSourcePoints, u1, v1);
            
            const dstP00 = interpolateQuad(scaledDestPoints, u0, v0);
            const dstP10 = interpolateQuad(scaledDestPoints, u1, v0);
            const dstP01 = interpolateQuad(scaledDestPoints, u0, v1);
            const dstP11 = interpolateQuad(scaledDestPoints, u1, v1);
            
            // Draw two triangles for this cell
            // Triangle 1: top-left
            drawTrianglePerspective(ctx, poolImg, [srcP00, srcP10, srcP01], [dstP00, dstP10, dstP01]);
            triangleCount++;
            
            // Triangle 2: bottom-right
            drawTrianglePerspective(ctx, poolImg, [srcP10, srcP11, srcP01], [dstP10, dstP11, dstP01]);
            triangleCount++;
          }
        }
        
        ctx.restore();
        
        console.log(`✅✅✅ PERSPECTIVE TRANSFORM COMPLETE! Rendered ${triangleCount} triangles`);
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

  // Bilinear interpolation within quad
  const interpolateQuad = (quad: Point[], u: number, v: number): Point => {
    // quad = [top-left, top-right, bottom-right, bottom-left] (points 0, 1, 2, 3)
    const [p0, p1, p2, p3] = quad;
    
    // Bilinear interpolation formula
    const x = 
      p0.x * (1 - u) * (1 - v) +
      p1.x * u * (1 - v) +
      p2.x * u * v +
      p3.x * (1 - u) * v;
    
    const y = 
      p0.y * (1 - u) * (1 - v) +
      p1.y * u * (1 - v) +
      p2.y * u * v +
      p3.y * (1 - u) * v;
    
    return { x, y };
  };

  // Helper function: Draw triangle with perspective transform
  const drawTrianglePerspective = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    srcTriangle: Point[],
    dstTriangle: Point[]
  ) => {
    // Calculate affine transform matrix for triangle mapping
    const [s0, s1, s2] = srcTriangle;
    const [d0, d1, d2] = dstTriangle;
    
    // Compute transform matrix that maps source triangle to destination triangle
    // Using matrix math: [x', y'] = M * [x, y]
    
    const dx1 = d1.x - d0.x;
    const dy1 = d1.y - d0.y;
    const dx2 = d2.x - d0.x;
    const dy2 = d2.y - d0.y;
    
    const sx1 = s1.x - s0.x;
    const sy1 = s1.y - s0.y;
    const sx2 = s2.x - s0.x;
    const sy2 = s2.y - s0.y;
    
    const det = sx1 * sy2 - sx2 * sy1;
    if (Math.abs(det) < 1e-10) {
      console.log('⚠️ Degenerate triangle, skipping');
      return;
    }
    
    const invDet = 1 / det;
    
    // Affine transform matrix
    const m11 = (dx1 * sy2 - dx2 * sy1) * invDet;
    const m12 = (dx2 * sx1 - dx1 * sx2) * invDet;
    const m21 = (dy1 * sy2 - dy2 * sy1) * invDet;
    const m22 = (dy2 * sx1 - dy1 * sx2) * invDet;
    const m31 = d0.x - (m11 * s0.x + m12 * s0.y);
    const m32 = d0.y - (m21 * s0.x + m22 * s0.y);
    
    // Create clipping path for destination triangle
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(d0.x, d0.y);
    ctx.lineTo(d1.x, d1.y);
    ctx.lineTo(d2.x, d2.y);
    ctx.closePath();
    ctx.clip();
    
    // Apply transform and draw
    ctx.transform(m11, m21, m12, m22, m31, m32);
    ctx.drawImage(img, 0, 0);
    
    ctx.restore();
  };

  // Download composite
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'mondo_acqua_pool_visualization.png';
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Animated gradient orbs - 3D depth */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg2LCAxODIsIDIxMiwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
      
      {/* Animated Header - Glassmorphism */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-slate-900/30 backdrop-blur-2xl border-b border-cyan-500/10 shadow-[0_8px_32px_0_rgba(6,182,212,0.1)]"
      >
        <div className="p-8">
          <div className="flex items-center justify-center gap-4">
            {/* 3D Logo with glow */}
            <div className="relative group">
              {/* Outer glow ring */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              
              {/* Middle ring */}
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-xl opacity-50"></div>
              
              {/* Logo circle */}
              <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50 border-2 border-cyan-300/20 group-hover:scale-110 transition-transform duration-300">
                {/* Inner shine */}
                <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                <svg viewBox="0 0 24 24" fill="white" className="w-9 h-9 relative z-10 drop-shadow-lg">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </div>
            </div>
            
            <div className="flex flex-col items-start">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 drop-shadow-2xl flex items-baseline gap-3">
                <span className="tracking-tight font-extrabold">AcquaSmart</span>
                <span className="text-2xl text-cyan-400 font-light tracking-wider">Pro</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                <p className="text-cyan-300/80 text-sm tracking-widest uppercase font-medium">AI-Powered Pool Management</p>
              </div>
            </div>
          </div>
          
          <motion.p 
            key={step}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-cyan-100/70 text-base mt-6 font-medium tracking-wide"
          >
            {step === 'dest' && '🎯 Step 1: Define pool area on destination photo (4 corner points)'}
            {step === 'source' && '✂️ Step 2: Mark pool area on source photo (4 corner points)'}
            {step === 'done' && '✨ 3D Perspective Transform Complete - Download Your Visualization'}
          </motion.p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="bg-slate-900/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex gap-3 justify-center flex-wrap mb-3">
          <motion.label 
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl cursor-pointer flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25 border border-cyan-400/30 font-semibold"
          >
            <Camera className="w-5 h-5" />
            Upload Destination Photo
            <input type="file" accept="image/*" onChange={handleBackgroundUpload} className="hidden" />
          </motion.label>

          <motion.label 
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl cursor-pointer flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 border border-blue-400/30 font-semibold"
          >
            <Upload className="w-5 h-5" />
            Upload Pool Source
            <input type="file" accept="image/*" onChange={handlePoolUpload} className="hidden" />
          </motion.label>

          {step === 'dest' && backgroundImage && (
            <>
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={startDestSelection}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-600/80 to-cyan-700/80 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
              >
                <Scissors className="w-4 h-4" />
                Mark Destination Area ({destPoints.length}/4)
              </motion.button>
              
              {destPoints.length > 0 && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={undoDestPoint}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg"
                >
                  <Undo className="w-4 h-4" />
                  Undo
                </motion.button>
              )}
            </>
          )}

          {step === 'dest' && destPoints.length === 4 && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={confirmDestSelection}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 border border-emerald-400/30 font-bold"
            >
              <Check className="w-5 h-5" />
              Confirm Destination
            </motion.button>
          )}

          {step === 'source' && poolImage && (
            <>
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={startSourceSelection}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-600/80 to-cyan-700/80 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
              >
                <Scissors className="w-4 h-4" />
                Mark Source Area ({sourcePoints.length}/4)
              </motion.button>
              
              {sourcePoints.length > 0 && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={undoSourcePoint}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg"
                >
                  <Undo className="w-4 h-4" />
                  Undo
                </motion.button>
              )}
            </>
          )}

          {step === 'source' && sourcePoints.length === 4 && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={confirmSourceSelection}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 border border-emerald-400/30 font-bold"
            >
              <Check className="w-5 h-5" />
              Apply Transform
            </motion.button>
          )}

          {step === 'done' && (
            <>
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 border border-emerald-400/30 font-bold"
              >
                <Download className="w-5 h-5" />
                Download Result
              </motion.button>
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-500/25 border border-red-400/30 font-semibold"
              >
                <RefreshCw className="w-5 h-5" />
                Start Over
              </motion.button>
            </>
          )}
        </div>
        
        {/* Helper toggles - VISUAL AIDS */}
        {(step === 'dest' || step === 'source') && backgroundImage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 justify-center flex-wrap"
          >
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all ${
                showGrid 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Grid3x3 className="w-3.5 h-3.5" />
              Grid {showGrid ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all ${
                snapToGrid 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              Snap {snapToGrid ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={() => setShowDarkOverlay(!showDarkOverlay)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-all ${
                showDarkOverlay 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              {showDarkOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              Overlay {showDarkOverlay ? 'ON' : 'OFF'}
            </button>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Destination Image */}
        {step !== 'done' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* 3D Card Header */}
            <div className="mb-4 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full blur-md opacity-60"></div>
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-xl font-bold shadow-xl border-2 border-cyan-300/30">
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold tracking-tight">Destination Photo</h3>
                    <p className="text-cyan-300/60 text-xs mt-0.5">Mark your pool area with 4 points</p>
                  </div>
                </div>
              </div>
            </div>
            
            {!backgroundImage ? (
              <motion.div 
                whileHover={{ scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.6)' }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-slate-900/60 backdrop-blur-2xl rounded-3xl border-2 border-dashed border-cyan-500/30 p-32 text-center transition-all shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-3xl"></div>
                  <Camera className="relative w-24 h-24 text-cyan-400/40 mx-auto mb-6 animate-pulse drop-shadow-2xl" />
                  <p className="relative text-white/70 text-lg font-medium">Click to upload destination photo</p>
                  <p className="relative text-cyan-400/50 text-sm mt-2">Supports JPG, PNG</p>
                </div>
              </motion.div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div
                  ref={destCanvasRef}
                  className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl cursor-crosshair border-2 border-cyan-500/20 hover:border-cyan-500/40 transition-all"
                  onClick={handleDestClick}
                >
                  <img
                    src={backgroundImage}
                    alt="Destination"
                    className="w-full h-auto"
                  />
                  
                  {/* Grid overlay */}
                  {showGrid && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                      {Array.from({ length: 100 }).map((_, i) => (
                        <React.Fragment key={`grid-${i}`}>
                          <line 
                            x1={i * gridSize} 
                            y1="0" 
                            x2={i * gridSize} 
                            y2="100%" 
                            stroke="rgb(6, 182, 212)" 
                            strokeWidth="0.5" 
                          />
                          <line 
                            x1="0" 
                            y1={i * gridSize} 
                            x2="100%" 
                            y2={i * gridSize} 
                            stroke="rgb(6, 182, 212)" 
                            strokeWidth="0.5" 
                          />
                        </React.Fragment>
                      ))}
                    </svg>
                  )}
                  
                  {/* Dark overlay OUTSIDE polygon */}
                  {showDarkOverlay && destPoints.length === 4 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <defs>
                        <mask id="destMask">
                          <rect width="100%" height="100%" fill="white" />
                          <polygon
                            points={destPoints.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="black"
                          />
                        </mask>
                      </defs>
                      <rect 
                        width="100%" 
                        height="100%" 
                        fill="rgba(0, 0, 0, 0.75)" 
                        mask="url(#destMask)"
                      />
                    </svg>
                  )}
                  
                  {/* Render destination points with 3D animation */}
                  <AnimatePresence>
                    {destPoints.map((point, i) => (
                      <motion.div
                        key={`dest-point-${i}`}
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: point.x, top: point.y }}
                      >
                        <div className="relative">
                          {/* Outer glow */}
                          <div className="absolute -inset-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
                          {/* Middle ring */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full blur-md opacity-80"></div>
                          {/* Point circle */}
                          <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-300 via-cyan-400 to-cyan-600 border-4 border-white/90 rounded-full shadow-2xl flex items-center justify-center">
                            <div className="absolute inset-2 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
                            <span className="relative text-white text-base font-bold drop-shadow-lg">{i + 1}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Draw polygon lines with neon glow */}
                  {destPoints.length > 1 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <defs>
                        <filter id="glowCyan">
                          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <polygon
                        points={destPoints.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="rgba(6, 182, 212, 0.15)"
                        stroke="rgb(6, 182, 212)"
                        strokeWidth="4"
                        filter="url(#glowCyan)"
                      />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Source Image */}
        {step === 'source' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* 3D Card Header */}
            <div className="mb-4 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full blur-md opacity-60"></div>
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xl font-bold shadow-xl border-2 border-blue-300/30">
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold tracking-tight">Pool Source Photo</h3>
                    <p className="text-cyan-300/60 text-xs mt-0.5">Mark your pool area with 4 points</p>
                  </div>
                </div>
              </div>
            </div>
            
            {!poolImage ? (
              <motion.div 
                whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.6)' }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-slate-900/60 backdrop-blur-2xl rounded-3xl border-2 border-dashed border-blue-500/30 p-32 text-center transition-all shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
                  <Upload className="relative w-24 h-24 text-blue-400/40 mx-auto mb-6 animate-pulse drop-shadow-2xl" />
                  <p className="relative text-white/70 text-lg font-medium">Click to upload pool source photo</p>
                  <p className="relative text-cyan-400/50 text-sm mt-2">Supports JPG, PNG</p>
                </div>
              </motion.div>
            ) : (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div
                  ref={sourceCanvasRef}
                  className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl cursor-crosshair border-2 border-blue-500/20 hover:border-blue-500/40 transition-all"
                  onClick={handleSourceClick}
                >
                  <img
                    src={poolImage}
                    alt="Source"
                    className="w-full h-auto"
                  />
                  
                  {/* Grid overlay */}
                  {showGrid && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                      {Array.from({ length: 100 }).map((_, i) => (
                        <React.Fragment key={`grid-source-${i}`}>
                          <line 
                            x1={i * gridSize} 
                            y1="0" 
                            x2={i * gridSize} 
                            y2="100%" 
                            stroke="rgb(59, 130, 246)" 
                            strokeWidth="0.5" 
                          />
                          <line 
                            x1="0" 
                            y1={i * gridSize} 
                            x2="100%" 
                            y2={i * gridSize} 
                            stroke="rgb(59, 130, 246)" 
                            strokeWidth="0.5" 
                          />
                        </React.Fragment>
                      ))}
                    </svg>
                  )}
                  
                  {/* Dark overlay OUTSIDE polygon */}
                  {showDarkOverlay && sourcePoints.length === 4 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <defs>
                        <mask id="sourceMask">
                          <rect width="100%" height="100%" fill="white" />
                          <polygon
                            points={sourcePoints.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="black"
                          />
                        </mask>
                      </defs>
                      <rect 
                        width="100%" 
                        height="100%" 
                        fill="rgba(0, 0, 0, 0.75)" 
                        mask="url(#sourceMask)"
                      />
                    </svg>
                  )}
                  
                  {/* Render source points with 3D animation */}
                  <AnimatePresence>
                    {sourcePoints.map((point, i) => (
                      <motion.div
                        key={`source-point-${i}`}
                        initial={{ scale: 0, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: point.x, top: point.y }}
                      >
                        <div className="relative">
                          {/* Outer glow */}
                          <div className="absolute -inset-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
                          {/* Middle ring */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur-md opacity-80"></div>
                          {/* Point circle */}
                          <div className="relative w-12 h-12 bg-gradient-to-br from-blue-300 via-blue-400 to-blue-600 border-4 border-white/90 rounded-full shadow-2xl flex items-center justify-center">
                            <div className="absolute inset-2 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
                            <span className="relative text-white text-base font-bold drop-shadow-lg">{i + 1}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Draw polygon lines with neon glow */}
                  {sourcePoints.length > 1 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <defs>
                        <filter id="glowBlue">
                          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <polygon
                        points={sourcePoints.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="rgba(59, 130, 246, 0.15)"
                        stroke="rgb(59, 130, 246)"
                        strokeWidth="4"
                        filter="url(#glowBlue)"
                      />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Final Result */}
        {step === 'done' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2"
          >
            <h3 className="text-white text-3xl mb-6 font-bold text-center flex items-center justify-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50">
                  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                </div>
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500">
                3D Pool Visualizer
              </span>
            </h3>
            <div className="max-w-6xl mx-auto bg-slate-900/50 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20 border-2 border-cyan-500/30">
              <canvas
                ref={canvasRef}
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
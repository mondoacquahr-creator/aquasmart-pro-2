import React, { useState, useRef } from 'react';
import { Upload, Camera } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { GlassCard } from './SharedUI';
import { CropOverlay } from './CropOverlay';

export function HomeScreen({ onStart }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="max-w-2xl p-12 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">MONDO ACQUA</h1>
        <p className="text-white/60 mb-8">Pool Visualizer</p>
        <button
          onClick={onStart}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
        >
          Start New Project
        </button>
      </GlassCard>
    </div>
  );
}

export function PhotoUploadStep({ onNext }: { onNext: (photoUrl: string, dimensions: { width: number; height: number }) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    console.log('🟠 1. PhotoUpload - File selected:', file.name, file.type, file.size);
    
    if (!file.type.startsWith('image/')) {
      console.log('🟠 ❌ Not an image file!');
      toast.error('Molimo odaberite sliku');
      return;
    }

    console.log('🟠 2. Creating FileReader...');
    const reader = new FileReader();
    
    reader.onerror = (e) => {
      console.error('🟠 ❌ FileReader ERROR:', e);
      toast.error('Greška pri čitanju slike');
    };
    
    reader.onload = (e) => {
      console.log('🟠 3. FileReader onload triggered');
      const dataUrl = e.target?.result as string;
      
      if (!dataUrl) {
        console.error('🟠 ❌ No dataUrl!');
        toast.error('Greška: nije moguće učitati sliku');
        return;
      }
      
      console.log('🟠 4. DataUrl length:', dataUrl.length);
      console.log('🟠 5. Creating Image to get dimensions...');
      
      const img = new Image();
      img.onerror = (err) => {
        console.error('🟠 ❌ Image load ERROR:', err);
        toast.error('Greška pri obradi slike');
      };
      
      img.onload = () => {
        console.log('🟠 6. Image loaded! Dimensions:', img.width, 'x', img.height);
        console.log('🟠 7. Calling onNext...');
        
        try {
          onNext(dataUrl, { width: img.width, height: img.height });
          console.log('🟠 8. ✅ onNext called successfully!');
          toast.success('✅ Slika učitana');
        } catch (error) {
          console.error('🟠 ❌ ERROR calling onNext:', error);
          toast.error('Greška: ' + error);
        }
      };
      
      console.log('🟠 5b. Setting img.src...');
      img.src = dataUrl;
    };
    
    console.log('🟠 2b. Starting readAsDataURL...');
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="max-w-2xl w-full p-12">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">📸 Dodaj fotografiju prostora</h2>
        <p className="text-white/60 mb-8 text-center">Učitaj sliku gdje želiš vizualizirati bazen</p>
        
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-4 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-amber-400 bg-amber-400/10' 
              : 'border-white/20 hover:border-amber-400/50 hover:bg-white/5'
          }`}
        >
          <Upload className="w-16 h-16 mx-auto mb-4 text-amber-400" />
          <p className="text-white font-bold text-xl mb-2">Povuci sliku ovdje</p>
          <p className="text-white/60">ili klikni za odabir</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      </GlassCard>
    </div>
  );
}

export function PhotoEditStep({ photo, dimensions, onNext, onBack }: { 
  photo: string; 
  dimensions: { width: number; height: number };
  onNext: (points: Array<{x: number, y: number}>, cropArea: { x: number; y: number; width: number; height: number }) => void; 
  onBack: () => void;
}) {
  console.log('🟢 PhotoEditStep RENDERED! dimensions:', dimensions);
  
  const [showCropOverlay, setShowCropOverlay] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleApplyCrop = (points: Array<{x: number, y: number}>, cropArea: { x: number; y: number; width: number; height: number }) => {
    console.log('🟢 PhotoEditStep - Crop applied! Points:', points);
    setShowCropOverlay(false);
    onNext(points, cropArea);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 relative">
      <div className="relative max-w-6xl w-full">
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Room photo display */}
        <div className="relative w-full max-h-[80vh] flex items-center justify-center">
          <img 
            src={photo} 
            alt="Room" 
            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
          />
          
          {showCropOverlay && (
            <CropOverlay
              imageUrl={photo}
              imageDimensions={dimensions}
              onComplete={handleApplyCrop}
              onCancel={onBack}
              mode="cut"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function ObjectGalleryStep({ onNext, onBack }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="max-w-2xl p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">🏊 Odaberi bazen</h2>
        <p className="text-white/60 mb-8">Za sada preskoči galeriju i učitaj vlastitu sliku bazena</p>
        <button
          onClick={onNext}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/50 transition-all"
        >
          Učitaj vlastiti bazen
        </button>
      </GlassCard>
    </div>
  );
}

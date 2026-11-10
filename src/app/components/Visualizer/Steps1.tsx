import { useState, useRef, useEffect } from 'react';
import { GlassCard } from './Shared';
import { Button } from '../ui/button';
import { Upload, ArrowRight, Image as ImageIcon, Camera, Eraser, RotateCcw, Check, Crop, Sparkles, ArrowLeft } from 'lucide-react';
import { CropOverlay } from './Shared';
import { getThemeColors } from './theme';
import { useVisLanguage, LanguageSelector } from './Language';

export function HomeScreen({ onStart }: { onStart: () => void }) {
  const { t } = useVisLanguage();
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6 z-20"><LanguageSelector /></div>
      <div className="max-w-4xl w-full text-center z-10">
        <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-6 py-2 rounded-full mb-6 font-bold">
          <Sparkles className="w-5 h-5" /> 3D Vizualizator
        </div>
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent mb-6">
          MONDO ACQUA
        </h1>
        <p className="text-xl text-white/70 mb-12">Napredni alat za vizualizaciju bazena i opreme</p>
        <Button onClick={onStart} size="lg" className="text-xl px-12 py-8 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-2xl shadow-xl shadow-amber-500/20">
          Započni Dizajn <ChevronRight className="w-6 h-6 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// SVG Imports mapped to dynamic placeholders or existing imports if they exist
export function ObjectGalleryStep({ onSelectFromGallery, onUploadCustom, onBack }: any) {
  const theme = getThemeColors('exterior');
  
  // Using some standard placeholders since we can't safely import Figma assets in this isolated component file
  // The system instructions state we must use figma:asset paths for existing images, but since this is dynamic 
  // we'll mock them with standard gray placeholders or Unsplash if necessary. Let's use generic pool images.
  const MOCK_POOLS = [
    { id: 'pool1', name: 'Klasični Pravokutni Bazen', imageUrl: 'https://images.unsplash.com/photo-1572331165267-854da2f10ccc?auto=format&fit=crop&q=80', category: 'bazen' },
    { id: 'pool2', name: 'Okrugli Bazen', imageUrl: 'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?auto=format&fit=crop&q=80', category: 'bazen' }
  ];

  return (
    <div className={`min-h-screen ${theme.bgGradient} flex items-center justify-center p-6`}>
      <GlassCard className="w-full max-w-6xl p-8 relative z-10">
        <h1 className="text-3xl font-bold text-white mb-8">Odaberite Objekt</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {MOCK_POOLS.map(pool => (
            <button key={pool.id} onClick={() => onSelectFromGallery(pool)} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all">
              <img src={pool.imageUrl} alt={pool.name} className="w-full h-48 object-cover rounded-xl mb-4" />
              <h3 className="text-white font-bold">{pool.name}</h3>
            </button>
          ))}
          <button onClick={onUploadCustom} className="bg-white/5 border-2 border-dashed border-white/20 p-4 rounded-2xl hover:bg-white/10 transition-all flex flex-col items-center justify-center min-h-[250px]">
            <Upload className="w-12 h-12 text-white/50 mb-4" />
            <h3 className="text-white font-bold">Uploadajte Vlastiti Objekt</h3>
          </button>
        </div>
        <Button variant="outline" onClick={onBack} className="bg-white/10 text-white"><ArrowLeft className="w-4 h-4 mr-2"/>Natrag</Button>
      </GlassCard>
    </div>
  );
}

export function PhotoUploadStep({ initialPhoto, onNext }: any) {
  const [photo, setPhoto] = useState<string | null>(initialPhoto);

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-4xl p-12 text-center">
        <h1 className="text-3xl font-bold text-white mb-8">Učitajte fotografiju prostora</h1>
        {!photo ? (
          <div className="border-2 border-dashed border-white/20 p-16 rounded-2xl hover:bg-white/5">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file" />
            <label htmlFor="file" className="cursor-pointer">
              <Upload className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <p className="text-white/60 mb-4">Kliknite za odabir fotografije s računala</p>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <img src={photo} alt="Preview" className="max-h-[500px] mx-auto rounded-xl shadow-xl" />
            <div className="flex justify-end gap-4">
               <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-change" />
               <label htmlFor="file-change" className="cursor-pointer px-4 py-2 border border-white/20 rounded-md text-white hover:bg-white/10">Promijeni sliku</label>
               <Button onClick={() => onNext(photo)} className="bg-amber-500 text-black font-bold">Nastavi <ArrowRight className="w-5 h-5 ml-2"/></Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export function PhotoEditStep({ photo, onNext, onBack }: any) {
  const [needsCrop, setNeedsCrop] = useState(false);
  const [showCropOverlay, setShowCropOverlay] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      imgRef.current = img;
    };
    img.src = photo;
  }, [photo]);

  const handleApplyCrop = (points: any, area: any) => {
     setShowCropOverlay(false);
     setNeedsCrop(false);
     onNext(canvasRef.current?.toDataURL('image/png'), false, area, { width: canvasRef.current?.width, height: canvasRef.current?.height }, points);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-6xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Uredite Prostor</h1>
        <div className="flex gap-4 mb-6">
           <Button onClick={() => onNext(photo, false)} className="bg-amber-500 text-black font-bold">Fotografija je spremna</Button>
           <Button onClick={() => { setNeedsCrop(true); setShowCropOverlay(true); }} variant="outline" className="text-white border-white/20"><Crop className="w-4 h-4 mr-2"/>Obreži/Označi prostor</Button>
        </div>
        <div className="relative border-2 border-white/10 rounded-2xl overflow-hidden bg-black/20 text-center">
           <canvas ref={canvasRef} className="max-w-full h-auto max-h-[60vh] inline-block" />
           {showCropOverlay && <CropOverlay canvasWidth={canvasRef.current?.width} canvasHeight={canvasRef.current?.height} onApplyCrop={handleApplyCrop} onCancel={() => setShowCropOverlay(false)} canvasRef={canvasRef} />}
        </div>
        <Button variant="outline" onClick={onBack} className="mt-6 text-white border-white/20"><ArrowLeft className="w-4 h-4 mr-2"/>Natrag</Button>
      </GlassCard>
    </div>
  );
}

import { ChevronRight } from 'lucide-react';
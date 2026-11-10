import React, { useState, useRef, useEffect } from 'react';
import { Upload, ArrowRight, Image as ImageIcon, Camera, Eraser, RotateCcw, Crop, Scissors, Check, Sparkles, Waves, ChevronRight, CheckCircle2, Printer, Download, Send, Home as HomeIcon, X, Plus, Move, Ruler, Scan } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { jsPDF } from 'jspdf';
import { 
  ProjectData, DesignObject, RoomDimensions, Line, getThemeColors, 
  VisualizerLanguageProvider, useVisualizerLanguage, GlassCard, 
  bucketFillTransform, CropOverlay, ObjectTransformOverlay, LanguageSelector,
  StepNavigation
} from './VisualizerShared';

type Step = 'photo-upload' | 'photo-edit' | 'object-gallery' | 'object-upload' | 'object-crop' | 'design-canvas' | 'results';

// --- STEP 1: PHOTO UPLOAD ---
export function PhotoUploadStep({ initialPhoto, onNext }: any) {
  const [photo, setPhoto] = useState<string | null>(initialPhoto);
  const { t } = useVisualizerLanguage();

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-950 flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
      </div>
      <GlassCard className="w-full max-w-4xl p-8 md:p-12 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg"><ImageIcon className="w-8 h-8 text-white" /></div>
          <div><h1 className="text-3xl font-bold text-amber-300">{t.photoUpload.title}</h1><p className="text-white/60">{t.photoUpload.description}</p></div>
        </div>
        <div className="space-y-6">
          {!photo ? (
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-16 text-center hover:bg-white/5 transition-all">
              <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center"><Upload className="w-12 h-12 text-amber-300" /></div>
              <h3 className="text-xl text-white mb-2">{t.photoUpload.dropzone}</h3>
              <div className="flex gap-3 justify-center mt-6">
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl cursor-pointer font-bold flex items-center gap-2"><Upload className="w-5 h-5"/> {t.photoUpload.uploadButton}</label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <img src={photo} alt="Preview" className="w-full max-h-[500px] object-contain rounded-2xl border-2 border-white/10 bg-black/20" />
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} className="hidden" id="file-change" />
              <label htmlFor="file-change" className="w-full block text-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl cursor-pointer font-bold"><Upload className="w-5 h-5 inline mr-2"/> {t.photoUpload.changePhoto}</label>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-10">
          <button onClick={() => photo && onNext(photo)} disabled={!photo} className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
            {t.photoUpload.next} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

// --- STEP 2: PHOTO EDIT ---
export function PhotoEditStep({ photo, onNext, onBack }: any) {
  const [needsCrop, setNeedsCrop] = useState(false);
  const [showCropOverlay, setShowCropOverlay] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useVisualizerLanguage();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width > 1200 ? 1200 : img.width;
      canvas.height = img.height > 900 ? 900 : img.height;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = photo;
  }, [photo]);

  const handleApplyCrop = (points: any, cropArea: any) => {
    setNeedsCrop(false); setShowCropOverlay(false);
    onNext(canvasRef.current?.toDataURL('image/png'), false, cropArea, { width: canvasRef.current?.width, height: canvasRef.current?.height }, points);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative">
      <GlassCard className="w-full max-w-6xl p-8 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center"><Crop className="w-8 h-8 text-white" /></div>
          <div><h1 className="text-3xl font-bold text-amber-300">{t.photoEdit.title}</h1><p className="text-white/60">{t.photoEdit.description}</p></div>
        </div>
        <div className="flex gap-4 mb-6">
          <button onClick={() => setNeedsCrop(true)} className={`px-6 py-3 rounded-xl font-bold ${needsCrop ? 'bg-amber-600 text-white' : 'bg-white/10 text-white'}`}><Crop className="inline w-5 h-5 mr-2"/> Označi prostor</button>
          <button onClick={() => setShowCropOverlay(true)} disabled={!needsCrop} className={`px-6 py-3 rounded-xl font-bold bg-amber-600 text-white disabled:opacity-50`}><Check className="inline w-5 h-5 mr-2"/> Započni</button>
        </div>
        <div className="relative border-2 border-white/10 rounded-2xl bg-black/20 overflow-hidden">
          <canvas ref={canvasRef} className="max-w-full max-h-[70vh] object-contain" />
          {showCropOverlay && canvasRef.current && (
            <CropOverlay canvasWidth={canvasRef.current.width} canvasHeight={canvasRef.current.height} onApplyCrop={handleApplyCrop} onCancel={() => setShowCropOverlay(false)} canvasRef={canvasRef} />
          )}
        </div>
        <div className="flex justify-between mt-8">
          <button onClick={onBack} className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold"><ArrowLeft className="inline w-5 h-5 mr-2"/> {t.photoEdit.back}</button>
          <button onClick={() => onNext(canvasRef.current?.toDataURL(), false)} className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold">{t.photoEdit.next} <ArrowRight className="inline w-5 h-5 ml-2"/></button>
        </div>
      </GlassCard>
    </div>
  );
}

// --- STEP 3: GALLERY ---
export function ObjectGalleryStep({ onSelectFromGallery, onUploadCustom, onBack }: any) {
  const { t } = useVisualizerLanguage();
  const GALLERY_OBJECTS = [
    { id: 'pool1', name: 'Klasični Pravokutni Bazen', imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80', thumbnail: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80', category: 'bazen' },
    { id: 'pool2', name: 'Moderni Bazen s Drvenom Terasom', imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', thumbnail: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', category: 'bazen' },
    { id: 'pool3', name: 'Elegantni Bazen s Pokrivačem', imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80', thumbnail: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80', category: 'bazen' },
    { id: 'pool4', name: 'Bijeli Rub Premium Bazen', imageUrl: 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800&q=80', thumbnail: 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=800&q=80', category: 'bazen' }
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative">
      <GlassCard className="w-full max-w-7xl p-8 relative z-10 max-h-[90vh] overflow-y-auto">
        <h1 className="text-3xl font-bold text-amber-300 mb-8">{t.objectGallery.galleryTitle}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {GALLERY_OBJECTS.map(obj => (
            <div key={obj.id} className="relative rounded-2xl overflow-hidden group cursor-pointer hover:ring-4 ring-amber-500 transition-all bg-black/20" onClick={() => onSelectFromGallery(obj)}>
              <img src={obj.thumbnail} alt={obj.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 w-full text-white font-bold text-sm">{obj.name}</div>
            </div>
          ))}
        </div>
        <div className="text-center my-6"><span className="text-white/50 px-4">ILI</span></div>
        <button onClick={onUploadCustom} className="w-full p-8 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center hover:bg-white/5">
          <Upload className="w-12 h-12 text-amber-400 mb-4" />
          <h3 className="text-xl font-bold text-white">{t.objectGallery.uploadCustomTitle}</h3>
        </button>
        <div className="mt-8"><button onClick={onBack} className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold"><ArrowLeft className="inline w-5 h-5 mr-2"/> Natrag</button></div>
      </GlassCard>
    </div>
  );
}

// --- STEP 4: UPLOAD & CROP (Combined for custom) ---
export function ObjectCropStep({ photo, spaceCropArea, onNext, onBack }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    const img = new Image(); img.src = photo;
    img.onload = () => {
      imgRef.current = img; const canvas = canvasRef.current; if (!canvas) return;
      canvas.width = img.width > 800 ? 800 : img.width; canvas.height = img.height > 600 ? 600 : img.height;
      const w = canvas.width, h = canvas.height;
      setPoints([{x: w*0.2, y: h*0.2}, {x: w*0.8, y: h*0.2}, {x: w*0.8, y: h*0.8}, {x: w*0.2, y: h*0.8}]);
    };
  }, [photo]);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imgRef.current) return;
    ctx.clearRect(0,0, canvas.width, canvas.height); ctx.drawImage(imgRef.current, 0,0, canvas.width, canvas.height);
    if (points.length === 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0,0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y); points.forEach(p => ctx.lineTo(p.x, p.y)); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      points.forEach(p => { ctx.fillStyle = '#F59E0B'; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill(); });
    }
  }, [points]);

  const handleCrop = () => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if(!canvas || !ctx || !imgRef.current) return;
    const out = document.createElement('canvas'); out.width = canvas.width; out.height = canvas.height;
    const octx = out.getContext('2d', { willReadFrequently: true });
    if(!octx) return; octx.drawImage(imgRef.current, 0,0, canvas.width, canvas.height);
    const idata = octx.getImageData(0,0, canvas.width, canvas.height); const data = idata.data;
    
    const isInside = (x:number, y:number) => {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        if ((points[i].y > y) !== (points[j].y > y) && x < (points[j].x - points[i].x) * (y - points[i].y) / (points[j].y - points[i].y) + points[i].x) inside = !inside;
      }
      return inside;
    };
    for(let y=0; y<canvas.height; y++) for(let x=0; x<canvas.width; x++) if(!isInside(x,y)) data[(y*canvas.width+x)*4+3] = 0;
    octx.putImageData(idata, 0,0);
    onNext(out.toDataURL('image/png'), points);
  };

  return (
    <div className="min-h-[80vh] flex flex-col p-6"><GlassCard className="p-8 max-w-4xl mx-auto w-full"><h2 className="text-3xl font-bold text-amber-300 mb-6">Izolirajte objekt</h2>
      <div className="relative inline-block w-full"><canvas ref={canvasRef} className="w-full bg-black/20 rounded-2xl border-2 border-white/10" /></div>
      <div className="flex justify-between mt-8"><button onClick={onBack} className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold">Natrag</button><button onClick={handleCrop} className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold">Završi i Dodaj</button></div>
    </GlassCard></div>
  );
}

// --- STEP 5: DESIGN CANVAS ---
export function DesignCanvasStep({ photo, objects, spaceCropCanvasSize, onUpdateObjects, onBack, onAddAnother, onFinish }: any) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const handleFinish = async () => {
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
    if(!ctx) return;
    canvas.width = spaceCropCanvasSize?.width || 800; canvas.height = spaceCropCanvasSize?.height || 600;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0, canvas.width, canvas.height);
    
    const bgImg = new Image(); bgImg.crossOrigin = 'anonymous'; bgImg.src = photo;
    await new Promise<void>(resolve => { bgImg.onload = () => { ctx.drawImage(bgImg, 0,0, canvas.width, canvas.height); resolve(); }});
    
    for(const obj of objects) {
      const objImg = new Image(); objImg.crossOrigin = 'anonymous'; objImg.src = obj.imageUrl;
      await new Promise<void>(resolve => { objImg.onload = () => { ctx.drawImage(objImg, obj.position.x, obj.position.y, obj.displayWidth, obj.displayHeight); resolve(); }});
    }
    onFinish(canvas.toDataURL('image/png'));
  };

  return (
    <div className="min-h-[80vh] p-6"><GlassCard className="p-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-amber-300">Dizajn Canvas</h1>
        <div className="flex gap-2"><button onClick={onAddAnother} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold"><Plus className="inline w-4 h-4 mr-2"/> Dodaj</button><button onClick={handleFinish} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"><Check className="inline w-4 h-4 mr-2"/> Završi</button></div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative border-2 border-white/10 rounded-2xl overflow-hidden bg-black/30" ref={canvasRef} style={{ aspectRatio: (spaceCropCanvasSize?.width||800)/(spaceCropCanvasSize?.height||600) }}>
          <img src={photo} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
          {objects.map((obj: any) => (
            <div key={obj.id} onClick={() => setSelectedObjectId(obj.id)} className={`absolute cursor-move border-2 ${selectedObjectId === obj.id ? 'border-amber-400' : 'border-transparent'}`} style={{ left: obj.position.x, top: obj.position.y, width: obj.displayWidth, height: obj.displayHeight }}>
               <img src={obj.imageUrl} className="w-full h-full object-fill" />
            </div>
          ))}
        </div>
        {selectedObjectId && (
          <div className="w-80 bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="font-bold text-white">Kontrole</h3>
            <button onClick={() => onUpdateObjects(objects.filter((o:any) => o.id !== selectedObjectId))} className="w-full px-4 py-2 bg-red-600 text-white rounded-xl font-bold flex justify-center items-center gap-2"><X className="w-4 h-4"/> Ukloni</button>
            <div className="space-y-2"><label className="text-white/70 text-sm">Veličina (%)</label><input type="range" min="50" max="200" defaultValue="100" onChange={(e) => {
               const val = Number(e.target.value);
               const obj = objects.find((o:any) => o.id === selectedObjectId);
               if(obj) { const newW = (250 * val)/100; const newH = newW / (obj.dimensions.width/obj.dimensions.height); onUpdateObjects(objects.map((o:any) => o.id===selectedObjectId ? {...o, displayWidth: newW, displayHeight: newH} : o)); }
            }} className="w-full"/></div>
          </div>
        )}
      </div>
    </GlassCard></div>
  );
}

// --- STEP 6: RESULTS ---
export function ResultsStep({ compositeImageUrl, originalPhotoUrl, onStartNew }: any) {
  const handleDownloadPDF = () => {
    const pdf = new jsPDF({ orientation: 'landscape' });
    pdf.setFontSize(20); pdf.text('MONDO ACQUA - Vizualizacija', 148, 15, { align: 'center' });
    pdf.addImage(compositeImageUrl, 'PNG', 15, 30, 267, 150);
    pdf.save(`vizualizacija-${Date.now()}.pdf`);
    toast.success('PDF uspješno preuzet!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6"><GlassCard className="w-full max-w-6xl p-8">
      <div className="text-center mb-10"><CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-4"/><h1 className="text-4xl font-bold text-amber-300">Vaš projekt je gotov!</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
         <div><h3 className="text-xl font-bold text-white mb-4 text-center">Prije</h3><img src={originalPhotoUrl} className="w-full rounded-2xl border-2 border-white/10 shadow-lg"/></div>
         <div><h3 className="text-xl font-bold text-amber-400 mb-4 text-center">Poslije</h3><img src={compositeImageUrl} className="w-full rounded-2xl border-4 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]"/></div>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <button onClick={handleDownloadPDF} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2"><Download className="w-5 h-5"/> Preuzmi PDF</button>
        <button onClick={onStartNew} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2"><HomeIcon className="w-5 h-5"/> Započni novi projekt</button>
      </div>
    </GlassCard></div>
  );
}

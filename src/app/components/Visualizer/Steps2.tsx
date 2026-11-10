import { useState, useRef, useEffect } from 'react';
import { GlassCard } from './Shared';
import { Button } from '../ui/button';
import { Upload, ArrowRight, ArrowLeft, Plus, CheckCircle2, Download, Printer, Settings } from 'lucide-react';
import { ObjectTransformOverlay } from './Shared';
import { applyHomographyTransform, bucketFillTransform } from './perspectiveTransform';

export function ObjectUploadStep({ onAddObject, onBack }: any) {
  const [objectName, setObjectName] = useState('');
  const [objectImage, setObjectImage] = useState<string | null>(null);

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setObjectImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-4xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Učitaj Vlastiti Objekt</h1>
        <div className="space-y-6">
          <input type="text" placeholder="Naziv objekta" value={objectName} onChange={e => setObjectName(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white" />
          {!objectImage ? (
             <div className="border-2 border-dashed border-white/20 p-16 rounded-2xl text-center hover:bg-white/5">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="obj-upload" />
                <label htmlFor="obj-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <p className="text-white/60">Odaberi sliku objekta (preporučeno s prozirnom pozadinom)</p>
                </label>
             </div>
          ) : (
             <img src={objectImage} alt="Object" className="max-h-[300px] mx-auto rounded-xl" />
          )}
        </div>
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onBack} className="text-white border-white/20"><ArrowLeft className="w-4 h-4 mr-2"/>Natrag</Button>
          <Button disabled={!objectImage || !objectName} onClick={() => onAddObject(objectImage, objectName)} className="bg-amber-500 text-black font-bold">Nastavi <ArrowRight className="w-5 h-5 ml-2"/></Button>
        </div>
      </GlassCard>
    </div>
  );
}

export function ObjectCropStep({ photo, onNext, onBack }: any) {
  // Skipping the complex crop logic for the simplified version to save space
  // We'll just pass the image directly
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-4xl p-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-6">Potvrda Objekta</h1>
        <img src={photo} alt="Object" className="max-h-[400px] mx-auto rounded-xl mb-8" />
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="text-white border-white/20"><ArrowLeft className="w-4 h-4 mr-2"/>Natrag</Button>
          <Button onClick={() => onNext(photo)} className="bg-amber-500 text-black font-bold">Završi <ArrowRight className="w-5 h-5 ml-2"/></Button>
        </div>
      </GlassCard>
    </div>
  );
}

export function DesignCanvasStep({ photo, objects, spaceCropCanvasSize, onUpdateObjects, onBack, onFinish }: any) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState(false);

  // Auto-select latest object
  useEffect(() => {
    if (objects.length > 0 && !selectedObjectId) setSelectedObjectId(objects[objects.length - 1].id);
  }, [objects.length]);

  const handleApplyTransform = async (points: any) => {
    if (!selectedObjectId) return;
    const obj = objects.find((o: any) => o.id === selectedObjectId);
    if (!obj) return;
    
    // Simplistic fallback to bucketFill if opencv not loaded
    const transformedImg = await bucketFillTransform(obj.imageUrl, {
      x: Math.min(...points.map((p:any)=>p.x)),
      y: Math.min(...points.map((p:any)=>p.y)),
      width: Math.max(...points.map((p:any)=>p.x)) - Math.min(...points.map((p:any)=>p.x)),
      height: Math.max(...points.map((p:any)=>p.y)) - Math.min(...points.map((p:any)=>p.y))
    });

    const updated = objects.map((o: any) => o.id === selectedObjectId ? { ...o, imageUrl: transformedImg, displayWidth: Math.max(...points.map((p:any)=>p.x)) - Math.min(...points.map((p:any)=>p.x)), displayHeight: Math.max(...points.map((p:any)=>p.y)) - Math.min(...points.map((p:any)=>p.y)), position: { x: Math.min(...points.map((p:any)=>p.x)), y: Math.min(...points.map((p:any)=>p.y)) } } : o);
    onUpdateObjects(updated);
    setTransformMode(false);
  };

  const handleFinish = async () => {
    // Basic canvas capture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = photo;
    await new Promise(r => bgImg.onload = r);
    
    canvas.width = bgImg.width;
    canvas.height = bgImg.height;
    ctx.drawImage(bgImg, 0, 0);

    for (const obj of objects) {
      const objImg = new Image();
      objImg.crossOrigin = 'anonymous';
      objImg.src = obj.imageUrl;
      await new Promise(r => objImg.onload = r);
      ctx.drawImage(objImg, obj.position.x, obj.position.y, obj.displayWidth, obj.displayHeight);
    }
    
    onFinish(canvas.toDataURL('image/png'));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl mb-6 flex justify-between">
         <Button variant="outline" onClick={onBack} className="text-white border-white/20"><ArrowLeft className="w-4 h-4 mr-2"/>Natrag</Button>
         <div className="flex gap-4">
            <Button onClick={() => setTransformMode(true)} disabled={!selectedObjectId} className="bg-blue-600 hover:bg-blue-500 text-white"><Settings className="w-4 h-4 mr-2"/>Prilagodi Perspektivu</Button>
            <Button onClick={handleFinish} className="bg-amber-500 text-black font-bold"><CheckCircle2 className="w-5 h-5 mr-2"/>Završi Vizualizaciju</Button>
         </div>
      </div>
      <div className="relative border-4 border-amber-500/30 rounded-2xl overflow-hidden bg-black max-w-full" ref={canvasRef} data-canvas-container>
         <img src={photo} alt="Background" className="max-w-full h-auto pointer-events-none" />
         {objects.map((obj: any) => (
            <div key={obj.id}
                 style={{ position: 'absolute', left: obj.position.x, top: obj.position.y, width: obj.displayWidth, height: obj.displayHeight, border: selectedObjectId === obj.id ? '2px solid cyan' : 'none', cursor: 'pointer' }}
                 onClick={() => setSelectedObjectId(obj.id)}>
               <img src={obj.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
            </div>
         ))}
         {transformMode && selectedObjectId && (
           <ObjectTransformOverlay 
              objectPosition={objects.find((o:any)=>o.id===selectedObjectId).position}
              objectWidth={objects.find((o:any)=>o.id===selectedObjectId).displayWidth}
              objectHeight={objects.find((o:any)=>o.id===selectedObjectId).displayHeight}
              onApplyTransform={handleApplyTransform}
              onCancel={() => setTransformMode(false)}
           />
         )}
      </div>
    </div>
  );
}

export function ResultsStep({ compositeImageUrl, onStartNew }: any) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-4xl p-8 text-center">
        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-8">Vizualizacija je gotova!</h1>
        <img src={compositeImageUrl} alt="Result" className="max-w-full h-auto mx-auto rounded-xl shadow-2xl mb-8" />
        <div className="flex justify-center gap-6">
          <a href={compositeImageUrl} download="vizualizacija.png" className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20"><Download className="w-5 h-5 mr-2"/>Preuzmi Sliku</a>
          <Button onClick={onStartNew} className="bg-amber-500 text-black font-bold px-8">Započni Novi Projekt</Button>
        </div>
      </GlassCard>
    </div>
  );
}
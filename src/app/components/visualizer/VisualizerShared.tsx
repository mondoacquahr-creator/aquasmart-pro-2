import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Check, ChevronRight, X, Sparkles, Lightbulb, Wand2, MessageSquare, Globe } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// --- TYPES ---
export interface RoomDimensions { width: number; height: number; depth: number; }
export interface ObjectDimensions { width: number; height: number; depth: number; }
export interface Line { id: string; x1: number; y1: number; x2: number; y2: number; }
export interface DesignObject {
  id: string; type: 'sauna' | 'jacuzzi' | 'custom' | 'bazen'; name: string; imageUrl: string;
  dimensions: ObjectDimensions; position: { x: number; y: number; }; scale: number;
  rotation: number; scaleX: number; scaleY: number; displayWidth?: number; displayHeight?: number;
  perspectivePoints?: Array<{x: number, y: number}>; transformedImageUrl?: string; zIndex?: number;
}
export interface ProjectData {
  projectType: 'interior' | 'exterior' | null; roomDimensions: RoomDimensions | null;
  roomPhoto: string | null; editedPhoto: string | null; boundaryLines: Line[];
  objects: DesignObject[]; spaceCropArea?: { x: number; y: number; width: number; height: number; };
}
export type ProjectType = 'interior' | 'exterior';

// --- THEME ---
export function getThemeColors(projectType: ProjectType) {
  const isExterior = projectType === 'exterior';
  return {
    bgGradient: isExterior ? 'bg-gradient-to-br from-sky-400 via-blue-600 to-blue-950' : 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950',
    bgOrb1: isExterior ? 'bg-amber-500/20' : 'bg-indigo-500/20',
    bgOrb2: isExterior ? 'bg-yellow-500/20' : 'bg-purple-500/20',
    iconGradient: isExterior ? 'from-amber-400 to-yellow-500' : 'from-indigo-500 to-purple-600',
    iconShadow: isExterior ? 'shadow-amber-500/50' : 'shadow-indigo-500/50',
    textGradient: isExterior ? 'from-amber-200 to-yellow-400' : 'from-white to-indigo-200',
    buttonGradient: isExterior ? 'from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500' : 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500',
    buttonShadow: isExterior ? 'shadow-amber-500/50 hover:shadow-amber-400/70' : 'shadow-indigo-500/50 hover:shadow-indigo-500/70',
    accentColor: isExterior ? 'amber' : 'indigo',
    accentLight: isExterior ? 'yellow' : 'purple',
    accentShadow: isExterior ? 'shadow-amber-500/50' : 'shadow-indigo-500/50',
    ringColor: isExterior ? 'ring-amber-500' : 'ring-indigo-500',
    borderColor: isExterior ? 'border-amber-500/40' : 'border-indigo-500',
  };
}

// --- TRANSLATIONS ---
export type Language = 'hr' | 'en' | 'de' | 'it';
export const translations: Record<Language, any> = {
  hr: {
    photoUpload: { title: 'Učitajte fotografiju prostora', description: 'Dodajte fotografiju dvorišta ili terase', uploadButton: 'Učitaj Fotografiju', dropzone: 'Kliknite ili povucite fotografiju ovdje', formats: 'PNG, JPG ili WEBP (maks. 10MB)', camera: 'Slikaj', changePhoto: 'Promijeni Fotografiju', next: 'Nastavi', back: 'Natrag' },
    photoEdit: { title: 'Uredite prostor', description: 'Označite područje za objekt', cropSpace: 'Označi prostor', cropDescription: 'Povucite točke', eraseObjects: 'Obriši objekte', eraseDescription: 'Uklonite neželjene objekte', brushSize: 'Veličina kista', reset: 'Resetiraj', apply: 'Primijeni', next: 'Nastavi', back: 'Natrag' },
    objectGallery: { poolTitle: 'Bazen Modeli', galleryTitle: 'Galerija Objekata', poolDescription: 'Odaberite idealan bazen', uploadCustomTitle: 'Uploadajte Vlastiti Objekt', uploadCustomDescription: 'Imate vlastitu fotografiju?', selected: 'Odabrano:', confirm: 'Potvrdi Odabir', or: 'ili', back: 'Natrag' },
    galleryObjects: { poolMondoAcqua1: 'Klasični Pravokutni Bazen', poolMondoAcqua2: 'Moderni Bazen s Drvenom Terasom', poolMondoAcqua3: 'Elegantni Bazen s Pokrivačem', poolMondoAcqua4: 'Bijeli Rub Premium Bazen', poolMondoAcqua5: 'Bazen s Pokrivačem', poolMondoAcqua7: 'Moderni Sivi Rub Bazen', poolMondoAcqua8: 'Vrtni Bazen s Drvenom Terasom' },
    objectUpload: { title: 'Učitajte fotografiju objekta', description: 'Dodajte fotografiju bazena', uploadButton: 'Učitaj Objekt', dropzone: 'Kliknite ili povucite fotografiju ovdje', formats: 'PNG, JPG ili WEBP', camera: 'Slikaj', saved: 'Spremi objekt', next: 'Nastavi', back: 'Natrag' },
    objectCrop: { title: 'Izolirajte objekt', description: 'Povucite točke da izrežete objekt', dragCorners: 'Povucite kutove', reset: 'Resetiraj', apply: 'Primijeni', next: 'Nastavi', back: 'Natrag' },
    designCanvas: { title: 'Dizajn i Transformacija', description: 'Vaš objekt je postavljen', addAnother: 'Dodaj Drugi Objekt', finish: 'Završi Projekt', back: 'Natrag', delete: 'Obriši' },
    results: { title: 'Projekt je Gotov!', subtitle: 'Preuzmite rezultat ili zatražite ponudu', before: 'Prije', after: 'Nakon', print: 'Ispiši', downloadPdf: 'Preuzmi PDF', sendOffer: 'Pošalji Upit', startNew: 'Počni Novi Projekt' },
    common: { or: 'ili' }
  },
  en: {
    photoUpload: { title: 'Upload Space Photo', description: 'Add a photo of your yard or terrace', uploadButton: 'Upload Photo', dropzone: 'Click or drag photo here', formats: 'PNG, JPG or WEBP', camera: 'Take Photo', changePhoto: 'Change Photo', next: 'Continue', back: 'Back' },
    photoEdit: { title: 'Edit Space', description: 'Mark the area for the object', cropSpace: 'Mark Space', cropDescription: 'Drag points', eraseObjects: 'Erase Objects', eraseDescription: 'Remove unwanted objects', brushSize: 'Brush Size', reset: 'Reset', apply: 'Apply', next: 'Continue', back: 'Back' },
    objectGallery: { poolTitle: 'Pool Models', galleryTitle: 'Object Gallery', poolDescription: 'Choose ideal pool', uploadCustomTitle: 'Upload Custom Object', uploadCustomDescription: 'Have your own photo?', selected: 'Selected:', confirm: 'Confirm', or: 'or', back: 'Back' },
    galleryObjects: { poolMondoAcqua1: 'Classic Rectangular Pool', poolMondoAcqua2: 'Modern Pool with Wooden Deck', poolMondoAcqua3: 'Elegant Pool with Cover', poolMondoAcqua4: 'White Edge Premium Pool', poolMondoAcqua5: 'Pool with Cover', poolMondoAcqua7: 'Modern Grey Edge Pool', poolMondoAcqua8: 'Garden Pool with Wooden Deck' },
    objectUpload: { title: 'Upload Object Photo', description: 'Add a photo of a pool', uploadButton: 'Upload Object', dropzone: 'Click or drag photo here', formats: 'PNG, JPG or WEBP', camera: 'Take Photo', saved: 'Save Object', next: 'Continue', back: 'Back' },
    objectCrop: { title: 'Isolate Object', description: 'Drag points to crop', dragCorners: 'Drag corners', reset: 'Reset', apply: 'Apply', next: 'Continue', back: 'Back' },
    designCanvas: { title: 'Design & Transform', description: 'Your object is placed', addAnother: 'Add Another', finish: 'Finish Project', back: 'Back', delete: 'Delete' },
    results: { title: 'Project Complete!', subtitle: 'Download result or request quote', before: 'Before', after: 'After', print: 'Print', downloadPdf: 'Download PDF', sendOffer: 'Send Quote Request', startNew: 'Start New Project' },
    common: { or: 'or' }
  },
  de: { photoUpload: { title: 'Laden Sie ein Foto hoch', description: '', uploadButton: 'Hochladen', dropzone: 'Hierher ziehen', formats: '', camera: 'Kamera', changePhoto: 'Ändern', next: 'Weiter', back: 'Zurück' }, photoEdit: { title: 'Raum bearbeiten', description: '', cropSpace: '', cropDescription: '', eraseObjects: '', eraseDescription: '', brushSize: '', reset: 'Reset', apply: 'Anwenden', next: 'Weiter', back: 'Zurück' }, objectGallery: { poolTitle: 'Pools', galleryTitle: 'Galerie', poolDescription: '', uploadCustomTitle: 'Eigene hochladen', uploadCustomDescription: '', selected: 'Ausgewählt:', confirm: 'Bestätigen', or: 'oder', back: 'Zurück' }, galleryObjects: { poolMondoAcqua1: 'Pool 1', poolMondoAcqua2: 'Pool 2', poolMondoAcqua3: 'Pool 3', poolMondoAcqua4: 'Pool 4', poolMondoAcqua5: 'Pool 5', poolMondoAcqua7: 'Pool 7', poolMondoAcqua8: 'Pool 8' }, objectUpload: { title: 'Objekt hochladen', description: '', uploadButton: 'Hochladen', dropzone: 'Hierher ziehen', formats: '', camera: 'Kamera', saved: '', next: 'Weiter', back: 'Zurück' }, objectCrop: { title: 'Objekt zuschneiden', description: '', dragCorners: '', reset: 'Reset', apply: 'Anwenden', next: 'Weiter', back: 'Zurück' }, designCanvas: { title: 'Design', description: '', addAnother: 'Noch eins', finish: 'Fertig', back: 'Zurück', delete: 'Löschen' }, results: { title: 'Fertig!', subtitle: '', before: 'Vorher', after: 'Nachher', print: 'Drucken', downloadPdf: 'PDF', sendOffer: 'Angebot', startNew: 'Neu' }, common: { or: 'oder' } },
  it: { photoUpload: { title: 'Carica foto', description: '', uploadButton: 'Carica', dropzone: 'Trascina qui', formats: '', camera: 'Macchina fotografica', changePhoto: 'Cambia', next: 'Avanti', back: 'Indietro' }, photoEdit: { title: 'Modifica', description: '', cropSpace: '', cropDescription: '', eraseObjects: '', eraseDescription: '', brushSize: '', reset: 'Reset', apply: 'Applica', next: 'Avanti', back: 'Indietro' }, objectGallery: { poolTitle: 'Piscine', galleryTitle: 'Galleria', poolDescription: '', uploadCustomTitle: 'Carica il tuo', uploadCustomDescription: '', selected: 'Selezionato:', confirm: 'Conferma', or: 'o', back: 'Indietro' }, galleryObjects: { poolMondoAcqua1: 'Piscina 1', poolMondoAcqua2: 'Piscina 2', poolMondoAcqua3: 'Piscina 3', poolMondoAcqua4: 'Piscina 4', poolMondoAcqua5: 'Piscina 5', poolMondoAcqua7: 'Piscina 7', poolMondoAcqua8: 'Piscina 8' }, objectUpload: { title: 'Carica oggetto', description: '', uploadButton: 'Carica', dropzone: 'Trascina qui', formats: '', camera: 'Macchina fotografica', saved: '', next: 'Avanti', back: 'Indietro' }, objectCrop: { title: 'Ritaglia', description: '', dragCorners: '', reset: 'Reset', apply: 'Applica', next: 'Avanti', back: 'Indietro' }, designCanvas: { title: 'Design', description: '', addAnother: 'Aggiungi un altro', finish: 'Finito', back: 'Indietro', delete: 'Elimina' }, results: { title: 'Finito!', subtitle: '', before: 'Prima', after: 'Dopo', print: 'Stampa', downloadPdf: 'PDF', sendOffer: 'Offerta', startNew: 'Nuovo' }, common: { or: 'o' } }
};

interface LanguageContextType { language: Language; setLanguage: (lang: Language) => void; t: any; }
export const VisualizerLanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function VisualizerLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('hr');
  const t = translations[language];
  return (
    <VisualizerLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </VisualizerLanguageContext.Provider>
  );
}

export function useVisualizerLanguage() {
  const context = useContext(VisualizerLanguageContext);
  if (!context) throw new Error('useVisualizerLanguage must be used within VisualizerLanguageProvider');
  return context;
}

// --- SHARED COMPONENTS ---
export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative bg-slate-900/80 rounded-3xl border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10 ${className}`}>
      {children}
    </div>
  );
}

export function LanguageSelector({ variant = 'app' }: { variant?: 'home' | 'app' }) {
  const { language, setLanguage } = useVisualizerLanguage();
  const LANGUAGES = [
    { code: 'hr' as Language, name: 'Hrvatski', flag: '🇭🇷' },
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it' as Language, name: 'Italiano', flag: '🇮🇹' },
  ];
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
        <Globe className="w-4 h-4 text-white/70" />
        <span className="text-sm font-medium text-white/90">{LANGUAGES.find(l => l.code === language)?.flag}</span>
      </button>
      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden bg-slate-900/95 backdrop-blur-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {LANGUAGES.map((lang) => (
          <button key={lang.code} onClick={() => setLanguage(lang.code)} className={`w-full px-4 py-3 flex items-center gap-3 transition-all ${language === lang.code ? 'bg-blue-500/20 text-white' : 'text-white/70 hover:bg-white/5'}`}>
            <span className="text-xl">{lang.flag}</span><span className="font-medium text-sm">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function StepNavigation({ currentStep, completedSteps, projectType = 'exterior', onNavigate }: { currentStep: string; completedSteps: string[]; projectType?: string; onNavigate: (s: string) => void }) {
  const steps = [
    { id: 'photo-upload', label: 'Učitaj prostor', number: 1 },
    { id: 'photo-edit', label: 'Uredi prostor', number: 2 },
    { id: 'object-gallery', label: 'Odaberi objekt', number: 3 },
    { id: 'object-crop', label: 'Prilagodi', number: 4 },
    { id: 'design-canvas', label: 'Dizajn', number: 5 },
  ];
  return (
    <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl">
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const isClickable = isCompleted && !isCurrent;
          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <button onClick={() => isClickable && onNavigate(step.id)} disabled={!isClickable} className={`flex items-center gap-3 ${isClickable ? 'cursor-pointer hover:scale-105 transition-transform' : 'opacity-70'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-amber-500 text-white ring-4' : 'bg-white/10 text-white/50'}`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs text-white/60">Korak {step.number}</div>
                  <div className={`text-sm font-semibold ${isCurrent ? 'text-white' : isCompleted ? 'text-green-300' : 'text-white/50'}`}>{step.label}</div>
                </div>
              </button>
              {index < steps.length - 1 && <ChevronRight className="w-5 h-5 text-white/30 mx-4" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- TRANSFORMS ---
export async function bucketFillTransform(sourceImageUrl: string, destRect: { x: number; y: number; width: number; height: number }): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = destRect.width;
        canvas.height = destRect.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');
        ctx.drawImage(img, 0, 0, destRect.width, destRect.height);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) { reject(error); }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = sourceImageUrl;
  });
}

// --- CROP OVERLAYS ---
export function CropOverlay({ canvasWidth, canvasHeight, onApplyCrop, onCancel, canvasRef }: any) {
  const [points, setPoints] = useState([
    { x: canvasWidth * 0.1, y: canvasHeight * 0.1 }, { x: canvasWidth * 0.9, y: canvasHeight * 0.1 },
    { x: canvasWidth * 0.9, y: canvasHeight * 0.9 }, { x: canvasWidth * 0.1, y: canvasHeight * 0.9 }
  ]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    if (canvasRef?.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) setOriginalImageData(ctx.getImageData(0, 0, canvasWidth, canvasHeight));
    }
  }, [canvasRef, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (!canvasRef?.current || !originalImageData) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(originalImageData, 0, 0);
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [points, canvasRef, originalImageData]);

  const handleApply = () => {
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    onApplyCrop(points, { x: minX, y: minY, width: maxX - minX, height: maxY - minY });
  };

  const handleMove = (x: number, y: number) => {
    if (draggingIndex === null) return;
    setPoints(prev => { const n = [...prev]; n[draggingIndex] = { x, y }; return n; });
  };

  return (
    <div className="absolute inset-0 pointer-events-auto z-50">
      <div className="absolute inset-0 bg-black/70 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 pointer-events-none w-full h-full" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} preserveAspectRatio="none">
          {points.map((p, i) => <line key={i} x1={p.x} y1={p.y} x2={points[(i+1)%4].x} y2={points[(i+1)%4].y} stroke="#F59E0B" strokeWidth="3" />)}
        </svg>
        {points.map((point, index) => {
          const canvas = document.querySelector('canvas');
          const rect = canvas?.getBoundingClientRect();
          const scaleX = rect ? rect.width / canvasWidth : 1;
          const scaleY = rect ? rect.height / canvasHeight : 1;
          return (
            <div key={index} className="absolute w-8 h-8 bg-amber-400 border-2 border-white rounded-full cursor-move transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto touch-none"
                 style={{ left: point.x * scaleX, top: point.y * scaleY }}
                 onPointerDown={() => setDraggingIndex(index)}
                 onPointerMove={(e) => {
                     if(draggingIndex === index && rect) {
                         const cx = (e.clientX - rect.left) / scaleX;
                         const cy = (e.clientY - rect.top) / scaleY;
                         handleMove(cx, cy);
                     }
                 }}
                 onPointerUp={() => setDraggingIndex(null)}
            />
          );
        })}
      </div>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto z-[2000]">
        <button onClick={onCancel} className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg flex items-center gap-2"><X className="w-4 h-4"/> Odustani</button>
        <button onClick={handleApply} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg flex items-center gap-2"><Check className="w-4 h-4"/> Primijeni</button>
      </div>
    </div>
  );
}

export function ObjectTransformOverlay({ objectPosition, objectWidth, objectHeight, objectRotation, onApplyTransform, onCancel }: any) {
  const [points, setPoints] = useState([
    { x: objectPosition.x, y: objectPosition.y },
    { x: objectPosition.x + objectWidth, y: objectPosition.y },
    { x: objectPosition.x + objectWidth, y: objectPosition.y + objectHeight },
    { x: objectPosition.x, y: objectPosition.y + objectHeight }
  ]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleApply = () => onApplyTransform(points);

  return (
    <div className="absolute inset-0 pointer-events-auto z-50">
      <div className="absolute inset-0 bg-black/70 pointer-events-none" />
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(255, 215, 0, 0.15)" stroke="#FFD700" strokeWidth="2" strokeDasharray="4" />
      </svg>
      {points.map((point, index) => (
        <div key={index} className="absolute w-8 h-8 bg-yellow-400 border-2 border-white rounded-full cursor-move transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto touch-none"
             style={{ left: point.x, top: point.y }}
             onPointerDown={() => setDraggingIndex(index)}
             onPointerMove={(e) => {
                 if(draggingIndex === index) {
                     const canvas = document.querySelector('[data-canvas-container]');
                     if(canvas) {
                         const rect = canvas.getBoundingClientRect();
                         const n = [...points]; n[index] = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                         setPoints(n);
                     }
                 }
             }}
             onPointerUp={() => setDraggingIndex(null)}
        />
      ))}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-[60]">
        <button onClick={onCancel} className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold">Odustani</button>
        <button onClick={handleApply} className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold">Primijeni</button>
      </div>
    </div>
  );
}

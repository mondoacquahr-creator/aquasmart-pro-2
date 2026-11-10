import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, ChevronLeft, RotateCcw, Download, Share2, Send, Loader2, Image as ImageIcon } from 'lucide-react';
import { getCatalog, visualize, sendInquiry } from '../lib/vizApi';
import type { Pool } from '../lib/vizApi';
import { T } from '../lib/theme';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface VisualizeResult {
  images: string[];
  remaining: number;
}

const SURROUNDS = [
  { key: 'keep', label: 'Zadrži postojeće' },
  { key: 'grass', label: 'Travnjak' },
  { key: 'deck', label: 'Drveni deck' },
  { key: 'stone', label: 'Kamen' },
];

const LOADING_TEXTS = [
  'AI slaže bazen u vašu parcelu…',
  'Usklađujemo perspektivu i sjene…',
  'Još samo trenutak…',
];

type Step = 1 | 2 | 3 | 4;

const cardStyle = { background: T.cardBg, border: T.cardBorder };
const errorStyle = { background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF3B30' };

export function AIVisualizer({ onManual }: { onManual: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoAspect, setPhotoAspect] = useState<number>(4 / 3);
  const [pools, setPools] = useState<Pool[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [surround, setSurround] = useState('keep');
  const [variants, setVariants] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [result, setResult] = useState<VisualizeResult | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [sliderValue, setSliderValue] = useState(50);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', email: '', location: '', note: '' });
  const [inquiryError, setInquiryError] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);

  // Step 3 drawing
  const imgRef = useRef<HTMLImageElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [liveRect, setLiveRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (step !== 2) return;
    setCatalogLoading(true);
    getCatalog()
      .then((data: any) => {
        const arr = Array.isArray(data) ? data : (data?.pools ?? []);
        setPools(arr.filter((p: Pool) => p.active !== false));
      })
      .catch(() => setPools([]))
      .finally(() => setCatalogLoading(false));
  }, [step]);

  useEffect(() => {
    if (!generating) return;
    const id = setInterval(() => setLoadingTextIdx(i => (i + 1) % LOADING_TEXTS.length), 3500);
    return () => clearInterval(id);
  }, [generating]);

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = maxDim / Math.max(width, height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        setPhotoAspect(width / height);
        setPhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
        setStep(2);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const getPosRelativeToImg = (e: React.PointerEvent) => {
    const el = imgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.min(Math.max(e.clientX - r.left, 0), r.width),
      y: Math.min(Math.max(e.clientY - r.top, 0), r.height),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const pos = getPosRelativeToImg(e);
    if (!pos) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = pos;
    setDragging(true);
    setLiveRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current) return;
    const pos = getPosRelativeToImg(e);
    if (!pos) return;
    setLiveRect({
      x: Math.min(dragStart.current.x, pos.x),
      y: Math.min(dragStart.current.y, pos.y),
      w: Math.abs(pos.x - dragStart.current.x),
      h: Math.abs(pos.y - dragStart.current.y),
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current) return;
    const pos = getPosRelativeToImg(e);
    if (pos) {
      const w = Math.abs(pos.x - dragStart.current.x);
      const h = Math.abs(pos.y - dragStart.current.y);
      if (w > 10 && h > 10) {
        setRect({
          x: Math.min(dragStart.current.x, pos.x),
          y: Math.min(dragStart.current.y, pos.y),
          w,
          h,
        });
      }
    }
    setDragging(false);
    setLiveRect(null);
    dragStart.current = null;
  };

  const handleGenerate = async () => {
    if (!photoUrl || !selectedPool || !rect) return;
    setGenError('');
    setGenerating(true);
    try {
      const img = new Image();
      img.src = photoUrl;
      await new Promise<void>(resolve => { img.onload = () => resolve(); });

      const renderedEl = imgRef.current!;
      const renderedBounds = renderedEl.getBoundingClientRect();
      const scaleX = img.naturalWidth / renderedBounds.width;
      const scaleY = img.naturalHeight / renderedBounds.height;

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const lw = Math.max(4, Math.round(img.naturalWidth * 0.006));
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = lw;
      ctx.strokeRect(rect.x * scaleX, rect.y * scaleY, rect.w * scaleX, rect.h * scaleY);

      const markedImage = canvas.toDataURL('image/jpeg', 0.9);
      const res = await visualize({ markedImage, poolId: selectedPool.id, surround, variants });
      setResult(res);
      setSelectedImage(res.images?.[0] ?? '');
      setStep(4);
    } catch (err: any) {
      setGenError(err.message || 'Greška pri generiranju vizualizacije.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = selectedImage;
    a.download = 'mondo-acqua-vizualizacija.png';
    a.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const blob = await fetch(selectedImage).then(r => r.blob());
        const file = new File([blob], 'mondo-acqua-vizualizacija.png', { type: 'image/png' });
        await navigator.share({ files: [file], title: 'Mondo Acqua vizualizacija bazena' });
        return;
      } catch {
        // fallback
      }
    }
    handleDownload();
  };

  const handleInquirySubmit = async () => {
    if (!inquiryForm.name.trim() || (!inquiryForm.phone.trim() && !inquiryForm.email.trim())) {
      setInquiryError('Upišite ime i telefon ili e-mail.');
      return;
    }
    setInquiryError('');
    setInquiryLoading(true);
    try {
      await sendInquiry({
        name: inquiryForm.name,
        phone: inquiryForm.phone,
        email: inquiryForm.email,
        location: inquiryForm.location,
        note: inquiryForm.note,
        poolId: selectedPool?.id,
        image: selectedImage,
      });
      setInquirySuccess(true);
    } catch (err: any) {
      setInquiryError(err.message || 'Greška pri slanju upita.');
    } finally {
      setInquiryLoading(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setPhotoUrl(null);
    setPhotoAspect(4 / 3);
    setSelectedPool(null);
    setRect(null);
    setResult(null);
    setSurround('keep');
    setVariants(2);
    setSliderValue(50);
    setShowInquiry(false);
    setInquirySuccess(false);
    setInquiryForm({ name: '', phone: '', email: '', location: '', note: '' });
    setGenError('');
  };

  const displayRect = liveRect || rect;

  return (
    <div className="min-h-screen" style={{ color: '#ffffff' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center flex-wrap">
          {['1 Fotografija', '2 Model bazena', '3 Mjesto', '4 Rezultat'].map((label, i) => {
            const stepNum = (i + 1) as Step;
            const active = step === stepNum;
            const done = step > stepNum;
            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <div className="h-px w-6 flex-shrink-0"
                    style={{ background: done ? T.cyan : 'rgba(255,255,255,0.1)' }} />
                )}
                <span
                  className="text-xs font-semibold whitespace-nowrap px-3 py-1 rounded-full"
                  style={{
                    background: active ? `${T.cyan}18` : done ? `${T.cyan}0A` : 'rgba(255,255,255,0.04)',
                    color: active ? T.cyan : done ? `${T.cyan}80` : 'rgba(255,255,255,0.3)',
                    border: `1px solid ${active ? `${T.cyan}66` : 'transparent'}`,
                  }}
                >
                  {label}
                </span>
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Step 1: Photo ── */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Fotografija parcele</h2>
            <p className="text-sm text-center" style={{ color: T.faint }}>
              Najbolje je slikati s visine očiju ili s terase, da se vidi cijeli prostor za bazen.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
                style={{ background: `${T.cyan}08`, border: `1px solid ${T.cyan}33` }}
              >
                <Camera className="w-10 h-10" style={{ color: T.cyan }} />
                <span className="font-semibold">Slikaj parcelu</span>
                <input
                  type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </label>
              <label
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
                style={cardStyle}
              >
                <Upload className="w-10 h-10" style={{ color: T.cyan }} />
                <span className="font-semibold">Učitaj fotografiju</span>
                <input
                  type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </label>
            </div>
          </div>
        )}

        {/* ── Step 2: Pool catalog ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep(1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <ChevronLeft className="w-5 h-5" style={{ color: T.cyan }} />
              </button>
              <h2 className="text-2xl font-bold">Odabir modela bazena</h2>
            </div>
            {catalogLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: T.cyan }} />
              </div>
            ) : pools.length === 0 ? (
              <div className="rounded-2xl p-8 text-center space-y-4" style={cardStyle}>
                <p style={{ color: T.muted }}>
                  Katalog bazena se priprema. U međuvremenu možete koristiti ručni način.
                </p>
                <button
                  onClick={onManual}
                  className="px-6 py-3 rounded-xl font-semibold transition-colors"
                  style={{ background: `${T.cyan}18`, color: T.cyan, border: `1px solid ${T.cyan}4D` }}
                >
                  Ručni način
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {pools.map(pool => (
                  <button
                    key={pool.id}
                    onClick={() => { setSelectedPool(pool); setStep(3); }}
                    className="rounded-2xl overflow-hidden text-left transition-all hover:scale-[1.02]"
                    style={{
                      background: T.cardBg,
                      border: selectedPool?.id === pool.id ? `2px solid ${T.cyan}` : T.cardBorder,
                    }}
                  >
                    <div className="w-full" style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                      {pool.images?.[0] ? (
                        <img src={pool.images[0]} alt={pool.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <ImageIcon className="w-8 h-8" style={{ color: T.faint }} />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm leading-tight">{pool.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: T.faint }}>{pool.dimensions}</p>
                      <p className="text-xs mt-0.5" style={{ color: T.faint }}>{pool.shape}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Mark location ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep(2)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <ChevronLeft className="w-5 h-5" style={{ color: T.cyan }} />
              </button>
              <h2 className="text-2xl font-bold">Označi mjesto bazena</h2>
            </div>
            <p className="text-sm" style={{ color: T.faint }}>
              Povucite prstom ili mišem da označite gdje treba biti bazen.
            </p>

            {/* Drawing area */}
            <div
              className="rounded-2xl overflow-hidden relative select-none cursor-crosshair"
              style={{ touchAction: 'none' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              <img
                ref={imgRef}
                src={photoUrl!}
                alt="Parcela"
                className="w-full block"
                style={{ userSelect: 'none', pointerEvents: 'none', display: 'block' }}
              />
              {displayRect && displayRect.w > 2 && displayRect.h > 2 && (
                <div
                  style={{
                    position: 'absolute',
                    left: displayRect.x,
                    top: displayRect.y,
                    width: displayRect.w,
                    height: displayRect.h,
                    border: `2px dashed ${T.cyan}`,
                    background: `${T.cyan}12`,
                    pointerEvents: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => { setRect(null); setLiveRect(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors"
                style={{ color: T.muted, background: 'rgba(255,255,255,0.04)' }}
              >
                <RotateCcw className="w-4 h-4" />
                Označi ponovno
              </button>
            </div>

            {/* Surroundings */}
            <div>
              <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: T.faint }}>OKOLIŠ</p>
              <div className="flex flex-wrap gap-2">
                {SURROUNDS.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSurround(s.key)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: surround === s.key ? `${T.cyan}18` : 'rgba(255,255,255,0.04)',
                      color: surround === s.key ? T.cyan : T.muted,
                      border: `1px solid ${surround === s.key ? `${T.cyan}66` : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div>
              <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: T.faint }}>BROJ VARIJANTI</p>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    onClick={() => setVariants(n)}
                    className="w-12 h-12 rounded-full text-sm font-bold transition-all"
                    style={{
                      background: variants === n ? `${T.cyan}18` : 'rgba(255,255,255,0.04)',
                      color: variants === n ? T.cyan : T.muted,
                      border: `1px solid ${variants === n ? `${T.cyan}66` : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {genError && (
              <div className="p-4 rounded-xl text-sm space-y-2" style={errorStyle}>
                <p>{genError}</p>
                {genError.includes('nije uključena') && (
                  <button onClick={onManual} className="underline text-sm" style={{ color: '#FF3B30' }}>
                    Koristi ručni način
                  </button>
                )}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!rect}
              className="w-full py-4 rounded-2xl font-semibold text-lg transition-all"
              style={rect
                ? { background: T.accent, color: '#000000', boxShadow: '0 8px 30px rgba(255,138,31,0.35)', cursor: 'pointer' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
              }
            >
              Izradi vizualizaciju
            </button>
          </div>
        )}

        {/* ── Step 4: Results ── */}
        {step === 4 && result && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep(3)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <ChevronLeft className="w-5 h-5" style={{ color: T.cyan }} />
              </button>
              <h2 className="text-2xl font-bold">Rezultat vizualizacije</h2>
            </div>

            {/* Thumbnails */}
            {result.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {result.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className="flex-shrink-0 rounded-xl overflow-hidden"
                    style={{
                      width: 80, height: 60,
                      border: selectedImage === img ? `2px solid ${T.cyan}` : '2px solid transparent',
                    }}
                  >
                    <img src={img} alt={`Varijanta ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Before/after slider */}
            <div className="rounded-2xl overflow-hidden" style={{ userSelect: 'none' }}>
              <div className="relative w-full" style={{ aspectRatio: String(photoAspect) }}>
                {/* Result behind */}
                <img
                  src={selectedImage}
                  alt="Vizualizacija"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Original clipped on left */}
                <img
                  src={photoUrl!}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
                />
                {/* Divider */}
                <div
                  className="absolute top-0 bottom-0"
                  style={{ left: `${sliderValue}%`, width: 2, background: T.cyan, transform: 'translateX(-50%)' }}
                >
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: T.cyan, boxShadow: `0 0 14px ${T.cyan}B3` }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M5 8H2M2 8L4 6M2 8L4 10M11 8H14M14 8L12 6M14 8L12 10" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                {/* Labels */}
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: 'rgba(0,0,0,0.65)', color: T.muted }}>Prije</span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-bold"
                  style={{ background: 'rgba(0,0,0,0.65)', color: T.cyan }}>Poslije</span>
              </div>
              <input
                type="range" min={0} max={100} value={sliderValue}
                onChange={e => setSliderValue(Number(e.target.value))}
                className="w-full mt-2"
                style={{ accentColor: T.cyan }}
              />
            </div>

            <p className="text-xs text-center" style={{ color: T.faint }}>
              Ilustracija – konačan izgled bazena izrađuje se prema projektu.
            </p>
            {result.remaining !== undefined && (
              <p className="text-xs text-center" style={{ color: T.faint }}>
                Preostalo danas: {result.remaining}
              </p>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: T.cardBorder }}
              >
                <Download className="w-4 h-4" />
                Preuzmi
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', border: T.cardBorder }}
              >
                <Share2 className="w-4 h-4" />
                Podijeli
              </button>
              <button
                onClick={() => setShowInquiry(v => !v)}
                className="col-span-2 py-4 rounded-xl font-bold text-base"
                style={{ background: T.accent, color: '#000', boxShadow: '0 8px 30px rgba(255,138,31,0.35)' }}
              >
                Zatraži ponudu
              </button>
              <button
                onClick={resetAll}
                className="col-span-2 py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'rgba(255,255,255,0.04)', color: T.muted }}
              >
                Nova vizualizacija
              </button>
            </div>

            {/* Inquiry form */}
            {showInquiry && (
              <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
                <h3 className="text-lg font-bold">Zatraži ponudu</h3>
                {inquirySuccess ? (
                  <p className="text-sm" style={{ color: '#2EFF88' }}>
                    Hvala! Mondo Acqua će vas kontaktirati s ponudom.
                  </p>
                ) : (
                  <>
                    {[
                      { key: 'name', label: 'Ime i prezime *', type: 'text' },
                      { key: 'phone', label: 'Telefon', type: 'tel' },
                      { key: 'email', label: 'E-mail', type: 'email' },
                      { key: 'location', label: 'Mjesto gradnje', type: 'text' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs font-semibold mb-1 block" style={{ color: T.faint }}>
                          {f.label}
                        </label>
                        <input
                          type={f.type}
                          value={(inquiryForm as any)[f.key]}
                          onChange={e => setInquiryForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl text-white"
                          style={{
                            background: T.inputBg,
                            border: T.inputBorder,
                            fontSize: '16px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: T.faint }}>
                        Napomena
                      </label>
                      <textarea
                        value={inquiryForm.note}
                        onChange={e => setInquiryForm(p => ({ ...p, note: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl text-white resize-none"
                        style={{
                          background: T.inputBg,
                          border: T.inputBorder,
                          fontSize: '16px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    {inquiryError && (
                      <div className="p-3 rounded-xl text-sm" style={errorStyle}>{inquiryError}</div>
                    )}
                    <button
                      onClick={handleInquirySubmit}
                      disabled={inquiryLoading}
                      className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                      style={{
                        background: T.accent,
                        color: '#000',
                        boxShadow: '0 8px 30px rgba(255,138,31,0.35)',
                        opacity: inquiryLoading ? 0.7 : 1,
                      }}
                    >
                      {inquiryLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      Pošalji upit
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generating overlay */}
      {generating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(2,13,18,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div className="text-center space-y-6 max-w-xs px-8">
            <div
              className="w-16 h-16 mx-auto rounded-full border-2 animate-spin"
              style={{ borderColor: `${T.cyan}40`, borderTopColor: T.cyan }}
            />
            <p className="text-lg font-semibold" style={{ color: T.cyan }}>
              {LOADING_TEXTS[loadingTextIdx]}
            </p>
            <p className="text-sm" style={{ color: T.faint }}>
              Obično traje 10–30 sekundi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

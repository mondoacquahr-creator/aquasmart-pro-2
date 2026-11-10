import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RotateCcw, Check, Image as ImageIcon } from 'lucide-react';
import { T } from '../lib/theme';
import { readTester, mapPoint, TEMPLATE, Quad, Point, TesterReading } from '../lib/testerReader';

// Očitavanje Multi Pooltestera kamerom: fotografija → poravnanje okvira → potvrda vrijednosti.

interface Props {
  onResult: (ph: number, cl: number) => void;
  onClose: () => void;
}

type Step = 'intro' | 'align' | 'result';
const MAX_SIDE = 1400;

class ScanErrorBoundary extends React.Component<{ onClose: () => void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err: any) { console.error('TesterScan error:', err); }
  render() {
    if (this.state.failed) {
      return (
        <Overlay onClose={this.props.onClose}>
          <p className="text-sm mb-4" style={{ color: T.muted }}>
            Očitavanje kamerom trenutno ne radi na ovom uređaju. Upišite vrijednosti ručno.
          </p>
          <button onClick={this.props.onClose} className="w-full py-3 rounded-xl font-semibold" style={{ background: T.accent, color: '#020D12' }}>
            Zatvori
          </button>
        </Overlay>
      );
    }
    return this.props.children;
  }
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 overflow-y-auto" style={{ background: 'rgba(2,13,18,0.92)' }}>
      <div className="relative w-full max-w-lg rounded-3xl p-5 my-4" style={{ background: '#06222C', border: T.cardBorder, boxShadow: T.cardShadow }}>
        <button onClick={onClose} aria-label="Zatvori" className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10">
          <X className="w-5 h-5" style={{ color: T.muted }} />
        </button>
        <h3 className="text-lg font-bold mb-3 pr-10">Očitaj Pooltester kamerom</h3>
        {children}
      </div>
    </div>
  );
}

function defaultQuad(w: number, h: number): Quad {
  const mx = w * 0.15, my = h * 0.3;
  return [{ x: mx, y: my }, { x: w - mx, y: my }, { x: w - mx, y: h - my }, { x: mx, y: h - my }];
}

function ScanInner({ onResult, onClose }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [quad, setQuad] = useState<Quad | null>(null);
  const [reading, setReading] = useState<TesterReading | null>(null);
  const [phText, setPhText] = useState('');
  const [clText, setClText] = useState('');
  const [error, setError] = useState('');
  const imgCanvas = useRef<HTMLCanvasElement | null>(null); // fotografija u punoj (smanjenoj) veličini
  const viewRef = useRef<HTMLCanvasElement>(null);           // prikaz s okvirom
  const dragRef = useRef<number | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const loadFile = (file?: File | null) => {
    if (!file) return;
    setError('');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      const ctx = c.getContext('2d');
      if (!ctx) { setError('Fotografiju nije moguće obraditi.'); return; }
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      imgCanvas.current = c;
      setQuad(defaultQuad(c.width, c.height));
      setStep('align');
    };
    img.onerror = () => { setError('Fotografiju nije moguće otvoriti. Pokušajte ponovno.'); URL.revokeObjectURL(url); };
    img.src = url;
  };

  // Crtanje fotografije, okvira i polja koja se mjere.
  useEffect(() => {
    if (step !== 'align' || !quad || !imgCanvas.current || !viewRef.current) return;
    const src = imgCanvas.current;
    const view = viewRef.current;
    const width = view.parentElement ? view.parentElement.clientWidth : 360;
    const s = width / src.width;
    view.width = Math.round(src.width * s);
    view.height = Math.round(src.height * s);
    const ctx = view.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(src, 0, 0, view.width, view.height);
    const P = (p: Point) => ({ x: p.x * s, y: p.y * s });
    const q = quad.map(P) as Quad;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#5CE1E6';
    ctx.beginPath();
    q.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.stroke();

    const box = (u0: number, u1: number, v: number, color: string) => {
      const pts = [mapPoint(q, u0, v - TEMPLATE.rowHalf), mapPoint(q, u1, v - TEMPLATE.rowHalf), mapPoint(q, u1, v + TEMPLATE.rowHalf), mapPoint(q, u0, v + TEMPLATE.rowHalf)];
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.stroke();
    };
    TEMPLATE.rows.forEach((v) => {
      box(TEMPLATE.phWindow[0], TEMPLATE.phWindow[1], v, '#FFFFFF');
      box(TEMPLATE.phBar[0], TEMPLATE.phBar[1], v, '#FFD60A');
      box(TEMPLATE.clBar[0], TEMPLATE.clBar[1], v + 0.012, '#FFD60A');
      box(TEMPLATE.clWindow[0], TEMPLATE.clWindow[1], v + 0.012, '#FFFFFF');
    });

    q.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(92,225,230,0.35)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#5CE1E6';
      ctx.stroke();
    });
  }, [step, quad]);

  const toImage = (e: React.PointerEvent<HTMLCanvasElement>): Point | null => {
    const view = viewRef.current, src = imgCanvas.current;
    if (!view || !src) return null;
    const r = view.getBoundingClientRect();
    const s = src.width / r.width;
    return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!quad) return;
    const p = toImage(e); if (!p) return;
    const view = viewRef.current!, src = imgCanvas.current!;
    const touch = 34 * (src.width / view.getBoundingClientRect().width);
    let best = -1, bestD = Infinity;
    quad.forEach((c, i) => { const d = Math.hypot(c.x - p.x, c.y - p.y); if (d < bestD) { bestD = d; best = i; } });
    if (bestD <= touch) {
      dragRef.current = best;
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    }
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current === null || !quad || !imgCanvas.current) return;
    const p = toImage(e); if (!p) return;
    const src = imgCanvas.current;
    const next = [...quad] as Quad;
    next[dragRef.current] = { x: Math.max(0, Math.min(src.width - 1, p.x)), y: Math.max(0, Math.min(src.height - 1, p.y)) };
    setQuad(next);
  };
  const onUp = () => { dragRef.current = null; };

  const doRead = () => {
    const src = imgCanvas.current;
    if (!src || !quad) return;
    const ctx = src.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, src.width, src.height).data;
    const w = src.width, h = src.height;
    const get = (x: number, y: number): [number, number, number] => {
      const cx = Math.max(0, Math.min(w - 1, x)), cy = Math.max(0, Math.min(h - 1, y));
      const i = (cy * w + cx) * 4;
      return [data[i], data[i + 1], data[i + 2]];
    };
    const r = readTester(get, quad);
    setReading(r);
    setPhText(r.ph.toFixed(1));
    setClText(r.cl.toFixed(1));
    setStep('result');
  };

  const confirm = () => {
    const ph = parseFloat(phText.replace(',', '.'));
    const cl = parseFloat(clText.replace(',', '.'));
    if (!Number.isFinite(ph) || ph < 6 || ph > 9) { setError('Upišite pH između 6 i 9.'); return; }
    if (!Number.isFinite(cl) || cl < 0 || cl > 10) { setError('Upišite klor između 0 i 10 mg/l.'); return; }
    onResult(Math.round(ph * 10) / 10, Math.round(cl * 10) / 10);
  };

  const inputStyle = { background: T.inputBg, border: T.inputBorder, fontSize: '16px', outline: 'none', color: '#fff' };

  return (
    <Overlay onClose={onClose}>
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { loadFile(e.target.files?.[0]); e.target.value = ''; }} />
      <input ref={galleryInput} type="file" accept="image/*" className="hidden" onChange={(e) => { loadFile(e.target.files?.[0]); e.target.value = ''; }} />

      {step === 'intro' && (
        <div className="space-y-4">
          <ol className="text-sm space-y-2 list-decimal pl-5" style={{ color: T.muted }}>
            <li>Otopite tablete do kraja (lijevo Phenol Red za pH, desno DPD za klor).</li>
            <li>Slikajte odmah, jer boja klora s vremenom blijedi.</li>
            <li>Tester držite ravno, sprijeda, uz svijetlu pozadinu i bez izravnog sunca.</li>
            <li>Na fotografiji moraju biti vidljiva sva polja s brojevima i obje skale.</li>
          </ol>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => cameraInput.current?.click()} className="py-3 rounded-xl font-semibold flex items-center justify-center gap-2" style={{ background: T.accent, color: '#020D12' }}>
              <Camera className="w-5 h-5" /> Slikaj
            </button>
            <button onClick={() => galleryInput.current?.click()} className="py-3 rounded-xl font-semibold flex items-center justify-center gap-2" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
              <ImageIcon className="w-5 h-5" /> Iz galerije
            </button>
          </div>
        </div>
      )}

      {step === 'align' && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: T.muted }}>
            Povucite 4 kružića na kutove skale: gore lijevo na vrh polja 8,2, gore desno na vrh polja 3,0, a dolje na dno polja 6,8 i 0,1. Bijeli okviri trebaju pasti u polja s brojevima, a žuti na obojene trake.
          </p>
          <div className="w-full rounded-xl overflow-hidden" style={{ touchAction: 'none' }}>
            <canvas
              ref={viewRef}
              className="block w-full"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setStep('intro')} className="py-3 rounded-xl font-semibold flex items-center justify-center gap-2" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
              <RotateCcw className="w-4 h-4" /> Nova slika
            </button>
            <button onClick={doRead} className="py-3 rounded-xl font-semibold flex items-center justify-center gap-2" style={{ background: T.accent, color: '#020D12' }}>
              <Check className="w-4 h-4" /> Očitaj
            </button>
          </div>
        </div>
      )}

      {step === 'result' && reading && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: T.muted }}>Provjerite vrijednosti i po potrebi ih ispravite prema testeru.</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold" style={{ color: T.faint }}>pH</span>
              <input value={phText} onChange={(e) => setPhText(e.target.value)} inputMode="decimal" className="w-full mt-1 px-4 py-3 rounded-xl text-lg font-bold" style={inputStyle} />
              {!reading.phSure && <span className="text-xs mt-1 block" style={{ color: '#FFB020' }}>Nesigurno – provjerite</span>}
            </label>
            <label className="block">
              <span className="text-xs font-semibold" style={{ color: T.faint }}>Slobodni klor (mg/l)</span>
              <input value={clText} onChange={(e) => setClText(e.target.value)} inputMode="decimal" className="w-full mt-1 px-4 py-3 rounded-xl text-lg font-bold" style={inputStyle} />
              {!reading.clSure && <span className="text-xs mt-1 block" style={{ color: '#FFB020' }}>Nesigurno – provjerite</span>}
              {reading.clSure && reading.cl <= 0.2 && <span className="text-xs mt-1 block" style={{ color: T.faint }}>0,1 ili manje</span>}
              {reading.clSure && reading.cl >= 2 && <span className="text-xs mt-1 block" style={{ color: T.faint }}>2,0 ili više</span>}
            </label>
          </div>
          <p className="text-xs" style={{ color: T.faint }}>
            Očitanje s fotografije je procjena na razini jednog polja skale. Ako vrijednost ne odgovara onome što vidite na testeru, upišite svoju.
          </p>
          {error && <p className="text-sm" style={{ color: '#FF3B30' }}>{error}</p>}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setStep('align')} className="py-3 rounded-xl font-semibold" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
              Natrag
            </button>
            <button onClick={confirm} className="py-3 rounded-xl font-semibold" style={{ background: T.accent, color: '#020D12' }}>
              Koristi vrijednosti
            </button>
          </div>
        </div>
      )}

      {error && step !== 'result' && <p className="text-sm mt-3" style={{ color: '#FF3B30' }}>{error}</p>}
    </Overlay>
  );
}

export function TesterScan(props: Props) {
  return (
    <ScanErrorBoundary onClose={props.onClose}>
      <ScanInner {...props} />
    </ScanErrorBoundary>
  );
}

// Gumb koji otvara očitavanje; ista veličina i stil u obje analize.
export function TesterScanButton({ onResult }: { onResult: (ph: number, cl: number) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
        style={{ background: 'rgba(92,225,230,0.1)', border: '1px solid rgba(92,225,230,0.35)', color: '#5CE1E6' }}
      >
        <Camera className="w-5 h-5" />
        Očitaj Pooltester kamerom (pH i klor)
      </button>
      {open && (
        <TesterScan
          onClose={() => setOpen(false)}
          onResult={(ph, cl) => { onResult(ph, cl); setOpen(false); }}
        />
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { WifiOff, UploadCloud, AlertTriangle, X } from 'lucide-react';
import { subscribe, flush, clearRejected, type OutboxState } from '../lib/outbox';
import { subscribePhotos, flushPhotos } from '../lib/photoOutbox';

// Mala oznaka stanja slanja u Pro portalu: nema signala, izmjene čekaju, izmjene odbijene.
const izmjena = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'izmjena' : 'izmjene');

export function OutboxBadge() {
  const [s, setS] = useState<OutboxState | null>(null);
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState(0);
  useEffect(() => subscribe(setS), []);
  useEffect(() => subscribePhotos(setPhotos), []);
  if (!s) return null;

  const showRejected = s.rejected.length > 0;
  const total = s.pending + photos;
  if (s.online && total === 0 && !showRejected) return null;
  const what = [s.pending ? `${s.pending} ${izmjena(s.pending)}` : '', photos ? `${photos} ${photos === 1 ? 'fotka' : photos < 5 ? 'fotke' : 'fotki'}` : ''].filter(Boolean).join(' + ');

  let icon = <UploadCloud className="w-4 h-4" />;
  let text = '';
  let color = '#4FC3F0';
  const onlyMerged = s.rejected.every(r => r.kind === 'merged');
  if (showRejected && total === 0) {
    icon = <AlertTriangle className="w-4 h-4" />;
    color = onlyMerged ? '#FFD27A' : '#FF8A80';
    text = onlyMerged ? 'Izmjene su spojene – provjerite' : `${s.rejected.length} ${izmjena(s.rejected.length)} nije spremljeno`;
  } else if (!s.online) {
    icon = <WifiOff className="w-4 h-4" />;
    color = '#FFD27A';
    text = total > 0 ? `Nema signala · čeka: ${what}` : 'Nema signala · spremam na mobitel';
  } else {
    text = s.sending ? `Šaljem: ${what}…` : `Čeka slanje: ${what}`;
  }

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-[70]" style={{ top: 'calc(76px + env(safe-area-inset-top, 0px))' }}>
      <button
        type="button"
        onClick={() => (showRejected ? setOpen(o => !o) : (flush(), flushPhotos()))}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap"
        style={{ background: 'rgba(4,24,32,0.95)', border: `1px solid ${color}55`, color }}
      >
        {icon}
        <span>{text}</span>
      </button>
      {open && showRejected && (
        <div className="mt-2 w-[min(92vw,360px)] rounded-2xl p-4 text-xs shadow-2xl" style={{ background: '#06202c', border: '1px solid rgba(255,138,128,0.35)', color: 'rgba(255,255,255,0.85)' }}>
          <div className="flex items-center justify-between mb-2">
            <strong style={{ color: '#fff' }}>{onlyMerged ? 'Spojene izmjene' : 'Obavijesti o slanju'}</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Zatvori"><X className="w-4 h-4" /></button>
          </div>
          <ul className="space-y-2">
            {s.rejected.map((r, i) => (
              <li key={i}><b>{({ 'work-orders': 'Nalog', clients: 'Klijent', warehouse: 'Skladište', pools: 'Bazen', analyses: 'Analiza' } as Record<string, string>)[r.resource] || r.resource} #{r.id}</b>: {r.reason}</li>
            ))}
          </ul>
          <button type="button" onClick={() => { clearRejected(); setOpen(false); }} className="mt-3 underline">U redu, sakrij</button>
        </div>
      )}
    </div>
  );
}

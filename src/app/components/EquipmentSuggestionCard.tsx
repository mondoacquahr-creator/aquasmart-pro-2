import { CheckCircle, ShoppingCart, Wrench } from 'lucide-react';
import { parseDimensions, suggestEquipment } from '../lib/poolSizing';
import { addToCart, useCart } from '../lib/mondoShop';
import type { EquipmentProduct } from '../lib/vagnerEquipment';
import { T } from '../lib/theme';

// Okvirni prijedlog opreme za odabrani model bazena (vizualizator).
const fmt = (n: number) => n.toFixed(2).replace('.', ',') + ' €';
const fmtNum = (n: number) => String(n).replace('.', ',');

export function EquipmentSuggestionCard({ dimensions, shape, onOpenShop }: { dimensions: string; shape?: string; onOpenShop?: () => void }) {
  const cart = useCart();
  const dims = parseDimensions(dimensions);
  if (!dims) return null;
  dims.oval = /oval/i.test(shape || '');
  const s = suggestEquipment(dims);

  const Row = ({ p, note }: { p: EquipmentProduct; note?: string }) => {
    const inCart = cart.items.some((i) => i.productId === p.id);
    return (
      <div className="flex items-start justify-between gap-3 py-2.5" style={{ borderTop: '1px solid rgba(120,220,255,0.08)' }}>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-tight">{p.name}</p>
          <p className="text-xs mt-0.5" style={{ color: T.faint }}>{p.size}{note ? ` · ${note}` : ''}</p>
          <p className="text-xs mt-0.5 font-semibold" style={{ color: T.cyan }}>{fmt(p.priceEUR)}</p>
        </div>
        {inCart ? (
          <span className="flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: '#2EFF88' }}><CheckCircle className="w-4 h-4" /> U košarici</span>
        ) : (
          <button onClick={() => addToCart(p.id, 1)} className="shrink-0 flex items-center gap-1.5 text-black px-3 py-1.5 rounded-lg font-semibold text-xs" style={{ background: T.accent }}>
            <ShoppingCart className="w-3 h-3" /> Dodaj
          </button>
        )}
      </div>
    );
  };

  const filtrationTotal = s.filtration.items.reduce((sum, p) => sum + p.priceEUR, 0);

  return (
    <div className="rounded-2xl p-5" style={{ background: T.cardBg, border: T.cardBorder }}>
      <p className="text-sm font-bold text-white flex items-center gap-2"><Wrench className="w-4 h-4" style={{ color: T.cyan }} /> Prijedlog opreme za ovaj bazen</p>
      <p className="text-xs mt-1 mb-3" style={{ color: T.muted }}>
        Volumen vode oko <strong className="text-white">{fmtNum(s.volume)} m³</strong>. Za čistu vodu cijeli volumen treba proći kroz filter za oko 5 sati,
        pa je potreban protok oko <strong className="text-white">{fmtNum(s.flow)} m³/h</strong>.
      </p>

      <p className="text-xs font-semibold uppercase tracking-wider mt-2" style={{ color: T.faint }}>Filtracija</p>
      {s.filtration.items.length ? (
        <>
          {s.filtration.items.map((p) => <Row key={p.id} p={p} />)}
          {s.filtration.sandKg && <p className="text-xs pb-2" style={{ color: T.muted }}>Uz filter je potrebno oko {s.filtration.sandKg} kg filterskog punjenja (kvarcni pijesak ili staklo).</p>}
          {s.filtration.items.length > 1 && <p className="text-xs pb-1 text-right" style={{ color: T.muted }}>Filtracija ukupno: <strong className="text-white">{fmt(filtrationTotal)}</strong></p>}
        </>
      ) : (
        <p className="text-sm py-2" style={{ color: T.muted }}>{s.filtration.label}.</p>
      )}

      {s.efficientPump && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider mt-3" style={{ color: T.faint }}>Štedljivija pumpa (umjesto obične)</p>
          <Row p={s.efficientPump} note="regulacija brzine, manja potrošnja struje" />
        </>
      )}

      <p className="text-xs font-semibold uppercase tracking-wider mt-3" style={{ color: T.faint }}>Dezinfekcija – jedno od ovoga</p>
      {s.electrolysis && <Row p={s.electrolysis} note="klor iz soli" />}
      {s.dosing && <Row p={s.dosing} note="automatsko doziranje pH i klora" />}

      <p className="text-xs mt-3 leading-relaxed" style={{ color: T.faint }}>
        Okvirni prijedlog prema dimenzijama modela. Konačan odabir ovisi o izvedbi (skimer ili preljev), duljini cijevi i mjestu strojarnice – potvrđuje ga Mondo Acqua.
      </p>
      {onOpenShop && cart.items.length > 0 && (
        <button onClick={onOpenShop} className="mt-3 w-full py-3 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2" style={{ background: T.accent }}>
          <ShoppingCart className="w-4 h-4" /> Otvori košaricu
        </button>
      )}
    </div>
  );
}

import { CheckCircle, ShoppingCart, Repeat } from 'lucide-react';
import { calculateAlternativeCost } from '../lib/productPrices';
import { addToCart, useCart } from '../lib/mondoShop';
import { T } from '../lib/theme';

// Zamjenski oblik proizvoda (npr. tekući pH Minus umjesto granula) – kupac bira što mu više odgovara.
export function AlternativeProducts({ recommendations }: { recommendations: any[] }) {
  const cart = useCart();
  const alts = calculateAlternativeCost(recommendations).filter((i) => i.product.id !== 'unknown');
  if (!alts.length) return null;
  const recFor = (name: string) =>
    (recommendations || []).find((r: any) => String(r?.productName || '').replace(/\s*\(alternativa\)/i, '') === name);

  return (
    <div className="rounded-2xl p-5 mt-4" style={{ background: 'rgba(10,40,52,0.4)', border: T.cardBorder }}>
      <p className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
        <Repeat className="w-4 h-4" style={{ color: T.cyan }} />
        Umjesto granula možete uzeti tekući proizvod
      </p>
      <p className="text-xs mb-3" style={{ color: T.faint }}>Koristite jedno ili drugo, ne oboje.</p>
      <div className="space-y-3">
        {alts.map((item, idx) => {
          const rec = recFor(item.productType) as any;
          const inCart = cart.items.find((c) => c.productId === item.product.id);
          return (
            <div key={item.product.id + idx} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white leading-tight">{item.product.name}</div>
                <div className="text-xs mt-0.5" style={{ color: T.faint }}>{item.product.size} · €{item.product.priceEUR.toFixed(2)}</div>
                {rec?.dosage && <div className="text-xs mt-1 font-medium" style={{ color: T.cyan }}>Potrebno: {rec.dosage}</div>}
                {rec?.instructions && <div className="text-xs mt-1 leading-relaxed" style={{ color: T.muted }}>{rec.instructions}</div>}
              </div>
              {inCart ? (
                <span className="flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: '#2EFF88' }}>
                  <CheckCircle className="w-4 h-4" /> U košarici
                </span>
              ) : (
                <button
                  onClick={() => addToCart(item.product.id, item.quantity)}
                  className="shrink-0 flex items-center gap-1.5 text-black px-3 py-1.5 rounded-lg font-semibold text-xs hover:opacity-90"
                  style={{ background: T.accent }}
                >
                  <ShoppingCart className="w-3 h-3" /> Dodaj
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

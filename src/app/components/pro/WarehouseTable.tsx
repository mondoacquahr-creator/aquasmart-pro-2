import { useMemo } from 'react';
import { Trash2, Warehouse as WarehouseIcon } from 'lucide-react';

// Skladište: stanje, minimalna zaliha i koliko je izdano po nalozima ovaj mjesec.
export interface WItem { id: number | string; name: string; stock: number; unit: string; minStock: number; category?: string; code?: string; price?: number; }
interface UsedOrder { status?: string; dueDate?: string; completedAt?: string | null; productsUsed?: { productName: string; quantity: number }[] }

const fmt = (n: number) => (Math.round(n * 100) / 100).toLocaleString('hr-HR');

export function WarehouseTable({ items, orders, title, actions, onDelete, rowActions }: {
  items: WItem[]; orders: UsedOrder[]; title?: string; actions?: React.ReactNode;
  onDelete?: (id: WItem['id']) => void; rowActions?: (item: WItem) => React.ReactNode;
}) {
  const month = new Date().toISOString().slice(0, 7);
  const issued = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of orders) {
      const when = String(o.completedAt || o.dueDate || '');
      if (!when.startsWith(month)) continue;
      for (const p of o.productsUsed || []) {
        const k = String(p.productName || '').trim().toLowerCase();
        if (k) m.set(k, (m.get(k) || 0) + (Number(p.quantity) || 0));
      }
    }
    return m;
  }, [orders, month]);

  const low = items.filter(i => Number(i.stock) < Number(i.minStock)).length;
  const sorted = [...items].sort((a, b) =>
    (Number(b.stock) < Number(b.minStock) ? 1 : 0) - (Number(a.stock) < Number(a.minStock) ? 1 : 0) || a.name.localeCompare(b.name, 'hr'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">{title || 'Skladište'}</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {items.length} artikala{low ? ` · ${low} ispod minimalne zalihe` : ''}
          </p>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <WarehouseIcon className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>Skladište je prazno. Dodajte artikle ručno ili ih uvezite iz Excela.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(8,30,40,0.6)', border: '1px solid rgba(120,220,255,0.12)' }}>
          <div className="hidden sm:grid grid-cols-[1.6fr_.7fr_.6fr_.6fr_.7fr_auto] gap-3 px-4 py-3 text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <span>Proizvod</span><span>Šifra</span><span className="text-right">Stanje</span><span className="text-right">Minimum</span><span className="text-right">Izdano ovaj mj.</span><span />
          </div>
          {sorted.map(item => {
            const isLow = Number(item.stock) < Number(item.minStock);
            const out = issued.get(item.name.trim().toLowerCase()) || 0;
            return (
              <div key={item.id} className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1.6fr_.7fr_.6fr_.6fr_.7fr_auto] gap-x-3 gap-y-1 items-center px-4 py-3"
                style={{ borderTop: '1px solid rgba(120,220,255,0.07)', background: isLow ? 'rgba(232,180,90,0.07)' : undefined, boxShadow: isLow ? 'inset 3px 0 0 #E8B45A' : undefined }}>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-white truncate">{item.name}</p>
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {item.category}{item.price !== undefined ? ` · ${item.price.toFixed(2).replace('.', ',')} €` : ''}
                    <span className="sm:hidden">{item.code ? ` · ${item.code}` : ''}{out ? ` · izdano ${fmt(out)} ${item.unit}` : ''}</span>
                  </p>
                </div>
                <span className="hidden sm:block text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.code || '—'}</span>
                <div className="text-right sm:contents">
                  <span className="sm:text-right font-bold text-sm" style={{ color: isLow ? '#F0C983' : '#fff' }}>{fmt(Number(item.stock))} <span className="font-normal text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.unit}</span></span>
                  <span className="block sm:inline text-[11px] sm:text-sm sm:text-right" style={{ color: 'rgba(255,255,255,0.5)' }}><span className="sm:hidden">min </span>{fmt(Number(item.minStock))}{isLow ? <span className="sm:hidden" style={{ color: '#F0C983' }}> · naruči</span> : null}</span>
                  <span className="hidden sm:block text-right text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{out ? fmt(out) : '—'}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {isLow && <span className="hidden sm:inline text-[11px] font-semibold" style={{ color: '#F0C983' }}>naruči</span>}
                  {rowActions?.(item)}
                  {onDelete && (
                    <button onClick={() => onDelete(item.id)} aria-label="Obriši artikl" className="p-2 rounded-lg hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4 text-red-500" style={{ opacity: 0.7 }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

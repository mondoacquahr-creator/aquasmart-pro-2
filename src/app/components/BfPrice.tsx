import React from 'react';
import { T } from '../lib/theme';
import { bfPrice, bfSlotsLeft, BF_SLOTS_TOTAL, memberPrice } from '../lib/mondoShop';

// Black Friday prikaz cijene: redovna – članska – Black Friday za prvih 20 novih članova.
const fmt = (v: number) => v.toFixed(2).replace('.', ',') + ' €';

export function BfPrice({ product, care = false, size = 22, align = 'right' }: {
  product: { id: string; category: string; priceEUR: number };
  care?: boolean;
  size?: number;
  align?: 'left' | 'right';
}) {
  const bf = bfPrice(product, true);
  if (bf == null) return null;
  const row = `flex items-baseline gap-2 ${align === 'right' ? 'justify-end' : ''}`;
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div className={row}>
        <span className="text-[11px]" style={{ color: T.faint }}>Redovna</span>
        <span className="text-[13px] line-through" style={{ color: T.faint }}>{fmt(product.priceEUR)}</span>
      </div>
      <div className={row}>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>Članska</span>
        <span className="text-[15px] font-semibold text-white">{fmt(memberPrice(product.priceEUR, care, product.id))}</span>
      </div>
      <div className="mt-1.5 rounded-xl px-3 py-1.5 inline-block" style={{ background: '#00BEFF' }}>
        <p className="text-[10px] font-black tracking-wide leading-none" style={{ color: '#08101A' }}>BLACK FRIDAY · PRVIH {BF_SLOTS_TOTAL}</p>
        <p className="font-black leading-tight" style={{ color: '#08101A', fontSize: size }}>{fmt(bf)}</p>
      </div>
      <p className="text-[10px] mt-1" style={{ color: T.faint }}>još {bfSlotsLeft} mjesta · uplata na račun</p>
    </div>
  );
}

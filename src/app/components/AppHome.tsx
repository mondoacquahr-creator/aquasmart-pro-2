import { ShoppingCart, Droplets, Home, Briefcase } from 'lucide-react';
import { MondoLogo } from './MondoLogo';

// Početna instalirane aplikacije: samo alati za vlasnike i profesionalce.
type Nav = (page: any) => void;

export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true);

const TILES = [
  { page: 'products', Icon: ShoppingCart, k: 'Webshop', t: 'Kemija i oprema', d: 'Registrirani vlasnici bazena imaju −10 % na kemiju.' },
  { page: 'analysis', Icon: Droplets, k: 'Besplatno', t: 'Analiza vode', d: 'Upišite izmjerene vrijednosti i dobijte točne doze prema deklaraciji proizvoda.' },
  { page: 'login', Icon: Home, k: 'Vlasnici bazena', t: 'Moj bazen', d: 'Povijest analiza, podaci o bazenu i narudžbe na jednom mjestu.' },
  { page: 'login', Icon: Briefcase, k: 'Serviseri', t: 'Pool Care PRO', d: 'Radni nalozi, kemija po nalogu, ponude i fakturiranje.' },
];

export function AppHome({ onNavigate }: { onNavigate: Nav }) {
  return (
    <div className="relative z-10 max-w-[1180px] mx-auto px-5 pt-10 pb-16" style={{ color: '#fff' }}>
      <div className="mb-8 flex flex-col gap-3">
        <MondoLogo size={52} />
        <h1 className="text-3xl md:text-4xl font-extrabold mt-4">Što želite napraviti?</h1>
        <p className="text-white/60 max-w-[60ch]">Alati za vlasnike bazena i profesionalce.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {TILES.map(({ page, Icon, k, t, d }) => (
          <button key={t} onClick={() => onNavigate(page)}
            className="text-left rounded-3xl p-6 flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
            style={{ background: 'rgba(6,30,42,0.7)', border: '1px solid rgba(120,220,255,0.16)' }}>
            <span className="w-12 h-12 rounded-2xl grid place-items-center" style={{ background: 'rgba(79,195,240,0.14)' }}>
              <Icon className="w-6 h-6" style={{ color: '#4FC3F0' }} />
            </span>
            <span className="text-[0.72rem] font-bold tracking-[0.14em] uppercase" style={{ color: '#5CE1E6' }}>{k}</span>
            <span className="text-xl font-bold">{t}</span>
            <span className="text-sm text-white/65">{d}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

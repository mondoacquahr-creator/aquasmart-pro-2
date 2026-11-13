import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { MondoLogo } from './MondoLogo';
import { useLanguage } from '../lib/languageContext';

// Zajedničko zaglavlje s glavnom stranicom Mondo Acqua (isti izbornik), za javne stranice Pool Care-a.
// Glavna stranica je na /mondo-web/ dok ne prijeđe na domenu mondo-acqua.hr.
const MAIN = 'https://www.mondo-acqua.hr/';

type Nav = (page: any) => void;

export function SiteHeader({ onNavigate, app = false }: { onNavigate: Nav; app?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);
  const go = (p: string) => { setOpen(false); setDrop(null); onNavigate(p); window.scrollTo(0, 0); };

  const link = 'text-[0.92rem] font-semibold text-white/90 hover:text-[#5CE1E6] transition-colors';
  const panel = 'absolute top-full pt-3 min-w-[240px] z-[70]';
  const panelBox = 'rounded-2xl p-2 shadow-2xl';
  const panelStyle = { background: 'rgba(6,30,42,0.98)', border: '1px solid rgba(120,220,255,0.14)' };
  const item = 'block w-full text-left px-3 py-2 rounded-xl text-sm text-white hover:bg-white/5';
  const head = 'block px-3 pt-2 pb-0.5 text-[0.7rem] font-bold tracking-[0.12em] uppercase text-[#5CE1E6]';

  const Drop = ({ id, label, children, right }: { id: string; label: string; children: React.ReactNode; right?: boolean }) => (
    <div className="relative" onMouseEnter={() => setDrop(id)} onMouseLeave={() => setDrop(null)}>
      <button className={link} onClick={() => setDrop(drop === id ? null : id)} aria-expanded={drop === id}>{label}</button>
      {drop === id && (
        <div className={`${panel} ${right ? 'right-[-16px]' : 'left-[-16px]'}`}>
          <div className={panelBox} style={panelStyle}>{children}</div>
        </div>
      )}
    </div>
  );

  const bazeni: [string, string][] = [['bazeni', 'Svi bazeni i usporedba'], ['bazeni/fp', 'Montažni FP bazeni'], ['bazeni/coral', 'CORAL kompozitni'], ['bazeni/compact', 'COMPACT keramički'], ['bazeni/betonski', 'Betonski i po mjeri'], ['bazeni/swim-spa', 'Swim spa i hidromasaža'], ['bazeni/rekonstrukcija', 'Rekonstrukcija i izmjena folije']];
  const onama: [string, string][] = [['o-nama', 'O nama'], ['galerija', 'Galerija radova'], ['kontakt', 'Kontakt']];

  const prijava = (
    <>
      <button className={head} onClick={() => go('login')}>Moj bazen <span className="block normal-case tracking-normal font-medium text-white/50">vlasnici bazena</span></button>
      <button className={item} onClick={() => go('login')}>Prijava</button>
      <button className={item} onClick={() => go('member-register')}>Besplatna registracija</button>
      <button className={head} onClick={() => go('login')}>Pro portal <span className="block normal-case tracking-normal font-medium text-white/50">serviseri</span></button>
      <button className={item} onClick={() => go('login')}>Prijava</button>
      <button className={item} onClick={() => go('register')}>30 dana besplatno</button>
    </>
  );

  return (
    <header className="relative z-[60]" style={{ background: 'rgba(4,24,32,0.92)', borderBottom: '1px solid rgba(120,220,255,0.10)' }}>
      <div className="max-w-[1180px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
        {app ? <button onClick={() => go('home')} aria-label="Početna"><MondoLogo size={40} /></button> : <a href={MAIN} aria-label="Mondo Acqua, početna"><MondoLogo size={40} /></a>}

        {app ? (
        <nav className="hidden md:flex items-center gap-[22px]">
          <button className={link} onClick={() => go('products')}>Webshop</button>
          <button className={link} onClick={() => go('analysis')}>Analiza vode</button>
          <button className={link} onClick={() => go('login')}>Moj bazen</button>
          <button className={link} onClick={() => go('login')}>PRO</button>
        </nav>
        ) : (
        <nav className="hidden xl:flex items-center gap-[22px]">
          <Drop id="bazeni" label="Bazeni">{bazeni.map(([h, t]) => <a key={h} className={item} href={MAIN + h}>{t}</a>)}</Drop>
          <a className={link} href={MAIN + 'kljuc-u-ruke'}>Ključ u ruke</a>
          <a className={link} href={MAIN + 'odrzavanje'}>Održavanje</a>
          <button className={link} onClick={() => go('visualizer')}>AI vizualizator</button>
          <button className={link} onClick={() => go('products')}>Webshop</button>
          <Drop id="onama" label="O nama">{onama.map(([h, t]) => <a key={h} className={item} href={MAIN + h}>{t}</a>)}</Drop>
          <Drop id="prijava" label="Prijava" right>{prijava}</Drop>
        </nav>
        )}

        <div className="flex items-center gap-2">
          <div className="flex rounded-full p-0.5" style={{ border: '1px solid rgba(120,220,255,0.18)' }} role="group" aria-label="Jezik">
            {(['hr', 'en'] as const).map(l => (
              <button key={l} onClick={() => setLanguage(l)} aria-pressed={language === l}
                className="px-2.5 py-1 rounded-full text-xs font-bold uppercase"
                style={language === l ? { background: 'rgba(92,225,230,0.18)', color: '#5CE1E6' } : { color: 'rgba(255,255,255,0.6)' }}>{l}</button>
            ))}
          </div>
          {!app && <a href={MAIN + 'upit'} className="px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap" style={{ background: '#4FC3F0', color: '#0a0a0a', boxShadow: '0 6px 24px rgba(79,195,240,0.3)' }}>Zatražite ponudu</a>}
          <button className={`${app ? 'md:hidden' : 'xl:hidden'} w-11 h-11 rounded-xl grid place-items-center text-white`} style={{ background: 'rgba(255,255,255,0.06)' }} onClick={() => setOpen(!open)} aria-label="Izbornik" aria-expanded={open}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && app && (
        <div className="md:hidden px-4 pb-5" style={{ background: '#041820', borderBottom: '1px solid rgba(120,220,255,0.12)' }}>
          <button className={item} onClick={() => go('products')}>Webshop</button>
          <button className={item} onClick={() => go('analysis')}>Analiza vode</button>
          <button className={item} onClick={() => go('login')}>Moj bazen</button>
          <button className={item} onClick={() => go('login')}>Pool Care PRO</button>
        </div>
      )}
      {open && !app && (
        <div className="xl:hidden px-4 pb-5 max-h-[calc(100vh-80px)] overflow-y-auto" style={{ background: '#041820', borderBottom: '1px solid rgba(120,220,255,0.12)' }}>
          <p className={head}>Bazeni</p>
          {bazeni.map(([h, t]) => <a key={h} className={item} href={MAIN + h}>{t}</a>)}
          <a className={item} href={MAIN + 'kljuc-u-ruke'}>Ključ u ruke</a>
          <a className={item} href={MAIN + 'odrzavanje'}>Održavanje</a>
          <button className={item} onClick={() => go('visualizer')}>AI vizualizator</button>
          <button className={item} onClick={() => go('products')}>Webshop</button>
          {onama.map(([h, t]) => <a key={h} className={item} href={MAIN + h}>{t}</a>)}
          <div className="mt-2">{prijava}</div>
        </div>
      )}
    </header>
  );
}

import { MondoLogo } from './MondoLogo';
import { AppIcon } from './AppIcon';
import { MemberChip } from './MemberChip';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import imgPrije from '../../imports/mondo-prije.jpg';
// Isti bazen prije čišćenja (AI obrada fotografije, Supabase javna pohrana)
const IMG_PRIJE_CISCENJA = 'https://sryuogkaebeznmadchcr.supabase.co/storage/v1/object/public/pool-catalog/site/poolcare-prije-ciscenja.jpg';
import imgPoslijeDan from '../../imports/mondo-poslije-dan.jpg';
import imgPoslijeNoc from '../../imports/mondo-poslije-noc.jpg';
import {
  Droplets, Users, FileText,
  LogIn, UserPlus, Lock, BeakerIcon, ShoppingCart, MapPin, Menu, X,
  Phone, Mail, Building, Copyright, Globe, Sparkles,
  FlaskConical, Activity, Play, Warehouse, UserCog,
  ChevronDown, BarChart3, Percent, BadgePercent, LineChart, Wrench, CheckCircle2, MessageCircle,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { WaterBackground } from './WaterBackground';

interface HomePageNewProps {
  onNavigate: (page: 'visualizer' | 'promo' | 'analysis' | 'products' | 'login' | 'register' | 'member-register' | 'member-portal' | 'free-portal' | 'pro-portal') => void;
}

const ACCENT = 'linear-gradient(90deg, #7FDBFF 0%, #4FC3F0 45%, #1E88E5 100%)';
const CARD_BG = 'rgba(10,40,52,0.55)';
const CARD_BORDER = '1px solid rgba(120,220,255,0.12)';
const CYAN = '#5CE1E6';

const readingBars = [
  {
    label: 'pH',
    value: '7.8',
    knobPct: 83,
    barGrad: 'linear-gradient(90deg, #FFD60A 0%, #FF8A1F 55%, #FF2D55 100%)',
    goal: 'Cilj 7.2 – 7.6',
    status: 'Malo visoko',
    statusColor: '#FFD60A',
  },
  {
    label: 'Slobodni klor',
    value: '0.3 mg/L',
    knobPct: 27,
    barGrad: 'linear-gradient(90deg, #FFF6CC, #FFD60A)',
    goal: 'Cilj 0.5 – 1.5',
    status: 'Nisko',
    statusColor: '#FFD60A',
  },
  {
    label: 'Alkalitet',
    value: '110 mg/L',
    knobPct: 58,
    barGrad: 'linear-gradient(90deg, #CFF5E7, #1FA97A)',
    goal: 'Cilj 80 – 120',
    status: 'U redu',
    statusColor: '#2EE6A6',
  },
];

const FREE_ITEMS = [
  { Icon: FlaskConical, title: 'Analiza vode', desc: 'Upišite očitanja i dobijte točne doze', page: 'analysis' as const },
  { Icon: ShoppingCart, title: 'Webshop Mondo Acqua', desc: 'Kemija i oprema za bazen', page: 'products' as const },
  { Icon: MapPin, title: 'Prodajna mjesta', desc: 'Gdje kupiti Mondo Acqua proizvode', page: 'free-portal' as const },
  { Icon: Droplets, title: 'Moj bazen', desc: 'Povijest analiza, podsjetnici i pogodnosti', page: 'member-register' as const, memberPage: 'member-portal' as const },
];

const PRO_ITEMS = [
  { Icon: Lock, title: 'Pro portal', desc: 'Prijava u portal tvrtke', page: 'login' as const },
  { Icon: FileText, title: 'Radni nalozi', desc: 'Nalozi, kemija i fakturiranje', page: 'login' as const },
  { Icon: UserCog, title: 'Djelatnici i ovlasti', desc: 'Tko što smije vidjeti i raditi', page: 'login' as const },
  { Icon: Warehouse, title: 'Skladište', desc: 'Stanje i razduženje materijala', page: 'login' as const },
];

export function HomePageNew({ onNavigate }: HomePageNewProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const isMember = localStorage.getItem('userRole') === 'member';
  const memberName = user?.name || localStorage.getItem('memberName') || '';
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showDropMenu, setShowDropMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hr');

  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [afterMode, setAfterMode] = useState<'dan' | 'noc'>('dan');

  const dropMenuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const draggingRef = useRef(false);

  const languages = [
    { id: 'hr', flag: '🇭🇷', name: 'Hrvatski' },
    { id: 'en', flag: '🇬🇧', name: 'English' },
    { id: 'it', flag: '🇮🇹', name: 'Italiano' },
    { id: 'de', flag: '🇩🇪', name: 'Deutsch' },
  ];

  const translations: Record<string, any> = {
    hr: {
      nav: {
        visualizer: 'Vizualizator',
        analysis: 'Analiza vode',
        products: 'Webshop',
        odrzavanje: 'Održavanje bazena',
        servisere: 'Za servisere',
        login: 'Prijava',
        register: 'Isprobaj besplatno',
      },
      hero: {
        eyebrow: 'Za vlasnike i servisere bazena',
        h1line1: 'Od testa vode',
        h1line2: 'do točne doze.',
        h1line3: 'U 30 sekundi.',
        desc: 'Upišite očitanja, Mondo Pool Care izračuna kemiju prema deklaraciji proizvoda i preporuči točno što kupiti.',
        ctaAnalysis: 'Pokreni analizu →',
        ctaDemo: 'Pogledaj demo',
        tagline: 'Besplatno za vlasnike bazena · 30 dana besplatno za servisere',
      },
      steps: {
        title1: '1. Testiraj', desc1: 'Upišite pH, klor i alkalitet.',
        title2: '2. Analiziraj', desc2: 'Odmah vidite što odstupa i zašto.',
        title3: '3. Doziraj', desc3: 'Točni grami za volumen vašeg bazena.',
      },
      visualizer: {
        title: 'Vidite bazen u svom dvorištu prije gradnje.',
        desc: 'Slikajte parcelu, odaberite model iz našeg kataloga i AI ga ugradi u fotografiju.',
        cta: 'Isprobaj vizualizator',
        beforeLabel: 'Prije',
        afterLabel: 'Poslije',
      },
      free: {
        sectionTitle: 'Besplatno za vlasnike bazena',
        analysis: { title: 'Analiza vode', desc: 'Izračun doze kemikalija prema očitanjima.' },
        products: { title: 'Webshop Mondo Acqua', desc: 'Katalog proizvoda za tretman bazena.' },
        portal: { title: 'Prodajna mjesta', desc: 'Pronađite najbliži prodajni punkt.' },
      },
      servisere: {
        sectionTitle: 'Za servisere i tvrtke',
        orders: { title: 'Radni nalozi', desc: 'Kreirajte i pratite sve radne naloge na jednom mjestu.' },
        employees: { title: 'Djelatnici i ovlasti', desc: 'Upravljajte timom i postavite prava pristupa.' },
        storage: { title: 'Skladište i razduženje', desc: 'Pratite zalihe i razdužite materijal po nalozima.' },
        reports: { title: 'Izvještaji klijentima', desc: 'Generirajte profesionalne izvještaje za klijente.' },
        ctaTrial: 'Isprobaj 30 dana besplatno',
        ctaLogin: 'Prijava',
      },
      footer: {
        tagline: 'Profesionalni alat za upravljanje bazenima',
        devBy: 'Razvio',
        techSupport: 'Tehnička podrška',
        legal: 'Pravno',
        privacy: 'Privatnost',
        terms: 'Uvjeti',
        cookies: 'Kolačići',
        copyright: '© 2026 Vladimir Perić – Mondo Acqua d.o.o. Sva prava pridržana.',
        ipTitle: 'Zaštita intelektualnog vlasništva',
        ipText: 'Svi elementi ovog softvera zaštićeni su međunarodnim zakonima o autorskim pravima i intelektualnom vlasništvu. Neovlašteno kopiranje, distribuiranje ili reprodukcija je strogo zabranjena.',
        trademarkText: 'Mondo Pool Care™, Pool Visualizer™ i svi povezani logotipi vlasništvo su MONDO ACQUA d.o.o.',
        prohibited: 'NEOVLAŠTENA UPORABA ZABRANJENA',
      },
    },
    en: {
      nav: {
        visualizer: 'Visualizer',
        analysis: 'Water Analysis',
        products: 'Webshop',
        odrzavanje: 'Pool maintenance',
        servisere: 'For Professionals',
        login: 'Login',
        register: 'Try for free',
      },
      hero: {
        eyebrow: 'For pool owners and service professionals',
        h1line1: 'From water test',
        h1line2: 'to exact dose.',
        h1line3: 'In 30 seconds.',
        desc: 'Enter your readings. Mondo Pool Care calculates the chemistry from product declarations and recommends exactly what to buy.',
        ctaAnalysis: 'Start analysis →',
        ctaDemo: 'Watch demo',
        tagline: 'Free for pool owners · 30 days free for professionals',
      },
      steps: {
        title1: '1. Test', desc1: 'Enter pH, chlorine and alkalinity.',
        title2: '2. Analyze', desc2: 'See what deviates and why.',
        title3: '3. Dose', desc3: 'Exact grams for your pool volume.',
      },
      visualizer: {
        title: 'See your pool in your garden before building.',
        desc: 'Take a photo, choose a model from our catalog, and AI embeds it in your photo.',
        cta: 'Try the visualizer',
        beforeLabel: 'Before',
        afterLabel: 'After',
      },
      free: {
        sectionTitle: 'Free for pool owners',
        analysis: { title: 'Water Analysis', desc: 'Calculate chemical doses from readings.' },
        products: { title: 'Mondo Acqua Webshop', desc: 'Catalog of pool treatment products.' },
        portal: { title: 'Store Locator', desc: 'Find the nearest sales point.' },
      },
      servisere: {
        sectionTitle: 'For service companies',
        orders: { title: 'Work Orders', desc: 'Create and track all work orders in one place.' },
        employees: { title: 'Staff & Permissions', desc: 'Manage your team and set access rights.' },
        storage: { title: 'Inventory & Dispatch', desc: 'Track stock and assign materials to orders.' },
        reports: { title: 'Client Reports', desc: 'Generate professional reports for clients.' },
        ctaTrial: 'Try 30 days free',
        ctaLogin: 'Login',
      },
      footer: {
        tagline: 'Professional pool management tool',
        devBy: 'Developed by',
        techSupport: 'Technical Support',
        legal: 'Legal',
        privacy: 'Privacy',
        terms: 'Terms',
        cookies: 'Cookies',
        copyright: '© 2026 Vladimir Perić – Mondo Acqua d.o.o. All rights reserved.',
        ipTitle: 'Intellectual Property Protection',
        ipText: 'All elements of this software are protected by international copyright laws. Unauthorized copying, distribution or reproduction is strictly prohibited.',
        trademarkText: 'Mondo Pool Care™, Pool Visualizer™ and related logos are property of MONDO ACQUA d.o.o.',
        prohibited: 'UNAUTHORIZED USE PROHIBITED',
      },
    },
    it: {
      nav: {
        visualizer: 'Visualizzatore',
        analysis: 'Analisi Acqua',
        products: 'Webshop',
        odrzavanje: 'Manutenzione piscine',
        servisere: 'Per Professionisti',
        login: 'Accedi',
        register: 'Prova Gratis',
      },
      hero: {
        eyebrow: 'Per proprietari di piscine e professionisti',
        h1line1: "Dal test dell'acqua",
        h1line2: 'alla dose esatta.',
        h1line3: 'In 30 secondi.',
        desc: "Inserisci le letture, Mondo Pool Care calcola la chimica secondo le dichiarazioni del prodotto.",
        ctaAnalysis: 'Avvia analisi →',
        ctaDemo: 'Guarda demo',
        tagline: 'Gratuito per proprietari · 30 giorni gratis per professionisti',
      },
      steps: {
        title1: '1. Testa', desc1: 'Inserisci pH, cloro e alcalinità.',
        title2: '2. Analizza', desc2: 'Vedi cosa si discosta e perché.',
        title3: '3. Dosa', desc3: 'Grammi esatti per il volume della tua piscina.',
      },
      visualizer: {
        title: 'Vedi la piscina nel tuo giardino prima di costruire.',
        desc: "Fotografa il terreno, scegli un modello dal catalogo e l'AI la inserisce nella foto.",
        cta: 'Prova il visualizzatore',
        beforeLabel: 'Prima',
        afterLabel: 'Dopo',
      },
      free: {
        sectionTitle: 'Gratuito per proprietari',
        analysis: { title: 'Analisi Acqua', desc: 'Calcolo dosi chimiche dalle letture.' },
        products: { title: 'Mondo Acqua Webshop', desc: 'Catalogo prodotti per trattamento piscine.' },
        portal: { title: 'Punti Vendita', desc: 'Trova il punto vendita più vicino.' },
      },
      servisere: {
        sectionTitle: 'Per aziende di servizio',
        orders: { title: 'Ordini di Lavoro', desc: 'Crea e traccia tutti gli ordini in un unico posto.' },
        employees: { title: 'Personale e Permessi', desc: 'Gestisci il team e imposta i diritti di accesso.' },
        storage: { title: 'Magazzino', desc: 'Traccia le scorte e assegna materiali agli ordini.' },
        reports: { title: 'Report Clienti', desc: 'Genera report professionali per i clienti.' },
        ctaTrial: 'Prova 30 giorni gratis',
        ctaLogin: 'Accedi',
      },
      footer: {
        tagline: 'Strumento professionale per piscine',
        devBy: 'Sviluppato da',
        techSupport: 'Supporto Tecnico',
        legal: 'Legale',
        privacy: 'Privacy',
        terms: 'Termini',
        cookies: 'Cookie',
        copyright: '© 2026 Vladimir Perić – Mondo Acqua d.o.o. Tutti i diritti riservati.',
        ipTitle: 'Protezione della Proprietà Intellettuale',
        ipText: 'Tutti gli elementi di questo software sono protetti dalle leggi internazionali sul copyright.',
        trademarkText: 'Mondo Pool Care™, Pool Visualizer™ e i relativi loghi sono di proprietà di MONDO ACQUA d.o.o.',
        prohibited: 'USO NON AUTORIZZATO VIETATO',
      },
    },
    de: {
      nav: {
        visualizer: 'Visualizer',
        analysis: 'Wasseranalyse',
        products: 'Webshop',
        odrzavanje: 'Poolpflege',
        servisere: 'Für Profis',
        login: 'Anmelden',
        register: 'Kostenlos testen',
      },
      hero: {
        eyebrow: 'Für Poolbesitzer und Service-Profis',
        h1line1: 'Vom Wassertest',
        h1line2: 'zur exakten Dosis.',
        h1line3: 'In 30 Sekunden.',
        desc: 'Geben Sie die Messwerte ein, Mondo Pool Care berechnet die Chemie anhand der Produktdeklarationen.',
        ctaAnalysis: 'Analyse starten →',
        ctaDemo: 'Demo ansehen',
        tagline: 'Kostenlos für Poolbesitzer · 30 Tage kostenlos für Profis',
      },
      steps: {
        title1: '1. Testen', desc1: 'pH, Chlor und Alkalität eingeben.',
        title2: '2. Analysieren', desc2: 'Sehen Sie sofort, was abweicht und warum.',
        title3: '3. Dosieren', desc3: 'Exakte Gramm für Ihr Poolvolumen.',
      },
      visualizer: {
        title: 'Sehen Sie Ihren Pool im Garten vor dem Bau.',
        desc: 'Fotografieren Sie das Grundstück, wählen Sie ein Modell aus dem Katalog und die KI fügt es in das Foto ein.',
        cta: 'Visualizer ausprobieren',
        beforeLabel: 'Vorher',
        afterLabel: 'Nachher',
      },
      free: {
        sectionTitle: 'Kostenlos für Poolbesitzer',
        analysis: { title: 'Wasseranalyse', desc: 'Chemikaliendosierung aus Messwerten.' },
        products: { title: 'Mondo Acqua Webshop', desc: 'Produktkatalog für Poolbehandlung.' },
        portal: { title: 'Händlersuche', desc: 'Finden Sie den nächsten Verkaufspunkt.' },
      },
      servisere: {
        sectionTitle: 'Für Service-Unternehmen',
        orders: { title: 'Arbeitsaufträge', desc: 'Erstellen und verfolgen Sie alle Aufträge.' },
        employees: { title: 'Mitarbeiter & Berechtigungen', desc: 'Team verwalten und Zugriffsrechte setzen.' },
        storage: { title: 'Lager & Entnahme', desc: 'Bestände verfolgen und Materialien zuweisen.' },
        reports: { title: 'Kundenberichte', desc: 'Professionelle Berichte für Kunden erstellen.' },
        ctaTrial: '30 Tage kostenlos testen',
        ctaLogin: 'Anmelden',
      },
      footer: {
        tagline: 'Professionelles Pool-Verwaltungstool',
        devBy: 'Entwickelt von',
        techSupport: 'Technischer Support',
        legal: 'Rechtliches',
        privacy: 'Datenschutz',
        terms: 'Bedingungen',
        cookies: 'Cookies',
        copyright: '© 2026 Vladimir Perić – Mondo Acqua d.o.o. Alle Rechte vorbehalten.',
        ipTitle: 'Schutz des geistigen Eigentums',
        ipText: 'Alle Elemente dieser Software sind durch internationale Urheberrechtsgesetze geschützt.',
        trademarkText: 'Mondo Pool Care™, Pool Visualizer™ und zugehörige Logos sind Eigentum der MONDO ACQUA d.o.o.',
        prohibited: 'UNERLAUBTE NUTZUNG VERBOTEN',
      },
    },
  };

  const t = translations[selectedLanguage];

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!showDropMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (dropMenuRef.current && !dropMenuRef.current.contains(e.target as Node)) {
        setShowDropMenu(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDropMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showDropMenu]);

  // Slider intro animation on first view
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          setAnimating(true);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setSliderPos(25);
              setTimeout(() => setSliderPos(65), 750);
              setTimeout(() => setSliderPos(50), 1550);
              setTimeout(() => setAnimating(false), 2400);
            });
          });
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Preload both AFTER images for instant crossfade
  useEffect(() => {
    const preload = (src: string) => { const img = new Image(); img.src = src; };
    preload(imgPoslijeDan);
    preload(IMG_PRIJE_CISCENJA);
  }, []);

  // Slider pointer handlers
  const updateSlider = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, x)));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setIsDragging(true);
    setAnimating(false);
    updateSlider(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateSlider(e);
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
    setIsDragging(false);
  };

  const sliderClipTrans = isDragging ? 'none' : animating ? 'clip-path 700ms ease-in-out' : 'none';
  const sliderPosTrans = isDragging ? 'none' : animating ? 'left 700ms ease-in-out' : 'none';

  return (
    <>
      {/* Fixed dark gradient background */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: 'radial-gradient(ellipse at 80% 0%, #08303D 0%, #041820 55%, #020D12 100%)',
        }}
      />

      {/* Animated water rings */}
      <WaterBackground />

      {/* Page content sits above rings (z-index 1) */}
      <div className="min-h-screen" style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
        <style>{`
          .accent-grad-text {
            background: linear-gradient(90deg, #7FDBFF 0%, #4FC3F0 45%, #1E88E5 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .drop-item {
            transition: background 140ms ease;
          }
          .drop-item:hover {
            background: rgba(92,225,230,0.08) !important;
          }
          .viz-card {
            aspect-ratio: 1450 / 670;
          }
          .viz-img {
            object-fit: cover;
            object-position: center center;
          }
          @media (max-width: 639px) {
            .viz-card {
              aspect-ratio: 4 / 3;
            }
            .viz-img {
              object-position: 45% 60%;
            }
          }
        `}</style>

        {/* ============================================================ */}
        {/* HEADER                                                        */}
        {/* ============================================================ */}
        <header
          className="sticky top-0 z-50 backdrop-blur-xl"
          style={{ background: 'rgba(4,24,32,0.75)', borderBottom: '1px solid rgba(120,220,255,0.08)' }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            {/* Logo */}
            <MondoLogo size={42} />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Izbornik dropdown */}
              <div ref={dropMenuRef} className="relative">
                <button
                  onClick={() => setShowDropMenu((v) => !v)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl transition-all hover:bg-white/8"
                  style={{ color: showDropMenu ? CYAN : 'rgba(255,255,255,0.75)' }}
                >
                  Izbornik
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform duration-200"
                    style={{ transform: showDropMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                <AnimatePresence>
                  {showDropMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute left-0 rounded-3xl backdrop-blur-2xl"
                      style={{
                        top: 'calc(100% + 10px)',
                        width: 640,
                        maxWidth: 'calc(100vw - 2rem)',
                        background: 'rgba(6,30,42,0.97)',
                        border: '1px solid rgba(120,220,255,0.12)',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(120,220,255,0.04)',
                        zIndex: 100,
                        padding: '1.25rem',
                        overflow: 'hidden',
                      }}
                    >
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                        {/* Column 1: BESPLATNO */}
                        <div>
                          <div className="mb-3 px-3">
                            <span
                              className="inline-block text-xs font-bold uppercase rounded-full"
                              style={{
                                color: CYAN,
                                background: 'rgba(92,225,230,0.12)',
                                letterSpacing: '0.1em',
                                padding: '3px 10px',
                              }}
                            >
                              BESPLATNO
                            </span>
                          </div>
                          <div>
                            {FREE_ITEMS.map(({ Icon, title, desc, page, ...rest }) => {
                              const memberPage = (rest as any).memberPage;
                              const resolvedPage = memberPage && localStorage.getItem('userRole') === 'member' ? memberPage : page;
                              return (
                                <button
                                  key={page + title}
                                  onClick={() => { onNavigate(resolvedPage); setShowDropMenu(false); }}
                                  className="drop-item w-full flex items-start gap-3 text-left rounded-2xl"
                                  style={{ padding: 12, background: 'transparent' }}
                                >
                                  <div
                                    className="shrink-0 rounded-xl flex items-center justify-center"
                                    style={{ width: 36, height: 36, background: 'rgba(92,225,230,0.1)' }}
                                  >
                                    <Icon style={{ color: CYAN, width: 16, height: 16 }} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white leading-tight">{title}</p>
                                    <p className="text-xs mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Column 2: ZA SERVISERE I TVRTKE */}
                        <div className="flex flex-col">
                          <div className="mb-3 px-3">
                            <span
                              className="text-xs font-semibold uppercase"
                              style={{ color: 'rgba(255,255,255,0.42)', letterSpacing: '0.08em' }}
                            >
                              ZA SERVISERE I TVRTKE
                            </span>
                          </div>
                          <div className="flex-1">
                            {PRO_ITEMS.map(({ Icon, title, desc, page }) => (
                              <button
                                key={title}
                                onClick={() => { onNavigate(page); setShowDropMenu(false); }}
                                className="drop-item w-full flex items-start gap-3 text-left rounded-2xl"
                                style={{ padding: 12, background: 'transparent' }}
                              >
                                <div
                                  className="shrink-0 rounded-xl flex items-center justify-center"
                                  style={{ width: 36, height: 36, background: 'rgba(92,225,230,0.08)' }}
                                >
                                  <Icon style={{ color: 'rgba(120,220,255,0.7)', width: 16, height: 16 }} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-white leading-tight">{title}</p>
                                  <p className="text-xs mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                          <div className="px-3 mt-2">
                            <button
                              onClick={() => { onNavigate('register'); setShowDropMenu(false); }}
                              className="w-full py-3 text-sm font-bold rounded-full transition-all hover:opacity-90"
                              style={{ background: ACCENT, color: '#0a0a0a' }}
                            >
                              Isprobaj 30 dana besplatno
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Existing text links */}
              {[
                {
                  label: t.nav.odrzavanje,
                  action: () => document.getElementById('odrzavanje')?.scrollIntoView({ behavior: 'smooth' }),
                },
                { label: t.nav.analysis, action: () => onNavigate('analysis') },
                { label: t.nav.products, action: () => onNavigate('products') },
                {
                  label: t.nav.servisere,
                  action: () => {
                    const el = document.getElementById('servisere');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  },
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="px-4 py-2 text-sm rounded-xl transition-all hover:bg-white/8"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right: language + auth */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Language picker */}
              <div className="relative">
                <button
                  onClick={() => setShowQuickMenu(!showQuickMenu)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl transition-all hover:bg-white/8"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{languages.find((l) => l.id === selectedLanguage)?.flag}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showQuickMenu ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showQuickMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-44 rounded-2xl overflow-hidden backdrop-blur-xl z-50"
                      style={{ background: 'rgba(6,30,42,0.95)', border: CARD_BORDER, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => { setSelectedLanguage(lang.id); setShowQuickMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all hover:bg-white/8"
                          style={{ color: selectedLanguage === lang.id ? CYAN : 'rgba(255,255,255,0.75)' }}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isMember ? (
                <MemberChip name={memberName} onClick={() => onNavigate('member-portal' as any)} />
              ) : (<>
              {/* Login */}
              <button
                onClick={() => onNavigate('login')}
                aria-label={t.nav.login}
                className="px-3 sm:px-4 py-2 text-sm rounded-xl transition-all hover:bg-white/8"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                <span className="hidden sm:inline">{t.nav.login}</span>
                <LogIn className="w-4 h-4 sm:hidden" />
              </button>

              {/* Register pill */}
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 text-sm font-semibold rounded-full transition-all hover:opacity-90"
                style={{ background: '#fff', color: '#020D12' }}
              >
                <span className="hidden sm:inline">{t.nav.register}</span>
                <span className="sm:hidden">
                  <UserPlus className="w-4 h-4" />
                </span>
              </button>
              </>)}

              {/* Mobile hamburger */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="md:hidden p-2 rounded-xl transition-all hover:bg-white/8"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile mega menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden md:hidden"
                style={{ borderTop: '1px solid rgba(120,220,255,0.08)', background: 'rgba(4,20,28,0.97)' }}
              >
                <div className="px-4 py-5">
                  {/* Group 1: BESPLATNO */}
                  <p
                    className="text-xs font-bold uppercase px-3 mb-2"
                    style={{ color: CYAN, letterSpacing: '0.1em' }}
                  >
                    BESPLATNO
                  </p>
                  <div className="mb-5">
                    {FREE_ITEMS.map(({ Icon, title, desc, page, ...rest }) => {
                      const memberPage = (rest as any).memberPage;
                      const resolvedPage = memberPage && localStorage.getItem('userRole') === 'member' ? memberPage : page;
                      return (
                        <button
                          key={page + title + '-m'}
                          onClick={() => { onNavigate(resolvedPage); setShowMenu(false); }}
                          className="drop-item w-full flex items-start gap-3 text-left rounded-2xl"
                          style={{ padding: '10px 12px', background: 'transparent' }}
                        >
                          <div
                            className="shrink-0 rounded-xl flex items-center justify-center"
                            style={{ width: 34, height: 34, background: 'rgba(92,225,230,0.1)' }}
                          >
                            <Icon style={{ color: CYAN, width: 15, height: 15 }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white leading-tight">{title}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Group 2: ZA SERVISERE I TVRTKE */}
                  <p
                    className="text-xs font-semibold uppercase px-3 mb-2"
                    style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}
                  >
                    ZA SERVISERE I TVRTKE
                  </p>
                  <div className="mb-5">
                    {PRO_ITEMS.map(({ Icon, title, desc, page }) => (
                      <button
                        key={title + '-m'}
                        onClick={() => { onNavigate(page); setShowMenu(false); }}
                        className="drop-item w-full flex items-start gap-3 text-left rounded-2xl"
                        style={{ padding: '10px 12px', background: 'transparent' }}
                      >
                        <div
                          className="shrink-0 rounded-xl flex items-center justify-center"
                          style={{ width: 34, height: 34, background: 'rgba(92,225,230,0.08)' }}
                        >
                          <Icon style={{ color: 'rgba(120,220,255,0.7)', width: 15, height: 15 }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white leading-tight">{title}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Auth buttons */}
                  <div className="flex gap-2 px-1">
                    <button
                      onClick={() => { onNavigate('login'); setShowMenu(false); }}
                      className="flex-1 py-2.5 text-sm rounded-full transition-all hover:bg-white/8 border"
                      style={{ borderColor: 'rgba(120,220,255,0.2)', color: 'rgba(255,255,255,0.8)' }}
                    >
                      {t.nav.login}
                    </button>
                    <button
                      onClick={() => { onNavigate('register'); setShowMenu(false); }}
                      className="flex-1 py-2.5 text-sm font-semibold rounded-full"
                      style={{ background: '#fff', color: '#020D12' }}
                    >
                      {t.nav.register}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ============================================================ */}
        {/* HERO                                                          */}
        {/* ============================================================ */}
        <section
          className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-20 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center"
          style={{ minHeight: '80vh' }}
        >
          {/* Left */}
          <motion.div
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <p
              className="text-sm font-semibold mb-5 uppercase tracking-widest"
              style={{ color: CYAN }}
            >
              {t.hero.eyebrow}
            </p>

            <h1
              className="font-extrabold leading-none mb-6"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', letterSpacing: '-0.03em' }}
            >
              <span className="block text-white">{t.hero.h1line1}</span>
              <span className="block text-white">{t.hero.h1line2}</span>
              <span className="block accent-grad-text">{t.hero.h1line3}</span>
            </h1>

            <p
              className="text-base md:text-lg leading-relaxed mb-8 max-w-md"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              {t.hero.desc}
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('analysis')}
                className="px-7 py-3.5 text-sm font-bold rounded-full transition-all"
                style={{
                  background: ACCENT,
                  color: '#0a0a0a',
                  boxShadow: '0 6px 28px rgba(79,195,240,0.35)',
                }}
              >
                {t.hero.ctaAnalysis}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('promo')}
                className="px-7 py-3.5 text-sm font-semibold rounded-full flex items-center gap-2 transition-all backdrop-blur-sm"
                style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}
              >
                <Play className="w-4 h-4" fill="currentColor" />
                {t.hero.ctaDemo}
              </motion.button>
            </div>

            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {t.hero.tagline}
            </p>
          </motion.div>

          {/* Right – Reading Card */}
          <motion.div
            className="w-full lg:max-w-[460px] shrink-0"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: CARD_BG,
                border: CARD_BORDER,
                boxShadow: '0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(120,220,255,0.06)',
              }}
            >
              {/* Card header */}
              <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(120,220,255,0.08)' }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Primjer očitanja · Vila Lavanda, Rovinj
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-base text-white">Očitanje 22.10. · 09:40</p>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(255,214,10,0.18)', color: '#FFD60A' }}
                  >
                    2 korekcije
                  </span>
                </div>
              </div>

              {/* Bars */}
              <div className="px-6 py-5 space-y-5">
                {readingBars.map((bar, idx) => (
                  <div key={bar.label}>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {bar.label}
                      </span>
                      <span className="text-xl font-bold text-white">{bar.value}</span>
                    </div>
                    <div className="relative h-2.5 rounded-full mb-1.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="absolute -inset-y-1 rounded-md" style={{ left: '33.3%', width: '33.4%', background: 'rgba(46,230,166,0.22)', boxShadow: 'inset 0 0 0 1.5px rgba(46,230,166,0.85)' }} />
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ background: bar.barGrad }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${bar.knobPct}%` }}
                        transition={{ delay: 0.6 + idx * 0.2, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                      />
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.4)', marginLeft: '-8px' }}
                        initial={{ left: '0%' }}
                        animate={{ left: `${bar.knobPct}%` }}
                        transition={{ delay: 0.6 + idx * 0.2, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{bar.goal}</span>
                      <span className="text-xs font-semibold" style={{ color: bar.statusColor }}>{bar.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dose box */}
              <div
                className="mx-4 mb-4 px-5 py-4 rounded-2xl"
                style={{ background: 'rgba(4,24,32,0.7)', border: '1px solid rgba(92,225,230,0.15)' }}
              >
                <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: CYAN }}>
                  Preporučena doza · 48 m³
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>pH minus</span>
                    <span className="font-semibold text-white">380 g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Klor granule 56%</span>
                    <span className="font-semibold text-white">110 g</span>
                  </div>
                </div>
                <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Primjer – stvarne doze računa analiza.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ============================================================ */}
        {/* BESPLATNO ZA VLASNIKE: testiraj, analiziraj, doziraj + alati  */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
          <h2
            className="font-extrabold text-white mb-8"
            style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', letterSpacing: '-0.02em' }}
          >
            {t.free.sectionTitle}
          </h2>
          <div
            className="rounded-3xl overflow-hidden mb-5"
            style={{ background: CARD_BG, border: CARD_BORDER }}
          >
            <div
              className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x"
              style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}
            >
              {[
                { Icon: FlaskConical, title: t.steps.title1, desc: t.steps.desc1 },
                { Icon: Activity, title: t.steps.title2, desc: t.steps.desc2 },
                { Icon: BeakerIcon, title: t.steps.title3, desc: t.steps.desc3 },
              ].map(({ Icon, title, desc }, idx) => (
                <div
                  key={idx}
                  className="px-8 py-8 flex flex-col gap-4"
                  style={{ borderColor: 'rgba(120,220,255,0.1)' }}
                >
                  <AppIcon icon={Icon} size={52} />
                  <div>
                    <p className="font-bold text-base text-white mb-1">{title}</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { Icon: BeakerIcon, ...t.free.analysis, page: 'analysis' as const },
              { Icon: ShoppingCart, ...t.free.products, page: 'products' as const },
              { Icon: MapPin, ...t.free.portal, page: 'free-portal' as const },
            ].map(({ Icon, title, desc, page }) => (
              <motion.button
                key={page}
                whileHover={{ y: -4 }}
                onClick={() => onNavigate(page)}
                className="p-6 text-left rounded-3xl transition-all group"
                style={{ background: CARD_BG, border: CARD_BORDER }}
              >
                <div className="mb-4 transition-transform group-hover:scale-110 w-fit"><AppIcon icon={Icon} size={52} /></div>
                <h3 className="font-bold text-base text-white mb-1.5">{title}</h3>
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(92,225,230,0.15)', color: CYAN }}
                >
                  BESPLATNO
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* POOL OWNER TEASER BANNER                                      */}
        {/* ============================================================ */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
            className="rounded-[28px]"
            style={{
              background: 'rgba(10,40,52,0.55)',
              border: '1px solid rgba(46,255,136,0.30)',
              boxShadow: '0 0 40px rgba(46,255,136,0.10)',
              padding: '28px',
            }}
          >
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
              {/* Left / main content */}
              <div className="flex-1 min-w-0">
                {/* Tag */}
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-4 inline-block"
                  style={{ color: '#2EFF88' }}
                >
                  ZA VLASNIKE BAZENA · BESPLATNO
                </p>

                {/* Title */}
                <h2
                  className="font-bold text-white mb-3"
                  style={{ fontSize: 'clamp(26px, 4vw, 36px)', lineHeight: 1.15 }}
                >
                  Registrirajte svoj bazen i uštedite
                </h2>

                {/* Body */}
                <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Bez članarine i bez obveze. Pratite vodu, čuvajte povijest analiza i kupujte povoljnije.
                </p>

                {/* Benefit chips */}
                <div className="flex flex-wrap gap-2 mb-7">
                  {[
                    { Icon: Percent, label: '−10 % na kemiju i opremu' },
                    { Icon: BadgePercent, label: 'dodatnih −5 % iznad 2.000 €' },
                    { Icon: LineChart, label: 'povijest analiza i podsjetnici' },
                    { Icon: Wrench, label: 'pregled opreme na vašem bazenu' },
                  ].map(({ Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(46,255,136,0.10)', border: '1px solid rgba(46,255,136,0.20)', color: 'rgba(255,255,255,0.82)' }}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: '#2EFF88' }} />
                      {label}
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (localStorage.getItem('userRole') === 'member') {
                        onNavigate('member-portal');
                      } else {
                        onNavigate('member-register');
                      }
                    }}
                    className="sm:w-auto w-full px-6 py-3 text-sm font-bold rounded-full transition-all hover:opacity-90"
                    style={{ background: '#2EFF88', color: '#041820' }}
                  >
                    {localStorage.getItem('userRole') === 'member' ? 'Otvori Moj bazen' : 'Besplatna registracija'}
                  </button>
                  <button
                    onClick={() => onNavigate('products')}
                    className="sm:w-auto w-full px-6 py-3 text-sm font-semibold rounded-full transition-all hover:bg-white/8"
                    style={{ border: '1px solid rgba(46,255,136,0.40)', color: '#2EFF88' }}
                  >
                    Pogledaj opremu i kemiju
                  </button>
                </div>
                {localStorage.getItem('userRole') !== 'member' && (
                  <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Već imate Moj bazen?{' '}
                    <button onClick={() => onNavigate('login')} className="font-semibold underline" style={{ color: '#2EFF88' }}>
                      Prijavite se
                    </button>
                  </p>
                )}
              </div>

              {/* Right big number – desktop only */}
              <div className="hidden lg:flex flex-col items-center justify-center shrink-0 select-none" style={{ minWidth: 120 }}>
                <span
                  className="font-black leading-none"
                  style={{ fontSize: 64, color: '#2EFF88', lineHeight: 1 }}
                >
                  −15 %
                </span>
                <span className="text-xs mt-2 text-center" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 110 }}>
                  za narudžbe iznad 2.000 €
                </span>
              </div>
            </div>
          </motion.div>
        </section>


        {/* Prije i poslije čišćenja (klizač) */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
          <div className="max-w-[1100px] mx-auto">
            {/* Before/After slider card */}
            <div
              ref={cardRef}
              className="viz-card w-full rounded-3xl overflow-hidden relative select-none"
              style={{
                border: '1px solid rgba(120,220,255,0.12)',
                cursor: isDragging ? 'grabbing' : 'ew-resize',
                touchAction: 'pan-y',
                userSelect: 'none',
                background: '#041820',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* AFTER – day image (base layer) */}
              <img
                src={imgPoslijeDan}
                alt="Bazen poslije čišćenja"
                className="absolute inset-0 w-full h-full viz-img pointer-events-none"
                draggable={false}
                loading="lazy"
                decoding="async"
                width={1450}
                height={670}
                              />

              {/* BEFORE image – top layer, clipped by slider */}
              <img
                src={IMG_PRIJE_CISCENJA}
                alt="Bazen prije čišćenja"
                className="absolute inset-0 w-full h-full viz-img pointer-events-none"
                draggable={false}
                loading="lazy"
                decoding="async"
                width={1450}
                height={670}
                style={{
                  clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                  transition: sliderClipTrans,
                }}
              />

              {/* Cyan divider line */}
              <div
                className="absolute inset-y-0 pointer-events-none"
                style={{
                  left: `${sliderPos}%`,
                  width: 2,
                  transform: 'translateX(-50%)',
                  background: CYAN,
                  boxShadow: `0 0 12px ${CYAN}99`,
                  transition: sliderPosTrans,
                }}
              />

              {/* Drag handle */}
              <div
                className="absolute pointer-events-none flex items-center justify-center"
                style={{
                  left: `${sliderPos}%`,
                  top: '50%',
                  transform: 'translateX(-50%) translateY(-50%)',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.45), 0 0 0 2.5px rgba(92,225,230,0.4)',
                  transition: sliderPosTrans,
                }}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path
                    d="M1 5H13M13 5L10 2M13 5L10 8M1 5L4 2M1 5L4 8"
                    stroke="#041820"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Labels */}
              <div className="absolute bottom-3 left-3 pointer-events-none">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}
                >
                  Prije
                </span>
              </div>
              <div className="absolute bottom-3 right-3 pointer-events-none">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(4px)' }}
                >
                  Poslije
                </span>
              </div>

              {/* Accessible range input (keyboard navigation) */}
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round(sliderPos)}
                onChange={(e) => {
                  setAnimating(false);
                  draggingRef.current = false;
                  setIsDragging(false);
                  setSliderPos(Number(e.target.value));
                }}
                className="sr-only"
                aria-label="Pomicanje granice između slike Prije i Poslije"
              />
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* ODRŽAVANJE BAZENA – usluga Mondo Acque                        */}
        {/* ============================================================ */}
        <section id="odrzavanje" className="max-w-7xl mx-auto px-4 md:px-8 pb-24" style={{ scrollMarginTop: 90 }}>
          <div className="max-w-[1100px] mx-auto rounded-3xl p-6 md:p-10" style={{ background: CARD_BG, border: CARD_BORDER }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: CYAN }}>Održavanje bazena · cijela Hrvatska</p>
            <h2 className="font-extrabold text-white mb-8" style={{ fontSize: 'clamp(1.5rem, 3.8vw, 2.3rem)', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              Vi uživate, mi brinemo o vodi.
            </h2>

            <div className="grid md:grid-cols-2 gap-x-10 gap-y-4 mb-8">
              {[
                ['Redovno održavanje', 'Tjedno ili po dogovoru: čišćenje, usisavanje, kontrola i doziranje kemije.'],
                ['Otvaranje sezone', 'Priprema bazena i opreme za kupanje.'],
                ['Zatvaranje sezone i zimovanje', 'Zaštita bazena i opreme preko zime.'],
                ['Servis opreme', 'Filter i punjenje, pumpa, elektroliza, dozirne stanice.'],
                ['Zelena ili mutna voda', 'Vraćamo bistru vodu i otklanjamo uzrok.'],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" style={{ color: CYAN }} />
                  <div>
                    <p className="font-bold text-white text-sm sm:text-base">{title}</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-3" style={{ background: 'rgba(92,225,230,0.07)', border: '1px solid rgba(92,225,230,0.25)' }}>
              <div>
                <p className="font-bold text-white">Mondo Care · godišnji paket</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Godišnji pregled opreme i popust na proizvode za bazen.</p>
              </div>
              <p className="font-extrabold text-lg" style={{ color: CYAN }}>199 € / godišnje</p>
            </div>

            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Cijene održavanja na upit.</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/385952087321?text=${encodeURIComponent('Pozdrav, zanima me ponuda za održavanje bazena.\nMjesto: \nVeličina bazena: ')}`}
                target="_blank" rel="noopener noreferrer"
                className="px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2"
                style={{ background: CYAN, color: '#020D12' }}
              >
                <MessageCircle className="w-4 h-4" /> Zatražite ponudu za održavanje
              </a>
              <a
                href={`mailto:info@mondo-acqua.hr?subject=${encodeURIComponent('Upit za održavanje bazena')}`}
                className="px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2"
                style={{ border: `1px solid ${CYAN}`, color: CYAN }}
              >
                <Mail className="w-4 h-4" /> E-mail
              </a>
              <a
                href="tel:+385952087321"
                className="px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2"
                style={{ border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}
              >
                <Phone className="w-4 h-4" /> +385 95 208 7321
              </a>
            </div>
          </div>
        </section>


        {/* ============================================================ */}
        {/* SERVISERE                                                     */}
        {/* ============================================================ */}
        <section id="servisere" className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
          <h2
            className="font-extrabold text-white mb-3"
            style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', letterSpacing: '-0.02em' }}
          >
            {t.servisere.sectionTitle}
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            30{' '}
            {selectedLanguage === 'hr'
              ? 'dana besplatno probno razdoblje · bez obveze'
              : selectedLanguage === 'de'
              ? 'Tage kostenlos · keine Verpflichtung'
              : selectedLanguage === 'it'
              ? 'giorni gratis · nessun impegno'
              : 'days free trial · no commitment'}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { Icon: FileText, ...t.servisere.orders },
              { Icon: Users, ...t.servisere.employees },
              { Icon: Warehouse, ...t.servisere.storage },
              { Icon: BarChart3, ...t.servisere.reports },
            ].map(({ Icon, title, desc }) => (
              <motion.button
                key={title}
                whileHover={{ y: -4 }}
                onClick={() => onNavigate('login')}
                className="p-5 text-left rounded-3xl transition-all group"
                style={{ background: CARD_BG, border: CARD_BORDER }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(92,225,230,0.12)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: CYAN }} />
                </div>
                <h3 className="font-bold text-sm text-white mb-1">{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
              </motion.button>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('register')}
              className="px-7 py-3.5 text-sm font-bold rounded-full transition-all"
              style={{ background: ACCENT, color: '#0a0a0a', boxShadow: '0 6px 24px rgba(79,195,240,0.3)' }}
            >
              {t.servisere.ctaTrial}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('login')}
              className="px-7 py-3.5 text-sm font-semibold rounded-full flex items-center gap-2 transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}
            >
              <LogIn className="w-4 h-4" />
              {t.servisere.ctaLogin}
            </motion.button>
          </div>
        </section>

        {/* ============================================================ */}
        {/* FOOTER                                                        */}
        {/* ============================================================ */}
        <footer className="max-w-7xl mx-auto px-4 md:px-8 pb-10">
          <div
            className="rounded-3xl overflow-hidden p-8 md:p-10"
            style={{ background: CARD_BG, border: CARD_BORDER }}
          >
            {/* Top row */}
            <div className="grid md:grid-cols-3 gap-8 mb-8 pb-8" style={{ borderBottom: '1px solid rgba(120,220,255,0.08)' }}>
              {/* Brand */}
              <div>
                <div className="mb-3"><MondoLogo size={34} compact /></div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {t.footer.tagline}
                </p>
              </div>

              {/* Contact */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {t.footer.devBy}
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white">Vladimir Perić</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Mondo Acqua d.o.o. · Hrvatska</p>
                  <a href="mailto:info@mondo-acqua.hr" className="flex items-center gap-2 text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <Mail className="w-3.5 h-3.5" />
                    info@mondo-acqua.hr
                  </a>
                  <a href="tel:+385952087321" className="flex items-center gap-2 text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <Phone className="w-3.5 h-3.5" />
                    +385 95 208 7321
                  </a>
                  <a href="https://www.mondo-acqua.hr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <Building className="w-3.5 h-3.5" />
                    www.mondo-acqua.hr
                  </a>
                </div>
              </div>

              {/* IP / trademark */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {t.footer.legal}
                </p>
                <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {t.footer.ipText}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {t.footer.trademarkText}
                </p>
                <p
                  className="text-xs font-bold mt-3 px-2 py-1 rounded-lg inline-block"
                  style={{ background: 'rgba(92,225,230,0.1)', color: CYAN }}
                >
                  {t.footer.prohibited}
                </p>
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>
                <Copyright className="w-3 h-3" />
                <span>{t.footer.copyright}</span>
              </div>
              <div className="flex gap-5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <button className="hover:text-white transition-colors">{t.footer.privacy}</button>
                <button className="hover:text-white transition-colors">{t.footer.terms}</button>
                <button className="hover:text-white transition-colors">{t.footer.cookies}</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

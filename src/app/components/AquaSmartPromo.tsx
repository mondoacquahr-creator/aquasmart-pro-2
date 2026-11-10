import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ArrowLeft, ChevronLeft, ChevronRight, Droplets, Users, BarChart3, Package, Warehouse, Layers, FileText, TrendingUp, Settings, Shield, Zap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

import img1 from 'figma:asset/6b4b2ef47841f2941f3d33d658ac61eb92743a31.png';
import img2 from 'figma:asset/2030e5ed35019b3d73a08737dcbd0dd65ac3d3aa.png';
import visualizerImg from 'figma:asset/d1667fe5082cfc64105a776b49ca47d8d1029630.png';

const SCREENSHOTS = [
  {
    title: 'ACQUASMART PRO Platform',
    subtitle: 'Profesionalna Upravna Ploča',
    features: [
      'Upravljanje klijentima i bazenima',
      'Real-time analitika i izvještaji',
      'Integrirani radni nalozi'
    ],
    icon: BarChart3,
    image: img1,
    color: '#FF1744',
  },
  {
    title: 'Pool Visualizer™',
    subtitle: 'AR Vizualizacija sa Perspektivnom Transformacijom',
    features: [
      '4-točkasti polygon za označavanje',
      'AI-powered mesh warping',
      'Bucket fill za automatizirano popunjavanje'
    ],
    icon: Droplets,
    image: visualizerImg,
    color: '#00E0FF',
  },
  {
    title: 'Water Analysis Pro',
    subtitle: 'Laboratorijska Točnost za Profesionalce',
    features: [
      'pH, klor, alkalinitet - trenutno mjerenje',
      'Automatski tretmanski planovi',
      'History tracking za svaki bazen'
    ],
    icon: Layers,
    image: img2,
    color: '#2EFF88',
  },
  {
    title: 'Client Management',
    subtitle: 'CRM za Bazenski Biznis',
    features: [
      'Baza podataka svih klijenata',
      'Kontakt povijest i billing',
      'Automatska notifikacija i podsjetnici'
    ],
    icon: Users,
    image: 'https://images.unsplash.com/photo-1758599543129-5269a8f29e68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: '#FFD700',
  },
  {
    title: 'Team & Employee Hub',
    subtitle: 'Koordinacija Terenske Ekipe',
    features: [
      'Task assignment u realnom vremenu',
      'GPS tracking mobilnih timova',
      'Performance metrike i KPI'
    ],
    icon: Users,
    image: 'https://images.unsplash.com/photo-1769740333462-9a63bfa914bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: '#FF1744',
  },
  {
    title: 'Work Orders System',
    subtitle: 'Digitalizirani Radni Nalozi',
    features: [
      'Kreiranje, dodjeljivanje i praćenje naloga',
      'Foto dokumentacija prije/poslije',
      'Digitalno potpisivanje i odobravanje'
    ],
    icon: FileText,
    image: 'https://images.unsplash.com/photo-1688457462495-1440d81f4ddb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: '#00E0FF',
  },
  {
    title: 'Warehouse & Inventory',
    subtitle: 'Skladišno Poslovanje i Kemikalije',
    features: [
      'Praćenje zaliha u realnom vremenu',
      'Automatska narudžba pri low stock',
      'Cost tracking i profitability analiza'
    ],
    icon: Warehouse,
    image: 'https://images.unsplash.com/photo-1627915589334-14a3c3e3a741?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: '#2EFF88',
  },
  {
    title: 'Business Analytics',
    subtitle: 'Data-Driven Odlučivanje',
    features: [
      'Revenue tracking i profitabilnost',
      'Client retention metrics',
      'Predictive analytics za rast'
    ],
    icon: TrendingUp,
    image: 'https://images.unsplash.com/photo-1759752394755-1241472b589d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: '#FFD700',
  },
  {
    title: 'Pool Maintenance Pro',
    subtitle: 'Profesionalno Održavanje',
    features: [
      'Maintenance schedule automatizacija',
      'Equipment servicing tracking',
      'Preventative maintenance alerts'
    ],
    icon: Settings,
    image: 'https://images.unsplash.com/photo-1770387208660-ffc01897fd59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: '#FF1744',
  },
  {
    title: 'Premium Pool Showcase',
    subtitle: 'Portfolio & Marketing',
    features: [
      'Before/after gallery za klijente',
      'Social media integration',
      'Professional branding materials'
    ],
    icon: Droplets,
    image: 'https://images.unsplash.com/photo-1765814734934-9dd0d18509b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    color: '#00E0FF',
  },
];

interface AquaSmartPromoProps {
  onClose: () => void;
}

export function AquaSmartPromo({ onClose }: AquaSmartPromoProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SCREENSHOTS.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SCREENSHOTS.length) % SCREENSHOTS.length);

  const current = SCREENSHOTS[currentSlide];

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        nextSlide();
      }, 5000); // 5 seconds per slide
      return () => clearInterval(timer);
    }
  }, [isPlaying, currentSlide]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#000000' }}>
      {/* Ultra Modern Gradient Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]" 
          style={{ background: 'radial-gradient(circle, rgba(255,23,68,0.4) 0%, transparent 70%)' }}></div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]" 
          style={{ background: 'radial-gradient(circle, rgba(0,224,255,0.4) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 left-1/2 w-[700px] h-[700px] rounded-full opacity-10 blur-[120px]" 
          style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)' }}></div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '100px 100px'
      }}></div>

      {/* Header */}
      <div className="relative z-20 backdrop-blur-xl" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/5 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.7)' }} />
              </button>

              <div className="w-12 h-12 flex items-center justify-center rounded-2xl" 
                style={{ background: 'linear-gradient(135deg, #FF1744 0%, #FFD700 100%)' }}>
                <Play className="w-6 h-6" style={{ color: '#FFFFFF' }} />
              </div>
              
              <div>
                <h1 className="font-bold text-xl">Prezentacija</h1>
                <p className="text-sm gradient-text">ACQUASMART PRO Promo</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl text-sm font-medium" 
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)' }}>
                {currentSlide + 1} / {SCREENSHOTS.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left - Info with AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-3xl" 
                  style={{ 
                    background: `linear-gradient(135deg, ${current.color}20 0%, ${current.color}10 100%)`,
                    border: `1px solid ${current.color}30`
                  }}>
                  <current.icon className="w-10 h-10" style={{ color: current.color }} />
                </div>
                <h2 className="text-5xl font-bold mb-4" style={{ letterSpacing: '-0.03em' }}>
                  {current.title}
                </h2>
                <p className="text-2xl font-light" style={{ color: current.color }}>{current.subtitle}</p>
              </div>

              <div className="space-y-4 mb-10">
                {current.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.3 }}
                    className="p-5 rounded-2xl backdrop-blur-xl flex items-center gap-4"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: current.color }}></div>
                    <span className="font-medium text-base">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={prevSlide}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex-1 py-4 font-semibold flex items-center justify-center gap-3 rounded-2xl transition-all text-lg"
                  style={{ 
                    background: isPlaying ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #FF1744 0%, #FFD700 100%)',
                    border: isPlaying ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    color: '#FFFFFF'
                  }}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>Pauziraj Auto-Play</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Pokreni Auto-Play</span>
                    </>
                  )}
                </button>

                <button
                  onClick={nextSlide}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {SCREENSHOTS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className="h-2 transition-all rounded-full"
                    style={{
                      width: currentSlide === idx ? '40px' : '8px',
                      background: currentSlide === idx ? current.color : 'rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right - Screenshot with AnimatePresence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`img-${currentSlide}`}
              initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.95, rotateY: 10 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="relative"
              style={{ perspective: '1000px' }}
            >
              <div className="p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                
                {/* Image */}
                <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {current.image.startsWith('http') ? (
                    <ImageWithFallback
                      src={current.image}
                      alt={current.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={current.image}
                      alt={current.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ 
                      background: `linear-gradient(135deg, ${current.color}10 0%, transparent 50%)`
                    }}></div>
                </div>
              </div>

              {/* Decorative glow behind image */}
              <div 
                className="absolute inset-0 -z-10 filter blur-[60px] opacity-40"
                style={{ background: current.color }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Feature Grid Below */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4" style={{ letterSpacing: '-0.03em' }}>
              Kompletno Rješenje za <span className="gradient-text">Profesionalce</span>
            </h3>
            <p className="text-xl" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Sve što vam treba za upravljanje bazenskim biznisom na jednom mjestu
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Droplets, title: 'Pool Visualizer', desc: 'AR vizualizacija', color: '#00E0FF' },
              { icon: Users, title: 'Team Management', desc: 'Upravljanje timom', color: '#FF1744' },
              { icon: Package, title: 'Inventory', desc: 'Skladišno poslovanje', color: '#FFD700' },
              { icon: Shield, title: 'Security', desc: 'Enterprise zaštita', color: '#2EFF88' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 text-center rounded-2xl backdrop-blur-xl hover:scale-105 transition-transform"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-2xl" 
                  style={{ background: `${item.color}20` }}>
                  <item.icon className="w-8 h-8" style={{ color: item.color }} />
                </div>
                <h4 className="font-bold mb-2 text-lg">{item.title}</h4>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
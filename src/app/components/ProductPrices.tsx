import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Euro, TrendingUp, ShoppingCart, Minus, Plus, Loader2, CheckCircle, Box, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PackagingIcon } from './PackagingIcon';
import { MondoFooter } from './MondoFooter';
import { api } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

// Cijenik prema shop.ivero.hr
const products = [
  {
    category: 'pH Regulatori',
    items: [
      { name: 'pH Plus Granule', size: '1 kg', priceEUR: 4.75, priceHRK: 35.79, description: 'Povećava pH vrijednost bazenske vode' },
      { name: 'pH Plus Granule', size: '5 kg', priceEUR: 19.75, priceHRK: 148.80, description: 'Povećava pH vrijednost bazenske vode' },
      { name: 'pH Minus Granule', size: '1 kg', priceEUR: 4.75, priceHRK: 35.79, description: 'Smanjuje pH vrijednost bazenske vode' },
      { name: 'pH Minus Granule', size: '5 kg', priceEUR: 19.75, priceHRK: 148.80, description: 'Smanjuje pH vrijednost bazenske vode' },
      { name: 'pH Minus - Sumporna Kiselina 5–15%', size: '5 L', priceEUR: 10.00, priceHRK: 75.35, description: 'Tekući regulator pH — sumporna kiselina' },
    ]
  },
  {
    category: 'Dezinfekcija - Klor',
    items: [
      { name: 'Klor Granule', size: '1 kg', priceEUR: 11.55, priceHRK: 87.01, description: 'Dezinficijens s 56% aktivnog klora, brzo otapanje' },
      { name: 'Klor Granule', size: '5 kg', priceEUR: 47.25, priceHRK: 356.06, description: 'Dezinficijens s 56% aktivnog klora, brzo otapanje' },
      { name: 'Klor Tablete 200 g', size: '1 kg', priceEUR: 13.75, priceHRK: 103.60, description: 'Tablete s 90% aktivnog klora, sporo otapanje' },
      { name: 'Klor Tablete 200 g', size: '5 kg', priceEUR: 48.00, priceHRK: 361.66, description: 'Tablete s 90% aktivnog klora, sporo otapanje' },
      { name: 'Klor Tablete 20 g', size: '1 kg', priceEUR: 15.00, priceHRK: 113.02, description: 'Male tablete za skimmer i dozatore' },
      { name: 'Klor Tablete 20 g', size: '5 kg', priceEUR: 57.00, priceHRK: 429.47, description: 'Male tablete za skimmer i dozatore' },
      { name: 'Multifunkcionalne Tablete 200 g', size: '1 kg', priceEUR: 11.55, priceHRK: 87.01, description: 'Klor + algistat + flokulant, tablete 200 g' },
      { name: 'Multifunkcionalne Tablete 200 g', size: '5 kg', priceEUR: 47.25, priceHRK: 356.06, description: 'Klor + algistat + flokulant, tablete 200 g' },
      { name: 'Multifunkcionalne Tablete 20 g', size: '1 kg', priceEUR: 12.08, priceHRK: 91.04, description: 'Male multifunkcionalne tablete za dozatore' },
      { name: 'Multifunkcionalne Tablete 20 g', size: '5 kg', priceEUR: 48.30, priceHRK: 363.92, description: 'Male multifunkcionalne tablete za dozatore' },
      { name: 'Klor Minus', size: '1 kg', priceEUR: 6.88, priceHRK: 51.84, description: 'Neutralizira višak slobodnog klora' },
      { name: 'Klor Minus', size: '5 kg', priceEUR: 30.00, priceHRK: 226.04, description: 'Neutralizira višak slobodnog klora' },
      { name: 'Stabilizator Klora', size: '1 kg', priceEUR: 20.00, priceHRK: 150.69, description: 'Cijanurna kiselina — štiti klor od UV zraka' },
      { name: 'Stabilizator Klora', size: '5 kg', priceEUR: 87.50, priceHRK: 659.52, description: 'Cijanurna kiselina — štiti klor od UV zraka' },
    ]
  },
  {
    category: 'Algicidi',
    items: [
      { name: 'Algicid Premium', size: '1 L', priceEUR: 13.25, priceHRK: 99.83, description: 'Visokokoncentrirani algicid za brzo djelovanje' },
      { name: 'Ivero Algacid', size: '1 L', priceEUR: 5.20, priceHRK: 39.18, description: 'Preventivni algicid za redovno održavanje' },
    ]
  },
  {
    category: 'Flokulanti',
    items: [
      { name: 'Ivero Flokulant', size: '1 L', priceEUR: 5.00, priceHRK: 37.67, description: 'Tekući flokulant za bistrenje vode' },
      { name: 'Ivero Flokulant', size: '5 L', priceEUR: 22.50, priceHRK: 169.53, description: 'Tekući flokulant za bistrenje vode' },
    ]
  },
  {
    category: 'Zimovanje',
    items: [
      { name: 'Ivero Winter', size: '1 L', priceEUR: 6.10, priceHRK: 45.97, description: 'Zimska zaštita bazena od algi i kamenca' },
    ]
  },
  {
    category: 'Čišćenje i Dezinfekcija',
    items: [
      { name: 'Ivekor', size: '1 L', priceEUR: 6.88, priceHRK: 51.84, description: 'Uklanja kamenac i hrđu s površina bazena, PE/PVC i inox' },
      { name: 'Ivekor', size: '5 L', priceEUR: 31.25, priceHRK: 235.46, description: 'Uklanja kamenac i hrđu s površina bazena, PE/PVC i inox' },
      { name: 'Ivero Cleaner A', size: '5 L', priceEUR: 31.25, priceHRK: 235.46, description: 'Uklanja kamenac s aluminijskih površina i izvanbrodskih motora' },
      { name: 'Ivero Cleaner A', size: '10 L', priceEUR: 52.50, priceHRK: 395.56, description: 'Uklanja kamenac s aluminijskih površina i izvanbrodskih motora' },
      { name: 'Ivero Cleaner K', size: '1 L', priceEUR: 4.38, priceHRK: 33.00, description: 'Sredstvo za čišćenje i odmaščivanje površina' },
      { name: 'Ivero Cleaner K', size: '5 L', priceEUR: 16.88, priceHRK: 127.21, description: 'Sredstvo za čišćenje i odmaščivanje površina' },
      { name: 'Flexpower Disinfectant', size: '750 ml', priceEUR: 4.65, priceHRK: 35.04, description: 'Alkoholni dezinficijens za ruke, površine i objekte' },
      { name: 'Flexpower Disinfectant', size: '5 L', priceEUR: 17.25, priceHRK: 129.98, description: 'Alkoholni dezinficijens za ruke, površine i objekte' },
    ]
  },
  {
    category: 'Test Oprema',
    items: [
      { name: 'Pooltester', size: '1 kom', priceEUR: 26.25, priceHRK: 197.78, description: 'Mjerač slobodnog klora i pH vrijednosti u vodi' },
      { name: 'DPD Tablete za Pooltester', size: '10 kom', priceEUR: 1.99, priceHRK: 15.00, description: 'Reagensne tablete za mjerenje slobodnog klora' },
      { name: 'Phenol Red Tablete za Pooltester', size: '10 kom', priceEUR: 1.99, priceHRK: 15.00, description: 'Reagensne tablete za mjerenje pH vrijednosti' },
      { name: 'Termometar Plutajući', size: '1 kom', priceEUR: 10.00, priceHRK: 75.35, description: 'Plutajući termometar za mjerenje temperature bazena' },
    ]
  },
  {
    category: 'Kiseline i Soli',
    items: [
      { name: 'Solna Kiselina 9%', size: '1 L', priceEUR: 1.15, priceHRK: 8.67, description: 'Anorganska kiselina za čišćenje i pH korekciju' },
      { name: 'Solna Kiselina 9%', size: '5 L', priceEUR: 5.11, priceHRK: 38.51, description: 'Anorganska kiselina za čišćenje i pH korekciju' },
      { name: 'Solna Kiselina 18–20%', size: '1 L', priceEUR: 2.18, priceHRK: 16.43, description: 'Jača koncentracija solne kiseline' },
      { name: 'Solna Kiselina 18–20%', size: '5 L', priceEUR: 9.31, priceHRK: 70.16, description: 'Jača koncentracija solne kiseline' },
      { name: 'Tabletirana Sol', size: '25 kg', priceEUR: 16.59, priceHRK: 124.99, description: 'Tabletirana sol za omekšivače vode' },
      { name: 'Natrijev Hidroksid', size: '1 kg', priceEUR: 6.25, priceHRK: 47.09, description: 'Natrijev hidroksid (lužina) za industrijske primjene' },
    ]
  },
  {
    category: 'Ostali Proizvodi',
    items: [
      { name: 'Demineralizirana Voda', size: '1 L', priceEUR: 0.66, priceHRK: 4.97, description: 'Demineralizirana voda za akumulatore i uređaje' },
      { name: 'Demineralizirana Voda', size: '5 L', priceEUR: 2.92, priceHRK: 22.00, description: 'Demineralizirana voda za akumulatore i uređaje' },
      { name: 'Silika Gel Bijeli 3–5 mm', size: '700 g', priceEUR: 15.00, priceHRK: 113.02, description: 'Silikatni gel za apsorpciju vlage' },
    ]
  },
];

export function ProductPrices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const updateQuantity = (name: string, delta: number) => {
    setCart(prev => {
      const current = prev[name] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: next };
    });
  };

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const calculateTotal = () => {
    let total = 0;
    products.forEach(cat => {
      cat.items.forEach(item => {
        if (cart[item.name]) {
          total += item.priceEUR * cart[item.name];
        }
      });
    });
    return total;
  };

  const totalWithVat = calculateTotal();
  const vatAmount = totalWithVat - (totalWithVat / 1.25);
  const totalBase = totalWithVat / 1.25;

  const handleOrder = async () => {
    if (cartItemCount === 0 || !user) {
      if (!user) toast.error('Morate biti prijavljeni za narudžbu.');
      return;
    }

    setIsSubmitting(true);
    const orderItems = [];
    products.forEach(cat => {
      cat.items.forEach(item => {
        if (cart[item.name]) {
          orderItems.push({
            id: item.name.toLowerCase().replace(/\s+/g, '-'),
            name: item.name,
            size: item.size,
            price: item.priceEUR,
            quantity: cart[item.name]
          });
        }
      });
    });

    // Save to global cart for the "Košarica" page
    localStorage.setItem('aquasmart_cart', JSON.stringify(orderItems));

    try {
      await api.post('orders/submit', {
        items: orderItems,
        totalWithVat: totalWithVat,
        note: `Narudžba od ${user.email} (iz cjenika)`
      });
      
      setShowSuccess(true);
      setCart({});
      localStorage.removeItem('aquasmart_cart'); // Clear after success
      toast.success('Narudžba je uspješno poslana Mondo Acqua timu!');
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      toast.error('Greška pri slanju narudžbe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white sticky top-0 z-10 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            {cartItemCount > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleOrder}
                disabled={isSubmitting}
                className="bg-white text-amber-600 px-4 py-2 rounded-xl font-bold flex flex-col items-end gap-0 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                  Naruči ({cartItemCount})
                </div>
                <span className="text-[10px] opacity-70">{totalWithVat.toFixed(2)} € (s PDV)</span>
              </motion.button>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Package className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">IVERO Cijenik</h1>
              <p className="text-amber-100">Profesionalna bazenska kemija - Mondo Acqua</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 p-4 rounded-2xl mb-8 flex items-center gap-3"
            >
              <CheckCircle className="w-6 h-6" />
              <p className="font-medium">Vaša narudžba je primljena! Mondo Acqua će vas kontaktirati uskoro.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 border border-amber-500/20 rounded-3xl p-6 text-white shadow-2xl mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-7 h-7 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2 text-amber-500">Narudžbe i Dostava</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Odaberite proizvode i količinu. Nakon klika na "Naruči", vaš zahtjev se šalje izravno Mondo Acqua agentima koji će pripremiti ponudu i dogovoriti dostavu.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Currency Info */}
        <div className="flex items-center gap-4 mb-6 justify-center flex-wrap">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <Euro className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold text-slate-300">Cijene s PDV-om</span>
          </div>
          <div className="text-xs text-slate-500">Konverzija: 1 EUR = 7.53450 HRK</div>
        </div>

        {/* Products by Category */}
        <div className="space-y-12">
          {products.map((category, catIndex) => (
            <div key={catIndex} className="space-y-4">
              <h2 className="text-2xl font-bold text-amber-500 pl-2 border-l-4 border-amber-500 uppercase tracking-wider">
                {category.category}
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {category.items.map((product, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -4 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 shadow-lg hover:border-amber-500/30 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-2 mt-1">
                        <PackagingIcon 
                          sizeString={product.size} 
                          iconSize={32} 
                          showLabel 
                          className="p-2"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white text-lg">{product.name}</h3>
                          <span className="text-xs font-bold px-2 py-1 bg-slate-700 text-amber-500 rounded-md">
                            {product.size}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">{product.description}</p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-amber-500">{product.priceEUR.toFixed(2)} €</span>
                        <span className="text-xs text-slate-500">~{product.priceHRK.toFixed(2)} kn</span>
                      </div>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-1 border border-slate-700">
                        <button 
                          onClick={() => updateQuantity(product.name, -1)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-white">
                          {cart[product.name] || 0}
                        </span>
                        <button 
                          onClick={() => updateQuantity(product.name, 1)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-amber-500 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-16 text-center space-y-4 border-t border-slate-800 pt-8">
          <p className="text-slate-400 text-sm">Za specifične upite ili veleprodaju:</p>
          <div className="flex justify-center gap-6">
            <a href="tel:+385952087321" className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
              📞 +385 95 208 7321 (WhatsApp support)
            </a>
            <a href="mailto:info@mondo-acqua.hr" className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
              ✉️ info@mondo-acqua.hr
            </a>
          </div>
          <a href="https://www.mondo-acqua.hr" target="_blank" rel="noopener noreferrer" className="text-amber-500 font-bold hover:text-amber-400 transition-colors inline-block">
            🌐 www.mondo-acqua.hr
          </a>
        </div>
      </div>

      {/* Cart Summary (Mobile Sticky) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-24 inset-x-4 md:hidden">
          <button 
            onClick={handleOrder}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white p-4 rounded-2xl shadow-2xl font-bold flex flex-col gap-1"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Vaša narudžba ({cartItemCount})</span>
              </div>
              <span>{totalWithVat.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between w-full text-[10px] text-amber-100/70 border-t border-white/20 pt-1">
              <span>Uključuje PDV (25%)</span>
              <span>Osnovica: {totalBase.toFixed(2)} €</span>
            </div>
          </button>
        </div>
      )}

      <MondoFooter />
    </div>
  );
}
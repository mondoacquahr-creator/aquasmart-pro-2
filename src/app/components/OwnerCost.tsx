import { useNavigate, useLocation } from 'react-router';
import { 
  ArrowLeft, DollarSign, Package, TrendingDown, 
  ShoppingCart, Mail, Plus, Minus, Check, X, Search 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MondoFooter } from './MondoFooter';
import { calculateTreatmentCost, IVERO_PRICES } from '../lib/productPrices';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface OrderItem {
  id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  originalRec?: any;
}

export function OwnerCost() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session } = useAuth();
  const results = location.state?.results;

  // Default demo data if no results provided
  const defaultRecommendations = [
    { 
      productId: 'ph-minus',
      productName: 'pH Minus', 
      quantity: 500,
      unit: 'g',
      dosage: '500g', 
      instructions: 'Dodati polako uz cirkulaciju',
      priority: 1,
      category: 'ph'
    },
    { 
      productId: 'chlorine-granules',
      productName: 'Klor granule', 
      quantity: 200,
      unit: 'g',
      dosage: '200g', 
      instructions: 'Rasporediti ravnomjerno',
      priority: 2,
      category: 'chlorine'
    },
  ];

  const recommendations = results?.recommendations || defaultRecommendations;
  
  // Calculate treatment cost once to get initial items
  const initialTreatment = useMemo(() => calculateTreatmentCost(recommendations), [recommendations]);

  // State for selected items
  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    // Try to load from localStorage first (unified cart)
    const savedCart = localStorage.getItem('aquasmart_cart');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        if (items.length > 0) return items;
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
      }
    }
    
    // Fallback to recommendations if no saved cart
    return initialTreatment.items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      size: item.product.size,
      price: item.product.priceEUR,
      quantity: item.quantity,
      originalRec: item
    }));
  });

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('aquasmart_cart', JSON.stringify(orderItems));
  }, [orderItems]);

  // State for search/catalog
  const [showCatalog, setShowCatalog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter catalog items
  const catalogItems = useMemo(() => {
    return Object.values(IVERO_PRICES).filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const toggleItem = (item: OrderItem) => {
    setOrderItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const totalEUR = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalHRK = totalEUR * 7.53;

  const handleOrderSubmit = async () => {
    if (!user) {
      toast.error('Morate biti prijavljeni za slanje narudžbe');
      navigate('/login');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Odaberite barem jedan proizvod');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-381f82bd/orders/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
        },
        body: JSON.stringify({
          items: orderItems,
          totalWithVat: totalEUR, // Backend expects price including VAT
          note: `Narudžba generirana iz analize bazena.`,
        })
      });

      if (!response.ok) throw new Error('Greška pri slanju narudžbe');

      toast.success('Narudžba je uspješno poslana!');
      setTimeout(() => navigate('/owner'), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Došlo je do greške. Pokušajte ponovno.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [email, setEmail] = useState(user?.email || '');

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-20 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-[#D4AF37]" />
              <h1 className="text-xl font-bold text-white uppercase tracking-tight">Košarica & Narudžba</h1>
            </div>
          </div>
          <button 
            onClick={() => setShowCatalog(true)}
            className="flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-xl border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-all font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Dodaj još
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Total Cost Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-[#D4AF37]/30 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="text-center relative z-10">
            <div className="w-16 h-16 bg-[#D4AF37]/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/30">
              <ShoppingCart className="w-9 h-9 text-[#D4AF37]" />
            </div>
            <h2 className="text-sm text-[#D4AF37] mb-2 uppercase tracking-[0.2em] font-black">Ukupno za naplatu</h2>
            <div className="text-6xl font-black mb-2 text-white tabular-nums tracking-tighter">
              {totalEUR.toFixed(2)} <span className="text-2xl text-[#D4AF37] font-medium">€</span>
            </div>
            <div className="text-lg text-slate-400 font-medium">~ {totalHRK.toFixed(2)} HRK</div>
          </div>
        </motion.div>

        {/* Selected Products List */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl p-6 shadow-md border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-3">
              <div className="w-2 h-8 bg-[#D4AF37] rounded-full"></div>
              Odabrani proizvodi
            </h3>
            <span className="text-xs bg-white/10 text-white px-3 py-1 rounded-full font-bold">{orderItems.length} ARTIKALA</span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {orderItems.length > 0 ? (
                orderItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-slate-800/40 rounded-2xl p-4 border border-white/5 group hover:border-[#D4AF37]/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center border border-white/5 shrink-0">
                        <Package className="w-7 h-7 text-slate-500 group-hover:text-[#D4AF37] transition-colors" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate text-lg">{item.name}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-400 font-medium">{item.size}</p>
                          {item.originalRec && (
                            <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-full font-bold border border-[#D4AF37]/20 uppercase">
                              Preporučeno
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2 bg-slate-950 rounded-lg p-1 border border-white/5">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-black text-white tabular-nums">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-white">{(item.price * item.quantity).toFixed(2)} €</div>
                          <button 
                            onClick={() => toggleItem(item)}
                            className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wider transition-colors"
                          >
                            Ukloni
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center bg-slate-900/30 rounded-3xl border-2 border-dashed border-white/5">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-10 h-10 text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-bold text-xl mb-2">Vaša košarica je prazna</p>
                  <p className="text-slate-500 text-sm mb-8 max-w-[200px] mx-auto">Dodajte preporučene proizvode ili pretražite katalog.</p>
                  <button 
                    onClick={() => setShowCatalog(true)}
                    className="bg-[#D4AF37] text-slate-950 px-8 py-3 rounded-xl font-black hover:bg-[#B8860B] transition-all flex items-center gap-2 mx-auto"
                  >
                    <Search className="w-5 h-5" /> PRELISTAJ KATALOG
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={orderItems.length === 0 || isSubmitting}
            onClick={handleOrderSubmit}
            className="w-full bg-[#D4AF37] text-slate-950 py-5 rounded-2xl transition-all shadow-2xl shadow-yellow-500/10 font-black flex items-center justify-center gap-3 text-xl disabled:opacity-20 disabled:cursor-not-allowed uppercase tracking-tight"
          >
            {isSubmitting ? (
              <div className="w-7 h-7 border-4 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-7 h-7" />
            )}
            NARUČI ODABRANO
          </motion.button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                const subject = 'Narudžba - AquaSmart Pro';
                const itemsList = orderItems.map(i => `- ${i.name} (${i.size}) x${i.quantity} = ${(i.price * i.quantity).toFixed(2)}€`).join('\n');
                const body = `Pozdrav Mondo Acqua,\n\nŽelim naručiti sljedeće proizvode:\n\n${itemsList}\n\nUkupno: ${totalEUR.toFixed(2)} €\n\nIme:\nKontakt broj:`;
                window.location.href = `mailto:info@mondo-acqua.hr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              }}
              className="flex items-center justify-center gap-2 bg-slate-900 border border-white/10 text-slate-300 py-4 rounded-2xl hover:bg-slate-800 transition-all font-bold text-sm uppercase"
            >
              <Mail className="w-5 h-5" />
              NARUDŽBENICA (EMAIL)
            </button>
            <button
              onClick={() => navigate('/owner-analysis')}
              className="flex items-center justify-center gap-2 bg-slate-900 border border-white/10 text-slate-300 py-4 rounded-2xl hover:bg-slate-800 transition-all font-bold text-sm uppercase"
            >
              <TrendingDown className="w-5 h-5" />
              NOVA ANALIZA
            </button>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/owner')}
          className="w-full text-slate-500 py-4 rounded-2xl hover:text-slate-300 transition-all font-bold uppercase tracking-widest text-xs"
        >
          Povratak na nadzornu ploču
        </button>
      </div>

      {/* Catalog Modal */}
      <AnimatePresence>
        {showCatalog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCatalog(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-[#D4AF37]/30 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Katalog proizvoda</h3>
                  <p className="text-sm text-[#D4AF37] font-medium tracking-wide">Dodajte artikle u svoju narudžbu</p>
                </div>
                <button 
                  onClick={() => setShowCatalog(false)}
                  className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-8 py-6 border-b border-white/5 bg-slate-900/30">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[#D4AF37] transition-colors" />
                  <input 
                    type="text"
                    placeholder="Pretraži Ivero asortiman..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Products List */}
              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {catalogItems.length > 0 ? (
                  catalogItems.map((product) => {
                    const isAdded = orderItems.some(i => i.id === product.id);
                    return (
                      <div 
                        key={product.id}
                        className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${
                          isAdded 
                          ? 'bg-[#D4AF37]/5 border-[#D4AF37]/40 shadow-lg shadow-yellow-500/5' 
                          : 'bg-slate-800/30 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                            isAdded ? 'bg-[#D4AF37] text-slate-950' : 'bg-slate-700 text-slate-400'
                          }`}>
                            <Package className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-lg">{product.name}</h4>
                            <p className="text-sm text-slate-400 font-medium">{product.size}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-xl font-black text-white tabular-nums">{product.priceEUR.toFixed(2)} €</div>
                          </div>
                          <button
                            onClick={() => toggleItem({
                              id: product.id,
                              name: product.name,
                              size: product.size,
                              price: product.priceEUR,
                              quantity: 1
                            })}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                              isAdded 
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                              : 'bg-[#D4AF37] text-slate-950 hover:scale-110 active:scale-95'
                            }`}
                          >
                            {isAdded ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-bold">Nema rezultata za "{searchTerm}"</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-white/5 bg-slate-950/50 backdrop-blur-md">
                <button 
                  onClick={() => setShowCatalog(false)}
                  className="w-full bg-[#D4AF37] text-slate-950 py-5 rounded-[1.5rem] font-black hover:bg-[#B8860B] transition-all shadow-xl shadow-yellow-500/10 uppercase tracking-wider"
                >
                  DODAJ ODABRANO ({orderItems.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MondoFooter />
    </div>
  );
}

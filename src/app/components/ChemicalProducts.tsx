import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Package, Beaker, Droplets, ShoppingCart, Search, Star, ArrowLeft, Plus, Minus, X } from 'lucide-react';
import { T } from '../lib/theme';
import { WaterBackground } from './WaterBackground';

interface ChemicalProductsProps {
  onBack: () => void;
}

export function ChemicalProducts({ onBack }: ChemicalProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'Sve kategorije', icon: Package },
    { id: 'ph-regulators', label: 'pH regulatori', icon: Droplets },
    { id: 'chlorine', label: 'Klor proizvodi', icon: Beaker },
    { id: 'algicides', label: 'Algicidi', icon: Star },
    { id: 'flocculants', label: 'Flokulanti', icon: Droplets },
    { id: 'winterization', label: 'Zimovanje', icon: Package },
    { id: 'test-kits', label: 'Test oprema', icon: Beaker },
  ];

  // Products sourced from shop.ivero.hr
  const products = [
    // pH REGULATORI
    { id: 1, name: 'pH Plus Granule', brand: 'Ivero', category: 'ph-regulators', price: 4.75, size: '1 kg', description: 'Povećava pH vrijednost bazenske vode', rating: 4.8, inStock: true, image: 'ph-plus' },
    { id: 2, name: 'pH Plus Granule', brand: 'Ivero', category: 'ph-regulators', price: 19.75, size: '5 kg', description: 'Povećava pH vrijednost bazenske vode', rating: 4.8, inStock: true, image: 'ph-plus' },
    { id: 3, name: 'pH Minus Granule', brand: 'Ivero', category: 'ph-regulators', price: 4.75, size: '1 kg', description: 'Smanjuje pH vrijednost bazenske vode', rating: 4.9, inStock: true, image: 'ph-minus' },
    { id: 4, name: 'pH Minus Granule', brand: 'Ivero', category: 'ph-regulators', price: 19.75, size: '5 kg', description: 'Smanjuje pH vrijednost bazenske vode', rating: 4.9, inStock: true, image: 'ph-minus' },
    { id: 5, name: 'pH Minus - Sumporna Kiselina 5–15%', brand: 'Ivero', category: 'ph-regulators', price: 10.00, size: '5 L', description: 'Tekući regulator pH, sumporna kiselina', rating: 4.7, inStock: true, image: 'ph-minus-liquid' },

    // KLOR PROIZVODI
    { id: 6, name: 'Klor Granule', brand: 'Ivero', category: 'chlorine', price: 11.55, size: '1 kg', description: 'Dezinficijens s 56% aktivnog klora, brzo otapanje', rating: 4.9, inStock: true, image: 'chlorine-granular' },
    { id: 7, name: 'Klor Granule', brand: 'Ivero', category: 'chlorine', price: 47.25, size: '5 kg', description: 'Dezinficijens s 56% aktivnog klora, brzo otapanje', rating: 4.9, inStock: true, image: 'chlorine-granular' },
    { id: 8, name: 'Klor Tablete 200 g', brand: 'Ivero', category: 'chlorine', price: 13.75, size: '1 kg', description: 'Sporo otapajuće tablete, 90% aktivnog klora', rating: 4.8, inStock: true, image: 'chlorine-tablets' },
    { id: 9, name: 'Klor Tablete 200 g', brand: 'Ivero', category: 'chlorine', price: 48.00, size: '5 kg', description: 'Sporo otapajuće tablete, 90% aktivnog klora', rating: 4.8, inStock: true, image: 'chlorine-tablets' },
    { id: 10, name: 'Klor Tablete 20 g', brand: 'Ivero', category: 'chlorine', price: 15.00, size: '1 kg', description: 'Male tablete za skimmer i automatske dozatore', rating: 4.7, inStock: true, image: 'chlorine-mini' },
    { id: 11, name: 'Klor Tablete 20 g', brand: 'Ivero', category: 'chlorine', price: 57.00, size: '5 kg', description: 'Male tablete za skimmer i automatske dozatore', rating: 4.7, inStock: true, image: 'chlorine-mini' },
    { id: 12, name: 'Multifunkcionalne Tablete 200 g', brand: 'Ivero', category: 'chlorine', price: 11.55, size: '1 kg', description: 'Klor + algistat + flokulant u jednoj tableti', rating: 4.8, inStock: true, image: 'multi-tablet' },
    { id: 13, name: 'Multifunkcionalne Tablete 200 g', brand: 'Ivero', category: 'chlorine', price: 47.25, size: '5 kg', description: 'Klor + algistat + flokulant u jednoj tableti', rating: 4.8, inStock: true, image: 'multi-tablet' },
    { id: 14, name: 'Multifunkcionalne Tablete 20 g', brand: 'Ivero', category: 'chlorine', price: 12.08, size: '1 kg', description: 'Male multifunkcionalne tablete za dozatore', rating: 4.7, inStock: true, image: 'multi-tablet' },
    { id: 15, name: 'Multifunkcionalne Tablete 20 g', brand: 'Ivero', category: 'chlorine', price: 48.30, size: '5 kg', description: 'Male multifunkcionalne tablete za dozatore', rating: 4.7, inStock: true, image: 'multi-tablet' },
    { id: 16, name: 'Klor Minus', brand: 'Ivero', category: 'chlorine', price: 6.88, size: '1 kg', description: 'Neutralizira višak slobodnog klora u vodi', rating: 4.6, inStock: true, image: 'chlorine-minus' },
    { id: 17, name: 'Klor Minus', brand: 'Ivero', category: 'chlorine', price: 30.00, size: '5 kg', description: 'Neutralizira višak slobodnog klora u vodi', rating: 4.6, inStock: true, image: 'chlorine-minus' },
    { id: 18, name: 'Stabilizator Klora', brand: 'Ivero', category: 'chlorine', price: 20.00, size: '1 kg', description: 'Cijanurna kiselina — zaštita klora od UV zraka', rating: 4.7, inStock: true, image: 'stabilizer' },
    { id: 19, name: 'Stabilizator Klora', brand: 'Ivero', category: 'chlorine', price: 87.50, size: '5 kg', description: 'Cijanurna kiselina — zaštita klora od UV zraka', rating: 4.7, inStock: true, image: 'stabilizer' },

    // ALGICIDI
    { id: 20, name: 'Algicid Premium', brand: 'Ivero', category: 'algicides', price: 13.25, size: '1 L', description: 'Visokokoncentrirani algicid, brzo djelovanje', rating: 4.9, inStock: true, image: 'algicide-super' },
    { id: 21, name: 'Ivero Algacid', brand: 'Ivero', category: 'algicides', price: 5.20, size: '1 L', description: 'Preventivni algicid za redovno održavanje', rating: 4.7, inStock: true, image: 'algicide' },

    // FLOKULANTI
    { id: 22, name: 'Ivero Flokulant', brand: 'Ivero', category: 'flocculants', price: 5.00, size: '1 L', description: 'Tekući flokulant za bistrenje bazenske vode', rating: 4.7, inStock: true, image: 'flocculant-liquid' },
    { id: 23, name: 'Ivero Flokulant', brand: 'Ivero', category: 'flocculants', price: 22.50, size: '5 L', description: 'Tekući flokulant za bistrenje bazenske vode', rating: 4.7, inStock: true, image: 'flocculant-liquid' },

    // ZIMOVANJE
    { id: 24, name: 'Ivero Winter', brand: 'Ivero', category: 'winterization', price: 6.10, size: '1 L', description: 'Zimska zaštita bazena — sprječava alge i kamenac', rating: 4.8, inStock: true, image: 'winter' },

    // TEST OPREMA
    { id: 25, name: 'Pooltester', brand: 'Ivero', category: 'test-kits', price: 26.25, size: '1 kom', description: 'Mjerač slobodnog klora i pH vrijednosti', rating: 4.9, inStock: true, image: 'test-kit' },
    { id: 26, name: 'DPD Tablete za Pooltester', brand: 'Ivero', category: 'test-kits', price: 1.99, size: '10 kom', description: 'Reagensne tablete za mjerenje klora', rating: 4.8, inStock: true, image: 'test-tablets' },
    { id: 27, name: 'Phenol Red Tablete za Pooltester', brand: 'Ivero', category: 'test-kits', price: 1.99, size: '10 kom', description: 'Reagensne tablete za mjerenje pH', rating: 4.8, inStock: true, image: 'test-tablets' },
    { id: 28, name: 'Termometar Plutajući', brand: 'Ivero', category: 'test-kits', price: 10.00, size: '1 kom', description: 'Plutajući termometar za bazen', rating: 4.6, inStock: true, image: 'thermometer' },
  ];

  const filteredProducts = products.filter(p =>
    (selectedCategory === 'all' || p.category === selectedCategory) &&
    (searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addToCart = (productId: number) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const cartItems = Object.entries(cart).map(([id, qty]) => ({
    product: products.find(p => p.id === Number(id))!,
    quantity: qty,
  }));

  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="relative min-h-screen" style={{ background: T.pageBg }}>
      <WaterBackground />

      {/* Header */}
      <div className="relative z-10" style={{ background: T.cardBg, backdropFilter: 'blur(20px)', borderBottom: T.cardBorder }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="glass-card w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-all">
                <ArrowLeft className="w-5 h-5" style={{ color: T.cyan }} />
              </button>

              <div className="w-10 h-10 flex items-center justify-center" style={{ background: T.cyan, borderRadius: '12px' }}>
                <ShoppingCart className="w-6 h-6" style={{ color: '#000000' }} />
              </div>

              <div>
                <h1 className="font-bold text-lg">Kemijski Proizvodi</h1>
                <p className="text-sm" style={{ color: T.cyan }}>Chemical Products</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="caption px-4 py-2" style={{ background: '#2EFF8820', color: '#2EFF88', borderRadius: '12px', border: '1px solid #2EFF8840' }}>
                BESPLATNO
              </div>

              <button
                onClick={() => setShowCart(!showCart)}
                className="btn-primary px-6 py-2 flex items-center gap-2 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-semibold">Košarica</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center text-xs font-bold" style={{ background: T.accent, color: '#000', borderRadius: '50%' }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search & Categories */}
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: T.faint }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretraži proizvode..."
                className="input-glass w-full pl-12 pr-4 py-3"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex items-center gap-2 px-4 py-3 font-medium transition-all rounded-xl"
                  style={selectedCategory === cat.id
                    ? { background: `${T.cyan}18`, border: `1px solid ${T.cyan}`, color: T.cyan }
                    : { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }
                  }
                >
                  <cat.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-6 flex flex-col"
            >
              {/* Product Image Placeholder */}
              <div className="w-full h-40 mb-4 flex items-center justify-center" style={{ background: `${T.cyan}10`, borderRadius: '12px' }}>
                <Package className="w-16 h-16" style={{ color: T.cyan }} />
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  {!product.inStock && (
                    <span className="caption px-2 py-1" style={{ background: '#FF3B3020', color: '#FF3B30', borderRadius: '6px' }}>
                      OUT
                    </span>
                  )}
                </div>

                <p className="text-sm mb-3" style={{ color: T.muted }}>{product.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 fill-current" style={{ color: T.yellow }} />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm" style={{ color: T.faint }}>• {product.size}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="metric font-bold">{product.price.toFixed(2)} €</div>
                    <div className="text-xs" style={{ color: T.faint }}>po komadu</div>
                  </div>
                </div>
              </div>

              {/* Cart Controls */}
              {cart[product.id] ? (
                <div className="glass-card flex items-center justify-between px-4 py-2">
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/5 transition-all"
                    style={{ borderRadius: '8px' }}
                  >
                    <Minus className="w-4 h-4" style={{ color: '#FF3B30' }} />
                  </button>
                  <span className="metric">{cart[product.id]}</span>
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={!product.inStock}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/5 transition-all disabled:opacity-30"
                    style={{ borderRadius: '8px' }}
                  >
                    <Plus className="w-4 h-4" style={{ color: '#2EFF88' }} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={!product.inStock}
                  className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                  <span>{product.inStock ? 'Dodaj u košaricu' : 'Nedostupno'}</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full md:w-96 z-50 glass-card flex flex-col"
              style={{ borderRadius: 0 }}
            >
              {/* Cart Header */}
              <div className="p-6" style={{ borderBottom: T.cardBorder }}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold">Košarica</h2>
                  <button onClick={() => setShowCart(false)} className="glass-card w-10 h-10 flex items-center justify-center hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p style={{ color: T.muted }}>{cartCount} proizvoda</p>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: T.faint }} />
                    <p style={{ color: T.faint }}>Košarica je prazna</p>
                  </div>
                ) : (
                  cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="glass-card p-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 flex items-center justify-center flex-shrink-0" style={{ background: `${T.cyan}10`, borderRadius: '8px' }}>
                          <Package className="w-8 h-8" style={{ color: T.cyan }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                          <p className="text-xs mb-2" style={{ color: T.muted }}>{product.size}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">{product.price.toFixed(2)} €</span>
                            <div className="glass-card flex items-center gap-3 px-2 py-1">
                              <button onClick={() => removeFromCart(product.id)} className="w-6 h-6 flex items-center justify-center">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-semibold">{quantity}</span>
                              <button onClick={() => addToCart(product.id)} className="w-6 h-6 flex items-center justify-center">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cartItems.length > 0 && (
                <div className="p-6" style={{ borderTop: T.cardBorder }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium">Ukupno:</span>
                    <span className="text-2xl font-bold">{cartTotal.toFixed(2)} €</span>
                  </div>
                  <button className="btn-primary w-full py-4 text-lg font-semibold">
                    Završi Narudžbu
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

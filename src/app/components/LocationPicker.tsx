import { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Store, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface Store {
  id: string;
  name: string;
  address: string;
  distance?: number;
  lat: number;
  lng: number;
  type: 'pool-shop' | 'hardware' | 'garden-center';
}

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [location, setLocation] = useState<Location | null>(initialLocation || null);
  const [manualAddress, setManualAddress] = useState(initialLocation?.address || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStores, setShowStores] = useState(false);
  const [stores] = useState<Store[]>([
    {
      id: '1',
      name: 'Ivero Pool Shop Zagreb',
      address: 'Avenija Dubrovnik 15, Zagreb',
      lat: 45.8025,
      lng: 15.9676,
      type: 'pool-shop'
    },
    {
      id: '2',
      name: 'Bazeni i Oprema Split',
      address: 'Ulica Domovinskog rata 45, Split',
      lat: 43.5147,
      lng: 16.4435,
      type: 'pool-shop'
    },
    {
      id: '3',
      name: 'Pool Expert Rijeka',
      address: 'Liburnijska cesta 23, Rijeka',
      lat: 45.3271,
      lng: 14.4422,
      type: 'pool-shop'
    },
    {
      id: '4',
      name: 'Bauhaus Zagreb',
      address: 'Slavonska avenija 11, Zagreb',
      lat: 45.7875,
      lng: 15.9401,
      type: 'hardware'
    },
    {
      id: '5',
      name: 'Vrtni Centar Zagreb',
      address: 'Zagrebačka cesta 107, Zagreb',
      lat: 45.8150,
      lng: 15.9819,
      type: 'garden-center'
    }
  ]);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolokacija nije podržana u vašem pregledniku');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);
        onLocationSelect(newLocation);
        setLoading(false);
        setShowStores(true);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Nije moguće dohvatiti lokaciju. Molimo unesite ručno.');
        setLoading(false);
      }
    );
  };

  const handleManualLocation = () => {
    if (!manualAddress.trim()) {
      setError('Molimo unesite adresu');
      return;
    }

    // Simulate geocoding - in production use real geocoding API
    // For now, set Zagreb coordinates as default
    const mockLocation = {
      lat: 45.8150,
      lng: 15.9819,
      address: manualAddress
    };
    
    setLocation(mockLocation);
    onLocationSelect(mockLocation);
    setShowStores(true);
    setError(null);
  };

  const calculateDistance = (storeLat: number, storeLng: number) => {
    if (!location) return null;
    
    const R = 6371; // Earth radius in km
    const dLat = (storeLat - location.lat) * Math.PI / 180;
    const dLon = (storeLng - location.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(location.lat * Math.PI / 180) * Math.cos(storeLat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const sortedStores = location 
    ? [...stores]
        .map(store => ({
          ...store,
          distance: calculateDistance(store.lat, store.lng)
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    : stores;

  const getStoreIcon = (type: Store['type']) => {
    switch (type) {
      case 'pool-shop': return '🏊';
      case 'hardware': return '🔨';
      case 'garden-center': return '🌿';
    }
  };

  const openMaps = (store: Store) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Location Input Section */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Vaša lokacija</h3>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {/* GPS Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={getCurrentLocation}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center gap-3 font-semibold"
          >
            <Navigation className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Dohvaćam lokaciju...' : 'Koristi GPS'}
          </motion.button>

          {/* Manual Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Unesite adresu ručno..."
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={handleManualLocation}
              className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all font-medium"
            >
              Potvrdi
            </button>
          </div>

          {location && (
            <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center gap-2 text-green-700">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stores List */}
      {showStores && location && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Trgovine u blizini</h3>
          </div>

          <div className="space-y-3">
            {sortedStores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-2 border-gray-200 rounded-2xl p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                onClick={() => openMaps(store)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{getStoreIcon(store.type)}</span>
                      <h4 className="font-semibold text-gray-900">{store.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                    {store.distance !== undefined && (
                      <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                        <Navigation className="w-3 h-3" />
                        {store.distance.toFixed(1)} km
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openMaps(store);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      Navigacija
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            💡 Kliknite na trgovinu za otvaranje navigacije
          </p>
        </motion.div>
      )}
    </div>
  );
}

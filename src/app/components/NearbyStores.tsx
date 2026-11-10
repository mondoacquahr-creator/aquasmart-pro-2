import { motion } from 'motion/react';
import { Store, MapPin, Phone, Mail, Clock, Star, Navigation, ExternalLink, CheckCircle } from 'lucide-react';
import { Store as StoreType } from '../types';

interface NearbyStoresProps {
  stores: StoreType[];
  userLocation?: { lat: number; lng: number };
}

export function NearbyStores({ stores, userLocation }: NearbyStoresProps) {
  if (stores.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200"
      >
        <div className="text-center">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">
            Nema trgovina u blizini
          </h3>
          <p className="text-sm text-gray-600">
            Pokušajte povećati radijus pretrage ili dodajte GPS lokaciju
          </p>
        </div>
      </motion.div>
    );
  }

  const openInMaps = (store: StoreType) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.location.lat},${store.location.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-sky-500" />
            Trgovine u blizini
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {stores.length} {stores.length === 1 ? 'trgovina' : stores.length < 5 ? 'trgovine' : 'trgovina'} s Ivero proizvodima
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {stores.map((store, index) => (
          <motion.div
            key={store.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-xl transition-all group relative overflow-hidden"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg text-gray-900">
                      {store.name}
                    </h4>
                    {store.verified && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        Verificirano
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {store.address}, {store.city}
                  </div>
                </div>
                {store.distance !== undefined && (
                  <div className="flex flex-col items-end">
                    <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {store.distance} km
                    </div>
                    {store.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {store.rating}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Info Grid */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <a 
                    href={`tel:${store.phone}`}
                    className="text-gray-700 hover:text-sky-600 transition-colors"
                  >
                    {store.phone}
                  </a>
                </div>

                {store.email && (
                  <div className="flex items-start gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <a
                      href={`mailto:${store.email}`}
                      className="text-gray-700 hover:text-sky-600 transition-colors"
                    >
                      {store.email}
                    </a>
                  </div>
                )}

                <div className="flex items-start gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{store.workingHours}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  onClick={() => openInMaps(store)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Navigation className="w-4 h-4" />
                  Navigacija
                </motion.button>

                <motion.button
                  onClick={() => window.open(`tel:${store.phone}`, '_self')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white border-2 border-gray-300 text-gray-700 py-2.5 px-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Pozovi
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Map Link */}
      {userLocation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-4 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Pregled na karti</div>
                <div className="text-xs text-gray-600">Otvori sve trgovine u Google Maps</div>
              </div>
            </div>
            <button
              onClick={() => {
                const url = `https://www.google.com/maps/search/bazen+oprema/@${userLocation.lat},${userLocation.lng},13z`;
                window.open(url, '_blank');
              }}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              Otvori
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

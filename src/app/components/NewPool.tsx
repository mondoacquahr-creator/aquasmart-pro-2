import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Save, Info, Camera, X, MapPin } from 'lucide-react';
import { storage } from '../lib/storage';
import { Pool } from '../types';

// Common pool volumes for quick selection
const COMMON_VOLUMES = [
  { label: 'Mali bazen (20-30 m³)', value: 25 },
  { label: 'Srednji bazen (40-60 m³)', value: 50 },
  { label: 'Veliki bazen (70-100 m³)', value: 80 },
  { label: 'Olimpijski bazen (2,500 m³)', value: 2500 },
];

export function NewPool() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    type: '' as Pool['type'],
    volume: '',
    length: '',
    width: '',
    depth: '',
    address: '',
    clientId: '',
    notes: '',
    disinfectionSystem: '' as Pool['disinfectionSystem'] | '',
  });

  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [disinfectionSystemPhoto, setDisinfectionSystemPhoto] = useState<string | null>(null);
  const [poolPhoto, setPoolPhoto] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load clientId from localStorage if available
  useEffect(() => {
    const savedClientId = localStorage.getItem('newPoolClientId');
    if (savedClientId) {
      setFormData(prev => ({ ...prev, clientId: savedClientId }));
      localStorage.removeItem('newPoolClientId');
    } else {
      // Also check workOrderContext
      const workOrderContext = localStorage.getItem('workOrderContext');
      if (workOrderContext) {
        try {
          const context = JSON.parse(workOrderContext);
          if (context.clientId) {
            setFormData(prev => ({ ...prev, clientId: context.clientId }));
          }
        } catch (e) {
          console.error('Failed to parse workOrderContext', e);
        }
      }
    }
  }, []);

  // Calculate volume from dimensions
  const calculateVolume = (length: string, width: string, depth: string): number => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    const d = parseFloat(depth);
    if (isNaN(l) || isNaN(w) || isNaN(d)) return 0;
    return l * w * d;
  };

  // Volume validation
  const validateVolume = (value: string): string | null => {
    const volume = parseFloat(value);
    if (isNaN(volume)) return 'Unesite broj';
    if (volume < 5) return 'Minimalni volumen je 5 m³';
    if (volume > 10000) return 'Maksimalni volumen je 10,000 m³';
    return null;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, volume: value, length: '', width: '', depth: '' });
    
    if (value) {
      const error = validateVolume(value);
      setErrors({ ...errors, volume: error || '' });
    } else {
      setErrors({ ...errors, volume: '' });
    }
  };

  const handleDimensionChange = (field: 'length' | 'width' | 'depth', value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Auto-calculate volume if all dimensions are filled
    if (newFormData.length && newFormData.width && newFormData.depth) {
      const calculatedVolume = calculateVolume(newFormData.length, newFormData.width, newFormData.depth);
      if (calculatedVolume > 0) {
        newFormData.volume = calculatedVolume.toFixed(1);
        setFormData(newFormData);
        const error = validateVolume(newFormData.volume);
        setErrors({ ...errors, volume: error || '' });
      }
    }
  };

  const handleGetLocation = () => {
    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingGPS(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoadingGPS(false);
        alert('Nije moguće učitati lokaciju. Provjerite dozvole za lokaciju.');
      }
    );
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setDisinfectionSystemPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePoolPhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPoolPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (!formData.name || !formData.volume) {
      alert('Molimo unesite naziv i volumen bazena');
      return;
    }

    const volumeError = validateVolume(formData.volume);
    if (volumeError) {
      alert(volumeError);
      return;
    }

    const pool: Pool = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type || 'private',
      volume: parseFloat(formData.volume),
      location: {
        gps: gpsLocation || undefined,
        address: formData.address,
      },
      clientId: formData.clientId || undefined,
      notes: formData.notes,
      disinfectionSystem: formData.disinfectionSystem || undefined,
      disinfectionSystemPhoto: disinfectionSystemPhoto || undefined,
      poolPhoto: poolPhoto || undefined,
    };

    storage.savePool(pool);
    
    // Check if this was called from work order context
    const workOrderContext = localStorage.getItem('workOrderContext');
    if (workOrderContext) {
      try {
        const context = JSON.parse(workOrderContext);
        localStorage.removeItem('workOrderContext');
        
        // Show success message
        setShowSuccess(true);
        
        // Navigate back to work order with the new pool
        setTimeout(() => {
          navigate(`/app/pools/${pool.id}/work-orders/new`);
        }, 1500);
        return;
      } catch (e) {
        console.error('Failed to parse workOrderContext', e);
      }
    }
    
    // Show success message
    setShowSuccess(true);
    
    // Navigate after delay
    setTimeout(() => {
      navigate('/app/pools'); // Navigate to pools list
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-black pb-8">
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-amber-500/10 rounded-xl transition-colors text-amber-500">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Novi bazen</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-100 space-y-6">
          
          {/* Pool Name */}
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Naziv bazena <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              placeholder="npr. Bazen Hilton Hotel"
              required
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Unesite prepoznatljiv naziv za lakšu identifikaciju
            </p>
          </div>

          {/* Pool Type */}
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Tip bazena <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Pool['type'] })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white"
              required
            >
              <option value="">Odaberite tip</option>
              <option value="private">🏠 Privatni</option>
              <option value="hotel">🏨 Hotelski</option>
              <option value="public">🏊 Javni</option>
            </select>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Javni bazeni imaju stroža pravila za ORP (720-740 mV)
            </p>
          </div>

          {/* Volume */}
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Volumen bazena (m³) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="5"
              max="10000"
              value={formData.volume}
              onChange={handleVolumeChange}
              className={`w-full px-4 py-3 border-2 ${errors.volume ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-blue-500 transition-all`}
              placeholder="npr. 50"
              required
            />
            {errors.volume && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                ⚠️ {errors.volume}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Raspon: 5-10,000 m³. Ako ne znate volumen, koristite brzi odabir ispod.
            </p>

            {/* Quick Volume Selection */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {COMMON_VOLUMES.map((vol) => (
                <button
                  key={vol.value}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, volume: vol.value.toString() });
                    setErrors({ ...errors, volume: '' });
                  }}
                  className="text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-sm"
                >
                  <div className="font-medium text-blue-900">{vol.value} m³</div>
                  <div className="text-xs text-blue-600">{vol.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Dimenzije bazena (m)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                step="0.1"
                value={formData.length}
                onChange={(e) => handleDimensionChange('length', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                placeholder="Duljina"
              />
              <input
                type="number"
                step="0.1"
                value={formData.width}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                placeholder="Širina"
              />
              <input
                type="number"
                step="0.1"
                value={formData.depth}
                onChange={(e) => handleDimensionChange('depth', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                placeholder="Dubina"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Unesite dimenzije za automatsko izračunavanje volumena
            </p>
          </div>

          {/* Disinfection System */}
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Sustav dezinfekcije
            </label>
            <select
              value={formData.disinfectionSystem}
              onChange={(e) => setFormData({ ...formData, disinfectionSystem: e.target.value as Pool['disinfectionSystem'] })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white"
            >
              <option value="">Odaberite sustav</option>
              <option value="elektroliza">⚡ Elektroliza (solna)</option>
              <option value="klor-ph">💧 Klor + pH (automatsko doziranje)</option>
              <option value="peroksid">🧪 Peroksid</option>
              <option value="tablete">💊 Tablete</option>
            </select>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Vrsta sustava utječe na preporučene Ivero proizvode za tretman vode
            </p>

            {/* Photo Upload - Show only when system is selected */}
            {formData.disinfectionSystem && (
              <div className="mt-4 border-2 border-dashed border-teal-300 rounded-xl p-4 bg-teal-50/50">
                <label className="block text-sm mb-2 font-medium text-gray-700">
                  <Camera className="w-4 h-4 inline mr-2" />
                  Fotografija sustava (opcionalno)
                </label>
                
                {!disinfectionSystemPhoto ? (
                  <label className="flex flex-col items-center gap-2 cursor-pointer bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl p-6 transition-all">
                    <Camera className="w-10 h-10 text-teal-600" />
                    <span className="text-sm text-gray-600">Dodaj fotografiju sustava</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoCapture}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img 
                      src={disinfectionSystemPhoto} 
                      alt="Sustav dezinfekcije" 
                      className="w-full h-48 object-cover rounded-xl border-2 border-teal-300"
                    />
                    <button
                      type="button"
                      onClick={() => setDisinfectionSystemPhoto(null)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Dodajte fotografiju sustava za lakšu identifikaciju i servis
                </p>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">Lokacija</label>
            <div className="space-y-3">
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                placeholder="npr. Ulica Vukovarska 12, Zagreb"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loadingGPS}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors disabled:bg-gray-100 w-full justify-center"
              >
                <MapPin className="w-5 h-5" />
                {loadingGPS ? 'Učitavanje...' : gpsLocation ? '✓ GPS lokacija učitana' : 'Učitaj GPS lokaciju'}
              </button>
              {gpsLocation && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                  ✓ Lat: {gpsLocation.lat.toFixed(6)}, Lng: {gpsLocation.lng.toFixed(6)}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              GPS lokacija omogućava prikaz obližnjih trgovina Ivero proizvoda
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">Napomene</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              rows={4}
              placeholder="Dodatne napomene o bazenu (oprema, specifičnosti...)"
            />
            <p className="text-xs text-gray-500 mt-1">Opcionalno: Zabilježite specifičnosti bazena</p>
          </div>

          {/* Pool Photo */}
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              <Camera className="w-4 h-4 inline mr-2" />
              Fotografija bazena (opcionalno)
            </label>
            
            {!poolPhoto ? (
              <label className="flex flex-col items-center gap-2 cursor-pointer bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl p-6 transition-all">
                <Camera className="w-10 h-10 text-teal-600" />
                <span className="text-sm text-gray-600">Dodaj fotografiju bazena</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePoolPhotoCapture}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img 
                  src={poolPhoto} 
                  alt="Bazen" 
                  className="w-full h-48 object-cover rounded-xl border-2 border-teal-300"
                />
                <button
                  type="button"
                  onClick={() => setPoolPhoto(null)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Dodajte fotografiju bazena za lakšu identifikaciju i servis
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!!errors.volume}
              className="flex-1 bg-sky-500 text-white py-4 rounded-2xl hover:bg-sky-600 transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save className="w-5 h-5" />
              Spremi bazen
            </button>
          </div>
        </form>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full transform animate-bounce-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Save className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bazen spremljen!</h2>
              <p className="text-gray-600">Preusmjeravanje...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { Camera, AlertTriangle, Wrench, Package, X, Plus } from 'lucide-react';

interface AnalysisNotesFormProps {
  equipmentIssues: string;
  setEquipmentIssues: (value: string) => void;
  additionalWork: string;
  setAdditionalWork: (value: string) => void;
  productsLeft: Array<{ id: string; name: string; quantity: string }>;
  setProductsLeft: (value: Array<{ id: string; name: string; quantity: string }>) => void;
  equipmentPhotos: Array<{
    id: string;
    category: 'pumpa' | 'filter' | 'dozatori' | 'dozator1' | 'trafo' | 'ostalo' | 'issues' | 'work' | 'products';
    dataUrl: string;
    timestamp: string;
  }>;
  setEquipmentPhotos: (value: Array<{
    id: string;
    category: 'pumpa' | 'filter' | 'dozatori' | 'dozator1' | 'trafo' | 'ostalo' | 'issues' | 'work' | 'products';
    dataUrl: string;
    timestamp: string;
  }>) => void;
}

export function AnalysisNotesForm({
  equipmentIssues,
  setEquipmentIssues,
  additionalWork,
  setAdditionalWork,
  productsLeft,
  setProductsLeft,
  equipmentPhotos,
  setEquipmentPhotos,
}: AnalysisNotesFormProps) {
  const handleAddProduct = (name: string, quantity: string) => {
    if (name && quantity) {
      setProductsLeft([...productsLeft, {
        id: Date.now().toString(),
        name,
        quantity,
      }]);
    }
  };

  const handleRemoveProduct = (id: string) => {
    setProductsLeft(productsLeft.filter(p => p.id !== id));
  };

  const handleCapturePhoto = (category: 'pumpa' | 'filter' | 'dozatori' | 'dozator1' | 'trafo' | 'ostalo' | 'issues' | 'work' | 'products') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment' as any;

    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto = {
            id: Date.now().toString(),
            category,
            dataUrl: event.target.result as string,
            timestamp: new Date().toISOString(),
          };
          setEquipmentPhotos([...equipmentPhotos, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  const handleRemovePhoto = (id: string) => {
    setEquipmentPhotos(equipmentPhotos.filter(p => p.id !== id));
  };

  // Filter photos by category
  const issuePhotos = equipmentPhotos.filter(p => p.category === 'issues');
  const workPhotos = equipmentPhotos.filter(p => p.category === 'work');
  const productPhotos = equipmentPhotos.filter(p => p.category === 'products');

  return (
    <div className="space-y-4">
      {/* Equipment Issues */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold">Kvarovi opreme</h2>
        </div>
        <textarea
          value={equipmentIssues}
          onChange={(e) => setEquipmentIssues(e.target.value)}
          placeholder="Opiši kvarove opreme (npr. pumpa ne radi, curenje filtera...)"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-all resize-none h-32"
        />
        
        {/* Photo Upload for Issues */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleCapturePhoto('issues')}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Dodaj fotografiju kvara
          </button>
          
          {/* Issue Photos Grid */}
          {issuePhotos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {issuePhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.dataUrl}
                    alt="Kvar"
                    className="w-full h-32 object-cover rounded-xl border-2 border-red-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Work */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">Dodatni radovi</h2>
        </div>
        <textarea
          value={additionalWork}
          onChange={(e) => setAdditionalWork(e.target.value)}
          placeholder="Opiši izvršene ili potrebne radove (npr. čišćenje filtera, zamjena pijeska...)"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all resize-none h-32"
        />
        
        {/* Photo Upload for Work */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleCapturePhoto('work')}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Dodaj fotografiju radova
          </button>
          
          {/* Work Photos Grid */}
          {workPhotos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {workPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.dataUrl}
                    alt="Radovi"
                    className="w-full h-32 object-cover rounded-xl border-2 border-blue-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products Left */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-6 h-6 text-teal-600" />
          <h2 className="text-xl font-bold">Ostavljeni proizvodi</h2>
        </div>

        <div className="space-y-3 mb-4">
          {productsLeft.map((product) => (
            <div key={product.id} className="flex items-center gap-3 bg-teal-50 rounded-xl p-3">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-600">Količina: {product.quantity}</div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveProduct(product.id)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
          ))}
        </div>

        <ProductInput onAdd={handleAddProduct} />
        
        {/* Photo Upload for Products */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => handleCapturePhoto('products')}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 px-6 rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Dodaj fotografiju proizvoda
          </button>
          
          {/* Product Photos Grid */}
          {productPhotos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {productPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.dataUrl}
                    alt="Proizvodi"
                    className="w-full h-32 object-cover rounded-xl border-2 border-teal-300"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Product Input Component
function ProductInput({ onAdd }: { onAdd: (name: string, quantity: string) => void }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleAdd = () => {
    if (name && quantity) {
      onAdd(name, quantity);
      setName('');
      setQuantity('');
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Naziv proizvoda"
        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
      />
      <input
        type="text"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Količina"
        className="w-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
      />
      <button
        type="button"
        onClick={handleAdd}
        className="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

import { useState } from 'react';

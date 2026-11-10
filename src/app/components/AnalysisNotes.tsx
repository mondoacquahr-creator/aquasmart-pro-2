import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Save, Camera, AlertTriangle, Wrench, Package, FileText, X, Check, Printer, Mail, MessageCircle } from 'lucide-react';
import { storage } from '../lib/storage';
import { workOrderStorage } from '../lib/workOrderStorage';
import { Pool, WaterAnalysis, WorkOrder } from '../types';

export function AnalysisNotes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { poolId, analysisId } = location.state || {};

  const [pool, setPool] = useState<Pool | null>(null);
  const [analysis, setAnalysis] = useState<WaterAnalysis | null>(null);
  const [equipmentIssues, setEquipmentIssues] = useState('');
  const [additionalWork, setAdditionalWork] = useState('');
  const [productsLeft, setProductsLeft] = useState<Array<{ id: string; name: string; quantity: string }>>([]);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: '' });
  const [photos, setPhotos] = useState<Array<{ id: string; category: string; dataUrl: string; timestamp: string }>>([]);
  const [activePhotoCategory, setActivePhotoCategory] = useState<'pumpa' | 'filter' | 'dozatori' | 'dozator1' | 'trafo' | 'ostalo' | 'issues' | 'work' | 'products'>('pumpa');
  const [saved, setSaved] = useState(false);
  const [generatedWorkOrderId, setGeneratedWorkOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (poolId) {
      const poolData = storage.getPool(poolId);
      setPool(poolData || null);
    }

    if (analysisId) {
      const analyses = storage.getAnalyses();
      const foundAnalysis = analyses.find(a => a.id === analysisId);
      setAnalysis(foundAnalysis || null);

      // Load existing notes if any
      if (foundAnalysis?.notes) {
        setEquipmentIssues(foundAnalysis.notes.equipmentIssues || '');
        setAdditionalWork(foundAnalysis.notes.additionalWork || '');
        setProductsLeft(foundAnalysis.notes.productsLeft || []);
        setPhotos(foundAnalysis.notes.equipmentPhotos || []);
      }
    }
  }, [poolId, analysisId]);

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.quantity) {
      setProductsLeft([...productsLeft, { 
        id: Date.now().toString(), 
        ...newProduct 
      }]);
      setNewProduct({ name: '', quantity: '' });
    }
  };

  const handleRemoveProduct = (id: string) => {
    setProductsLeft(productsLeft.filter(p => p.id !== id));
  };

  const handleCapturePhoto = async (category: typeof activePhotoCategory) => {
    try {
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
            setPhotos([...photos, newPhoto]);
          }
        };
        reader.readAsDataURL(file);
      };

      input.click();
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const handleSave = () => {
    if (!analysis || !pool) return;

    // Update analysis with notes
    const updatedAnalysis: WaterAnalysis = {
      ...analysis,
      notes: {
        equipmentIssues,
        additionalWork,
        productsLeft,
        equipmentPhotos: photos,
      },
    };

    storage.saveAnalysis(updatedAnalysis);

    // Generate Work Order if there are issues or additional work
    let workOrderId: string | null = null;
    if (equipmentIssues || additionalWork) {
      const workOrder: WorkOrder = {
        id: Date.now().toString(),
        poolId: pool.id,
        poolName: pool.name,
        clientId: pool.clientId,
        clientName: pool.clientName,
        analysisId: analysis.id,
        date: new Date().toISOString(),
        type: 'analysis',
        status: 'pending',
        description: `Radni nalog generiran iz analize vode - ${pool.name}`,
        equipmentIssues,
        additionalWork,
        chemicalsUsed: productsLeft.map(p => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
        })),
        photos: photos.map(p => ({
          id: p.id,
          category: p.category,
          dataUrl: p.dataUrl,
          timestamp: p.timestamp,
        })),
      };

      workOrderStorage.save(workOrder);
      workOrderId = workOrder.id;
    }
    
    setGeneratedWorkOrderId(workOrderId);
    setSaved(true);
  };

  const handlePrint = () => {
    if (generatedWorkOrderId && pool) {
      const workOrder = workOrderStorage.getAll().find(wo => wo.id === generatedWorkOrderId);
      if (workOrder) {
        // Generate PDF
        import('../lib/pdfExport').then(module => {
          module.generateWorkOrderPDF(workOrder, pool, analysis || undefined);
        });
      }
    }
  };

  const handleEmail = () => {
    if (generatedWorkOrderId && pool) {
      const workOrder = workOrderStorage.getAll().find(wo => wo.id === generatedWorkOrderId);
      if (workOrder) {
        // Generate PDF first
        import('../lib/pdfExport').then(module => {
          module.generateWorkOrderPDF(workOrder, pool, analysis || undefined);
        });
        
        // Then open email client
        const subject = `Radni nalog - ${pool?.name}`;
        const body = `Radni nalog za bazen ${pool?.name}\n\nKvarovi:\n${equipmentIssues}\n\nDodatni radovi:\n${additionalWork}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
    }
  };

  const handleWhatsApp = () => {
    if (generatedWorkOrderId && pool) {
      const workOrder = workOrderStorage.getAll().find(wo => wo.id === generatedWorkOrderId);
      if (workOrder) {
        // Generate PDF first
        import('../lib/pdfExport').then(module => {
          module.generateWorkOrderPDF(workOrder, pool, analysis || undefined);
        });
        
        // Then open WhatsApp
        const message = `🏊 Radni nalog - ${pool?.name}\n\n⚠️ Kvarovi:\n${equipmentIssues}\n\n🔧 Dodatni radovi:\n${additionalWork}\n\n📦 Ostavljeni proizvodi:\n${productsLeft.map(p => `- ${p.name}: ${p.quantity}`).join('\n')}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      }
    }
  };
  
  const handleViewWorkOrder = () => {
    if (analysisId && poolId) {
      // Navigate to analysis details instead
      navigate(`/app/pools/${poolId}/analysis/${analysisId}`);
    }
  };

  if (!pool || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <p className="text-gray-600">Podaci nisu pronađeni</p>
      </div>
    );
  }

  const photoCategories = [
    { id: 'pumpa' as const, label: '💪 Pumpa', icon: '💪' },
    { id: 'filter' as const, label: '🔍 Filter', icon: '🔍' },
    { id: 'dozatori' as const, label: '💉 Dozatori', icon: '💉' },
    { id: 'dozator1' as const, label: '💊 Dozator 1', icon: '💊' },
    { id: 'trafo' as const, label: '⚡ Trafo', icon: '⚡' },
    { id: 'ostalo' as const, label: '🔧 Ostalo', icon: '🔧' },
    { id: 'issues' as const, label: '⚠️ Kvarovi', icon: '⚠️' },
    { id: 'work' as const, label: '🛠️ Radovi', icon: '🛠️' },
    { id: 'products' as const, label: '📦 Proizvodi', icon: '📦' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Napomene i fotografije</h1>
                <p className="text-sm text-gray-600">{pool.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
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
                  onClick={() => handleRemoveProduct(product.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Naziv proizvoda"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
            />
            <input
              type="text"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
              placeholder="Količina"
              className="w-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all"
            />
            <button
              onClick={handleAddProduct}
              className="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all"
            >
              Dodaj
            </button>
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold">Fotografije</h2>
          </div>

          {/* Category Selector */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {photoCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActivePhotoCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  activePhotoCategory === cat.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Capture Button */}
          <button
            onClick={() => handleCapturePhoto(activePhotoCategory)}
            className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Dodaj fotografiju - {photoCategories.find(c => c.id === activePhotoCategory)?.label}
          </button>

          {/* Photos Grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.dataUrl}
                    alt={photo.category}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {photoCategories.find(c => c.id === photo.category)?.icon} {photoCategories.find(c => c.id === photo.category)?.label}
                  </div>
                  <button
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

        {/* Save Button or Success Message */}
        {!saved ? (
          <div className="sticky bottom-4">
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-2xl flex items-center justify-center gap-3 font-bold text-lg"
            >
              <Check className="w-6 h-6" />
              Završi i generiraj radni nalog
            </button>
          </div>
        ) : (
          <div className="sticky bottom-4 space-y-4">
            {/* Success Message */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold mb-2">✅ Spremljeno!</h2>
              <p className="text-green-100 text-lg">Radni nalog je uspješno generiran</p>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 text-center">Podijeli radni nalog</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-md font-medium"
                >
                  <Printer className="w-5 h-5" />
                  Ispiši
                </button>

                <button
                  onClick={handleEmail}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md font-medium"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </button>
              </div>

              <button
                onClick={handleViewWorkOrder}
                className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
              >
                Pogledaj radni nalog
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
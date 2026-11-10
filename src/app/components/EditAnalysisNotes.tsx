import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, AlertTriangle, Wrench, Package, Camera, X } from 'lucide-react';
import { storage } from '../lib/storage';
import { Pool, WaterAnalysis } from '../types';
import { AnalysisNotes } from './AnalysisNotes';

export function EditAnalysisNotes() {
  const navigate = useNavigate();
  const { poolId, analysisId } = useParams<{ poolId: string; analysisId: string }>();
  const [pool, setPool] = useState<Pool | null>(null);
  const [analysis, setAnalysis] = useState<WaterAnalysis | null>(null);
  const [saving, setSaving] = useState(false);

  // Notes state
  const [equipmentIssues, setEquipmentIssues] = useState('');
  const [additionalWork, setAdditionalWork] = useState('');
  const [productsLeft, setProductsLeft] = useState<Array<{ id: string; name: string; quantity: string }>>([]);
  const [equipmentPhotos, setEquipmentPhotos] = useState<Array<{
    id: string;
    category: 'pumpa' | 'filter' | 'dozatori' | 'dozator1' | 'trafo' | 'ostalo' | 'issues' | 'work' | 'products';
    dataUrl: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    if (!poolId || !analysisId) {
      navigate('/app/pools');
      return;
    }

    const poolData = storage.getPool(poolId);
    if (!poolData) {
      alert('Bazen nije pronađen');
      navigate('/app/pools');
      return;
    }
    setPool(poolData);

    const analyses = storage.getAnalyses(poolId);
    const analysisData = analyses.find(a => a.id === analysisId);
    
    if (!analysisData) {
      alert('Analiza nije pronađena');
      navigate(`/app/pools/${poolId}/history`);
      return;
    }
    setAnalysis(analysisData);

    // Load existing notes
    if (analysisData.notes) {
      setEquipmentIssues(analysisData.notes.equipmentIssues || '');
      setAdditionalWork(analysisData.notes.additionalWork || '');
      setProductsLeft(analysisData.notes.productsLeft || []);
      setEquipmentPhotos(analysisData.notes.equipmentPhotos || []);
    }
  }, [poolId, analysisId, navigate]);

  const handleSave = () => {
    if (!pool || !analysis) return;

    setSaving(true);

    // Update analysis with new notes
    const updatedAnalysis: WaterAnalysis = {
      ...analysis,
      notes: {
        equipmentIssues: equipmentIssues.trim() || undefined,
        additionalWork: additionalWork.trim() || undefined,
        productsLeft: productsLeft.length > 0 ? productsLeft : undefined,
        equipmentPhotos: equipmentPhotos.length > 0 ? equipmentPhotos : undefined,
      }
    };

    // Save to storage
    const allAnalyses = storage.getAnalyses(poolId!);
    const updatedAnalyses = allAnalyses.map(a => a.id === analysisId ? updatedAnalysis : a);
    storage.saveAnalysis(poolId!, updatedAnalyses);

    setTimeout(() => {
      setSaving(false);
      navigate(`/app/pools/${poolId}/analysis/${analysisId}`, { 
        state: { justSaved: true } 
      });
    }, 500);
  };

  if (!pool || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <p className="text-gray-600">Učitavanje...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 pb-20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(`/app/pools/${poolId}/analysis/${analysisId}`)} 
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-medium">Natrag</span>
          </button>
          <h1 className="text-xl font-bold">Uredi napomene</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Spremam...' : 'Spremi'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Info Card */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Uređivanje napomena</h3>
              <p className="text-sm text-gray-700">
                Možete dodati ili urediti kvarove, radove, proizvode i fotografije za ovu analizu. 
                Parametri vode ne mogu biti promijenjeni.
              </p>
              <div className="mt-2 text-sm text-gray-600">
                <strong>Bazen:</strong> {pool.name} | <strong>Datum:</strong> {new Date(analysis.date).toLocaleString('hr-HR')}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Notes Component */}
        <AnalysisNotes
          equipmentIssues={equipmentIssues}
          setEquipmentIssues={setEquipmentIssues}
          additionalWork={additionalWork}
          setAdditionalWork={setAdditionalWork}
          productsLeft={productsLeft}
          setProductsLeft={setProductsLeft}
          equipmentPhotos={equipmentPhotos}
          setEquipmentPhotos={setEquipmentPhotos}
        />

        {/* Save Button (Bottom) */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate(`/app/pools/${poolId}/analysis/${analysisId}`)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-all"
          >
            Odustani
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Spremam...' : 'Spremi promjene'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

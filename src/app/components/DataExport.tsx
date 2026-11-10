import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Download, Database, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';

export function DataExport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportedFile, setExportedFile] = useState<string>('');

  const pools = storage.getPools();
  const analyses = storage.getAnalyses();
  const clients = storage.getClients();

  const handleExportJSON = () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        exportedBy: user?.email || 'unknown',
        version: '1.0.0',
        data: {
          pools: pools,
          analyses: analyses,
          clients: user?.role === 'professional' ? clients : [],
        },
        stats: {
          totalPools: pools.length,
          totalAnalyses: analyses.length,
          totalClients: user?.role === 'professional' ? clients.length : 0,
        }
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aquasmart-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setExportedFile(link.download);
      
      setTimeout(() => setExportStatus('idle'), 5000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 5000);
    }
  };

  const handleExportCSV = () => {
    try {
      // Export analyses as CSV
      let csv = 'ID,Datum,Bazen,pH,Klor,Alkalnost,Tvrdoca,Temperatura,ORP,Status\n';
      
      analyses.forEach(analysis => {
        const pool = pools.find(p => p.id === analysis.poolId);
        csv += `${analysis.id},${analysis.date},${pool?.name || 'N/A'},${analysis.parameters.pH},${analysis.parameters.freeChlorine},${analysis.parameters.alkalinity},${analysis.parameters.hardness},${analysis.parameters.temperature || 'N/A'},${analysis.parameters.orp || 'N/A'},${analysis.status}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aquasmart-analize-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setExportedFile(link.download);
      
      setTimeout(() => setExportStatus('idle'), 5000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-black pb-20">
      {/* Header */}
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Download className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-bold">Export Podataka</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white rounded-3xl p-6 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Database className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Preuzmi Podatke</h2>
                <p className="text-blue-100">Sigurnosna kopija svih podataka</p>
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">{pools.length}</div>
                  <div className="text-sm text-blue-100">Bazena</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{analyses.length}</div>
                  <div className="text-sm text-blue-100">Analiza</div>
                </div>
                {user?.role === 'professional' && (
                  <div>
                    <div className="text-3xl font-bold">{clients.length}</div>
                    <div className="text-sm text-blue-100">Klijenata</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success/Error Message */}
        {exportStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-start gap-3"
          >
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">Export uspješan!</h3>
              <p className="text-sm text-green-700">
                Datoteka <span className="font-mono font-semibold">{exportedFile}</span> je preuzeta.
              </p>
            </div>
          </motion.div>
        )}

        {exportStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Greška pri exportu</h3>
              <p className="text-sm text-red-700">
                Molimo pokušajte ponovno ili kontaktirajte podršku.
              </p>
            </div>
          </motion.div>
        )}

        {/* Export Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="font-bold text-lg text-gray-900">Formati izvoza</h3>

          {/* JSON Export */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Database className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900 mb-1">JSON Format</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Kompletna sigurnosna kopija svih podataka u strukturiranom formatu. 
                  Preporučeno za backup i prijenos podataka.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                    Svi podaci
                  </span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                    Struktura očuvana
                  </span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                    Import/Export
                  </span>
                </div>
              </div>
            </div>
            
            <motion.button
              onClick={handleExportJSON}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Download className="w-5 h-5" />
              Preuzmi JSON
            </motion.button>
          </div>

          {/* CSV Export */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg text-gray-900 mb-1">CSV Format</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Tablični format analiza pogodan za Excel, Google Sheets i analizu podataka.
                  Savršeno za izvještaje i statistike.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Excel kompatibilno
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Analize
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Statistika
                  </span>
                </div>
              </div>
            </div>
            
            <motion.button
              onClick={handleExportCSV}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Download className="w-5 h-5" />
              Preuzmi CSV
            </motion.button>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-200"
        >
          <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Važne informacije
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Podaci se izvozi iz lokalnog spremišta vašeg uređaja</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>JSON format omogućava prijenos podataka na drugi uređaj ili backup</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>CSV format najbolje otvoriti u Excel-u ili Google Sheets-u</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Preporučujemo redovite backupe podataka</span>
            </li>
            {user?.role === 'professional' && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Kao profesionalac, vaši klijenti su također uključeni u JSON export</span>
              </li>
            )}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
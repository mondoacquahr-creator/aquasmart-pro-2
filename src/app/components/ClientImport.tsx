import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Users, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { storage } from '../lib/storage';
import { Client, Pool } from '../types';

interface ImportRow {
  ime: string;
  prezime: string;
  adresa: string;
  mobitel: string;
  lokacija: string;
  dimenzije: string;
  zapremina: number;
}

interface ParsedClient {
  client: Client;
  pool: Pool;
  row: number;
  errors: string[];
  warnings: string[];
}

export function ClientImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedClient[]>([]);
  const [importing, setImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);

  const downloadTemplate = () => {
    const template = [
      {
        'Ime': 'Marko',
        'Prezime': 'Marković',
        'Adresa': 'Ilica 123, Zagreb',
        'Mobitel': '+385 91 234 5678',
        'Lokacija': '45.8150,15.9819',
        'Dimenzije': '8x4x1.5',
        'Zapremina': 48
      },
      {
        'Ime': 'Ana',
        'Prezime': 'Anić',
        'Adresa': 'Obala 45, Split',
        'Mobitel': '+385 92 345 6789',
        'Lokacija': '43.5081,16.4402',
        'Dimenzije': '10x5x1.8',
        'Zapremina': 90
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Klijenti');
    XLSX.writeFile(wb, 'AquaSmart_Template.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        const parsed: ParsedClient[] = json.map((row: any, index: number) => {
          const errors: string[] = [];
          const warnings: string[] = [];
          
          // Critical validation - only Ime and Prezime are required
          if (!row.Ime || !row.Prezime) {
            errors.push('Ime i prezime su obavezni');
          }
          
          // Optional field warnings
          if (!row.Mobitel) {
            warnings.push('Mobitel nije unesen');
          }
          if (!row.Adresa) {
            warnings.push('Adresa nije unesena');
          }
          if (!row.Zapremina || isNaN(Number(row.Zapremina))) {
            warnings.push('Zapremina nije valjana');
          }
          if (!row.Dimenzije) {
            warnings.push('Dimenzije nisu unesene');
          }
          if (!row.Lokacija) {
            warnings.push('Lokacija nije unesena');
          }

          // Parse location
          let latitude = 0;
          let longitude = 0;
          if (row.Lokacija) {
            const coords = row.Lokacija.split(',');
            if (coords.length === 2) {
              latitude = parseFloat(coords[0].trim());
              longitude = parseFloat(coords[1].trim());
              if (isNaN(latitude) || isNaN(longitude)) {
                latitude = 0;
                longitude = 0;
                warnings.push('Nevaljane GPS koordinate');
              }
            }
          }

          // Create client with default values for missing data
          const clientId = `client_${Date.now()}_${index}`;
          const client: Client = {
            id: clientId,
            name: `${row.Ime || ''} ${row.Prezime || ''}`.trim(),
            email: '',
            phone: row.Mobitel || 'Nije uneseno',
            address: row.Adresa || 'Nije unesena',
            notes: warnings.length > 0 ? `Nedostaju neki podaci: ${warnings.join(', ')}` : '',
            poolIds: []
          };

          // Create pool with default values
          const poolId = `pool_${Date.now()}_${index}`;
          const zapremina = Number(row.Zapremina);
          const pool: Pool = {
            id: poolId,
            name: `Bazen - ${client.name}`,
            type: 'private',
            volume: !isNaN(zapremina) && zapremina > 0 ? zapremina : 0,
            dimensions: row.Dimenzije || 'Nije uneseno',
            location: latitude && longitude ? {
              latitude,
              longitude,
              address: row.Adresa || '',
              manualEntry: true
            } : undefined,
            clientId: clientId,
            imageUrl: undefined
          };

          client.poolIds = [poolId];

          return {
            client,
            pool,
            row: index + 2, // Excel row (1-based + header)
            errors,
            warnings
          };
        });

        setParsedData(parsed);
      } catch (error) {
        alert('Greška pri čitanju datoteke. Provjerite format.');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    setImporting(true);
    
    // Filter out rows with errors
    const validData = parsedData.filter(item => item.errors.length === 0);
    
    // Import to storage
    validData.forEach(item => {
      storage.saveClient(item.client);
      storage.savePool(item.pool);
    });

    setTimeout(() => {
      setImporting(false);
      setImportComplete(true);
    }, 1000);
  };

  const validCount = parsedData.filter(item => item.errors.length === 0).length;
  const errorCount = parsedData.filter(item => item.errors.length > 0).length;

  if (importComplete) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
            <button onClick={() => navigate('/app/more')} className="mr-4 p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-sky-600" />
              <h1 className="text-xl font-bold">Import Klijenata</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl border border-gray-100">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Import Uspješan! 🎉
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Uvezeno <strong className="text-emerald-600">{validCount}</strong> klijenata i bazena
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/app/clients')}
                className="bg-sky-500 text-white px-8 py-4 rounded-xl hover:bg-sky-600 transition-all shadow-lg font-bold"
              >
                Vidi klijente
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setParsedData([]);
                  setImportComplete(false);
                }}
                className="bg-white text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg border-2 border-gray-200 font-bold"
              >
                Uvezi još
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-black pb-24">
      {/* Header */}
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">Import Klijenata</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Users className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Masovni uvoz</h2>
                <p className="text-blue-100">Uvezite klijente i bazene iz Excel datoteke</p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Template */}
        <button
          onClick={downloadTemplate}
          className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-green-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Download className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors text-lg mb-1">
                Preuzmi Excel predložak
              </div>
              <div className="text-sm text-gray-600">
                Primjer datoteke sa svim potrebnim stupcima
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-green-500 transition-colors text-2xl">
              ↓
            </div>
          </div>
        </button>

        {/* Upload Area */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-lg mb-4">
            1. Odaberite Excel datoteku
          </h3>
          <label className="block">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-lg font-medium text-gray-700 mb-2">
                {file ? file.name : 'Klikni za odabir ili povuci datoteku'}
              </div>
              <div className="text-sm text-gray-500">
                Podržani formati: .xlsx, .xls
              </div>
            </div>
          </label>
        </div>

        {/* Preview */}
        {parsedData.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">{validCount}</div>
                <div className="text-sm text-green-700">Valjani unosi</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border-2 border-red-200">
                <div className="text-3xl font-bold text-red-600 mb-1">{errorCount}</div>
                <div className="text-sm text-red-700">Greške</div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-lg">
                  2. Pregled podataka
                </h3>
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Red</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Klijent</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mobitel</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bazen</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsedData.map((item, index) => (
                      <tr key={index} className={item.errors.length > 0 ? 'bg-red-50' : item.warnings.length > 0 ? 'bg-amber-50' : ''}>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.row}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{item.client.name}</div>
                          <div className="text-sm text-gray-600">{item.client.address}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.client.phone}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">{item.pool.volume} m³</div>
                          <div className="text-xs text-gray-600">{item.pool.dimensions}</div>
                        </td>
                        <td className="px-4 py-3">
                          {item.errors.length === 0 ? (
                            <div>
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">OK</span>
                              </div>
                              {item.warnings.length > 0 && (
                                <div className="mt-1 text-xs text-amber-600">
                                  ⚠️ {item.warnings.length} upozorenje{item.warnings.length > 1 ? 'a' : ''}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-start gap-1 text-red-600">
                              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div className="text-xs">
                                {item.errors.map((err, i) => (
                                  <div key={i}>{err}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Import Button */}
            {validCount > 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uvozim...
                  </span>
                ) : (
                  `✅ Uvezi ${validCount} ${validCount === 1 ? 'klijenta' : 'klijenata'}`
                )}
              </button>
            )}
          </>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Upute za pripremu Excel datoteke
          </h3>
          <div className="text-sm text-blue-800 space-y-3">
            <div>
              <p className="font-semibold mb-1">✅ Obvezni stupci:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Ime</strong> - Ime klijenta</li>
                <li><strong>Prezime</strong> - Prezime klijenta</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">📋 Opcionalni stupci:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Adresa</strong> - Puna adresa (preporučeno)</li>
                <li><strong>Mobitel</strong> - Kontakt broj (preporučeno)</li>
                <li><strong>Lokacija</strong> - GPS koordinate (format: "45.8150,15.9819")</li>
                <li><strong>Dimenzije</strong> - Dimenzije bazena (npr. "8x4x1.5")</li>
                <li><strong>Zapremina</strong> - Zapremina u m³ (broj)</li>
              </ul>
            </div>
            <p className="bg-blue-100 -mx-6 -mb-6 px-6 py-3 mt-3 rounded-b-2xl">
              💡 <strong>Savjet:</strong> Preuzmite predložak za lakše ispunjavanje podataka! Klijenti s nedostajućim podacima će biti uvezeni, ali će imati upozorenja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
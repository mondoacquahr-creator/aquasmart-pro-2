import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { workOrderStorage } from '../lib/workOrderStorage';

interface ImportedWorkOrder {
  workOrderNumber?: string;
  clientName: string;
  poolName: string;
  assignedToName?: string;
  status?: string;
  analysis?: boolean;
  services?: string;
  replacements?: string;
  additionalNotes?: string;
  date?: string;
}

export function WorkOrderImport() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const downloadTemplate = () => {
    // Create template Excel file
    const template = [
      {
        'Broj naloga': 'RN-2026-001',
        'Klijent': 'Marko Marković',
        'Bazen': 'Glavni bazen',
        'Djelatnik': 'Ivan Ivić',
        'Status': 'U obradi',
        'Datum': '2026-02-20',
        'Analiza vode': 'DA',
        'Usluge': 'Čišćenje dna i zidova ručno; Backwash filtera',
        'Zamjene dijelova': 'Pumpa|2|Neispravna; Filter|1|Istrošen',
        'Dodatne aktivnosti': 'Provjera pH sustava'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Radni nalozi');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Broj naloga
      { wch: 20 }, // Klijent
      { wch: 20 }, // Bazen
      { wch: 20 }, // Djelatnik
      { wch: 12 }, // Status
      { wch: 12 }, // Datum
      { wch: 10 }, // Analiza vode
      { wch: 40 }, // Usluge
      { wch: 40 }, // Zamjene dijelova
      { wch: 40 }, // Dodatne aktivnosti
    ];

    XLSX.writeFile(wb, 'predlozak_radni_nalozi.xlsx');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Load existing data
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      const pools = JSON.parse(localStorage.getItem('pools') || '[]');
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const workOrders = JSON.parse(localStorage.getItem('workOrders') || '[]');

      jsonData.forEach((row, index) => {
        try {
          const rowNum = index + 2; // Excel rows start at 1, header is row 1

          // Map Excel columns (flexible - check multiple possible column names)
          const clientName = row['Klijent'] || row['Client'] || row['klijent'];
          const poolName = row['Bazen'] || row['Pool'] || row['bazen'];
          const workOrderNumber = row['Broj naloga'] || row['Work Order Number'] || row['broj naloga'];
          const assignedToName = row['Djelatnik'] || row['Employee'] || row['djelatnik'];
          const status = row['Status'] || row['status'] || 'in-progress';
          const date = row['Datum'] || row['Date'] || row['datum'] || new Date().toISOString();
          const analysis = (row['Analiza vode'] || row['Water Analysis'] || row['analiza vode'] || '').toString().toUpperCase() === 'DA';
          const servicesStr = row['Usluge'] || row['Services'] || row['usluge'] || '';
          const replacementsStr = row['Zamjene dijelova'] || row['Replacements'] || row['zamjene dijelova'] || '';
          const additionalNotes = row['Dodatne aktivnosti'] || row['Additional Notes'] || row['dodatne aktivnosti'] || '';

          // Validate required fields
          if (!clientName || !poolName) {
            errors.push(`Red ${rowNum}: Klijent i Bazen su obavezni`);
            failedCount++;
            return;
          }

          // Find or create client
          let client = clients.find((c: any) => c.name.toLowerCase() === clientName.toLowerCase());
          if (!client) {
            client = {
              id: `imported-client-${Date.now()}-${index}`,
              name: clientName,
              contact: '',
              address: '',
            };
            clients.push(client);
          }

          // Find or create pool
          let pool = pools.find((p: any) => 
            p.name.toLowerCase() === poolName.toLowerCase() && p.clientId === client.id
          );
          if (!pool) {
            pool = {
              id: `imported-pool-${Date.now()}-${index}`,
              name: poolName,
              type: 'private',
              volume: 50, // default
              clientId: client.id,
            };
            pools.push(pool);
          }

          // Find employee by name
          let assignedTo = '';
          if (assignedToName) {
            const employee = employees.find((e: any) => 
              e.name.toLowerCase() === assignedToName.toLowerCase()
            );
            if (employee) {
              assignedTo = employee.id;
            }
          }

          // Parse services (semicolon separated)
          const services = servicesStr ? servicesStr.split(';').map((s: string, i: number) => ({
            id: `${i}`,
            label: s.trim(),
            completed: true
          })) : [];

          // Parse replacements (format: "Part|Quantity|Notes; Part2|Quantity2|Notes2")
          const replacements = replacementsStr ? replacementsStr.split(';').map((r: string, i: number) => {
            const parts = r.trim().split('|');
            return {
              id: `${i}`,
              part: parts[0] || '',
              quantity: parseInt(parts[1]) || 1,
              notes: parts[2] || ''
            };
          }) : [];

          // Create work order
          const workOrder = {
            id: `imported-${Date.now()}-${index}`,
            workOrderNumber: workOrderNumber || `IMPORT-${Date.now()}-${index}`,
            poolId: pool.id,
            clientId: client.id,
            date: typeof date === 'string' ? date : new Date().toISOString(),
            assignedTo,
            status: status.toLowerCase().includes('završ') || status.toLowerCase().includes('complete') 
              ? 'completed' 
              : status.toLowerCase().includes('obradi') || status.toLowerCase().includes('progress')
              ? 'in-progress'
              : 'pending',
            tasks: {
              analysis,
              services,
              replacements,
            },
            additionalNotes,
          };

          workOrders.push(workOrder);
          successCount++;
        } catch (error) {
          errors.push(`Red ${index + 2}: ${error instanceof Error ? error.message : 'Nepoznata greška'}`);
          failedCount++;
        }
      });

      // Save all data
      localStorage.setItem('clients', JSON.stringify(clients));
      localStorage.setItem('pools', JSON.stringify(pools));
      
      // Save work orders using workOrderStorage
      workOrders.forEach(wo => {
        workOrderStorage.save(wo);
      });

      setResult({
        success: successCount,
        failed: failedCount,
        errors
      });
    } catch (error) {
      setResult({
        success: 0,
        failed: 1,
        errors: [`Greška pri učitavanju fajla: ${error instanceof Error ? error.message : 'Nepoznata greška'}`]
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* HEADER */}
      <div className="bg-slate-800/50 border-b border-amber-500/20 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => navigate('/app')} 
            className="mr-4 text-amber-500 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
            Import radnih naloga
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* INSTRUCTIONS */}
        <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Upute za import</h2>
          <div className="space-y-3 text-slate-300">
            <p>1. Preuzmite predložak Excel fajla klikom na gumb ispod</p>
            <p>2. Popunite fajl sa podacima radnih naloga</p>
            <p>3. Spremite fajl i učitajte ga ovdje</p>
          </div>

          <div className="mt-6 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h3 className="font-bold text-white mb-2">Format kolona:</h3>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>• <span className="text-amber-500">Broj naloga</span> - Opciono (npr. RN-2026-001)</li>
              <li>• <span className="text-amber-500">Klijent</span> - Ime klijenta (obavezno)</li>
              <li>• <span className="text-amber-500">Bazen</span> - Naziv bazena (obavezno)</li>
              <li>• <span className="text-amber-500">Djelatnik</span> - Ime djelatnika (opciono)</li>
              <li>• <span className="text-amber-500">Status</span> - U obradi / Završeno (default: U obradi)</li>
              <li>• <span className="text-amber-500">Datum</span> - Datum naloga (default: danas)</li>
              <li>• <span className="text-amber-500">Analiza vode</span> - DA ili NE</li>
              <li>• <span className="text-amber-500">Usluge</span> - Odvojeno sa ; (npr. "Usluga1; Usluga2")</li>
              <li>• <span className="text-amber-500">Zamjene dijelova</span> - Format: "Dio|Količina|Napomena; Dio2|Količina2|Napomena2"</li>
              <li>• <span className="text-amber-500">Dodatne aktivnosti</span> - Tekst napomena</li>
            </ul>
          </div>

          <button
            onClick={downloadTemplate}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center justify-center gap-3 font-bold shadow-lg"
          >
            <Download className="w-6 h-6" />
            Preuzmi predložak Excel fajla
          </button>
        </div>

        {/* UPLOAD SECTION */}
        <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Učitaj Excel fajl</h2>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />

          <label
            htmlFor="file-upload"
            className={`block w-full border-2 border-dashed ${
              importing ? 'border-slate-600' : 'border-amber-500/50 hover:border-amber-500'
            } rounded-xl p-12 text-center cursor-pointer transition-all`}
          >
            <FileSpreadsheet className={`w-16 h-16 mx-auto mb-4 ${
              importing ? 'text-slate-600' : 'text-amber-500'
            }`} />
            
            {importing ? (
              <>
                <p className="text-lg font-bold text-slate-400 mb-2">Učitavanje...</p>
                <p className="text-sm text-slate-500">Molimo pričekajte</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-white mb-2">Klikni za odabir Excel fajla</p>
                <p className="text-sm text-slate-400">Podržani formati: .xlsx, .xls</p>
              </>
            )}
          </label>
        </div>

        {/* RESULTS */}
        {result && (
          <div className={`bg-slate-800/50 border-2 ${
            result.failed === 0 ? 'border-green-500/50' : 'border-yellow-500/50'
          } rounded-xl p-6`}>
            <div className="flex items-start gap-4">
              {result.failed === 0 ? (
                <CheckCircle className="w-12 h-12 text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-12 h-12 text-yellow-500 flex-shrink-0" />
              )}
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-4">Rezultati importa</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-400">{result.success}</div>
                    <div className="text-sm text-green-300">Uspješno importano</div>
                  </div>
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-red-400">{result.failed}</div>
                    <div className="text-sm text-red-300">Neuspješno</div>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <h3 className="font-bold text-white mb-2">Greške:</h3>
                    <ul className="space-y-1 text-sm text-red-400 max-h-48 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.success > 0 && (
                  <button
                    onClick={() => navigate('/app/all-work-orders')}
                    className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all"
                  >
                    Pregled importanih naloga
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
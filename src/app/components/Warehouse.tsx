import { Warehouse, Package, Plus, Search, Filter, TrendingDown, AlertTriangle, Settings, Download, Upload, Trash2, Edit, BarChart, X, FileSpreadsheet, Printer, QrCode } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'router';
import { useLanguage } from '../lib/languageContext';
import { warehouseStorage, WarehouseItem, WarehouseTransaction } from '../lib/warehouseStorage';
import { workOrderStorage } from '../lib/storage';
import * as XLSX from 'xlsx';
import { QRLabelPrinter } from './QRLabelPrinter';
import { NavigationHeader } from './NavigationHeader';

// Helper function to format price safely
const formatPrice = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return '0.00';
  return value.toFixed(2);
};

// Function to download Excel template with rules
const downloadExcelTemplate = () => {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // SHEET 1: Template with example data
  const templateData = [
    {
      'Naziv': 'Ivero pH Minus Granule',
      'Kategorija': 'Kemikalija',
      'Količina': 25,
      'Jedinica': 'kg',
      'Min. zaliha': 10,
      'Cijena': 4.20,
      'Dobavljač': 'Ivero',
      'Napomena': 'Za snižavanje pH vrijednosti'
    },
    {
      'Naziv': 'Pumpa Astral Victoria Plus',
      'Kategorija': 'Oprema',
      'Količina': 2,
      'Jedinica': 'kom',
      'Min. zaliha': 1,
      'Cijena': 450.00,
      'Dobavljač': 'Astral Pool',
      'Napomena': 'Rezervna pumpa za hitne slučajeve'
    },
    {
      'Naziv': 'Filter uložak',
      'Kategorija': 'Rezervni dio',
      'Količina': 8,
      'Jedinica': 'kom',
      'Min. zaliha': 3,
      'Cijena': 12.50,
      'Dobavljač': 'Hayward',
      'Napomena': ''
    }
  ];
  
  const ws1 = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths
  ws1['!cols'] = [
    { wch: 30 }, // Naziv
    { wch: 15 }, // Kategorija
    { wch: 12 }, // Količina
    { wch: 10 }, // Jedinica
    { wch: 12 }, // Min. zaliha
    { wch: 10 }, // Cijena
    { wch: 20 }, // Dobavljač
    { wch: 40 }  // Napomena
  ];
  
  XLSX.utils.book_append_sheet(wb, ws1, 'Predložak');
  
  // SHEET 2: Rules and instructions
  const rulesData = [
    ['📋 PRAVILA ZA UNOS PODATAKA U EXCEL TABLICU SKLADIŠTA'],
    [''],
    ['⚠️ OBAVEZNA PRAVILA:'],
    [''],
    ['1️⃣ NAZIVI KOLONA (MORAJU biti točno ovako napisani):'],
    ['   • Naziv'],
    ['   • Kategorija'],
    ['   • Količina'],
    ['   • Jedinica'],
    ['   • Min. zaliha'],
    ['   • Cijena'],
    ['   • Dobavljač'],
    ['   • Napomena'],
    [''],
    ['2️⃣ KATEGORIJA - Dopuštene vrijednosti:'],
    ['   • Kemikalija (ili Chemical)'],
    ['   • Oprema (ili Equipment)'],
    ['   • Rezervni dio (ili Spare part)'],
    ['   • Ostalo (ili Other)'],
    [''],
    ['3️⃣ KOLIČINA:'],
    ['   • Mora biti broj (decimalni broj sa točkom ili zarezom)'],
    ['   • Primjer: 25 ili 12.5 ili 10,5'],
    [''],
    ['4️⃣ JEDINICA:'],
    ['   • Primjeri: kg, L, kom, m, m², pakiranje, karton'],
    [''],
    ['5️⃣ MIN. ZALIHA:'],
    ['   • Mora biti broj'],
    ['   • Kada stvarna količina padne ispod ove vrijednosti, artikal se označava kao "Niska zaliha"'],
    [''],
    ['6️⃣ CIJENA:'],
    ['   • Mora biti broj (decimalni broj sa točkom ili zarezom)'],
    ['   • Primjer: 4.20 ili 450,00'],
    ['   • Valuta: EUR'],
    [''],
    ['7️⃣ DOBAVLJAČ:'],
    ['   • Nije obavezan ali preporučen'],
    ['   • Primjeri: Ivero, Astral Pool, Hayward, CTX'],
    [''],
    ['8️⃣ NAPOMENA:'],
    ['   • Nije obavezna'],
    ['   • Dodatne informacije o artiklu'],
    [''],
    [''],
    ['✅ SAVJETI ZA IZBJEGAVANJE GREŠAKA:'],
    [''],
    ['• Kopirajte nazive kolona iz "Predložak" sheet-a'],
    ['• Prvi red MORA sadržavati nazive kolona'],
    ['• Naziv artikla je OBAVEZAN - ne smije biti prazan'],
    ['• Brojevi mogu imati decimale sa točkom (12.5) ili zarezom (12,5)'],
    ['• Pazite na kategorije - pišite ih točno kao što je navedeno'],
    ['• Ako niste sigurni, koristite predložak iz prvog sheet-a'],
    [''],
    [''],
    ['🔧 ČESTE GREŠKE:'],
    [''],
    ['❌ POGREŠNO: "Ime" umjesto "Naziv"'],
    ['❌ POGREŠNO: "Tip" umjesto "Kategorija"'],
    ['❌ POGREŠNO: Kategorija "Hemija" umjesto "Kemikalija"'],
    ['❌ POGREŠNO: Količina "dvadeset" umjesto "20"'],
    ['❌ POGREŠNO: Cijena "4,20 EUR" umjesto "4.20"'],
    ['❌ POGREŠNO: Prazan naziv artikla'],
    [''],
    [''],
    ['💡 NAJBOLJA PRAKSA:'],
    [''],
    ['1. Preuzmite ovaj template'],
    ['2. Kopirajte prvi red (zaglavlja kolona)'],
    ['3. Brišite primjere iz Predložak sheet-a'],
    ['4. Unesite svoje podatke'],
    ['5. Spremite kao .xlsx datoteku'],
    ['6. Uvezite u AquaSmart Pro'],
    [''],
    ['Verzija template-a: 1.0'],
    ['Datum: ' + new Date().toLocaleDateString('hr-HR')]
  ];
  
  const ws2 = XLSX.utils.aoa_to_sheet(rulesData);
  ws2['!cols'] = [{ wch: 80 }];
  
  XLSX.utils.book_append_sheet(wb, ws2, 'PRAVILA I UPUTE');
  
  // Download
  XLSX.writeFile(wb, `AquaSmart_Skladiste_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export function Warehouse() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WarehouseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showQRPrinter, setShowQRPrinter] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, categoryFilter]);

  const loadItems = () => {
    const allItems = warehouseStorage.getItems();
    setItems(allItems);
  };

  const filterItems = () => {
    let filtered = [...items];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.supplier?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const result = warehouseStorage.importFromExcel(jsonData);
      
      if (result.errors.length > 0) {
        alert(`⚠️ Import završen sa greškama:\n\n✅ Uspješno: ${result.success}\n❌ Neuspješno: ${result.failed}\n\nGreške:\n${result.errors.slice(0, 5).join('\n')}`);
      } else {
        alert(`✅ Import uspješan!\n\nUvezeno: ${result.success} artikala`);
      }

      loadItems();
    } catch (error: any) {
      alert(`❌ Greška pri učitavanju datoteke:\n${error.message}`);
    }

    // Reset input
    e.target.value = '';
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`⚠️ Jeste li sigurni da želite obrisati "${name}"?\n\nOva radnja se ne može poništiti!`)) {
      warehouseStorage.deleteItem(id);
      loadItems();
    }
  };

  const lowStockItems = warehouseStorage.getLowStockItems();
  const lowStockCount = lowStockItems.length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chemical':
        return '🧪';
      case 'equipment':
        return '⚙️';
      case 'spare-part':
        return '🔧';
      default:
        return '📦';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'chemical':
        return t('categories.chemical');
      case 'equipment':
        return t('categories.equipment');
      case 'spare-part':
        return t('categories.sparePart');
      default:
        return t('categories.other');
    }
  };

  const handleSyncInventory = () => {
    if (!confirm('Želite li sinkronizirati zalihe s fakturiranim nalozima?\n\nOva radnja će proći kroz sve fakturirane naloge i skinuti potrošene artikle sa zaliha ako već nisu skinuti.')) return;

    try {
        const allOrders = workOrderStorage.getAll();
        const invoicedOrders = allOrders.filter(wo => wo.status === 'invoiced');
        const transactions = warehouseStorage.getTransactions();
        const warehouseItems = warehouseStorage.getItems();
        
        let processedOrders = 0;
        let deductedItems = 0;
        let deductedReplacements = 0;

        invoicedOrders.forEach(order => {
            // Check if any transaction exists for this order
            const hasTransaction = transactions.some(t => t.workOrderId === order.id);
            if (hasTransaction) return; // Already processed

            processedOrders++;
            let chemicals: any[] = [];
            let replacements: any[] = [];
            
            // Parse notes for used chemicals/parts
            let orderData: any = {};
            try {
                if (typeof order.notes === 'string') {
                    orderData = JSON.parse(order.notes);
                } else {
                    orderData = order.notes || {};
                }
                chemicals = Array.isArray(orderData.usedChemicals) ? orderData.usedChemicals : (order.chemicalsUsed || []);
                replacements = Array.isArray(orderData.replacements) ? orderData.replacements : [];
            } catch (e) { 
                console.error('Error parsing notes for order', order.id); 
                chemicals = order.chemicalsUsed || [];
            }

            // 1. Chemicals
            chemicals.forEach((chem: any) => {
                let item = warehouseItems.find(i => i.name === chem.name);
                
                // If not found, try fuzzy match
                if (!item) {
                    item = warehouseStorage.findChemicalByName(chem.name);
                }
                
                if (item) {
                    warehouseStorage.addTransaction({
                        itemId: item.id,
                        type: 'out',
                        quantity: parseFloat(chem.quantity) || 0,
                        date: order.invoicedAt || order.completedAt || new Date().toISOString(),
                        workOrderId: order.id,
                        notes: `Sync: Radni nalog #${order.workOrderNumber}`
                    });
                    deductedItems++;
                } else {
                    console.warn(`Sync: Chemical "${chem.name}" not found in warehouse for order #${order.workOrderNumber}`);
                }
            });

            // 2. Replacements
            replacements.forEach((rep: any) => {
                if (rep.completed) {
                    let item = warehouseItems.find(i => i.name === rep.part);
                    
                    // Fuzzy match for parts
                    if (!item) {
                        const cleanPart = rep.part.toLowerCase().trim();
                        item = warehouseItems.find(i => 
                            i.name.toLowerCase().includes(cleanPart) || 
                            cleanPart.includes(i.name.toLowerCase())
                        );
                    }

                    if (item) {
                        warehouseStorage.addTransaction({
                            itemId: item.id,
                            type: 'out',
                            quantity: rep.quantity || 1,
                            date: order.invoicedAt || order.completedAt || new Date().toISOString(),
                            workOrderId: order.id,
                            notes: `Sync: Radni nalog #${order.workOrderNumber} (Zamjena)`
                        });
                        deductedReplacements++;
                    } else {
                        console.warn(`Sync: Part "${rep.part}" not found in warehouse for order #${order.workOrderNumber}`);
                    }
                }
            });
        });

        alert(`✅ Sinkronizacija završena!\n\nObrađeno naloga: ${processedOrders}\nSkinuto kemikalija: ${deductedItems}\nSkinuto zamjenskih dijelova: ${deductedReplacements}`);
        loadItems(); // Refresh view
    } catch (e) {
        console.error(e);
        alert('❌ Greška prilikom sinkronizacije.');
    }
  };

  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-24">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <button 
            onClick={() => navigate('/app')} 
            className="mb-4 text-white hover:text-amber-100 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.back')}</span>
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('common.warehouse')} 📦</h1>
              <p className="text-amber-100">{t('inventory.title')}</p>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
              <div className="text-3xl font-bold">{items.length}</div>
              <div className="text-sm text-amber-100">{t('inventory.items')}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
              <div className="text-3xl font-bold">{formatPrice(totalValue)} €</div>
              <div className="text-sm text-amber-100">{t('inventory.value')}</div>
            </div>
            <div className={`backdrop-blur-md rounded-xl p-4 border ${
              lowStockCount > 0 
                ? 'bg-red-500/30 border-red-400/50' 
                : 'bg-white/20 border-white/30'
            }`}>
              <div className="text-3xl font-bold">{lowStockCount}</div>
              <div className="text-sm text-amber-100">{t('inventory.lowStock')}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
              <div className="text-3xl font-bold">
                {items.filter(i => i.category === 'chemical').length}
              </div>
              <div className="text-sm text-amber-100">{t('tasks.chemicals')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12">
        {/* ACTION BUTTONS */}
        <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-4 mb-6 flex flex-wrap gap-3">
          <button
            onClick={handleSyncInventory}
            className="flex-1 min-w-[200px] bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Sinkroniziraj Zalihe
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 min-w-[200px] bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-4 py-3 rounded-lg font-medium hover:from-amber-700 hover:to-yellow-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('inventory.addStock')}
          </button>

          <button
            onClick={downloadExcelTemplate}
            className="flex-1 min-w-[200px] bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Excel Predložak
          </button>

          <label className="flex-1 min-w-[200px] bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" />
            Uvezi iz Excela
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowQRPrinter(true)}
            className="flex-1 min-w-[200px] bg-zinc-700 text-white px-4 py-3 rounded-lg font-medium hover:bg-zinc-600 transition-all flex items-center justify-center gap-2 border border-zinc-600"
          >
            <QrCode className="w-5 h-5" />
            QR Naljepnice
          </button>

          <button
            onClick={() => setShowStats(true)}
            className="flex-1 min-w-[200px] bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            {t('inventory.stats')}
          </button>
        </div>

        {/* LOW STOCK ALERT */}
        {lowStockCount > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-bold mb-2">⚠️ Upozorenje - Niske zalihe</h3>
                <div className="text-sm text-red-300 space-y-1">
                  {lowStockItems.slice(0, 5).map(item => (
                    <div key={item.id}>
                      • {item.name}: {item.quantity} {item.unit} (min: {item.minStock})
                    </div>
                  ))}
                  {lowStockCount > 5 && (
                    <div className="text-red-400 font-medium">
                      ... i još {lowStockCount - 5} artikala
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FILTERS */}
        <div className="bg-slate-800/50 border border-amber-500/20 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${t('common.search')}...`}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">{language === 'hr' ? 'Sve kategorije' : language === 'it' ? 'Tutte le categorie' : 'All categories'}</option>
              <option value="chemical">🧪 {t('categories.chemical')}</option>
              <option value="equipment">⚙️ {t('categories.equipment')}</option>
              <option value="spare-part">🔧 {t('categories.sparePart')}</option>
              <option value="other">📦 {t('categories.other')}</option>
            </select>
          </div>
        </div>

        {/* ITEMS LIST */}
        {filteredItems.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Nema artikala koji odgovaraju filterima'
                : 'Skladište je prazno. Dodajte prvi artikal!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const isLowStock = item.quantity <= item.minStock;
              const stockPercentage = item.minStock > 0 ? (item.quantity / (item.minStock * 2)) * 100 : 100;
              const safePercentage = isNaN(stockPercentage) ? 0 : Math.min(100, stockPercentage);

              return (
                <div
                  key={item.id}
                  className={`bg-slate-800/50 border rounded-xl p-4 hover:bg-slate-800/70 transition-all ${
                    isLowStock ? 'border-red-500/50' : 'border-amber-500/20'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                        {item.category === 'chemical' && (
                          <PackagingIcon 
                            sizeString={item.name} 
                            iconSize={16} 
                            showLabel 
                            className="mt-1" 
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {getCategoryLabel(item.category)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Uredi"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Obriši"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stock Level */}
                  <div className="mb-3">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className={`text-2xl font-bold ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                        {item.quantity} {item.unit}
                      </span>
                      <span className="text-xs text-slate-400">
                        min: {item.minStock} {item.unit}
                      </span>
                    </div>
                    
                    {/* Stock bar */}
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isLowStock 
                            ? 'bg-red-500' 
                            : stockPercentage > 75 
                            ? 'bg-green-500' 
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${safePercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Price & Supplier */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cijena:</span>
                      <span className="text-white font-medium">{formatPrice(item.price)} € / {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vrijednost:</span>
                      <span className="text-amber-400 font-bold">
                        {formatPrice(item.quantity * item.price)} €
                      </span>
                    </div>
                    {item.supplier && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dobavljač:</span>
                        <span className="text-white text-xs">{item.supplier}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-xs text-slate-400 italic">{item.notes}</p>
                    </div>
                  )}

                  {/* Low Stock Warning */}
                  {isLowStock && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                      <AlertTriangle className="w-3 h-3" />
                      {t('analysis.low').toUpperCase()}!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {(showAddModal || editingItem) && (
        <AddEditItemModal
          item={editingItem}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            loadItems();
            setShowAddModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* STATS MODAL */}
      {showStats && (
        <StatsModal onClose={() => setShowStats(false)} />
      )}

      {/* QR PRINTER MODAL */}
      {showQRPrinter && (
        <QRLabelPrinter 
          items={filteredItems} 
          onClose={() => setShowQRPrinter(false)} 
        />
      )}
    </div>
  );
}

// Add/Edit Item Modal Component
function AddEditItemModal({ 
  item, 
  onClose, 
  onSave 
}: { 
  item: WarehouseItem | null; 
  onClose: () => void; 
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'chemical' as WarehouseItem['category'],
    quantity: item?.quantity || 0,
    unit: item?.unit || 'L',
    minStock: item?.minStock || 0,
    price: item?.price || 0,
    supplier: item?.supplier || '',
    notes: item?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Naziv je obavezan!');
      return;
    }

    if (item) {
      warehouseStorage.updateItem(item.id, formData);
    } else {
      warehouseStorage.addItem(formData);
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-amber-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">
            {item ? 'Uredi artikal' : 'Dodaj novi artikal'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Naziv *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              placeholder="npr. Ivero pH Plus"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Kategorija *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as WarehouseItem['category'] })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="chemical">🧪 Kemikalija</option>
              <option value="equipment">⚙️ Oprema</option>
              <option value="spare-part">🔧 Rezervni dio</option>
              <option value="other">📦 Ostalo</option>
            </select>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Količina *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Jedinica *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              >
                <option value="L">L (litra)</option>
                <option value="kg">kg (kilogram)</option>
                <option value="kom">kom (komad)</option>
                <option value="m">m (metar)</option>
                <option value="m²">m² (četvorni metar)</option>
              </select>
            </div>
          </div>

          {/* Min Stock & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Minimalna zaliha *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cijena (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Dobavljač
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              placeholder="npr. Mondo Acqua"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Napomena
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              rows={3}
              placeholder="Dodatne informacije..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Odustani
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg font-medium hover:from-amber-700 hover:to-yellow-700 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {item ? 'Spremi' : 'Dodaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Stats Modal Component
function StatsModal({ onClose }: { onClose: () => void }) {
  const stats30 = warehouseStorage.getConsumptionStats(30);
  const stats7 = warehouseStorage.getConsumptionStats(7);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-amber-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Statistika potrošnje</h2>
            <p className="text-purple-100 text-sm">Pregled najpopularnijih artikala</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Last 7 days */}
          <div>
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-amber-500" />
              Zadnjih 7 dana
            </h3>
            {stats7.length === 0 ? (
              <p className="text-slate-400 text-sm">Nema podataka o potrošnji</p>
            ) : (
              <div className="space-y-2">
                {stats7.slice(0, 5).map((stat, index) => (
                  <div key={stat.itemId} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-amber-500 w-8">
                      {index + 1}.
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{stat.name}</div>
                      <div className="text-sm text-slate-400">
                        Utrošeno: {formatPrice(stat.consumed)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last 30 days */}
          <div>
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-500" />
              Zadnjih 30 dana
            </h3>
            {stats30.length === 0 ? (
              <p className="text-slate-400 text-sm">Nema podataka o potrošnji</p>
            ) : (
              <div className="space-y-2">
                {stats30.slice(0, 10).map((stat, index) => (
                  <div key={stat.itemId} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-500 w-8">
                      {index + 1}.
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{stat.name}</div>
                      <div className="text-sm text-slate-400">
                        Utrošeno: {formatPrice(stat.consumed)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
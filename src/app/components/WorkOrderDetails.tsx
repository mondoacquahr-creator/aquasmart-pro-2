import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { syncData } from '../lib/supabase';
import { ArrowLeft, Check, Camera, FileText, Printer, Save, Clock, MapPin, Droplets, Settings, Wrench, Plus, X, Beaker, AlertTriangle, CheckCircle, DollarSign, User, QrCode, Box } from 'lucide-react';
import { storage } from '../lib/storage';
import { workOrderStorage } from '../lib/workOrderStorage';
import { warehouseStorage, WarehouseItem } from '../lib/warehouseStorage';
import { Pool, WorkOrder } from '../types';
import { generateWorkOrderPDF } from '../lib/pdfExport';
import { analyzeWater, AnalysisResult } from '../lib/waterAnalysis';
import { IVERO_PRICES, getProductUnitPrice } from '../lib/productPrices';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../lib/languageContext';
import { analyticsStorage, AnalyticsEntry } from '../lib/analytics';
// import { toast } from 'sonner@2.0.3';
// import { QRScanner } from './QRScanner';
// import { PackagingIcon } from './PackagingIcon';

// Define interfaces locally
interface AnalysisParameters {
  ph?: string;
  chlorine?: string;
  alkalinity?: string;
  temperature?: string;
  redox?: string;
}

interface AutomationData {
  systemType: string;
  operationalStatus: 'ok' | 'warning' | 'error' | 'off';
  lcdValues: {
    ph?: string;
    redox?: string;
    chlorine?: string;
    salt?: string;
    temperature?: string;
  };
  canisters: {
    phMinus?: 'empty' | 'low' | 'ok' | 'full';
    liquidChlorine?: 'empty' | 'low' | 'ok' | 'full';
    flocculant?: 'empty' | 'low' | 'ok' | 'full';
  };
  notes?: string;
}

interface WorkOrderData {
  workOrderNumber: string;
  clientType: 'company' | 'individual';
  orderNumber: string;
  year: string;
  dateStarted: string;
  dateCompleted: string;
  costCenter: string;
  costBearer: string;
  description: string;
  issuer: string;
  analysisEnabled: boolean;
  services: Record<string, boolean>;
  servicesLabels: Record<string, string>;
  requestedServices: string[];
  replacements: Array<{
    id: string;
    part: string;
    quantity: number;
    notes: string;
    completed?: boolean;
  }>;
  usedChemicals?: Array<{
    id: string;
    name: string;
    quantity: string;
    unit: string;
    price?: string;
    discount?: string;
  }>;
  analysisParams?: AnalysisParameters;
  analysisResults?: any;
  automationData?: AutomationData;
}

export function WorkOrderDetails() {
  const navigate = useNavigate();
  const { poolId, workOrderId, id } = useParams();
  const effectiveWorkOrderId = workOrderId || id;
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  
  // State
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pool, setPool] = useState<Pool | null>(null);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [workOrderData, setWorkOrderData] = useState<WorkOrderData | null>(null);
  const [analysisParams, setAnalysisParams] = useState<AnalysisParameters>({});
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);
  const [startTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'analysis' | 'services' | 'replacements' | 'chemicals' | 'photos' | 'automation'>('services');
  const [userRole, setUserRole] = useState<'employee' | 'employer' | null>(null);
  const [billingItems, setBillingItems] = useState<Array<{id: string, description: string, quantity: number, price: number}>>([]);
  const [usedChemicals, setUsedChemicals] = useState<Array<{id: string, name: string, quantity: string, unit: string, price?: string, discount?: string}>>([]);
  const [chemicalSuggestions, setChemicalSuggestions] = useState<string[]>([]);
  const [activeChemicalId, setActiveChemicalId] = useState<string | null>(null);
  const [automationConfirmed, setAutomationConfirmed] = useState<boolean | null>(null);
  const [workPhotos, setWorkPhotos] = useState<Array<{id: string, category: 'machine-room' | 'elements' | 'pool', dataUrl: string, timestamp: string}>>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [clientAutomation, setClientAutomation] = useState<string>('none');
  const [clientAutomationNotes, setClientAutomationNotes] = useState<string>('');

  // Helper function to safely format price
  const formatPrice = (value: any): string => {
    try {
      const num = parseFloat(value);
      if (isNaN(num) || value === null || value === undefined) {
        return '0.00';
      }
      return num.toFixed(2);
    } catch (e) {
      return '0.00';
    }
  };

  const handleChemicalNameChange = (id: string, value: string) => {
    try {
      const warehouseItem = warehouseItems.find(i => i.name === value);
      
      let price = '';
      if (warehouseItem && warehouseItem.price > 0) {
        price = String(warehouseItem.price);
      } else {
        const iveroPrice = getProductUnitPrice(value);
        if (iveroPrice) {
          price = String(iveroPrice);
        }
      }

      const updated = usedChemicals.map(c => 
        c.id === id ? { 
          ...c, 
          name: value,
          unit: warehouseItem ? warehouseItem.unit : c.unit,
          price: price
        } : c
      );
      setUsedChemicals(updated);
      setActiveChemicalId(id);

      // Suggestions disabled in safe mode
      setChemicalSuggestions([]);
    } catch (e) {
      console.error('Error in handleChemicalNameChange:', e);
    }
  };

  const selectSuggestion = (id: string, name: string) => {
    try {
      const warehouseItem = warehouseItems.find(i => i.name === name);
      
      let price = '';
      if (warehouseItem && warehouseItem.price > 0) {
        price = String(warehouseItem.price);
      } else {
        const iveroPrice = getProductUnitPrice(name);
        if (iveroPrice) {
          price = String(iveroPrice);
        }
      }

      const updated = usedChemicals.map(c => 
        c.id === id ? { 
          ...c, 
          name: name,
          unit: warehouseItem ? warehouseItem.unit : c.unit,
          price: price
        } : c
      );
      setUsedChemicals(updated);
      setChemicalSuggestions([]);
      setActiveChemicalId(null);
    } catch (e) {
      console.error('Error in selectSuggestion:', e);
    }
  };

  useEffect(() => {
    try {
      // Ensure data is synced for deep links
      syncData();
      
      const savedRole = localStorage.getItem('userRole');
      setUserRole(savedRole as 'employee' | 'employer' | null);
      
      // Load warehouse items
      setWarehouseItems(warehouseStorage.getItems());
    } catch (e) {
      console.error('Error in startup useEffect:', e);
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    const isOrderCompleted = Boolean(workOrder?.status === 'completed' || workOrder?.status === 'invoiced');
    // Allow Employer to edit completed (but not invoiced) orders
    const isLocked = isOrderCompleted && (userRole === 'employee' || workOrder?.status === 'invoiced');
    
    if (!workOrder || !workOrderData || isLocked) return;

    setIsSaving(true);
    const timeout = setTimeout(() => {
      console.log('💾 Auto-saving work order progress...');
      const updatedOrder: WorkOrder = {
        ...workOrder,
        automationConfirmed: automationConfirmed ?? undefined,
        machineRoomPhotos: workPhotos,
        notes: JSON.stringify({
          ...workOrderData,
          analysisParams,
          usedChemicals,
          automationConfirmed
        }),
      };
      workOrderStorage.save(updatedOrder);
      setIsSaving(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, [workOrder, workOrderData, analysisParams, usedChemicals, automationConfirmed, workPhotos]);

  useEffect(() => {
    try {
      if (!effectiveWorkOrderId || effectiveWorkOrderId === 'undefined') {
        console.warn('No valid workOrderId provided');
        return;
      }

      const allOrders = workOrderStorage.getAll() || [];
      const order = allOrders.find(wo => wo && wo.id === effectiveWorkOrderId) || null;
      
      const resolvedPoolId = (poolId && poolId !== 'undefined') ? poolId : order?.poolId;
      
      let poolData: Pool | undefined;
      if (resolvedPoolId && resolvedPoolId !== 'undefined') {
        poolData = storage.getPool(resolvedPoolId);
        setPool(poolData || null);
      }

      if (order) {
        setWorkOrder(order);
        setAutomationConfirmed(order.automationConfirmed ?? null);
        setWorkPhotos(Array.isArray(order.machineRoomPhotos) ? order.machineRoomPhotos : []);

        if (order?.notes) {
          try {
            let parsedData;
            if (typeof order.notes === 'string') {
              try {
                parsedData = JSON.parse(order.notes);
              } catch (e) {
                parsedData = { description: order.notes };
              }
            } else {
              parsedData = order.notes;
            }
            
            if (!parsedData) parsedData = {};
            
            // ROBUST DATA VALIDATION (CRITICAL FIX)
            const sanitizedData: WorkOrderData = {
              workOrderNumber: parsedData.workOrderNumber || order.workOrderNumber || 'N/A',
              clientType: parsedData.clientType || 'individual',
              orderNumber: parsedData.orderNumber || '',
              year: parsedData.year || new Date().getFullYear().toString(),
              dateStarted: parsedData.dateStarted || order.date || new Date().toISOString(),
              dateCompleted: parsedData.dateCompleted || '',
              costCenter: parsedData.costCenter || '',
              costBearer: parsedData.costBearer || '',
              description: (() => {
                const d = String(parsedData.description || '');
                return d.trim().startsWith('{"workOrderNumber"') ? '' : d;
              })(),
              issuer: parsedData.issuer || '',
              analysisEnabled: Boolean(parsedData.analysisEnabled),
              services: parsedData.services || {},
              servicesLabels: parsedData.servicesLabels || {},
              replacements: Array.isArray(parsedData.replacements) ? parsedData.replacements.filter(Boolean) : [],
              requestedServices: Array.isArray(parsedData.requestedServices) ? parsedData.requestedServices.filter(Boolean) : [],
              analysisParams: parsedData.analysisParams || {},
              analysisResults: parsedData.analysisResults,
              usedChemicals: Array.isArray(parsedData.usedChemicals) ? parsedData.usedChemicals.filter(Boolean) : [],
              automationData: parsedData.automationData || (poolData?.disinfectionSystem && poolData.disinfectionSystem !== 'tablete' ? {
                  systemType: poolData.disinfectionSystem,
                  operationalStatus: 'ok',
                  lcdValues: {},
                  canisters: {}
              } : undefined)
            };

            // Validate analysis results structure
            if (sanitizedData.analysisResults) {
              if (!Array.isArray(sanitizedData.analysisResults.issues)) sanitizedData.analysisResults.issues = [];
              if (!Array.isArray(sanitizedData.analysisResults.recommendations)) sanitizedData.analysisResults.recommendations = [];
              if (!Array.isArray(sanitizedData.analysisResults.insights)) sanitizedData.analysisResults.insights = [];
              if (sanitizedData.analysisResults.treatmentCost && !Array.isArray(sanitizedData.analysisResults.treatmentCost.items)) {
                if (!sanitizedData.analysisResults.treatmentCost) sanitizedData.analysisResults.treatmentCost = { items: [], totalEUR: 0, totalHRK: 0 };
                else sanitizedData.analysisResults.treatmentCost.items = [];
              }
            }
            
            setWorkOrderData(sanitizedData);
            
            if (sanitizedData.analysisParams) setAnalysisParams(sanitizedData.analysisParams);
            if (sanitizedData.analysisResults) setAnalysisResults(sanitizedData.analysisResults);
            if (sanitizedData.usedChemicals) setUsedChemicals(sanitizedData.usedChemicals);

            // Load client automation settings
            if (order.clientId) {
              const client = storage.getClient(order.clientId);
              if (client) {
                setClientAutomation(client.automation || 'none');
                setClientAutomationNotes(client.automationNotes || '');
              }
            }

          } catch (e) {
            console.error('❌ Failed to process work order notes:', e);
            // Fallback
            setWorkOrderData({
              workOrderNumber: order.workOrderNumber || 'N/A',
              clientType: 'individual',
              orderNumber: '',
              year: new Date().getFullYear().toString(),
              dateStarted: order.date || new Date().toISOString(),
              dateCompleted: '',
              costCenter: '',
              costBearer: '',
              description: typeof order.notes === 'string' ? order.notes : '',
              issuer: '',
              analysisEnabled: false,
              services: {},
              servicesLabels: {},
              replacements: [],
              requestedServices: []
            });
          }
        } else {
          setWorkOrderData({
            workOrderNumber: order.workOrderNumber || 'N/A',
            clientType: 'individual',
            orderNumber: '',
            year: new Date().getFullYear().toString(),
            dateStarted: order.date || new Date().toISOString(),
            dateCompleted: '',
            costCenter: '',
            costBearer: '',
            description: '',
            issuer: '',
            analysisEnabled: false,
            services: {},
            servicesLabels: {},
            replacements: [],
            requestedServices: []
          });
        }
        
        if (order?.billing && Array.isArray(order.billing.items)) {
          setBillingItems(order.billing.items.filter(Boolean));
        }
        
        if (order?.chemicalsUsed && Array.isArray(order.chemicalsUsed) && usedChemicals.length === 0) {
          setUsedChemicals(order.chemicalsUsed.map(c => ({
            id: c.id || String(Math.random()),
            name: c.name || '',
            quantity: String(c.quantity || '0'),
            unit: c.unit || 'kg',
            price: c.price ? String(c.price) : undefined,
            discount: c.discount ? String(c.discount) : undefined
          })).filter(Boolean));
        }
      } else {
        setWorkOrder(null);
        setWorkOrderData(null);
        setPool(null);
      }
    } catch (error) {
      console.error('❌❌❌ CRITICAL ERROR in useEffect:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Kritična greška prilikom učitavanja naloga.');
    }
  }, [poolId, effectiveWorkOrderId]);

  const handleScan = (decodedText: string) => {
    // Disabled in safe mode
    setShowScanner(false);
    alert('QR Skener je privremeno nedostupan.');
  };

  const handleToggleService = (serviceId: string) => {
    try {
      if (!workOrderData) return;
      const currentServices = workOrderData.services || {};
      const updatedServices = { ...currentServices, [serviceId]: !currentServices[serviceId] };
      setWorkOrderData({ ...workOrderData, services: updatedServices });
    } catch (e) { console.error(e); }
  };

  const handleToggleReplacement = (replacementId: string) => {
    try {
      if (!workOrderData) return;
      const currentReplacements = Array.isArray(workOrderData.replacements) ? workOrderData.replacements : [];
      const updatedReplacements = currentReplacements.map(r =>
        r.id === replacementId ? { ...r, completed: !r.completed } : r
      );
      setWorkOrderData({ ...workOrderData, replacements: updatedReplacements });
    } catch (e) { console.error(e); }
  };

  const handleAddReplacement = () => {
    try {
      if (!workOrderData) return;
      const newReplacement = { id: Date.now().toString(), part: '', quantity: 1, notes: '', completed: false };
      const currentReplacements = Array.isArray(workOrderData.replacements) ? workOrderData.replacements : [];
      setWorkOrderData({ ...workOrderData, replacements: [...currentReplacements, newReplacement] });
    } catch (e) { console.error(e); }
  };

  const handleUpdateReplacement = (id: string, field: string, value: any) => {
    try {
      if (!workOrderData) return;
      const currentReplacements = Array.isArray(workOrderData.replacements) ? workOrderData.replacements : [];
      const updatedReplacements = currentReplacements.map(r =>
        r.id === id ? { ...r, [field]: value } : r
      );
      setWorkOrderData({ ...workOrderData, replacements: updatedReplacements });
    } catch (e) { console.error(e); }
  };

  const handleRemoveReplacement = (id: string) => {
    try {
      if (!workOrderData) return;
      const currentReplacements = Array.isArray(workOrderData.replacements) ? workOrderData.replacements : [];
      setWorkOrderData({ ...workOrderData, replacements: currentReplacements.filter(r => r.id !== id) });
    } catch (e) { console.error(e); }
  };

  const handleUpdateAnalysisParam = (param: keyof AnalysisParameters, value: string) => {
    setAnalysisParams({ ...analysisParams, [param]: value });
  };

  // Save client automation settings to database
  const saveClientAutomation = () => {
    if (!workOrder?.clientId) return;
    
    try {
      const client = storage.getClient(workOrder.clientId);
      if (client) {
        const updatedClient = {
          ...client,
          automation: clientAutomation as any,
          automationNotes: clientAutomationNotes
        };
        storage.saveClient(updatedClient);
        console.log('✅ Client automation saved:', clientAutomation);
      }
    } catch (e) {
      console.error('❌ Error saving client automation:', e);
    }
  };

  const handleSaveProgress = () => {
    console.log('🔵 handleSaveProgress called', { 
      workOrder: !!workOrder, 
      workOrderData: !!workOrderData, 
      userRole, 
      status: workOrder?.status 
    });
    
    if (!workOrder || !workOrderData) {
      console.error('❌ Missing workOrder or workOrderData');
      return;
    }
    
    // Save client automation to database
    saveClientAutomation();
    
    const updatedData = { ...workOrderData, analysisParams, usedChemicals };
    const updatedOrder: WorkOrder = {
      ...workOrder,
      status: 'in-progress',
      automationConfirmed: automationConfirmed ?? undefined,
      machineRoomPhotos: workPhotos,
      notes: JSON.stringify(updatedData),
      billing: billingItems.length > 0 ? {
        items: billingItems,
        total: billingItems.reduce((sum, item) => {
            const itemTotal = (item.quantity || 0) * (item.price || 0);
            const discount = (item as any).discount || 0;
            return sum + (itemTotal * (1 - discount/100));
        }, 0)
      } : undefined,
      chemicalsUsed: usedChemicals.map(c => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        unit: c.unit,
        price: c.price ? parseFloat(c.price) : undefined,
        discount: c.discount ? parseFloat(c.discount) : undefined
      })),
    };
    workOrderStorage.save(updatedOrder);
    alert('Napredak je spremljen!');
  };

  const handleComplete = () => {
    console.log('🟢 handleComplete called', { 
      workOrder: !!workOrder, 
      pool: !!pool, 
      workOrderData: !!workOrderData, 
      userRole, 
      status: workOrder?.status 
    });
    
    if (!workOrder || !pool || !workOrderData) {
      console.error('❌ Missing workOrder, pool or workOrderData');
      return;
    }
    
    // Save client automation to database before completing
    saveClientAutomation();
    
    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    // Manual billing items ONLY (no auto-import from analysis)
    let baseBillingItems = billingItems.filter(item => !String(item.id).startsWith('chem-'));

    // Add priced chemicals from Chemicals tab
    const chemicalItems = usedChemicals
        .filter(c => c.price && parseFloat(c.price) > 0)
        .map(c => ({
            id: `chem-${c.id}`,
            description: `${c.name} (${c.unit})`,
            quantity: parseFloat(c.quantity) || 1,
            price: parseFloat(c.price!),
            discount: c.discount ? parseFloat(c.discount) : undefined
        }));
    
    const finalBillingItems = [...baseBillingItems, ...chemicalItems];

    const updatedData = {
      ...workOrderData,
      analysisParams,
      analysisResults,
      usedChemicals,
      billingItems: finalBillingItems,
    };

    const updatedOrder: WorkOrder = {
      ...workOrder,
      status: 'completed',
      completedAt: new Date().toISOString(),
      completedBy: currentUser?.id,
      completedByName: currentUser?.name,
      automationConfirmed: automationConfirmed ?? undefined,
      machineRoomPhotos: workPhotos,
      timeSpent,
      notes: JSON.stringify(updatedData),
      analysisResults: analysisResults ? {
        status: analysisResults.status,
        parameters: {
          pH: analysisParams.ph ? parseFloat(analysisParams.ph) : undefined,
          chlorine: analysisParams.chlorine ? parseFloat(analysisParams.chlorine) : undefined,
          alkalinity: analysisParams.alkalinity ? parseFloat(analysisParams.alkalinity) : undefined,
          temperature: analysisParams.temperature ? parseFloat(analysisParams.temperature) : undefined,
          redox: analysisParams.redox ? parseFloat(analysisParams.redox) : undefined,
        },
        recommendations: analysisResults.recommendations,
      } : undefined,
      billing: finalBillingItems.length > 0 ? {
        items: finalBillingItems,
        total: finalBillingItems.reduce((sum: any, item: any) => {
            const itemTotal = (item.quantity || 0) * (item.price || 0);
            const discount = item.discount || 0;
            return sum + (itemTotal * (1 - discount/100));
        }, 0)
      } : undefined,
      cost: finalBillingItems.reduce((sum: any, item: any) => {
            const itemTotal = (item.quantity || 0) * (item.price || 0);
            const discount = item.discount || 0;
            return sum + (itemTotal * (1 - discount/100));
        }, 0),
      chemicalsUsed: usedChemicals.map(c => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        unit: c.unit,
        price: c.price ? parseFloat(c.price) : undefined,
        discount: c.discount ? parseFloat(c.discount) : undefined
      })),
    };

    workOrderStorage.save(updatedOrder);
    alert('Radni nalog je označen kao završen!');
    navigate('/app');
  };

  const handleInvoice = () => {
    if (!workOrder) return;
    if (workOrder.status === 'invoiced') {
      alert('Nalog je već fakturiran!');
      return;
    }
    const confirmed = confirm('Želite li označiti nalog kao fakturiran? Potvrdom će se utrošeni artikli skinuti sa zaliha.');
    if (!confirmed) return;
    
    // Deduct from stock
    try {
      const allItems = warehouseStorage.getItems();
      let deductedCount = 0;

      // 1. Chemicals
      usedChemicals.forEach(chem => {
        let item = allItems.find(i => i.name === chem.name);
        if (!item) {
          item = warehouseStorage.findChemicalByName(chem.name);
        }

        if (item) {
          warehouseStorage.addTransaction({
            itemId: item.id,
            type: 'out',
            quantity: parseFloat(chem.quantity) || 0,
            date: new Date().toISOString(),
            workOrderId: workOrder.id,
            notes: `Radni nalog #${workOrder.workOrderNumber}`
          });
          deductedCount++;
        } else {
           console.warn(`Invoice: Chemical "${chem.name}" not found in warehouse.`);
        }
      });

      // 2. Replacements (Parts)
      if (workOrderData?.replacements) {
        workOrderData.replacements.forEach(rep => {
          if (rep.completed) {
            let item = allItems.find(i => i.name === rep.part);
            
            if (!item) {
                // Fuzzy match for parts
                const cleanPart = rep.part.toLowerCase().trim();
                item = allItems.find(i => 
                    i.name.toLowerCase().includes(cleanPart) || 
                    cleanPart.includes(i.name.toLowerCase())
                );
            }

            if (item) {
              warehouseStorage.addTransaction({
                itemId: item.id,
                type: 'out',
                quantity: rep.quantity || 1,
                date: new Date().toISOString(),
                workOrderId: workOrder.id,
                notes: `Radni nalog #${workOrder.workOrderNumber} (Zamjena)`
              });
              deductedCount++;
            } else {
                console.warn(`Invoice: Part "${rep.part}" not found in warehouse.`);
            }
          }
        });
      }
      
      console.log(`Inventory update: Deducted ${deductedCount} items.`);
    } catch (e) {
      console.error('Error updating inventory:', e);
      alert('Upozorenje: Došlo je do greške prilikom ažuriranja zaliha. Provjerite stanje skladišta.');
    }
    
    const updatedOrder: WorkOrder = {
      ...workOrder,
      status: 'invoiced',
      invoicedAt: new Date().toISOString(),
    };
    workOrderStorage.save(updatedOrder);
    setWorkOrder(updatedOrder);
    alert('Nalog je fakturiran i artikli su skinuti sa zaliha!');
    navigate('/app');
  };

  const handleReopenWorkOrder = () => {
    if (!workOrder) return;
    const confirmed = confirm('Želite li ponovno otvoriti ovaj radni nalog?');
    if (!confirmed) return;
    const updatedOrder: WorkOrder = {
      ...workOrder,
      status: 'in-progress',
      completedAt: undefined,
    };
    workOrderStorage.save(updatedOrder);
    setWorkOrder(updatedOrder);
    alert('Radni nalog je ponovno otvoren!');
  };

  const handleAnalyze = () => {
    if (!pool) return;
    
    if (!analysisParams.ph || !analysisParams.chlorine) {
      alert('Molimo unesite barem pH i Klor za analizu.');
      return;
    }

    try {
      const parameters = {
        pH: parseFloat(analysisParams.ph),
        freeChlorine: parseFloat(analysisParams.chlorine),
        alkalinity: analysisParams.alkalinity ? parseFloat(analysisParams.alkalinity) : undefined,
        temperature: analysisParams.temperature ? parseFloat(analysisParams.temperature) : undefined,
        orp: analysisParams.redox ? parseFloat(analysisParams.redox) : undefined,
      };

      const results = analyzeWater(parameters, pool.volume || 0, pool.disinfectionSystem as any);
      setAnalysisResults(results);
      
      // Save results to workOrderData
      if (workOrderData) {
        const updatedData = { ...workOrderData, analysisResults: results };
        setWorkOrderData(updatedData);
      }
      
      // 🔥 SAVE TO ANALYTICS for trending and reporting
      const client = storage.getClients().find(c => c.id === pool.clientId);
      const analyticsEntry: AnalyticsEntry = {
        id: `analytics-${Date.now()}`,
        timestamp: new Date().toISOString(),
        clientId: pool.clientId,
        clientName: client?.name || 'N/A',
        poolId: pool.id,
        poolName: pool.name,
        poolVolume: pool.volume || 0,
        parameters: {
          pH: parameters.pH,
          freeChlorine: parameters.freeChlorine,
          alkalinity: parameters.alkalinity,
          temperature: parameters.temperature,
          orp: parameters.orp,
        },
        status: results.status,
        recommendations: results.recommendations.map(rec => ({
          productName: rec.productName,
          quantity: rec.quantity,
          unit: rec.unit,
          category: rec.category,
        })),
        treatmentCost: results.treatmentCost?.totalEUR,
        source: 'manual',
      };
      
      analyticsStorage.save(analyticsEntry);
      console.log('✅ Analysis saved to analytics dashboard:', analyticsEntry);
      
      alert('Analiza završena!');
    } catch (e) {
      console.error('Analysis error:', e);
      alert('Greška prilikom analize vode.');
    }
  };

  const handlePrint = () => {
    if (!workOrder || !pool) return;
    try {
      const client = storage.getClients().find(c => c.id === pool.clientId);
      generateWorkOrderPDF(workOrder, pool, client);
      alert('PDF je uspješno generiran!');
    } catch (e) {
      console.error('Greška prilikom generiranja PDF-a:', e);
      alert('Došlo je do greške prilikom generiranja PDF-a. Provjerite konzolu za detalje.');
    }
  };

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center bg-red-900/20 p-8 rounded-3xl border border-red-500/30">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Greška</h2>
          <p className="text-gray-300 mb-4">{errorMessage}</p>
          <button onClick={() => navigate('/app')} className="bg-zinc-700 text-white px-6 py-3 rounded-xl">Povratak</button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!workOrder || !pool || !workOrderData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-6"></div>
          <p className="text-gray-400">Učitavanje podataka...</p>
        </div>
      </div>
    );
  }

  // Progress calculation
  let completedTasks = 0;
  let totalTasks = 0;
  let progress = 100;
  try {
    const requestedServicesIds = (workOrderData && workOrderData.requestedServices) || [];
    const safeServices = (workOrderData && workOrderData.services) || {};
    const mandatoryServicesCount = requestedServicesIds.length;
    const mandatoryServicesCompleted = requestedServicesIds.filter(id => id && safeServices[id]).length;
    const safeReplacements = (workOrderData && workOrderData.replacements) || [];
    const replacementsCount = safeReplacements.length;
    const replacementsCompleted = safeReplacements.filter(r => r && r.completed).length;
    const analysisCompleted = (workOrderData && workOrderData.analysisEnabled && analysisParams && analysisParams.ph) ? 1 : 0;
    const analysisCount = (workOrderData && workOrderData.analysisEnabled) ? 1 : 0;
    totalTasks = mandatoryServicesCount + replacementsCount + analysisCount;
    completedTasks = mandatoryServicesCompleted + replacementsCompleted + analysisCompleted;
    progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;
  } catch (e) {}

  const isOrderCompleted = Boolean(workOrder?.status === 'completed' || workOrder?.status === 'invoiced');
  // Allow Employer to edit completed (but not invoiced) orders
  const isLocked = isOrderCompleted && (userRole === 'employee' || workOrder?.status === 'invoiced');
  
  console.log('🔒 Lock status:', { 
    isOrderCompleted, 
    isLocked, 
    userRole, 
    status: workOrder?.status,
    shouldShowButtons: !isLocked
  });

  // Calculate totals
  const manualBillingItems = billingItems.filter(item => !String(item.id).startsWith('chem-'));
  const manualTotal = manualBillingItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const chemicalsTotal = usedChemicals.reduce((sum, c) => {
    const qty = parseFloat(c.quantity) || 0;
    const price = parseFloat(c.price || '0') || 0;
    const discount = parseFloat(c.discount || '0') || 0;
    return sum + (qty * price * (1 - discount / 100));
  }, 0);
  const grandTotal = manualTotal + chemicalsTotal;
  const hasBillableItems = manualBillingItems.length > 0 || chemicalsTotal > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-slate-900 to-black pb-40">
      {/* Header */}
      <div className="bg-zinc-900/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-10 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/app')} className="p-2 text-amber-500">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{t('common.workOrder')} {workOrder.workOrderNumber}</h1>
                <p className="text-sm text-gray-400">{pool.name}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                    {workOrder.assignedToName && (
                        <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 font-bold">
                            <User className="w-3 h-3" /> {workOrder.assignedToName}
                        </span>
                    )}
                    {workOrder.additionalWorkers?.map(w => (
                        <span key={w.id} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                            <User className="w-3 h-3" /> {w.name}
                        </span>
                    ))}
                </div>
                {pool.disinfectionSystem && pool.disinfectionSystem !== 'tablete' && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
                    <Settings className="w-3 h-3" />
                    Automatika: {pool.disinfectionSystem}
                  </div>
                )}
              </div>
            </div>
            <button onClick={handlePrint} className="bg-amber-500 text-zinc-900 px-4 py-2 rounded-xl flex gap-2 font-bold">
              <Printer className="w-5 h-5" /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Progress */}
        <div className="bg-zinc-800/60 rounded-3xl p-6 border border-amber-500/20">
            <div className="flex justify-between mb-2">
                <h2 className="text-white font-bold">{completedTasks}/{totalTasks} Zadataka</h2>
                <span className="text-amber-400 font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${progress}%` }} />
            </div>
        </div>

        {/* NAPOMENA NALOGODAVCA - UVIJEK VIDLJIVA */}
        {workOrderData.description && (
          <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 rounded-3xl p-6 border-2 border-amber-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-3">
              <div className="bg-amber-500 rounded-full p-2 mt-1">
                <FileText className="w-5 h-5 text-zinc-900" />
              </div>
              <div className="flex-1">
                <h3 className="text-amber-400 font-black text-lg uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Napomena Nalogodavca
                </h3>
                <p className="text-white text-base leading-relaxed whitespace-pre-wrap bg-zinc-900/40 p-4 rounded-xl border border-amber-500/20">
                  {workOrderData.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2">
           {workOrderData.analysisEnabled && (
             <button onClick={() => setActiveTab('analysis')} className={`px-4 py-2 rounded-xl font-bold ${activeTab === 'analysis' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400'}`}>Analiza</button>
           )}
           <button onClick={() => setActiveTab('services')} className={`px-4 py-2 rounded-xl font-bold ${activeTab === 'services' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-gray-400'}`}>Usluge</button>
           {(workOrderData.automationData || (pool?.disinfectionSystem && pool.disinfectionSystem !== 'tablete')) && (
             <button onClick={() => setActiveTab('automation')} className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${activeTab === 'automation' ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-gray-400'}`}>
                <Settings className="w-4 h-4" />
                Automatika
             </button>
           )}
           <button onClick={() => setActiveTab('replacements')} className={`px-4 py-2 rounded-xl font-bold ${activeTab === 'replacements' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400'}`}>Zamjene</button>
           <button onClick={() => setActiveTab('chemicals')} className={`px-4 py-2 rounded-xl font-bold ${activeTab === 'chemicals' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-gray-400'}`}>Kemikalije</button>
           <button onClick={() => setActiveTab('photos')} className={`px-4 py-2 rounded-xl font-bold ${activeTab === 'photos' ? 'bg-teal-600 text-white' : 'bg-zinc-800 text-gray-400'}`}>Fotografije</button>
        </div>

        {/* Content */}
        {activeTab === 'analysis' && workOrderData.analysisEnabled && (
            <div className="bg-zinc-800/60 rounded-3xl p-6 border border-amber-500/20">
                <h2 className="text-white font-bold mb-4">Analiza vode</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-4">
                        <h3 className="text-gray-400 text-sm font-bold uppercase">Osnovni parametri</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">pH Vrijednost</label>
                                <input type="number" step="0.1" placeholder="7.2 - 7.6" value={analysisParams.ph || ''} onChange={e => handleUpdateAnalysisParam('ph', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none" disabled={isLocked} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Slobodni klor (mg/L)</label>
                                <input type="number" step="0.1" placeholder="0.5 - 1.5" value={analysisParams.chlorine || ''} onChange={e => handleUpdateAnalysisParam('chlorine', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none" disabled={isLocked} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-gray-400 text-sm font-bold uppercase">Napredni parametri (opcionalno)</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Alkalnost</label>
                                <input type="number" placeholder="ppm" value={analysisParams.alkalinity || ''} onChange={e => handleUpdateAnalysisParam('alkalinity', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:border-amber-500 focus:outline-none" disabled={isLocked} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Temp. (°C)</label>
                                <input type="number" placeholder="°C" value={analysisParams.temperature || ''} onChange={e => handleUpdateAnalysisParam('temperature', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:border-amber-500 focus:outline-none" disabled={isLocked} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Redox (mV)</label>
                                <input type="number" placeholder="mV" value={analysisParams.redox || ''} onChange={e => handleUpdateAnalysisParam('redox', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:border-amber-500 focus:outline-none" disabled={isLocked} />
                            </div>
                        </div>
                    </div>
                </div>

                {!isLocked && (
                    <button onClick={handleAnalyze} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white p-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 mb-6 flex items-center justify-center gap-2">
                        <Beaker className="w-5 h-5" />
                        Analiziraj i generiraj preporuke
                    </button>
                )}
                
                {analysisResults && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Status Bar */}
                        <div className={`p-4 rounded-xl border ${
                            analysisResults.status === 'ok' ? 'bg-green-500/10 border-green-500/30' : 
                            analysisResults.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' : 
                            'bg-red-500/10 border-red-500/30'
                        }`}>
                            <div className="flex items-center gap-3">
                                {analysisResults.status === 'ok' ? <CheckCircle className="w-6 h-6 text-green-500" /> : <AlertTriangle className={`w-6 h-6 ${analysisResults.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />}
                                <div>
                                    <h3 className={`font-bold ${
                                        analysisResults.status === 'ok' ? 'text-green-400' : 
                                        analysisResults.status === 'warning' ? 'text-yellow-400' : 
                                        'text-red-400'
                                    }`}>{analysisResults.message || (analysisResults.status === 'ok' ? 'Voda je u redu' : 'Potrebne korekcije')}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        {analysisResults.recommendations && analysisResults.recommendations.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <Droplets className="w-5 h-5 text-blue-400" />
                                    Preporuke za tretman
                                </h3>
                                {analysisResults.recommendations.map((rec: any, idx: number) => (
                                    <div key={idx} className="bg-zinc-900/50 border border-zinc-700 p-4 rounded-xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white">{rec.productName}</h4>
                                            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-bold">{rec.dosage}</span>
                                        </div>
                                        <p className="text-sm text-gray-400">{rec.instructions}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Insights */}
                        {analysisResults.insights && analysisResults.insights.length > 0 && (
                            <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl">
                                <h3 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                    Ivero Insights™
                                </h3>
                                <ul className="space-y-2">
                                    {analysisResults.insights.map((insight: string, idx: number) => (
                                        <li key={idx} className="text-sm text-gray-300 flex gap-2">
                                            <span className="text-blue-400">•</span>
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* Cost Estimate */}
                        {analysisResults.treatmentCost && (
                            <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-700 flex justify-between items-center">
                                <span className="text-gray-400">Procijenjeni trošak tretmana:</span>
                                <span className="text-xl font-bold text-white">{formatPrice(analysisResults.treatmentCost.totalEUR)} €</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'services' && (
            <div className="bg-zinc-800/60 rounded-3xl p-6 border border-amber-500/20 space-y-3">
                {Object.entries(workOrderData.services || {}).map(([id, completed]) => (
                    <button key={id} onClick={() => handleToggleService(id)} disabled={isLocked} className={`w-full p-4 rounded-xl flex items-center gap-3 ${completed ? 'bg-amber-500/20 border-amber-500' : 'bg-zinc-900/40 border-zinc-700'} border-2`}>
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${completed ? 'bg-amber-500 border-amber-500' : 'border-zinc-600'}`}>
                            {completed && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-white font-bold">{workOrderData.servicesLabels?.[id] || id}</span>
                            {workOrderData.requestedServices?.includes(id) && (
                                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase mt-1 border border-red-500/30">
                                    Obavezno
                                </span>
                            )}
                        </div>
                    </button>
                ))}

                {/* Billing Items Section */}
                <div className="mt-8 border-t border-zinc-700 pt-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-amber-500" />
                        Obračun i Dodatne Stavke
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                        {manualBillingItems.map((item, index) => (
                            <div key={item.id} className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-700 flex items-center justify-between gap-3">
                                <div className="flex-1">
                                    <div className="font-bold text-white text-sm">{item.description}</div>
                                    <div className="text-xs text-gray-400">
                                        {item.quantity} x {item.price.toFixed(2)} € = {(item.quantity * item.price).toFixed(2)} €
                                    </div>
                                </div>
                                {!isLocked && (
                                    <button 
                                        onClick={() => setBillingItems(billingItems.filter(i => i.id !== item.id))}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        {chemicalsTotal > 0 && (
                            <div className="bg-purple-900/20 p-3 rounded-xl border border-purple-500/30 flex items-center justify-between gap-3">
                                <div className="flex-1">
                                    <div className="font-bold text-white text-sm">Kemikalije (iz taba Kemikalije)</div>
                                    <div className="text-xs text-purple-300/70">
                                        Automatski obračun s popustima
                                    </div>
                                </div>
                                <div className="text-white font-bold">
                                    {chemicalsTotal.toFixed(2)} €
                                </div>
                            </div>
                        )}
                        {manualBillingItems.length === 0 && chemicalsTotal === 0 && (
                            <div className="text-center py-4 text-zinc-500 text-sm italic">
                                Nema dodatnih stavki
                            </div>
                        )}
                    </div>

                    {!isLocked && (
                        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-700 space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Naziv stavke (npr. Montaža, Rad)</label>
                                <input 
                                    type="text" 
                                    id="new-item-desc"
                                    placeholder="Unesite naziv usluge..." 
                                    className="w-full bg-zinc-800 border-zinc-600 rounded-lg p-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Količina</label>
                                    <input 
                                        type="number" 
                                        id="new-item-qty"
                                        placeholder="1" 
                                        defaultValue="1"
                                        className="w-full bg-zinc-800 border-zinc-600 rounded-lg p-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Cijena (€)</label>
                                    <input 
                                        type="number" 
                                        id="new-item-price"
                                        placeholder="0.00" 
                                        className="w-full bg-zinc-800 border-zinc-600 rounded-lg p-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    const descInput = document.getElementById('new-item-desc') as HTMLInputElement;
                                    const qtyInput = document.getElementById('new-item-qty') as HTMLInputElement;
                                    const priceInput = document.getElementById('new-item-price') as HTMLInputElement;
                                    
                                    if (descInput.value && priceInput.value) {
                                        const newItem = {
                                            id: Date.now().toString(),
                                            description: descInput.value,
                                            quantity: parseFloat(qtyInput.value) || 1,
                                            price: parseFloat(priceInput.value) || 0
                                        };
                                        setBillingItems([...billingItems, newItem]);
                                        descInput.value = '';
                                        qtyInput.value = '1';
                                        priceInput.value = '';
                                    }
                                }}
                                className="w-full bg-amber-600 text-white font-bold py-3 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
                            >
                                <Plus className="w-5 h-5" />
                                Dodaj stavku
                            </button>
                        </div>
                    )}
                    
                    {hasBillableItems && (
                        <div className="mt-4 pt-4 border-t border-zinc-700 flex justify-between items-center bg-zinc-900/80 p-4 rounded-xl border border-amber-500/30">
                            <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">UKUPNO</span>
                            <span className="text-2xl font-black text-amber-500">
                                {grandTotal.toFixed(2)} €
                            </span>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'automation' && (
            <div className="bg-zinc-800/60 rounded-3xl p-6 border border-amber-500/20 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* CLIENT AUTOMATION SELECTION */}
                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 rounded-2xl border-2 border-purple-500/30 space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Settings className="w-5 h-5 text-purple-400" />
                        <h3 className="text-white font-black text-lg uppercase tracking-wide">
                            Tip Automatike Klijenta
                        </h3>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Odaberite tip automatike:</label>
                        <select
                            value={clientAutomation}
                            onChange={(e) => {
                                setClientAutomation(e.target.value);
                                saveClientAutomation();
                            }}
                            disabled={isLocked}
                            className="w-full bg-zinc-900 border-2 border-purple-500/50 rounded-xl p-3 text-white font-bold uppercase text-sm outline-none focus:border-purple-400 transition-all"
                        >
                            <option value="none">Nema automatike</option>
                            <option value="chlorine">Chlor automatika</option>
                            <option value="salt">Salt sistem (elektroliza)</option>
                            <option value="uv">UV sistem</option>
                            <option value="ozone">Ozon sistem</option>
                            <option value="bromine">Brom automatika</option>
                            <option value="other">Ostalo</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Napomene o automatici:</label>
                        <textarea
                            value={clientAutomationNotes}
                            onChange={(e) => {
                                setClientAutomationNotes(e.target.value);
                            }}
                            onBlur={saveClientAutomation}
                            disabled={isLocked}
                            placeholder="Proizvođač, model, godina instalacije..."
                            className="w-full bg-zinc-900 border-2 border-purple-500/50 rounded-xl p-3 text-white text-sm outline-none focus:border-purple-400 transition-all min-h-[80px]"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Podaci se automatski spremaju u bazu klijenta</span>
                    </div>
                </div>

                {/* EXISTING AUTOMATION STATUS */}
                <div className="flex items-center justify-between">
                    <h2 className="text-white font-bold text-xl flex items-center gap-2">
                        <Settings className="w-6 h-6 text-cyan-500" />
                        Status Automatike: {workOrderData.automationData?.systemType || pool?.disinfectionSystem || 'Nije definirano'}
                    </h2>
                    {!isLocked && workOrderData.automationData && (
                        <select 
                            value={workOrderData.automationData.operationalStatus}
                            onChange={(e) => {
                                const newData = { ...workOrderData.automationData!, operationalStatus: e.target.value as any };
                                setWorkOrderData({ ...workOrderData, automationData: newData });
                            }}
                            className={`px-3 py-1 rounded-lg font-bold uppercase text-sm border-2 outline-none ${
                                workOrderData.automationData.operationalStatus === 'ok' ? 'bg-green-500/20 text-green-400 border-green-500' :
                                workOrderData.automationData.operationalStatus === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' :
                                workOrderData.automationData.operationalStatus === 'error' ? 'bg-red-500/20 text-red-400 border-red-500' :
                                'bg-zinc-500/20 text-zinc-400 border-zinc-500'
                            }`}
                        >
                            <option value="ok">U REDU</option>
                            <option value="warning">UPOZORENJE</option>
                            <option value="error">GREŠKA</option>
                            <option value="off">ISKLJUČENO</option>
                        </select>
                    )}
                </div>

                {/* If data exists, show form */}
                {workOrderData.automationData ? (
                    <div className="space-y-6">
                        {/* LCD Values */}
                        <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-700">
                            <h3 className="text-cyan-400 font-bold mb-4 uppercase text-sm tracking-wider">Očitane Vrijednosti (LCD)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">pH</label>
                                    <input 
                                        type="number" step="0.1" 
                                        value={workOrderData.automationData.lcdValues.ph || ''}
                                        onChange={e => {
                                            const newData = { ...workOrderData.automationData! };
                                            newData.lcdValues.ph = e.target.value;
                                            setWorkOrderData({ ...workOrderData, automationData: newData });
                                        }}
                                        disabled={isLocked}
                                        className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white focus:border-cyan-500 font-mono text-lg outline-none"
                                        placeholder="7.2"
                                    />
                                </div>
                                {workOrderData.automationData.systemType !== 'peroksid' && (
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Redox (mV)</label>
                                        <input 
                                            type="number" 
                                            value={workOrderData.automationData.lcdValues.redox || ''}
                                            onChange={e => {
                                                const newData = { ...workOrderData.automationData! };
                                                newData.lcdValues.redox = e.target.value;
                                                setWorkOrderData({ ...workOrderData, automationData: newData });
                                            }}
                                            disabled={isLocked}
                                            className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white focus:border-cyan-500 font-mono text-lg outline-none"
                                            placeholder="700"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Temp (°C)</label>
                                    <input 
                                        type="number" step="0.1"
                                        value={workOrderData.automationData.lcdValues.temperature || ''}
                                        onChange={e => {
                                            const newData = { ...workOrderData.automationData! };
                                            newData.lcdValues.temperature = e.target.value;
                                            setWorkOrderData({ ...workOrderData, automationData: newData });
                                        }}
                                        disabled={isLocked}
                                        className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white focus:border-cyan-500 font-mono text-lg outline-none"
                                        placeholder="25.0"
                                    />
                                </div>
                                {workOrderData.automationData.systemType === 'elektroliza' && (
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Sol (g/l)</label>
                                        <input 
                                            type="number" step="0.1"
                                            value={workOrderData.automationData.lcdValues.salt || ''}
                                            onChange={e => {
                                                const newData = { ...workOrderData.automationData! };
                                                newData.lcdValues.salt = e.target.value;
                                                setWorkOrderData({ ...workOrderData, automationData: newData });
                                            }}
                                            disabled={isLocked}
                                            className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white focus:border-cyan-500 font-mono text-lg outline-none"
                                            placeholder="4.0"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Canisters */}
                        <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-700">
                            <h3 className="text-cyan-400 font-bold mb-4 uppercase text-sm tracking-wider">Stanje Kanistera</h3>
                            <div className="space-y-4">
                                {[
                                    { key: 'phMinus', label: 'pH Minus' },
                                    { key: 'liquidChlorine', label: 'Tekući Klor' },
                                    { key: 'flocculant', label: 'Flokulant' }
                                ].map(chem => (
                                    <div key={chem.key} className="flex items-center justify-between">
                                        <span className="text-gray-300 font-medium">{chem.label}</span>
                                        <div className="flex gap-1">
                                            {['empty', 'low', 'ok', 'full'].map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => {
                                                        const newData = { ...workOrderData.automationData! };
                                                        // Initialize canisters if undefined
                                                        if (!newData.canisters) newData.canisters = {};
                                                        (newData.canisters as any)[chem.key] = level;
                                                        setWorkOrderData({ ...workOrderData, automationData: newData });
                                                    }}
                                                    disabled={isLocked}
                                                    className={`px-2 py-1 rounded text-xs uppercase font-bold border transition-all ${
                                                        (workOrderData.automationData!.canisters as any)?.[chem.key] === level
                                                            ? (level === 'empty' ? 'bg-red-500 text-black border-red-500' :
                                                               level === 'low' ? 'bg-yellow-500 text-black border-yellow-500' :
                                                               level === 'ok' ? 'bg-green-500 text-black border-green-500' :
                                                               'bg-blue-500 text-white border-blue-500')
                                                            : 'bg-zinc-800 text-gray-500 border-zinc-700 hover:border-zinc-500'
                                                    }`}
                                                >
                                                    {level === 'empty' ? 'Prazno' : 
                                                     level === 'low' ? 'Nisko' : 
                                                     level === 'ok' ? 'OK' : 'Puno'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Napomene o automatici (greške, upozorenja...)</label>
                            <textarea
                                value={workOrderData.automationData.notes || ''}
                                onChange={e => {
                                    const newData = { ...workOrderData.automationData! };
                                    newData.notes = e.target.value;
                                    setWorkOrderData({ ...workOrderData, automationData: newData });
                                }}
                                disabled={isLocked}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-white focus:border-cyan-500 min-h-[100px] outline-none"
                                placeholder="Upišite detalje o greškama ili potrebnim servisima..."
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <button 
                            onClick={() => {
                                setWorkOrderData({
                                    ...workOrderData,
                                    automationData: {
                                        systemType: pool?.disinfectionSystem || 'ostalo',
                                        operationalStatus: 'ok',
                                        lcdValues: {},
                                        canisters: {}
                                    }
                                });
                            }}
                            className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20"
                        >
                            Aktiviraj unos podataka za automatiku
                        </button>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'replacements' && (
            <div className="bg-zinc-800/60 rounded-3xl p-6 border border-amber-500/20 space-y-4">
                {!isLocked && <button onClick={handleAddReplacement} className="bg-red-600 text-white px-4 py-2 rounded-xl flex gap-2 font-bold mb-4"><Plus className="w-5 h-5"/> Dodaj</button>}
                {workOrderData.replacements.map((item, idx) => (
                    <div key={item.id} className="bg-zinc-900/40 border border-zinc-700 rounded-xl p-4 flex gap-3">
                        <div className="flex-1 space-y-2">
                             <select 
                                value={item.part} 
                                onChange={e => handleUpdateReplacement(item.id, 'part', e.target.value)} 
                                disabled={isLocked} 
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:border-amber-500 focus:outline-none"
                             >
                                <option value="">Odaberi dio...</option>
                                {warehouseItems
                                    .filter(i => i.category !== 'chemical')
                                    .map(i => (
                                    <option key={i.id} value={i.name}>
                                        {i.name} ({i.quantity} {i.unit})
                                    </option>
                                ))}
                                {item.part && !warehouseItems.some(i => i.name === item.part) && (
                                    <option value={item.part}>{item.part} (Van sustava)</option>
                                )}
                             </select>
                             <input type="number" value={item.quantity} onChange={e => handleUpdateReplacement(item.id, 'quantity', parseInt(e.target.value))} disabled={isLocked} className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white" placeholder="Količina" />
                        </div>
                        {!isLocked && <button onClick={() => handleRemoveReplacement(item.id)} className="text-red-400"><X className="w-6 h-6" /></button>}
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'chemicals' && (
            <div className="bg-zinc-800/60 rounded-3xl p-6 border border-amber-500/20 space-y-4">
                {!isLocked && (
                    <div className="flex gap-2 mb-4">
                        <button onClick={() => setUsedChemicals([...usedChemicals, {id: Date.now().toString(), name: '', quantity: '', unit: 'kg'}])} className="bg-purple-600 text-white px-4 py-2 rounded-xl flex gap-2 font-bold"><Plus className="w-5 h-5"/> Dodaj</button>
                    </div>
                )}
                {usedChemicals.map((chem, idx) => (
                    <div key={chem.id} className="bg-zinc-900/40 border border-zinc-700 rounded-xl p-4 flex gap-3 items-center">
                        <Box className="w-8 h-8 text-purple-500" />
                        <div className="flex-1 space-y-2">
                             <select 
                                value={chem.name} 
                                onChange={e => handleChemicalNameChange(chem.id, e.target.value)} 
                                disabled={isLocked} 
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white focus:border-amber-500 focus:outline-none"
                             >
                                <option value="">Odaberi kemikaliju...</option>
                                {warehouseItems
                                    .filter(i => i.category === 'chemical')
                                    .map(i => (
                                    <option key={i.id} value={i.name}>
                                        {i.name} ({i.quantity} {i.unit})
                                    </option>
                                ))}
                                {chem.name && !warehouseItems.some(i => i.name === chem.name) && (
                                    <option value={chem.name}>{chem.name} (Van sustava)</option>
                                )}
                             </select>
                             <div className="flex gap-2">
                                <div className="flex-1">
                                    <input type="text" value={chem.quantity} onChange={e => {
                                        const updated = usedChemicals.map(c => c.id === chem.id ? { ...c, quantity: e.target.value } : c);
                                        setUsedChemicals(updated);
                                    }} disabled={isLocked} className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white" placeholder="Kol." />
                                </div>
                                <div className="w-[100px]">
                                    <input type="number" step="0.01" value={chem.price || ''} onChange={e => {
                                        const updated = usedChemicals.map(c => c.id === chem.id ? { ...c, price: e.target.value } : c);
                                        setUsedChemicals(updated);
                                    }} disabled={isLocked} className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white" placeholder="Cijena (€)" />
                                </div>
                                <div className="w-[80px]">
                                    <input type="number" step="1" min="0" max="100" value={chem.discount || ''} onChange={e => {
                                        const updated = usedChemicals.map(c => c.id === chem.id ? { ...c, discount: e.target.value } : c);
                                        setUsedChemicals(updated);
                                    }} disabled={isLocked} className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-white" placeholder="Rabat %" />
                                </div>
                                <span className="text-gray-400 self-center min-w-[30px]">{chem.unit}</span>
                             </div>
                        </div>
                        {!isLocked && <button onClick={() => setUsedChemicals(usedChemicals.filter(c => c.id !== chem.id))} className="text-red-400"><X className="w-6 h-6" /></button>}
                    </div>
                ))}
            </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
            <div className="bg-zinc-800/60 rounded-3xl p-6 border border-amber-500/20 space-y-4">
                 {!isLocked && (
                    <label className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-teal-500 transition-colors cursor-pointer group block bg-zinc-900/40">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-500/20 transition-colors">
                            <Camera className="w-8 h-8 text-zinc-400 group-hover:text-teal-500 transition-colors" />
                        </div>
                        <p className="text-zinc-300 font-bold mb-1">Dodaj fotografiju</p>
                        <p className="text-zinc-500 text-sm">Kliknite za odabir slike</p>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        const newPhoto: any = {
                                            id: Date.now().toString(),
                                            category: 'pool',
                                            dataUrl: reader.result as string,
                                            timestamp: new Date().toISOString()
                                        };
                                        setWorkPhotos([...workPhotos, newPhoto]);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </label>
                 )}

                 <div className="grid grid-cols-2 gap-4">
                     {workPhotos.map(photo => (
                         <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-zinc-700 shadow-xl">
                             <img src={photo.dataUrl} className="w-full h-48 object-cover" />
                             {!isLocked && (
                                 <button onClick={() => setWorkPhotos(workPhotos.filter(p => p.id !== photo.id))} className="absolute top-2 right-2 bg-red-600/90 text-white p-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg z-10">
                                     <X className="w-4 h-4" />
                                 </button>
                             )}
                             <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 backdrop-blur-md">
                                <select 
                                    value={photo.category}
                                    onChange={(e) => {
                                        const updated = workPhotos.map(p => p.id === photo.id ? { ...p, category: e.target.value as any } : p);
                                        setWorkPhotos(updated);
                                    }}
                                    disabled={isLocked}
                                    className="bg-transparent text-white text-xs w-full focus:outline-none font-bold uppercase tracking-wider"
                                >
                                    <option value="pool">Bazen</option>
                                    <option value="machine-room">Strojarnica</option>
                                    <option value="elements">Elementi</option>
                                </select>
                             </div>
                         </div>
                     ))}
                 </div>
                 
                 {workPhotos.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                        <Camera className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Nema dodanih fotografija</p>
                    </div>
                 )}
            </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-900/90 border-t border-amber-500/20 backdrop-blur-md z-[100]">
         <div className="max-w-4xl mx-auto">
             {/* Status Info for Employee if Completed */}
             {workOrder.status === 'completed' && userRole === 'employee' && (
                 <div className="w-full text-center text-green-500 text-sm font-bold mb-2">
                     Nalog je završen i poslan nalogodavcu.
                 </div>
             )}
             
             <div className="flex gap-4">
                 {/* Employee/Employer - In Progress */}
                 {!isLocked && (
                   <>
                     <button onClick={handleSaveProgress} className="flex-1 bg-zinc-700 text-white py-4 rounded-xl font-bold">Spremi</button>
                     <button onClick={handleComplete} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold">Završi i pošalji</button>
                   </>
                 )}

                 {/* Employer - Completed */}
                 {workOrder.status === 'completed' && userRole !== 'employee' && (
                   <>
                      <button onClick={() => navigate('/app')} className="flex-1 bg-zinc-700 text-white py-4 rounded-xl font-bold">Natrag</button>
                      <button onClick={handleInvoice} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold">Fakturiraj</button>
                   </>
                 )}

                 {/* Employee - Completed */}
                 {workOrder.status === 'completed' && userRole === 'employee' && (
                    <button onClick={() => navigate('/app')} className="w-full bg-zinc-700 text-white py-4 rounded-xl font-bold">Zatvori</button>
                 )}

                 {/* Invoiced - Close */}
                 {workOrder.status === 'invoiced' && (
                    <button onClick={() => navigate('/app')} className="w-full bg-zinc-700 text-white py-4 rounded-xl font-bold">Zatvori (Fakturirano)</button>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
}

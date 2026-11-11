import { motion, AnimatePresence } from 'motion/react';
import { T } from '../lib/theme';
import { authService } from '../lib/auth';
import { printWorkOrder } from '../lib/workOrderPdf';
import { buildHub3, hub3BarcodeDataUrl, referenceFromOrder } from '../lib/hub3';
import { loadCompanySettings } from '../lib/companySettings';
import { api } from '../lib/supabase';
import { isLiveMode } from '../lib/session';
import { useEffect, useRef, useState } from 'react';
import {
  X, Save, Printer, Camera, Wrench, Beaker, Droplets, Settings,
  CheckCircle, Plus, Trash2, DollarSign, FileText,
  AlertTriangle, Package, Images, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';

interface WorkOrderDetailsModalProps {
  order: {
    id: number | string;
    client: string;
    location: string;
    task: string;
    status: 'active' | 'pending' | 'completed';
    assignee?: string;
    assigneeId?: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    notes?: string;
    disinfectionSystem?: 'klor' | 'so' | 'uv' | 'ozon' | '';
    maintenanceTasks?: MaintenanceTask[];
    services?: Service[];
    productsUsed?: ProductUsed[];
    totalCost?: number;
    photos?: Photo[];
    waterAnalysis?: WaterAnalysis;
    automationData?: AutomationData;
  };
  onClose: () => void;
  onSave: (updatedOrder: any) => void;
  clients?: { id: string; name: string; location: string }[];
  employees?: { id: number | string; name: string }[];
  hidePrices?: boolean;
  readOnlyAssignee?: boolean;
  warehouseProducts?: { id: number | string; name: string; unit: string }[];
}

interface MaintenanceTask {
  id: number;
  name: string;
  completed: boolean;
  cost: number;
}

interface Service {
  id: number;
  name: string;
  description: string;
  cost: number;
  completed?: boolean;
}

interface ProductUsed {
  id: number;
  warehouseItemId?: number | string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalCost: number;
  discount?: number;
}

interface Photo {
  id: string;
  category: 'machine-room' | 'equipment' | 'pool' | 'water' | 'other' | 'elements';
  path?: string;
  dataUrl?: string;
  note?: string;
  timestamp: string;
  uploadedBy?: string;
}

interface WaterAnalysis {
  pH?: number;
  chlorine?: number;
  alkalinity?: number;
  temperature?: number;
  redox?: number;
  date?: string;
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

type PhotoCategory = Exclude<Photo['category'], 'elements'>;

const PHOTO_CATEGORIES: { id: PhotoCategory; label: string }[] = [
  { id: 'machine-room', label: 'Strojarnica' },
  { id: 'equipment', label: 'Oprema' },
  { id: 'pool', label: 'Bazen' },
  { id: 'water', label: 'Voda' },
  { id: 'other', label: 'Ostalo' },
];

const normalizePhotoCategory = (category: Photo['category']): PhotoCategory =>
  category === 'elements' ? 'equipment' : category;

const photoCategoryLabel = (category: Photo['category']): string =>
  PHOTO_CATEGORIES.find(item => item.id === normalizePhotoCategory(category))?.label || 'Ostalo';

const blobToDataUrl = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

async function compressPhoto(file: File): Promise<Blob> {
  let source: CanvasImageSource | null = null;
  let width = 0;
  let height = 0;
  let cleanup = () => {};

  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' } as any);
      source = bitmap;
      width = bitmap.width;
      height = bitmap.height;
      cleanup = () => bitmap.close();
    } catch {
      try {
        const bitmap = await createImageBitmap(file);
        source = bitmap;
        width = bitmap.width;
        height = bitmap.height;
        cleanup = () => bitmap.close();
      } catch {
        // Fall back to an HTML image below (notably useful for some iOS formats).
      }
    }
  }

  if (!source) {
    const objectUrl = URL.createObjectURL(file);
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('image-load-failed'));
      img.src = objectUrl;
    });
    source = image;
    width = image.naturalWidth;
    height = image.naturalHeight;
    cleanup = () => URL.revokeObjectURL(objectUrl);
  }

  const scale = Math.min(1, 1600 / Math.max(width, height));
  const outputWidth = Math.max(1, Math.round(width * scale));
  const outputHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    cleanup();
    throw new Error('canvas-unavailable');
  }
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, outputWidth, outputHeight);
  context.drawImage(source, 0, 0, outputWidth, outputHeight);
  cleanup();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('compression-failed')),
      'image/jpeg',
      0.8,
    );
  });
}

export function WorkOrderDetailsModal({
  order, onClose, onSave, clients, employees,
  hidePrices = false, readOnlyAssignee = false,
  warehouseProducts
}: WorkOrderDetailsModalProps) {
  const defaultTab = hidePrices ? 'services' : 'services';
  const [activeTab, setActiveTab] = useState<'services' | 'tasks' | 'products' | 'water' | 'automation' | 'photos' | 'invoice'>(defaultTab);
  const [editedOrder, setEditedOrder] = useState(order);
  const [photos, setPhotos] = useState<Photo[]>(order.photos || []);
  const [photoMode, setPhotoMode] = useState<'checking' | 'demo' | 'live'>('checking');
  const [photoCategory, setPhotoCategory] = useState<Exclude<Photo['category'], 'elements'>>('machine-room');
  const [photoFilter, setPhotoFilter] = useState<'all' | Exclude<Photo['category'], 'elements'>>('all');
  const [photoError, setPhotoError] = useState('');
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  const [photoUploadStates, setPhotoUploadStates] = useState<Record<string, 'uploading' | 'failed' | 'done'>>({});
  const [photoUploadErrors, setPhotoUploadErrors] = useState<Record<string, 'offline' | 'upload'>>({});
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);
  const [viewerPhotoId, setViewerPhotoId] = useState<string | null>(null);
  const uploadBlobsRef = useRef<Map<string, Blob>>(new Map());
  const signedUrlRetryRef = useRef<Set<string>>(new Set());
  const previewUrlsRef = useRef<Set<string>>(new Set());
  const touchStartXRef = useRef<number | null>(null);
  const [saveError, setSaveError] = useState('');

  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(order.maintenanceTasks || [
    { id: 1, name: 'Čišćenje filtera', completed: false, cost: 150 },
    { id: 2, name: 'Provjera pumpi', completed: false, cost: 100 },
    { id: 3, name: 'Čišćenje skimera', completed: false, cost: 80 },
  ]);

  const [services, setServices] = useState<Service[]>(order.services || [
    { id: 1, name: 'Generalno čišćenje', description: 'Kompletno čišćenje bazena', cost: 350, completed: false },
    { id: 2, name: 'Kemijsko balansiranje', description: 'Podešavanje pH i klora', cost: 180, completed: false },
  ]);

  const [productsUsed, setProductsUsed] = useState<ProductUsed[]>(order.productsUsed || []);

  const [waterAnalysis, setWaterAnalysis] = useState<WaterAnalysis>(order.waterAnalysis || {
    pH: 7.2,
    chlorine: 1.5,
    alkalinity: 120,
    temperature: 24,
    redox: 750,
    date: new Date().toISOString().split('T')[0]
  });

  const [automationData, setAutomationData] = useState<AutomationData>(order.automationData || {
    systemType: order.disinfectionSystem || 'klor',
    operationalStatus: 'ok',
    lcdValues: { ph: '7.2', redox: '750', chlorine: '1.5', salt: '', temperature: '24' },
    canisters: { phMinus: 'ok', liquidChlorine: 'ok', flocculant: 'ok' },
    notes: ''
  });

  // Inline add-service form state
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [addServiceError, setAddServiceError] = useState('');

  // Inline add-maintenance-task form state
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPrice, setNewTaskPrice] = useState('');
  const [addTaskError, setAddTaskError] = useState('');

  // Inline add-product form state
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProductWarehouseId, setNewProductWarehouseId] = useState<string>('');
  const [newProductQty, setNewProductQty] = useState<string>('');
  const [newProductPrice, setNewProductPrice] = useState<string>('');
  const [newProductDiscount, setNewProductDiscount] = useState<string>('0');
  const [addProductError, setAddProductError] = useState('');

  useEffect(() => {
    let active = true;
    isLiveMode().then(live => {
      if (active) setPhotoMode(live ? 'live' : 'demo');
    }).catch(() => {
      if (active) setPhotoMode('demo');
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (photoMode !== 'live') return;
    photos.forEach(photo => {
      if (photo.path && !photoUrls[photo.id]) {
        void loadSignedPhotoUrl(photo);
      }
    });
  }, [photoMode, photos, photoUrls]);

  useEffect(() => () => {
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    const retryFailedPhotos = () => {
      if (photoMode !== 'live') return;
      photos
        .filter(photo => photoUploadStates[photo.id] === 'failed')
        .forEach(photo => void uploadPhoto(photo));
    };
    window.addEventListener('online', retryFailedPhotos);
    return () => window.removeEventListener('online', retryFailedPhotos);
  }, [photoMode, photos, photoUploadStates]);

  useEffect(() => {
    const hasFailedPhotos = Object.values(photoUploadStates).some(state => state === 'failed');
    if (!hasFailedPhotos && saveError === 'Neke fotografije nisu poslane. Pokušajte ponovno ili ih obrišite.') {
      setSaveError('');
    }
  }, [photoUploadStates, saveError]);

  const parsePrice = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const normalized = trimmed.replace(',', '.');
    if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  };

  const resetServiceForm = () => {
    setShowAddServiceForm(false);
    setNewServiceName('');
    setNewServiceDescription('');
    setNewServicePrice('');
    setAddServiceError('');
  };

  const submitService = (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = newServiceName.trim();
    if (!name) {
      setAddServiceError('Upišite naziv.');
      return;
    }
    const cost = hidePrices ? 0 : parsePrice(newServicePrice);
    if (cost === null) {
      setAddServiceError('Cijena mora biti broj 0 ili veći.');
      return;
    }
    setServices([...services, {
      id: Date.now(),
      name,
      description: newServiceDescription.trim(),
      cost,
      completed: false,
    }]);
    resetServiceForm();
  };

  const resetTaskForm = () => {
    setShowAddTaskForm(false);
    setNewTaskName('');
    setNewTaskPrice('');
    setAddTaskError('');
  };

  const submitMaintenanceTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = newTaskName.trim();
    if (!name) {
      setAddTaskError('Upišite naziv.');
      return;
    }
    const cost = hidePrices ? 0 : parsePrice(newTaskPrice);
    if (cost === null) {
      setAddTaskError('Cijena mora biti broj 0 ili veći.');
      return;
    }
    setMaintenanceTasks([...maintenanceTasks, { id: Date.now(), name, completed: false, cost }]);
    resetTaskForm();
  };

  const toggleTask = (id: number) => {
    setMaintenanceTasks(maintenanceTasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleService = (id: number) => {
    setServices(services.map(service =>
      service.id === id ? { ...service, completed: !service.completed } : service
    ));
  };

  const submitProduct = () => {
    if (!newProductWarehouseId || !newProductQty || parseFloat(newProductQty) <= 0) {
      setAddProductError('Odaberite proizvod i upišite količinu.');
      return;
    }
    const wp = warehouseProducts?.find(p => String(p.id) === newProductWarehouseId);
    if (!wp) { setAddProductError('Odaberite proizvod i upišite količinu.'); return; }
    const quantity = parseFloat(newProductQty);
    const pricePerUnit = hidePrices ? 0 : parseFloat(newProductPrice || '0');
    const discount = hidePrices ? 0 : parseFloat(newProductDiscount || '0');
    const totalCost = quantity * pricePerUnit * (1 - discount / 100);
    setProductsUsed([...productsUsed, {
      id: Date.now(),
      warehouseItemId: wp.id,
      productName: wp.name,
      quantity,
      unit: wp.unit,
      pricePerUnit,
      discount,
      totalCost,
    }]);
    setShowAddProductForm(false);
    setNewProductWarehouseId('');
    setNewProductQty('');
    setNewProductPrice('');
    setNewProductDiscount('0');
    setAddProductError('');
  };

  const deleteProduct = (id: number) => {
    setProductsUsed(productsUsed.filter(p => p.id !== id));
  };

  async function loadSignedPhotoUrl(photo: Photo, force = false): Promise<string | null> {
    if (!photo.path || photoMode !== 'live') return photo.dataUrl || null;
    if (!force && photoUrls[photo.id]) return photoUrls[photo.id];
    try {
      const response: any = await api.getImageUrl(photo.path);
      const url = response?.url ?? response?.signedUrl ?? response;
      if (typeof url === 'string') {
        setPhotoUrls(previous => ({ ...previous, [photo.id]: url }));
        return url;
      }
    } catch {
      // The tile keeps its current state; image onError performs the one allowed refetch.
    }
    return null;
  }

  const uploadPhoto = async (photo: Photo, blob?: Blob, previewUrl?: string) => {
    const uploadBlob = blob || uploadBlobsRef.current.get(photo.id);
    if (!uploadBlob || photoMode !== 'live') return;
    if (!navigator.onLine) {
      setPhotoUploadStates(previous => ({ ...previous, [photo.id]: 'failed' }));
      setPhotoUploadErrors(previous => ({ ...previous, [photo.id]: 'offline' }));
      return;
    }
    setPhotoUploadStates(previous => ({ ...previous, [photo.id]: 'uploading' }));
    setPhotoUploadErrors(previous => {
      const next = { ...previous };
      delete next[photo.id];
      return next;
    });
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 10);
    const path = `work-orders/${editedOrder.id}/${timestamp}-${random}.jpg`;
    try {
      const file = new File([uploadBlob], `${timestamp}-${random}.jpg`, { type: 'image/jpeg' });
      const response: any = await api.uploadImage(file, path);
      const storedPath = typeof response?.path === 'string' ? response.path : path;
      const signedUrl = await loadSignedPhotoUrl({ ...photo, path: storedPath }, true);
      setPhotos(previous => previous.map(item =>
        item.id === photo.id ? { ...item, path: storedPath } : item
      ));
      setPhotoUploadStates(previous => ({ ...previous, [photo.id]: 'done' }));
      setPhotoUploadErrors(previous => {
        const next = { ...previous };
        delete next[photo.id];
        return next;
      });
      uploadBlobsRef.current.delete(photo.id);
      const preview = previewUrl || photoPreviews[photo.id];
      if (preview && signedUrl) {
        URL.revokeObjectURL(preview);
        previewUrlsRef.current.delete(preview);
        setPhotoPreviews(previous => {
          const next = { ...previous };
          delete next[photo.id];
          return next;
        });
      }
    } catch {
      setPhotoUploadStates(previous => ({ ...previous, [photo.id]: 'failed' }));
      setPhotoUploadErrors(previous => ({
        ...previous,
        [photo.id]: navigator.onLine ? 'upload' : 'offline',
      }));
    }
  };

  const addPhotoFiles = async (fileList: FileList | null) => {
    if (!fileList || photoMode === 'checking') return;
    setPhotoError('');
    const availableSlots = 40 - photos.length;
    if (availableSlots <= 0) return;
    const files = Array.from(fileList).slice(0, availableSlots);

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setPhotoError('Odaberite slikovnu datoteku.');
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        setPhotoError('Fotografija ne smije biti veća od 15 MB.');
        continue;
      }

      try {
        const compressed = await compressPhoto(file);
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const photo: Photo = {
          id,
          category: photoCategory,
          note: '',
          timestamp: new Date().toISOString(),
          uploadedBy: authService.getCurrentUser()?.name || editedOrder.assignee || 'Korisnik',
        };

        if (photoMode === 'demo') {
          const dataUrl = await blobToDataUrl(compressed);
          setPhotos(previous => [...previous, { ...photo, dataUrl }].slice(0, 40));
          setPhotoUploadStates(previous => ({ ...previous, [id]: 'done' }));
        } else {
          const preview = URL.createObjectURL(compressed);
          previewUrlsRef.current.add(preview);
          uploadBlobsRef.current.set(id, compressed);
          setPhotoPreviews(previous => ({ ...previous, [id]: preview }));
          setPhotos(previous => [...previous, photo].slice(0, 40));
          if (navigator.onLine) {
            void uploadPhoto(photo, compressed, preview);
          } else {
            setPhotoUploadStates(previous => ({ ...previous, [id]: 'failed' }));
            setPhotoUploadErrors(previous => ({ ...previous, [id]: 'offline' }));
          }
        }
      } catch {
        setPhotoError('Fotografiju nije moguće obraditi. Pokušajte s drugom datotekom.');
      }
    }

    if (fileList.length > availableSlots) {
      setPhotoError('Najviše 40 fotografija po nalogu.');
    }
  };

  const requestDeletePhoto = (id: string) => {
    setDeletePhotoId(id);
  };

  const deletePhoto = (id: string) => {
    const preview = photoPreviews[id];
    if (preview) {
      URL.revokeObjectURL(preview);
      previewUrlsRef.current.delete(preview);
    }
    uploadBlobsRef.current.delete(id);
    setPhotos(previous => previous.filter(photo => photo.id !== id));
    setPhotoUrls(previous => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    setPhotoPreviews(previous => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    setPhotoUploadStates(previous => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    setPhotoUploadErrors(previous => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    if (viewerPhotoId === id) setViewerPhotoId(null);
    setDeletePhotoId(null);
  };

  const updatePhotoNote = (id: string, note: string) => {
    setPhotos(previous => previous.map(photo => photo.id === id ? { ...photo, note } : photo));
  };

  const handlePhotoImageError = (photo: Photo) => {
    if (!photo.path || signedUrlRetryRef.current.has(photo.id)) return;
    signedUrlRetryRef.current.add(photo.id);
    void loadSignedPhotoUrl(photo, true);
  };

  const calculateTotals = () => {
    const tasksTotal = maintenanceTasks.filter(t => t.completed).reduce((sum, t) => sum + (t.cost ?? 0), 0);
    const servicesTotal = services.filter(s => s.completed).reduce((sum, s) => sum + (s.cost ?? 0), 0);
    const productsTotal = productsUsed.reduce((sum, p) => sum + (p.totalCost ?? 0), 0);
    const grandTotal = tasksTotal + servicesTotal + productsTotal;
    return { tasksTotal, servicesTotal, productsTotal, grandTotal };
  };

  const totals = calculateTotals();

  const handleSave = () => {
    if (Object.values(photoUploadStates).some(state => state === 'uploading')) return;
    if (Object.values(photoUploadStates).some(state => state === 'failed')) {
      setActiveTab('photos');
      setSaveError('Neke fotografije nisu poslane. Pokušajte ponovno ili ih obrišite.');
      return;
    }
    if (!editedOrder.client) {
      setSaveError('Odaberite klijenta prije spremanja.');
      return;
    }
    setSaveError('');
    const updatedOrder = {
      ...editedOrder,
      maintenanceTasks,
      services,
      productsUsed,
      waterAnalysis,
      automationData,
      photos,
      totalCost: totals.grandTotal,
      status: (maintenanceTasks.every(t => t.completed) && services.every(s => s.completed)) ? 'completed' as const : editedOrder.status
    };
    onSave(updatedOrder);
    onClose();
  };

  const handlePrint = async () => {
    const companyName = authService.getCurrentUser()?.companyName;
    const printablePhotos = await Promise.all(photos.map(async photo => {
      if (!photo.path) return photo;
      const signedUrl = photoUrls[photo.id] || await loadSignedPhotoUrl(photo);
      return signedUrl ? { ...photo, dataUrl: signedUrl } : photo;
    }));
    void printWorkOrder({
      order: editedOrder,
      companyName,
      services,
      maintenanceTasks,
      productsUsed,
      waterAnalysis,
      automationData,
      photos: printablePhotos,
      hidePrices,
    });
  };

  // Ponuda za plaćanje: podaci tvrtke iz Postavki, model HR00, poziv na broj iz broja naloga, HUB3 2D kod
  const [offerError, setOfferError] = useState('');
  const handlePrintOffer = async () => {
    setOfferError('');
    const cs = await loadCompanySettings().catch(() => null);
    if (!cs?.iban) {
      setOfferError('Za ponudu upišite naziv tvrtke i IBAN: Više → Postavke tvrtke.');
      return;
    }
    const companyName = cs.companyName || authService.getCurrentUser()?.companyName || '';
    const reference = referenceFromOrder(order.id);
    const description = `Ponuda ${order.id}`;
    const hub3 = buildHub3({
      amountEUR: totals.grandTotal,
      payerName: editedOrder.client || '',
      payerAddress: editedOrder.location || '',
      recipientName: companyName,
      recipientAddress: cs.address || '',
      recipientCity: cs.city || '',
      iban: cs.iban,
      model: 'HR00',
      reference,
      description,
    });
    const barcodeDataUrl = totals.grandTotal > 0 ? await hub3BarcodeDataUrl(hub3) : null;
    void printWorkOrder({
      order: editedOrder,
      companyName,
      services,
      maintenanceTasks,
      productsUsed,
      waterAnalysis,
      automationData,
      photos: [],
      hidePrices: false,
      payment: {
        companyName, oib: cs.oib, address: cs.address, city: cs.city, email: cs.email, phone: cs.phone,
        iban: cs.iban, model: 'HR00', reference, description, barcodeDataUrl,
      },
    });
  };

  const getCanisterColor = (status?: 'empty' | 'low' | 'ok' | 'full') => {
    switch (status) {
      case 'full': return '#2EFF88';
      case 'ok': return '#FFD700';
      case 'low': return '#FFB020';
      case 'empty': return '#FF3B30';
      default: return '#666';
    }
  };

  const getStatusColor = (status: 'ok' | 'warning' | 'error' | 'off') => {
    switch (status) {
      case 'ok': return '#2EFF88';
      case 'warning': return '#FFB020';
      case 'error': return '#FF3B30';
      case 'off': return '#666';
    }
  };

  const totalTasksAndServices = maintenanceTasks.length + services.length;
  const completedTasksAndServices = maintenanceTasks.filter(t => t.completed).length + services.filter(s => s.completed).length;
  const progress = totalTasksAndServices > 0 ? (completedTasksAndServices / totalTasksAndServices) * 100 : 0;
  const isUploadingPhotos = Object.values(photoUploadStates).some(state => state === 'uploading');
  const hasFailedPhotos = Object.values(photoUploadStates).some(state => state === 'failed');
  const filteredPhotos = photos.filter(photo =>
    photoFilter === 'all' || normalizePhotoCategory(photo.category) === photoFilter
  );
  const viewerIndex = viewerPhotoId ? filteredPhotos.findIndex(photo => photo.id === viewerPhotoId) : -1;

  const photoSource = (photo: Photo) =>
    photoPreviews[photo.id] || photoUrls[photo.id] || photo.dataUrl || '';

  const showPreviousPhoto = () => {
    if (filteredPhotos.length < 2 || viewerIndex < 0) return;
    const nextIndex = (viewerIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setViewerPhotoId(filteredPhotos[nextIndex].id);
  };

  const showNextPhoto = () => {
    if (filteredPhotos.length < 2 || viewerIndex < 0) return;
    const nextIndex = (viewerIndex + 1) % filteredPhotos.length;
    setViewerPhotoId(filteredPhotos[nextIndex].id);
  };

  // Assignee ID resolution
  const assigneeSelectedId = editedOrder.assigneeId
    || (employees?.find(e => e.name === editedOrder.assignee)?.id?.toString() ?? '');

  // Selected warehouse product for inline form
  const selectedWP = warehouseProducts?.find(p => String(p.id) === newProductWarehouseId);

  const tabs = [
    { id: 'services', icon: Wrench, label: 'Usluge' },
    { id: 'tasks', icon: CheckCircle, label: 'Zadaci' },
    { id: 'products', icon: Beaker, label: 'Kemija' },
    { id: 'water', icon: Droplets, label: 'Analiza' },
    { id: 'automation', icon: Settings, label: 'Automatika' },
    { id: 'photos', icon: Camera, label: `Fotografije (${photos.length})` },
    ...(!hidePrices ? [{ id: 'invoice', icon: DollarSign, label: 'Račun' }] : []),
  ] as { id: string; icon: any; label: string }[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain sm:overflow-hidden rounded-3xl"
        style={{
          background: 'rgba(4,24,32,0.96)',
          border: '1px solid rgba(120,220,255,0.12)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
        }}
      >
        {/* Header */}
        <div className="p-4 sm:p-6" style={{ borderBottom: '1px solid rgba(120,220,255,0.12)' }}>
          <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 break-words">Radni Nalog #{order.id}</h2>
              <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {editedOrder.client} • {editedOrder.location} • {editedOrder.assignee}
              </p>

              {(clients || employees) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {clients && (
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Klijent</label>
                      <select
                        value={editedOrder.client}
                        onChange={(e) => {
                          const selected = clients.find(c => c.name === e.target.value);
                          setEditedOrder({
                            ...editedOrder,
                            client: e.target.value,
                            location: selected ? selected.location : editedOrder.location,
                          });
                          if (saveError) setSaveError('');
                        }}
                        className="w-full px-3 py-2 rounded-xl text-sm"
                        style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                      >
                        <option value="" style={{ background: '#1A1E26' }}>Odaberite klijenta</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.name} style={{ background: '#1A1E26' }}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Lokacija</label>
                    <input
                      type="text"
                      value={editedOrder.location}
                      onChange={(e) => setEditedOrder({ ...editedOrder, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                      placeholder="Lokacija"
                    />
                  </div>

                  {employees && (
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Izvršitelj</label>
                      {readOnlyAssignee ? (
                        <div className="px-3 py-2 rounded-xl text-sm" style={{
                          background: 'rgba(2,13,18,0.6)',
                          border: '1px solid rgba(120,220,255,0.18)',
                          color: 'rgba(255,255,255,0.8)'
                        }}>
                          {editedOrder.assignee || '—'}
                        </div>
                      ) : (
                        <select
                          value={assigneeSelectedId}
                          onChange={(e) => {
                            const emp = employees.find(x => String(x.id) === e.target.value);
                            setEditedOrder({
                              ...editedOrder,
                              assigneeId: e.target.value,
                              assignee: emp?.name ?? e.target.value
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl text-sm"
                          style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                        >
                          <option value="" style={{ background: '#041820' }}>Odaberite izvršitelja</option>
                          {employees.map(emp => (
                            <option key={emp.id} value={String(emp.id)} style={{ background: '#1A1E26' }}>{emp.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
              <div className="sm:text-right mr-auto sm:mr-4">
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Napredak</div>
                <div className="text-xl font-bold" style={{ color: '#5CE1E6' }}>{Math.round(progress)}%</div>
              </div>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
                style={{ background: T.accent, color: '#000000' }}
              >
                <Printer className="w-4 h-4" />
                <span>PDF</span>
              </button>

              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={handleSave}
                  disabled={isUploadingPhotos}
                  className="px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
                  style={{ background: T.accent, color: '#000000', opacity: isUploadingPhotos ? 0.65 : 1 }}
                >
                  {isUploadingPhotos ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isUploadingPhotos ? 'Šaljem fotografije…' : 'Spremi'}</span>
                </button>
                {saveError && (
                  <span className="text-xs" style={{ color: '#FF3B30' }}>{saveError}</span>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3" style={{ background: 'rgba(2,13,18,0.5)' }}>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              {completedTasksAndServices} / {totalTasksAndServices} Zadataka
            </span>
            {!hidePrices && (
              <span className="font-bold" style={{ color: '#5CE1E6' }}>
                {totals.grandTotal.toFixed(2)} EUR
              </span>
            )}
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full"
              style={{ background: T.accent }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 py-4 overflow-x-auto" style={{ borderBottom: '1px solid rgba(120,220,255,0.12)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap"
              style={{
                background: activeTab === tab.id ? 'rgba(92,225,230,0.12)' : 'rgba(255,255,255,0.03)',
                color: activeTab === tab.id ? '#5CE1E6' : 'rgba(255,255,255,0.5)',
                border: activeTab === tab.id ? '1px solid rgba(92,225,230,0.3)' : '1px solid transparent'
              }}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 sm:overflow-y-auto sm:max-h-[calc(90vh-320px)]">
          <AnimatePresence mode="wait">
            {/* SERVICES TAB */}
            {activeTab === 'services' && (
              <motion.div key="services" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Izvršene Usluge</h3>
                  {!showAddServiceForm && (
                    <button
                      onClick={() => setShowAddServiceForm(true)}
                      className="px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
                      style={{ background: T.accent, color: '#000000' }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Dodaj Uslugu</span>
                    </button>
                  )}
                </div>

                {showAddServiceForm && (
                  <form
                    onSubmit={submitService}
                    noValidate
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        resetServiceForm();
                      }
                    }}
                    className="mb-6 p-5 rounded-2xl space-y-4"
                    style={{
                      background: 'rgba(92,225,230,0.05)',
                      border: '1px solid rgba(92,225,230,0.2)'
                    }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Naziv usluge</label>
                        <input
                          type="text"
                          value={newServiceName}
                          onChange={(e) => { setNewServiceName(e.target.value); setAddServiceError(''); }}
                          className="w-full px-3 py-2 rounded-xl text-sm"
                          style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Opis</label>
                        <input
                          type="text"
                          value={newServiceDescription}
                          onChange={(e) => setNewServiceDescription(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-sm"
                          style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                        />
                      </div>
                      {!hidePrices && (
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Cijena (EUR)</label>
                          <input
                            type="number"
                            lang="hr"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            value={newServicePrice}
                            onChange={(e) => { setNewServicePrice(e.target.value); setAddServiceError(''); }}
                            className="w-full px-3 py-2 rounded-xl text-sm"
                            style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                          />
                        </div>
                      )}
                    </div>

                    {addServiceError && (
                      <p className="text-sm" style={{ color: '#FF3B30' }}>{addServiceError}</p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        className="min-h-[44px] px-5 py-2 rounded-xl font-bold transition-all hover:scale-105"
                        style={{ background: T.accent, color: '#000000' }}
                      >
                        Dodaj
                      </button>
                      <button
                        type="button"
                        onClick={resetServiceForm}
                        className="min-h-[44px] px-5 py-2 rounded-xl font-medium transition-all hover:scale-105"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        Odustani
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 rounded-xl flex items-center justify-between"
                      style={{
                        background: service.completed ? 'rgba(46,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${service.completed ? 'rgba(46,255,136,0.2)' : 'rgba(255,255,255,0.08)'}`
                      }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => toggleService(service.id)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                          style={{
                            background: service.completed ? '#5CE1E6' : 'rgba(255,255,255,0.1)',
                            border: `2px solid ${service.completed ? '#5CE1E6' : 'rgba(255,255,255,0.3)'}`
                          }}
                        >
                          {service.completed && <CheckCircle className="w-4 h-4" style={{ color: '#000' }} />}
                        </button>

                        <div className="flex-1">
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{service.description}</p>
                        </div>
                      </div>

                      {!hidePrices && (
                        <div className="text-right">
                          <div className="font-bold" style={{ color: '#5CE1E6' }}>{(service.cost ?? 0).toFixed(2)} EUR</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TASKS TAB */}
            {activeTab === 'tasks' && (
              <motion.div key="tasks" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Zadaci održavanja</h3>
                  {!showAddTaskForm && (
                    <button
                      onClick={() => setShowAddTaskForm(true)}
                      className="px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
                      style={{ background: T.accent, color: '#000000' }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Dodaj Zadatak</span>
                    </button>
                  )}
                </div>

                {showAddTaskForm && (
                  <form
                    onSubmit={submitMaintenanceTask}
                    noValidate
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        resetTaskForm();
                      }
                    }}
                    className="mb-6 p-5 rounded-2xl space-y-4"
                    style={{
                      background: 'rgba(92,225,230,0.05)',
                      border: '1px solid rgba(92,225,230,0.2)'
                    }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Naziv zadatka</label>
                        <input
                          type="text"
                          value={newTaskName}
                          onChange={(e) => { setNewTaskName(e.target.value); setAddTaskError(''); }}
                          className="w-full px-3 py-2 rounded-xl text-sm"
                          style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                          autoFocus
                        />
                      </div>
                      {!hidePrices && (
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Cijena (EUR)</label>
                          <input
                            type="number"
                            lang="hr"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            value={newTaskPrice}
                            onChange={(e) => { setNewTaskPrice(e.target.value); setAddTaskError(''); }}
                            className="w-full px-3 py-2 rounded-xl text-sm"
                            style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                          />
                        </div>
                      )}
                    </div>

                    {addTaskError && (
                      <p className="text-sm" style={{ color: '#FF3B30' }}>{addTaskError}</p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        className="min-h-[44px] px-5 py-2 rounded-xl font-bold transition-all hover:scale-105"
                        style={{ background: T.accent, color: '#000000' }}
                      >
                        Dodaj
                      </button>
                      <button
                        type="button"
                        onClick={resetTaskForm}
                        className="min-h-[44px] px-5 py-2 rounded-xl font-medium transition-all hover:scale-105"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        Odustani
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {maintenanceTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl flex items-center justify-between"
                      style={{
                        background: task.completed ? 'rgba(46,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${task.completed ? 'rgba(46,255,136,0.2)' : 'rgba(255,255,255,0.08)'}`
                      }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                          style={{
                            background: task.completed ? '#5CE1E6' : 'rgba(255,255,255,0.1)',
                            border: `2px solid ${task.completed ? '#5CE1E6' : 'rgba(255,255,255,0.3)'}`
                          }}
                        >
                          {task.completed && <CheckCircle className="w-4 h-4" style={{ color: '#000' }} />}
                        </button>

                        <span className="flex-1" style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                          {task.name}
                        </span>
                      </div>

                      {!hidePrices && (
                        <div className="text-right">
                          <div className="font-bold" style={{ color: '#5CE1E6' }}>{(task.cost ?? 0).toFixed(2)} EUR</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <motion.div key="products" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Utrošena Kemija</h3>
                  {!showAddProductForm && (
                    <button
                      onClick={() => setShowAddProductForm(true)}
                      className="px-4 py-2 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
                      style={{ background: T.accent, color: '#000000' }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Dodaj Proizvod</span>
                    </button>
                  )}
                </div>

                {/* Inline add product form */}
                {showAddProductForm && (
                  <div className="mb-6 p-5 rounded-2xl space-y-4" style={{
                    background: 'rgba(92,225,230,0.05)',
                    border: '1px solid rgba(92,225,230,0.2)'
                  }}>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Proizvod sa skladišta</label>
                      {!warehouseProducts || warehouseProducts.length === 0 ? (
                        <p className="text-sm px-3 py-2 rounded-xl" style={{
                          color: 'rgba(255,255,255,0.5)',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                          Na skladištu nema artikala. Nositelj ih dodaje u Skladište.
                        </p>
                      ) : (
                        <select
                          value={newProductWarehouseId}
                          onChange={(e) => { setNewProductWarehouseId(e.target.value); setAddProductError(''); }}
                          className="w-full px-3 py-2 rounded-xl text-sm"
                          style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                        >
                          <option value="" style={{ background: '#1A1E26' }}>Odaberite proizvod</option>
                          {warehouseProducts.map(wp => (
                            <option key={String(wp.id)} value={String(wp.id)} style={{ background: '#1A1E26' }}>{wp.name}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Količina</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={newProductQty}
                            onChange={(e) => { setNewProductQty(e.target.value); setAddProductError(''); }}
                            className="flex-1 px-3 py-2 rounded-xl text-sm"
                            style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                            placeholder="0"
                          />
                          {selectedWP && (
                            <span className="text-sm px-2" style={{ color: 'rgba(255,255,255,0.6)' }}>{selectedWP.unit}</span>
                          )}
                        </div>
                      </div>

                      {!hidePrices && (
                        <>
                          <div>
                            <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Cijena po jedinici (EUR)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={newProductPrice}
                              onChange={(e) => setNewProductPrice(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl text-sm"
                              style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Popust (%)</label>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              value={newProductDiscount}
                              onChange={(e) => setNewProductDiscount(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl text-sm"
                              style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                              placeholder="0"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {addProductError && (
                      <p className="text-sm" style={{ color: '#FF3B30' }}>{addProductError}</p>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={submitProduct}
                        className="px-5 py-2 rounded-xl font-bold transition-all hover:scale-105"
                        style={{ background: T.accent, color: '#000000' }}
                      >
                        Dodaj
                      </button>
                      <button
                        onClick={() => { setShowAddProductForm(false); setAddProductError(''); setNewProductWarehouseId(''); setNewProductQty(''); setNewProductPrice(''); setNewProductDiscount('0'); }}
                        className="px-5 py-2 rounded-xl font-medium transition-all hover:scale-105"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        Odustani
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {productsUsed.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{product.productName}</h4>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-1 rounded-lg hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>

                      <div className={`grid gap-4 text-sm ${hidePrices ? 'grid-cols-2' : 'grid-cols-4'}`}>
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.5)' }}>Količina</div>
                          <div className="font-semibold">{product.quantity} {product.unit}</div>
                        </div>
                        {!hidePrices && (
                          <>
                            <div>
                              <div style={{ color: 'rgba(255,255,255,0.5)' }}>Cijena/jed</div>
                              <div className="font-semibold">{(product.pricePerUnit ?? 0).toFixed(2)} EUR</div>
                            </div>
                            {product.discount != null && product.discount > 0 && (
                              <div>
                                <div style={{ color: 'rgba(255,255,255,0.5)' }}>Popust</div>
                                <div className="font-semibold" style={{ color: '#2EFF88' }}>{product.discount}%</div>
                              </div>
                            )}
                            <div className="text-right">
                              <div style={{ color: 'rgba(255,255,255,0.5)' }}>Ukupno</div>
                              <div className="font-bold" style={{ color: '#5CE1E6' }}>{(product.totalCost ?? 0).toFixed(2)} EUR</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {productsUsed.length === 0 && !showAddProductForm && (
                  <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <Package className="w-12 h-12 mx-auto mb-4" />
                    <p>Nema dodanih proizvoda</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* WATER ANALYSIS TAB */}
            {activeTab === 'water' && (
              <motion.div key="water" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h3 className="text-xl font-semibold mb-6">Analiza Vode</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(10,40,52,0.55)', border: '1px solid rgba(120,220,255,0.12)' }}>
                    <label className="block text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>pH Vrijednost</label>
                    <input
                      type="number" step="0.1"
                      value={waterAnalysis.pH || ''}
                      onChange={(e) => setWaterAnalysis({ ...waterAnalysis, pH: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl text-2xl font-bold text-center"
                      style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: (waterAnalysis.pH && waterAnalysis.pH >= 7.2 && waterAnalysis.pH <= 7.6) ? '#2EFF88' : '#FFB020', fontSize: '16px' }}
                    />
                    <div className="text-xs text-center mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Idealno: 7.2 - 7.6</div>
                  </div>

                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <label className="block text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Klor (ppm)</label>
                    <input
                      type="number" step="0.1"
                      value={waterAnalysis.chlorine || ''}
                      onChange={(e) => setWaterAnalysis({ ...waterAnalysis, chlorine: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl text-2xl font-bold text-center"
                      style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: (waterAnalysis.chlorine && waterAnalysis.chlorine >= 1.0 && waterAnalysis.chlorine <= 3.0) ? '#2EFF88' : '#FFB020', fontSize: '16px' }}
                    />
                    <div className="text-xs text-center mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Idealno: 1.0 - 3.0 ppm</div>
                  </div>

                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <label className="block text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Alkalinitet</label>
                    <input
                      type="number"
                      value={waterAnalysis.alkalinity || ''}
                      onChange={(e) => setWaterAnalysis({ ...waterAnalysis, alkalinity: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl text-2xl font-bold text-center"
                      style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: (waterAnalysis.alkalinity && waterAnalysis.alkalinity >= 80 && waterAnalysis.alkalinity <= 120) ? '#2EFF88' : '#FFB020', fontSize: '16px' }}
                    />
                    <div className="text-xs text-center mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Idealno: 80 - 120 ppm</div>
                  </div>

                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <label className="block text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Temperatura (°C)</label>
                    <input
                      type="number" step="0.1"
                      value={waterAnalysis.temperature || ''}
                      onChange={(e) => setWaterAnalysis({ ...waterAnalysis, temperature: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl text-2xl font-bold text-center"
                      style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: '#5CE1E6', fontSize: '16px' }}
                    />
                  </div>

                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <label className="block text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Redox (mV)</label>
                    <input
                      type="number"
                      value={waterAnalysis.redox || ''}
                      onChange={(e) => setWaterAnalysis({ ...waterAnalysis, redox: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl text-2xl font-bold text-center"
                      style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: (waterAnalysis.redox && waterAnalysis.redox >= 650 && waterAnalysis.redox <= 800) ? '#2EFF88' : '#FFB020', fontSize: '16px' }}
                    />
                    <div className="text-xs text-center mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Idealno: 650 - 800 mV</div>
                  </div>
                </div>

                <div className="mt-6 p-6 rounded-xl" style={{
                  background: 'rgba(92,225,230,0.05)',
                  border: '1px solid rgba(92,225,230,0.2)'
                }}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" style={{ color: '#5CE1E6' }} />
                    <span>Preporuke</span>
                  </h4>
                  <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {waterAnalysis.pH && waterAnalysis.pH < 7.2 && <li>• pH je prenizak - dodajte pH Plus</li>}
                    {waterAnalysis.pH && waterAnalysis.pH > 7.6 && <li>• pH je previsok - dodajte pH Minus</li>}
                    {waterAnalysis.chlorine && waterAnalysis.chlorine < 1.0 && <li>• Klor je prenizak - dodajte granularni klor ili tekući klor</li>}
                    {waterAnalysis.chlorine && waterAnalysis.chlorine > 3.0 && <li>• Klor je previsok - zaustavite kloriranje i provjetrite bazen</li>}
                    {waterAnalysis.alkalinity && waterAnalysis.alkalinity < 80 && <li>• Alkalinitet je prenizak - dodajte alkalinity increaser</li>}
                    {(!waterAnalysis.pH || (waterAnalysis.pH >= 7.2 && waterAnalysis.pH <= 7.6)) &&
                     (!waterAnalysis.chlorine || (waterAnalysis.chlorine >= 1.0 && waterAnalysis.chlorine <= 3.0)) &&
                     (!waterAnalysis.alkalinity || (waterAnalysis.alkalinity >= 80 && waterAnalysis.alkalinity <= 120)) && (
                      <li>✓ Sve vrijednosti su u optimalnom rasponu</li>
                    )}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* AUTOMATION TAB */}
            {activeTab === 'automation' && (
              <motion.div key="automation" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h3 className="text-xl font-semibold mb-6">Automatika</h3>

                <div className="mb-6 p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label className="block text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Tip Sustava</label>
                  <div className="grid grid-cols-4 gap-3">
                    {['klor', 'so', 'uv', 'ozon'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setAutomationData({ ...automationData, systemType: type })}
                        className="px-4 py-3 rounded-xl font-medium transition-all uppercase"
                        style={{
                          background: automationData.systemType === type ? 'rgba(92,225,230,0.12)' : 'rgba(255,255,255,0.05)',
                          color: automationData.systemType === type ? '#5CE1E6' : 'rgba(255,255,255,0.5)',
                          border: automationData.systemType === type ? '1px solid rgba(92,225,230,0.3)' : '1px solid transparent'
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6 p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label className="block text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Radni Status</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: 'ok', label: 'OK', color: '#2EFF88' },
                      { id: 'warning', label: 'Upozorenje', color: '#FFB020' },
                      { id: 'error', label: 'Greška', color: '#FF3B30' },
                      { id: 'off', label: 'Isključeno', color: '#666' }
                    ].map((status) => (
                      <button
                        key={status.id}
                        onClick={() => setAutomationData({ ...automationData, operationalStatus: status.id as any })}
                        className="px-4 py-3 rounded-xl font-medium transition-all"
                        style={{
                          background: automationData.operationalStatus === status.id ? `${status.color}20` : 'rgba(255,255,255,0.05)',
                          color: automationData.operationalStatus === status.id ? status.color : 'rgba(255,255,255,0.5)',
                          border: automationData.operationalStatus === status.id ? `1px solid ${status.color}40` : '1px solid transparent'
                        }}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6 p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 className="font-semibold mb-4">LCD Vrijednosti</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { key: 'ph', label: 'pH', placeholder: '7.2' },
                      { key: 'redox', label: 'Redox (mV)', placeholder: '750' },
                      { key: 'temperature', label: 'Temperatura (°C)', placeholder: '24' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</label>
                        <input
                          type="text"
                          value={(automationData.lcdValues as any)[key] || ''}
                          onChange={(e) => setAutomationData({
                            ...automationData,
                            lcdValues: { ...automationData.lcdValues, [key]: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded-lg"
                          style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6 p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 className="font-semibold mb-4">Status Kanistera</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { id: 'phMinus', label: 'pH Minus' },
                      { id: 'liquidChlorine', label: 'Tekući Klor' },
                      { id: 'flocculant', label: 'Flokulant' }
                    ].map((canister) => (
                      <div key={canister.id}>
                        <label className="block text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{canister.label}</label>
                        <div className="grid grid-cols-4 gap-1">
                          {['empty', 'low', 'ok', 'full'].map((level) => (
                            <button
                              key={level}
                              onClick={() => setAutomationData({
                                ...automationData,
                                canisters: { ...automationData.canisters, [canister.id]: level as any }
                              })}
                              className="py-2 rounded-lg text-xs font-medium transition-all"
                              style={{
                                background: (automationData.canisters as any)[canister.id] === level
                                  ? getCanisterColor(level as any)
                                  : 'rgba(255,255,255,0.05)',
                                color: (automationData.canisters as any)[canister.id] === level ? '#000' : 'rgba(255,255,255,0.3)'
                              }}
                            >
                              {level.charAt(0).toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label className="block text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Napomene o Automatici</label>
                  <textarea
                    value={automationData.notes || ''}
                    onChange={(e) => setAutomationData({ ...automationData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', color: 'white', fontSize: '16px' }}
                    placeholder="Dodatne napomene..."
                  />
                </div>
              </motion.div>
            )}

            {/* PHOTOS TAB */}
            {activeTab === 'photos' && (
              <motion.div key="photos" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h3 className="text-xl font-semibold mb-4">Fotografije</h3>

                <div className="flex flex-wrap gap-2 mb-5">
                  <button
                    onClick={() => setPhotoFilter('all')}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                    style={{
                      background: photoFilter === 'all' ? 'rgba(92,225,230,0.15)' : 'rgba(255,255,255,0.04)',
                      color: photoFilter === 'all' ? '#5CE1E6' : 'rgba(255,255,255,0.5)',
                      border: photoFilter === 'all' ? '1px solid rgba(92,225,230,0.35)' : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    Sve
                  </button>
                  {PHOTO_CATEGORIES.map(category => {
                    const selectedForNewPhotos = photoCategory === category.id;
                    const activeFilter = photoFilter === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setPhotoCategory(category.id);
                          setPhotoFilter(category.id);
                        }}
                        className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                        style={{
                          background: selectedForNewPhotos ? 'rgba(92,225,230,0.15)' : 'rgba(255,255,255,0.04)',
                          color: selectedForNewPhotos ? '#5CE1E6' : 'rgba(255,255,255,0.5)',
                          border: activeFilter
                            ? '1px solid rgba(92,225,230,0.55)'
                            : selectedForNewPhotos
                              ? '1px solid rgba(92,225,230,0.25)'
                              : '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>

                {photoMode === 'demo' && (
                  <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Demo način: fotografije se ne spremaju na poslužitelj.
                  </p>
                )}

                {photos.length < 40 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <label
                      className="min-h-[48px] w-full px-5 py-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                      style={{ background: T.accent, color: '#000000', opacity: photoMode === 'checking' ? 0.6 : 1 }}
                    >
                      <Camera className="w-5 h-5" />
                      <span>Slikaj</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        disabled={photoMode === 'checking'}
                        onChange={e => {
                          void addPhotoFiles(e.target.files);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                    <label
                      className="min-h-[48px] w-full px-5 py-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                      style={{ background: 'rgba(92,225,230,0.12)', color: '#5CE1E6', border: '1px solid rgba(92,225,230,0.3)', opacity: photoMode === 'checking' ? 0.6 : 1 }}
                    >
                      <Images className="w-5 h-5" />
                      <span>Iz galerije</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={photoMode === 'checking'}
                        onChange={e => {
                          void addPhotoFiles(e.target.files);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <p className="text-sm mb-5" style={{ color: '#FFB020' }}>Najviše 40 fotografija po nalogu.</p>
                )}

                {photoError && (
                  <p className="text-sm mb-4" style={{ color: '#FF3B30' }}>{photoError}</p>
                )}

                {hasFailedPhotos && (
                  <button
                    type="button"
                    onClick={() => {
                      photos
                        .filter(photo => photoUploadStates[photo.id] === 'failed')
                        .forEach(photo => void uploadPhoto(photo));
                    }}
                    className="min-h-[44px] px-5 py-2 mb-4 rounded-xl text-sm font-bold transition-all"
                    style={{ background: 'rgba(255,59,48,0.1)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.3)' }}
                  >
                    Pošalji ponovno sve
                  </button>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredPhotos.map(photo => {
                    const source = photoSource(photo);
                    const uploadState = photoUploadStates[photo.id];
                    return (
                      <div key={photo.id} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="relative aspect-square" style={{ background: 'rgba(2,13,18,0.6)' }}>
                          {source ? (
                            <button
                              type="button"
                              onClick={() => setViewerPhotoId(photo.id)}
                              className="w-full h-full block"
                              aria-label={`Otvori fotografiju: ${photoCategoryLabel(photo.category)}`}
                            >
                              <img
                                src={source}
                                alt={photoCategoryLabel(photo.category)}
                                className="w-full h-full object-cover"
                                onError={() => handlePhotoImageError(photo)}
                              />
                            </button>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.15)' }} />
                            </div>
                          )}

                          {uploadState === 'uploading' && (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(2,13,18,0.58)' }}>
                              <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#5CE1E6' }} />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => requestDeletePhoto(photo.id)}
                            className="absolute top-2 right-2 p-2 rounded-lg"
                            style={{ background: 'rgba(0,0,0,0.72)' }}
                            aria-label="Obriši fotografiju"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>

                          <div className="absolute bottom-0 left-0 px-2.5 py-1.5 text-xs font-semibold" style={{ background: 'rgba(2,13,18,0.8)', color: '#5CE1E6' }}>
                            {photoCategoryLabel(photo.category)}
                          </div>
                        </div>

                        <div className="p-2.5 space-y-2">
                          {uploadState === 'failed' && (
                            <button
                              type="button"
                              onClick={() => void uploadPhoto(photo)}
                              className="text-left text-xs font-semibold"
                              style={{ color: '#FF3B30' }}
                            >
                              {photoUploadErrors[photo.id] === 'offline'
                                ? 'Nema interneta – pošaljite kad se spojite'
                                : 'Nije poslano – Pokušaj ponovno'}
                            </button>
                          )}

                          {deletePhotoId === photo.id ? (
                            <div className="p-2 rounded-xl" style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.25)' }}>
                              <p className="text-xs font-semibold mb-2" style={{ color: '#FF3B30' }}>Obrisati?</p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => deletePhoto(photo.id)}
                                  className="flex-1 min-h-[36px] rounded-lg text-xs font-bold"
                                  style={{ background: 'rgba(255,59,48,0.16)', color: '#FF3B30' }}
                                >
                                  Da
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletePhotoId(null)}
                                  className="flex-1 min-h-[36px] rounded-lg text-xs font-bold"
                                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                                >
                                  Ne
                                </button>
                              </div>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={photo.note || ''}
                              onChange={e => updatePhotoNote(photo.id, e.target.value)}
                              placeholder="Napomena, npr. curi brtva na pumpi"
                              className="w-full px-3 py-2 rounded-lg text-sm"
                              style={{ background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.14)', color: 'white', fontSize: '16px' }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* INVOICE TAB — only rendered when !hidePrices */}
            {activeTab === 'invoice' && !hidePrices && (
              <motion.div key="invoice" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h3 className="text-xl font-semibold mb-6">Račun & Fakturiranje</h3>

                <div className="mb-6 p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Nalog Broj</div><div className="font-semibold">#{order.id}</div></div>
                    <div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Datum</div><div className="font-semibold">{new Date().toLocaleDateString('hr-HR')}</div></div>
                    <div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Klijent</div><div className="font-semibold">{editedOrder.client}</div></div>
                    <div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Lokacija</div><div className="font-semibold">{editedOrder.location}</div></div>
                    <div><div style={{ color: 'rgba(255,255,255,0.5)' }}>Izvršitelj</div><div className="font-semibold">{editedOrder.assignee}</div></div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.5)' }}>Status</div>
                      <div className="font-semibold" style={{ color: getStatusColor(editedOrder.status === 'completed' ? 'ok' : 'warning') }}>
                        {editedOrder.status === 'active' ? 'AKTIVNO' : editedOrder.status === 'pending' ? 'NA ČEKANJU' : 'ZAVRŠENO'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {services.filter(s => s.completed).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>Izvršene Usluge</h4>
                      <div className="space-y-2">
                        {services.filter(s => s.completed).map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div className="flex-1">
                              <div className="font-medium">{service.name}</div>
                              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{service.description}</div>
                            </div>
                            <div className="font-bold" style={{ color: '#5CE1E6' }}>{(service.cost ?? 0).toFixed(2)} EUR</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {maintenanceTasks.filter(t => t.completed).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>Zadaci održavanja</h4>
                      <div className="space-y-2">
                        {maintenanceTasks.filter(t => t.completed).map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div className="font-medium">{task.name}</div>
                            <div className="font-bold" style={{ color: '#5CE1E6' }}>{(task.cost ?? 0).toFixed(2)} EUR</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {productsUsed.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>Utrošena Kemija</h4>
                      <div className="space-y-2">
                        {productsUsed.map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div className="flex-1">
                              <div className="font-medium">{product.productName}</div>
                              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                {product.quantity} {product.unit} × {(product.pricePerUnit ?? 0).toFixed(2)} EUR
                                {product.discount != null && product.discount > 0 && ` (-${product.discount}%)`}
                              </div>
                            </div>
                            <div className="font-bold" style={{ color: '#5CE1E6' }}>{(product.totalCost ?? 0).toFixed(2)} EUR</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-6 rounded-xl" style={{
                  background: 'rgba(10,40,52,0.55)',
                  border: '1px solid rgba(120,220,255,0.12)'
                }}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>Usluge:</span>
                      <span className="font-semibold">{totals.servicesTotal.toFixed(2)} EUR</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>Zadaci:</span>
                      <span className="font-semibold">{totals.tasksTotal.toFixed(2)} EUR</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>Kemija:</span>
                      <span className="font-semibold">{totals.productsTotal.toFixed(2)} EUR</span>
                    </div>
                    <div className="h-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
                    <div className="flex items-center justify-between text-xl">
                      <span className="font-bold">UKUPNO:</span>
                      <span className="font-bold" style={{ color: '#5CE1E6' }}>{totals.grandTotal.toFixed(2)} EUR</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setEditedOrder({ ...editedOrder, status: 'completed' as const })}
                    className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
                    style={{ background: T.accent, color: '#000000' }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Zatvori Nalog</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
                    style={{ background: T.accent, color: '#000000' }}
                  >
                    <FileText className="w-5 h-5" />
                    <span>Radni nalog PDF</span>
                  </button>
                </div>
                <button
                  onClick={handlePrintOffer}
                  className="mt-4 w-full px-6 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{ border: '1px solid rgba(92,225,230,0.5)', color: '#5CE1E6', background: 'rgba(92,225,230,0.06)' }}
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Ponuda za plaćanje (IBAN i 2D kod)</span>
                </button>
                {offerError && (
                  <p className="mt-2 text-sm p-3 rounded-xl" style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF8A80' }}>{offerError}</p>
                )}
                <p className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Ponuda nije fiskalizirani račun. Račun izdajte iz programa za eRačune.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {viewerIndex >= 0 && filteredPhotos[viewerIndex] && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.94)' }}
            onClick={() => setViewerPhotoId(null)}
            onTouchStart={event => {
              touchStartXRef.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={event => {
              const startX = touchStartXRef.current;
              const endX = event.changedTouches[0]?.clientX;
              touchStartXRef.current = null;
              if (startX == null || endX == null) return;
              const delta = endX - startX;
              if (delta > 50) showPreviousPhoto();
              if (delta < -50) showNextPhoto();
            }}
          >
            <button
              type="button"
              onClick={() => setViewerPhotoId(null)}
              className="absolute top-4 right-4 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              aria-label="Zatvori"
            >
              <X className="w-6 h-6" />
            </button>

            {filteredPhotos.length > 1 && (
              <button
                type="button"
                onClick={event => { event.stopPropagation(); showPreviousPhoto(); }}
                className="absolute left-3 sm:left-6 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                aria-label="Prethodna fotografija"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            <div className="max-w-5xl w-full h-full flex flex-col items-center justify-center gap-3" onClick={event => event.stopPropagation()}>
              <img
                src={photoSource(filteredPhotos[viewerIndex])}
                alt={photoCategoryLabel(filteredPhotos[viewerIndex].category)}
                className="max-w-full max-h-[82vh] object-contain rounded-xl"
                onError={() => handlePhotoImageError(filteredPhotos[viewerIndex])}
              />
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: '#5CE1E6' }}>
                  {photoCategoryLabel(filteredPhotos[viewerIndex].category)}
                </p>
                {filteredPhotos[viewerIndex].note && (
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {filteredPhotos[viewerIndex].note}
                  </p>
                )}
              </div>
            </div>

            {filteredPhotos.length > 1 && (
              <button
                type="button"
                onClick={event => { event.stopPropagation(); showNextPhoto(); }}
                className="absolute right-3 sm:right-6 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                aria-label="Sljedeća fotografija"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

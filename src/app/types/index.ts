export type UserType = 'professional' | 'client' | 'guest';

export type UserRole = 'professional' | 'client' | 'guest' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string; // ID krovne tvrtke
  companyName?: string; // Za profesionalce
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
}

export interface Pool {
  id: string;
  name: string;
  type: 'private' | 'hotel' | 'public' | '';
  volume: number; // in m³
  dimensions?: string; // e.g., "8x4x1.5"
  disinfectionSystem?: 'elektroliza' | 'klor-ph' | 'peroksid' | 'tablete';
  disinfectionSystemPhoto?: string; // Base64 image of disinfection system
  poolPhoto?: string; // Base64 image of pool
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    manualEntry?: boolean;
  };
  clientId?: string;
  clientName?: string;
  notes?: string;
  imageUrl?: string;
  lastAnalysisStatus?: 'ok' | 'warning' | 'critical';
  lastAnalysisDate?: string;
  equipment?: PoolEquipment[];
  gallery?: PoolImage[];
}

export interface WaterAnalysis {
  id: string;
  poolId: string;
  date: string;
  parameters: {
    pH: number;
    freeChlorine: number;
    alkalinity: number;
    hardness: number;
    temperature?: number;
    orp?: number;
  };
  status: 'ok' | 'warning' | 'critical';
  recommendations: ProductRecommendation[];
  waterCondition?: string[]; // Visual water conditions
  notes?: {
    equipmentIssues?: string;
    additionalWork?: string;
    productsLeft?: Array<{
      id: string;
      name: string;
      quantity: string;
    }>;
    equipmentPhotos?: Array<{
      id: string;
      category: 'pumpa' | 'filter' | 'dozatori' | 'dozator1' | 'trafo' | 'ostalo' | 'issues' | 'work' | 'products';
      dataUrl: string;
      timestamp: string;
    }>;
  };
}

export interface ProductRecommendation {
  productId?: string;
  productName: string;
  quantity: number;
  unit: string;
  instructions: string;
  priority?: number;
  category?: 'ph' | 'chlorine' | 'clarification' | 'stabilization';
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contact?: string; // Deprecated, use email or phone
  address?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  notes?: string;
  poolIds?: string[];
  automation?: 'none' | 'chlorine' | 'salt' | 'uv' | 'ozone' | 'bromine' | 'other';
  automationNotes?: string;
}

export interface PoolEquipment {
  id: string;
  name: string;
  type: 'pumpa' | 'filter' | 'dozatori' | 'dozator1' | 'trafo' | 'ostalo';
  status: 'ok' | 'warning' | 'critical';
  lastMaintenance?: string;
  notes?: string;
}

export interface PoolImage {
  id: string;
  dataUrl: string;
  timestamp: string;
  description?: string;
}

export interface WorkOrder {
  id: string;
  poolId: string;
  poolName: string;
  clientId?: string;
  clientName?: string;
  analysisId?: string;
  date: string;
  type: 'maintenance' | 'repair' | 'analysis';
  status: 'pending' | 'in-progress' | 'completed' | 'invoiced';
  description: string;
  equipmentIssues?: string;
  additionalWork?: string;
  chemicalsUsed?: Array<{
    id: string;
    name: string;
    quantity: string;
    unit?: string;
    price?: number;
    discount?: number;
  }>;
  photos?: Array<{
    id: string;
    category: string;
    dataUrl: string;
    timestamp: string;
  }>;
  timeSpent?: number; // in minutes
  cost?: number;
  notes?: string;
  completedAt?: string;
  completedBy?: string;
  completedByName?: string;
  workOrderNumber?: string;
  assignedTo?: string;
  assignedToName?: string;
  additionalWorkers?: Array<{
    id: string;
    name: string;
  }>;
  // New fields for analysis and billing
  analysisResults?: {
    status: 'ok' | 'warning' | 'critical';
    parameters: {
      pH?: number;
      chlorine?: number;
      alkalinity?: number;
      temperature?: number;
      redox?: number;
    };
    recommendations?: ProductRecommendation[];
  };
  billing?: {
    items: Array<{
      id: string;
      description: string;
      quantity: number;
      price: number;
      discount?: number;
    }>;
    total: number;
  };
  invoicedAt?: string;
  automationConfirmed?: boolean;
  machineRoomPhotos?: Array<{
    id: string;
    category: 'machine-room' | 'elements' | 'pool';
    dataUrl: string;
    timestamp: string;
  }>;
}

export interface Issue {
  id: string;
  poolId: string;
  poolName: string;
  clientId?: string;
  clientName?: string;
  date: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  photos?: Array<{
    id: string;
    dataUrl: string;
    timestamp: string;
  }>;
  resolvedAt?: string;
  notes?: string;
}
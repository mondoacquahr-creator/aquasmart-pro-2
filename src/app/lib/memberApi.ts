import { api } from './supabase';

export interface MemberProfile {
  name: string;
  phone?: string;
  city?: string;
  address?: string;
  marketing?: boolean;
}

export interface MemberPool {
  volume?: number;
  length?: number;
  width?: number;
  depth?: number;
  poolType?: string;
  circulation?: string;
  filterType?: string;
  filterMedia?: string;
  disinfection?: string;
  poolYear?: number;
  heating?: string;
  heatingPower?: number;
  pumpPower?: number;
  pumpPowerUnit?: 'kW' | 'HP';
  filterLoad?: number;
  cover?: string;
  address?: string;
  notes?: string;
}

export interface MemberRecommendation {
  productName: string;
  dosage: string;
  instructions: string;
}

export interface MemberAnalysis {
  id?: string;
  createdAt?: string;
  pH?: number;
  freeChlorine?: number;
  totalChlorine?: number;
  alkalinity?: number;
  hardness?: number;
  cyanuricAcid?: number;
  temperature?: number;
  orp?: number;
  volume?: number;
  status?: string;
  message?: string;
  issues?: string[];
  recommendations?: MemberRecommendation[];
  photoPath?: string;
  appearance?: { isPool?: boolean; clarity: string; algae: string; debris?: boolean; note?: string };
}

export interface MemberVisit {
  id?: string;
  status?: 'new' | 'scheduled' | 'done' | 'cancelled';
  scheduledFor?: string;
  phone?: string;
  address?: string;
  city?: string;
  preferred?: string;
  note?: string;
}

export interface MemberEquipment {
  id?: string;
  type?: string;
  brand?: string;
  model?: string;
  year?: number;
  condition?: 'ok' | 'watch' | 'replace';
  power?: number;
  powerUnit?: 'kW' | 'HP';
  capacity?: number;
  notes?: string;
  inspectedAt?: string;
}

export interface MemberData {
  profile: MemberProfile;
  pool: MemberPool;
  analyses: MemberAnalysis[];
  visits: MemberVisit[];
  equipment: MemberEquipment[];
}

export const memberApi = {
  async getMemberMe(): Promise<MemberData> {
    return api.invoke('member/me');
  },

  async saveMemberProfile(p: MemberProfile): Promise<void> {
    return api.invoke('member/profile', { method: 'PUT', body: p });
  },

  async changeMemberEmail(email: string, password: string): Promise<{ email: string }> {
    return api.invoke('member/email', { method: 'PUT', body: { email, password } });
  },

  async saveMemberPool(p: MemberPool): Promise<void> {
    return api.invoke('member/pool', { method: 'PUT', body: p });
  },

  async saveMemberAnalysis(a: MemberAnalysis): Promise<MemberAnalysis> {
    return api.invoke('member/analyses', { method: 'POST', body: a });
  },

  async deleteMemberAnalysis(id: string): Promise<void> {
    return api.invoke('member/analyses/' + id, { method: 'DELETE' });
  },

  async requestFreeVisit(v: Omit<MemberVisit, 'id' | 'status' | 'scheduledFor'>): Promise<void> {
    return api.invoke('member/visit-request', { method: 'POST', body: v });
  },

  async deleteMemberAccount(): Promise<void> {
    return api.invoke('member/account', { method: 'DELETE' });
  },
};

export function isMemberLoggedIn(): boolean {
  return localStorage.getItem('userRole') === 'member';
}

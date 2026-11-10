import { supabase, api } from './supabase';

export type Access = 'none' | 'view' | 'edit';

export interface Permissions {
  workOrders: 'own' | 'all';
  createOrders: boolean;
  warehouse: Access;
  clients: Access;
  prices: boolean;
  waterAnalysis: boolean;
  visualizer: boolean;
}

export const DEFAULT_EMPLOYEE_PERMISSIONS: Permissions = {
  workOrders: 'own',
  createOrders: false,
  warehouse: 'view',
  clients: 'view',
  prices: false,
  waterAnalysis: true,
  visualizer: true,
};

export const FULL_PERMISSIONS: Permissions = {
  workOrders: 'all',
  createOrders: true,
  warehouse: 'edit',
  clients: 'edit',
  prices: true,
  waterAnalysis: true,
  visualizer: true,
};

export const isDemoMode = () => localStorage.getItem('isDemo') === 'true';

export async function isLiveMode(): Promise<boolean> {
  if (isDemoMode()) return false;
  const { data } = await supabase.auth.getSession();
  return !!data?.session;
}

export function getPermissions(): Permissions {
  if (isDemoMode() && localStorage.getItem('userRole') === 'employee') {
    const stored = localStorage.getItem('userPermissions');
    if (stored) {
      try {
        return { ...DEFAULT_EMPLOYEE_PERMISSIONS, ...JSON.parse(stored) };
      } catch {}
    }
    return { ...DEFAULT_EMPLOYEE_PERMISSIONS };
  }
  if (isDemoMode() || localStorage.getItem('userRole') !== 'employee') {
    return FULL_PERMISSIONS;
  }
  try {
    return { ...DEFAULT_EMPLOYEE_PERMISSIONS, ...JSON.parse(localStorage.getItem('userPermissions') || '{}') };
  } catch {
    return DEFAULT_EMPLOYEE_PERMISSIONS;
  }
}

export async function refreshMe() {
  try {
    const me = await api.get('me');
    if (me?.role === 'employee') {
      localStorage.setItem('userPermissions', JSON.stringify(me.permissions || {}));
    }
    return me;
  } catch {
    return null;
  }
}

export function generatePassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

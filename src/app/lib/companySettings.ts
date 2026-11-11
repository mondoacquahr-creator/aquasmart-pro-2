import { api } from './supabase';
import { isDemoMode } from './session';

// Podaci tvrtke servisera za ponude (naziv, OIB, adresa, IBAN). Demo način ih čuva lokalno.
export interface CompanySettings {
  companyName?: string;
  oib?: string;
  address?: string;
  city?: string;
  iban?: string;
  email?: string;
  phone?: string;
}

const DEMO_KEY = 'demo_company_settings';

export async function loadCompanySettings(): Promise<CompanySettings> {
  if (isDemoMode()) {
    try { return JSON.parse(localStorage.getItem(DEMO_KEY) || '{}'); } catch { return {}; }
  }
  const d: any = await api.get('company/settings');
  return d && typeof d === 'object' && !d.error ? d : {};
}

export async function saveCompanySettings(s: CompanySettings): Promise<CompanySettings> {
  if (isDemoMode()) {
    localStorage.setItem(DEMO_KEY, JSON.stringify(s));
    return s;
  }
  const res: any = await api.invoke('company/settings', { method: 'PUT', body: s });
  return res?.settings || s;
}

import { api } from './supabase';

export async function loadCompanyData(): Promise<Record<string, any[]> | null> {
  try {
    return await api.syncAll();
  } catch {
    return null;
  }
}

export async function saveChanges(resource: string, oldList: any[], newList: any[]): Promise<void> {
  const errors: string[] = [];

  for (const item of newList) {
    const old = oldList.find(o => o.id === item.id);
    if (!old || JSON.stringify(old) !== JSON.stringify(item)) {
      try {
        await api.post(resource, item);
      } catch (err: any) {
        errors.push(err?.message || 'Greška');
      }
    }
  }

  const newIds = new Set(newList.map(i => i.id));
  for (const item of oldList) {
    if (!newIds.has(item.id)) {
      try {
        await api.delete(resource, String(item.id));
      } catch (err: any) {
        errors.push(err?.message || 'Greška');
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors[0]);
  }
}

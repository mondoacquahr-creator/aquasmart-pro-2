// Tehnički podatak opreme za prikaz: snaga (kW / KS) ili kapacitet filtera (kg).
export const POWER_TYPES = ['Pumpa', 'Toplinska pumpa', 'Dozirna pumpa pH', 'Dozirna pumpa klor', 'Elektroliza', 'Robot'];
export const KW_ONLY_TYPES = ['Toplinska pumpa'];
export const CAPACITY_TYPES = ['Filter'];

const n = (v: any) => String(v).replace('.', ',');

export function equipmentSpec(e: { type?: string; power?: number; powerUnit?: string; capacity?: number }): string {
  const parts: string[] = [];
  if (e.power) parts.push(`${n(e.power)} ${e.powerUnit === 'HP' ? 'KS' : 'kW'}`);
  if (e.capacity) parts.push(`${n(e.capacity)} kg punjenja`);
  return parts.join(' · ');
}

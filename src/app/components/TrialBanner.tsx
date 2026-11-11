import { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { api } from '../lib/supabase';
import { isDemoMode } from '../lib/session';
import { MONDO_CONTACT } from '../lib/mondoShop';

// Stanje probnog razdoblja / pretplate tvrtke u Pro portalu.
interface Status { active: boolean; inTrial?: boolean; paid?: boolean; exempt?: boolean; trialDaysLeft?: number; trialEndsAt?: string; paidUntil?: string }

export function TrialBanner() {
  const [st, setSt] = useState<Status | null>(null);
  useEffect(() => {
    if (isDemoMode()) return;
    api.get('company/status').then((d: any) => setSt(d && typeof d === 'object' ? d : null)).catch(() => {});
  }, []);
  if (!st || st.exempt || st.paid) return null;

  if (!st.active) {
    return (
      <div className="relative z-20 max-w-7xl mx-auto px-6 mt-4">
        <div className="flex items-start gap-3 rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.35)', color: '#FFB4AE' }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#FF3B30' }} />
          <span>
            <strong style={{ color: '#fff' }}>Probno razdoblje je isteklo.</strong> Podatke možete pregledavati, ali ne i mijenjati.
            Za nastavak rada javite se Mondo Acqui: <a className="underline" href={`mailto:${MONDO_CONTACT.email}`}>{MONDO_CONTACT.email}</a> ·{' '}
            <a className="underline" href={`tel:${MONDO_CONTACT.phone.replace(/\s/g, '')}`}>{MONDO_CONTACT.phone}</a>
          </span>
        </div>
      </div>
    );
  }

  const left = st.trialDaysLeft ?? 99;
  if (!st.inTrial || left > 7) return null;
  return (
    <div className="relative z-20 max-w-7xl mx-auto px-6 mt-4">
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(255,176,32,0.1)', border: '1px solid rgba(255,176,32,0.35)', color: '#FFD27A' }}>
        <Clock className="w-5 h-5 flex-shrink-0" />
        <span>Probno razdoblje ističe za {left} {left === 1 ? 'dan' : 'dana'}. Za nastavak javite se Mondo Acqui ({MONDO_CONTACT.phone}).</span>
      </div>
    </div>
  );
}

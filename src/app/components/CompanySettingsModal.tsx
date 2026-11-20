import { useEffect, useState } from 'react';
import { X, Save, Loader2, ImagePlus } from 'lucide-react';
import { CompanySettings, loadCompanySettings, saveCompanySettings } from '../lib/companySettings';
import { getCompanyLogo, uploadCompanyLogo } from '../lib/companyLogo';

// Postavke tvrtke servisera: podaci koji se ispisuju na ponudi za plaćanje.
const inputStyle = { background: 'rgba(2,13,18,0.6)', border: '1px solid rgba(120,220,255,0.18)', fontSize: '16px', outline: 'none', color: '#fff' };

export function CompanySettingsModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<CompanySettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoMsg, setLogoMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    loadCompanySettings().then(setForm).catch(() => {}).finally(() => setLoading(false));
    getCompanyLogo().then(setLogo).catch(() => {});
  }, []);

  const onLogo = async (file?: File) => {
    if (!file) return;
    setLogoBusy(true); setLogoMsg(null);
    try {
      setLogo(await uploadCompanyLogo(file));
      setLogoMsg({ ok: true, text: 'Logo je spremljen. Ispisuje se na izvještajima i ponudama.' });
    } catch (e: any) {
      setLogoMsg({ ok: false, text: e?.message || 'Učitavanje loga nije uspjelo.' });
    }
    setLogoBusy(false);
  };

  const field = (key: keyof CompanySettings, label: string, placeholder: string, type = 'text') => (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</label>
      <input type={type} value={form[key] || ''} placeholder={placeholder}
        onChange={e => { setForm({ ...form, [key]: e.target.value }); setMsg(null); }}
        className="w-full px-4 py-3 rounded-xl" style={inputStyle} />
    </div>
  );

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const saved = await saveCompanySettings({ ...form, iban: (form.iban || '').replace(/\s+/g, '').toUpperCase() });
      setForm(saved);
      setMsg({ ok: true, text: 'Spremljeno. Podaci se ispisuju na ponudi za plaćanje.' });
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message || 'Spremanje nije uspjelo.' });
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6"
        style={{ background: '#06161D', border: '1px solid rgba(120,220,255,0.15)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Postavke tvrtke</h2>
          <button onClick={onClose} aria-label="Zatvori" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        {loading ? (
          <p className="text-sm flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.6)' }}><Loader2 className="w-4 h-4 animate-spin" /> Učitavam…</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.45)' }}>Logo tvrtke</label>
              <div className="flex items-center gap-4">
                <div className="w-40 h-16 rounded-xl flex items-center justify-center overflow-hidden shrink-0" style={{ background: '#fff', border: '1px solid rgba(120,220,255,0.18)' }}>
                  {logo ? <img src={logo} alt="Logo tvrtke" className="max-w-full max-h-full object-contain p-2" /> : <span className="text-xs" style={{ color: '#7E939B' }}>Nema loga</span>}
                </div>
                <label className="px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer flex items-center gap-2" style={{ border: '1px solid rgba(120,220,255,0.3)', color: '#fff', opacity: logoBusy ? 0.6 : 1 }}>
                  {logoBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                  {logo ? 'Zamijeni' : 'Učitaj logo'}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" disabled={logoBusy}
                    onChange={e => { onLogo(e.target.files?.[0]); e.currentTarget.value = ''; }} />
                </label>
              </div>
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>PNG s prozirnom pozadinom izgleda najbolje. Logo se ispisuje u zaglavlju izvještaja i ponude.</p>
              {logoMsg && <p className="text-xs mt-2" style={{ color: logoMsg.ok ? '#2EE6A6' : '#FF8A80' }}>{logoMsg.text}</p>}
            </div>
            {field('companyName', 'Naziv tvrtke', 'Bazeni d.o.o.')}
            {field('oib', 'OIB', '12345678901')}
            {field('address', 'Adresa', 'Ulica i broj')}
            {field('city', 'Poštanski broj i mjesto', '10000 Zagreb')}
            {field('iban', 'IBAN', 'HR12 3456 7890 1234 5678 9')}
            {field('email', 'E-mail', 'info@tvrtka.hr', 'email')}
            {field('phone', 'Telefon', '+385 91 234 5678', 'tel')}
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Na ponudi se koristi model HR00, a poziv na broj se slaže iz godine i broja radnog naloga.
            </p>
            {msg && (
              <p className="text-sm p-3 rounded-xl" style={msg.ok
                ? { background: 'rgba(46,230,166,0.1)', border: '1px solid rgba(46,230,166,0.3)', color: '#2EE6A6' }
                : { background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)', color: '#FF8A80' }}>{msg.text}</p>
            )}
            <button onClick={save} disabled={saving}
              className="w-full py-3.5 rounded-xl font-bold text-black flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(90deg, #0ABFCF 0%, #5CE1E6 100%)', opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Spremi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

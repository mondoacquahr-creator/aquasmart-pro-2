import { useState } from 'react';
import { Mail, MessageCircle, Phone, Send, CheckCircle2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const CYAN = '#5CE1E6';
const ACCENT = 'linear-gradient(90deg, #7FDBFF 0%, #4FC3F0 45%, #1E88E5 100%)';
const SERVICES = ['Redovno održavanje', 'Otvaranje sezone', 'Zimovanje', 'Servis opreme', 'Zelena / mutna voda'];

const inputCls = 'w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:ring-2';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(120,220,255,0.15)' } as const;

// Upit za održavanje bazena: obrazac unutar sekcije, šalje se e-mailom Mondo Acqui.
export function MaintenanceInquiry() {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<string[]>([]);
  const [f, setF] = useState({ name: '', phone: '', email: '', location: '', pool: '', note: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const toggle = (s: string) => setServices(v => v.includes(s) ? v.filter(x => x !== s) : [...v, s]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = f.name.trim(), phone = f.phone.trim(), email = f.email.trim();
    if (!name || (!phone && !email)) { setState('err'); setMsg('Upišite ime te telefon ili e-mail.'); return; }
    setState('sending'); setMsg('');
    const note = [
      'ODRŽAVANJE BAZENA',
      services.length ? `Usluge: ${services.join(', ')}` : '',
      f.pool.trim() && `Bazen: ${f.pool.trim()}`,
      f.note.trim() && `Napomena: ${f.note.trim()}`,
      'Izvor: Mondo Pool Care',
    ].filter(Boolean).join('\n');
    try {
      const r = await fetch(`https://${projectId}.supabase.co/functions/v1/aquasmart-viz/visualize/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}`, apikey: publicAnonKey },
        body: JSON.stringify({ name, phone, email, location: f.location.trim(), note }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error(j.error || 'greška');
      setState('ok');
      setF({ name: '', phone: '', email: '', location: '', pool: '', note: '' });
      setServices([]);
    } catch {
      setState('err');
      setMsg('Slanje nije uspjelo. Pišite na info@mondo-acqua.hr ili nazovite +385 95 208 7321.');
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setState('idle'); }}
        className="px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2"
        style={{ background: ACCENT, color: '#0a0a0a', boxShadow: '0 6px 28px rgba(79,195,240,0.35)' }}
      >
        <Mail className="w-4 h-4" /> Zatražite ponudu za održavanje
      </button>
    );
  }

  if (state === 'ok') {
    return (
      <div className="rounded-2xl p-6 flex items-start gap-3" style={{ background: 'rgba(46,230,166,0.08)', border: '1px solid rgba(46,230,166,0.35)' }}>
        <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: '#2EE6A6' }} />
        <div>
          <p className="font-bold text-white">Hvala! Upit je poslan.</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>Javit ćemo vam se s ponudom za održavanje.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(2,13,18,0.45)', border: '1px solid rgba(120,220,255,0.15)' }}>
      <p className="font-bold text-white text-lg mb-1">Zatražite ponudu za održavanje</p>
      <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>Upit stiže na naš e-mail, javljamo se s ponudom.</p>

      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: CYAN }}>Što vam treba</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {SERVICES.map(s => {
          const on = services.includes(s);
          return (
            <button
              type="button" key={s} onClick={() => toggle(s)}
              className="px-3.5 py-2 rounded-full text-sm transition-all"
              style={on ? { background: '#4FC3F0', color: '#0a0a0a', fontWeight: 700 } : { border: '1px solid rgba(120,220,255,0.2)', color: 'rgba(255,255,255,0.8)' }}
            >{s}</button>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <input className={inputCls} style={inputStyle} placeholder="Ime i prezime *" value={f.name} onChange={set('name')} autoComplete="name" />
        <input className={inputCls} style={inputStyle} placeholder="Mjesto" value={f.location} onChange={set('location')} />
        <input className={inputCls} style={inputStyle} placeholder="Telefon" type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" />
        <input className={inputCls} style={inputStyle} placeholder="E-mail" type="email" value={f.email} onChange={set('email')} autoComplete="email" />
        <input className={`${inputCls} sm:col-span-2`} style={inputStyle} placeholder="Bazen (npr. 8 × 4 m, folija, elektroliza)" value={f.pool} onChange={set('pool')} />
      </div>
      <textarea className={inputCls} style={{ ...inputStyle, minHeight: 80 }} placeholder="Napomena" value={f.note} onChange={set('note')} />
      <p className="text-xs mt-2 mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>* Upišite ime te telefon ili e-mail.</p>

      {state === 'err' && <p className="text-sm mb-3" style={{ color: '#FF8A80' }}>{msg}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit" disabled={state === 'sending'}
          className="px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 disabled:opacity-60"
          style={{ background: ACCENT, color: '#0a0a0a' }}
        >
          <Send className="w-4 h-4" /> {state === 'sending' ? 'Šaljem…' : 'Pošalji upit'}
        </button>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>ili</span>
        <a
          href={`https://wa.me/385952087321?text=${encodeURIComponent('Pozdrav, zanima me ponuda za održavanje bazena.\nMjesto: \nVeličina bazena: ')}`}
          target="_blank" rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
          style={{ border: `1px solid ${CYAN}`, color: CYAN }}
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
        <a
          href="tel:+385952087321"
          className="px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
          style={{ border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}
        >
          <Phone className="w-4 h-4" /> +385 95 208 7321
        </a>
      </div>
    </form>
  );
}

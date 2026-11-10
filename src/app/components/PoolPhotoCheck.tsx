import React, { useRef, useState } from 'react';
import { Camera, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { T } from '../lib/theme';
import { api } from '../lib/supabase';
import { isMemberLoggedIn } from '../lib/memberApi';
import type { WaterAppearance } from '../lib/waterAnalysis';

// Fotografija bazena uz analizu: sprema se uz analizu (Mondo je vidi) i AI procijeni izgled vode.

interface Props {
  onChange: (appearance: WaterAppearance | null, photoPath: string | null) => void;
  onRegisterMember?: () => void;
}

const MAX_SIDE = 1280;

const CLARITY_LABEL: Record<string, string> = {
  clear: 'Bistra voda',
  slightly_cloudy: 'Blago mutna voda',
  cloudy: 'Mutna voda',
  green: 'Zelena voda',
};
const CLARITY_COLOR: Record<string, string> = {
  clear: '#2EE6A6',
  slightly_cloudy: '#FFB020',
  cloudy: '#FFB020',
  green: '#FF3B30',
};

function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * scale);
      c.height = Math.round(img.naturalHeight * scale);
      const ctx = c.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('canvas')); return; }
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
    img.src = url;
  });
}

export function PoolPhotoCheck({ onChange, onRegisterMember }: Props) {
  const member = isMemberLoggedIn();
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<WaterAppearance | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setError(''); setResult(null); setBusy(true);
    try {
      const dataUrl = await compress(file);
      setPreview(dataUrl);
      const res: any = await api.post('member/water-photo', { image: dataUrl });
      const appearance: WaterAppearance | null = res?.assessment || null;
      setResult(appearance);
      onChange(appearance, res?.path || null);
      if (!appearance) setError('Fotografija je spremljena, ali procjena trenutno nije uspjela. Mondo Acqua će je vidjeti uz analizu.');
      else if (appearance.isPool === false) setError('Na fotografiji se ne vidi voda u bazenu. Slikajte bazen odozgo, tako da se vidi voda i dno.');
    } catch (err: any) {
      setError(err?.message && /fotografij|Pokušajte/i.test(err.message) ? err.message : 'Fotografiju nije moguće poslati. Provjerite vezu i pokušajte ponovno.');
      onChange(null, null);
    }
    setBusy(false);
  };

  const remove = () => {
    setPreview(null); setResult(null); setError('');
    onChange(null, null);
  };

  const buttonStyle = { background: 'rgba(92,225,230,0.1)', border: '1px solid rgba(92,225,230,0.35)', color: '#5CE1E6' };

  if (!member) {
    return (
      <div>
        <button type="button" onClick={() => setShowInfo(!showInfo)} className="w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2" style={buttonStyle}>
          <Camera className="w-5 h-5" />
          Slikaj bazen (AI procjena vode)
        </button>
        {showInfo && (
          <div className="mt-2 rounded-2xl p-4 text-sm" style={{ background: T.cardBg, border: T.cardBorder }}>
            <p style={{ color: T.muted }}>
              Fotografija bazena dostupna je registriranim vlasnicima. AI procijeni je li voda bistra, mutna ili zelena i doda to u preporuke, a Mondo Acqua vidi fotografiju i može savjetovati na daljinu. Registracija je besplatna.
            </p>
            {onRegisterMember && (
              <button type="button" onClick={onRegisterMember} className="mt-3 w-full py-2.5 rounded-xl font-semibold" style={{ background: T.accent, color: '#020D12' }}>
                Besplatna registracija
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
      <input ref={galleryInput} type="file" accept="image/*" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />

      {!preview ? (
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button type="button" onClick={() => cameraInput.current?.click()} className="py-3 rounded-2xl font-semibold flex items-center justify-center gap-2" style={buttonStyle}>
            <Camera className="w-5 h-5" />
            Slikaj bazen (AI procjena vode)
          </button>
          <button type="button" onClick={() => galleryInput.current?.click()} aria-label="Fotografija iz galerije" className="px-4 rounded-2xl flex items-center justify-center" style={buttonStyle}>
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-3 flex gap-3 items-start" style={{ background: T.cardBg, border: T.cardBorder }}>
          <img src={preview} alt="Fotografija bazena" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {busy ? (
              <p className="text-sm flex items-center gap-2" style={{ color: T.muted }}>
                <Loader2 className="w-4 h-4 animate-spin" /> Procjenjujem vodu…
              </p>
            ) : result && result.isPool !== false ? (
              <>
                <p className="font-semibold text-sm" style={{ color: CLARITY_COLOR[result.clarity] || '#fff' }}>
                  {CLARITY_LABEL[result.clarity] || 'Procjena'}
                  {result.algae === 'visible' ? ' · vidljive alge' : result.algae === 'possible' ? ' · moguće alge' : ''}
                </p>
                {result.note && <p className="text-xs mt-1" style={{ color: T.muted }}>{result.note}</p>}
                <p className="text-xs mt-1" style={{ color: T.faint }}>Uključeno u preporuke. Fotografija se sprema uz analizu.</p>
              </>
            ) : null}
            {error && <p className="text-xs mt-1" style={{ color: '#FFB020' }}>{error}</p>}
          </div>
          {!busy && (
            <button type="button" onClick={remove} aria-label="Ukloni fotografiju" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 flex-shrink-0">
              <X className="w-4 h-4" style={{ color: T.faint }} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

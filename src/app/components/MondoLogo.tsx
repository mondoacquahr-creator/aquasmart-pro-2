// Logo Mondo Acqua (M/A, u kapi globus i orao). Znak je nacrtan za svijetlu podlogu,
// pa na tamnim zaglavljima stoji na bijeloj pločici.
export const MONDO_ZNAK = "/brand/mondo-acqua-znak.png";

export function MondoMark({ size = 40, radius }: { size?: number; radius?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center shrink-0 bg-white"
      style={{ width: size, height: size, borderRadius: radius ?? Math.round(size * 0.24), padding: Math.max(2, Math.round(size * 0.07)), boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}
    >
      <img src={MONDO_ZNAK} alt="" width={size} height={size} className="w-full h-full object-contain" draggable={false} />
    </span>
  );
}

export function MondoLogo({ size = 40, compact = false }: { size?: number; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <MondoMark size={size} />
      <div className="flex flex-col leading-none select-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <span style={{ fontWeight: 700, fontSize: compact ? 13 : 16, letterSpacing: '0.06em' }}><span className="text-white">MONDO </span><span style={{ color: '#4FC3F0' }}>ACQUA</span></span>
        <span style={{ fontWeight: 600, fontSize: compact ? 9 : 10.5, letterSpacing: '0.34em', color: 'rgba(255,255,255,0.85)', marginTop: 5 }}>POOL CARE</span>
      </div>
    </div>
  );
}

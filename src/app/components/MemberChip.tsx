import { User } from 'lucide-react';

// Ime prijavljenog člana (vlasnika bazena) pri vrhu stranice.
export function MemberChip({ name, onClick, label = 'Moj bazen' }: { name: string; onClick?: () => void; label?: string }) {
  const first = (name || '').trim().split(/\s+/)[0] || 'Član';
  const inner = (
    <>
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(150deg, #8AE6FF 0%, #1E6FC0 100%)' }}
      >
        <User className="w-4 h-4 text-white" />
      </span>
      <span className="flex flex-col leading-tight text-left min-w-0">
        <span className="text-sm font-semibold text-white truncate max-w-[9rem]">{first}</span>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
      </span>
    </>
  );
  const style = { border: '1px solid rgba(120,220,255,0.22)', background: 'rgba(10,40,52,0.55)' };
  return onClick ? (
    <button onClick={onClick} className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full transition-all hover:bg-white/10" style={style}>
      {inner}
    </button>
  ) : (
    <div className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full" style={style}>{inner}</div>
  );
}

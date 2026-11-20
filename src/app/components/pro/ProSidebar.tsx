import { FileText, Users, Waves, Warehouse, BarChart3, UserCog, Settings, Home } from 'lucide-react';

// Bočni izbornik Pro portala na računalu (kao na prikazu aplikacije na stranici mondo-acqua.hr/pro).
export type ProView = 'home' | 'work-orders' | 'clients' | 'warehouse' | 'employees' | 'analytics' | 'more';

const ITEMS: { id: ProView; label: string; icon: any }[] = [
  { id: 'home', label: 'Pregled', icon: Home },
  { id: 'work-orders', label: 'Radni nalozi', icon: FileText },
  { id: 'clients', label: 'Klijenti', icon: Users },
  { id: 'warehouse', label: 'Skladište', icon: Warehouse },
  { id: 'analytics', label: 'Izvještaji', icon: BarChart3 },
  { id: 'employees', label: 'Tim', icon: UserCog },
  { id: 'more', label: 'Postavke', icon: Settings },
];

export function ProSidebar({ current, onGo, companyName, counts }: {
  current: string; onGo: (v: ProView) => void; companyName?: string; counts?: Partial<Record<ProView, number>>;
}) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 z-20 flex-col py-6 px-4"
      style={{ background: 'rgba(2,13,18,0.82)', borderRight: '1px solid rgba(120,220,255,0.10)', backdropFilter: 'blur(14px)' }}>
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <span className="w-7 h-7 rounded-lg shrink-0" style={{ background: 'linear-gradient(145deg,#4FC3F0,#1B7F8C)' }} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-tight">Pool Care PRO</p>
          {companyName && <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{companyName}</p>}
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const on = current === id;
          return (
            <button key={id} type="button" onClick={() => onGo(id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors"
              style={on
                ? { background: 'rgba(79,195,240,0.14)', color: '#9FE6EC', fontWeight: 600 }
                : { color: 'rgba(255,255,255,0.62)' }}>
              <Icon className="w-4 h-4 shrink-0" style={{ color: on ? '#4FC3F0' : 'rgba(255,255,255,0.45)' }} />
              <span className="flex-1">{label}</span>
              {counts?.[id] ? <span className="text-[11px] px-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)' }}>{counts[id]}</span> : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

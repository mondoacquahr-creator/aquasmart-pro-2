import { Permissions } from '../lib/session';

interface Props {
  value: Permissions;
  onChange: (p: Permissions) => void;
}

const pillBase: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s',
  border: '1px solid rgba(255,255,255,0.08)',
};

const pillSelected: React.CSSProperties = {
  ...pillBase,
  background: 'rgba(92,225,230,0.18)',
  color: '#5CE1E6',
  border: '1px solid rgba(92,225,230,0.4)',
};

const pillUnselected: React.CSSProperties = {
  ...pillBase,
  background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.7)',
};

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" style={active ? pillSelected : pillUnselected} onClick={onClick}>
      {label}
    </button>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        background: on ? '#5CE1E6' : 'rgba(255,255,255,0.15)',
        position: 'relative',
        transition: 'background 0.2s',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          left: on ? '23px' : '3px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
        }}
      />
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(120,220,255,0.08)' }}>
      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>{children}</div>
    </div>
  );
}

export function EmployeePermissionsEditor({ value, onChange }: Props) {
  const set = <K extends keyof Permissions>(key: K, val: Permissions[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div>
      <Row label="Radni nalozi">
        <Pill label="Samo dodijeljeni" active={value.workOrders === 'own'} onClick={() => set('workOrders', 'own')} />
        <Pill label="Svi nalozi tvrtke" active={value.workOrders === 'all'} onClick={() => set('workOrders', 'all')} />
      </Row>

      <Row label="Otvaranje novih naloga">
        <Toggle on={value.createOrders} onToggle={() => set('createOrders', !value.createOrders)} />
      </Row>

      <Row label="Skladište">
        <Pill label="Bez pristupa" active={value.warehouse === 'none'} onClick={() => set('warehouse', 'none')} />
        <Pill label="Pregled" active={value.warehouse === 'view'} onClick={() => set('warehouse', 'view')} />
        <Pill label="Uređivanje" active={value.warehouse === 'edit'} onClick={() => set('warehouse', 'edit')} />
      </Row>

      <Row label="Klijenti">
        <Pill label="Bez pristupa" active={value.clients === 'none'} onClick={() => set('clients', 'none')} />
        <Pill label="Pregled" active={value.clients === 'view'} onClick={() => set('clients', 'view')} />
        <Pill label="Uređivanje" active={value.clients === 'edit'} onClick={() => set('clients', 'edit')} />
      </Row>

      <Row label="Cijene i računi">
        <Toggle on={value.prices} onToggle={() => set('prices', !value.prices)} />
      </Row>

      <Row label="Analiza vode">
        <Toggle on={value.waterAnalysis} onToggle={() => set('waterAnalysis', !value.waterAnalysis)} />
      </Row>

      <Row label="Vizualizator bazena">
        <Toggle on={value.visualizer} onToggle={() => set('visualizer', !value.visualizer)} />
      </Row>
    </div>
  );
}

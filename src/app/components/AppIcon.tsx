import type { ComponentType, CSSProperties } from 'react';

// Ikona u stilu ikone aplikacije: zaobljena pločica u bojama Mondo Acque,
// s mekim svjetlom odozgo, staklenim rubom i čistim bijelim simbolom.

type Tone = 'blue' | 'cyan' | 'green';

const TONES: Record<Tone, { bg: string; glow: string }> = {
  blue: { bg: 'linear-gradient(150deg, #3BA3F0 0%, #1E6FC0 45%, #0A3567 100%)', glow: 'rgba(79,195,240,0.45)' },
  cyan: { bg: 'linear-gradient(150deg, #8AE6FF 0%, #2BB3E6 45%, #0B5E8E 100%)', glow: 'rgba(127,219,255,0.5)' },
  green: { bg: 'linear-gradient(150deg, #7BF0C8 0%, #1FB58A 45%, #0B5E4A 100%)', glow: 'rgba(46,230,166,0.45)' },
};

interface AppIconProps {
  icon: ComponentType<{ className?: string; style?: CSSProperties; strokeWidth?: number }>;
  size?: number;
  tone?: Tone;
  badge?: string | number;
}

export function AppIcon({ icon: Icon, size = 72, tone = 'blue', badge }: AppIconProps) {
  const t = TONES[tone];
  const radius = Math.round(size * 0.27);
  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: t.bg,
        boxShadow: `0 ${Math.round(size * 0.14)}px ${Math.round(size * 0.4)}px -${Math.round(size * 0.12)}px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -${Math.round(size * 0.06)}px ${Math.round(size * 0.14)}px rgba(0,20,50,0.35)`,
        border: '1px solid rgba(255,255,255,0.18)',
      }}
      aria-hidden="true"
    >
      {/* svjetlo odozgo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: radius,
          background: 'radial-gradient(120% 70% at 30% 0%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 60%)',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon
          strokeWidth={1.7}
          style={{
            width: size * 0.48,
            height: size * 0.48,
            color: '#FFFFFF',
            filter: 'drop-shadow(0 2px 4px rgba(0,25,60,0.45))',
          }}
        />
      </div>
      {badge !== undefined && (
        <div
          className="absolute flex items-center justify-center font-bold"
          style={{
            top: -6,
            right: -6,
            width: Math.max(22, size * 0.32),
            height: Math.max(22, size * 0.32),
            borderRadius: 999,
            background: '#FFFFFF',
            color: '#0A3567',
            fontSize: Math.max(11, size * 0.16),
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}

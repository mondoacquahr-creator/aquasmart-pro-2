import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`relative bg-slate-900/80 rounded-3xl border-2 border-amber-500/20 shadow-2xl shadow-amber-500/10 ${className}`}
    >
      {children}
    </div>
  );
}
import React from 'react';

export const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
      {children}
    </p>
  );
}

export function StatCard({
  label, value, sub, accent, color,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  color?: string;
}) {
  return (
    <div className="p-5 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <Label>{label}</Label>
      <p className="text-2xl font-black" style={{ fontFamily: 'Montserrat', color: accent ? 'var(--gold)' : color ?? 'white' }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  );
}

export function GoldInput({
  label, value, onChange, suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <Label>{label}{suffix ? ` (${suffix})` : ''}</Label>
      <input
        type="number"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      />
    </div>
  );
}

export function ProgressDots({
  step, totalSteps, variant = 'gold',
}: {
  step: number;
  totalSteps: number;
  variant?: 'gold' | 'alert';
}) {
  const activeColor = variant === 'gold' ? 'var(--gold)' : 'var(--alert)';
  const inactiveColor = variant === 'gold' ? 'rgba(193,177,118,0.2)' : 'rgba(204,51,102,0.2)';
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-500"
          style={{
            width: i === step - 1 ? 24 : 8,
            height: 8,
            background: i < step || i === step - 1 ? activeColor : inactiveColor,
          }}
        />
      ))}
    </div>
  );
}

export function StepHeader({
  step, totalSteps, title, subtitle, variant = 'gold',
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  variant?: 'gold' | 'alert';
}) {
  const color = variant === 'gold' ? 'var(--gold)' : 'var(--alert)';
  return (
    <div className="mb-2">
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color }}>
        Etapa {step} de {totalSteps}
      </p>
      <h2 className="text-2xl md:text-3xl font-black text-white mb-2" style={{ fontFamily: 'Montserrat' }}>
        {title}
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
    </div>
  );
}

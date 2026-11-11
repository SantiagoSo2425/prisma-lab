import React, { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Sparkles } from 'lucide-react';

/* ================================================================== */
/* Sistema de diseño compartido estilo Apple para PRISMA-Lab          */
/* ================================================================== */

export const inputCls =
  'w-full rounded-xl bg-[#f5f5f7] px-4 py-3 text-[15px] text-neutral-900 placeholder:text-neutral-400 border border-transparent focus:bg-white focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/15 focus:outline-none transition';

export const monoInputCls = `${inputCls} font-mono text-[13px] leading-relaxed`;

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ModuleHero({
  eyebrow,
  title,
  subtitle,
  accent = 'text-[#0071e3]',
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="text-center pt-10 pb-12 md:pt-16 md:pb-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-sm md:text-base font-semibold ${accent}`}
      >
        {eyebrow}
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="text-5xl md:text-7xl font-semibold tracking-tighter text-neutral-900 mt-2"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-xl md:text-2xl text-neutral-500 mt-4 max-w-2xl mx-auto leading-snug"
        >
          {subtitle}
        </motion.p>
      )}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-8"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

export function Section({
  eyebrow,
  title,
  subtitle,
  right,
  children,
  className = '',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={`mb-20 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="max-w-2xl">
          {eyebrow && <div className="text-sm font-semibold text-neutral-400 mb-1">{eyebrow}</div>}
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">{title}</h2>
          {subtitle && <p className="text-lg text-neutral-500 mt-2 leading-snug">{subtitle}</p>}
        </div>
        {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
      </div>
      {children}
    </Reveal>
  );
}

export function Card({
  children,
  className = '',
  onClick,
  role,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  role?: string;
}) {
  return (
    <div
      onClick={onClick}
      role={role}
      className={`bg-white rounded-[28px] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_40px_rgba(0,0,0,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  className = '',
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark' | 'success';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const styles: Record<string, string> = {
    primary: 'bg-[#0071e3] hover:bg-[#0077ed] text-white',
    secondary: 'bg-black/[0.05] hover:bg-black/[0.08] text-neutral-900',
    ghost: 'text-[#0071e3] hover:bg-[#0071e3]/5',
    dark: 'bg-neutral-900 hover:bg-neutral-800 text-white',
    success: 'bg-[#34c759] hover:bg-[#30b955] text-white',
  };
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function Chip({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'blue' | 'green' | 'red' | 'orange' | 'purple';
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-black/[0.05] text-neutral-600',
    blue: 'bg-[#0071e3]/10 text-[#0071e3]',
    green: 'bg-[#34c759]/12 text-[#248a3d]',
    red: 'bg-[#ff3b30]/10 text-[#d70015]',
    orange: 'bg-[#ff9500]/12 text-[#c93400]',
    purple: 'bg-[#af52de]/10 text-[#8944ab]',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-left"
    >
      <span className={`relative shrink-0 w-[51px] h-[31px] rounded-full transition-colors ${checked ? 'bg-[#34c759]' : 'bg-neutral-200'}`}>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 35 }}
          className="absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-md"
          style={{ left: checked ? 22 : 2 }}
        />
      </span>
      {label && <span className="text-[15px] text-neutral-800">{label}</span>}
    </button>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
  ariaLabel,
}: {
  options: Array<{ value: T; label: React.ReactNode }>;
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  /** Nombre accesible del grupo de opciones (lectores de pantalla). */
  ariaLabel?: string;
}) {
  const id = useId();
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex flex-wrap items-center rounded-full bg-black/[0.05] p-1 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`relative rounded-full font-medium transition-colors ${
              size === 'sm' ? 'px-3 py-1 text-[12px]' : 'px-4 py-1.5 text-[13px]'
            } ${active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'}`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-white shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 34 }}
              />
            )}
            <span className="relative whitespace-nowrap">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Ring({
  value,
  max,
  size = 120,
  stroke = 12,
  color = '#0071e3',
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true" focusable="false">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - pct) }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[13px] font-medium text-neutral-500 mb-1.5 ml-1">{label}</span>
      {children}
      {hint && <span className="block text-[12px] mt-1.5 ml-1">{hint}</span>}
    </label>
  );
}

export function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-[12px] font-bold text-white shrink-0 ${
        ok ? 'bg-[#34c759]' : 'bg-[#ff3b30]'
      }`}
    >
      {ok ? '✓' : '!'}
    </span>
  );
}

/**
 * Cápsula interactiva estilo Apple "Aprender más +" (Micro-enseñanza bajo demanda)
 * Mantiene la vista minimalista y despliega explicación visual, ejemplos e intuición al tocarla.
 */
export function LearnMoreCapsule({
  raCode,
  raText,
  duration = '10 min',
  buttonLabel = 'Aprender la teoría en 60 segundos',
  children,
}: {
  raCode: string;
  raText: string;
  duration?: string;
  buttonLabel?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto mb-12">
      {/* Píldora compacta de Resultado de Aprendizaje + Botón Apple "+" */}
      <div className="rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.05)] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-left pl-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0071e3]/10 text-[#0071e3]">
            {raCode} · {duration}
          </span>
          <span className="text-[13px] text-neutral-700 font-medium">
            {raText}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
            open
              ? 'bg-neutral-900 text-white'
              : 'bg-[#0071e3] text-white hover:bg-[#0077ed]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{open ? 'Cerrar guía' : buttonLabel}</span>
          {open ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Panel visual desplegable */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-[28px] bg-neutral-900 text-white p-7 md:p-8 shadow-xl text-left">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

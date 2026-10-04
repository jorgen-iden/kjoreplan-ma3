import type { ButtonHTMLAttributes, ReactNode } from 'react';

/** Shared building blocks for the design system. Colours and fonts come from the tokens in globals.css. */

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent-soft';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent font-bold hover:bg-accent-strong',
  secondary: 'border border-line bg-card text-subtle font-semibold hover:border-muted hover:text-ink',
  ghost: 'text-muted font-semibold hover:text-ink hover:bg-line-soft',
  'accent-soft': 'border border-accent-line bg-accent-soft text-accent font-semibold hover:border-accent',
};

const SIZES: Record<Size, string> = {
  sm: 'min-h-8 rounded-lg px-3 text-xs',
  md: 'min-h-11 rounded-lg px-4 text-sm',
  lg: 'min-h-13 rounded-xl px-6 text-base',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner, disables the button and sets aria-busy. */
  loading?: boolean;
}

export function Button({ variant = 'secondary', size = 'md', loading = false, disabled, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 transition duration-150 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function Spinner({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PageHeader({ title, lead, action }: { title: ReactNode; lead?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{title}</h1>
        {lead && <p className="mt-2 text-base text-muted">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' }) {
  return <Tag className={`rounded-2xl border border-line bg-card ${className}`}>{children}</Tag>;
}

export function Notice({ kind, children, action }: { kind: 'info' | 'warn' | 'error'; children: ReactNode; action?: ReactNode }) {
  const styles = {
    info: 'bg-accent-soft text-accent-strong',
    warn: 'bg-warn-soft text-warn',
    error: 'bg-danger-soft text-danger',
  };
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ${styles[kind]}`}>
      <p>{children}</p>
      {action}
    </div>
  );
}

/** Placeholder block for skeleton loaders. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-md bg-line-soft ${className}`} />;
}

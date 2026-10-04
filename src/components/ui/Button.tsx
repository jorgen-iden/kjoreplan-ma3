import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent-soft';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 transition duration-200 ease-out-quint active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent font-bold text-on-accent hover:bg-accent-strong',
  secondary: 'border border-line bg-card font-semibold text-subtle hover:border-muted hover:text-ink',
  ghost: 'font-semibold text-muted hover:bg-line-soft hover:text-ink',
  'accent-soft': 'border border-accent-line bg-accent-soft font-semibold text-accent hover:border-accent',
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

/** The one button of the design system: default, hover, focus-visible, active, disabled and loading states. */
export function Button({ variant = 'secondary', size = 'md', loading = false, disabled, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

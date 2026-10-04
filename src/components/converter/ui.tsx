import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function PrimaryButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-[52px] items-center justify-center rounded-xl bg-accent px-6 text-base font-bold text-on-accent hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}

export function SecondaryButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-card px-4 text-sm font-semibold text-subtle hover:border-muted ${className}`}
    />
  );
}

export function StepHeader({ title, lead, action }: { title: ReactNode; lead?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-[40px]">{title}</h1>
        {lead && <p className="mt-2.5 text-base text-muted">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-card ${className}`}>{children}</div>;
}

export function Notice({ kind, children }: { kind: 'info' | 'warn' | 'error'; children: ReactNode }) {
  const styles = {
    info: 'bg-accent-soft text-accent-strong',
    warn: 'bg-warn-soft text-warn',
    error: 'bg-danger-soft text-danger',
  };
  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm ${styles[kind]}`}>
      {children}
    </p>
  );
}

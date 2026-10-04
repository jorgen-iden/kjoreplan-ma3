import type { ReactNode } from 'react';

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

import type { ReactNode } from 'react';

/** Friendly "nothing here" panel for empty lists and tables, with room for actions. */
export function EmptyState({ title, lead, icon, children }: { title: string; lead: string; icon?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="mb-4 text-muted" aria-hidden="true">
        {icon ?? (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 9h10M7 13h6" />
          </svg>
        )}
      </span>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 max-w-sm text-muted">{lead}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

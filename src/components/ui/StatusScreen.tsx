import type { ReactNode } from 'react';

/** Full-page message used by the 404 and error pages. */
export function StatusScreen({ code, title, lead, children }: { code?: string; title: string; lead: string; children: ReactNode }) {
  return (
    <main id="main" className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
      {code && <p className="font-mono text-sm font-semibold tracking-widest text-accent">{code}</p>}
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-md text-lg text-muted">{lead}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
    </main>
  );
}

/** Link styled like the primary/secondary buttons. */
export const LINK_PRIMARY =
  'inline-flex min-h-13 items-center justify-center rounded-xl bg-accent px-6 font-bold text-on-accent no-underline transition duration-300 ease-out-back hover:scale-105 hover:bg-accent-strong active:scale-95';
export const LINK_SECONDARY =
  'inline-flex min-h-13 items-center justify-center rounded-xl border border-line bg-card px-6 font-semibold text-subtle no-underline transition duration-150 hover:border-muted hover:text-ink active:scale-[0.98]';

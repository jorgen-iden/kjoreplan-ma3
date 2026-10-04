import type { ReactNode } from 'react';

/** Title, lead and the step's main action. On phones the action lives in the converter's bottom bar instead. */
export function PageHeader({ title, lead, action }: { title: ReactNode; lead?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{title}</h1>
        {lead && <p className="mt-2 text-base text-muted">{lead}</p>}
      </div>
      {action && <div className="hidden sm:block">{action}</div>}
    </div>
  );
}

import { Skeleton } from './Skeleton';

/** Generic page placeholder for route-level loading.tsx files: header line, title, lead and a card. */
export function PageSkeleton({ label, rows = 6 }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-6xl px-5 pb-16 pt-5 sm:px-8">
      <span className="sr-only">{label}</span>
      <div className="mb-10 flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="mb-7 flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="mb-3 h-10 w-2/3 max-w-xl" />
      <Skeleton className="mb-8 h-5 w-1/2 max-w-md" />
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-6">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="grid grid-cols-[3rem_4rem_minmax(0,1fr)] gap-4">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className={`h-4 ${i % 2 ? 'w-2/3' : 'w-5/6'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

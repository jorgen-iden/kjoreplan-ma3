/** Placeholder block for skeleton loaders. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-soft-pulse rounded-md bg-line-soft ${className}`} />;
}


import type { ReactNode } from 'react';

export function Card({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' }) {
  return <Tag className={`rounded-2xl border border-line bg-card ${className}`}>{children}</Tag>;
}

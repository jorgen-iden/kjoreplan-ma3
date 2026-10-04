import type { ReactNode } from 'react';
import { InteractiveGlow } from './InteractiveGlow';

/** Surface for grouped content. `glow` adds the mouse-following accent glow on hover. */
export function Card({
  children,
  className = '',
  as: Tag = 'div',
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
  glow?: boolean;
}) {
  const classes = `rounded-2xl border border-line bg-card ${className}`;
  if (glow) {
    return (
      <InteractiveGlow as={Tag} className={classes}>
        {children}
      </InteractiveGlow>
    );
  }
  return <Tag className={classes}>{children}</Tag>;
}

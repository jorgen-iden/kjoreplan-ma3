'use client';

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';

/**
 * True on devices with a precise pointer that can hover (a mouse or trackpad). Laptops with a touch
 * screen still count, phones and tablets don't. Re-checks when the input changes.
 */
function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const update = () => setFine(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return fine;
}

type Tag = 'div' | 'section' | 'article';

export interface InteractiveGlowProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: Tag;
}

/**
 * A soft accent glow that follows the mouse while hovering. The glow sits behind the content
 * (isolate + negative z-index), so it adds no wrapper and doesn't affect layout. Off on touch
 * devices and with reduced motion.
 */
export function InteractiveGlow({ children, className = '', as: Element = 'div', ...props }: InteractiveGlowProps) {
  const ref = useRef<HTMLElement | null>(null);
  const enabled = useFinePointer();

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    // One style write per frame, however fast the mouse moves.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = el.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);
      });
    };
    el.addEventListener('pointermove', onMove);
    return () => {
      el.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return (
    <Element ref={(node: HTMLElement | null) => void (ref.current = node)} {...props} className={`group/glow relative isolate ${className}`}>
      {enabled && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px -z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/glow:opacity-100"
          style={{
            background:
              'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), color-mix(in oklab, var(--color-accent) 8%, transparent), transparent 80%)',
          }}
        />
      )}
      {children}
    </Element>
  );
}

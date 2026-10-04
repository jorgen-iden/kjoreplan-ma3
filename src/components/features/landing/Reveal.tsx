'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Fades its content in when it scrolls into view, once. Sets data-shown on itself, so children can
 * animate with group-data-[shown]: utilities (e.g. the faders in the steps band).
 * Without JavaScript or with reduced motion, the content is simply shown.
 */
export function Reveal({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-shown={shown || undefined}
      className={`group transition duration-700 ease-out-quint motion-safe:[&:not([data-shown])]:translate-y-6 motion-safe:[&:not([data-shown])]:opacity-0 ${className}`}
    >
      {children}
    </Tag>
  );
}

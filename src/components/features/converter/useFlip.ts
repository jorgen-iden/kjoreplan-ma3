'use client';

import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';

const DURATION = 260;
// Same curve as the ease-out-quint token in globals.css.
const EASING = 'cubic-bezier(0.23, 1, 0.32, 1)';

/**
 * Slides list items to their new place when the order changes (FLIP: first, last, invert, play).
 * Call `capture()` right before a state change that reorders the items; the next render then
 * animates every `[data-flip-id]` child from where it was on screen to where it lands. Capturing
 * the on-screen position (not the layout position) keeps rapid changes, like dragging, smooth.
 */
export function useFlip(list: RefObject<HTMLElement | null>) {
  const before = useRef<Map<string, number> | null>(null);

  const capture = useCallback(() => {
    const root = list.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tops = new Map<string, number>();
    for (const el of root.querySelectorAll<HTMLElement>('[data-flip-id]')) {
      tops.set(el.dataset.flipId!, el.getBoundingClientRect().top);
    }
    before.current = tops;
  }, [list]);

  useLayoutEffect(() => {
    const tops = before.current;
    const root = list.current;
    if (!tops || !root) return;
    before.current = null;
    for (const el of root.querySelectorAll<HTMLElement>('[data-flip-id]')) {
      const from = tops.get(el.dataset.flipId!);
      for (const a of el.getAnimations()) a.cancel();
      if (from === undefined) continue;
      const dy = from - el.getBoundingClientRect().top;
      if (Math.abs(dy) < 1) continue;
      el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }], { duration: DURATION, easing: EASING });
    }
  });

  return capture;
}

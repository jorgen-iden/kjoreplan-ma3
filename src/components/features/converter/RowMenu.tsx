'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

const MENU_WIDTH = 176;
const MENU_HEIGHT = 140;

/**
 * "⋯" menu for a cue row. The menu is fixed-positioned next to its button so the table's scroll
 * box can't clip it, and follows the button when the page scrolls.
 */
export function RowMenu({ onMove, onRemove }: { onMove: (dir: -1 | 1) => void; onRemove: () => void }) {
  const t = useTranslations('review');
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const firstItem = useRef<HTMLButtonElement>(null);
  const open = pos !== null;

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = button.current?.getBoundingClientRect();
      if (!r) return;
      const top = r.bottom + MENU_HEIGHT + 8 > window.innerHeight ? r.top - MENU_HEIGHT - 4 : r.bottom + 4;
      setPos({ top, left: Math.max(8, r.right - MENU_WIDTH) });
    };
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setPos(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPos(null);
        button.current?.focus();
      }
    };
    firstItem.current?.focus();
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  const toggle = () => {
    if (open) return setPos(null);
    const r = button.current!.getBoundingClientRect();
    const top = r.bottom + MENU_HEIGHT + 8 > window.innerHeight ? r.top - MENU_HEIGHT - 4 : r.bottom + 4;
    setPos({ top, left: Math.max(8, r.right - MENU_WIDTH) });
  };

  const items: { label: string; run: () => void; danger?: boolean }[] = [
    { label: t('moveUp'), run: () => onMove(-1) },
    { label: t('moveDown'), run: () => onMove(1) },
    { label: t('delete'), run: onRemove, danger: true },
  ];

  return (
    <div ref={root}>
      <button
        ref={button}
        type="button"
        aria-label={t('more')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className={`size-8 rounded-lg border bg-card text-subtle transition-colors duration-150 hover:border-muted hover:text-ink active:bg-line-soft ${
          open ? 'border-muted' : 'border-line'
        }`}
      >
        ⋯
      </button>
      {pos && (
        <div
          role="menu"
          style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
          className="fixed z-20 origin-top-right animate-pop-in overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg"
        >
          {items.map((item, i) => (
            <button
              key={item.label}
              ref={i === 0 ? firstItem : undefined}
              type="button"
              role="menuitem"
              onClick={() => {
                item.run();
                setPos(null);
              }}
              className={`block min-h-10 w-full px-4 text-left text-sm transition-colors hover:bg-line-soft focus:bg-line-soft focus:outline-none ${
                item.danger ? 'text-danger' : 'text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

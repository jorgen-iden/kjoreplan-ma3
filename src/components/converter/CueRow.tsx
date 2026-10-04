'use client';

import { useTranslations } from 'next-intl';
import { memo, useState } from 'react';
import type { Cue } from '@/lib/cues';
import type { MacroCue } from '@/lib/ma3/macro';
import { MAX_NAME_LENGTH } from '@/lib/ma3/sanitize';
import { Button } from '../ui';
import { RowMenu } from './RowMenu';

/**
 * Column layout shared by the header and every row. On phones a row wraps: handle, number, name
 * and menu on the first line, time and note below the name. From md up it is one line per cue.
 */
export const ROW_GRID =
  'grid grid-cols-[1.5rem_3rem_minmax(0,1fr)_auto] items-start gap-x-2 gap-y-1 md:grid-cols-[1.75rem_4rem_minmax(0,1fr)_5rem_minmax(0,0.9fr)_7rem]';

const FIELD =
  'w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-ink transition-colors duration-150 placeholder:text-muted hover:border-line focus:border-accent focus:bg-card focus:outline-none aria-[invalid=true]:border-danger';

const TIME_RE = /^\d{1,2}[:.]\d{2}$/;

export interface CueRowProps {
  cue: Cue;
  prepared: MacroCue;
  dragging: boolean;
  dropTarget: boolean;
  onChange: (id: string, patch: Partial<Cue>) => void;
  onSplit: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onRemove: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
}

export const CueRow = memo(function CueRow({
  cue,
  prepared,
  dragging,
  dropTarget,
  onChange,
  onSplit,
  onMove,
  onRemove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: CueRowProps) {
  const t = useTranslations('review');
  const isSub = Boolean(cue.parentId);
  // Only the handle starts a drag, so selecting text in the inputs still works.
  const [armed, setArmed] = useState(false);
  const timeInvalid = cue.time.trim() !== '' && !TIME_RE.test(cue.time.trim());
  const id = cue.id;

  return (
    <li
      draggable={armed}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(id);
      }}
      onDragEnd={() => {
        setArmed(false);
        onDragEnd();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(id);
      }}
      className={`${ROW_GRID} border-b border-line-soft px-3 py-3 transition-[opacity,background-color,box-shadow] duration-150 md:px-4 md:py-2 ${
        prepared.truncated ? 'bg-warn-soft' : isSub ? '' : 'hover:bg-paper/60'
      } ${dragging ? 'opacity-40' : ''} ${dropTarget ? 'shadow-[inset_0_2px_0_var(--color-accent)]' : ''}`}
    >
      <span className="flex h-9 items-center justify-center">
        {!isSub && (
          <span
            role="img"
            aria-label={t('drag')}
            title={t('drag')}
            onPointerDown={() => setArmed(true)}
            onPointerUp={() => setArmed(false)}
            className="cursor-grab touch-none text-muted transition-colors hover:text-ink active:cursor-grabbing"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="9" cy="6" r="1.6" />
              <circle cx="15" cy="6" r="1.6" />
              <circle cx="9" cy="12" r="1.6" />
              <circle cx="15" cy="12" r="1.6" />
              <circle cx="9" cy="18" r="1.6" />
              <circle cx="15" cy="18" r="1.6" />
            </svg>
          </span>
        )}
      </span>

      <span className={`flex h-9 items-center font-mono text-sm font-semibold ${isSub ? 'pl-3 text-muted' : 'text-ink'}`}>{prepared.number}</span>

      <span className={`flex min-w-0 flex-col ${isSub ? 'md:pl-5' : ''}`}>
        <input
          aria-label={`${t('name')} ${prepared.number}`}
          value={cue.name}
          aria-invalid={!cue.name.trim() || undefined}
          onChange={(e) => onChange(id, { name: e.target.value })}
          className={`${FIELD} font-medium`}
        />
        {!cue.name.trim() && <span className="px-2 text-xs text-danger">{t('emptyName')}</span>}
        {prepared.truncated && <span className="px-2 text-xs text-warn">{t('truncated', { max: MAX_NAME_LENGTH })}</span>}
      </span>

      <span className="col-start-3 order-5 flex flex-col md:order-none md:col-start-auto">
        <input
          aria-label={`${t('time')} ${prepared.number}`}
          placeholder={t('time')}
          inputMode="numeric"
          value={cue.time}
          aria-invalid={timeInvalid || undefined}
          onChange={(e) => onChange(id, { time: e.target.value })}
          className={`${FIELD} font-mono text-sm text-subtle`}
        />
        {timeInvalid && <span className="px-2 text-xs text-danger">{t('timeInvalid')}</span>}
      </span>

      <span className="col-span-2 col-start-3 order-6 md:order-none md:col-span-1 md:col-start-auto">
        <textarea
          aria-label={`${t('note')} ${prepared.number}`}
          placeholder={t('note')}
          value={cue.note}
          rows={Math.min(4, cue.note.split('\n').length)}
          onChange={(e) => onChange(id, { note: e.target.value })}
          className={`${FIELD} resize-none text-sm text-muted`}
        />
      </span>

      <span className="order-4 flex h-9 items-center justify-end gap-1.5 md:order-none">
        {!isSub && cue.note.trim() && (
          <Button variant="accent-soft" size="sm" title={t('splitHint')} onClick={() => onSplit(id)}>
            {t('split')}
          </Button>
        )}
        <RowMenu onMove={(dir) => onMove(id, dir)} onRemove={() => onRemove(id)} />
      </span>
    </li>
  );
});

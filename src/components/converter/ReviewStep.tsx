'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { moveCue, moveCueBefore, newId, removeCue, splitIntoSubCues, type Cue } from '@/lib/cues';
import { prepareCues, type MacroCue } from '@/lib/ma3/macro';
import { MAX_NAME_LENGTH } from '@/lib/ma3/sanitize';
import type { Settings } from '@/lib/settings';
import type { Notice as NoticeData } from './state';
import { Notice, PrimaryButton, StepHeader } from './ui';

const GRID = 'grid grid-cols-[28px_64px_minmax(0,1fr)_80px_minmax(0,0.9fr)_112px] items-start gap-x-2';
const FIELD =
  'w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-ink hover:border-line focus:border-accent focus:bg-card focus:outline-none';

export function ReviewStep({
  title,
  items,
  cues,
  settings,
  notice,
  onCues,
  onNext,
}: {
  title: string;
  items: number;
  cues: Cue[];
  settings: Settings;
  notice: NoticeData | null;
  onCues: (cues: Cue[]) => void;
  onNext: () => void;
}) {
  const t = useTranslations('review');
  const tUpload = useTranslations('upload');
  const prepared = prepareCues(cues, settings);
  const byId = new Map(prepared.cues.map((c) => [c.id, c]));
  const truncated = prepared.cues.filter((c) => c.truncated).length;

  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<Cue>) => onCues(cues.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <section>
      <StepHeader
        title={title || '—'}
        lead={t('lead', { cues: cues.length, items })}
        action={<PrimaryButton onClick={onNext}>{t('continue')}</PrimaryButton>}
      />

      <div className="mb-5 flex flex-col gap-3 empty:hidden">
        {notice?.key === 'linesMode' && <Notice kind="warn">{tUpload('linesMode')}</Notice>}
        {prepared.numberingFellBack && <Notice kind="warn">{t('numberingFellBack')}</Notice>}
        {truncated > 0 && <Notice kind="warn">{t('truncatedSummary', { count: truncated, max: MAX_NAME_LENGTH })}</Notice>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card">
        <div className="min-w-[760px]">
          <div className={`${GRID} border-b border-line-soft px-4 py-3.5 text-[13px] font-semibold text-muted`}>
            <span />
            <span>{t('cue')}</span>
            <span className="px-2">{t('name')}</span>
            <span className="px-2">{t('time')}</span>
            <span className="px-2">{t('note')}</span>
            <span className="sr-only">{t('actions')}</span>
          </div>

          {cues.map((cue) => (
            <Row
              key={cue.id}
              cue={cue}
              prepared={byId.get(cue.id)!}
              dragging={dragId === cue.id}
              dropTarget={overId === cue.id && dragId !== null && dragId !== cue.id}
              onChange={(patch) => update(cue.id, patch)}
              onSplit={() => onCues(splitIntoSubCues(cues, cue.id))}
              onMove={(dir) => onCues(moveCue(cues, cue.id, dir))}
              onRemove={() => onCues(removeCue(cues, cue.id))}
              onDragStart={() => setDragId(cue.id)}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              onDragOver={() => dragId && setOverId(cue.id)}
              onDrop={() => {
                if (dragId && dragId !== cue.id) onCues(moveCueBefore(cues, dragId, cue.id));
                setDragId(null);
                setOverId(null);
              }}
            />
          ))}

          <div className="px-4 py-3.5">
            <button
              type="button"
              onClick={() => onCues([...cues, { id: newId(), srcNumber: '', name: '', time: '', duration: '', note: '' }])}
              className="min-h-10 rounded-lg border border-dashed border-line px-3.5 text-sm text-subtle hover:border-muted"
            >
              {t('addCue')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({
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
}: {
  cue: Cue;
  prepared: MacroCue;
  dragging: boolean;
  dropTarget: boolean;
  onChange: (patch: Partial<Cue>) => void;
  onSplit: () => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;
}) {
  const t = useTranslations('review');
  const isSub = Boolean(cue.parentId);
  // Only the handle starts a drag, so selecting text in the inputs still works.
  const [armed, setArmed] = useState(false);
  const noteLines = cue.note.split('\n').length;

  return (
    <div
      draggable={armed}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={() => {
        setArmed(false);
        onDragEnd();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={`${GRID} border-b border-line-soft px-4 py-2 ${prepared.truncated ? 'bg-warn-soft' : ''} ${
        dragging ? 'opacity-40' : ''
      } ${dropTarget ? 'shadow-[inset_0_2px_0_var(--color-accent)]' : ''}`}
    >
      <span className="flex h-9 items-center justify-center">
        {!isSub && (
          <span
            role="img"
            aria-label={t('drag')}
            title={t('drag')}
            onPointerDown={() => setArmed(true)}
            onPointerUp={() => setArmed(false)}
            className="cursor-grab text-muted hover:text-ink active:cursor-grabbing"
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

      <span className={`flex h-9 items-center font-mono text-sm font-semibold ${isSub ? 'pl-3 text-muted' : 'text-ink'}`}>
        {prepared.number}
      </span>

      <span className={`flex flex-col ${isSub ? 'pl-5' : ''}`}>
        <label>
          <span className="sr-only">{t('name')}</span>
          <input value={cue.name} onChange={(e) => onChange({ name: e.target.value })} className={`${FIELD} font-medium`} />
        </label>
        {!cue.name.trim() && <span className="px-2 text-xs text-danger">{t('emptyName')}</span>}
        {prepared.truncated && <span className="px-2 text-xs text-warn">{t('truncated', { max: MAX_NAME_LENGTH })}</span>}
      </span>

      <label>
        <span className="sr-only">{t('time')}</span>
        <input value={cue.time} onChange={(e) => onChange({ time: e.target.value })} className={`${FIELD} font-mono text-sm text-subtle`} />
      </label>

      <label>
        <span className="sr-only">{t('note')}</span>
        <textarea
          value={cue.note}
          rows={Math.min(4, noteLines)}
          onChange={(e) => onChange({ note: e.target.value })}
          className={`${FIELD} resize-none text-sm text-muted`}
        />
      </label>

      <span className="flex h-9 items-center justify-end gap-1.5">
        {!isSub && cue.note.trim() && (
          <button
            type="button"
            title={t('splitHint')}
            onClick={onSplit}
            className="h-8 rounded-lg border border-accent-line bg-accent-soft px-3 text-[13px] font-semibold text-accent"
          >
            {t('split')}
          </button>
        )}
        <RowMenu onMove={onMove} onRemove={onRemove} />
      </span>
    </div>
  );
}

function RowMenu({ onMove, onRemove }: { onMove: (dir: -1 | 1) => void; onRemove: () => void }) {
  const t = useTranslations('review');
  // Fixed position next to the button, so the table's scroll box can't clip the menu. It follows
  // the button when the page scrolls.
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const open = pos !== null;

  const place = () => {
    const r = button.current?.getBoundingClientRect();
    if (!r) return;
    const menuHeight = 140;
    const top = r.bottom + menuHeight + 8 > window.innerHeight ? r.top - menuHeight - 4 : r.bottom + 4;
    setPos({ top, left: Math.max(8, r.right - 176) });
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !root.current?.contains(e.target as Node)) setPos(null);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  const item = (label: string, action: () => void, danger = false) => (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        action();
        setPos(null);
      }}
      className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-line-soft ${danger ? 'text-danger' : 'text-ink'}`}
    >
      {label}
    </button>
  );

  return (
    <div ref={root}>
      <button
        ref={button}
        type="button"
        aria-label={t('more')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? setPos(null) : place())}
        className="size-8 rounded-lg border border-line bg-card text-subtle hover:border-muted"
      >
        ⋯
      </button>
      {pos && (
        <div
          role="menu"
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-20 w-44 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg"
        >
          {item(t('moveUp'), () => onMove(-1))}
          {item(t('moveDown'), () => onMove(1))}
          {item(t('delete'), onRemove, true)}
        </div>
      )}
    </div>
  );
}

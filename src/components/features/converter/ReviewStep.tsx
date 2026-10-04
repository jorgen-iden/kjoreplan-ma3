'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';
import { moveCue, moveCueBefore, newId, removeCue, splitIntoSubCues, type Cue } from '@/lib/cues';
import { prepareCues } from '@/lib/ma3/macro';
import { MAX_NAME_LENGTH } from '@/lib/ma3/sanitize';
import type { Settings } from '@/lib/settings';
import { Button, EmptyState, Notice, PageHeader } from '@/components/ui';
import { CueRow, ROW_GRID } from './CueRow';

const blankCue = (): Cue => ({ id: newId(), srcNumber: '', name: '', time: '', duration: '', note: '' });

export function ReviewStep({
  title,
  items,
  cues,
  settings,
  linesMode,
  onCues,
  onNext,
  onReset,
}: {
  title: string;
  items: number;
  cues: Cue[];
  settings: Settings;
  linesMode: boolean;
  onCues: (cues: Cue[]) => void;
  onNext: () => void;
  onReset: () => void;
}) {
  const t = useTranslations('review');
  const tUpload = useTranslations('upload');
  const prepared = useMemo(() => prepareCues(cues, settings), [cues, settings]);
  const byId = useMemo(() => new Map(prepared.cues.map((c) => [c.id, c])), [prepared]);
  const truncated = prepared.cues.filter((c) => c.truncated).length;

  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  // Deleting is one click, so the last deletion can be undone until the list is changed again.
  const [undo, setUndo] = useState<{ cues: Cue[]; name: string } | null>(null);

  // Rows are memoised; these handlers read the latest list through a ref so they stay stable.
  const latest = useRef({ cues, onCues, dragId });
  latest.current = { cues, onCues, dragId };
  const apply = useCallback((fn: (cs: Cue[]) => Cue[]) => {
    setUndo(null);
    latest.current.onCues(fn(latest.current.cues));
  }, []);

  const handlers = useMemo(
    () => ({
      onChange: (id: string, patch: Partial<Cue>) => apply((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      onSplit: (id: string) => apply((cs) => splitIntoSubCues(cs, id)),
      onMove: (id: string, dir: -1 | 1) => apply((cs) => moveCue(cs, id, dir)),
      onRemove: (id: string) => {
        const before = latest.current.cues;
        apply((cs) => removeCue(cs, id));
        setUndo({ cues: before, name: before.find((c) => c.id === id)?.name ?? '' });
      },
      onDragStart: (id: string) => setDragId(id),
      onDragEnd: () => {
        setDragId(null);
        setOverId(null);
      },
      onDragOver: (id: string) => {
        if (latest.current.dragId) setOverId(id);
      },
      onDrop: (id: string) => {
        const from = latest.current.dragId;
        if (from && from !== id) apply((cs) => moveCueBefore(cs, from, id));
        setDragId(null);
        setOverId(null);
      },
    }),
    [apply],
  );

  const addCue = () => apply((cs) => [...cs, blankCue()]);
  const restore = () => {
    if (!undo) return;
    onCues(undo.cues);
    setUndo(null);
  };

  return (
    <section aria-label={t('cue')}>
      <PageHeader
        title={title || <span className="text-muted">{t('untitled')}</span>}
        lead={t('lead', { cues: cues.length, items })}
        action={
          <Button variant="primary" size="lg" onClick={onNext} disabled={cues.length === 0}>
            {t('continue')}
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 empty:hidden">
        {linesMode && <Notice kind="warn">{tUpload('linesMode')}</Notice>}
        {prepared.numberingFellBack && <Notice kind="warn">{t('numberingFellBack')}</Notice>}
        {prepared.numbersFilled > 0 && <Notice kind="info">{t('numbersFilled', { count: prepared.numbersFilled })}</Notice>}
        {truncated > 0 && <Notice kind="warn">{t('truncatedSummary', { count: truncated, max: MAX_NAME_LENGTH })}</Notice>}
      </div>

      <div className="rounded-2xl border border-line bg-card">
        {cues.length === 0 ? (
          <EmptyState title={t('emptyTitle')} lead={t('emptyLead')}>
            <Button variant="primary" onClick={addCue}>
              {t('addCue')}
            </Button>
            <Button onClick={onReset}>{tUpload('title')}</Button>
          </EmptyState>
        ) : (
          <>
            <div aria-hidden="true" className={`${ROW_GRID} hidden border-b border-line-soft px-4 py-3.5 text-sm font-semibold text-muted md:grid`}>
              <span />
              <span>{t('cue')}</span>
              <span className="px-2">{t('name')}</span>
              <span className="px-2">{t('time')}</span>
              <span className="px-2">{t('note')}</span>
              <span />
            </div>
            <ol>
              {cues.map((cue) => (
                <CueRow
                  key={cue.id}
                  cue={cue}
                  prepared={byId.get(cue.id)!}
                  dragging={dragId === cue.id}
                  dropTarget={overId === cue.id && dragId !== null && dragId !== cue.id}
                  {...handlers}
                />
              ))}
            </ol>
            <div className="px-4 py-3.5">
              <Button onClick={addCue} className="border-dashed">
                {t('addCue')}
              </Button>
            </div>
          </>
        )}
      </div>

      {undo && (
        <div className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-md animate-entry rounded-xl bg-card shadow-lg">
          <Notice
            kind="info"
            action={
              <Button size="sm" onClick={restore}>
                {t('undo')}
              </Button>
            }
          >
            {undo.name ? t('deleted', { name: undo.name }) : t('deletedUntitled')}
          </Notice>
        </div>
      )}
    </section>
  );
}

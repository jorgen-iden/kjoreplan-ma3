'use client';

import { useTranslations } from 'next-intl';
import { useId, useRef, useState } from 'react';
import { Button, Card, InteractiveGlow, Notice, PageHeader, Skeleton, Spinner } from '@/components/ui';
import { checkPastedText, MAX_TEXT_CHARS } from '@/lib/validation';
import type { Notice as NoticeData } from './state';

const ACCEPT = [
  '.pdf',
  '.docx',
  '.xlsx',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
].join(',');

export function UploadStep({
  busy,
  notice,
  onFile,
  onSample,
  onText,
}: {
  busy: boolean;
  notice: NoticeData | null;
  onFile: (file: File) => void;
  onSample: () => void;
  onText: (text: string) => void;
}) {
  const t = useTranslations('upload');
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [text, setText] = useState('');
  const pasteId = useId();
  const textProblem = checkPastedText(text);
  const tooLong = textProblem === 'tooLong';

  return (
    <section aria-labelledby="upload-title">
      <PageHeader title={<span id="upload-title">{t('title')}</span>} lead={t('lead')} />

      {notice && !busy && (
        <div className="mb-5">
          <Notice
            kind={notice.kind}
            action={
              notice.key === 'sampleError' ? (
                <Button size="sm" onClick={onSample}>
                  {t('retry')}
                </Button>
              ) : undefined
            }
          >
            {t(notice.key, notice.values)}
          </Notice>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {busy ? (
          <ReadingSkeleton title={t('reading')} lead={t('readingLead')} />
        ) : (
          <InteractiveGlow
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              const file = e.dataTransfer.files[0];
              if (file) onFile(file);
            }}
            className={`flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              over ? 'border-accent bg-accent-soft' : 'border-line bg-card'
            }`}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={`text-accent transition-transform duration-150 ${over ? '-translate-y-1' : ''}`} aria-hidden="true">
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <path d="M14 3v6h6M12 18v-6M9 15l3-3 3 3" />
            </svg>
            <p className="text-xl font-bold">{t('dropHint')}</p>
            <p className="text-muted">
              {t('or')}{' '}
              <button
                type="button"
                onClick={() => input.current?.click()}
                className="rounded font-semibold text-accent underline underline-offset-4 transition-colors hover:text-accent-strong"
              >
                {t('chooseFile')}
              </button>
            </p>
            <input
              ref={input}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFile(file);
                e.target.value = '';
              }}
            />
            <Button onClick={onSample} className="mt-4">
              {t('trySample')}
            </Button>
          </InteractiveGlow>
        )}

        <Card as="section" glow className="flex flex-col p-6">
          <h2 className="text-lg font-bold">{t('pasteTitle')}</h2>
          <p className="mt-1 text-sm text-muted">{t('pasteLead')}</p>
          <label htmlFor={pasteId} className="sr-only">
            {t('pasteTitle')}
          </label>
          <textarea
            id={pasteId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('pastePlaceholder')}
            rows={8}
            disabled={busy}
            aria-invalid={tooLong || undefined}
            aria-describedby={tooLong ? `${pasteId}-error` : undefined}
            className="mt-4 min-h-40 flex-1 resize-y rounded-xl border border-line bg-paper p-3 font-mono text-sm text-ink transition-colors placeholder:text-muted hover:border-muted focus:border-accent focus:outline-none aria-[invalid=true]:border-danger"
          />
          {tooLong && (
            <p id={`${pasteId}-error`} role="alert" className="mt-2 text-sm text-danger">
              {t('tooLong', { count: text.length, max: MAX_TEXT_CHARS })}
            </p>
          )}
          <Button onClick={() => onText(text)} disabled={busy || textProblem !== null} className="mt-4 self-start">
            {t('useText')}
          </Button>
        </Card>
      </div>
    </section>
  );
}

/** Shown while a file is read: the shape of the table that is about to appear. */
function ReadingSkeleton({ title, lead }: { title: string; lead: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-80 flex-col gap-5 rounded-2xl border border-line bg-card p-6">
      <div className="flex items-center gap-3">
        <Spinner className="size-5 text-accent" />
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-sm text-muted">{lead}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="grid grid-cols-[3rem_4rem_minmax(0,1fr)] gap-4">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className={`h-4 ${i % 2 ? 'w-2/3' : 'w-5/6'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

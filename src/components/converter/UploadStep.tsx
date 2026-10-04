'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import type { Notice as NoticeData } from './state';
import { Card, Notice, SecondaryButton, StepHeader } from './ui';

export function UploadStep({
  notice,
  onPdf,
  onText,
}: {
  notice: NoticeData | null;
  onPdf: (data: ArrayBuffer, fileName: string) => void;
  onText: (text: string) => void;
}) {
  const t = useTranslations('upload');
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [text, setText] = useState('');

  const openFile = async (file: File | undefined) => {
    if (file) onPdf(await file.arrayBuffer(), file.name);
  };
  const openSample = async () => {
    const res = await fetch('/sample-run-sheet.pdf');
    onPdf(await res.arrayBuffer(), 'sample-run-sheet.pdf');
  };

  return (
    <section>
      <StepHeader title={t('title')} lead={t('lead')} />

      {notice && (
        <div className="mb-5">
          <Notice kind={notice.kind}>{t(notice.key, notice.values)}</Notice>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            void openFile(e.dataTransfer.files[0]);
          }}
          className={`flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
            over ? 'border-accent bg-accent-soft' : 'border-line bg-card'
          }`}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-accent" aria-hidden="true">
            <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <path d="M14 3v6h6M12 18v-6M9 15l3-3 3 3" />
          </svg>
          <p className="text-xl font-bold">{t('dropHint')}</p>
          <p className="text-muted">
            {t('or')}{' '}
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="font-semibold text-accent underline underline-offset-4 hover:text-accent-strong"
            >
              {t('chooseFile')}
            </button>
          </p>
          <input
            ref={input}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => void openFile(e.target.files?.[0])}
          />
          <SecondaryButton onClick={() => void openSample()} className="mt-4">
            {t('trySample')}
          </SecondaryButton>
        </div>

        <Card className="flex flex-col p-6">
          <h2 className="text-lg font-bold">{t('pasteTitle')}</h2>
          <p className="mt-1 text-sm text-muted">{t('pasteLead')}</p>
          <label className="mt-4 flex flex-1 flex-col">
            <span className="sr-only">{t('pasteTitle')}</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('pastePlaceholder')}
              rows={8}
              className="min-h-[160px] flex-1 resize-y rounded-xl border border-line bg-paper p-3 font-mono text-sm text-ink placeholder:text-muted"
            />
          </label>
          <SecondaryButton onClick={() => onText(text)} disabled={!text.trim()} className="mt-4 self-start disabled:opacity-50">
            {t('useText')}
          </SecondaryButton>
        </Card>
      </div>
    </section>
  );
}

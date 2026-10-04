'use client';

import { useTranslations } from 'next-intl';
import { useId, useMemo, useRef, useState } from 'react';
import { findVersion } from '@/lib/config/versions';
import type { Cue } from '@/lib/cues';
import { buildCommandLine, buildCommands, buildMacroXml, prepareCues } from '@/lib/ma3/macro';
import { slugify } from '@/lib/ma3/sanitize';
import { buildZip, MACRO_DIR } from '@/lib/ma3/zip';
import type { Settings } from '@/lib/settings';
import { isValidSequence } from '@/lib/validation';
import { Button, Card, Notice, PageHeader } from '@/components/ui';

export function ExportStep({ cues, settings }: { cues: Cue[]; settings: Settings }) {
  const t = useTranslations('export');
  const tNote = useTranslations('note');
  const tSettings = useTranslations('settings');
  const seqValid = isValidSequence(settings.sequence);
  const [downloading, setDownloading] = useState(false);
  const [downloadFailed, setDownloadFailed] = useState(false);
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle');
  const cmdRef = useRef<HTMLTextAreaElement>(null);
  const cmdId = useId();

  const version = findVersion(settings.maVersion);
  const macroName = settings.sequenceName.trim() || 'Run sheet';
  const fileSlug = slugify(macroName);
  const commands = useMemo(
    () => buildCommands(prepareCues(cues, settings, { start: tNote('start'), duration: tNote('duration') }).cues, settings),
    [cues, settings, tNote],
  );
  const cmdLine = buildCommandLine(commands);

  const download = async () => {
    setDownloading(true);
    setDownloadFailed(false);
    try {
      const blob = await buildZip(fileSlug, buildMacroXml(macroName, commands, version.dataVersion));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileSlug}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setDownloadFailed(true);
    } finally {
      setDownloading(false);
    }
  };

  const copyCommands = async () => {
    try {
      await navigator.clipboard.writeText(cmdLine);
      setCopy('copied');
      setTimeout(() => setCopy('idle'), 1500);
    } catch {
      // Clipboard blocked (permissions, insecure context): select the text so the user can copy it.
      cmdRef.current?.select();
      setCopy('failed');
    }
  };

  return (
    <section aria-labelledby="export-title">
      <PageHeader
        title={<span id="export-title">{t('title')}</span>}
        lead={t('lead', { sequence: settings.sequence, cues: cues.length, version: version.label })}
      />

      <Card glow className="flex flex-col items-start gap-4 p-6 sm:p-8">
        {!seqValid && <Notice kind="error">{tSettings('sequenceInvalid')}</Notice>}
        <Button variant="primary" size="lg" loading={downloading} disabled={!seqValid} onClick={() => void download()} className="min-h-14 px-8 text-lg">
          {downloading ? t('preparing') : t('download')}
        </Button>
        <p className="break-all font-mono text-xs text-muted">
          {MACRO_DIR}/{fileSlug}.xml
        </p>
        {downloadFailed && (
          <Notice
            kind="error"
            action={
              <Button size="sm" onClick={() => void download()}>
                {t('download')}
              </Button>
            }
          >
            {t('downloadError')}
          </Notice>
        )}
        <Notice kind="info">{t('verified')}</Notice>
      </Card>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card as="section" className="p-6">
          <h2 className="mb-4 text-lg font-bold">{t('howTitle')}</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-subtle marker:font-semibold marker:text-accent">
            <li>{t('how1')}</li>
            <li>{t('how2')}</li>
            <li>{t('how3', { menu: version.importMenu })}</li>
            <li>{t('how4', { file: fileSlug })}</li>
            <li>{t('how5', { sequence: settings.sequence })}</li>
          </ol>
        </Card>

        <Card as="section" className="flex flex-col p-6">
          <h2 className="text-lg font-bold">{t('cmdTitle')}</h2>
          <p className="mb-3 mt-1 text-sm text-muted">{t('cmdLead')}</p>
          <label htmlFor={cmdId} className="sr-only">
            {t('cmdTitle')}
          </label>
          <textarea
            id={cmdId}
            ref={cmdRef}
            readOnly
            value={cmdLine}
            rows={5}
            className="flex-1 resize-y rounded-xl border border-line bg-paper p-3 font-mono text-xs text-subtle focus:border-accent focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button onClick={() => void copyCommands()} disabled={!seqValid} aria-live="polite">
              {copy === 'copied' ? t('copied') : t('copy')}
            </Button>
            {copy === 'failed' && <p className="text-sm text-danger">{t('copyFailed')}</p>}
          </div>
        </Card>
      </div>
    </section>
  );
}

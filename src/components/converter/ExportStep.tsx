'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { findVersion } from '@/lib/config/versions';
import type { Cue } from '@/lib/cues';
import { buildCommandLine, buildCommands, buildMacroXml, prepareCues } from '@/lib/ma3/macro';
import { slugify } from '@/lib/ma3/sanitize';
import { buildZip, MACRO_DIR } from '@/lib/ma3/zip';
import type { Settings } from '@/lib/settings';
import { Card, Notice, PrimaryButton, SecondaryButton, StepHeader } from './ui';

export function ExportStep({ cues, settings }: { cues: Cue[]; settings: Settings }) {
  const t = useTranslations('export');
  const tNote = useTranslations('note');
  const [copied, setCopied] = useState(false);

  const version = findVersion(settings.maVersion);
  const macroName = settings.sequenceName.trim() || 'Run sheet';
  const fileSlug = slugify(macroName);
  const commands = buildCommands(prepareCues(cues, settings, { start: tNote('start'), duration: tNote('duration') }).cues, settings);
  const cmdLine = buildCommandLine(commands);

  const download = async () => {
    const blob = await buildZip(fileSlug, buildMacroXml(macroName, commands, version.dataVersion));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileSlug}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(cmdLine);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section>
      <StepHeader
        title={t('title')}
        lead={t('lead', { sequence: settings.sequence, cues: cues.length, version: version.label })}
      />

      <Card className="flex flex-col items-start gap-4 p-6 sm:p-8">
        <PrimaryButton onClick={() => void download()} className="min-h-14 px-8 text-lg">
          {t('download')}
        </PrimaryButton>
        <p className="font-mono text-xs text-muted">
          {MACRO_DIR}/{fileSlug}.xml
        </p>
        <Notice kind="info">{t('verified')}</Notice>
      </Card>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-bold">{t('howTitle')}</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-subtle marker:font-semibold marker:text-accent">
            <li>{t('how1')}</li>
            <li>{t('how2')}</li>
            <li>{t('how3', { menu: version.importMenu })}</li>
            <li>{t('how4', { file: fileSlug })}</li>
            <li>{t('how5', { sequence: settings.sequence })}</li>
          </ol>
        </Card>

        <Card className="flex flex-col p-6">
          <h2 className="text-lg font-bold">{t('cmdTitle')}</h2>
          <p className="mb-3 mt-1 text-sm text-muted">{t('cmdLead')}</p>
          <label className="flex flex-1 flex-col">
            <span className="sr-only">{t('cmdTitle')}</span>
            <textarea
              readOnly
              value={cmdLine}
              rows={5}
              className="flex-1 resize-y rounded-xl border border-line bg-paper p-3 font-mono text-xs text-subtle"
            />
          </label>
          <SecondaryButton onClick={() => void copy()} className="mt-3 self-start">
            {copied ? t('copied') : t('copy')}
          </SecondaryButton>
        </Card>
      </div>
    </section>
  );
}

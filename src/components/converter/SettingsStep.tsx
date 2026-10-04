'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { MA_VERSIONS } from '@/lib/config/versions';
import type { Settings } from '@/lib/settings';
import { Card, PrimaryButton, StepHeader } from './ui';

const INPUT = 'min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-ink';

export function isValidSequence(n: number): boolean {
  return Number.isInteger(n) && n >= 1;
}

export function SettingsStep({
  settings: s,
  onChange,
  onNext,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onNext: () => void;
}) {
  const t = useTranslations('settings');
  const seqValid = isValidSequence(s.sequence);

  return (
    <section>
      <StepHeader
        title={t('title')}
        lead={t('lead')}
        action={
          <PrimaryButton onClick={onNext} disabled={!seqValid}>
            {t('continue')}
          </PrimaryButton>
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Group title={t('sequenceGroup')}>
          <Field label={t('sequence')} help={seqValid ? t('sequenceHelp') : undefined} error={seqValid ? undefined : t('sequenceInvalid')}>
            <input
              type="number"
              min={1}
              step={1}
              value={Number.isNaN(s.sequence) ? '' : s.sequence}
              onChange={(e) => onChange({ sequence: e.target.valueAsNumber })}
              aria-invalid={!seqValid}
              className={`${INPUT} font-mono`}
            />
          </Field>
          <Field label={t('sequenceName')}>
            <input value={s.sequenceName} onChange={(e) => onChange({ sequenceName: e.target.value })} className={INPUT} />
          </Field>
          <Field label={t('numbering')}>
            <select value={s.numbering} onChange={(e) => onChange({ numbering: e.target.value as Settings['numbering'] })} className={INPUT}>
              <option value="follow">{t('numberingFollow')}</option>
              <option value="running">{t('numberingRunning')}</option>
            </select>
          </Field>
        </Group>

        <Group title={t('consoleGroup')}>
          <Field label={t('maVersion')}>
            <select value={s.maVersion} onChange={(e) => onChange({ maVersion: e.target.value })} className={INPUT}>
              {MA_VERSIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('nameFormat')}>
            <select value={s.nameFormat} onChange={(e) => onChange({ nameFormat: e.target.value as Settings['nameFormat'] })} className={INPUT}>
              <option value="title">{t('nameTitle')}</option>
              <option value="time-title">{t('nameTimeTitle')}</option>
            </select>
          </Field>
        </Group>

        <Group title={t('noteGroup')}>
          <Check checked={s.noteTime} onChange={(noteTime) => onChange({ noteTime })} label={t('noteTime')} />
          <Check checked={s.noteText} onChange={(noteText) => onChange({ noteText })} label={t('noteText')} />
        </Group>

        <Group title={t('safetyGroup')}>
          <Check checked={s.clearFirst} onChange={(clearFirst) => onChange({ clearFirst })} label={t('clearFirst')} help={t('clearFirstHelp')} />
        </Group>
      </div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </Card>
  );
}

function Field({ label, help, error, children }: { label: string; help?: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {help && <span className="text-sm text-muted">{help}</span>}
      {error && <span className="text-sm text-danger">{error}</span>}
    </label>
  );
}

function Check({ checked, onChange, label, help }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-5 accent-accent" />
      <span className="flex flex-col">
        <span className="font-medium">{label}</span>
        {help && <span className="text-sm text-muted">{help}</span>}
      </span>
    </label>
  );
}

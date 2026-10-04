'use client';

import { useTranslations } from 'next-intl';
import { cloneElement, useId, type ReactElement, type ReactNode } from 'react';
import { MA_VERSIONS } from '@/lib/config/versions';
import type { Settings } from '@/lib/settings';
import { isValidSequence, MAX_SEQUENCE } from '@/lib/validation';
import { Button, Card, PageHeader } from '@/components/ui';

const INPUT =
  'min-h-11 w-full rounded-lg border bg-paper px-3 text-ink transition-colors hover:border-muted focus:border-accent focus:outline-none aria-[invalid=true]:border-danger';


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
    <section aria-label={t('title')}>
      <PageHeader
        title={t('title')}
        lead={t('lead')}
        action={
          <Button variant="primary" size="lg" onClick={onNext} disabled={!seqValid}>
            {t('continue')}
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Group title={t('sequenceGroup')}>
          <Field label={t('sequence')} help={t('sequenceHelp')} error={seqValid ? undefined : t('sequenceInvalid')}>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_SEQUENCE}
              step={1}
              value={Number.isNaN(s.sequence) ? '' : s.sequence}
              onChange={(e) => onChange({ sequence: e.target.valueAsNumber })}
              className={`${INPUT} border-line font-mono`}
            />
          </Field>
          <Field label={t('sequenceName')} help={s.sequenceName.trim() ? undefined : t('sequenceNameEmpty')}>
            <input value={s.sequenceName} onChange={(e) => onChange({ sequenceName: e.target.value })} className={`${INPUT} border-line`} />
          </Field>
          <Field label={t('numbering')}>
            <select value={s.numbering} onChange={(e) => onChange({ numbering: e.target.value as Settings['numbering'] })} className={`${INPUT} border-line`}>
              <option value="follow">{t('numberingFollow')}</option>
              <option value="running">{t('numberingRunning')}</option>
            </select>
          </Field>
        </Group>

        <Group title={t('consoleGroup')}>
          <Field label={t('maVersion')}>
            <select value={s.maVersion} onChange={(e) => onChange({ maVersion: e.target.value })} className={`${INPUT} border-line`}>
              {MA_VERSIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('nameFormat')}>
            <select value={s.nameFormat} onChange={(e) => onChange({ nameFormat: e.target.value as Settings['nameFormat'] })} className={`${INPUT} border-line`}>
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
    <Card as="section" glow className="p-6">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </Card>
  );
}

/** Label, control and help/error text, linked with aria-describedby. The error replaces the help text. */
function Field({ label, help, error, children }: { label: string; help?: string; error?: string; children: ReactElement<Record<string, unknown>> }) {
  const id = useId();
  const message = error ?? help;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': message ? `${id}-msg` : undefined,
      })}
      {message && (
        <p id={`${id}-msg`} className={`text-sm ${error ? 'text-danger' : 'text-muted'}`} role={error ? 'alert' : undefined}>
          {message}
        </p>
      )}
    </div>
  );
}

function Check({ checked, onChange, label, help }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-accent" />
      <span className="flex flex-col">
        <span className="font-medium">{label}</span>
        {help && <span className="text-sm text-muted">{help}</span>}
      </span>
    </label>
  );
}

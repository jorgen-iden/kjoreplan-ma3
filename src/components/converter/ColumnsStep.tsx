'use client';

import { useTranslations } from 'next-intl';
import type { Mapping } from '@/lib/cues';
import type { ParsedTable } from '@/lib/parse';
import { Card, PrimaryButton, StepHeader } from './ui';

const ROLES = [
  ['number', 'number'],
  ['start', 'start'],
  ['duration', 'duration'],
  ['title', 'titleCol'],
] as const;

export function ColumnsStep({
  table,
  mapping,
  edited,
  onMapping,
  onNext,
}: {
  table: ParsedTable;
  mapping: Mapping;
  edited: boolean;
  onMapping: (mapping: Mapping) => void;
  onNext: () => void;
}) {
  const t = useTranslations('columns');

  const change = (key: keyof Mapping, value: string) => {
    if (edited && !window.confirm(t('confirmReset'))) return;
    onMapping({ ...mapping, [key]: value === '' ? null : Number(value) });
  };

  const roleOf = (col: number) => ROLES.find(([key]) => mapping[key] === col);
  const preview = table.rows.slice(0, 5);

  return (
    <section>
      <StepHeader title={t('title')} lead={t('lead')} action={<PrimaryButton onClick={onNext}>{t('continue')}</PrimaryButton>} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-muted">{t('found')}</h2>
          <div className="flex flex-col gap-4">
            {ROLES.map(([key, label]) => (
              <label key={key} className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold">{t(label)}</span>
                <select
                  value={mapping[key] ?? ''}
                  onChange={(e) => change(key, e.target.value)}
                  className="min-h-11 rounded-lg border border-line bg-paper px-3 text-ink"
                >
                  <option value="">{t('notUsed')}</option>
                  {table.columns.map((c, i) => (
                    <option key={i} value={i}>
                      {c.name || `#${i + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <h2 className="border-b border-line-soft px-6 py-4 text-sm font-semibold text-muted">{t('preview')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr>
                  {table.columns.map((c, i) => {
                    const role = roleOf(i);
                    return (
                      <th
                        key={i}
                        scope="col"
                        className={`px-4 py-3 font-semibold ${role ? 'bg-accent-soft text-accent-strong' : 'text-muted'}`}
                      >
                        {c.name || `#${i + 1}`}
                        {role && t(role[1]).toLowerCase() !== c.name.toLowerCase() && (
                          <span className="block text-xs font-normal">{t(role[1])}</span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, r) => (
                  <tr key={r} className="border-t border-line-soft align-top">
                    {table.columns.map((_, i) => (
                      <td key={i} className={`whitespace-pre-line px-4 py-3 ${roleOf(i) ? '' : 'text-muted'}`}>
                        {row[i]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  );
}

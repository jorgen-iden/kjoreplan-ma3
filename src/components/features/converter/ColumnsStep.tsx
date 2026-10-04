'use client';

import { useTranslations } from 'next-intl';
import type { Mapping } from '@/lib/cues';
import type { Source } from '@/lib/import';
import type { ParsedTable } from '@/lib/parse';
import { Button, Card, PageHeader } from '@/components/ui';

const ROLES = [
  ['number', 'number'],
  ['start', 'start'],
  ['duration', 'duration'],
  ['title', 'titleCol'],
] as const;

const SELECT =
  'min-h-11 rounded-lg border border-line bg-paper px-3 text-ink transition-colors hover:border-muted focus:border-accent focus:outline-none';

export function ColumnsStep({
  table,
  sources,
  sourceIndex,
  onSource,
  mapping,
  edited,
  onMapping,
  onNext,
}: {
  table: ParsedTable;
  sources: Source[];
  sourceIndex: number;
  onSource: (index: number) => void;
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
    <section aria-label={t('title')}>
      <PageHeader
        title={t('title')}
        lead={t('lead')}
        action={
          <Button variant="primary" size="lg" onClick={onNext}>
            {t('continue')}
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card as="section" className="p-6">
          {sources.length > 1 && (
            <label className="mb-6 flex flex-col gap-1.5 border-b border-line-soft pb-6">
              <span className="text-sm font-semibold">{t(sources[0].kind === 'xlsx' ? 'sheet' : 'table')}</span>
              <select
                value={sourceIndex}
                onChange={(e) => onSource(Number(e.target.value))}
                className={SELECT}
              >
                {sources.map((s, i) => (
                  <option key={i} value={i}>
                    {s.kind === 'xlsx' ? s.name : t('tableN', { n: s.name })} · {t('rows', { count: s.table.rows.length })}
                  </option>
                ))}
              </select>
            </label>
          )}
          <h2 className="mb-4 text-sm font-semibold text-muted">{t('found')}</h2>
          <div className="flex flex-col gap-4">
            {ROLES.map(([key, label]) => (
              <label key={key} className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold">{t(label)}</span>
                <select
                  value={mapping[key] ?? ''}
                  onChange={(e) => change(key, e.target.value)}
                  className={SELECT}
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

        <Card as="section" className="overflow-hidden">
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

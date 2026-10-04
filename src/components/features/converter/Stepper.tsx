'use client';

import { useTranslations } from 'next-intl';
import { STEPS, type Step } from './state';

/** Progress through the five steps. Doubles as breadcrumbs: earlier and reachable steps are clickable. */
export function Stepper({
  step,
  reachable,
  onGoto,
  onReset,
}: {
  step: Step;
  reachable: (step: Step) => boolean;
  onGoto: (step: Step) => void;
  onReset?: () => void;
}) {
  const t = useTranslations('steps');
  return (
    <nav aria-label={t('label')} className="mb-6 flex flex-wrap items-center gap-2 sm:mb-7">
      {/* Phones: one line with the current step and a progress bar. */}
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:hidden" aria-current="step">
        <span className="shrink-0 text-sm">
          <span className="text-muted">{t('progress', { n: step + 1, total: STEPS.length })} · </span>
          <span className="font-semibold">{t(STEPS[step])}</span>
        </span>
        <span className="h-1 min-w-8 flex-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <span className="block h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </span>
      </div>
      <ol className="hidden flex-wrap items-center gap-2 text-sm sm:flex">
        {STEPS.map((key, i) => {
          const s = i as Step;
          const active = step === s;
          const done = s < step;
          const base = 'inline-flex min-h-9 items-center rounded-full px-3 transition-colors duration-150';
          const look = active
            ? 'bg-ink font-semibold text-paper'
            : done
              ? 'bg-chip text-subtle hover:bg-line'
              : 'border border-line text-muted enabled:hover:border-muted enabled:hover:text-ink disabled:opacity-60';
          return (
            <li key={key}>
              <button
                type="button"
                disabled={!reachable(s)}
                aria-current={active ? 'step' : undefined}
                onClick={() => onGoto(s)}
                className={`${base} ${look}`}
              >
                {i + 1} · {t(key)}
              </button>
            </li>
          );
        })}
      </ol>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto min-h-9 shrink-0 rounded-lg px-2 text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          {t('startOver')}
        </button>
      )}
    </nav>
  );
}

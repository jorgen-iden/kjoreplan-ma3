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
    <nav aria-label={t('label')} className="mb-7 flex flex-wrap items-center gap-2">
      <ol className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
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
          className="ml-auto min-h-9 rounded-lg px-2 text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          {t('startOver')}
        </button>
      )}
    </nav>
  );
}

import { ConsoleIllustration, type ConsoleCue } from './ConsoleIllustration';
import { Reveal } from './Reveal';

export interface Step {
  title: string;
  text: string;
}

// Each step's fader fills a little after the one before it.
const FADER_DELAYS = ['delay-200', 'delay-500', 'delay-800'];

/**
 * The full-width console band: three steps as Cue 1–3 with faders that run in order, and the drawn
 * console with our cue list under them. Used on the front page and the format pages.
 */
export function StepsBand({
  id,
  kicker,
  title,
  steps,
  cueLabels,
  sequence,
  cues,
}: {
  id: string;
  kicker: string;
  title: string;
  steps: Step[];
  /** "Cue 1", "Cue 2" … per step. */
  cueLabels: string[];
  sequence: string;
  cues: ConsoleCue[];
}) {
  return (
    <section
      aria-labelledby={id}
      className="mt-28 bg-console py-20 text-console-ink sm:mt-40 sm:py-28 dark:border-y dark:border-console-line dark:bg-console-raised [background-image:radial-gradient(var(--color-console-line)_1px,transparent_1px)] [background-size:22px_22px]"
    >
      <Reveal className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="mb-3 font-mono text-sm font-semibold text-console-accent">{kicker}</p>
        <h2 id={id} className="mb-14 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h2>
        <ol className="grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <li key={step.title}>
              <div className="mb-5 flex items-center justify-between font-mono text-sm">
                <span className="font-semibold text-console-accent">{cueLabels[i]}</span>
                <span className="text-console-muted">GO</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-console-line">
                <div className={`h-full origin-left scale-x-0 rounded-full bg-console-accent transition-transform duration-700 ease-out-quint group-data-[shown]:scale-x-100 ${FADER_DELAYS[i]}`} />
              </div>
              <h3 className="mt-6 mb-2 text-xl font-bold">{step.title}</h3>
              <p className="text-console-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="relative mx-auto mt-16 max-w-4xl drop-shadow-2xl sm:mt-20">
          {/* Stage light under the desk. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 bottom-0 top-1/3 -z-10 rounded-full bg-console-accent/25 blur-3xl" />
          <ConsoleIllustration sequence={sequence} cues={cues} />
        </div>
      </Reveal>
    </section>
  );
}

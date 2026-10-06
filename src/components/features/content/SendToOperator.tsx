'use client';

import { track } from '@vercel/analytics';
import { useId, useRef, useState } from 'react';

export interface SendToOperatorLabels {
  kicker: string;
  title: string;
  text: string;
  attach: string;
  email: string;
  copy: string;
  copied: string;
  copyFailed: string;
  preview: string;
}

/**
 * For producers on a template page: a ready-made note to the lighting operator, as an e-mail
 * (mailto:) or as text to copy into any messenger. The message is built on the server
 * (handoffMail in src/lib/mailto.ts) in the page's language; this component only shows and copies it.
 */
export function SendToOperator({ subject, body, href, labels }: { subject: string; body: string; href: string; labels: SendToOperatorLabels }) {
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle');
  const textRef = useRef<HTMLPreElement>(null);
  const titleId = useId();

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopy('copied');
      track('Operator note copied');
      setTimeout(() => setCopy('idle'), 2000);
    } catch {
      // Clipboard blocked: select the message so it can be copied by hand.
      const el = textRef.current;
      const selection = window.getSelection();
      if (el && selection) {
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setCopy('failed');
    }
  };

  return (
    <section
      aria-labelledby={titleId}
      className="relative overflow-hidden rounded-3xl bg-console p-6 text-console-ink shadow-xl sm:p-10 dark:border dark:border-console-line dark:bg-console-raised [background-image:radial-gradient(var(--color-console-line)_1px,transparent_1px)] [background-size:22px_22px]"
    >
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <p className="mb-3 font-mono text-sm font-semibold text-console-accent">{labels.kicker}</p>
          <h2 id={titleId} className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {labels.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-console-muted">{labels.text}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={href}
              onClick={() => track('Operator note e-mailed')}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-console-accent px-5 font-bold text-console no-underline transition duration-300 ease-out-back hover:scale-105 active:scale-95"
            >
              {labels.email} →
            </a>
            <button
              type="button"
              onClick={() => void copyText()}
              aria-live="polite"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-console-line px-5 font-semibold text-console-ink transition duration-150 hover:border-console-muted active:scale-[0.98]"
            >
              {copy === 'copied' ? (
                <>
                  <span aria-hidden="true" className="animate-pop-in size-2 rounded-full bg-console-accent" />
                  {labels.copied}
                </>
              ) : (
                labels.copy
              )}
            </button>
          </div>
          {copy === 'failed' ? (
            <p role="alert" className="mt-4 text-sm text-console-ink">
              {labels.copyFailed}
            </p>
          ) : (
            <p className="mt-4 text-sm text-console-muted">{labels.attach}</p>
          )}
        </div>

        {/* The message itself, on a console screen, so producers see exactly what they send. */}
        <figure className="min-w-0 overflow-hidden rounded-2xl border border-console-line bg-console-raised dark:bg-console">
          <figcaption className="flex items-center gap-2 border-b border-console-line px-4 py-3 font-mono text-xs text-console-muted">
            <span aria-hidden="true" className="size-2 rounded-full bg-console-accent" />
            {labels.preview}
          </figcaption>
          <div className="p-5">
            <p className="mb-4 break-words font-mono text-sm font-semibold text-console-ink">{subject}</p>
            <pre ref={textRef} className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed sm:text-sm text-console-muted">
              {body}
            </pre>
          </div>
        </figure>
      </div>
    </section>
  );
}

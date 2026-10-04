'use client';

import './globals.css';

/**
 * Last-resort error boundary for crashes in the root layout itself. Translations may not be
 * available here, so the text is in English and Norwegian.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">Something went wrong</h1>
          <p className="mt-2 text-muted">Noe gikk galt</p>
          <p className="mt-4 text-lg text-muted">Your files never left your computer. Try again.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex min-h-13 items-center rounded-xl bg-accent px-6 font-bold text-on-accent transition hover:bg-accent-strong active:scale-[0.98]"
          >
            Try again / Prøv igjen
          </button>
        </main>
      </body>
    </html>
  );
}

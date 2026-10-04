import './globals.css';

// Requests that never reached a locale (rare: the proxy adds one). Plain bilingual page.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 text-center">
          <p className="font-mono text-sm font-semibold tracking-widest text-accent">404</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Page not found</h1>
          <p className="mt-2 text-muted">Fant ikke siden</p>
          <a href="/" className="mt-8 inline-flex min-h-13 items-center rounded-xl bg-accent px-6 font-bold text-on-accent no-underline hover:bg-accent-strong">
            Back to the front page
          </a>
        </main>
      </body>
    </html>
  );
}

import type { FaqItem } from '@/lib/structured-data';

/**
 * Questions as native <details>, so they work without JavaScript and every answer is in the HTML
 * that search engines read. The same items feed the FAQPage JSON-LD.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group py-1">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-3 text-lg font-semibold [&::-webkit-details-marker]:hidden">
            {f.q}
            <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform duration-200 group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="max-w-3xl pb-5 pr-12 leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

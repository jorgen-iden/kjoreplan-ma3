/**
 * Ready-made e-mails (mailto: links) and the text behind them. The copy lives in messages/*.json
 * with {placeholders}; these functions fill them, so the components and the tests use the same code.
 */

export interface MailCopy {
  subject: string;
  body: string;
}

/** Replaces every {name} in the text with its value. Unknown names are left as they are (tests catch them). */
export function fillPlaceholders(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}

/** A mailto: link. Line breaks become CRLF, as RFC 6068 asks for, and everything is percent-encoded. */
export function mailtoHref({ to = '', subject, body }: { to?: string; subject: string; body: string }): string {
  const enc = (s: string) => encodeURIComponent(s.replace(/\r?\n/g, '\r\n'));
  return `mailto:${to}?subject=${enc(subject)}&body=${enc(body)}`;
}

/**
 * The feedback e-mail after a download. The body holds only the grandMA3 version and the number of
 * cues, never anything from the run sheet.
 */
export function feedbackMail(copy: MailCopy, { to, version, cues }: { to: string; version: string; cues: number }) {
  const subject = fillPlaceholders(copy.subject, { version, cues });
  const body = fillPlaceholders(copy.body, { version, cues });
  return { subject, body, href: mailtoHref({ to, subject, body }) };
}

/** The note a producer sends to the lighting operator: where to turn the run sheet into a cue list. */
export function handoffMail(copy: MailCopy, { appUrl, templateUrl }: { appUrl: string; templateUrl: string }) {
  const subject = fillPlaceholders(copy.subject, { appUrl, templateUrl });
  const body = fillPlaceholders(copy.body, { appUrl, templateUrl });
  return { subject, body, href: mailtoHref({ subject, body }) };
}

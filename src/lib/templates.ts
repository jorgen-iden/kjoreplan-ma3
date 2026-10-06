/**
 * Content of the free run sheet templates (public/templates, made by scripts/make-templates.ts).
 * Also shown as a preview on /run-sheet-template. Change it here, then run `npm run templates`.
 */
export interface Template {
  file: string;
  title: string;
  info: string;
  headers: [string, string, string, string, string];
  /** Example rows: number, start (HH:MM), duration in minutes, title, notes. */
  rows: [string, string, number, string, string][];
}

export const TEMPLATES: Record<'en' | 'no' | 'de', Template> = {
  en: {
    file: 'run-sheet-template',
    title: 'Run sheet – Name of the show',
    info: 'Date: · Venue: · Stage manager: · Version 1',
    headers: ['#', 'Start', 'Duration', 'Title', 'Notes'],
    rows: [
      ['1', '18:30', 30, 'Doors open', 'Walk-in music, house lights'],
      ['2', '19:00', 5, 'Welcome by the host', 'Lectern, stage left'],
      ['3', '19:05', 20, 'Band\nSong 1\nSong 2\nSong 3', 'Set list: one line per song'],
      ['4', '19:25', 10, 'Talk with the guest', 'Two chairs'],
      ['5', '19:35', 20, 'Interval', ''],
      ['6', '19:55', 30, 'Main act', ''],
      ['7', '20:25', 5, 'Thanks and goodnight', 'Walk-out music'],
    ],
  },
  no: {
    file: 'kjoreplan-mal',
    title: 'Kjøreplan – Navn på forestillingen',
    info: 'Dato: · Sted: · Inspisient: · Versjon 1',
    headers: ['#', 'Start', 'Varighet', 'Tittel', 'Notater'],
    rows: [
      ['1', '18:30', 30, 'Dørene åpner', 'Innslippsmusikk, salslys'],
      ['2', '19:00', 5, 'Velkommen ved programleder', 'Talerstol, venstre side'],
      ['3', '19:05', 20, 'Band\nLåt 1\nLåt 2\nLåt 3', 'Settliste: én linje per låt'],
      ['4', '19:25', 10, 'Samtale med gjesten', 'To stoler'],
      ['5', '19:35', 20, 'Pause', ''],
      ['6', '19:55', 30, 'Hovedakt', ''],
      ['7', '20:25', 5, 'Takk for i kveld', 'Utgangsmusikk'],
    ],
  },
  de: {
    file: 'ablaufplan-vorlage',
    title: 'Ablaufplan – Name der Show',
    info: 'Datum: · Ort: · Inspizienz: · Version 1',
    headers: ['#', 'Start', 'Dauer', 'Titel', 'Notizen'],
    rows: [
      ['1', '18:30', 30, 'Einlass', 'Einlassmusik, Saallicht'],
      ['2', '19:00', 5, 'Begrüßung durch die Moderation', 'Rednerpult, links'],
      ['3', '19:05', 20, 'Band\nSong 1\nSong 2\nSong 3', 'Setlist: ein Song pro Zeile'],
      ['4', '19:25', 10, 'Gespräch mit dem Gast', 'Zwei Stühle'],
      ['5', '19:35', 20, 'Pause', ''],
      ['6', '19:55', 30, 'Hauptact', ''],
      ['7', '20:25', 5, 'Dank und gute Nacht', 'Auslassmusik'],
    ],
  },
};

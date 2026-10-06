import type { Locale } from '@/i18n/routing';

/** Where the changelog lives (without locale). */
export const CHANGELOG_PATH = '/changelog';

/**
 * What has shipped, newest first, shown on /changelog. Add new entries at the top. The date is the
 * day it went live (YYYY-MM-DD, Norwegian time). Wording is for users: what changed for them, in
 * the brand voice (docs/brand.md), and only what is true.
 */
export interface ChangelogText {
  title: string;
  text: string;
}

export type ChangelogEntry = { date: string } & Record<Locale, ChangelogText>;

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-10-06',
    en: {
      title: 'Changelog, feedback and a note for the lighting operator',
      text: 'This page. After a download, a short line asks whether the macro worked on your console. The run sheet template has a ready-made message producers can send to their lighting operator.',
    },
    no: {
      title: 'Endringslogg, tilbakemelding og en beskjed til lysoperatøren',
      text: 'Denne siden. Etter en nedlasting spør en kort linje om makroen virket i konsollen. Malen for kjøreplan har en ferdig beskjed produsenter kan sende til lysoperatøren.',
    },
    de: {
      title: 'Changelog, Feedback und eine Nachricht für den Lichtoperator',
      text: 'Diese Seite. Nach dem Download fragt eine kurze Zeile, ob das Makro auf deinem Pult funktioniert hat. Die Ablaufplan-Vorlage hat eine fertige Nachricht, die die Produktion an den Lichtoperator schicken kann.',
    },
  },
  {
    date: '2026-10-06',
    en: {
      title: 'Download count',
      text: 'We count macro downloads. Only the number of cues, the grandMA3 version and the site language are sent, never anything from the run sheet.',
    },
    no: {
      title: 'Telling av nedlastinger',
      text: 'Vi teller nedlastinger av makroen. Bare antall cuer, grandMA3-versjonen og språket på siden sendes, aldri noe fra kjøreplanen.',
    },
    de: {
      title: 'Zählung der Downloads',
      text: 'Wir zählen Makro-Downloads. Gesendet werden nur die Zahl der Cues, die grandMA3-Version und die Sprache der Seite, nie etwas aus dem Ablaufplan.',
    },
  },
  {
    date: '2026-10-06',
    en: {
      title: 'German',
      text: 'The site and the converter in German at /de. The import also knows German column names such as Nr., Uhrzeit, Dauer and Programmpunkt.',
    },
    no: {
      title: 'Tysk',
      text: 'Nettstedet og konverteren på tysk under /de. Importen kjenner også tyske kolonnenavn som Nr., Uhrzeit, Dauer og Programmpunkt.',
    },
    de: {
      title: 'Deutsch',
      text: 'Die Website und der Konverter auf Deutsch unter /de. Der Import kennt auch deutsche Spaltennamen wie Nr., Uhrzeit, Dauer und Programmpunkt.',
    },
  },
  {
    date: '2026-10-06',
    en: {
      title: 'Free run sheet templates and guides',
      text: 'A run sheet template for Excel and Word in English, Norwegian and German, a guide to importing the macro on grandMA3, and a page on what a run sheet is.',
    },
    no: {
      title: 'Gratis maler for kjøreplan og guider',
      text: 'En mal for kjøreplan i Excel og Word på engelsk, norsk og tysk, en guide til å importere makroen i grandMA3 og en side om hva en kjøreplan er.',
    },
    de: {
      title: 'Kostenlose Ablaufplan-Vorlagen und Anleitungen',
      text: 'Eine Ablaufplan-Vorlage für Excel und Word auf Englisch, Norwegisch und Deutsch, eine Anleitung zum Import des Makros in grandMA3 und eine Seite dazu, was ein Ablaufplan ist.',
    },
  },
  {
    date: '2026-10-05',
    en: {
      title: 'Pages for Excel, PDF and Word',
      text: 'One page per format that explains what the import reads from an Excel, PDF or Word run sheet, and how the cue list gets into grandMA3.',
    },
    no: {
      title: 'Egne sider for Excel, PDF og Word',
      text: 'Én side per format som forklarer hva importen leser fra en kjøreplan i Excel, PDF eller Word, og hvordan cuelisten kommer inn i grandMA3.',
    },
    de: {
      title: 'Eigene Seiten für Excel, PDF und Word',
      text: 'Eine Seite pro Format, die erklärt, was der Import aus einem Ablaufplan in Excel, PDF oder Word liest und wie die Cueliste in grandMA3 kommt.',
    },
  },
  {
    date: '2026-10-05',
    en: {
      title: 'Faster first load',
      text: 'The front page shows its content from the first paint, and the PDF reader loads once the browser is idle.',
    },
    no: {
      title: 'Raskere første lasting',
      text: 'Forsiden viser innholdet fra første tegning, og PDF-leseren lastes når nettleseren er ledig.',
    },
    de: {
      title: 'Schnelleres erstes Laden',
      text: 'Die Startseite zeigt ihren Inhalt ab dem ersten Bild, und der PDF-Leser lädt, sobald der Browser frei ist.',
    },
  },
  {
    date: '2026-10-05',
    en: {
      title: 'Questions and answers, and a contact address',
      text: 'An FAQ on the front page about file types, privacy, importing on the console, versions and cue numbers. Questions and feedback go to hello@cuesetter.com.',
    },
    no: {
      title: 'Spørsmål og svar, og en kontaktadresse',
      text: 'Spørsmål og svar på forsiden om filtyper, personvern, import i konsollen, versjoner og cuenumre. Spørsmål og tilbakemeldinger går til hello@cuesetter.com.',
    },
    de: {
      title: 'Fragen und Antworten und eine Kontaktadresse',
      text: 'FAQ auf der Startseite zu Dateitypen, Datenschutz, Import am Pult, Versionen und Cue-Nummern. Fragen und Feedback gehen an hello@cuesetter.com.',
    },
  },
  {
    date: '2026-10-05',
    en: {
      title: 'Built for the phone',
      text: 'A compact header and step bar, a fixed bar at the bottom with Back and Next, and cue rows on two lines. A long review takes far less scrolling.',
    },
    no: {
      title: 'Laget for mobilen',
      text: 'Kompakt header og steglinje, fast bunnlinje med Tilbake og Neste, og cuerader på to linjer. En lang gjennomgang krever langt mindre scrolling.',
    },
    de: {
      title: 'Für das Handy gebaut',
      text: 'Kompakte Kopfzeile und Schrittleiste, eine feste Leiste unten mit Zurück und Weiter und Cue-Zeilen auf zwei Zeilen. Eine lange Durchsicht braucht viel weniger Scrollen.',
    },
  },
  {
    date: '2026-10-04',
    en: {
      title: 'Fix: PDFs in Safari on iPhone',
      text: 'PDF run sheets could not be read in Safari on iPhone. They can now.',
    },
    no: {
      title: 'Fiks: PDF-er i Safari på iPhone',
      text: 'Kjøreplaner i PDF kunne ikke leses i Safari på iPhone. Nå kan de det.',
    },
    de: {
      title: 'Fix: PDFs in Safari auf dem iPhone',
      text: 'Ablaufpläne als PDF konnten in Safari auf dem iPhone nicht gelesen werden. Jetzt geht es.',
    },
  },
  {
    date: '2026-10-04',
    en: {
      title: 'Word and Excel',
      text: 'Reads .docx and .xlsx as well as PDF. Each sheet or Word table can be picked as the source, and Excel clock times show as HH:MM. A row can be deleted straight from the review, with undo.',
    },
    no: {
      title: 'Word og Excel',
      text: 'Leser .docx og .xlsx i tillegg til PDF. Hvert ark eller hver Word-tabell kan velges som kilde, og klokkeslett fra Excel vises som TT:MM. En rad kan slettes rett fra gjennomgangen, med angre.',
    },
    de: {
      title: 'Word und Excel',
      text: 'Liest neben PDF auch .docx und .xlsx. Jedes Tabellenblatt und jede Word-Tabelle lässt sich als Quelle wählen, und Uhrzeiten aus Excel erscheinen als HH:MM. Eine Zeile lässt sich direkt in der Durchsicht löschen, mit Rückgängig.',
    },
  },
  {
    date: '2026-10-04',
    en: {
      title: 'Reads more real run sheets',
      text: 'Landscape pages, end-time columns, overlapping headers and duration and title in one cell. Items without a number get one between their neighbours (28, 28.5, 29), so the rest of the list keeps its numbers.',
    },
    no: {
      title: 'Leser flere ekte kjøreplaner',
      text: 'Liggende sider, kolonner for sluttid, overlappende overskrifter og varighet og tittel i samme celle. Punkter uten nummer får et nummer mellom naboene (28, 28.5, 29), så resten av listen beholder numrene sine.',
    },
    de: {
      title: 'Liest mehr echte Ablaufpläne',
      text: 'Querformat-Seiten, Spalten für die Endzeit, überlappende Überschriften und Dauer und Titel in einer Zelle. Punkte ohne Nummer bekommen eine zwischen ihren Nachbarn (28, 28.5, 29), so behält der Rest der Liste seine Nummern.',
    },
  },
  {
    date: '2026-10-04',
    en: {
      title: 'CueSetter on cuesetter.com',
      text: 'The converter in five steps: upload, columns, review, settings and export. In English and Norwegian, with light and dark mode, a sample run sheet, and drag and drop in the review.',
    },
    no: {
      title: 'CueSetter på cuesetter.com',
      text: 'Konverteren i fem steg: last opp, kolonner, gjennomgang, innstillinger og eksport. På engelsk og norsk, med lys og mørk modus, en eksempel-kjøreplan og dra og slipp i gjennomgangen.',
    },
    de: {
      title: 'CueSetter auf cuesetter.com',
      text: 'Der Konverter in fünf Schritten: Hochladen, Spalten, Durchsicht, Einstellungen und Export. Auf Englisch und Norwegisch, mit hellem und dunklem Modus, einem Beispiel-Ablaufplan und Drag and Drop in der Durchsicht.',
    },
  },
  {
    date: '2026-10-04',
    en: {
      title: 'Tested in grandMA3 onPC 2.5.1.0',
      text: 'The macro imports and builds the sequence with the right cue numbers and names, including sub-cues and the Note field. What goes in the Note field (start time and duration, the rest of the title) is now optional.',
    },
    no: {
      title: 'Testet i grandMA3 onPC 2.5.1.0',
      text: 'Makroen importeres og bygger sekvensen med riktige cuenumre og navn, også under-cuer og Note-feltet. Hva som legges i Note-feltet (starttid og varighet, resten av tittelen) er nå valgfritt.',
    },
    de: {
      title: 'Getestet in grandMA3 onPC 2.5.1.0',
      text: 'Das Makro wird importiert und legt die Sequenz mit den richtigen Cue-Nummern und Namen an, auch Sub-Cues und das Note-Feld. Was ins Note-Feld kommt (Startzeit und Dauer, der Rest des Titels), ist jetzt wählbar.',
    },
  },
  {
    date: '2026-10-01',
    en: {
      title: 'First version',
      text: 'A run sheet as PDF or text becomes a grandMA3 macro that builds one sequence with one named cue per item. The cue list can be edited before export, and the command line is there as a backup.',
    },
    no: {
      title: 'Første versjon',
      text: 'En kjøreplan i PDF eller tekst blir en grandMA3-makro som bygger én sekvens med én navngitt cue per punkt. Cuelisten kan redigeres før eksport, og kommandolinjen ligger klar som reserve.',
    },
    de: {
      title: 'Erste Version',
      text: 'Ein Ablaufplan als PDF oder Text wird zu einem grandMA3-Makro, das eine Sequenz mit einem benannten Cue pro Punkt anlegt. Die Cueliste lässt sich vor dem Export bearbeiten, und die Kommandozeile steht als Notlösung bereit.',
    },
  },
];

/** The entries grouped by day, newest first, in one language. */
export function changelogByDate(locale: Locale): { date: string; items: ChangelogText[] }[] {
  const groups: { date: string; items: ChangelogText[] }[] = [];
  for (const e of CHANGELOG) {
    const last = groups[groups.length - 1];
    if (last?.date === e.date) last.items.push(e[locale]);
    else groups.push({ date: e.date, items: [e[locale]] });
  }
  return groups;
}

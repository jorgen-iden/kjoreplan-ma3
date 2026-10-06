# Synlighet i søk og AI – plan og sjekkliste

Mål: topp 4 på Google og nevnt i AI-svar (ChatGPT, Perplexity, Google AI) for søkeordene i `docs/seo-keywords.md`.
AI-svar bygger mest på det andre skriver om oss (forum, YouTube, lister), så halvparten av jobben skjer utenfor nettstedet.

Status: ✅ ferdig · 🟡 klart, venter på eieren · ⬜ ikke startet

## 1. Bing, IndexNow og samme navn overalt

- ✅ **IndexNow**: hver produksjonsbygging på Vercel sender alle sidene til Bing (`scripts/indexnow.ts`, nøkkelfil i `public/`).
- 🟡 **Bing Webmaster Tools** (ChatGPT-søk og Copilot bruker Bings indeks):
  1. Gå til https://www.bing.com/webmasters og logg inn (Microsoft- eller Google-konto).
  2. Velg **Import from Google Search Console** – da hentes nettstedet og sitemap automatisk. Ellers: legg til `https://cuesetter.com`, velg DNS-verifisering og legg TXT-posten i Namecheap (Advanced DNS → Add New Record → TXT, Host `@`), som for Google.
  3. Under **Sitemaps**: send inn `https://cuesetter.com/sitemap.xml` hvis den ikke er med.
- 🟡 **Profiler**: opprett en LinkedIn-side og en YouTube-kanal, begge med navnet «CueSetter», logoen (`src/app/icon.svg`) og teksten under. Legg URL-ene i `SOCIAL_PROFILES` i `src/lib/site.ts` (eller be Claude gjøre det); de blir `sameAs` i JSON-LD.

  > CueSetter gjør kjøreplanen fra produksjonen om til en navngitt cueliste i grandMA3 på ett minutt. Last opp PDF, Word eller Excel og få en makro som bygger sekvensen. Alt skjer i nettleseren. Laget av bransjen, for bransjen. https://cuesetter.com

## 2. Demovideo

- ✅ Visning på forsiden og `VideoObject` i JSON-LD er klar: fyll inn `DEMO_VIDEO` i `src/lib/site.ts` (YouTube-ID, dato, varighet som `PT1M20S`), så dukker den opp.
- 🟡 **Opptak** (60–90 sek, ingen tale nødvendig, tekst på skjermen):

  | Tid | Bilde | Tekst på skjermen |
  |---|---|---|
  | 0–5 s | En PDF-kjøreplan åpen | «The run sheet just arrived. 40 items.» |
  | 5–15 s | Dra filen inn i cuesetter.com/app | «Drop it into CueSetter» |
  | 15–30 s | Kolonnene markeres, rull gjennom cuene, del en settliste i under-cuer | «Columns found. One cue per item.» |
  | 30–40 s | Last ned makro (ZIP), pakk ut på minnepinne | «Download the macro» |
  | 40–60 s | onPC: Show Creator → Macros → importer → kjør | «Import on grandMA3. Run once.» |
  | 60–75 s | Sekvensen med navngitte cuer, trykk GO | «Run sheet in. Cue list out. cuesetter.com» |

  Tittel: **PDF run sheet to grandMA3 cue list in one minute**
  Beskrivelse: første avsnitt fra forsiden + lenke til https://cuesetter.com og https://cuesetter.com/guides/import-macro-grandma3
  Lag også en norsk versjon («Kjøreplan i PDF til cueliste i grandMA3 på ett minutt») eller norske undertekster.

## 3. Gratis maler ✅

`/run-sheet-template` med Excel- og Word-maler (en, no og de). Nedlastinger telles i Vercel som `Template downloaded`.
✅ Variantene `/run-of-show-template` (US) og `/running-order-template` (UK) bruker de samme filene, med egen tekst og FAQ. Malforhåndsvisning og nedlasting styres av `hero: 'template'` i `src/lib/content-pages.ts`.
Innholdet ligger i `src/lib/templates.ts`; kjør `npm run templates` etter endringer.

## 4. «Hva er en kjøreplan?» ✅

`/what-is-a-run-sheet` med definisjon, innhold, andre navn (fra navnelisten) og forskjellen på kjøreplan og cueliste.

## 5. Der operatørene er 🟡

Post selv, fra egen konto, ett sted om gangen med noen dagers mellomrom. Svar på alle kommentarer. Aldri flere kontoer, aldri falske anbefalinger.

**MA Lighting forum / r/lightingdesign / ControlBooth (engelsk):**

> **Free tool: turn a PDF/Word/Excel run sheet into a grandMA3 cue list**
>
> We work in live events, and the same thing kept happening before every show: the run sheet arrives as a PDF, late, and someone types 40 cue names into the console while the lighting waits.
>
> So we built CueSetter (https://cuesetter.com). You upload the run sheet as it is – PDF, Word or Excel – check the columns and cues, and download a macro. Import it on the console (or onPC), run it once, and you have a sequence with one named, empty cue per item. Cue numbers follow the run sheet, and a set list can be split into sub-cues.
>
> It runs in the browser; the file is never uploaded. It’s free to try, no account.
>
> It’s tested on most recent grandMA3 versions. If it doesn’t read your run sheet properly or the macro fails on your version, I’d really like to hear about it – that’s the main reason for posting.

**Facebook-grupper for lys- og teknikkfolk (norsk):**

> **Gratis verktøy: kjøreplan til cueliste i grandMA3**
>
> Vi jobber i bransjen og har sett det samme før hver forestilling: kjøreplanen kommer på PDF, ofte sent, og noen sitter og taster inn 40 cuenavn mens lyset venter.
>
> Så vi har laget CueSetter (https://cuesetter.com/no). Last opp kjøreplanen slik den kommer – PDF, Word eller Excel – sjekk kolonnene og cuene, og last ned en makro. Importer den på konsollen eller onPC, kjør den én gang, og du har en sekvens med én navngitt cue per punkt. Cuenumrene følger kjøreplanen, og settlister kan deles i under-cuer.
>
> Alt skjer i nettleseren, filen lastes aldri opp. Gratis å prøve, uten konto.
>
> Leser den ikke kjøreplanen din riktig, eller virker ikke makroen på din versjon? Si fra – det er derfor jeg poster.

**Kataloger:**
- **AlternativeTo** (https://alternativeto.net): legg til CueSetter som alternativ til *Timecode Creator*, *Moving Light Assistant* og *Export CueList for gma3*. Kategori: Lighting / Utilities. Lisens: Free. Plattform: Online. Beskrivelse: teksten under punkt 1.
- **Lister på GitHub** («awesome lighting», «awesome grandMA3»): foreslå en lenke med én linje: `CueSetter – turn a PDF, Word or Excel run sheet into a grandMA3 cue list macro, in the browser.`

## 6. Guider

- ✅ `/guides/import-macro-grandma3` (en og no): hvor filen skal ligge, Show Creator, kommandolinjen som reserve, hvordan makrofilen ser ut.
- 🟡 Skjermbilder fra onPC (Show Creator med Macros valgt, Macros-poolen etter import) gjør guiden sterkere. Send dem, så legger Claude dem inn.
- ✅ `/guides/label-cues-grandma3` (en, no, de): Label-kommandoen, mange navn på én linje med semikolon, 40 tegn, Note-feltet.
- ✅ `/guides/sub-cues-grandma3` (en, no, de): desimal-cuer, legge inn en cue mellom to, hvordan CueSetter nummererer (følg #, løpende, .1 .2, 12.5).
- ✅ `/csv-to-grandma3` (en, no, de): CSV åpnes i et regneark og lagres som .xlsx eller limes inn (CueSetter leser ikke .csv direkte).
- ✅ `/alternatives` (en, no, de): saklig sammenligning med Timecode Creator, Moving Light Assistant og Export CueList for gma3, med kilder og dato. Sjekk kildene hvert halvår.
- ✅ Formatsidene lenker til guidene og malen, og guidene lenker til formatsidene og hverandre.
- 🟡 Skjermbilder fra onPC av Label-kommandoen og en sekvens med 12.5 og 12.1 gjør de nye guidene sterkere.

## 7. Tysk (`/de`)

✅ Hele nettstedet og appen på tysk under `/de` (Ablaufplan, Regieplan), med tysk mal (`ablaufplan-vorlage`) og tyske kolonnenavn i importen (Nr., Uhrzeit, Dauer, Programmpunkt …). Tyskland er MA Lightings hjemmemarked.
🟡 La gjerne en tysktalende i bransjen lese gjennom tekstene.

## 8. Måling av AI-synlighet 🟡

Første mandag i måneden: still spørsmålene under i ChatGPT (med søk), Perplexity og Google (se om AI-oversikten vises). Bruk et privat vindu. Noter ✅ (CueSetter nevnt med lenke), 〰️ (nevnt uten lenke) eller ✖️.

| # | Spørsmål |
|---|---|
| 1 | How do I get a run sheet into grandMA3? |
| 2 | Convert a PDF run sheet to a grandMA3 cue list |
| 3 | Import a cue list from Excel into grandMA3 |
| 4 | Is there a tool that creates grandMA3 cues from a running order? |
| 5 | How do I import a macro into grandMA3? |
| 6 | Free run sheet template for events |
| 7 | What is a run sheet? |
| 8 | Hvordan får jeg kjøreplanen inn i grandMA3? |
| 9 | Lage cueliste fra kjøreplan |
| 10 | Mal for kjøreplan |
| 11 | Ablaufplan in grandMA3 importieren |
| 12 | Vorlage Ablaufplan Veranstaltung |

| Måned | ChatGPT | Perplexity | Google | Merknad |
|---|---|---|---|---|
| 2026-11 | | | | |

Les også Search Console (Ytelse → Søk) og Bing Webmaster (Search Performance) samme dag, og oppdater plasseringene i `docs/seo-keywords.md`.

# Kjøreplan → grandMA3

Gjør en kjøreplan (PDF eller innlimt tekst) om til en makro for grandMA3. Makroen bygger én sekvens med én tom, navngitt cue per punkt i kjøreplanen, i riktig rekkefølge.

Alt kjører i nettleseren. Ingen backend, ingen innlogging, og ingen filer forlater maskinen.

> **Status:** ZIP-importen er testet i grandMA3 onPC 2.5.1.0: makroen importeres, bygger sekvensen med riktige cue-numre og navn, og æ/ø/å vises riktig. Under-cuer og Note-feltet virker også. Andre MA-versjoner er **ikke testet** ennå. Se [Verifisering](#verifisering).

## Kom i gang

Krever Node 20 eller nyere.

```sh
npm install
npm run dev        # utviklingsserver på http://localhost:5173
npm test           # enhetstester (vitest)
npm run build      # typesjekk + statisk bygg til dist/
npm run preview    # server dist/ lokalt
npm run sample     # skriver fixtures/eksempel-kjoreplan.pdf (syntetisk kjøreplan til manuell testing)
```

## Deploy

`npm run build` gir en ren statisk side i `dist/` med relative stier (`base: './'`), så den kan legges hvor som helst:

- **Netlify:** build command `npm run build`, publish directory `dist`.
- **Vercel:** framework «Vite», output `dist`.
- **GitHub Pages:** bygg og publiser `dist/`, for eksempel med `actions/upload-pages-artifact` + `actions/deploy-pages`.

## Slik virker det

1. **Last opp** PDF (dra og slipp eller filvelger), eller lim inn tekst.
2. **Sjekk kolonnene:** verktøyet viser kolonnene det fant og hvilke som brukes til nummer, tid og tittel.
3. **Se over og rediger** cuene: rediger, slett, legg til, flytt, og del flerlinjede rader opp i under-cuer (13 → 13.1, 13.2 …; over ni linjer gir 13.01, 13.02 … så 13.10 aldri kolliderer med 13.1).
4. **Innstillinger:** sekvensnummer, cue-nummerering, sekvensnavn, MA-versjon, navneformat, notat og ClearAll. Siste valg huskes i `localStorage`.
5. **Last ned** en ZIP med `grandMA3/gma3_library/datapools/macros/<navn>.xml`, pluss importinstruks og kommandolinje-reserve.

Makroen inneholder:

```
ClearAll
Store Sequence 101 Cue 1
Label Sequence 101 Cue 1 "Velkommen"
Set Sequence 101 Cue 1 Property "Note" "Start 17:30 / …"     (hvis notat er på)
…
Label Sequence 101 "Kjøreplan dag 1"
```

## Kodeoversikt

```
src/
  parse/            PDF/tekst → tabell (rene funksjoner)
    table.ts        kolonnebasert tolking av posisjonert PDF-tekst
    lines.ts        linjebasert reserve når ingen header-rad finnes
    text.ts         innlimt tekst (tabulator-separert eller linjer)
    headers.ts      gjenkjenning av kolonneoverskrifter
    pdf.ts          pdf.js-oppsett i nettleseren
    pdf-items.ts    tekstuttrekk med x/y fra pdf.js
  cues.ts           tabell → cuer, under-cuer, cue-nummerering
  ma3/
    sanitize.ts     rensing av navn, XML-escape, filnavn
    macro.ts        kommandoer, makro-XML, kommandolinje (rene funksjoner)
    zip.ts          ZIP med mappestruktur
  config/ma-versions.json   MA-versjoner (legg til nye her)
  i18n/no.ts        alle tekster i grensesnittet
  main.ts           UI (vanilla TypeScript)
tests/              vitest; tests/helpers/runsheet.ts lager en syntetisk test-PDF
fixtures/           eksempelfiler
```

### PDF-tolkning

Tolkningen er kolonnebasert: header-raden (`#`, `Start`, `Duration`, `Title` …) gir kolonnegrensene, som brukes på alle sider. En ny rad starter når #- eller Start-kolonnen har en verdi; andre linjer fortsetter raden over, også over sideskift. Gjentatte header-rader, topp-/bunntekst som gjentas på flere sider, sidetall og metadata over header-raden filtreres bort. Uten header-rad brukes linjebasert tolkning. Skannede PDF-er uten tekstlag gir en melding om å bruke tekstfeltet (OCR er utenfor v1).

### Ekte eksempelfiler

Legg `navn.pdf` og `navn.expected.json` i `fixtures/`, så testes de automatisk (`tests/fixtures.test.ts`):

```json
{ "rows": [ { "number": "1", "start": "17:30", "name": "Dørene åpner" } ] }
```

Hjertebank-filen fra briefen er ikke lagt inn ennå. Til da dekker `tests/pdf-parse.test.ts` samme oppsett med en syntetisk PDF (24 punkter, gjentatt header, topp-/bunntekst, metadata, flerlinjede titler, Lyd/Kommentar-kolonner, rad delt over sideskift).

## Verifisering

grandMA3 sitt XML-format er ikke offentlig dokumentert. Strukturen i `src/ma3/macro.ts` er en antakelse som er bekreftet i praksis:

| Hva | Status |
| --- | --- |
| Import av ZIP/makro i onPC 2.5.1.0 (fil med `DataVersion="2.3.0.0"`) | ✅ Virker |
| Sekvens, cue-numre og cue-navn | ✅ Virker |
| æ, ø, å i navn | ✅ Virker |
| Under-cuer (23.1, 23.2 …) | ✅ Virker |
| Note-feltet (`Set … Property "Note"`) | ✅ Virker |
| Andre MA-versjoner og `DataVersion`-verdier i `ma-versions.json` | Ikke testet |

For å verifisere trengs en referanseeksport fra grandMA3 onPC i versjonen som brukes: en makro laget for hånd med `ClearAll`, `Store` av en vanlig cue og en under-cue (13.1), `Label` med «æøå», og en kommando som setter cuens Note-felt, eksportert til `macros`-mappen. Generatoren tilpasses deretter den eksakte strukturen (attributter, rekkefølge, `DataVersion`, Note-syntaks).

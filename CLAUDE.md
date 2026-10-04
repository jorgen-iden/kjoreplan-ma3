# Kjøreplan → grandMA3 (Cuesetter)

Web-app (Next.js 16, App Router, next-intl, Tailwind v4) som gjør kjøreplaner (PDF/tekst) om til grandMA3-makroer. Se README.md for oppsett og kodeoversikt.

## Arbeidsregler for prosjektet

- Kjernen i `src/lib/` er rene funksjoner med tester i `tests/`. Endringer der skal ha tester.
- Alle tekster i grensesnittet ligger i `messages/<språk>.json` (engelsk først, så norsk). Ingen hardkodet tekst i komponenter.
- Farger, fonter og avstander kommer fra tokenene i `src/app/globals.css` (`@theme`). Ingen tilfeldige hex-verdier i komponenter.
- Kjør `npm test`, `npm run typecheck` og `npm run build` før commit.
- Formatet på MA-makroen er verifisert i grandMA3 onPC 2.5.1.0. Endringer i `src/lib/ma3/` må testes i onPC før de regnes som ferdige.

## Kvalitetsstandard (gjelder all planlegging, koding og refaktorering)

Opptre som senior fullstack-utvikler og UI/UX-designer. Før en oppgave eller komponent markeres som ferdig, sjekk relevante punkter:

### 1. UI, UX og visuell ytelse
- **Designsystem:** konsistent fargehierarki, typografi og avstandsskala. Unngå hardkodede tilfeldige verdier.
- **Responsivitet:** web-først, men test og tilpass for mobil, nettbrett og desktop.
- **Tilgjengelighet:** semantisk HTML (`<main>`, `<nav>`, `<article>` …), ARIA der det trengs, god fargekontrast og synlig tastaturfokus (`focus-visible`).
- **Mikrointeraksjoner:** myke overganger på hover, klikk, åpning/lukking av modaler og menyer.
- **Interaktive tilstander:** knapper og skjemaer har `default`, `hover`, `active`, `disabled` og `loading`.

### 2. Feilhåndtering og kanttilfeller
- **404:** gjennomført side med tydelig knapp tilbake.
- **500 / Error Boundary:** fang krasj med «Prøv på nytt» i stedet for hvit skjerm.
- **Nettverksfeil:** brukervennlige meldinger (inline eller toast) med mulighet for nytt forsøk.
- **Tomme tilstander:** informative og pene skjermer for tomme tabeller, søk og lister.

### 3. Lasteopplevelse og ytelse
- **Lastetilstander:** skeleton loaders fremfor bare spinnere.
- **Ytelse:** lazy-loading av tunge komponenter og bilder, unngå unødvendig re-rendering.
- **Skjemavalidering:** i sanntid, med tydelige feilmeldinger under feltet.

### 4. Routing, SEO og metadata
- **Metadata:** egen tittel og beskrivelse per rute.
- **Deling og ikoner:** favicon, app-ikoner og Open Graph (`og:title`, `og:image`, `og:description`).
- **Navigasjon:** nettleserens tilbakeknapp og brødsmuler skal oppføre seg intuitivt.

### 5. Kodekvalitet og arkitektur
- **Modulering:** gjenbrukbare komponenter med ett ansvar hver.
- **Sikkerhet:** saniter brukerinput, hold sensitiv logikk i backend/API-ruter, og beskytt innloggede ruter (route guards).

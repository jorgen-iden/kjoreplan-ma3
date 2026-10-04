# Kjøreplan → grandMA3 (Cuesetter)

Web-app (Next.js 16, App Router, next-intl, Tailwind v4) som gjør kjøreplaner (PDF/tekst) om til grandMA3-makroer. Se README.md for oppsett og kodeoversikt.

## Arbeidsregler for prosjektet

- Kjernen i `src/lib/` er rene funksjoner med tester i `tests/`. Endringer der skal ha tester.
- Alle tekster i grensesnittet ligger i `messages/<språk>.json` (engelsk først, så norsk). Ingen hardkodet tekst i komponenter.
- Farger, fonter og avstander kommer fra tokenene i `src/app/globals.css` (`@theme`). Ingen tilfeldige hex-verdier i komponenter.
- Bevegelse kommer fra tokenene i `globals.css`: `ease-out-quint` (standard for alle overganger), `ease-out-back` (litt sprett), `animate-fade-in-up` (også som `animate-entry`), `animate-pop-in` og `animate-soft-pulse`. Alle lenker, knapper, felt og SVG-er får en myk overgang og fokusring fra `@layer base`, så komponenter trenger ikke gjenta det. Prosjektet bruker Tailwind v4, så temaet ligger i `@theme` i CSS, ikke i en `tailwind.config.ts`. Bruk `backwards` (ikke `forwards`) på animasjoner med `transform`, ellers forskyves elementer med `position: fixed` inni.
- `InteractiveGlow` (eller `<Card glow>`) gir en musefølgende glød på flater man jobber med (dropsone, innstillingskort, nedlasting). Ikke bruk den på tabeller og lange lister. Den er av på touch-enheter og ved redusert bevegelse.
- Kjør `npm test`, `npm run typecheck` og `npm run build` før commit.
- Formatet på MA-makroen er verifisert i grandMA3 onPC 2.5.1.0. Endringer i `src/lib/ma3/` må testes i onPC før de regnes som ferdige.

## Mappestruktur

- `src/app/` – ruter og Next.js-konvensjonsfiler (`layout`, `page`, `loading`, `error`, `not-found`, metadata-filer)
- `src/components/ui/` – gjenbrukbare byggeklosser i designsystemet (Button, Card, Notice, EmptyState, Skeleton …)
- `src/components/layout/` – delte skall (SiteHeader, LocaleSwitcher)
- `src/components/features/<feature>/` – funksjonsspesifikke komponenter (f.eks. `converter/`)
- `src/lib/` – ren logikk uten UI, med tester (`validation.ts` samler Zod-skjemaene)

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

## Next.js-standard (senior Next.js-utvikler og UI/UX-designer)

### 1. App Router-konvensjoner
- **Rutefiler:** bruk alltid konvensjonsfilene i `app/`: `not-found.tsx` (gjennomført 404), `error.tsx` med `'use client'` og «Prøv på nytt», `loading.tsx` med skeleton, og `layout.tsx` for delte skall uten unødvendig re-rendering.
  - Fallgruve: en `loading.tsx` over en rute som kaller `notFound()` gjør at 404 sendes med status 200 (streaming). Legg derfor `loading.tsx` bare på ruter som trenger den (i dag `[locale]/app/`), ikke på `[locale]/`.
- **Server vs. Client Components:** Server Components er standard. `'use client'` kun når komponenten trenger state, hooks eller event listeners.
- **Bilder:** alltid `next/image`, aldri `<img>`.

### 2. UI, UX og visuell ytelse
- **Styling:** Tailwind med tokenene i `globals.css`, responsivt med `sm:`/`md:`/`lg:`. Unngå hardkodede pikselverdier.
- **Tilstander:** alle knapper og interaktive elementer har `hover:`, `focus-visible:`, `active:`, `disabled:` og loading.
- **Tomme tilstander:** bruk `EmptyState` for tomme lister, tabeller og søk.
- **Tilgjengelighet:** semantisk HTML, synlig fokus og riktige ARIA-attributter.

### 3. Skjemaer, validering og sikkerhet
- **Skjemaer:** Server Actions med Zod-validering. Skjemaer som går til serveren valideres på nytt der.
- **Tilbakemelding:** valideringsfeil i sanntid under feltet, og innsendingsknapper deaktiveres under lasting.
- **Sikkerhet:** beskytt private ruter i `src/proxy.ts` (Next 16 sitt navn på middleware) eller direkte i Server Components. Sensitiv logikk ligger på serveren. Data fra nettleseren (localStorage, URL, skjema) er ikke til å stole på og valideres.

### 4. SEO og metadata
- **Metadata API:** `metadata` eller `generateMetadata()` per rute.
- **Ikoner og OG:** favicon, app-ikoner og Open Graph (`og:title`, `og:image`) på rotnivå.

### 5. Kodekvalitet
- **Typing:** streng TypeScript, aldri `any`.
- **Struktur:** rene komponenter i `components/ui/` og `components/features/`.

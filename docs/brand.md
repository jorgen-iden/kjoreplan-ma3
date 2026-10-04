# CueSetter – merkevareplattform

Kilden alle roller (Brand, Sales, Growth, UI/UX, Frontend) bygger på. Endres bare etter avklaring med eieren.

## Hvorfor vi finnes

Kjøreplanen kommer alltid sent, og den endrer seg. Hver gang sitter operatøren og taster inn 40 cuenavn i stedet for å lage lys. CueSetter gir den tiden tilbake.

## Posisjonering

> For lysoperatører på grandMA3 som får kjøreplanen fra produksjonen, er CueSetter verktøyet som gjør den om til en navngitt cueliste i konsollen på ett minutt. Andre verktøy krever et regneark eller en DAW-fil i riktig format. CueSetter leser dokumentet slik det kommer – PDF, Word eller Excel – og ingenting forlater maskinen.

**Kategorien vi vil eie:** «run sheet import for grandMA3» (norsk: «kjøreplan til lysbord»).

**Alternativene brukeren har i dag:**

| Alternativ | Hvorfor det ikke løser problemet |
|---|---|
| Taste inn for hånd | Det er problemet. |
| Timecode-/DAW-verktøy (Export CueList for gma3, Timecode Creator, MLA) | Krever strukturerte data (Reaper, MIDI, CSV). Kjøreplanen er en PDF. |
| Rundown-systemer (Shoflo, Rundown Studio, Cuez) | Lager kjøreplanen for produsenten, leverer den ikke til lysbordet. |

## Målgrupper

1. **Primær:** husoperatører og frilansere på konserthus, kulturhus og bedriftsarrangementer som kjører grandMA3.
2. **Sekundær:** tekniske sjefer på venues (senere et team-/venue-nivå).
3. **Vekstkanal:** produsentene som sender kjøreplanen. På sikt kan de dele den som en CueSetter-lenke.

## Historien

Sann og generisk: ingen navn og ingen enkeltpersoner. Ikke pynt den med påstander som ikke stemmer (se «Påstander» under), og ikke skryt av selvfølgeligheter som at verktøyet er testet.

**Norsk:**
> CueSetter startet backstage. Før hver forestilling skjedde det samme: kjøreplanen kom på PDF, ofte sent, og hvert punkt måtte tastes inn i konsollen for hånd mens lyset ventet. Vi jobber selv i bransjen og har sett det skje igjen og igjen. Så vi bygde verktøyet som gjør jobben på ett minutt, slik at tiden går til lyset.

**English:**
> CueSetter started backstage. Before every show the same thing happened: the run sheet arrived as a PDF, often late, and every item had to be typed into the console by hand while the lighting waited. We work in the industry and have seen it happen again and again. So we built the tool that does the job in a minute, so the time goes to the lighting.

**Signaturlinje:** «Laget av bransjen, for bransjen.» / «Made by the industry, for the industry.»

## Budskap

- **Overskrift (forsiden):** «Fra kjøreplan til cueliste på ett minutt» / «From run sheet to cue list in a minute».
- **Tagline (logo, OG-bilder, sosiale profiler):** «Kjøreplan inn. Cueliste ut.» / «Run sheet in. Cue list out.»
- **Bevis, i denne rekkefølgen:**
  1. Leser PDF, Word og Excel – slik kjøreplanen kommer.
  2. Filene forlater aldri maskinen.
  3. Cuenumrene følger kjøreplanen – også under-cuer og punkter uten nummer.
  4. Laget av bransjen, for bransjen.

## Personlighet: erfaren kollega på intercom

| Er | Er ikke |
|---|---|
| Rolig, presis, kollegial | Ivrig, selgende |
| Bruker konsollens ord: cue, sekvens, makro | Startup-språk: «sømløs», «revolusjonerende» |
| Ærlig om hva som er testet (onPC 2.5.1) | «Fungerer med alt» |
| Forutsigbar og regelbasert | «AI-drevet» – vi gjetter ikke, og det er et personvernargument |

**Skriveregler:** korte setninger, ingen utropstegn, ingen salgsfloskler. Feilmeldinger sier hva som skjedde og hva du gjør nå. Knapper sier hva som skjer («Last ned makro»), ikke hvordan det føles.

**Ordliste**

- **Bruk:** kjøreplan (run sheet), cue, cueliste (cue list), sekvens (sequence), makro (macro), konsoll (console), onPC, importer (import).
- **Unngå:** AI, enkelt, sømløs, revolusjonerende, kraftig, magisk, utropstegn.

## Påstander: må være sanne

Alt vi sier om oss selv skal kunne dokumenteres. Sjekk listen før ny tekst publiseres.

| Påstand | Grunnlag |
|---|---|
| Cuenumrene følger kjøreplanen | «Følg kjøreplanens #» er standard; settlister deles i .1, .2 med «Del opp»; manglende numre fylles mellom naboene. |
| Testet i grandMA3 onPC 2.5.1 (bare i eksportsteget, ikke som salgsargument – det forventer alle) | Verifisert import og kjøring av makroen. Nye versjoner legges til først når de er testet. |
| Filene forlater aldri maskinen | All lesing skjer i nettleseren. Endres hvis lagring i skyen innføres – da må teksten skille mellom gratis og lagrede kjøreplaner. |
| Leser PDF, Word og Excel | .pdf med tekstlag, .docx, .xlsx. Ikke skannede PDF-er eller gamle .doc/.xls. |
| Laget av bransjen | Eieren jobber i bransjen. Si aldri «laget av en lysoperatør». |
| Sitater og kundelogoer | Bare ekte, med samtykke. Ingen oppdiktede brukere. |

## Visuell identitet

- **Navn:** skrives alltid **CueSetter** (stor C og S). Domenet er små bokstaver: cuesetter.com.
- **Logo:** merket er en avrundet blå firkant med en cueliste (tre linjer) og cue-lyset foran første linje, fulgt av ordmerket «CueSetter» i Schibsted Grotesk Extrabold. Kilder: `src/components/ui/Logo.tsx` (nettsiden), `src/app/icon.svg` (favicon) og `src/lib/logo.tsx` (app-ikon og delingsbilde). Endres merket, endres alle tre.

- **Design-tokens:** retning B «Studio» i `src/app/globals.css` – varmt papir, blekk-tekst, én blå aksent. Mørk modus følger systemet.
- **Cue-lyset:** prikken i logoen (øverst til venstre i merket, foran tre cuelinjer) er et cue-lys, som lampen inspisienten tenner for operatøren. Den puster rolig i «standby», og blinker «GO» når en makro lastes ned (`<LogoMark />` i `src/components/ui/Logo.tsx`). Bruk den sparsomt: ett cue-lys per skjerm.
- **Mono-tall:** cuenumre og klokkeslett settes alltid i mono, som på konsollskjermen.
- **Hero-bilde:** delt visning, kjøreplanen til venstre og cuelisten til høyre, der rader flytter seg over.
- **Bilder:** ekte skjermbilder fra appen og onPC. Ingen stockfoto av konserter.

# TC Boden v14-7 – Provresultat i Examen och IU

Paketet innehåller bara uppdaterade/nya filer jämfört med v14-5. Uppdateringen v14-6 (scrollning i liggande planeringsapp) ingår också. Kan installeras ovanpå v14-5 eller v14-6.

## Installera

1. Packa upp och lägg in filerna i samma mappar i GitHub-projektet. Lägg även till de två nya filerna `app/exam-results.tsx` och `app/exam-results-values.ts`.
2. Publicera om sidan på Netlify.

Ingen ny SQL, inga nya beroenden eller miljövariabler krävs. Befintliga migreringar till och med v14-4 ska redan vara installerade.

## Ändringar

- På elevernas Examen ersätts den tidigare informationsrutan med Provresultat: System H, System M och Lokalt. Varje ruta har texten Ange resultat och ett procenttecken. Fälten ligger på en rad på dator och under varandra på mobil.
- Varje resultat är valfritt och kan vara 0–100 procent, även decimaler. Resultaten sparas via samma autosparande som övrig Examen. Servern kontrollerar värden och befintliga skrivbehörigheter. Chef kan läsa resultaten.
- Resultaten följer med i den sparade bedömningen, dess befintliga historik/säkerhetskopiering och utskrift/PDF. Äldre bedömningar fungerar utan nya resultat. Ett tomt fält är inte samma sak som 0 procent.
- I Personal → Individuell uppföljning har både Lokalt provresultat och Centralt provresultat platshållartexten Ange resultat. Befintliga värden och sparfunktioner behålls.
- Tidigare v14-6 ingår: planeringsappen kan scrollas i båda riktningarna i liggande läge. Toppmenyn och veckoväljaren ligger kvar.

## Kontroller

Produktionsbygge med TypeScript godkänt. Isolerade integrationstester med riktig API-kod och tillfällig testdatabas kontrollerar autosparande, återläsning, slutlig sparning, radering av enstaka resultat, 0/100/decimaler, äldre data, ogiltiga värden, behörigheter, versionskonflikter, sparade protokoll, historik och utskrift. Test: `node scripts/test-v14-7-exam-results.cjs`.

Den faktiska resultatkomponentens layout har kontrollerats isolerat i webbläsare med sidans CSS i ljust/mörkt läge och vid 390 respektive 1120 pixels bredd. Ingen ändring har gjorts i produktionsdatabasen eller på den publicerade hemsidan.

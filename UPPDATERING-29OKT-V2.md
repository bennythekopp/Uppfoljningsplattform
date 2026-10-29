# TC Boden – samlad uppdatering 29 oktober, version 2

## Installation

Komplettfilen innehåller hela hemsidan och samtliga tidigare uppdateringar. Uppdateringsfilen kan läggas ovanpå Komplett-28okt eller Komplett-29okt. Har du en äldre utgångsversion: använd komplettfilen.

1. Packa upp filerna i GitHub-projektets rot. Behåll dina befintliga miljövariabler och din databas.
2. Kör databasfilerna i nummerordning till och med `0034_planning_permissions_and_widths.sql`.
   - Har 0032 redan körts: kör 0033 och därefter 0034.
   - Har 0033 redan körts: kör endast 0034.
   - Migreringarna kan köras om utan att dina sparade inställningar återställs.
3. Gör en ny Netlify-deploy när du vill publicera. Inget har publicerats eller ändrats i produktionsdatabasen under utvecklingen.

## Alla överenskomna ändringar

- Varumärket heter TC Boden på inloggning, sidomeny, mobilhuvud och i sidans/appens namn. Inloggningens underrubrik är Instruktör | Handledare. Inloggade får Instruktör, Handledare eller Chef beroende på roll; administratörer får Instruktör som varumärkesunderrubrik. Kontots faktiska roll och behörigheter ändras inte.
- Elevsidans lilla rubrik är HANDLEDARENS BEDÖMNING. Den stora Ta bort bedömning-knappen bredvid Skriv ut är borttagen. Radering inne på moment och övriga tidigare raderingsfunktioner finns kvar.
- I Planering → Behörigheter kan administratören söka fram instruktörer och chefer. Instruktörer kan tilldelas Redigera eller Föreslå ändringar; chefer endast Föreslå ändringar. Läsare och förslagsbehöriga får inte ändra struktur eller bredd. Modulens synlighet styrs separat som tidigare. Förslag ändrar inte den gällande planeringen innan de godkänns. Befintligt rött utropstecken, granskning, kopiering av fritext och samlingsmail bevaras.
- Vid installationen behåller befintliga aktiva instruktörer utan direkt redigeringsrätt sin tidigare förslagsrätt. Nya tilldelningar och chefers förslagsrätt väljs av administratören. Behörigheter kontrolleras på servern även vid återkallad åtkomst. Planeringslogg och behörighetsinställningar är endast för administratörer.
- Administratörer och instruktörer med redigeringsbehörighet kan lägga till, ta bort och byta namn på fristående fritextkolumner. Personkolumnernas namn följer respektive konto.
- Dra i rubrikens högra kant för att ändra fritextkolumnens bredd. Uppgift-kolumnerna ändras tillsammans, medan fristående fritextkolumner kan anpassas individuellt. Bredden visas direkt under dragningen och sparas när man släpper. Den sparade bredden är gemensam för planeringen och finns kvar efter omladdning. Datum/Tur behåller sin kompakta bredd. Ett fokuserat breddhandtag kan även styras med vänster/högerpil. Konflikter skrivs inte över tyst.
- Planeringsmodulen på instruktörspanelen visar ett löpande datumintervall från idag, även över årsskiftet. Det följer modulens storlek och kräver inget manuellt årsbyte för januari.
- Planeringens årsvyer omfattar hela första och sista kalenderveckan. Årsbrytande veckor visas i båda berörda årsvyerna, exempelvis 28/12 2026–3/1 2027 (v. 53). Utanförvarande år anges diskret i datumkolumnen. Samma datum använder samma celler, förslag och historik; inga dubbletter lagras eller räknas i Operativa pass.
- Operativa pass ingår: årsöversikt januari–december med rullande kontroll av minst 30 pass per sex månader, gula/röda statusrutor runt berörda siffror, saknat antal och aktuell månads behov. Ingen förklaringstext nere till vänster. Administratören väljer räknade turer och nattregel i Turer som räknas. Resultaten bygger på planeringen, inte separat närvarobekräftelse. Se UPPDATERING-29OKT.md för detaljer.

Fyramånaderspåminnelsen efter godkänd examen, mobilzoomfixen, omedelbart Gemensamt/Privat-byte, turlistor per schemagrupp med kopiering, dokumentens sidinställningar och alla tidigare funktioner finns kvar.

## Kontroller

- Typkontroll och produktionsbygge godkända.
- Befintliga planeringstester och tester för Operativa pass, examensdatum och dokumentsidor godkända.
- Nya tester för kompletta ISO-veckor vid samtliga årsskiften 2020–2099, löpande datumintervall och rollbehörigheter godkända.
- Lokala tester av riktiga API-handlers mot PostgreSQL-kompatibel testdatabas: chefers förslag, instruktörers direkta ändringar och kolumnhantering, godkännande, återkallad behörighet, dold modul, bredd/revisionskonflikter, samma celler/förslag över årsskiftet, bevarade inställningar vid omkörning av migrering och befintliga operativa beräkningar/påminnelser.
- Ny visuell webbläsarkontroll kunde inte genomföras: förhandsvisningsmiljön skickade Vite-flaggor (`--host`, `--strictPort`) till Next.js och stoppade starten. Produktionsbygget passerar; gränssnittets draginteraktion är därför inte verifierad i webbläsare i denna leverans.

Inga riktiga mail har skickats. Ingen publicering har gjorts.

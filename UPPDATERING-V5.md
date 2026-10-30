# TC Boden – samlad uppdatering v5

## Installation
1. Packa upp ZIP-filen. Lägg filerna på samma sökvägar i ditt befintliga GitHub-projekt och ersätt motsvarande filer. Paketet innehåller även ändringarna från mobiluppdatering v4.
2. Databasen behöver den nya migrationen `netlify/database/migrations/0039_student_supervisors.sql`. Kontrollera att den tillämpas vid Netlify-deployen. Om du använder separat PostgreSQL kör du denna fil efter tidigare migrationer innan den nya funktionen används.
3. Publicera den uppdaterade koden via Netlify. Öppna den installerade planeringsappen online igen för att hämta de nya filerna.

Behåll övriga projektfiler, databas, miljövariabler och den fungerande Google Drive-anslutningen. Detta är ett uppdateringspaket, inte en fullständig ny webbplats.

## Ändringar
- Mindre handledartext på elevöversikten: namn 12 px och etiketter/datum 11 px. Nuvarande och kommande handledare visas bredvid varandra, med datum under namnen. KP1/KP2 är kvar.
- Tilldela, byt och ta bort handledare via elevens trepunktsmeny. Instruktör och administratör väljer handledare och startdatum i en popup. Chef har läsbehörighet.
- Datumstyrda tilldelningar med historik, även vid framtida byten och borttagningar. På valt datum visas eleven under Min elev hos den aktuella handledaren. Finns flera tilldelade elever visas samtliga där.
- Historiken visas till höger om KP1/KP2 i den ordinarie elevbedömningens utskrift/PDF. Historiska perioder har slutdatum, aktuell period markeras pågående och framtida tilldelningar visas med startdatum. Framtida avregistrering visas som Ingen handledare i översikten. Historiken bevaras även om ett användarkonto senare tas bort; handledarnamnet sparas med tilldelningen. Uppgifter från tiden före funktionen måste läggas in med riktiga startdatum om de ska finnas i historiken.
- Notisklockan ingår i den fasta menyraden på dator och mobil. Intill finns enbart frågeteckensymbolen som öppnar hjälppopupen.
- Hjälppopup med de tre ursprungliga guidebilderna, förstoring, kryss och Stäng-knapp. Ingen förklaringstext längst ner. Escape eller klick utanför stänger också.
- Förslag 2 i planeringen och planeringsappen: diskreta tonade bakgrunder och smala färgmarkeringar. Sparade färger och innehåll ändras inte. Både ljust och mörkt läge stöds.
- Anteckningar fyller tillgängligt skärmutrymme. Tillbaka-knappen är borttagen, skrivytan ligger högre upp och verktygsraden radbryts på mobil. Långa anteckningar scrollas inne i skrivytan.
- Föregående v4-ändringar ingår: appinloggning med undertiteln Planering, kalender/veckoväljare, avgränsad pull to refresh, kompakt vecka, backupknappar och sökrutornas temafärger.
- Google Drive-exporten tar med handledarhistorik som JSON i respektive personmapp.

## Verifierat
- Produktionsbygge och TypeScript.
- Befintliga kalender- och planeringstester.
- Nya API-/databastester: behörigheter, CSRF, samtidiga ändringar, ogiltiga datum, framtida tilldelning/borttagning, historik och aktivitetslogg.
- Befintliga backup-/Google Drive-tester med simulerade externa tjänster.
- Webbläsarkontroll med testdata på dator och mobil: elevöversikt, handledardialog, hjälpbilder, anteckningsytans storlek, handledartext i utskriftsinnehållet och hela veckans sju rader i planeringsappen.

Kontrollera efter publicering med era riktiga konton och uppgifter, särskilt en schemalagd handledarövergång och fysisk mobilanvändning. Ingen publicering eller ändring av produktionsdata har gjorts här.

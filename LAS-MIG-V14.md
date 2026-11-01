# TC Boden v14 – sparade uppdateringar

Detta är en uppdatering med endast ändrade och nya filer ovanpå fungerande v11, v12 eller v13. Bakåtpilsfixen, v12:s fulla skärmyta och v13:s mobilrättningar ingår. Töm inte repositoryt. Inga nya beroenden eller miljövariabler krävs.

## Installation

1. Kör den nya SQL-filen `netlify/database/migrations/0042_planning_mail_pending_queue.sql` i den befintliga databasen efter 0041, före driftsättning av denna kod. Kör inte om äldre migrationer. Befintlig data behålls. Den nya kolumnen skyddar återförsök av mejlutskick.
2. Packa upp ZIP-filen och ersätt motsvarande filer direkt i projektets rot, bredvid `package.json`. Behåll alla övriga filer, databas och Netlify-inställningar.
3. Publicera en ny produktionsdeploy i Netlify.
4. Öppna planeringsappen på nytt med internetanslutning. Om en tidigare sparad hemskärmsikon ligger kvar: ta bort just genvägen och lägg till appen från `https://tcboden.se/planering-app` igen. Ikoner kan ligga kvar i telefonens cache.

## Ingår

- Bakåtpilar utan ram: till vänster om modulrubriken på mobil/smal skärm, dolda över 900 px.
- Notisbjällrans ruta hålls inom den synliga skärmen, även när innehållet flyttas av pull to refresh. Långa notiser rullar och stängknappen är åtkomlig.
- Hjälprutan centreras och begränsas till skärmytan. Befintliga guider och förstoring finns kvar.
- V13:s luftigare aktivitetslogg och textanpassade backupfält/flikknappar samt v12:s fulla innehållsbredd ingår.
- Planeringsappens egen kalender-/tåglogga vid inloggning och i menyraden, utan bakgrundsplatta. Separata ikoner för iPhone, Android och maskbar Android-ikon. Webbplatsens vanliga logga behålls.
- Gemensam 220 px sidomeny i datorvyn, som planeringsmodulen. Profil och långa menytexter ryms genom radbrytning. Mobilens gemensamma utfällbara meny behålls.
- Redigera och Ändringsförslag kan sparas samtidigt. Hemsidan behåller direktredigering. Appen kan endast lämna förslag; administratören kan också föreslå där.
- Egna och andras väntande förslag kan läsas från berörd ruta i appen: författare, svensk tid, person, datum, ursprungligt/föreslaget värde och färger. Samma utropstecken som på hemsidan markerar tur-, uppgifts- och gemensamma rutor, även tomma.
- Varje ordinarie mejl innehåller samtliga väntande förslag, även tidigare mejlade. Godkända/slopade/ersatta förslag och tomma sammanställningar skickas inte. Mottagare och tidsschema behålls.
- Ett osäkert mejlutskick behåller sin låsta text och idempotensnyckel. Om förslagsurvalet sedan ändrats stoppas återförsöket för befintlig administratörskontroll, i stället för att skicka inaktuella förslag. En kö som aldrig skickats byggs om från aktuella uppgifter.

## Verifiering

- Produktionsbygge (Next.js med webpack), TypeScript och CSS-syntax godkända.
- Isolerade API-/PostgreSQL-tester: samtidiga behörigheter, administratörens appförslag, läsa andra författare, datumavgränsning, återkallad åtkomst och appens spärr mot direktredigering/granskning.
- Isolerade mejltester: alla väntande vid nästa dags utskick, uteslutna slutbehandlade förslag, tom kö, daglig dublettspärr, oförändrade återförsök och spärr/ombildning av inaktuella köer. Inga riktiga mejl skickades.
- Befintliga tester för planering/autosparning, pull to refresh, databasvila, backup/Google Drive och planeringsloggens sidbyte godkända.
- Visuell kontroll i fysisk iPhone/Safari/hemskärmsapp och Android återstår. Förhandsvisningsmiljön kunde inte starta projektets Next.js-kommando; inga visuella enhetstester påstås vara utförda.

Koden är levererad, inte uppladdad till ditt GitHub-repository eller publicerad på den riktiga sidan av assistenten.

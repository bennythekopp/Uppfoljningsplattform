# Planering – ändringsförslag och samlingsmail, 28 oktober 2026

## Installera
1. Packa upp uppdateringen i projektets rot och ersätt motsvarande filer. Komplettfilen innehåller hela webbplatsen och tidigare uppdateringar.
2. Kör `netlify/database/migrations/0032_planning_suggestions.sql` i samma databas som webbplatsen, efter 0031. Inga befintliga planeringsrutor tas bort. Migreringen kan köras igen.
3. För mail: skapa en Resend-nyckel och verifiera din avsändardomän i Resend. Lägg till följande miljövariabler i Netlify för Functions:
   - `RESEND_API_KEY`: din privata API-nyckel.
   - `PLANNING_MAIL_FROM`: exempelvis `Instruktörer TC Boden <planering@din-domän.se>`. Använd en verifierad avsändare.
   - `APP_ORIGIN`: `https://handledare.netlify.app`.
   - Databasen använder befintlig `NETLIFY_DB_URL` eller `DATABASE_URL`; den måste också vara tillgänglig för den nya funktionen.
4. Lägg upp projektet i GitHub och gör en ny Netlify-deploy. Kontrollera att funktionen `planning-digest` visas som Scheduled i Netlify.
5. Som administratör: Planering → Mailinställningar. Välj mottagande instruktör/administratör, mailadress, varje dag eller nästa arbetsdag och klockslag. Aktivera och spara. Mottagaren måste ha tillgång till Planering.

Mail börjar inte skickas förrän tjänsten är konfigurerad och funktionen är driftsatt. Inga riktiga mail har skickats vid utvecklingstesterna. Resend är en separat tjänst för mailutskick.

## Användning
- Instruktörer med synlighet men utan redigeringsbehörighet skriver direkt i Tur/Uppgift eller gemensam fritextruta. Förslaget sparas när rutan lämnas. Det godkända innehållet, turens färg och nattpilar ändras först vid godkännande.
- Ett litet rött utropstecken visas i rutans övre högra hörn. Det går även att öppna samtliga väntande förslag via knappen Ändringsförslag.
- Personer med redigeringsbehörighet kan godkänna eller slopa. Fritext kan kopieras. Flera personers förslag på samma ruta hålls separata. Ett nytt förslag från samma person ersätter personens tidigare väntande förslag i den rutan.
- Godkännande kontrollerar både rutans revision och grundschemats effektiva innehåll. Om rutan ändrats måste texten jämföras och vid behov kopieras manuellt. Ett gammalt förslag skriver aldrig över en ny ändring.
- Chefer är fortsatt läsbehöriga och kan inte lämna eller godkänna förslag. Rollförhandsvisning är skrivskyddad. Planeringsloggen är fortsatt endast synlig för administratörer.
- Administratören väljer mailinställningarna. Kompakta samlingsmail innehåller person, datum, ruta, nuvarande/föreslaget innehåll och förslagsställare. Förslag som redan hanterats före mailet visas med status. Ersatta förslag tas inte med.
- Dagliga mail skickas tidigast valt klockslag i svensk tid, inklusive sommar-/vintertid. Funktionen kontrollerar kön varje minut. Inga tomma mail skickas, högst ett nytt samlingsmail per dag. Ett missat utskick tas med vid nästa utskick.
- Nästa arbetsdag följer mottagarens godkända tur i Planering inklusive manuella turändringar och byten av grundschema. Tom tur, FP, ledig, Semester, sjuk och föräldra-/tjänstledighet räknas inte som arbete. Andra manuellt inskrivna turnamn räknas som arbete. På arbetsdagen skickas mailet vid valt klockslag; nattpass räknas till datumet där turen börjar.
- Mailkön sparas före utskick. Vid tillfälligt fel återanvänds samma innehåll och idempotensnyckel. Efter 23 timmar med osäker leverans pausas kön för kontroll hos Resend. Administratören kan därefter bekräfta skickat eller ej skickat i Mailinställningar. Detta förhindrar automatiska dubletter efter att mailtjänstens idempotensskydd löpt ut.

## Kontroller
Produktionsbygge, typkontroll, befintliga planeringstester, lokal databas med verkliga API-anrop samt webbläsartester på dator/mobil. Förslagsisolering, ersättning, godkänn/slopa, revisionskonflikter, behörigheter, mailinnehåll/HTML-escaping, svensk tidszon, arbetsdag, sparad kö och återförsök har kontrollerats utan riktiga utskick.

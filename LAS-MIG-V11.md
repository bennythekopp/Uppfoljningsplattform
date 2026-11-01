# TC Boden v11 – samlade ändringar från kodningsminnet

Komplett Next.js-hemsida och fristående planeringsapp för befintlig Netlify-drift. Innehåller tidigare v10 inklusive Testa utskick, Google Drive-backup och databasvila. Detta är programkod, inte en kopia av produktionsdatabasen eller miljövariablerna. Ingen flytt till Loopia ingår.

## Installera ovanpå fungerande v10

1. Ta en aktuell säkerhetskopia av databasen och behåll den tidigare fungerande koden.
2. Kör ENDAST den nya SQL-filen `netlify/database/migrations/0041_planning_app_sessions_and_colors.sql` i befintlig databas, efter 0040. Den lägger till sessionsomfattning och färgfält för ändringsförslag. Befintliga konton, planeringar, dokument och historik behålls. Kör inte om gamla migrationer. Gör detta före publicering av v11 eftersom den nya koden använder de nya kolumnerna. Vid uppgradering från äldre än v10 måste tidigare migrationer först vara tillämpade.
3. Packa upp komplett ZIP och lägg filerna direkt i roten av befintligt GitHub-projekt, bredvid `package.json`. Ersätt motsvarande filer. Behåll Netlifys miljövariabler och befintlig databas. Du behöver inte tömma repositoryt.
4. Om du använder delpaketen: packa upp ALLA delar till SAMMA mapp och slå ihop mapparna. Varje del har högst 100 filer; ingen del är en fristående hemsida. Publicera först när samtliga delar finns på plats.
5. Publicera en ny produktionsdeploy i samma Netlify-projekt. Byggkommandot är fortsatt `npm run build`. Inga nya beroenden eller miljövariabler krävs.
6. Stäng gamla flikar och hemskärmsappen och öppna dem online igen så att äldre kod inte fortsätter göra anrop. Planeringsappens cacheversion är uppdaterad.

## Ingår

- Gemensamt | Privat: tydlig aktiv text och rak understrykning i båda teman, utan röd knappbakgrund eller rundad ram.
- Noindex via robots-metadata och HTTP-header för hela sidan, inklusive login, setup och planeringsappen. Robots.txt tillåter att sökmotorer läser noindex.
- På mobilwebben flyttas hela innehållet under den fasta toppmenyn vid pull to refresh. Samma uppdateringssymbol används i planeringsappen. Inmatning, öppna dialoger, horisontella gester och rullytor som inte nått toppen ska inte starta uppdateringen. Sparning slutförs före uppdatering.
- Enkel bakåtpil vid modulrubriken i instruktörspanelens mobilmoduler. Dokument och anteckningar sparas före återgång. Osparade Grundschema-ändringar kräver bekräftelse innan de lämnas.
- Planeringsappen: detaljruta för samtliga tur-, uppgifts- och gemensamma rutor, även tomma. Behöriga får Föreslå ändring. Tur använder samma turlista och färger som hemsidan samt fritext. Uppgift använder fritext och färgval. Bara vald ruta omfattas.
- Uppgiftstext och föreslagen färg lagras som ett förslag. Godkännande på hemsidan tillämpar dem i samma transaktion. Ändrad text/färg sedan förslaget skrevs stoppar godkännande så att någon annans ändring inte skrivs över. Befintligt ändringsförslagsmail visar även färgändringen.
- Planeringsbehörighet: etiketten Ändringsförslag gäller både hemsida och app. Redigera har företräde. Appen kan aldrig direktredigera eller godkänna genom sin egen inloggning; redigering finns på hemsidans fullstora planering.
- Ingen automatisk utloggning efter 30 minuters inaktivitet. Vanliga sessioner gäller fortsatt högst åtta timmar från inloggning. Manuell utloggning, inaktiverade konton, ändrade behörigheter och serverns kontroller gäller fortsatt.
- Håll mig inloggad: valfri kryssruta på planeringsappens login, högst 30 dagar från inloggning. Separat HttpOnly-cookie och serverlagrad hash; hemsidans vanliga session förlängs inte. Utloggning återkallar appsessionen. Inga lösenord eller inloggningstoken sparas i localStorage och inga keep-alive-anrop införs när appen är stängd/inaktiv.

## Automatiska uppdateringar

- Ta bort periodisk hämtning av tillgängliga moduler, Grundschema och handledartilldelningar. Hämtning vid öppning/manuell uppdatering och nödvändiga uppdateringar efter egna ändringar finns kvar.
- Instruktörspanelens innehåll och listor: 60 sekunder (tidigare 15).
- Grundschemaöversikt utom turvyn: 60 sekunder (tidigare 15).
- Övriga intervall och autosparandet är oförändrade. Paus efter två minuters inaktivitet, dold flik och offline behålls. Detta är en annan regel än den borttagna inloggningstimern.
- Färre frågor garanterar inte motsvarande minskning av Database compute. Andra användare, gamla flikar och externa anrop kan hålla databasen aktiv.

## Domäner och Google

Noindex gäller alla värdnamn som serverar denna app: tcboden.se, www.tcboden.se och handledare.netlify.app samt fjtkl.se om appen nås där. Behåll befintlig omdirigering från fjtkl.se till tcboden.se. En omdirigering hos en extern domänleverantör ändras inte av kodpaketet: kontrollera att dess slutmål är denna app och skickar noindex. Själva vidarekopplingssvaret kan behöva konfigureras hos leverantören om även det ska ha X-Robots-Tag.

Redan indexerade URL:er försvinner inte omedelbart. I Google Search Console kan ägaren använda Borttagningar → Ny begäran för relevanta adresser på respektive domän, tillsammans med permanent noindex. Den tillfälliga borttagningen ersätter inte noindex. Ingen Search Console-åtgärd eller DNS-ändring har gjorts av assistenten.

## Verifierat i utvecklingsmiljön

- Produktionsbygge inklusive TypeScript godkänt.
- Verkliga API-anrop mot en isolerad PostgreSQL-kompatibel testdatabas: borttagen inaktivitetsgräns, absolut giltighetstid, avstängda konton, 8h/30d-cookie, app-/webbseparation, behörigheter och utloggningsåterkallelse.
- Ändringsförslag: inga direkta planeringsändringar, redigeringens företräde, text+färg, färgförslag utan textändring, upprepade anrop, ogiltig färg och konflikt efter samtidig färgändring.
- Gester simulerade: rullgräns, fält/dialoger, horisontell rörelse, tröskel, gemensam förskjutning, samtidighetskontroll och städning av lyssnare.
- HTTP-kontroll av /, /setup, /planering-app och /robots.txt: noindex-header, sidornas robots-meta och tillåten hämtning.
- Befintliga tester för planering, kalender, viloläge, admin, loggsidor, handledartilldelningar, utskick och Google Drive-backup godkända. Inga riktiga mejl skickade eller produktionsuppgifter ändrade.
- Visuell webbläsarkontroll kunde inte köras eftersom Chromium saknas och nedladdningen misslyckades i miljön. Kontrollera särskilt bakåtpilar, popupens turlista, färger och pull to refresh i ljust/mörkt läge på en fysisk iPhone/hemskärmsapp och Android efter uppladdning. Kontrollera också stäng/öppna med Håll mig inloggad. 30-dagarsgränsen har verifierats med sessionsdata, inte genom att vänta 30 dagar.

Ingen publicering på den riktiga hemsidan har gjorts av assistenten.

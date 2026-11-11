# TC Boden V20 – samlad kodning av väntande krav

Komplett källkod för hemsidan och planeringsappen, baserad på V19.2 med backuprättningen från V19.3 och samtliga väntande funktionskrav från kodminnet den 11 november 2026.

## Installera

1. Ta en säkerhetskopia av databasen och behåll nuvarande publicerade version för återgång.
2. Om databasen redan är uppdaterad till och med 0047: kör **0048_mail_and_notice_options.sql** och därefter **0049_planning_column_history.sql** från `netlify/database/migrations`, före publicering.
3. Vid äldre installation krävs även tidigare migreringar i nummerordning. Kör inte om gamla migreringar utan att kontrollera deras instruktioner; de nya 0048 och 0049 är omkörbara.
4. Publicera hela projektet med samma Netlify/Next.js-byggmetod som tidigare. Behåll befintliga miljövariabler. Inga nya tjänster, nycklar eller paketberoenden behövs.
5. Planeringsappens cacheversion är `tcpa-shell-v20`. Stäng och öppna appen efter publicering om den visar den gamla versionen.

Detta är ett komplett källkodsprojekt som ska byggas. En rå uppladdning av källkoden som statiska filer är inte en Next.js-driftsättning. Databasen och Google Drive har inte ändrats eller anslutits här, och versionen är inte publicerad av assistenten.

## Funktioner

- Planeringsmail: Varje vecka med veckodag och klockslag samt Anpassat intervall i dagar/veckor från startdatum. Kalenderreglerna följer svensk tid inklusive sommar-/vintertid. Samtliga väntande förslag följer med; tomma mail och dubbla dagsutskick undviks.
- Schemaändringsnotiser: separata reglage för ändrade turer och ändrade uppgifter. Filtren gäller webbnotiser och telefonpush. Lästa schemanotiser ligger kvar i två timmar från första läsmarkeringen, per mottagare. Upprepad läsning förlänger inte tiden. Olästa notiser påverkas inte av tvåtimmarsregeln. Telefonens egen notishistorik styrs av telefonen.
- Dokument: nya kompakta flikar enligt förhandsbilden. Hela dokumentytan går att klicka för att fokusera redigeraren även på tomma delar. Infoga öppnar Bilder och emojis med sökning och kategorier, inklusive högtider. Egna bilder infogas med befintlig bildknapp. Markera en bild för att ändra bredd och vänster-/mitt-/högerplacering; bilder kan även flyttas som dokumentobjekt. Innehållet sparas i dokumentet och följer med vid export.
- Personlig planeringslayout: Uppgift-kolumner delar bredd inom den egna användarens webbläsare. Tur och Uppgift flyttas tillsammans. Andra användares vyer påverkas inte.
- Google Drive: pausade backupkontroller väcker inte databasen varje minut när ny inloggning krävs. Vanliga planeringsändringar återstartar inte pausen. En lyckad Google Drive-återanslutning väcker schemat. Förlorad anslutning har tydligare feltext; starta ny kopia efter återanslutning.
- Bakåt/Framåt: interna modul-/detaljbyten och dokumentflikar sparas i webbläsarhistoriken. Pågående sparningar slutförs före återgång; vid sparfel eller oskickad kommentar avbryts navigeringen. Webbläsarens vanliga möjlighet att lämna sidan finns kvar.
- Instruktörspanelen: Gemensamt är standard i moduler med Gemensamt/Privat vid ingång till panelen/översikten.
- Årsbundna kolumner: namnändring, tillägg, breddändring och borttagning av planeringskolumner gäller nuvarande kalenderår och framåt. Tidigare års kända kolumnversioner och innehåll bevaras. Export över årsskifte använder respektive års layout på separata Excelblad/PDF-avsnitt.
- Planeringsredigerare får lämna ändringsförslag i appen utan separat förslagsbehörighet. Appen kan fortfarande inte direktredigera planeringen.
- Administratörer visas i Planeringsbehörighet med sina faktiska, alltid aktiva administratörsrättigheter.
- Aktivitetsloggen visar försökt användarnamn vid misslyckad inloggning, även för okända konton. Lösenord sparas inte.

## Historik vid införandet

0049 sparar den kolumnstruktur som finns när uppdateringen installeras som utgångsläge för äldre år. Namn och kolumner som redan ändrats eller raderats i tidigare versioner kan inte återskapas retroaktivt utan äldre säkerhetskopior. Befintliga cellvärden raderas inte. Nya kolumnändringar versionshanteras därefter från nuvarande år.

Kolumnlayouten är fortsatt personlig per konto i aktuell webbläsare och synkas inte mellan enheter. PDF kan dela breda tabeller och långa rader över flera sidor. Emojis utseende beror på enhetens teckensnitt; kontrollera särskilt exporter och telefoner efter installation.

## Validering

Godkänt lokalt: TypeScript, produktionsbyggning, nya V20-integrationstester för API/databas/behörigheter/notisfilter/läsfrist/kolumnhistorik/årsöverskridande Excel/mailregler/inloggningslogg, navigationstester av den verkliga historikhooken samt dokumentprov för inbäddade bilder, emojis, bildmått/placering, Word och backup-PDF.

Tidigare regressionsprov för planering, förhandsvisning, notiser/push, mailkö, Google Drive-backup och databasvila har körts med isolerad databas och simulerade externa transporter. Inga riktiga mail eller pushnotiser har skickats.

Visuell webbläsar-/telefonkontroll är inte utförd: den hanterade förhandsvisningen skickade Vite-flaggor som Next.js inte accepterar. Kontrollera nya dokumentkontroller, mobilklick, bildflytt och bakåt-/framåtknappar på riktiga enheter efter testinstallation. Följ även GB-hours och funktionsloggar efter publicering; tidigare hög förbrukning har inte bevisats bero på enbart backupfelet.

Tester: `npm run typecheck`, `npm run build`, `npm run test:v20`, `npm run test:idle`, `npm run test:backup`, `npm run test:planning`, `npm run test:planning-update`, `node scripts/test-v16.cjs`, `node scripts/test-v17.cjs`, `node scripts/test-v14-digest.cjs`.

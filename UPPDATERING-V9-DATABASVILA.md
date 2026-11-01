# TC Boden v9 – paus vid inaktivitet och databasvila

Uppdateringspaket för den fungerande v8-versionen. Inte publicerat på produktionssidan.

## Installera
1. Packa upp ZIP-filen och lägg samtliga filer på motsvarande sökvägar i ditt GitHub-projekt. Ersätt filerna; behåll resten av projektet.
2. Publicera en gång via Netlify. Både package.json och package-lock.json ingår och måste följa med. Det nya beroendet @netlify/blobs installeras automatiskt vid bygget.
3. Ingen ny SQL-migration behövs ovanpå fungerande v8 med migration 0040. Befintlig databas, konton, historik och miljövariabler används.
4. Öppna hemsidan och den installerade planeringsappen online igen så att de laddar den nya versionen. Stäng äldre öppna flikar och appfönster; gammal kod kan annars fortsätta göra anrop.
5. Kontrollera ett sparat planeringsförslag, en schemalagd mailkörning och en Google Drive-backup efter publiceringen. Kontrollera att funktionerna planning-digest och sharepoint-backup körs utan Blobs-/behörighetsfel i Netlifys funktionslogg.

## Beteende för användare
- Alla återkommande nätverkshämtningar pausas direkt när en flik är dold eller enheten är offline.
- En synlig flik pausar återkommande hämtningar efter två minuter utan mus-, tangentbords-, pek-, inmatnings- eller skrollaktivitet.
- När fliken visas igen, användaren återupptar arbetet eller anslutningen kommer tillbaka hämtar de återkommande vyerna aktuella uppgifter igen.
- Omfattar instruktörspanel, dokument, gemensamma/privata anteckningar, planering, operativ sammanställning, grundschema, handledartilldelningar, notiser, modulbehörigheter, backupstatus och fristående planeringsapp. Flikar som redan bara hämtade data vid öppning eller användaråtgärd behåller det beteendet.
- Autosparning av riktiga ändringar och redan påbörjade anrop får slutföras även efter att fliken döljs. Ingen generell blockering av spara-, export- eller andra användaråtgärder införs.
- Dokumentens periodiska närvarosignal följer samma paus. Osparade ändringar behålls och befintlig konflikthantering gäller.
- Sessionskontrollen kontaktar inte servern under vila. Lokal nedräkning och utloggning vid känd tidsgräns fungerar fortfarande; serverns behörighets- och sessionskontroller är kvar vid varje API-anrop.

## Backup och schemalagda mejl
Backup och utskick måste kunna köras även när ingen är inne. De är därför undantag vid sina schemalagda tider.

- Schemaläggaren kontrollerar en liten post med nästa körningstid i Netlify Blobs i stället för att väcka PostgreSQL varje minut.
- Posten innehåller bara tid och teknisk versionsmarkering, inga personuppgifter, bedömningar eller e-postmeddelanden.
- Första körningen läser befintliga inställningar en gång. Därefter kontaktas databasen vid nästa relevanta körtid eller vid ändringar som kan påverka planering, mottagarbehörighet eller backup.
- Avstängda jobb slutar kontrollera databasen tills relevanta inställningar ändras.
- Klockslag beräknas i svensk tid, inklusive sommar-/vintertid. Dagliga och veckovisa körningar, äldre timintervall och tidsankrade intervall stöds.
- Nya planeringsförslag väcker kontrollen så att ett förslag som lämnas efter dagens utskickstid fortfarande kan skickas enligt befintliga regler.
- Felaktiga utskick försöks igen med 15 minuters mellanrum. Pågående/avbrutna backupjobb kan återupptas med 20 minuters mellanrum. Befintligt lås, kö, kvittens och skydd mot dubbla utskick/exporter behålls.
- Netlify Blobs är ett nytt driftberoende. Om tjänsten inte går att nå visas/loggas felet i stället för att tyst tappa schemaläggningsändringar. Vid ändrade servermiljövariabler: spara om mail-/backupinställningarna för att väcka respektive kontroll.

## Förväntad besparing och gränser
När alla användares nya flikar/appfönster är inaktiva eller stängda och inga schemalagda jobb behöver köras görs inga återkommande PostgreSQL-anrop från dessa funktioner. Databasen behöver sedan sin egen inaktivitetstid innan den går i vila. Enstaka besök, externa anrop, andra anslutningar, förhandsversioner och gamla öppna flikar kan fortfarande väcka den.

Netlifys funktions- och Blobs-anrop finns kvar och kan kosta krediter. Ingen exakt besparing utlovas. Jämför Database compute över ett par representativa dygn efter publiceringen. Första hämtningen efter databasvila kan ta lite längre tid.

## Verifiering
- Produktionsbygge och TypeScript godkända.
- Nya tester: dold flik, synlig men inaktiv flik, omedelbar återgång, avmontering och skydd mot överlappande hämtningar.
- Schemaläggningstester: SQL-fria väntetick, avstängda jobb, atomiska körningslås, samtidig inställningsändring, återförsök, dag-/veckotider, intervall och svenska DST-gränser.
- Befintliga API-/PostgreSQL-tester för backup, Google Drive, export till Word/PDF/Excel, admin/notiser, planeringsbehörigheter och loggens sidnumrering godkända.
- Externa tjänster simulerades i testerna. Verklig Netlify-/Blobs-/Google Drive-/Resend-drift och faktisk kreditbesparing behöver verifieras efter uppladdning.

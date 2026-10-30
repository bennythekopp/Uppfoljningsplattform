# TC Boden – samlad uppdatering 30 oktober 2026, version 3 – privat OneDrive

## Installera

Komplettfilen innehåller hela projektet med tidigare uppdateringar. Uppdateringsfilen innehåller bara ändrade och nya filer jämfört med **Komplett-29okt-v2**. Använd komplettfilen om du har en äldre version.

1. Lägg filerna i GitHub-projektets rot. Bevara miljövariabler och befintlig databas.
2. Kör `0035_operational_overrides_and_sharepoint.sql` efter 0034, därefter `0036_backup_selection_and_schedule.sql` och sist `0037_personal_onedrive.sql` i samma databas som hemsidan använder. Samtliga finns i `netlify/database/migrations/`. Har 0035 redan körts behövs 0036 och 0037. Har 0036 redan körts behövs bara 0037. Kör hela respektive fil. Dessa tre migreringar kan köras om utan att dina inställningar återställs. Äldre migreringar ska först köras i nummerordning.
3. Publicera koden via din vanliga Netlify-deploy. Nya paket installeras automatiskt från package-lock.json.
4. För OneDrive: följ **ONEDRIVE-INSTALLATION.md**. Automatisk export är avstängd tills administratören aktiverar den. De manuella passjusteringarna kräver ingen Microsoft-anslutning.

## Operativa pass

Administratören kan klicka på en persons månadssiffra i Planering → Operativa pass, ange antal och spara. Ursprungligt beräknat antal visas. **Använd beräknat** återställer månaden till beräkningen från planeringens turer. En liten asterisk markerar ett manuellt antal.

Det manuella antalet sparas på servern och används i månadsantal, sexmånaderssummor, behov och varningar, även över årsskiften. Personens faktiska turer ändras inte. Ett gammalt öppet formulär får inte skriva över en nyare korrigering. Ändringarna loggas i den administratörsskyddade planeringsloggen. Instruktörer och chefer med modulåtkomst kan läsa resultaten men inte ändra antal eller regler.

## Reservkopior till privat OneDrive

Administratören ansluter ett privat Microsoft-konto med Anslut OneDrive. Byt konto och Koppla från finns i samma ruta. Ingen SharePoint-webbplats eller manuell Drive/Root-ID krävs. Vid bytet stängs automatiken av tills kontot anslutits, lagringen godkänts och inställningarna sparats. Instruktioner: ONEDRIVE-INSTALLATION.md.


Administratörsverktyg har en sektion **Säkerhetskopiering** med intervall/tidpunkt, innehållsval, anslutningstest, Säkerhetskopiera nu och exporthistorik. Varje körning skapar en ny daterad mapp med:

- **Instruktörspanel**: separata mappar för Dokument, Mallar, Anteckningar, Att göra, Påminnelser, Anslagstavla, Introduktion, Mina favoriter, Mina snabbåtgärder, Grundschema och Planering. Panelinställningar och modulåtkomst följer också med.
- Dokument och dokumentmallar: Word, PDF och sparat originalinnehåll som JSON. Dokumentversioner och kommentarer följer med. Outlook-mallar finns som läsbar text och JSON.
- Anteckningar: Word/PDF/JSON med separata mappar för Gemensamt och Privat. Privata uppgifter hålls i separata personmappar; behörighet måste också begränsas i OneDrive.
- Planering: **Excel per år** med Tur/Uppgift, färger och årsblad för operativa pass. Fullständiga planeringsdata, schemaövergångar, behörighetsinställningar, manuella antal och väntande förslag finns även i JSON. Förslag räknas inte som godkända turer i Excel.
- **Personal**: en egen mapp per person med samtliga befintliga sparade IU-protokoll och elevhistorik, inklusive KP1, KP2 och Examen där sådan historik finns.
- **Elever**: en egen mapp per person med handledarbedömning, KP1, KP2 och Examen samt kommentarer och bedömningar. Pågående utkast märks separat och sparas som JSON.

Från denna uppdatering bevaras också fristående versioner vid uttrycklig sparning av KP, Examen och IU, och vid ändrad handledarbedömning/tillagd kommentar. De kan därmed följa med i senare exporter även om det senaste protokollet därefter skrivs över. Äldre versioner som redan har skrivits över och inte finns kvar i hemsidans historik kan inte återskapas retroaktivt.

Exporten är en konsekvent ögonblicksbild. Ändringar som sparas medan en export pågår tas med i nästa kopia. Varje jobb kan återupptas efter avbrott. Endast en körning pågår åt gången. **KLAR.txt** skapas först när alla filer har överförts; använd en tidigare komplett kopia om en ny körning har avbrutits. Efter upprepade fel visas Misslyckad och administratören kan försöka igen.

Detta är en läsbar reservexport, inte en automatisk fullständig databasåterställning. Originalformat/metadata bevaras i JSON; reserv-PDF:er är läsbara rapporter och kan skilja sig typografiskt från hemsidans utskrifter. Word bevarar bland annat tabeller, vanliga textformat och inbäddade PNG/JPEG-bilder. Andra bildformat/länkar bevaras i originalinnehållet. Kopiorna ersätter inte en separat databasbackup. Inga lösenord, sessionsnycklar eller API-hemligheter exporteras.

## Nya inställningar i administratörsverktygen

- **Hur ofta:** varje timme, var 6:e/12:e/24:e timme eller en vald svensk klocktid varje dag/vecka. Vid veckokörning väljs veckodag. Sommar- och vintertid hanteras med Europe/Stockholm. Schemaläggaren kontrollerar ungefär var femte minut; vald tid är startgränsen, inte en garanti för exakt klockslag eller slutförandetid. En missad veckodag tas vid nästa valda veckodag. Befintliga timintervall bevaras vid uppdateringen.
- **Samtliga filer:** en ny komplett kopia av alla modul- och personfiler.
- **Endast uppdaterade filer:** nya eller innehållsmässigt ändrade filer jämförs med tidigare *slutförda* exporter till samma OneDrive-mål. Första gången kopieras allt om det saknas ett jämförelseunderlag. Kopior från den tidigare kodversionen registreras inte retroaktivt som underlag. Inga tidsstämplar från en misslyckad körning används som bevis för att en fil är kopierad.
- **Utvalda filer:** sökbar mapp- och fillista för instruktörspanelen, Personal och Elever. Du kan välja hela moduler/personmappar eller enstaka exportfiler/protokoll. Val av mapp tar även med nya filer i den mappen vid kommande körningar. Ett dokument är en exportgrupp som innehåller Word/PDF/JSON; ett protokoll innehåller PDF/JSON.
- **Säkerhetskopiera nu:** kör direkt med sparade inställningar, även om automatiken är avstängd eller nästa schematid inte har nåtts. En redan pågående körning fortsätter i stället för att skapa en dubblett. Spara ändrade inställningar innan du trycker på knappen.
- Inställningar följer med som en fryst kopia i körningen. Om du ändrar inställningar medan en export pågår gäller ändringarna nästa körning. Överlappande ändringar av inställningarna skyddas av revisionskontroll.
- **Visa historik** visar körningarnas status och fel samt möjlighet att försöka igen.

### Viktigt vid kopiering av endast ändrade filer

Varje körning har fortsatt en daterad mapp. En ändringskopia innehåller själva de ändrade filerna; oförändrade filer ligger kvar i tidigare daterade mappar. **Filöversikt.txt** och **Exportinformation.json** visar var varje fil i kopian finns. En körning kan därför vara klar även om den inte innehåller alla filer fysiskt i sin egen mapp. Radera inte tidigare mappar som filöversikten hänvisar till. Välj Samtliga filer och kör Säkerhetskopiera nu när du behöver en ny fristående komplett kopia. Borttagning av originalfiler raderar inte gamla reservkopior; borttagna sökvägar anges i exportinformationen.

## Kontroller

- Typkontroll och Next.js-produktionsbygge.
- Befintliga planerings-, årsskiftes-, examensdatum- och sidinställningstester.
- Nytt `npm run test:backup`: riktiga API-handlers mot lokal PostgreSQL-kompatibel testdatabas; administratörsrättigheter, sparade korrigeringar, nollvärden, återställning, revisionskonflikter och korrigerad december i nästa års sexmånaderskontroll.
- Samma test verifierar separat protokollhistorik, befintliga kommentarer, privata modulmappar, kompletta årsarbetsböcker, Word/PDF, bevarade dokumentversioner, återupptagning efter simulerat nätverksavbrott och att exporten markeras klar först efter alla filer.
- Nya tester verifierar samtliga/ändrade/utvalda filer, oförändrade filers referenser, misslyckad körning utan framflyttat jämförelseunderlag, fil- och mappval, låsta körningsinställningar, manuell start med avstängd automatik, sparade tidsinställningar och svenska sommar-/vintertidsövergångar.
- Microsoft Graph-anrop testas med simulerade svar. Ingen riktig Microsoft-anslutning, uppladdning eller offline-synkronisering har provats: det kräver organisationens konfiguration.

Ingen publicering, produktionsdatabasändring eller riktig export har gjorts. Ingen ny visuell kontroll i webbläsare ingår i denna leverans.

## Verifiering av privat anslutning

OAuth/PKCE, sessionsbundet engångsförsök, fel session/återanvänt försök, skrivskydd vid rollförhandsvisning, krypterade nycklar, rotation av förnyelsenyckel, återkallad åtkomst, låst destination vid kontobyte och frånkoppling testas mot lokal testdatabas med simulerade Microsoft-svar. Befintliga filval, intervall, ändringskopior och exporttester kvarstår. Inget verkligt privat konto har anslutits och inga filer har laddats upp. Slutlig Microsoft-inloggning och en komplett provkopia återstår efter installationen.

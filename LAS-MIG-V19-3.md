# TC Boden V19.3 – paus vid bruten Google Drive-anslutning

Komplett källkod baserad på V19.2 med rättning av schemalagd säkerhetskopiering.

## Ändringen

- Om Google Drive saknar anslutning eller behöver ny inloggning pausas backupens schemalagda databaskontroller. Netlifys minuttrigger finns kvar men läser endast schemaläggarens metadata medan backupen är pausad.
- Vanliga ändringar i planering, användare eller inställningar väcker inte den pausade backupen.
- En slutförd Google Drive-återanslutning väcker backupen. En avbruten eller misslyckad inloggning gör det inte. Nästa kontroll följer inom ungefär en minut.
- En pågående kopia med förlorad anslutning markeras som misslyckad. Anslut Google Drive igen och starta en ny kopia. Gamla exporter märks aldrig felaktigt som slutförda.
- Feltexten skiljer en förlorad anslutning från ett faktiskt ändrat mål.
- Tillfälliga fel behåller befintlig väntetid och begränsade återförsök. Inga tokens eller personuppgifter sparas i schemaläggarens metadata.

Efter ett anslutningsfel i bakgrundsarbetaren sker nästa schemakontroll normalt inom 20 minuter; då pausas fortsatta databaskontroller. Vid återanslutning behövs ingen ändring av miljövariabler eller databas.

## Installation

Publicera hela projektet med samma byggmetod som tidigare. Detta är källkod och ska byggas med Netlifys Next.js-stöd; en rå uppladdning av källkod som statiska filer ersätter inte en byggd driftsättning. Behåll befintliga miljövariabler och databas. Inga nya migreringar behövs för V19.3.

Ändringen är inte driftsatt automatiskt. När den publicerats: kontrollera Google Drive-anslutningen, kör en provkopia och följ Netlifys funktionslogg och GB-hours. Produktionsorsaken kan inte bevisas utan loggar.

Övriga väntande önskemål i kodminnet ingår inte i denna avgränsade backuprättning.

# TC Boden – uppdatering v6

Den här uppdateringen installeras ovanpå v5. ZIP-filen innehåller endast ändrade och nya filer, inte hela hemsidan.

## Installation

1. Packa upp ZIP-filen lokalt.
2. Kopiera `app` och denna instruktion till roten av det befintliga projektet i GitHub. Ersätt filerna med samma namn. Behåll övriga projektfiler.
3. Låt Netlify bygga den nya versionen.

Ingen ny databasmigrering och inga nya miljövariabler behövs för v6. Befintlig Google Drive-anslutning och inställningar används vidare.

## Administratörsverktyg

Befintliga flikar Användare och Aktivitetslogg finns kvar. Följande funktioner har flyttats till egna flikar:

- Mailinställningar: befintlig knapp och samma dialog från Planering.
- Planeringslogg: befintlig knapp och samma loggdialog från Planering.
- Planeringsbehörighet: tidigare Behörigheter i Planering, med samma redigerings- och förslagsbehörigheter. Namnet ändras även i dialogrubriken.
- Säkerhetskopiering: hela befintliga backupmodulen, flyttad från fliken Användare.
- Modulsynlighet: befintlig knapp och dialog, flyttad från instruktörspanelen.

Dialogernas fält, lagrade inställningar och API:er har behållits. Operativa pass, Ändringsförslag och Kolumn ligger kvar i Planering när respektive behörighet finns.

## Elev- och personalöversikter

- Den synliga texten Öppna bedömning med pil tas bort för instruktörer och administratörer. Andra rollers text behålls.
- Den synliga texten Öppna uppföljning med pil tas bort i instruktörens och administratörens personalöversikt.
- Personraden öppnar fortfarande rätt bedömning/uppföljning. Prickmenyn fungerar separat.
- Hover och fokusmarkering täcker hela raden inklusive området vid prickmenyn, i båda teman och för alla roller med tillgång till sidan.
- Handledarmenyn har person med plus för Tilldela handledare, person med bytespilar för Byt handledare och person med minus för Ta bort handledare.
- KP1/KP2, IU-status och aktuella/kommande handledare med datum behålls.

## Kontroll

- Produktionsbygge och TypeScript-kontroll godkända.
- Tester för planeringsbehörigheter och handledartilldelning godkända.
- Backupens befintliga alternativ- och integrationstester godkända.
- Jämförelse av flyttade dialoger verifierar oförändrat innehåll, förutom det beställda namnbytet.
- Visuell webbläsarkontroll kunde inte genomföras: förhandsvisningsmiljön saknade projektets beroenden. Ingen driftsättning eller kontroll mot den skarpa databasen har gjorts här.

Kontrollera efter uppladdning att adminflikarna öppnar rätt dialoger, att befintliga värden läses in och att hover täcker hela personraden i mörkt/ljust läge och på mobil/dator.

## Tillägg: Avbryt i handledardialoger

Avbryt har samma storlek, utfyllnad, ram, rundning och temafärger som övriga sekundära knappar i Tilldela handledare, Byt handledare och Ta bort handledare. Knappraden kan radbrytas på små skärmar. Avbryt stänger utan att skicka någon ändring och är fortsatt inaktiverad under pågående sparning.

Detta reviderade v6-paket ersätter det tidigare v6-paketet och innehåller även `app/supervisor-ui.tsx`. Kan läggas ovanpå v5 eller den tidigare v6-versionen.

# TC Boden – mobilplanering v4 och backupknappar

## Installera
Packa upp zip-filen och lägg in samtliga filer på motsvarande sökvägar i ditt befintliga GitHub-projekt. Ersätt äldre versioner av samma filer. Publicera sedan en ny produktionsdeploy i Netlify. Detta paket uppdaterar gränssnittet; behåll övriga projektfiler, den fungerande Google Drive-fixen, databas och miljövariabler.

Öppna /planering-app efter publicering. Stäng och öppna den installerade appen på nytt vid behov för att hämta den nya versionen online.

## Mobilappen
- Kompakt topprad i hemsidans stil och kugghjul utan ram. Mörkt/ljust läge och utloggning finns kvar i kugghjulsmenyn.
- Toppraden och veckoväljaren ligger fast.
- Smalare turkolumn (54 px), större utrymme för uppgifter och ingen omgivande kortyta runt schemat.
- Veckans sju rader delar på tillgänglig skärmhöjd. Långa uppgiftstexter visas kompakt; tryck för att läsa hela texten.
- Veckoväljare med tydliga pilar, veckonummer och datumintervall.
- Kalenderknappen öppnar kalendern direkt. Välj datum för att visa den veckan. Kalendern har månadspilar, Idag, Stäng, piltangenter, Page Up/Down och Escape.
- Pull to refresh gäller bara planeringsområdet. Planeringen följer fingret nedåt och indikatorn visas under veckoväljaren. Släpp efter tröskeln för att hämta om planeringen. Vågrät dragning byter inte till uppdateringsgest.
- Liggande läge visar fortfarande alla personers kolumner med vågrät skroll. Nattmarkeringar, färger och offlinefunktion behålls.

## Backupknappar
Koppla från och Öppna backupmappen använder standardstilen för sekundära knappar. Mappknappen ligger till höger på raden ovanför intervallväljaren.

## Sökrutor (tillagt)
Gemensamma sökrutor har samma bakgrund i inmatningsfältet och dess omgivande ruta, utan en extra mörk rektangel. Text, platshållartext, ikon och skrivmarkör följer ljust/mörkt tema. Gäller sökning bland moment, elever, användare, personal, loggar, backupfiler och fristående namngivna sökfält. Fokusmarkering finns runt hela sammansatta sökrutan.

## Verifiering
Produktionsbygge inklusive TypeScript och befintliga planeringstester godkända. Kalender/datumtester för skottår, sommartidsövergångar, årsskifte, månadsskifte och dragtröskel godkända. Kör det nya testet med node scripts/test-mobile-planning.cjs.

Visuell kontroll och verkliga touchgester kunde inte köras i webbläsare i arbetsmiljön. Kontrollera efter publicering att söndag syns i stående läge, att menyn ligger stilla under draget, att bara en uppdatering sker per drag, att kalendern öppnas direkt och att långa uppgifter går att öppna. Prova också ljust läge, liggande läge och inloggning.

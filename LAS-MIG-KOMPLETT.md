# Senaste kompletta version: V20

Läs **LAS-MIG-V20.md** först. Kör nya databasuppdateringar 0048 och 0049 efter 0047 före publicering. Nedanstående text avser den tidigare kompletta versionen.

# TC Boden – komplett källkod V19.2

Detta paket innehåller hela projektet med levererade uppdateringar till och med V19.2. Filerna ligger direkt i projektroten. Tidigare uppdateringspaket behöver inte kopieras in.

## Använd paketet

1. Packa upp ZIP-filen till en projektmapp.
2. Använd mappens innehåll som hela projektet i det befintliga Git-/Netlify-projektet.
3. Behåll de befintliga miljövariablerna och kopplingen till databasen.
4. Publicera med projektets byggkommando, npm run build. Vid lokal kontroll kan du köra npm ci och npm run build.

Databasens aktuella användare, dokument och planeringsinnehåll ligger kvar i den befintliga databasen. Paketet innehåller projektets källkod, statiska filer och SQL-migreringar.

## Databasversion

Om V18, V18.1 eller V19 redan används behövs ingen ny SQL för detta paket. För en äldre installation ska saknade migreringar köras i ordning fram till 0047. Kör migration 0047 före publicering av V18 eller senare.

## Önskemål som väntar på kodning

Det aktuella kodminnet följer med i TC-Boden-Kodminne-Adminflikar-Utan-Popup.md. Följande senare önskemål är sparade där för kommande kodning.

- Veckoutskick med valbar veckodag och anpassade mailintervall.
- Val av schemanotiser för ändrade turer och ändrade uppgifter.
- Bild- och emojibibliotek för dokument, inklusive högtider.
- Kopplad bredd på alla Uppgift-kolumner i personlig planeringslayout.

För V19 återstår även visuell verifiering på verkliga datorer/mobiler och i Excel samt mätning av databasförbrukning i drift.

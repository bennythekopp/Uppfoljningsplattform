# TC Boden V21 – dokument, sparande och behörigheter

Detta är en komplett källkodsversion baserad på V20. Inte publicerad eller installerad i din riktiga databas av assistenten.

## Installera

1. Packa upp samtliga delarkiv i samma projektmapp. Varje del innehåller högst 100 filer och delarna ska slås ihop, inte laddas upp som separata webbplatser.
2. Kör databasuppdatering `netlify/database/migrations/0050_admin_planning_rights.sql` efter tidigare uppdateringar till och med 0049, före driftsättning. Uppdateringen bevarar befintliga administratörers tidigare redigeringsrätt som uttryckliga val. Den är omkörbar och återställer inte senare ändrade val.
3. Kör `npm ci`, `npm run build` och publicera med samma Netlify-konfiguration som tidigare. Inga nya nycklar eller tjänster krävs.

## Ändrat

- Dokumentflikar har kvar ram/höjd, innehållsanpassad bredd och små, ramlösa penn-/kryssknappar i övre högra hörnet. Bildknappen har samma grundutseende som övriga ikonknappar.
- Textstilsmenyn förhandsvisar Vanlig text, Rubrik, Underrubrik och Rubrik 1–4, med markering av aktuell stil och tangentbordsnavigering.
- Sidmarginaler i cm, förval Normal/Smal/Bred, pappersformat och orientering. Sidhuvud, sidfot och sidnummer sparas med dokumentet och stöds i dokumentets Word/PDF/utskrift. Styckeavstånd före/efter, radavstånd och indrag finns. Tidigare bildstorlek/placering och tabellverktyg behålls.
- Sidflödet använder ProseMirror-dekorationer för icke redigerbara sidmellanrum, i stället för att flytta hela stycken med tillfälliga marginaler. Automatisk layout ändrar inte dokumentinnehållet, ångrahistoriken eller Yjs-datat. Manuella sidbrytningar bevaras. Bilder begränsas till textytans höjd.
- Skriv ut, Word och PDF öppnar Välj flikar. En/flera/alla kan väljas; bara valda flikar tas med i dokumentordning. Valda flikar börjar på nya sidor. Ingen åtgärd startar vid Avbryt eller tomt urval.
- Planeringsinstruktionen visas i en behörighetskontrollerad popup, med sidval, zoom, rullning, nedladdning och utskrift. Bilderna är renderade från den befintliga PDF-filens 42 sidor. PDF-filen är oförändrad. Vid framtida byte av instruktion måste även sidbilder och manifest genereras om.
- Administratörens planeringsrättigheter kan ändras. Rätten att administrera behörigheterna behålls även om den egna redigeringsrätten tas bort. Redigering ger förslagsrätt i appen.
- Förlorad Google Drive-inloggning skapar en administratörsnotis i bjällran med direktväg till Säkerhetskopiering. En incident ger en notis, med individuella läskvitton; upprepade fel ger inga dubbletter. Lyckad återanslutning avslutar den gamla notisen.

## Sparande och förbrukning

- Autosparande efter 2 sekunders skrivpaus, senast efter 30 sekunder vid oavbrutet skrivande. Fortsatta ändringar samlas; explicit navigering/export tömmer sparningen.
- Dokumentkontroll normalt var 60:e sekund, var 10:e sekund när flera redigerare syns. Närvaro högst omkring en gång per minut utöver riktiga sparningar; närvaro gäller 150 sekunder. En ändrad närvaro upptäcks först vid nästa kontroll, så samarbete kan inledningsvis dröja upp till normalintervallet.
- Gemensamma anteckningar kontrolleras var 30:e sekund. Privata anteckningar har ingen återkommande polling; synk sker vid öppning, återgång till synlig flik och manuell uppdatering. De snabba dokument-/anteckningskontrollerna har inte flyttats till någon annan bakgrundstimer.
- Oförändrade revisioner undviker Yjs-avkodning och oförändrade kommentarer i svaret. Säkerhets- och behörighetskontroller är kvar.
- Osparade ändringar skyddas med kontospecifika lokala utkast. Om lokal lagring är full eller blockerad visas fel; håll då sidan öppen tills servern har sparat. Lokal lagring kan inte ge garanti om webbläsardata raderas. Utkast från en äldre återställd dokumentversion sparas separat för export i stället för att automatiskt blandas in.
- Förbrukningsminskningen i riktiga Netlify compute units är inte mätt. Verifiera före/efter med jämförbara skrivpass och Network-logg.

## Validering och kvarvarande gränser

TypeScript och produktionsbygge är godkända för leveransen. De automatiska V21-proven omfattar riktiga API-/databaskontroller av administratörens rättigheter och omkörbar migrering, Yjs-sparande med simulerad tid, lokalt utkast/återhämtning/kontoisolering, sidgränsberäkning och Word-export med flikurval, rubrikformat och sidhuvud/sidfot/sidnummer. Befintliga V20- och backupkontroller körs också, utan riktiga utskick eller Google-anrop.

Webbläsarens visuella kontroll gick inte att genomföra: förhandsvisningstjänsten startar Next.js med flaggor som den inte stöder. Den nya sidlayouten är därför kodad men inte visuellt verifierad. Kontrollera särskilt långa stycken, tabeller med sammanfogade celler/långa rader, bilder, zoom, marginaländringar och markören vid sidgränser innan produktionsanvändning. Export av en enskild tabellrad som är större än en sida kan ge ett tydligt fel i stället för kapat innehåll. Word kan bryta rader annorlunda om samma typsnitt saknas på datorn. Bild- och tabellverktygen är inte fullständig Word-funktionsparitet.

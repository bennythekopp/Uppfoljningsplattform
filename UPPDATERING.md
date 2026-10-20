# Uppdatering 19 oktober 2026 · Dokument och panel

## Gemensamt och Privat för Att göra och Påminnelser · 20 oktober 2026

Texten TC Boden ovanför rubriken Instruktörspanelen är borttagen.

Det aktuella paketet innehåller anteckningsmodulen, dess formaterade förhandsvisning, namnbytet till Instruktörer och Gemensamt | Privat för Att göra och Påminnelser. Det innehåller endast uppdaterade och nya filer för det befintliga GitHub-repot.

Kör `0023_panel_notes.sql` efter 0022 om den inte redan är tillämpad, och därefter **`0024_panel_item_scopes.sql`**. Netlify Database tillämpar normalt nya migrationer vid publicering; på separat PostgreSQL körs de manuellt. Kör aldrig om en redan tillämpad migration.

Välj Gemensamt eller Privat bredvid rubriken i modulen eller på modulsidan. Nya uppgifter och påminnelser hamnar i den valda vyn. Gemensamma poster kan läsas, redigeras och klarmarkeras av instruktörer och administratörer. Privata poster kan bara läsas, ändras eller tas bort av kontot som skapade dem. Befintliga uppgifter förblir gemensamma och befintliga påminnelser privata. Sidomenyn och modulen heter nu Påminnelser. Sorteringen behåller båda vyernas ordning.

## Anteckningar · 20 oktober 2026

Paketet innehåller även namnbytet till **Instruktörer · TC Boden** för instruktörer och administratörer. Namnet visas i sidomenyn, mobilhuvudet och webbläsarfliken utifrån den aktuella rollen. Handledare, Chef och inloggningssidan behåller Bedömningsstöd. Namnbytet kräver ingen ytterligare SQL utöver anteckningarnas `0023`.

Detta paket innehåller endast filerna som ändrats för Anteckningar. Lägg dem på motsvarande platser i ditt befintliga GitHub-repo. Kör **`netlify/database/migrations/0023_panel_notes.sql` efter 0022** på en separat PostgreSQL-databas. Använder du Netlify Database tillämpas den nya migrationen vid publicering. Kör inte om tidigare migrationer. Publicera sedan via Netlify och ladda om sidan.

Instruktörer och administratörer får en modul som heter Anteckningar. Textlänkarna **Gemensamt | Privat** i modulens rubrik och redigeringsvyn växlar anteckning. Privat sparas per konto; Gemensamt är samma anteckningsyta för instruktörer och administratörer. Båda sparas automatiskt och synkas medan andra har den gemensamma vyn öppen. Modulen visar texten direkt och rubriken eller texten öppnar redigeraren. Anteckningarna lagras i `panel_notes`, skilt från dokumentlistan. De har ingen manuell sparning, kommentarer, versioner, utskrift eller Word/PDF-export. Vid uppdatering visas modulen även på tidigare sparade paneler. Efter en ny layoutsparning kan den tas bort med Anpassa panelen.

Paketet innehåller endast ändrade och nya filer för den befintliga webbplatsen.

1. Ersätt/lägg till filerna i roten på ditt befintliga GitHub-repo. Behåll övriga filer.
2. Ta med både `package.json` och `package-lock.json`. Netlify installerar de uppdaterade paketen vid bygget.
3. Detta äldre dokumentsteg krävde ingen migration utöver `0022`. För den aktuella anteckningsuppdateringen krävs `0023` enligt avsnittet ovan.
4. Låt Netlify bygga och publicera. Stäng gamla öppna dokumentfönster och ladda om sidan efter publiceringen.

- Nya dokument har bara Översikt. Vid första öppning av ett äldre dokument samlas dess flikar i Översikt. Text, formatering och kommentarer bevaras; en historikversion sparas först. Egna flikar som läggs till efter uppdateringen behålls.
- Små röda exportknappar ligger till höger på raden med Alla dokument. Krysset på öppna dokument visas vid hovring/fokus och på aktiv flik på pekskärm.
- Word/PDF/utskrift innehåller bara dokumentet, utan automatiskt sidhuvud, sidfot, dokumentnamn eller flikrubriker.
- Utökad textformatering, tabellverktyg samt valbar dokumentikon och ikonfärg.
- En enda Ny mall-knapp för dokumentmallar och Outlook-mallar för mejl eller möten. Ingen Till-ruta. Mallistan visar namn och typ.
- Anpassa panelen ligger överst, modulen heter Dokument och modulrubrikerna öppnar innehållet. Beskrivande omfattningstexter och separata Visa alla-knappar är borttagna.
- Lägg till person finns på Elever och Personal.
- Netlify-inloggningsfixen ingår också.

Läs `INSTRUKTORSPANEL.md` för handhavande och praktiska begränsningar. Ingen publicering till din Netlify-sida har gjorts från denna miljö.

## Typsnitt · 20 oktober 2026

Dokumentredigeraren har nu 198 valbara Office- och Windows-typsnitt. De vanligaste ligger överst, följt av övriga i alfabetisk ordning. Valet sparas i dokumentet och följer med till Word-export, även för typsnitt med mellanslag i namnet.

Typsnittsfiler är inte inbäddade eller nedladdade. Webbläsaren använder typsnitt som finns på enheten och ersätter annars med ett tillgängligt typsnitt. Detta gäller också PDF/utskrift från samma enhet. Word använder det angivna typsnittet om det finns tillgängligt där. Inga externa typsnittstjänster kontaktas.

Det tidigare paketet innehöll även filerna från Dokument-19okt. Den aktuella anteckningsuppdateringen innehåller endast ändrade filer och SQL-steget `0023`.

## Ordning i moduler och dokumentflikar

Sorteringen är låst i vanligt visningsläge. Anpassa panelen visar draghandtag på översikten; Sortera gör samma sak på varje modulsida och i dokumentfliksraden. Dragning med mus eller pekskärm visar ordningen direkt. Spara behåller den och låser läget; Avbryt återgår till sparad ordning. Pilarna är borttagna. Panelens ordning sparas per användare; dokumentflikarnas ordning delas med dokumentet. Pennknappen byter fliknamn. Flikens innehåll och kommentarer hör fortsatt till samma flik efter flytt och namnbyte. Ingen ny SQL-migrering krävs.

## Import av dokument och mallar

Knapparna Ladda upp dokument och Ladda upp mall finns på respektive sida. DOCX, HTML och TXT upp till 2 MB omvandlas till redigerbart innehåll. Dokumentmallar kan därefter skapa nya dokument. Ingen ny SQL-migrering krävs. PDF och äldre DOC-format stöds inte för redigerbar import.

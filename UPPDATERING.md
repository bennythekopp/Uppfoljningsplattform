# Uppdatering 19 oktober 2026 · Dokument och panel

Paketet innehåller endast ändrade och nya filer för den befintliga webbplatsen.

1. Ersätt/lägg till filerna i roten på ditt befintliga GitHub-repo. Behåll övriga filer.
2. Ta med både `package.json` och `package-lock.json`. Netlify installerar de uppdaterade paketen vid bygget.
3. Ingen ny SQL-migration behövs om databasen redan är uppdaterad till och med `0022`. Kör inte om tidigare migrationsfiler.
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

Detta paket innehåller även samtliga filer från den föregående uppdateringen Dokument-19okt. Det ersätter det paketet. Installera i befintligt GitHub-repo, behåll övriga filer och låt Netlify bygga. Ingen ny SQL eller ytterligare paketinstallation behövs utöver beroendena i den medföljande package-lock.json.

## Ordning i moduler och dokumentflikar

Poster i samtliga panelmoduler kan flyttas med upp/ned-knapparna eller dras på datorn. Ordningen sparas per användare och syns i modul och helsida. Själva modulernas placering sparas fortsatt via Anpassa panelen. Dokumentflikar kan flyttas med pilar eller dragning och döpas om med pennknappen. Flikens innehåll och kommentarer hör fortsatt till samma flik efter flytt och namnbyte. Ingen ny SQL-migrering krävs.

## Import av dokument och mallar

Knapparna Ladda upp dokument och Ladda upp mall finns på respektive sida. DOCX, HTML och TXT upp till 2 MB omvandlas till redigerbart innehåll. Dokumentmallar kan därefter skapa nya dokument. Ingen ny SQL-migrering krävs. PDF och äldre DOC-format stöds inte för redigerbar import.

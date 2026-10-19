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

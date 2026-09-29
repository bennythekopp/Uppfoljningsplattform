# Bedömningsstöd – TC Boden

Källkoden för webbplatsen. Lägg innehållet i den här mappen i ett **privat GitHub-repository**. Underlaget innehåller utbildningsmoment och anvisningar från Excel-filen.

## Det här finns i projektet

- Elevregister och bedömningar med nivå grön, gul eller röd.
- Kommentarslogg med namn och tid per moment.
- Instruktörsöversikt, redigering och tillägg av moment.
- Roller för administratör, instruktör och handledare.
- Inloggning med användarnamn och lösenord för skapade användare. Administratören loggar in med sitt ChatGPT-konto på den befintliga Sites-publiceringen.
- SQLite/D1-schema och versionsmigrationer i `db/` och `drizzle/`.

## Köra projektet

Kräver Node.js 22.13 eller senare. Installera med `npm ci`, skapa lokal databas med migrationerna i `drizzle/` och kör `npm run dev`. Bygg med `npm run build`.

Projektet är anpassat för **Sites på Cloudflare Workers med D1**. Att lägga koden i GitHub publicerar den inte automatiskt. GitHub Pages kan inte köra de serverfunktioner och den databas som inloggning och bedömningar behöver. För en ny driftsättning behövs Workers/D1 och rätt åtkomstinställningar. `.openai/hosting.json` innehåller identiteten för den befintliga Sites-publiceringen; använd inte den identiteten för att registrera en annan webbplats.

Den befintliga webbplatsen är fortfarande privat. Konton med användarnamn och lösenord kan inte nå inloggningssidan utanför Sites åtkomstlista förrän åtkomsten för själva inloggningssidan ändras.

## Källkod

- `app/workspace.tsx` och `app/globals.css`: gränssnitt och utseende.
- `app/api/`: serverfunktioner med rollkontroller.
- `app/items.json`: ursprungliga 109 bedömningsmoment och inbäddade illustrationer.
- `db/schema.ts` och `drizzle/`: databasstruktur och migrationer.

Lägg inte till `.env`-filer, lösenord, lokala databaser, `node_modules`, `dist` eller `.wrangler` i GitHub-repot.

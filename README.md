# TC Boden – Bedömningsstöd på Netlify

Detta är **Netlify-versionen** av projektet. GitHub lagrar koden; Netlify bygger Next.js-appen, kör API-rutterna och tillhandahåller Postgres-databasen. Den tidigare Sites-versionen påverkas inte.

## Publicera via GitHub och Netlify

1. Skapa ett **privat** GitHub-repository. Packa upp ZIP-filen och lägg innehållet i mappen `TC-Boden-Netlify` i repositoryts rot. `package.json`, `netlify.toml` och `app/` ska alltså ligga direkt i roten.
2. I Netlify: **Add new project → Import an existing project → GitHub**. Välj ditt repository. Netlify ska använda Node 22 och byggkommandot `npm run build` från `netlify.toml`. Låt Netlify identifiera Next.js och dess vanliga adapter; ange ingen statisk publiceringsmapp själv.
3. Under **Site configuration → Environment variables**, lägg till `ADMIN_SETUP_TOKEN` med en unik slumpmässig nyckel på minst 32 tecken. Lägg aldrig nyckeln i GitHub. Du kan skapa en 64 tecken lång hexnyckel med `openssl rand -hex 32` på en dator där OpenSSL finns.
4. Starta driftsättningen. Projektet innehåller `@netlify/database` och migrationen `netlify/database/migrations/0001_initial.sql`. Netlify ska skapa Postgres-databasen och tillämpa migrationen vid driftsättningen. Kontrollera byggloggen om din Netlify-plan behöver databasfunktionen aktiverad.
5. Öppna `https://DIN-ADRESS.netlify.app/setup`, skriv engångsnyckeln och välj namn, användarnamn och ett lösenord på minst 12 tecken för administratören. När kontot är skapat: ta bort `ADMIN_SETUP_TOKEN` från Netlify och driftsätt igen. Logga sedan in från startsidan.
6. Som administratör skapar du instruktörer och handledare under **Användare**. De använder användarnamn och lösenord på Netlify-sidan och behöver inte ChatGPT-konton eller separata Sites-inbjudningar.

Om Netlify Database inte är tillgänglig för ditt konto måste databasen ordnas innan sidan kan användas. Anslut i så fall en annan PostgreSQL-databas och sätt `DATABASE_URL` i Netlifys miljövariabler samt tillämpa SQL-filen i `netlify/database/migrations/` på den databasen. Låt `ADMIN_SETUP_TOKEN` vara serverhemlighet i båda fallen.

## Vad som följer med

Alla 109 ursprungliga moment och de inbäddade bilderna från Excel finns i `app/items.json`. Elevkonton, nivåer, kommentarer och senare redigeringar ligger i databasen. **Befintliga elever eller kommentarer från den tidigare Sites-databasen migreras inte automatiskt** till Netlify.

Projektet innehåller ingen användardata, inget administratörslösenord och ingen databasnyckel. Eftersom källkoden innehåller utbildningsunderlaget bör GitHub-repositoryt vara privat.

## Utveckling

- `npm ci` installerar beroenden.
- `npm run dev` startar Next.js lokalt. För databasfunktioner behövs Netlify CLI med lokal Netlify Database eller en PostgreSQL-anslutning i `DATABASE_URL` och tillämpad migration.
- `npm run typecheck` kontrollerar TypeScript.
- `npm run build` skapar produktionsbygget.

Databasfrågor och kontroller ligger i `app/api/` och `app/database.ts`; gränssnittet ligger i `app/workspace.tsx` och `app/globals.css`.

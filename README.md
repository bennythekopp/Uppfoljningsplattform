# TC Boden – Bedömningsstöd på Netlify

Detta är **Netlify-versionen** av projektet. GitHub lagrar koden; Netlify bygger Next.js-appen, kör API-rutterna och tillhandahåller Postgres-databasen. Den tidigare Sites-versionen påverkas inte.

## Publicera via GitHub och Netlify

1. Skapa ett **privat** GitHub-repository. Packa upp ZIP-filen och lägg **alla filerna direkt i repositoryts rot** (inte ZIP-filen eller en extra mapp). `package.json`, `netlify.toml` och `app/` ska alltså ligga direkt i roten.
2. I Netlify: **Add new project → Import an existing project → GitHub**. Välj ditt repository. Netlify ska använda Node 22 och byggkommandot `npm run build` från `netlify.toml`. Låt Netlify identifiera Next.js och dess vanliga adapter; ange ingen statisk publiceringsmapp själv.
3. Under **Site configuration → Environment variables**, lägg till `ADMIN_SETUP_TOKEN` med en unik slumpmässig nyckel på minst 32 tecken. Lägg aldrig nyckeln i GitHub. Du kan skapa en 64 tecken lång hexnyckel med `openssl rand -hex 32` på en dator där OpenSSL finns.
4. Starta driftsättningen. Projektet innehåller `@netlify/database` och migrationerna i `netlify/database/migrations/`. Netlify ska skapa Postgres-databasen och tillämpa migrationerna vid driftsättningen. Kontrollera byggloggen om din Netlify-plan behöver databasfunktionen aktiverad.
5. Öppna `https://DIN-ADRESS.netlify.app/setup`, skriv engångsnyckeln och välj namn, användarnamn och ett lösenord på minst 12 tecken för administratören. När kontot är skapat: ta bort `ADMIN_SETUP_TOKEN` från Netlify och driftsätt igen. Logga sedan in från startsidan.
6. Som administratör skapar du instruktörer, handledare och chefer under **Användare**. De använder användarnamn och lösenord på Netlify-sidan och behöver inte ChatGPT-konton eller separata Sites-inbjudningar.

Om Netlify Database inte är tillgänglig för ditt konto måste databasen ordnas innan sidan kan användas. Anslut i så fall en annan PostgreSQL-databas och sätt `DATABASE_URL` i Netlifys miljövariabler samt tillämpa SQL-filerna i `netlify/database/migrations/` i nummerordning på den databasen. Låt `ADMIN_SETUP_TOKEN` vara serverhemlighet i båda fallen.

## Vad som följer med

Alla 109 ursprungliga moment och de inbäddade bilderna från Excel finns i `app/items.json`. Elevkonton, nivåer, kommentarer och senare redigeringar ligger i databasen. **Befintliga elever eller kommentarer från den tidigare Sites-databasen migreras inte automatiskt** till Netlify.

Projektet innehåller ingen användardata, inget administratörslösenord och ingen databasnyckel. Eftersom källkoden innehåller utbildningsunderlaget bör GitHub-repositoryt vara privat.

## Utveckling

- `npm ci` installerar beroenden.
- `npm run dev` startar Next.js lokalt. För databasfunktioner behövs Netlify CLI med lokal Netlify Database eller en PostgreSQL-anslutning i `DATABASE_URL` och tillämpad migration.
- `npm run typecheck` kontrollerar TypeScript.
- `npm run build` skapar produktionsbygget.

Databasfrågor och kontroller ligger i `app/api/` och `app/database.ts`; gränssnittet ligger i `app/workspace.tsx` och `app/globals.css`.

## Momentflikar

Moment visas under System E2, System M och Övrigt. Befintliga moment får initialt System E2 och kan flyttas av instruktörer via Redigera moment. Uppdateringen kräver databasmigreringen `0003_moment_categories.sql` efter `0002_disable_users.sql`.

## Rollen Chef

Administratören kan skapa en användare med rollen Chef. Chef ser elevöversikten, moment, nivåer och kommentarer, men kan inte ändra dem. Lösenordsbyte fungerar även för Chef. Kör `0004_chef_role.sql` efter de tidigare migrationerna vid uppdatering av databasen.

## Om ändringarna inte syns

Kontrollera på GitHub att `package.json`, `netlify.toml` och `app/` ligger i repositoryts rot och att den uppdaterade `app/workspace.tsx` innehåller `categorytabs`. Under Netlifys Deploys ska den senaste publicerade driftsättningen visa samma commit som ändringen på GitHub. Om en tidigare deploy fortfarande är publicerad, publicera den senaste lyckade deployen. Kontrollera också att projektets **Base directory** är repositoryts rot (tomt fält); en tidigare undermapp som bas gör att Netlify bygger äldre filer. Uppdatera sidan i webbläsaren efter publiceringen.

## Utskrift av elev

Instruktör och Chef kan öppna en elev och välja **Skriv ut A4**. Utskriften innehåller samtliga moment i System E2, System M och Övrigt, aktuella nivåer och bedömare samt alla kommentarer per moment. Utskriftsknappen blir aktiv när elevens uppgifter har lästs in. Webbläsarens utskriftsruta kan också spara resultatet som PDF.

Fliken som tidigare hette Lokalt heter nu Övrigt. Kör `0005_rename_local_category.sql` efter `0004_chef_role.sql` på en egen PostgreSQL-databas; Netlify Database tillämpar filen automatiskt vid publicering. Redan placerade moment flyttas utan att bedömningar eller kommentarer ändras.

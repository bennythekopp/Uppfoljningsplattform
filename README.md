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

Administratör, Instruktör och Chef kan öppna en elev och välja **Skriv ut**. Utskriften innehåller samtliga moment i System E2, System M och Övrigt, aktuella nivåer och bedömare samt alla kommentarer per moment, utan momentbeskrivningar. Utskriftsknappen blir aktiv när elevens uppgifter har lästs in. Webbläsarens utskriftsruta kan också spara resultatet som PDF.

Fliken som tidigare hette Lokalt heter nu Övrigt. Kör `0005_rename_local_category.sql` efter `0004_chef_role.sql` på en egen PostgreSQL-databas; Netlify Database tillämpar filen automatiskt vid publicering. Redan placerade moment flyttas utan att bedömningar eller kommentarer ändras.

## Ta bort moment och mobilvy

Administratörer och instruktörer kan ta bort moment från instruktörsöversikten. Efter bekräftelse tas momentet och samtliga bedömningar och kommentarer för det momentet bort. Migreringen `0006_deleted_moments.sql` gör att även ursprungliga Excel-moment kan döljas permanent utan att ändra källunderlaget. Netlify Database kör migrationen vid publicering; använd egen PostgreSQL i nummerordning om du inte använder Netlify Database.

Layouten anpassas automatiskt till telefonens skärmbredd. På smala skärmar visas navigationen överst, eleverna går att bläddra mellan horisontellt och formulär, moment och bedömningsknappar anpassas till skärmen. Ingen separat mobiladress eller app behövs.

## Logga och hemskärmsikon
Den nya TC Boden-loggan används vid inloggning och i sidhuvudet. Paketet innehåller även favicon, Apple Touch-ikon och Android-ikoner med webbmanifest. På iPhone väljer du Dela → Lägg till på hemskärmen i Safari. På Android väljer du Lägg till på startskärmen i webbläsarens meny. Om en gammal genväg visar bokikonen, ta bort genvägen och lägg till sidan igen efter den nya Netlify-publiceringen.

## Utbildad personal

Instruktörer och administratörer har fliken **Utbildad personal**. Där finns en separat lista med personal och två formulär från de bifogade dokumenten: **Operativ del** med bedömningsområden, ämnen till chef, nyheter och provresultat, samt **Simulator** med poäng och kommentar per moment. En person kan ha flera daterade uppföljningar och tidigare sparade formulär kan öppnas och redigeras. Handledare och Chef har ingen åtkomst till fliken eller API:et. I Operativ del visas röd som **Komplettering krävs**, gul som **Anmärkning finns** och grön som **Utan anmärkning**. Klicka på samma val igen för att avmarkera det.

Simulatordokumentet anger 56 som totalpoäng, men de listade maxpoängen summerar till 55. Webbformuläret summerar de faktiska momenten till 55 och använder dokumentets godkäntgräns 40. Databasmigreringen `0007_personnel_followups.sql` skapar tabellerna för personal och uppföljningar. Kör den efter `0006_deleted_moments.sql` om du använder en egen PostgreSQL-databas; Netlify Database kör den vid publicering.

## Elevöversikt och individuell uppföljning

Alla inloggade har fliken **Elever** med en sökbar elevlista och antalet elever. Handledare och Chef ser endast elevöversikten och sina vanliga elevfunktioner. Instruktörer och administratörer kan också lägga till och byta namn på elever direkt där, samt flytta eller ta bort dem från menyn på respektive rad. På elevöversikten visas inte längre antalet bedömningsmoment.

**Utbildad personal** visas enbart för instruktörer och administratörer. Startsidan heter **Individuell uppföljning** med **TC Boden** under rubriken. Den har en sökbar lista, antalet personer och en diskret årssammanställning. Öppna en person för formulären Operativ del och Simulator. Knappen för ämnen till chef visar även nyheter och provresultat. Menyn på varje rad kan byta namn, flytta till Elever eller ta bort personen.

Markera **Markera formuläret som genomfört** och spara för att räkna det som färdigt. En liten bock visas vid personens namn först när både Operativ del och Simulator är markerade som genomförda med uppföljningsdatum under innevarande år. Påbörjade formulär går fortfarande att spara och redigera via historiken utan att de räknas som genomförda.

Flytt mellan grupperna bevarar personens tidigare elevbedömningar och personaluppföljningar. Historiken blir tillgänglig igen vid flytt tillbaka. Att ta bort en person tar däremot permanent bort både elevbedömningar, kommentarer och personaluppföljningar efter bekräftelse.

Migreringen `0008_person_groups.sql` lägger till gruppstatus och markeringen för genomförda formulär. Netlify Database kör den vid publicering. För en separat PostgreSQL-databas, kör den efter `0007_personnel_followups.sql`. Tidigare sparade formulär får statusen påbörjad och kan öppnas och markeras som genomförda.

## Skriv ut individuell uppföljning

Instruktörer och administratörer kan öppna en person, välja **Operativ del** eller **Simulator** och klicka **Skriv ut**. Varje tidigare uppföljning har även en egen **Skriv ut**-knapp i historiken, som skriver ut just det sparade protokollet direkt. Utskriften är anpassad för A4 och visar endast den valda delen med datum, ansvarig, bedömningar och kommentarer. Operativ del tar även med ämnen till chef, nyheter och provresultat; Simulator tar med poäng per moment och totalsumman. Det öppna formuläret behöver vara sparat, och eventuella nya ändringar behöver sparas före utskrift med knappen vid sidans rubrik. Webbläsarens utskriftsruta kan även spara protokollet som PDF.

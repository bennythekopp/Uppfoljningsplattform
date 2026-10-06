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

Välj **Godkänd** eller **Komplettering krävs** längst ned i respektive formulär och spara. En liten bock visas vid personens namn när den senaste uppföljningen för både Operativ del och Simulator är godkänd under innevarande år. Formulär utan slutbedömning kan fortfarande sparas som påbörjade.

Flytt mellan grupperna bevarar personens tidigare elevbedömningar och personaluppföljningar. Historiken blir tillgänglig igen vid flytt tillbaka. Att ta bort en person tar däremot permanent bort både elevbedömningar, kommentarer och personaluppföljningar efter bekräftelse.

Migreringen `0008_person_groups.sql` lägger till gruppstatus och markeringen för genomförda formulär. Netlify Database kör den vid publicering. För en separat PostgreSQL-databas, kör den efter `0007_personnel_followups.sql`. Tidigare sparade formulär får statusen påbörjad och kan öppnas och markeras som genomförda.

## Skriv ut individuell uppföljning

Instruktörer och administratörer kan öppna en person, välja **Operativ del** eller **Simulator** och klicka **Skriv ut**. Varje tidigare uppföljning har även en egen **Skriv ut**-knapp i historiken, som skriver ut just det sparade protokollet direkt. Utskriften är anpassad för A4 och visar endast den valda delen med datum, ansvarig, bedömningar och kommentarer. Operativ del tar även med ämnen till chef, nyheter och provresultat; Simulator tar med poäng per moment och totalsumman. Det öppna formuläret behöver vara sparat, och eventuella nya ändringar behöver sparas före utskrift med knappen vid sidans rubrik. Webbläsarens utskriftsruta kan även spara protokollet som PDF.

## Uppdatering av personlistornas utseende

Elever och Utbildad personal använder gemensamma stilregler i `app/people.css`, som importeras från `app/layout.tsx`. Vid uppdatering behöver alla filer från ZIP-filen ersätta motsvarande filer i GitHub, inklusive den nya CSS-filen och layouten. Lägg till personal öppnar samma centrerade dialog som Lägg till elev.

## Ansvarig och provresultat

Ansvarig väljs från en rullista med aktiva instruktörer och administratörer. Historiska ansvariga finns kvar i redan sparade protokoll. Lokalt och centralt provresultat anges i procent, 0–100, och får procenttecken på utskriften. Tidigare fritextresultat bevaras tills de ersätts med ett procentvärde. Simulatorns informationsrad om 56 respektive 55 totalpoäng har tagits bort från gränssnittet.

## Historik och slutbedömning per del

Knappen **Historik** öppnar en popup för den aktuella fliken. Operativ del visar endast operativa uppföljningar, och Simulator visar endast simulatoruppföljningar. Varje protokoll har datum som namn och grön markering för Godkänd eller röd för Komplettering krävs. Det går att öppna eller skriva ut protokollet direkt i popupen. Slutbedömningen väljs med de två färgade knapparna längst ned och sparas med protokollet.

Migreringen `0009_followup_outcome.sql` krävs efter `0008_person_groups.sql`. Netlify Database tillämpar den vid publicering; för en separat PostgreSQL-databas behöver filen köras där. Tidigare protokoll får **Ej beslutad** tills en instruktör eller administratör anger resultatet, eftersom den tidigare kryssrutan inte skiljde godkänd uppföljning från komplettering.

## Instruktörsöversikt och IU-underlag

Sidolistans namn och innehåll växlar till **Personal** i Individuell uppföljning och till **Elever** i elevdelarna. Det går att öppna en person direkt i sidolistan eller från instruktörsöversikten. Översikten visar också utbildad personal med status för Operativ del och Simulator under innevarande år.

Bredvid System E2, System M och Övrigt finns **Operativ IU** och **Simulator IU**. Instruktörer och administratörer kan lägga till, redigera och ta bort IU-moment. Operativa moment placeras i Bedömningsområden eller Ämnen till chef. Simulatorns moment har rubrik, beskrivning, momentgrupp och maxpoäng. Nya uppföljningar använder det aktuella underlaget. Varje sparat protokoll behåller sin kopia av moment och maxpoäng, även vid senare redigering eller borttagning.

Migreringen `0010_iu_moments.sql` skapar det redigerbara IU-underlaget och sparar en kopia av det ursprungliga underlaget på tidigare protokoll. Netlify Database tillämpar den vid publicering. På en separat PostgreSQL-databas körs den efter `0009_followup_outcome.sql`.

Inloggat namn och roll är alltid synliga i sidomenyns nederkant vid scrollning. På mobil ligger kontoraden fast längst ned på skärmen.

## Förstärkt inloggning

Publicera hela paketet och tillämpa `0011_login_security.sql` efter `0010_iu_moments.sql` innan den nya versionen används. Netlify Database tillämpar migreringarna vid publicering; på separat PostgreSQL körs filen manuellt. Migreringen loggar ut befintliga sessioner en gång. Användarna behåller sina lösenord. Äldre hashvärden uppgraderas automatiskt vid nästa lyckade inloggning till PBKDF2-SHA256 med 600 000 iterationer. Nya och ändrade lösenord använder direkt den nya metoden.

Inloggningen gäller högst åtta timmar och upphör efter 30 minuters inaktivitet. En varning visas två minuter före utgången med knappen Fortsätt arbeta. Klick, tangenttryckningar och scrollning i en synlig flik räknas som aktivitet. Bakgrundshämtningar håller inte inloggningen vid liv. Servern kontrollerar tidsgränserna på varje skyddad begäran; utgångna sessioner kan inte återaktiveras. Spara arbete före utloggning.

Inloggningsförsök begränsas atomiskt i databasen till sju per konto och 60 per IP-adress under 15 minuter. Lyckad inloggning återställer kontots räknare, men IP-räknaren består. IP-adressen hämtas endast från Netlifys anslutningsheader när Netlify-miljön känns igen (`NETLIFY`, `NETLIFY_DB_URL` eller `SITE_ID`). Vanliga X-Forwarded-For ignoreras. Om anslutningsadressen saknas används en gemensam reservräknare, så skyddet stängs inte av. På andra hostingplattformar behövs en anpassning till deras betrodda proxy. IP-adresser och kontonamn lagras hashade i spärrtabellen; utgångna räknare städas vid inloggningsförsök. Flera användare på samma nät delar IP-gränsen.

## Instruktörspanel och mobilmeny

Instruktörsöversikten heter nu Instruktörspanel. Undermenyerna Översikt, Elever, Personal, System E2, System M, Övrigt, Operativ IU och Simulator IU samlar navigeringen. Översikten visar elev- och personallistor med sökning samt antal elever, personal och årets klara/kvarvarande individuella uppföljningar. Lägg till person låter instruktörer och administratörer välja elev eller personal. Tidigare Utbildad personal heter Personal i menyer och vyer.

På skärmar upp till 900 px öppnas sidomenyn från vänster med menyknappen i den fasta toppraden. Den stängs vid menyval, med kryss, genom tryck utanför menyn eller Escape. Namn och roll ligger kvar i kontoraden längst ned. Menyn och personlistan scrollas utan att kontoraden försvinner. Handledare och Chef har fortsatt bara elevfunktionerna; administratörens Användare finns kvar.

Ingen ytterligare databasmigrering krävs för dessa menyändringar. Inloggningsförstärkningen från föregående paket kräver fortsatt `0011_login_security.sql` om den inte redan har tillämpats.

## Personregistrering och tidigare IU-kommentarer

Nya elever och personal läggs endast till med Lägg till person i Instruktörspanelens översikt. Registreringsknappar och formulär har tagits bort från elev- och personalöversikterna.

I varje öppnat IU-moment visas en separat läsruta med kommentaren från den senaste sparade uppföljningen för samma person och samma del, tillsammans med datum och ansvarig. Detta gäller operativa moment, Ämnen till chef och simulatorns moment. Rutan ändrar eller kopierar inte kommentaren till det nya protokollet. Om den senaste uppföljningen saknar kommentar visas detta. När ett sparat historiskt protokoll öppnas jämförs det med föregående protokoll, så att senare kommentarer inte visas som tidigare historik. Ingen ny databasmigrering behövs.

## Simulatorns moment och delmoment

Simulator IU i Instruktörspanelen visar nu moment som innehåller flera delmoment. Momentets namn och beskrivning hanteras tillsammans med delmomentens namn, beskrivningar och egna maxpoäng. Lägg till delmoment skapar fler rader. Momentets maxpoäng är summan av delmomentens maxpoäng. Ett moment måste innehålla minst ett delmoment. Instruktörer och administratörer kan redigera moment, lägga till/ta bort delmoment eller ta bort hela momentet. Alla delmoment sparas tillsammans i en databastransaktion.

Den tidigare indelningen från simulatordokumentet behålls: Specialtransport, Småfordon växling, Spärrfärd småfordon, Egenskydd, Evakuering, Spärrfärd hjälpfordon, Växling, Vägväxling, Backning på linjen med uppsikt och Stoppkörning infartssignal. Tidigare egna momentgrupper följer också med. I simulatorbedömningen finns endast den aktuella kommentaren per delmoment. Föregående kommentarer finns fortsatt i den operativa delen och Ämnen till chef.

Tillämpa `0012_simulator_moments.sql` efter `0011_login_security.sql` vid publicering. Netlify Database kör nya migreringar automatiskt. För separat PostgreSQL-databas körs filen manuellt. Befintliga delmoments-ID:n, bedömningar, kommentarer och sparade protokolls underlag bevaras. Nya uppföljningar använder den aktuella momentindelningen; äldre protokoll öppnas och skrivs ut med sitt sparade underlag.

### Pågående bedömningar

Individuell uppföljning sparar automatiskt ett gemensamt pågående utkast per person och del (Operativ/Simulator) i databasen. Texter, färgval och poäng återställs efter byte av sida, omladdning och utloggning. Detta gäller även ändringar i tidigare sparade protokoll. Instruktörer och administratörer kan fortsätta arbetet efter nästa inloggning. Elevens färgnivå sparas direkt som tidigare; oskickade elevkommentarer hålls endast under samma inloggning.

**Spara uppföljning / Spara ändringar** lägger protokollet i historiken och tar bort det pågående utkastet för den delen. Statusen visar därefter det sparade resultatet. **Ny uppföljning** visar en varning om pågående ändringar inte har sparats till historiken, även när man ändrat ett gammalt protokoll. Avbryt behåller arbetet. Bekräfta raderar utkastet och öppnar ett tomt formulär; sparad historik behålls. Ett utkast töms aldrig automatiskt vid utloggning.

Utloggning väntar tills aktuella utkast nått databasen. Vid nätfel visas ett fel och utloggning stoppas; välj Försök igen i uppföljningen. Webbläsaren varnar vid omladdning/stängning medan arbete fortfarande väntar på automatisk sparning. Om två personer redigerar samtidigt stoppas gamla skrivningar med en versionskontroll. Meddelandet ber då användaren ladda om; kopiera först eventuella lokala ändringar som behövs.

Kör **0014_persistent_followup_drafts.sql efter 0013_operational_categories.sql** på en separat PostgreSQL-databas. Netlify Database tillämpar nya migrationer vid publicering.

### Kategorier i Operativ IU

Instruktörspanel → Operativ IU har **Ny kategori** samt möjlighet att redigera och ta bort kategorier. Varje moment har ett kategorival vid skapande och redigering. Befintliga operativa moment placeras i **Operativa moment** och tidigare chefsfrågor i **Ämnen till chef**. Dessa visas som små underrubriker på samma nivå i personalbedömningen, med befintliga momentrutor, färgval och kommentarsfält. Nyheter och provresultat finns fortsatt i sin egen utfällbara ruta. Om en kategori tas bort flyttas momenten till **Utan kategori**; momenten och deras ID:n tas inte bort.

Kör **`0013_operational_categories.sql` efter `0012_simulator_moments.sql`** på en separat PostgreSQL-databas. Netlify Database tillämpar nya migreringar vid publicering. Alla tidigare migreringsfiler finns med i paketet. Sparade protokoll behåller sin kategoriindelning i historik och utskrift genom sitt sparade underlag. Äldre protokoll utan kategorifält visar sina ursprungliga bedömningsområden och Ämnen till chef.

### Ordning och separata kategoriramar

På Operativ IU i Instruktörspanelen flyttas kategorier med upp- och nedpilar. Första kategorins uppåtpil och sista kategorins nedåtpil är avstängda. Ordningen sparas i databasen och gäller för nya uppföljningar samt deras utskrifter. Sparade historiska protokoll behåller ordningen från sitt sparade underlag. Under personalbedömningen har varje kategori en egen vit ruta med ram och mellanrum; nyheter och provresultat ligger i en separat ruta. Ingen ny migrering krävs utöver **0013_operational_categories.sql** från föregående paket.

### Namnlistor i mobilmenyn

Mobilens sidomeny visar elever och personal lodrätt, med ett namn per rad och full radbredd. Långa namn kan radbrytas. Menyns innehåll rullar lodrätt medan den inloggade användaren ligger kvar nederst. Ingen ny SQL-migrering behövs.

### Sparad status och årsskifte

Personalöversikten och Instruktörspanelen visar separata statusar för **Operativ** och **Simulator**: Påbörjad, Godkänd, Komplettering krävs eller Ej påbörjad. Påbörjad visar aktuella osparade ändringar i den öppna uppföljningen för respektive del. Efter **Spara uppföljning / Spara ändringar** finns protokollet i historiken och statusen ersätts av det sparade resultatet. En sparad uppföljning utan valt resultat visas som Påbörjad. Att redigera ett befintligt protokoll uppdaterar samma post i historiken. Den diskreta bocken och antal genomförda kräver att båda delarna är Godkända under innevarande år och saknar pågående ändringar.

**Godkänd och Påbörjad nollställs automatiskt vid årsskiftet enligt svensk tid. Komplettering krävs ligger kvar tills en senare uppföljning ersätter resultatet.** Protokoll och kommentarer raderas inte. Pågående formulärtexter behålls i databasen även om årsskiftet döljer deras gamla Påbörjad-status; om man fortsätter redigera markeras de åter som Påbörjad. Året kontrolleras även när en öppen sida får fokus igen. För beständiga utkast krävs migration **0014_persistent_followup_drafts.sql**.

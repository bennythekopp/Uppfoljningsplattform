# Instruktörspanel · TC Boden

## Installation

1. Ta en säkerhetskopia av databasen och nuvarande GitHub-filer.
2. Databasen ska sedan tidigare vara uppdaterad till och med `0020`.
3. Kör `netlify/database/migrations/0021_order_and_role_preview.sql` om den inte redan har körts.
4. Kör därefter `netlify/database/migrations/0022_instructor_panel.sql` **en gång** i samma databas som webbplatsen använder. Återkör inte redan tillämpade migrationsfiler.
5. Kopiera ZIP-filens innehåll till roten i det befintliga GitHub-repot och ersätt filerna. Behåll alla andra filer. Ta med både `package.json` och `package-lock.json`.
6. Låt Netlify bygga och publicera uppdateringen. Inga nya miljövariabler eller externa dokumenttjänster krävs. Logga in och ladda om sidan.

Paketet är en kumulativ uppdatering med ändrade och nya filer från dagens eftermiddag/kväll. Det är inte en komplett webbplats. Befintlig databasanslutning (`NETLIFY_DB_URL` eller `DATABASE_URL`) och inloggning används.

## Meny och roller

Instruktörspanel, Bedömningsunderlag, Elever och Personal är huvudval. Administratören har dessutom Administratörsverktyg. Under avskiljaren visas endast menyn/listan för valt område. Alla befintliga bedömningsfunktioner ligger kvar under Elever, Personal och Bedömningsunderlag.

De nya modulerna får användas av instruktörer och administratörer. Handledare och Chef har kvar sina tidigare behörigheter till bedömningsstödet och kommer inte åt dokument eller övriga nya moduler. Rollförhandsvisningen är skrivskyddad även på servern.

## Gemensamt och personligt

- Dokument, uppgifter, mallar, anslag och introduktionens checklistesteg är gemensamma.
- Layout, favoriter, snabbåtgärder, introduktionens avprickningar och påminnelser sparas per inloggat konto i databasen.
- Skapa introduktionens steg via Introduktion → Nytt steg. Koppla vid behov ett dokument till varje steg. Nya användare har egna avprickningar.
- Lägg till elever och personal med Lägg till person i instruktörspanelen eller via en personlig snabbåtgärd.
- Outlook-kalendern, Formulär och Min arbetsyta ingår inte.

## Anpassa panelen

Välj Anpassa panelen. Lägg till eller ta bort moduler, flytta med draghandtaget och ändra bredd/höjd med hörnhandtaget. Ändringarna visas direkt. Spara behåller layouten för ditt konto; Avbryt återgår till senast sparad layout. Bredd/höjd kan även anges med kontrollerna i varje modul och draghandtaget fungerar med piltangenter. Moduler kan upprepas. Upp till 40 moduler, 12 kolumner och 3–20 rader per modul stöds.

På mobilen visas modulerna under varandra i sparad ordning. Höjden kan ändras med pekskärmen; bredden anpassas till skärmen. Breddinställningen används på större skärmar. Dölj en modul genom krysset i redigeringsläget; det raderar inte modulens innehåll.

## Dokument

Skapa dokument och öppna flera dokument i dokumentfliksraden. Varje dokument har egna innehållsflikar. Lägg till flikar med +, dubbelklicka för att byta namn, eller använd krysset för att ta bort en flik. Tidigare innehåll kan återfinnas i versionshistoriken.

Redigeraren har rubriker, stycken, teckensnitt, textstorlek/färg, justering, länkar, rasterbilder, redigerbara tabeller, listor och checklistor. Sidhuvud och sidfot anges ovanför och under dokumenttexten. Ångra/gör om gäller den aktuella dokumenttexten. Ordräknare och sök/ersätt finns också.

Stavningskontroll är inställd på svenska och använder webbläsarens inbyggda stöd. Svenska måste vara aktiverat/installerat i webbläsaren eller på enheten; sidan skickar inte texten till en separat språktjänst.

Automatisk sparning sker efter en kort skrivpaus. Yjs sammanfogar samtidiga textändringar. Öppna dokument hämtar andras ändringar ungefär varannan sekund, utan separat WebSocket-server. Närvaromarkeringarna visar vilka konton som nyligen haft dokumentet öppet. Det finns inga delade live-markörer. Användare behöver nätanslutning; detta är inte en fristående offline-redigerare.

Osparade ändringar behålls i minnet om sparning misslyckas. Sidan varnar innan man lämnar webbläsaren och stoppar vanlig navigering/utloggning om dokumentet inte kan sparas. Ladda inte om vid sparfel innan texten har sparats eller exporterats. Knappen Spara lokal säkerhetskopia ger rådata för återhämtning; normal export ger Word/PDF. Lokala råkopior har ingen importknapp och kan återställas med teknisk hjälp.

## Kommentarer, förslag och historik

Kommentarer hör till en dokumentflik och kan innehålla ett textcitat. För ändringsförslag: markera text, välj Ändringsförslag, skriv kommentar och ersättningstext. Godta ersätter citatet endast om det återfinns entydigt i den aktuella texten. Annars får användaren granska och ändra manuellt. Detta är en granskning med textförslag, inte automatisk spårning av varje tangenttryckning.

Automatiska historikversioner sparas vid redigering med ungefär fem minuters mellanrum. Spara version nu ger en omedelbar kontrollpunkt. De senaste 200 versionerna per dokument behålls. Visa ger en textförhandsvisning. Återställ tar först en kopia av nuvarande innehåll. Andra aktiva användare måste stänga dokumentet innan återställning. Gamla klienter hindras från att skriva över återställt innehåll och kan exportera sina lokala ändringar.

## Word, PDF och utskrift

Exportknapparna sparar först och tar sedan med dokumentets ifyllda flikar, inklusive tabeller, listor och bilder. Word är en riktig `.docx`-fil och PDF laddas ned som en `.pdf`-fil. Skriv ut använder webbläsarens utskriftsdialog. Sidhuvud/sidfot blir upprepade Word-sidhuvuden/sidfötter; i PDF/utskrift visas de i dokumentets början/slut. Kommentarspanel och historik tas inte med. Exporten följer dokumentets innehåll; Word och webbläsare kan ha olika rad- och sidbrytningar.

Bilder bäddas in från PNG/JPEG/WebP, skalas till högst 1200 pixlars bredd och lagras som PNG. Uppladdningen accepterar högst 4 MB före bearbetning och ungefär 675 KB efter. Hela dokumentets sparade samarbetsdata begränsas till cirka 2,6 MB. Dela större material i flera dokument eller minska bilderna.

## Mallar

Listan visar endast namn och malltyp under namnet, tillsammans med redigerings-/borttagningsikoner.

- Dokumentmall: välj ett befintligt dokument när du skapar mallen, eller använd Spara som mall i redigeraren. Ett klick skapar ett nytt, fristående dokument från mallens sparade innehåll. Senare ändringar av originaldokumentet ändrar inte mallen automatiskt.
- Outlook-mall: ange namn, mottagare (valfritt), ämne och meddelande. Ett klick öppnar ett nytt utkast i **Outlook på webben**. Ingen Microsoft-koppling eller serverbaserad e-postsändning görs. Användaren loggar vid behov in i Outlook, granskar och skickar själv. Detta tvingar inte fram Outlooks skrivbordsapp.

## Granskning och verifiering

Databasändringarna är tillägg och ändrar inte befintliga elevbedömningar eller IU-protokoll. Gemensamma ändringar loggas tillsammans med vem och när. Påminnelsers privata text sparas inte i aktivitetsloggen. Databas- och loggskrivningar är transaktionella.

Lokalt verifierat med produktionsbygge, 355 behörighetskontroller, API-tester mot PostgreSQL-kompatibel testdatabas och webbläsartester mot verkliga API-funktioner. Testerna omfattar samtidig dokumentredigering, sparning, versionsåterställning, personliga uppgifter, mallar, Word/PDF, mobilmeny och layout. Den driftsatta Netlify-miljön är inte ändrad eller belastningstestad.

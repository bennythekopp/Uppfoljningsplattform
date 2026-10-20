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
- Lägg till elever och personal med Lägg till person på respektive översiktssida Elever eller Personal.
- Outlook-kalendern, Formulär och Min arbetsyta ingår inte.

## Anpassa panelen

Välj Anpassa panelen högst upp till höger. Modulrubrikerna öppnar respektive innehållslista. Lägg till eller ta bort moduler, flytta med draghandtaget och ändra bredd/höjd med hörnhandtaget. Ändringarna visas direkt. Spara behåller layouten för ditt konto; Avbryt återgår till senast sparad layout. Bredd/höjd kan även anges med kontrollerna i varje modul och draghandtaget fungerar med piltangenter. Moduler kan upprepas. Upp till 40 moduler, 12 kolumner och 3–20 rader per modul stöds.

Innehållet i Dokument, Att göra, Mallar, Anslagstavla, Introduktion, Mina påminnelser, Favoriter och Snabbåtgärder kan också flyttas. På översikten låser Anpassa panelen upp draghandtagen för både moduler och deras innehåll. Inne på varje modulsida låser Sortera upp listan. Dragning visar den nya ordningen direkt, även med pekskärm. Spara behåller ordningen och låser läget; Avbryt återgår till den sparade ordningen. Pilar används inte. Ordningen sparas för ditt konto och gäller både på översikten och respektive helsida. Nya poster läggs sist.

På mobilen visas modulerna under varandra i sparad ordning. Höjden kan ändras med pekskärmen; bredden anpassas till skärmen. Breddinställningen används på större skärmar. Dölj en modul genom krysset i redigeringsläget; det raderar inte modulens innehåll.

## Dokument

På Dokument och Mallar finns Ladda upp. Välj Word (DOCX), HTML eller TXT (högst 2 MB). Filen omvandlas till ett redigerbart dokument i Översikt; en uppladdad mall visas bland dokumentmallarna och kan användas för nya dokument. Word-format kan se något annorlunda ut efter konverteringen. PDF och äldre DOC-filer kan inte importeras som redigerbara dokument.

Skapa dokument och öppna flera dokument i dokumentfliksraden. Nya dokument startar med endast Översikt. Äldre dokument slås samman till Översikt vid första öppningen efter uppdateringen: text och kommentarer bevaras och en version sparas före sammanslagningen. Detta sker bara en gång; flikar du därefter själv lägger till behålls. Dokumentet öppnas alltid på Översikt om den finns. Lägg till flikar med +. Byt namn med pennknappen eller dubbelklick. Välj Sortera och dra flikens handtag med mus eller pekskärm. Den nya ordningen visas direkt; Spara behåller den och Avbryt återgår. Krysset tar bort en flik. Fliknamn sparas automatiskt. Flikordningen sparas med Spara och gäller för alla som kan öppna dokumentet. Tidigare innehåll kan återfinnas i versionshistoriken.

Redigeraren har rubriker, stycken, 198 valbara Office-/Windows-typsnitt (visas om de finns på enheten), textstorlek/färg, bakgrundsfärg, genomstrykning, upphöjd/nedsänkt text, indrag, radavstånd, sidbrytning, specialtecken, justering, länkar, rasterbilder, redigerbara tabeller med cellfärg, sammanfogning och delning, listor och checklistor. Sidhuvud och sidfot anges ovanför och under dokumenttexten. Ångra/gör om gäller den aktuella dokumenttexten. Ordräknare och sök/ersätt finns också.

Stavningskontroll är inställd på svenska och använder webbläsarens inbyggda stöd. Svenska måste vara aktiverat/installerat i webbläsaren eller på enheten; sidan skickar inte texten till en separat språktjänst.

Automatisk sparning sker efter en kort skrivpaus. Yjs sammanfogar samtidiga textändringar. Öppna dokument hämtar andras ändringar ungefär varannan sekund, utan separat WebSocket-server. Närvaromarkeringarna visar vilka konton som nyligen haft dokumentet öppet. Det finns inga delade live-markörer. Användare behöver nätanslutning; detta är inte en fristående offline-redigerare.

Osparade ändringar behålls i minnet om sparning misslyckas. Sidan varnar innan man lämnar webbläsaren och stoppar vanlig navigering/utloggning om dokumentet inte kan sparas. Ladda inte om vid sparfel innan texten har sparats eller exporterats. Knappen Spara lokal säkerhetskopia ger rådata för återhämtning; normal export ger Word/PDF. Lokala råkopior har ingen importknapp och kan återställas med teknisk hjälp.

Dokumentikonen och dess färg kan ändras genom ikonen vid dokumentnamnet. Word, PDF, Skriv ut och Spara som mall ligger överst till höger på samma rad som Alla dokument. Krysset för ett öppet dokument visas vid hovring eller tangentbordsfokus; på pekskärm visas det på den aktiva dokumentfliken.

Redigeraren är utökad men är inte en fullständig kopia av Google Docs. Bland annat saknas Google Docs tillägg, avancerade ekvationer, automatisk innehållsförteckning, avancerad sidlayout och fullständig Word-import.

## Kommentarer, förslag och historik

Kommentarer hör till en dokumentflik och kan innehålla ett textcitat. För ändringsförslag: markera text, välj Ändringsförslag, skriv kommentar och ersättningstext. Godta ersätter citatet endast om det återfinns entydigt i den aktuella texten. Annars får användaren granska och ändra manuellt. Detta är en granskning med textförslag, inte automatisk spårning av varje tangenttryckning.

Automatiska historikversioner sparas vid redigering med ungefär fem minuters mellanrum. Spara version nu ger en omedelbar kontrollpunkt. De senaste 200 versionerna per dokument behålls. Visa ger en textförhandsvisning. Återställ tar först en kopia av nuvarande innehåll. Andra aktiva användare måste stänga dokumentet innan återställning. Gamla klienter hindras från att skriva över återställt innehåll och kan exportera sina lokala ändringar.

## Word, PDF och utskrift

Exportknapparna sparar först och tar sedan med dokumentets ifyllda flikar, inklusive tabeller, listor och bilder. Word är en riktig `.docx`-fil och PDF laddas ned som en `.pdf`-fil. Skriv ut använder webbläsarens utskriftsdialog. Exporten innehåller enbart själva dokumenttexten. Sidhuvud, sidfot, automatiskt dokumentnamn, fliknamn och webbplatsens gränssnitt läggs inte till. Rubriker som skrivits i dokumentet behålls. Stäng av webbläsarens egna sidhuvuden/sidfötter i utskriftsdialogen vid behov. Kommentarspanel och historik tas inte med. Exporten följer dokumentets innehåll; Word och webbläsare kan ha olika rad- och sidbrytningar.

Bilder bäddas in från PNG/JPEG/WebP, skalas till högst 1200 pixlars bredd och lagras som PNG. Uppladdningen accepterar högst 4 MB före bearbetning och ungefär 675 KB efter. Hela dokumentets sparade samarbetsdata begränsas till cirka 2,6 MB. Dela större material i flera dokument eller minska bilderna.

## Mallar

Listan visar endast namn och malltyp under namnet, tillsammans med redigerings-/borttagningsikoner.

- Dokumentmall: välj ett befintligt dokument när du skapar mallen, eller använd Spara som mall i redigeraren. Ett klick skapar ett nytt, fristående dokument från mallens sparade innehåll. Senare ändringar av originaldokumentet ändrar inte mallen automatiskt.
- Outlook-mall: välj Ny mall och därefter nytt mejl eller nytt möte. Ange rubrik, ämne och meddelande. Ingen mottagare lagras i mallen. Ett klick öppnar ett nytt utkast i **Outlook på webben**. Ingen Microsoft-koppling eller serverbaserad e-postsändning görs. Användaren loggar vid behov in i Outlook, fyller i deltagare/tid vid behov, granskar och skickar själv. Detta tvingar inte fram Outlooks skrivbordsapp.

## Granskning och verifiering

Databasändringarna är tillägg och ändrar inte befintliga elevbedömningar eller IU-protokoll. Gemensamma ändringar loggas tillsammans med vem och när. Påminnelsers privata text sparas inte i aktivitetsloggen. Databas- och loggskrivningar är transaktionella.

Lokalt verifierat med produktionsbygge, 355 behörighetskontroller, API-tester mot PostgreSQL-kompatibel testdatabas och webbläsartester mot verkliga API-funktioner. Testerna omfattar samtidig dokumentredigering, sparning, versionsåterställning, personliga uppgifter, mallar, Word/PDF, mobilmeny och layout. Den driftsatta Netlify-miljön är inte ändrad eller belastningstestad.

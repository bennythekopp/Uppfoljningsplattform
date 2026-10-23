# TC Boden – samlad uppdatering 23 oktober 2026

De ändringar som var planerade till 29 oktober har kodats tidigare på begäran.

## Installera på den befintliga sidan

1. Lägg filerna i ditt befintliga GitHub-repository och ersätt motsvarande filer. Behåll mappstrukturen. `app/`, `netlify/` och `package.json` ska ligga i repositoryts rot.
2. Tillämpa **`netlify/database/migrations/0030_planning_and_module_access.sql` efter `0029_admin_notifications.sql`** i samma PostgreSQL-databas som sidan använder. Tidigare migrationer behöver inte köras på nytt om de redan är tillämpade.
3. Låt Netlify bygga och publicera uppdateringen med `npm run build`.
4. Logga in som administratör och öppna Instruktörspanelen → **Modulsynlighet**. Planering är dold för andra från början. Välj de instruktörer och eventuella chefer som ska få se den.
5. Öppna Planering → **Redigeringsbehörighet** och välj vilka instruktörer som också får ändra innehållet. Ge dem synlighet först. Chefer har alltid läsbehörighet. Administratörer har alltid tillgång.

Uppdaterings-ZIP innehåller ändrade och nya filer jämfört med det kompletta paketet från 22 oktober. Komplett-ZIP innehåller hela projektet. Använd ett av paketen. Inga konton, lösenord, databasnycklar eller testdata följer med.

## Detta ingår

- Mobilens dra-för-att-uppdatera, med diskret cirkulär indikator. Väntande dokument- och bedömningsändringar sparas först. Vid sparfel avbryts uppdateringen och texten behålls. Aktuell vy och person behålls.
- Mjukare drag och släpp med direkt förflyttning, synlig plats och automatisk skrollning. Panelens befintliga Anpassa panelen och modulernas Sortera styr fortfarande när sortering är tillåten.
- Operativa moment kan dras mellan kategorier i Personal och Examen. Kategorierna behåller sina stora rutor. Namnet redigeras i den aktuella kategorirutan, och redigera/ta bort ligger till höger om namnet. Kategorier kan dras till ny ordning.
- Redigera och ta bort simulator­scenario finns på respektive scenariorad i Examen. Nytt scenario finns kvar. Den dubbla knappen för att lägga till moment är borttagen.
- Loggan efter inloggning har transparent bakgrund på dator och mobil, i ljust och mörkt läge.
- Synlighet för varje panelmodul kan styras av administratören per användare. Dolda moduler filtreras även i data och API. Personliga inställningar och privat innehåll behåller sin ägare. En dold moduls placering finns kvar när den görs synlig igen.

## Planering

Planering är en egen panelmodul och fullständig årsvy. Grundschema finns kvar separat.

- Datum löper lodrätt. Gemensamma kolumner HT2025, VT2026, HT2026 och ÖVRIGT följs av användarnas Tur och Uppgift. Personerna hämtas från aktiva instruktörs- och administratörskonton; kopplingen använder kontoidentitet. Äldre personer och sparade uppgifter bevaras vid kontoförändringar.
- Dagens hela datumrad markeras. Månad, år och ISO-veckor visas. Datum och tabellrubriker stannar kvar vid skrollning. Sidomenyn är smalare i den fullständiga planeringsvyn.
- Tur är en skrivbar rullista med turlistans förbestämda turer och möjlighet till egen text. Uppgift och gemensamma fält redigeras direkt i cellen. Enter eller Tab lämnar cellen; Shift+Enter ger ny rad i textfälten.
- En ändring sparas när cellen lämnas. Sparfel behåller texten och visar Försök igen. Vid en verklig samtidig ändring kan man välja den egna eller den sparade texten. Sparningen använder en egen versionskontroll per cell.
- Grundturerna hämtas från daterade kopior av aktivt Grundschema och personernas tilldelade schemarader. Manuella ändringar lagras separat. De skrivs inte över när ett grundschema eller en turlista ändras.
- I Grundschema väljer administratören **Gäller i Planering från** vid aktivering och ändring av aktiv turlista. Mellan den sista gamla och första nya dagen visas ett tunt streck med **Ny turlista** inbakat i datumkolumnen. Enbart en ändrad person­tilldelning skapar ingen sådan markering.
- Natturer ger en sammanhängande pil genom följande dagar, med Natt vid starten. En annan tur på slutdagen visas i nedre halvan. Varje dags underliggande cell kan fortfarande redigeras.
- Gemensamma kolumner kan läggas till, byta namn och tas bort via rubrikens meny. Namnbyte behåller data. Borttagning döljer kolumnen efter bekräftelse.
- Planeringsloggen visar person, ändringstid, schemadatum, kolumn/fält samt tidigare och nytt innehåll. Även struktur- och behörighetsändringar registreras.
- Utvalda chefer får en egen Planering-länk ovanför Elever. Den ger inte tillgång till Instruktörspanelen eller redigering.

Excelarket används som strukturunderlag. Historiska Exceltexter importeras inte automatiskt eller delas upp genom gissningar. Nya planeringsfält utgår från databasen och de tilldelningar som finns i Grundschema.

## Tidigare uppdateringar

Det kompletta paketet innehåller också tidigare levererade ändringar, inklusive dokumentens sidformat och marginaler, gemensamma/privata moduler, notisbjällra, inloggningslogga, mörkt läge, dolda bedömningsmoment och borttagning av genomförandeloggar på Examen.

## Validering

- TypeScript och produktionsbygge.
- `npm run test:planning`: ISO-veckor, skottår, daterade turer, nattkedja, snabba ändringar, sparfel och konflikthantering.
- API-prov med separata administratörs-, instruktörs-, handledar- och chefskonton i en isolerad testdatabas. Migrationerna och omkörning av 0030 har kontrollerats där.
- Webbläsarprov i Chromium, i dator- och mobilvy, av skrivning/sparfel, planeringslogg, flyttning mellan kategorier, inline kategoriredigering, chefsrollens läsvy, mobilmeny och dra-för-att-uppdatera.

Paketet är testat lokalt. Den befintliga Netlify-sidan ändras först när filerna publiceras och databassteget är tillämpat.

## Justering av kolumnbredder 23 oktober

Datum och Tur behåller nu fasta, smala bredder när planeringsmodulen görs större. Uppgift tar återstående bredd. Detta gäller både dator och mobil. Även den fullständiga planeringsvyn låter Uppgift ta den extra ytan. Justeringen ändrar endast app/planning.css och kräver inget nytt databassteg.

## Prestandarättning i Planering 23 oktober

- Varje cell prenumererar på sina egna ändringar. Hela årsarket ritas inte längre om vid varje tangenttryckning, fokusskifte eller sparstatus.
- Nattceller uppdateras också när föregående dags tur ändras, så att pilen följer redigeringen direkt.
- Textfältens höjd mäts i gemensamma läs- och skrivsteg. Det undviker tusentals separata omräkningar av sidans layout.
- Veckodagsformatering återanvänder samma formatterare.
- Utseende, cellvärden, autosparning vid lämnad ruta, konflikthantering och åtkomstregler är oförändrade. Inget nytt SQL-steg behövs om 0030 redan har körts.

Kontrollerat med TypeScript, produktionsbygge, klienttester och webbläsartest med 365 datum, sex personer och tre gemensamma kolumner (5 475 inmatningsfält). Webbläsartestet omfattar skrivning, sparning vid Tab, flerradig text, sparfel/försök igen, bevarat utkast vid uppdatering och nattpil över nästa dygn. I samma lokala jämförelsetest sjönk den längsta React-uppdateringen under skrivning från cirka 334 ms till under 1 ms. Detta är en lokal mätning, inte ett löfte om identisk hastighet på alla enheter.

### Göra Planering synlig

Administratören öppnar Instruktörspanelen → Modulsynlighet → Planering. Låt "Välj vilka användare som ser modulen" vara ibockad, välj instruktörer och chefer och tryck Spara. Chefer får en egen Planering-länk ovanför Elever och kan enbart läsa. Instruktörer öppnar Planering från instruktörspanelens meny. Om panelkortet saknas i en personlig layout kan instruktören välja Anpassa panelen → Lägg till modul → Planering → Spara.

För att även låta en instruktör redigera: öppna Planering → Redigeringsbehörighet, välj personen och spara. Synlighet måste ges först. Menyer hos andra inloggade användare uppdateras inom ungefär 30 sekunder; de kan också ladda om sidan.

## Ny rättning för turval och större årsark 23 oktober

Den tidigare cellrättningen räckte inte för turval i stora årsark. Planering använder nu en egen skrivbar rullista i stället för webbläsarens datalist. Listan visar alltid alla turer i turlistan som gäller för datumet, även när cellen redan innehåller en tur eller egen text. Varje rad innehåller bara turnamn och färgmarkering; klockslag visas inte. Piltangenter och Enter fungerar, liksom klick och pekskärm. Egen text kan fortfarande skrivas och sparas när rutan lämnas. Ett turval avslutar redigeringen och sparas i bakgrunden.

Hela året är fortfarande åtkomligt, men bara datumen nära den synliga delen får aktiva inmatningsfält. En fokuserad ruta hålls kvar även när man skrollar bort från den. Flerradiga uppgifter får behålla sin höjd. Månadsknappar, årsskrollning, smala Datum/Tur-kolumner, personernas färger och nattpilar behålls. Någon ny databasuppdatering behövs inte.

De nya filerna `app/planning-tour-picker.tsx` och `app/planning-window.ts` måste följa med vid uppladdningen, tillsammans med uppdaterade `app/planning.tsx`, `app/planning-cell.tsx` och `app/planning.css`. Paketet med enbart prestandarättningen innehåller även den förra cellrättningen.

Kontrollerat lokalt i datorvy och mobil pekvy med 365 dagar, sex personer, tre gemensamma kolumner, fyra gånger långsammare testprocessor och fördröjda sparningar. Kontrollerna omfattar samtliga turer trots befintlig/egen text, färgmarkeringar utan tider, upprepade val under pågående sparning, tangentbord, nattpil, sparfel med återförsök, utkast när man skrollar bort från cellen, sista dagen på året och månadshopp. TypeScript, produktionsbygge och befintliga klienttester har också körts. Testerna använder exempeldata och ändrar inte den publicerade sidan.


## Turrutor och nattfärg 23 oktober

Rullisteindikatorn är borttagen från planeringens turrutor. Klicka eller tryck i en ruta för att öppna samtliga turer. Tangentbordsöppning och fri text finns kvar.

Nattmarkeringen använder nu natturens sparade färg från turlistan för datumet, i stället för en fast färg. Samma färg följer med till nattpilens fortsättning nästa dag. Sammanhängande natturer har en sammanhängande pil med text vid starten. En annan tur på slutdagen behåller sin egen färg i nedre halvan. Färgen kan hämtas även när Natt skrivits med små bokstäver. Inget nytt SQL-steg krävs.

Kontrollerat med TypeScript, produktionsbygge, klienttester och webbläsarprov i dator- och mobil pekvy: ingen rullistepil, öppning på klick, fullständig turlista, sparat Natt-val, nattens färg från turlistan, pil över flera dygn, annan tur i nedre halvan, ljust/mörkt läge och uppdaterad färg när turlistan ändras.


## Planeringskortets höjd 23 oktober

Den fasta gränsen på 14 datum i instruktörsöversiktens planeringskort är borttagen. Kortet visar fler datum när det görs högre och färre när det görs lägre. Detta sker direkt under Anpassa panelen och behålls efter Spara. På mobil följer Planering också sin sparade modulhöjd. Bara den egna personens kolumner visas som tidigare.

Tabellens synliga område följer kortets storlek och mäts med ResizeObserver. Bara närliggande datum renderas, så att den tidigare prestandarättningen behålls. Årets återstående datum är tillgängliga i kortet.

Kontrollerat i dator- och mobilvy med panelens verkliga storlekskontroller: höjd 3 till 12 visade fler än 14 datum, både under redigering och efter sparning; minskad höjd gav färre datum igen. Datumordning och visning av enbart den inloggade personens rad är bevarade. TypeScript och produktionsbygge är kontrollerade. Ingen ny SQL behövs.


## Turvarianter och mjukare ljust läge 23 oktober

Flera turer får ha samma namn, även med olika färger och arbetspass. Varje turvariant har en egen identitet i den sparade turlistan. Namn, färg och tider kan därför redigeras för en variant utan att en annan med samma namn ändras. Grundschemats placeringar och manuella planeringsval behåller rätt variant efter sparning och omladdning. Borttagning tömmer bara de grundschemarutor som använder just den borttagna varianten. Tidigare sparade turlistor och vanliga namnreferenser kan fortfarande läsas.

Rullistorna visar turnamn och färg. Även Grundschema använder samma färgväljare vid placering av turer, så att varianterna går att skilja åt på mobil. En vald Natt-variant behåller sin färg genom nattpilen enligt tidigare regler. Planeringsloggen visar turnamn och färg i läsbar form. Historiska manuella val kan fortfarande visas om turvarianten tas bort från en senare turlista.

De vita gränssnittsytorna i ljust läge är svagt nedtonade till en mjuk, nästan vit nyans. Bakgrund, kort, dialoger och fält följer den tonen. Turer och bedömningar behåller sina valda färger. Dokumentens papper och utskrifts-/exportformat ändras inte av gränssnittets färgjustering.

Paketet inkluderar också de två senaste uppdateringarna: ingen rullistepil i planeringens turrutor, nattfärg från turlistan med sammanhängande pil, samt fler datum när planeringskortet görs högre, live och efter sparning på dator och mobil. Tidigare prestandarättningar finns kvar.

Kontrollerat med TypeScript, produktionsbygge och klienttester. De verkliga API-funktionerna har provats mot en isolerad testdatabas för dubbla turnamn, olika identiteter, grundschemareferenser, oberoende namnändring, avvisning av dubbla identiteter, beständiga planeringsval och läsbara loggar. Webbläsarprov på dator och mobil omfattar val och omladdning av rätt färgvariant, val i Grundschema, oberoende redigering/borttagning, nattkedjor med olika färgvarianter samt de nya ljusa ytorna och bevarat mörkt läge.

Ingen ny SQL behövs om 0030 redan är tillämpad. Ersätt och lägg till samtliga filer i valt paket, behåll mappstrukturen och låt Netlify bygga/publicera.

## Planeringslogg endast för administratörer
- Knapp och loggfönster visas bara för administratörer.
- Servern nekar övriga roller åtkomst till planeringsloggen, även om de får se eller redigera planeringen.
- Ingen ny SQL behövs.

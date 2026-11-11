# TC Boden – kodminne och leveransstatus v17.5

## Senaste rättning: v17.5 – följ växande och krympande planeringsceller (2026-11-04)

- Användaren rapporterade att V17.4:s fält/ram fortfarande stannade på en rads höjd när cellen blev högre. Ersätt med **TC-Boden-v17-5-Cellhojd-Och-Tidigare-Uppdateringar.zip**, samlat med V17.1–V17.4 ovanpå V17. Ingen ny SQL eller pushnyckel behövs.
- Textfälten för Uppgift och gemensamma kolumner mäter nu cellens faktiska clientHeight. ResizeObserver följer både td och tr; höjdvariabeln styr redigerare och separat helcellsram när raden växer/krymper eller bredden ändras. Dold mättext, färger, felstatus och sparlogik behålls. Cacheversion tcpa-shell-v17-5.
- TSX-/CSS-parsning och körtest av den verkliga höjdfunktionen för tillväxt/krympning, rad-/fönsterändring, bortkoppling och städning passerar. Ingen visuell kontroll i riktig webbläsare/på fysisk mobil, full typkontroll eller fullständigt bygge för denna rättning.
- **Status: kodat och levererat som samlat paket; inte publicerat av assistenten.**

## Senaste tillägg: v17.4 – textfält och fokusram fyller hela planeringscellen (2026-11-04)

- Kodat i **TC-Boden-v17-4-Hela-Planeringsceller-Samlat.zip**, samlat med samtliga V17.1/V17.2/V17.3-filer ovanpå V17. Ingen ny SQL eller pushnyckel behövs.
- På webbens planeringsark, både mobil och dator, ska hela cellen vara textfält/skrivyta och fokusmarkeringen följa cellens ytterkanter. Tom eller enradig text ska inte ge ett lägre fält i en högre rad. Gäller Uppgift och gemensamma textkolumner. Normala turfält fyller också höga rader; särskild nattvisning bevaras.
- Raden får naturlig höjd från en dold mättext med samma radbrytning och avstånd som redigeraren. Textfältet täcker hela cellen. Färgpalett, felstatus, autosparning, ändringsförslag och tangentbordshantering bevaras. Bilden **Korrigerad aktiv cell i planeringsvyn.png** (libfile_e20b02d5e5e48191a5a21278e8795f4f) är referens för helcellmarkeringen.
- V17.3:s appbjällra, V17.2:s slider och V17.1:s inga egna notiser ingår. Cacheversion tcpa-shell-v17-4.
- TSX-syntax, isolerad körning/rendering av den verkliga textcellskomponenten för tom/enkel/flerradig text, bevarade ändrings-/Enter-händelser och CSS-syntax passerar. Worker-syntax och samlat paketinnehåll kontrollerat. Inget fullständigt bygge, full typkontroll eller visuell webbläsar-/telefonkontroll för denna ändring.
- **Status: kodat och levererat som samlat paket; inte publicerat av assistenten.**

## Senaste tillägg: v17.3 – notisbjällra i planeringsappen, samlat med V17.1/V17.2 (2026-11-04)

- Kodat i **TC-Boden-v17-3-Bjallra-Och-Tidigare-Rattningar.zip** ovanpå V17. Innehåller både V17.1 och V17.2; ingen ny SQL eller pushnyckel behövs.
- Ordning i appens topprad: **Exportera → Notisbjällra → Kugghjul**. Återanvänd hemsidans notislista, behörighet, olästantal och lässtatus. Appanrop använder x-tc-app: planning så att appens egen session används. Vanliga notiser och planeringsnotiser visas enligt serverns åtkomstregler. Bjällran kräver inte telefonens pushgodkännande.
- Knappen i planeringsnotisen öppnar berörd vecka och tur-/uppgiftsruta i appen. Webbens befintliga öppningshändelse behålls. Listan hämtas vid öppning och med befintlig aktivitetsstyrd minutkontroll. Appen får cacheversion tcpa-shell-v17-3.
- V17.1:s inga notiser vid egna ändringar och V17.2:s ovala slider ingår och bevaras.
- Isolerade körtester av verkliga funktionsdelar för appsessionsheader på GET/POST, läsmarkering, säker lokal länk och rätt detaljruta efter inläsning passerar. Worker-syntax och samlat paketinnehåll kontrollerat. Inget fullständigt bygge, fullständig TSX-typkontroll eller visuell telefon-/webbläsarkontroll i denna miljö.
- **Status: kodat och levererat som samlat uppdateringspaket; inte publicerat av assistenten.**

## Senaste tillägg: v17.2 – rättat notisreglage (2026-11-04)

- Kodat i **TC-Boden-v17-2-Rattat-Notisreglage.zip** ovanpå V17/V17.1. Två kodfiler och installationsinstruktion. Ingen databasuppdatering eller nya pushnycklar behövs.
- Notiser på/av ska vara ett ovalt reglage med en rund vit knapp. Av: grå bakgrund/knapp till vänster. På: röd bakgrund/knapp till höger. Låsta mått, rundning och knapposition ska överstyra generella knappstilar som orsakade den fyrkantiga knappen på mobilbilden IMG_9762.png.
- Samma stilrättning omfattar webbens notisreglage. Befintlig push-, tillstånds- och sparlogik samt Mörkt läge-reglaget bevaras. Appens service worker får cacheversion tcpa-shell-v17-2 för den nya gränssnittsstilen. V17.1:s regel för inga egna schemaändringsnotiser bevaras.
- CSS-regler granskade och service-worker-syntax verifierad; workerlogiken är oförändrad utöver cacheversionen. Inget fullständigt bygge eller visuell kontroll i webbläsare/på telefon har körts för denna stilrättning.
- **Status: kodat och levererat; inte publicerat av assistenten.**

## Senaste tillägg: v17.1 – inga schemaändringsnotiser för egna ändringar (2026-11-04)

- Kodat i **TC-Boden-v17-1-Inga-Notiser-Vid-Egna-Andringar.zip**, som läggs ovanpå V17. En ändrad kodfil och en installationsinstruktion. Ingen ny SQL, miljövariabel eller pushnyckel behövs.
- Den som gör en ändring i sitt eget schema ska inte få schemaändringsnotis om den, varken via hemsidans bjällra eller telefonpush. Gäller även planeringsansvarig instruktör/administratör och eget godkännande av förslag som ändrar det egna schemat.
- När någon annan ändrar personens schema gäller tidigare notisinställningar. Vid ändringar av grundschema/radtilldelning som påverkar flera personer aviseras övriga berörda som vanligt. Förslagsnotiser till redigerare påverkas inte. Befintliga notiser/köposter raderas inte.
- Testat genom TypeScript-parsning och körning av den riktiga notismodulen med isolerade databas-/inloggningsadaptrar: inga webb-/pushposter för egen ändring, rätt övriga mottagare vid enskilda och flerpåverkande ändringar, inga notiser vid misslyckad sparning. Inget fullständigt produktionsbygge eller fysisk telefonkontroll för denna uppdatering.
- **Status: kodat och levererat som uppdatering; inte publicerat av assistenten.** Detta ersätter tidigare besked att planeringsansvarig skulle få schemaändringsnotiser även för sina egna ändringar.

## Senaste samlade kodning: v17 tillsammans med v16 – 2026-11-04

Samtliga aktuella väntande ändringar nedan är införda i **TC-Boden-v17-Samlat-Med-V16-Uppdaterade-Filer.zip** (48 nya/ändrade filer jämfört med v15.1). Paketet innehåller även samtliga V16-filer och kan användas ovanpå v15.1 eller V16. V16 behöver inte läggas på separat om detta samlade paket används.

- Nytt: förhandsgranskning av en vald användare med personens synlighet/behörigheter, Översikt och Planering först i menyn följt av svensk alfabetisk ordning, centrerade Ny notis/loggdetaljer och klickbar hel anteckningsyta med skrivfokus. Förhandsgranskningen är skrivskyddad på servern även för en administratör som väljs som mål. Administratörens riktiga inloggning behålls; spärrade/borttagna mål nekas.
- Kör **0045_notifications_and_people_visibility.sql** om den inte redan är installerad, därefter **0046_user_preview.sql**. Tidigare migreringar till och med 0044 förutsätts. Instruktioner finns i LAS-MIG-V17.md och LAS-MIG-V16.md. Samma pushnycklar som för V16 gäller.
- Kontroller: produktionsbygge med Webpack och TypeScript, CSS-syntax, isolerade databastester av användaridentitet, privata anteckningar, olika synlighet för personer med samma roll, rolländring, spärrat mål, säkert avslut, skrivskydd och svensk menyordning. V16:s notis-/push-/synlighetstester, v11:s inloggnings-/sparskydd, adminnotistester och vilogrindstester passerar också.
- Inte installerat i riktig databas eller publicerat av assistenten. Visuell kontroll i webbläsare och på fysisk telefon återstår. Tidigare förhandsvisningstjänst kunde inte starta Next-projektet. Bildförslagen är inte skärmbilder från körd kod.

## Genomfört i v17 – förhandsgranskning per användare och menyordning (2026-11-04)

- Under **Administratörsverktyg → Allmänt → Förhandsgranska gränssnitt** ska administratören kunna välja en **enskild användare**, inte enbart en roll. Förhandsgranskningen ska visa den valda användarens gränssnitt, menyer, synlighetsinställningar och behörigheter.
- Visa sökning **Sök användare**, användarval med namn och roll samt knappen **Förhandsgranska**, enligt senaste bildförslaget. Förhandsgranskning ska inte ändra den valda användarens inställningar.
- Instruktörspanelens del i vänstra sidomenyn ska börja med **Översikt**, följt av **Planering**. Därefter ska övriga moduler visas i svensk alfabetisk ordning: **Anslagstavla, Anteckningar, Att göra, Dokument, Grundschema, Introduktion, Mallar, Påminnelser**. Eventuella ytterligare moduler ska också sorteras alfabetiskt efter de två fasta förstaplatserna. Befintliga synlighets- och behörighetsval ska respekteras.
- Behåll de fasta huvudmenyerna och användarraden. Bildförslaget **Förhandsgranskning i TC Bodens administratörsverktyg.png** (libfile_6c9839dd42f88191b0d2a95464b584fb) visar de nya kontrollerna och ordningen; övriga bilddetaljer innebär inga nya ändringar.
- **Status: kodat i v17; inte installerat eller publicerat av assistenten.**

## Genomfört i v17 – centrerade popupfönster och klickbar anteckningsyta (2026-11-04)

- Popupfönstret **Ny notis** och popupfönstret för **detaljer i planeringsloggen** ska vara centrerade på skärmen, både på mobil och dator. Anpassa storlek och eventuell intern rullning så att innehåll och knappar ryms även i liggande läge.
- På instruktörspanelen ska **hela textytan i anteckningsrutan** gå att klicka eller trycka på för att öppna anteckningsmodulen och börja skriva, även i tomma delar utan text. Det gäller både tomma anteckningar och ytan runt befintlig text. Behåll valen Gemensamt/Privat och öppna den valda anteckningen.
- Följ det senaste bildförslagets placering och klickyta. Den röda streckade ramen och pekaren är enbart förklaringar i bilden och ska inte ingå i gränssnittet. Bildens övriga exempel innebär inga ändringar av logga, navigering eller schemavärden.
- **Status: kodat i v17; inte installerat eller publicerat av assistenten.**

## Tidigare samlade kodning: v16 – 2026-11-04

Samtliga fyra aktuella funktionsområden från kodningsminnet är införda i **TC-Boden-v16-Notiser-Och-Personsynlighet-Uppdaterade-Filer.zip** (37 nya/ändrade filer, ovanpå v15.1): personstyrd synlighet för Elever och Personal, bjällrnotiser om nya ändringsförslag till redigerare, schemaändringsnotiser på hemsidan och som telefonpush samt personliga notisreglage i de befintliga små kugghjulsrutorna. Äldre väntandeformuleringar längre ned är kravhistorik.

- Kör **0045_notifications_and_people_visibility.sql** efter 0044 före publicering. Befintliga data bevaras. Båda paketfilerna package.json och package-lock.json ska uppdateras.
- Nytt beroende: web-push 3.6.7 (samt typdefinitioner). Telefonpush kräver **PLANNING_PUSH_PUBLIC_KEY**, **PLANNING_PUSH_PRIVATE_KEY** och **PLANNING_PUSH_SUBJECT** i Netlify. Skriptet scripts/create-push-keys.cjs och LAS-MIG-V16.md medföljer. Webbnotiser kan användas utan dessa nycklar. Gemensamma schemaändringsnotiser är av vid första installationen tills administratören aktiverar dem.
- Ändringar och notiser skapas atomiskt. Samma sparförsök duplicerar inte notiser. Text-/färgändringar aviseras bara för rätt person och datumintervall. Godkända förslag och ändringar av aktivt grundschema/radtilldelning jämförs också. Ändringsförslagsnotiser är separata från schemaändringsreglaget.
- Telefonleveranser använder beständig kö, begränsade återförsök och en vilogrind för Netlify-jobbet. Tom kö håller inte databasen vaken genom minutvisa SQL-anrop. Extern exakt-en-gång-leverans kan inte garanteras vid nätverksavbrott; notistaggar begränsar dubbla visningar. Telefonprenumerationer är enhetsbundna och återkallas vid explicit utloggning på enheten.
- Validerat: produktionsbygge, TypeScript, CSS-syntax och isolerade integrationstester för datumgränser i svensk tid, rätt mottagare, läsmarkering/ägarskap, behörighetsåterkallelse, spärrade konton, personliga webb-/pushval, global av, filterperioder, återförsök, avslutade prenumerationer, synlighetsrevisioner och dataåtkomst. Riktig schemalagd pushfunktion importerad och körd med isolerad databas; transporten är simulerad. Tidigare tester för inloggning/säker sparning, v15, adminnotiser och databasvila passerar.
- Ingen riktig databas, inloggning, pushleverans eller publicerad webbplats har ändrats av assistenten. Fysisk iPhone-/Androidkontroll och visuell webbläsarkontroll återstår eftersom förhandsvisningstjänsten inte kunde starta projektet. Installation och nyckelkonfiguration behöver göras enligt LAS-MIG-V16.md.

## Genomfört i v16 – bjällrnotiser vid nya ändringsförslag (2026-11-04)

- När ett nytt ändringsförslag skickas in i planeringen, från hemsidan eller planeringsappen, ska användare med **redigeringsbehörighet för planeringen** få en notis via **bjällran på hemsidan**. Mottagare bestäms av behörigheten, inte enbart av rollnamnet.
- Visa olästmarkering och uppdatera bjällrans befintliga räknare. Notisen ska ha rubriken **Nytt ändringsförslag**, avsändarens namn, berörd person, schemadatum och fälttyp (Tur eller Uppgift).
- Visa tidigare och föreslaget innehåll med planeringens färger och utseende. Knappen **Visa ändringsförslag** ska öppna det aktuella förslaget för granskning med vanlig inloggning och serverkontrollerad behörighet.
- Följ den godkända skissen **TC Boden: planering med ny avisering.png** (libfile_264c28c8296081918b16799bb031b935) för notisens innehåll och placering. Behåll hemsidans befintliga planeringsvy, logga och övriga gränssnitt.
- Använd befintlig notishantering och lässtatus. Skapa inte dubbla notiser vid återförsök och respektera databasvila utan tätare bakgrundspollning. Rutan ska rymmas på mobil och dator i båda färgteman.
- Detta är en separat webbnotis om ett nytt förslag, inte telefonens pushnotis om en genomförd ändring i eget schema. Telefonnotisernas datumintervall ska inte begränsa denna bjällrnotis.
- **Status: kodat i v16; inte installerat eller publicerat av assistenten.**

## Genomfört i v16 – personstyrd synlighet för Elever och Personal (2026-11-04)

- Lägg till kontrollen under **Administratörsverktyg → Allmänt**, med rubriken **Synlighet för Elever och Personal**.
- Synligheten ska styras **per användare**, på samma sätt som befintlig Modulsynlighet. Detta ersätter det första bildförslaget med två globala på/av-reglage.
- Administratören ska kunna söka med **Sök person**, se namn och roll och separat bocka i **Elever** och **Personal** för varje användare. Valen ska vara oberoende av varandra.
- På dator visas namn, roll och de två valen i tydliga kolumner. På mobil anpassas raderna så att namn, roll och båda märkta kryssrutorna ryms utan att hamna utanför skärmen. Följ senaste bildförslaget med personrader.
- Inställningarna ska gälla den valda användarens menyer och översikter. När en del döljs ska dess innehåll bevaras. Befintliga rollbehörigheter gäller fortfarande; synlighetsvalet ska inte i sig ge utökad redigerings- eller läsbehörighet.
- Lägg till **Spara** och **Återställ ändringar**. Spara valen på servern och tillåt endast administratörer att ändra dem. Anpassa för ljust och mörkt läge.
- Genomfört i v16. Inte installerat eller publicerat av assistenten.

## Genomfört i v16 – schemaändringsnotiser i mobilen och hemsidans bjällra (2026-11-04)

- Lägg till pushnotiser i planeringsappen för iPhone och Android när en genomförd ändring berör den inloggade användarens eget schema inom det intervall administratören valt nedan (ursprungligt förslag: kommande sju dagar). Avgränsningen ska beräknas i svensk tid. Ändringar utanför perioden eller i andra personers schema ska inte ge användaren denna notis.
- Avisera faktiska ändringar av tur eller uppgift. Ett inlämnat, ännu inte godkänt ändringsförslag ändrar inte schemat och ska inte utlösa en schemaändringsnotis. Ett godkänt förslag som faktiskt ändrar det egna schemat omfattas.
- Notisen ska visa rubriken **Ditt schema har ändrats**, aktuellt datum och endast de fält som faktiskt ändrats, med tidigare och nytt värde, exempelvis **Tur: Fm → Em** eller **Uppgift: Simulator → Instruktörsarbete**.
- Ett tryck på notisen ska öppna planeringsappen på den berörda dagen/veckan. Vanlig inloggning och behörighetskontroll gäller.
- Användaren måste själv aktivera och godkänna pushnotiser; ge möjlighet till detta under kugghjulet. På iPhone krävs en hemskärmssparad webbapp med stöd för webbpush. Notiser ska kunna tas emot även när appen inte är öppen, inom plattformarnas förutsättningar.
- Följ bildförslaget **Schemaändring på iPhone och Android.png** (libfile_256fe6a3fb388191a0eb2389269508e7). Telefonens systeminställningar styr det slutliga utseendet och mängden synlig text. Exempelbilden innebär inga andra nya notistyper.
- Genomfört i v16. Inte installerat eller publicerat av assistenten. Utforma utskicken händelsestyrt så att de inte kräver ständig databaspollning från mobilen.

- Tillägg 2026-11-04: samma genomförda ändringar i användarens eget schema ska även ge en notis i **hemsidans bjällra**, med rubriken **Ditt schema har ändrats**, datum och tidigare/nytt innehåll för ändrade fält. Visa turer och uppgifter med planeringens färger och utseende samt knappen **Visa i planeringen**, som öppnar berörd dag/ruta på hemsidan.
- Webbnotisen ska fungera oberoende av om användaren har aktiverat telefonpush eller gett webbläsaren systemnotistillstånd. Telefonens tillstånd gäller endast pushleveransen. Använd befintlig olästmarkering, räknare och lässtatus i bjällran, utan dubbla notiser vid återförsök eller tätare bakgrundspollning.
- Hemsidans och mobilens schemaändringsnotiser ska använda **samma gemensamma på/av-inställning och samma datumintervall** under Administratörsverktyg → Planering. Detta tillägg ersätter tidigare formuleringar som begränsade inställningen till mobilpush. Följ senaste bildförslaget med båda notistyperna i bjällran; ändra inte övrig navigation eller logga efter skissen.

### Personligt notisreglage i befintliga kugghjulsrutor (2026-11-04)

- Lägg till reglaget **Notiser på/av** direkt i den befintliga lilla popup-/popoverrutan som öppnas från kugghjulet, både på hemsidan och i planeringsappen. Skapa ingen ny stor inställningsdialog eller separat inställningssida.
- Behåll hemsidans befintliga **Byt lösenord**, **Mörkt läge** och **Textstorlek**, och appens befintliga **Mörkt läge** och **Logga ut**. Behåll nuvarande förankring vid kugghjulet och övrigt utseende. Anpassa höjden så att den nya raden ryms inom synlig skärm på mobil och dator i båda teman.
- Utgå från användarens faktiska skärmbilder **IMG_9761.png** (libfile_9364bb66bc04819181a3e8a285924bdf) och **IMG_9760.png** (libfile_6430cf4597788191b65681d90e235919). Den tidigare skissen med stora inställningsdialoger är ersatt för placering och utseende.
- Reglaget är ett personligt val för schemaändringsnotiser: på webben styr det notiser i bjällran och i appen styr det telefonpush. Spara användarens val för respektive kanal. Befintliga andra notistyper och bjällrnotiser om nya ändringsförslag ska behålla sin tidigare funktion.
- Användarens val gäller tillsammans med administratörens gemensamma på/av-inställning och datumintervall. Personligt på får inte kringgå administratörens av. Telefonpush kräver dessutom telefonens tillåtelse; visa inte push som aktiverat om tillstånd saknas. Webbens bjällrnotiser kräver inget systemnotistillstånd.
- Status: kodat i v16; inte installerat eller publicerat av assistenten.

### Administratörsverktyg → Planering: styrning av schemaändringsnotiser

- Lägg till ett eget avsnitt **Notiser för schemaändringar** under Administratörsverktyg → Planering, anpassat för mobil och dator samt ljust och mörkt läge.
- Administratören ska kunna slå på eller av schemaändringsnotiser i båda kanalerna med reglaget **Skicka notiser till mobilen och hemsidan**. När det är av ska varken nya pushnotiser eller nya schemaändringsnotiser i bjällran skapas. Detta är en gemensam inställning för systemet; telefonpush kräver dessutom varje användares godkännande på telefonen.
- Intervallet väljs i en **rullista** med etiketten **Avisera ändringar inom** och exakt fyra alternativ: **Innevarande vecka**, **Kommande 7 dagar**, **Kommande 14 dagar**, **Innevarande månad**. Rullistan ersätter tidigare bildförslag med radioknappar.
- Innevarande vecka avser måndag–söndag i svensk tid. Innevarande månad avser aktuell kalendermånad. Avgränsningarna ska beräknas i Europe/Stockholm.
- Valet styr vilka schemadatum som omfattas. Notisen skickas när en ändring genomförs, inte som ett utskick var sjunde/fjortonde dag eller månadsvis. Befintliga krav om det egna schemat och faktiska ändringar gäller båda kanalerna. Användarens notistillstånd krävs endast för telefonpush.
- Lägg till **Spara** och **Återställ ändringar**. Inställningarna ska sparas på servern och få ändras endast av administratörer.
- Utgå från senaste bildförslaget med rullista och på/av-reglage och lägg även till Innevarande vecka, som användaren begärt efter bilden. Det ursprungliga fasta sjudagarskravet ersätts av detta valbara intervall.
- Genomfört i v16. Inga inställningar har ändrats i produktion av assistenten.

## Rättning v15.1 – 2026-11-03

Användaren rapporterade att appen fortfarande hade sidomarginaler i liggande läge efter v15. Orsak i koden: planeringsrouten saknade viewport-fit=cover, och hela appens yta var fortfarande indragen av safe-area-padding. Rättat i **TC-Boden-v15-1-App-Full-Skarmbredd.zip**, som läggs ovanpå v15. Routen exporterar nu viewportFit:cover, ytorna fyller skärmen och skyddsmarginaler tillämpas på reglage och datumtext. Scrollning behålls. Service worker-cache uppdaterad till v15-1. Tre ändrade kodfiler plus instruktion; inga nya databasändringar eller beroenden. Fysisk iPhone ej testad. Ingenting publicerat av assistenten.

## Senaste samlade kodning: v15 – 2026-11-03

Samtliga sex väntande funktionsområden i beslutslistan nedan är nu införda i **TC-Boden-v15-Kodminne-Endast-Uppdaterade-Filer.zip**: färgade turer i planeringsloggen, förseningsmarkering med historik, export till PDF/Excel/kalenderfil, Egen färg, helskärmsapp i liggande läge och kontospärrning med fasta låssymboler.

Paketet har 26 filer och läggs ovanpå v14-7, även om v14-8 redan installerats. Kör ny migration **0044_user_login_block.sql** efter 0043 innan publicering. Inga nya beroenden eller miljövariabler. Eget administratörskonto kan inte spärras från den egna sessionen; övriga befintliga konton kan spärras och låsas upp. Gamla bedömningar och kontodata bevaras. Spärrning avslutar befintliga sessioner.

Validerat med produktionsbygge/TypeScript och integrationstester i isolerad PostgreSQL-kompatibel databas. Exportfiler verifierade, inklusive visuellt granskad PDF och återinläst Excel med färg. Verklig loggkomponent renderad i test. Webbläsar- och fysisk mobilkontroll kunde inte genomföras eftersom förhandsvisningstjänsten inte kunde starta projektet. Kalenderimport ej provad på fysisk enhet.

Kalenderexport är importfil, inte synkronisering; turer utan sparade tider blir heldag. Exportgräns 367 dagar/20 000 rader. Äldre avbockade poster utan klarmarkeringstid använder senaste ändringstiden som uppskattning; nya klarmarkeringar sparar exakt server-tid. Ingenting har publicerats eller ändrats i den riktiga databasen av assistenten.

Den tidigare väntandelistan nedan bevaras som kravhistorik. Dess formuleringar om väntande/ej kodat är historiska och ersätts av denna leveransstatus. Inga av dess punkter återstår att koda i v15.

## Väntar på kodning – senaste beslut 2026-11-03

Dessa krav är sparade för nästa kodning. De är ännu inte införda eller publicerade. Äldre leveransstatus nedan är historik och innebär inte att dessa nya krav är genomförda.

### Planeringslogg med färgade turer – väntar på samlad kodning

- Visa turer i planeringsloggen med samma färger och utseende som motsvarande turrutor i planeringen: turens text, tonad bakgrund och färgmarkering. Ersätt råa färgkoder i den vanliga visningen med färgade turrutor.
- Både tidigare värde och nytt/föreslaget värde ska visas med respektive rätt färg, exempelvis röd FP och gul 8-16.30, med tydlig åtskillnad mellan värdena.
- Bevara logghändelsens innebörd: ett slopat ändringsförslag ska fortfarande anges som slopat och jämförelsen ska tydligt avse tidigare och föreslaget värde, inte en genomförd ändring.
- Gäller både loggöversikten och Visa detaljer, på mobil och dator samt i ljust och mörkt läge. Återge färgen som hör till det loggade värdet, även om turinställningarna senare ändras.
- Följ senaste bildförslaget utifrån IMG_9757.png. Behåll övriga loggfält, knappar och sidindelning. Kravet är sparat för nästa samlade kodning, ännu inte kodat eller publicerat.

### Försenade påminnelser och att göra – väntar på samlad kodning

- När sista datum/tid passerats för en ej avbockad påminnelse eller att göra-punkt ska dess text markeras röd, inklusive rubrik, beskrivning och förfallotid där dessa visas.
- När en försenad post bockas av ska den röda markeringen behållas i historiken. Den får inte försvinna vid omladdning eller ersättas av vanlig grå text för avklarade poster. Befintlig avbockning och eventuell genomstrykning behålls.
- Poster som slutförts i tid ska behålla vanlig textfärg även när deras ursprungliga förfallotid senare passerar. Utgå från förfallotiden och tidpunkten för klarmarkering, inte enbart aktuell tid.
- Markeringen ska vara konsekvent där posterna visas, även på instruktörspanelen, och fungera på mobil och dator samt i ljust och mörkt läge med läsbar röd nyans.
- Bildreferens: TC Boden – påminnelser, att göra och historik.png (libfile_f225e86937c481919d754fd3f34da3ad). Bildens sammanlagda exempellayout innebär inte krav på en ny gemensam modul. Funktionen är ännu inte kodad eller publicerad.

### Exportera planering – väntar på samlad kodning

- Lägg till knappen **Exportera** i planeringen på webb och i planeringsappen, anpassad för mobil och dator samt ljust och mörkt läge.
- Knappen öppnar **Exportera planering**, med val av period och innehåll. Denna vecka och Min planering ska finnas som val, enligt bildförslaget.
- Exportformat: **PDF**, **Excel (.xlsx)**, **Apple Kalender (.ics)** och **Android / Google Kalender (.ics)**.
- PDF och Excel ska laddas ned som filer. Kalenderalternativen ska skapa en .ics-fil för import, inte framställas som automatisk synkronisering. Visa förklaringen ”Kalenderexport skapar en fil att importera.”
- Popupen ska ha Avbryt, Exportera och stängningskryss och rymmas på mobilen. Bevara planeringens befintliga utseende och navigering; de extra menyerna och timrutnätet i den genererade exempelbildens bakgrund är inte nya funktionskrav.
- Designreferens: Exportera planering i TC Boden.png (libfile_8d67dded9ca88191a93526fa4d936bd0). Funktionen är endast beslutad och sparad, ännu inte kodad eller publicerad.

### Egen färg i planeringsappen – väntar på samlad kodning

- Rätta färgväljaren i popupen Föreslå ändring av uppgift enligt IMG_9755.png: Egen färg, själva färgrutan och Ingen färg ska ha tydliga mellanrum och rymmas utan att tryckas ihop eller överlappa.
- Ge färgrutan en kompakt, stabil storlek och anpassa den inre utfyllnaden för Safari/iPhone. Kontrollerna ska kunna brytas till nästa rad på smala skärmar och fungera i båda teman och skärmorienteringarna.
- Behåll färgvalets funktion, de förvalda färgerna och Ingen färg.
- Användaren vill spara detta till nästa samlade kodning i stället för att installera en separat rättning nu. Det redan skapade paketet TC-Boden-v14-8-Egen-Farg-App.zip är endast ett separat framtaget förslag; det har inte publicerats av assistenten och kravet ska fortsatt räknas som väntande här.

### Planeringsappen i liggande läge

- Appen ska fylla hela tillgängliga skärmen i liggande läge, utan de stora yttre sidomarginalerna eller begränsande maxbredden i referensbilden.
- Både lodrät och vågrät scrollning ska fungera så att hela planeringen går att nå. Behåll säkra marginaler vid skärmkanter och befintliga fasta kontroller samt fungerande stående läge, teman och dra-för-att-uppdatera.

### Spärra och låsa upp användare

- Administratören ska kunna spärra och låsa upp varje användares inloggning. Spärren är reversibel och ska bevara kontot och dess data.
- Knappen ska finnas inne i befintliga popupen **Redigera användare**, längst ned i vänstra hörnet. Befintliga **Avbryt** och **Spara användare** behålls till höger; layouten ska rymmas även på mobil.
- För ett konto som kan spärras: **Spärra** med ett **stängt lås**. För ett spärrat konto: **Lås upp** med ett **öppet lås**. Detta ersätter tidigare exempel med omvända låssymboler.
- Popupen ska inte ha någon separat statusindikering för aktivt/spärrat konto, statusetikett eller färgad prick. Knappens text och symbol visar vilken åtgärd som är möjlig.
- Vid inloggningsförsök med spärrat konto ska exakt **Kontot spärrat** visas, både på hemsidan och i planeringsappen. Det ersätter texten ”Spärrad användare”. Spärren ska kontrolleras på serversidan.

### Låssymbol i användaröversikten

- Visa ett **stängt lås endast för spärrade användare**. Reservera samma tomma plats för övriga så att raderna hålls i linje.
- **Dator:** låset ska stå i en fast, lodrätt linjerad position mellan namnet och rollen. Det tidigare datorförslaget är godkänt.
- **Mobil:** behåll den faktiska befintliga layouten från användarens senaste bild: avatar till vänster; namn, användarnamn och roll staplade i samma textblock; redigeringsknapp och papperskorg till höger. Placera låset i en fast kolumn **mellan namnblocket och redigeringsknappen**, på samma vågräta position på alla rader. Rollen ska inte flyttas till en separat kolumn bredvid namnet.
- Använd konsekventa låssymboler i popup och översikt, med fungerande ljust/mörkt läge och tillgängliga etiketter.

Den senaste mobilbilden ersätter tidigare skissers mobillayout. Referenser: faktisk mobilöversikt IMG_9754.png (libfile_39d4d7cf099c819199dcfaf8fe3c7325), popup IMG_9753.png (libfile_226c09ebbbe48191a288a5a069dad17d), liggande app IMG_9752.png (libfile_c0fe1a54335881919814dc0d504fd53d).

---

Uppdaterat: 2026-11-01

Senaste leverans: v14 – samtliga tidigare väntande kodkrav nedan är införda i TC-Boden-v14-Endast-Uppdaterade-Filer.zip. Paketet innehåller även de separata bakåtpils-, v12- och v13-rättningarna. Ny migration 0042_planning_mail_pending_queue.sql ska köras efter 0041 före publicering. Inga nya beroenden eller miljövariabler. Inte installerat eller publicerat av assistenten. Ingen flytt till Loopia ingår.

Aktuell status för avsnitten märkta ”Till nästa samlade kodning” längre ned: genomförda i v14. Deras tidigare statusrader är historik. Regeln i v11 om att Redigera blockerar Ändringsförslag ersätts av v14:s samtidiga behörigheter; appen kan fortfarande inte direktredigera.

Senaste tillägg: v12 – instruktörspanelens översikt och samtliga moduler kan använda hela tillgängliga skärmytan. Levererat som TC-Boden-v12-Full-Skarmyta-Uppdatering.zip ovanpå v11. Inte publicerat av assistenten.

Senaste samlade kodning: v11. Samtliga åtta tidigare väntande krav nedan är nu införda i TC-Boden-v11-Komplett-Kodminne.zip. Hela hemsidan och planeringsappen ingår, även uppdelat i fyra ZIP-delar med högst 100 filer. Inte installerat eller publicerat på den riktiga sidan av assistenten. Ingen flytt till Loopia ingår.
Status för v8-avsnitten: Samtliga krav nedan är kodade i TC-Boden-v8-Fullbredd-Och-Planeringslogg.zip. Paketet innehåller även v7:s filändringar. Inte publicerat på den riktiga sidan av assistenten.

## Senaste beslut och flikordning

Allmänt är första fliken och startsidan för Administratörsverktyg. Därefter ligger Aktivitetslogg, Användare, Planering och Säkerhetskopiering i alfabetisk ordning.

Detta ersätter den tidigare indelningen med separata huvudflikar för Mailinställningar, Planeringslogg, Planeringsbehörighet och Modulsynlighet. Innehållet visas direkt på sidan.

## Avsnitt direkt på sidan

- Allmänt: Förhandsgranska gränssnitt, Årets individuella uppföljning, Modulsynlighet och administration av Notiser.
- Planering: Mailinställningar, Planeringsbehörighet och Planeringslogg som egna fullbreddsavsnitt direkt i fliken.
- Säkerhetskopiering: hela befintliga backupmodulen direkt i sin egen flik.
- Användare och Aktivitetslogg behåller innehållet direkt på sidan.
- Ingen extra öppningsknapp, popupbakgrund eller stängkryss för flikarnas huvudinnehåll.
- Behåll befintliga formulärfält, värden, texter, sökning, sparning, validering och behörighetsregler. Förhandsbildernas exempeluppgifter hårdkodas inte.
- Separata bekräftelser för borttagning/nollställning och uttryckligen begärda dialoger för notiser/läskvitton behålls.

## Tidigare genomförda ändringar från v7

- IU-beskrivning: ”Nollställ markeringarna för genomförd IU på personalöversikten för pågående år. Protokollen finns kvar i historiken.” Själva åtgärden använder aktuellt svenskt år.
- Användarnas roll och redigerings-/borttagningsknappar ligger i fasta kolumner. Skyddade administratörskonton behåller sina skydd och inaktiva knappar i samma kolumner.
- Alla Avbryt-knappar har gemensam sekundär styling och skickar inte formulär.
- Notishantering finns på Allmänt; bjällran är mottagarvy. Administratörer kan skapa, redigera, välja start/sluttid eller inget slutdatum och ta bort notiser. Läslista öppnas per notis och visar namn och lästid.
- Servern kontrollerar period, roll och administratörsbehörighet. Samtidiga notisändringar revisionskontrolleras. Text-/rolländring nollställer läskvitton; datumändring behåller dem.
- Administratörer kan rensa aktivitetsloggen efter bekräftelse. Loggposternas återställningskopior rensas också; bedömningar och protokoll behålls. En ny händelse registrerar rensningen.
- Backupklockslag går att välja även för timintervall och sparas i svensk tid. Äldre intervall behåller beteendet tills inställningarna sparas. Automatiken kontrolleras var femte minut.

## Genomfört i v8 – fullbreddsavsnitt och sidnumrering

Beslut sparat 2026-10-31, nu kodat och verifierat. Detta tillägg fanns inte i v7.

- Avsnitten inom varje adminflik ligger under varandra och använder hela tillgängliga innehållsbredden, utan huvudavsnitt bredvid varandra.
- Höjd, marginaler och avstånd följer innehållet. Onödigt stora rutor, tomma ytor och fasta minimihöjder undviks.
- Stabil storleksordning med de kompaktaste avsnitten först. Ordningen hoppar inte när fler personer eller poster tillkommer.
- Allmänt: Förhandsgranska gränssnitt → Årets individuella uppföljning → Modulsynlighet → Notiser.
- Planering: Mailinställningar → Planeringsbehörighet → Planeringslogg.
- Allmänt är fortsatt startflik och övriga huvudflikar har alfabetisk ordning.
- Planeringsloggen har Föregående, Nästa och sidnummer i stället för Visa äldre. Sidbyte ersätter synliga rader i stället för att lägga till dem nedanför.
- Fem poster per sida är standard. Det går att välja 5, 10 eller 25. Antal poster, visat intervall och aktuell sida visas vid sidknapparna.
- Hela värden och övrig logginformation finns kvar. Långa ändringar sammanfattas i listan och Visa detaljer öppnar hela händelsen, inklusive tidigare/nytt värde, datum, person, kolumn och fält.
- Tidsgränsen är fast under sidbyten. Uppdatera hämtar senaste loggen och börjar på sida 1. Entydig sortering på tid och unikt id förhindrar att lika tidsstämplar tappar/dubblerar poster mellan sidor.
- Tomma loggar, sista sidan, ändrad sidstorlek, ogiltiga parametrar och behörigheter hanteras. Äldre API-klienter stöds fortsatt.
- Mobil/dator samt mörkt/ljust läge följer samma ordning och funktioner. Mobilens loggposter staplas; inga onödiga fasta höjder eller höga interna rullrutor används för huvudavsnitten.
- Befintliga fält, funktioner och sparning behålls. Förhandsbildens exempelpersoner, e-postadresser och övriga exempeldata hårdkodas inte.

Förhandsbild: TC Boden administratörsverktyg – allmänt och planering.png (libfile_fe9ba84995148191a8dfdda189fc1bbe).

## Installation och verifiering

- V8 kräver ingen ny SQL-migration ovanpå fungerande v7 med 0040. Vid uppgradering från v5/v6 tillämpas v7:s migration 0040_admin_notices_and_backup_time.sql efter 0039. Inga nya miljövariabler eller beroenden.
- V8-paketet fungerar ovanpå v5/v6/v7 och innehåller v7:s filändringar.
- Produktionsbygge inklusive TypeScript godkänt.
- API-/PostgreSQL-test med 37 poster med samma tidsstämpel godkänt: alla förekommer exakt en gång över sidorna. Även totalantal, storleksval, framåt/bakåt, sista/tom sida, uppdatering, tidsgräns, validering och admin-/förhandsvisningsbehörigheter testade.
- Befintliga backup-/Google Drive-/exporttester, planeringstester, färg-/tidsbeteenden och inlineformulär/Avbryt-kontroller godkända. Verkliga konton och uppgifter ändrades inte.
- Visuell webbläsarkontroll kunde inte köras: förhandsvisningsmiljön använder startargument som projektets Next.js-version inte accepterar. Utseendet behöver kontrolleras efter uppladdning.

## Genomfört i v11 – Gemensamt | Privat

Registrerat och genomfört 2026-11-01 i v11. Kodat och verifierat enligt leveranskontrollen nedan; inte publicerat av assistenten.

- Rätta Gemensamt | Privat i instruktörspanelens kort (bland annat Anteckningar och Att göra) och i anteckningsvyn, på mobil och dator.
- Aktiv länk ska ha tydlig röd text i ljust läge och ljusröd text i mörkt läge, med rak understrykning. Inaktiv länk är grå.
- Ingen fylld röd knappbakgrund, rundad ram, rundat nedre streck eller knappskugga. Behåll tydligt tangentbordsfokus.
- Orsak: generella regler för aktiva knappar skriver över textlänkarnas stil. Lös det med avgränsade CSS-regler utan att påverka övriga knappar, växlingen eller innehållet.
- Separat kandidat finns i TC-Boden-v10-1-Gemensamt-Privat-Fix.zip (libfile_a253c181c6f88191ba3bf1de59e10150), med app/appearance.css. Ingen SQL-migration. CSS-syntax kontrollerad; visuell kontroll av båda teman behöver göras vid nästa kodning.
- Referenser: IMG_9737.png (libfile_001a64369c248191a03d17bd554dd247), IMG_9738.png (libfile_374fb5970ffc81918daba629dc8f936c).

## Genomfört i v11 – dölj sidan från Google

Registrerat och genomfört 2026-11-01 i v11. Kodat och verifierat enligt leveranskontrollen nedan; inte publicerat av assistenten.

- Lägg till noindex för hela TC Boden, inklusive inloggning, setup och planeringsappen. Använd Next.js robots-metadata och/eller X-Robots-Tag där det behövs. Kontrollera att underliggande sidor inte tillåter indexering genom egna inställningar.
- Ska gälla oavsett om samma app nås via tcboden.se, www.tcboden.se, handledare.netlify.app eller fjtkl.se.
- Förtydligat av användaren: fjtkl.se omdirigeras till TC Boden och ska också omfattas, liksom handledare.netlify.app. Behåll omdirigeringen. Kontrollera både gamla URL:er/omdirigeringskedjan och slutmålets noindex; behandla inte en omdirigering som en HTML-sida där en meta-tagg kan läggas in. Vid behov ska instruktionen för Search Console även omfatta redan indexerade adresser på fjtkl.se och handledare.netlify.app.
- Blockera inte Google i robots.txt så att noindex inte kan läsas. Enbart Disallow räcker inte för att få bort sökresultat.
- Direktlänkar, inloggning, behörigheter, Google Drive och utskick ska fortsätta fungera. Noindex ersätter inte inloggningsskyddet.
- Verifiera robots-meta/HTTP-svar efter bygge för offentligt åtkomliga sidor.
- Ge instruktioner om Google Search Console → Borttagningar → Ny begäran för redan indexerade adresser. Den tillfälliga borttagningen (cirka sex månader) kombineras med noindex. Ingen Search Console-åtgärd utförs genom detta sparade krav.

## Genomfört i v11 – gemensam pull to refresh

Registrerat och genomfört 2026-11-01 i v11. Kodat och verifierat enligt leveranskontrollen nedan; inte publicerat av assistenten.

- På mobilwebbplatsen ska hela sidinnehållet under den fasta menyraden följa fingrets neddragning som en sammanhängande yta. Menyraden överst ligger kvar. Rubriker, sidknappar, modulrubriker, kort och innehåll flyttas tillsammans, inte enbart en enskild lista eller ruta.
- Ska fungera konsekvent på samtliga sidor, flikar och moduler, för alla behöriga roller. Omfattar även vyer med egna rullytor: identifiera rätt övre rullgräns utan att störa vanlig skrollning.
- Uppdateringsindikatorn visas i utrymmet mellan den fasta menyraden och det neddragna innehållet. Använd samma cirkulära uppdateringssymbol/spinner i den fristående planeringsappen som på mobilwebbplatsen, med samma färg- och tillståndsspråk i ljust/mörkt läge.
- Under dragning/släpp/uppdatering ska indikatorn visa rätt tillstånd; förhandsbildens text är ”Släpp för att uppdatera”. Sidinnehållet återgår mjukt efter klar eller misslyckad uppdatering. Förhandsbildens röda gestpil är en förklaring, inte ett krav på permanent gränssnittselement.
- Behåll planeringsappens avgränsade uppdateringsyta under dess fasta toppkontroller och befintliga kalender-/veckonavigering. Bytet till samma uppdateringssymbol ska inte flytta eller ändra kontrollerna.
- Respektera osparade ändringar och befintlig autosparning, behörigheter samt databasvilan. Inga dubbla uppdateringar eller oavsiktliga dragningar under textredigering, drag-sortering eller öppna dialoger. Testa fysisk iPhone/Safari/hemskärmsapp och Android samt båda färgteman.
- Förhandsbild: pull-to-refresh-förslag visat i denna konversation 2026-11-01, lokal referens generated_images/exec-7e642d89-8997-4737-b060-b1592c8c4382.png. Bevara befintligt utseende och verkligt innehåll; bildens exempeluppgifter och övriga dekorativa skillnader ska inte hårdkodas.

## Genomfört i v11 – Håll mig inloggad i planeringsappen

Registrerat och genomfört 2026-11-01 i v11. Kodat och verifierat enligt leveranskontrollen nedan; inte publicerat av assistenten.

- Lägg till en valfri kryssruta med exakt text ”Håll mig inloggad” på den fristående planeringsappens inloggningssida.
- Ikryssad: spara inloggningen i upp till 30 dagar även när appen stängs. Utan kryss gäller befintliga tidsgränser. Begränsa ändringen till planeringsappens uttryckliga val; förläng inte automatiskt webbplatsens vanliga sessioner eller andra enheter.
- Använd säker persistent inloggningstoken/cookie, aldrig sparat lösenord eller oskyddad långlivad sessionstoken i localStorage. Utforma serverstyrd giltighet, säker förnyelse och återkallelse vid implementationen.
- Logga ut ska återkalla den sparade inloggningen. Inaktiverade konton och återkallad behörighet ska blockera fortsatt åtkomst vid serveranrop. Planeringsappen behåller läsbehörighet.
- Funktionen får inte hålla databasen vaken: inga återkommande keep-alive-anrop när appen är stängd, dold eller inaktiv. Behåll befintlig databasvila.
- Verifiera stäng/öppna, 30-dagarsgräns, vanlig inloggning utan kryss, utloggning, inaktiverat konto och återkallad behörighet på iPhone/hemskärmsapp och Android. Kontrollera samspelet med befintlig sessionshantering och databasvila.

## Genomfört i v11 – bakåtpil i instruktörspanelens mobilmoduler

Registrerat och genomfört 2026-11-01 i v11. Kodat och verifierat enligt leveranskontrollen nedan; inte publicerat av assistenten.

- Lägg till en enkel bakåtpil inne i samtliga moduler på den mobilanpassade instruktörspanelen, exempelvis Anteckningar, Dokument, Att göra, Mallar, Planering och Grundschema samt övriga tillgängliga moduler.
- Placera pilen konsekvent till vänster om modulens rubrik, under den fasta översta menyraden. Ingen synlig ram, cirkel, fylld bakgrund eller lång knapptext. Behåll en tillräckligt stor tryckyta och tillgänglig etikett som Tillbaka till instruktörspanelen.
- Pilen leder till instruktörspanelens översikt via appens navigation, inte godtyckligt bakåt i webbläsarhistoriken. Bevara befintlig säker sparning och hantering av osparade ändringar vid navigering.
- Gäller mobilsidan i både ljust/mörkt läge. Befintlig desktoplayout och modulernas övriga innehåll/funktioner behålls. Undvik dubbla bakåtknappar i vyer som redan har navigation.
- Detta ersätter tidigare önskemål att helt ta bort tillbaka-knappen i anteckningsmodulen: den nya enkla ikonpilen ska finnas där på mobil utan den tidigare långa tillbaka-texten.
- Förhandsbild visad i denna konversation med Anteckningar och Dokument, lokal referens generated_images/exec-2468988d-fd20-4044-b247-b2c47f6e76a5.png. Bilden visar pilens placering, inte en beställning av andra layout-/innehållsändringar.

## Genomfört i v11 – ändringsförslag i planeringsappen

Registrerat och genomfört 2026-11-01 i v11. Kodat och verifierat enligt leveranskontrollen nedan; inte publicerat av assistenten.

- Detaljrutan ska kunna öppnas från samtliga tur- och uppgiftsrutor, även tomma. Behöriga användare får knappen ”Föreslå ändring” i detaljrutan.
- Förslaget gäller endast den ruta användaren tryckt på: antingen Tur eller Uppgift, aldrig båda samtidigt. Person och datum följer den valda cellen.
- Tur: samma rullista och turvärden som på hemsidan, med möjlighet att även skriva fritext. Turerna i rullistan ska visas med samma färger som på hemsidan, och vald turs färg ska synas i turrutan.
- Uppgift: endast fritext samt möjlighet att välja färg för uppgiftsrutan. Ingen turrullista eller andra redigeringsfält i denna dialog.
- Förslagsdialogerna har Avbryt och Skicka förslag. Förslaget skickas genom befintligt flöde för ändringsförslag och ändrar inte planeringen direkt.
- Samma behörighet för ändringsförslag ska gälla på hemsidan och i planeringsappen och administreras tillsammans i befintlig Planeringsbehörighet, utan separat appbehörighetskolumn. Byt etiketten ”Föreslå ändringar” till ”Ändringsförslag”; detaljrutans knapp heter däremot ”Föreslå ändring”.
- Direktredigering finns bara i hemsidans fullstora planeringsmodul. Redigeringsbehörighet har alltid företräde framför ändringsförslagsbehörighet. Detta ska inte ge direktredigering i planeringsappen. Behåll företrädesregeln när båda behörigheterna finns och kontrollera den på servern.
- Detta kompletterar tidigare läsbehörighet i planeringsappen med uttryckligt behörighetsstyrda förslag; appen ska fortsatt inte kunna direktändra planeringen.
- Behåll faktisk planeringslayout, turer, färger och innehåll. Förhandsbilder är funktionsillustrationer; exempeldata och oavsiktliga layoutskillnader ska inte hårdkodas. Senaste dialogreferens: ”TC Boden i mörkt läge: två förslagsdialoger.png” (libfile_f40de46bb3388191bbe1fa0e389ce8ab).
- Verifiera tur/uppgift separat, tomma celler, turernas färger i lista och vald ruta, fritext, uppgiftsfärg, behörigheter och redigeringens företräde samt ljust/mörkt läge. Bevara databasvila och befintlig säker sparning.

## Genomfört i v11 – färre automatiska hämtningar

Registrerat och genomfört 2026-11-01 i v11. Kodat och verifierat enligt leveranskontrollen nedan; inte publicerat av assistenten.

- Ta bort periodisk automatisk uppdatering av Kontroll av tillgängliga moduler, Grundschema och Handledartilldelningar.
- Behåll hämtning när relevant vy öppnas, manuell uppdatering/pull to refresh och nödvändiga uppdateringar efter egna sparade ändringar. Servern ska fortsatt kontrollera behörigheter vid skyddade anrop.
- Instruktörspanelens innehåll och listor: ändra från 15 till 60 sekunder.
- Grundschemaöversikt, utom turvyn: ändra från 15 till 60 sekunder.
- Behåll paus för kvarvarande periodiska hämtningar när sidan döljs, är offline eller efter två minuters inaktivitet. Autosparandet och övriga intervall ändras inte genom detta krav.
- Verifiera första laddning, återöppning, manuell uppdatering, egna ändringar och behörigheter. Användaren vill genomföra ändringen även om färre anrop inte garanterar motsvarande minskning av Database compute.

## Genomfört i v11 – ta bort inloggningens inaktivitetstimer

Registrerat och genomfört 2026-11-01 i v11. Kodat och verifierat enligt leveranskontrollen nedan; inte publicerat av assistenten.

- Ta bort automatisk utloggning efter 30 minuters inaktivitet för inloggningar på hemsidan och planeringsappen. Anpassa både klientens sessionskontroll och serverns giltighetskontroll så att samma regel gäller överallt.
- Behåll övriga sessionsregler, inklusive befintlig absolut giltighetstid, manuell utloggning och återkallelse vid konto-/behörighetsändringar. Det separata kravet Håll mig inloggad i planeringsappen gäller fortsatt.
- Detta gäller inloggningen, inte databasvilan: behåll pausen för automatiska hämtningar efter två minuters inaktivitet samt vid dold sida/offline. Inga nya keep-alive-anrop ska införas.
- Verifiera att en session inte avslutas enbart på grund av 30 minuters inaktivitet och att övriga giltighetsgränser och utloggning fungerar.


## Installation och verifiering för v11

- Komplett paket: TC-Boden-v11-Komplett-Kodminne.zip. Delpaket: TC-Boden-v11-Del-1-av-4.zip till TC-Boden-v11-Del-4-av-4.zip (100/100/100/21 filer). Delarnas sammanslagna innehåll är bytekontrollerat mot hela paketets 321 filer.
- Ny SQL-migration 0041_planning_app_sessions_and_colors.sql efter 0040 ska köras före publicering. Sessionsomfattning och färgfält för förslag läggs till utan att gamla data tas bort. Inga nya miljövariabler eller beroenden.
- Vanliga inloggningar gäller högst åtta timmar utan inaktivitetsgräns. Planeringsappens valda 30-dagarsinloggning har separat HttpOnly-cookie och serverlagrad tokenhash, begränsad till appens API-funktioner. Utloggning återkallar token. Befintliga webbkonton och sessioner behålls.
- Uppgiftstext och färg föreslås och godkänns atomiskt. Servern kontrollerar både text- och färgrevision innan godkännande. Färgändringar visas även i granskning och samlingsmail.
- Produktionsbygge och TypeScript godkända. Isolerade API-/databastester för inloggning, scopes, behörighetsändringar, kontoavstängning, redigeringens företräde, förslagsfärg, upprepade anrop, konflikter och utloggning godkända. Simulerade gesttester godkända.
- Befintliga tester för kalender/planering, databasvila, adminnotiser, loggsidor, handledartilldelningar, formulär, testmail och Google Drive-backup godkända. Inga riktiga utskick eller produktionsdata ändrade.
- HTTP-kontroll av /, /setup, /planering-app och /robots.txt godkänd: noindex-header, robots-meta och tillåten hämtning.
- Visuell webbläsarkontroll gick inte att köra eftersom Chromium saknas och nedladdningen misslyckades. Fysisk kontroll på iPhone/hemskärmsapp och Android kvarstår efter uppladdning, särskilt bakåtpilar, popupens turlista, färgteman och pull to refresh. Trettiodagarsgränsen verifierad via sessionsdata, inte genom 30 dagars väntan.
- Se LAS-MIG-V11.md i paketet för installationsordning och Search Console-instruktioner. Befintlig extern omdirigering från fjtkl.se ändras inte av koden; dess slutmål ska vara appen med noindex. Ingen DNS-/Search Console-åtgärd gjord.


## Genomfört i v12 – full skärmyta för instruktörspanelen och alla moduler

Beställt efter förhandsbild 2026-11-01. Kodat och levererat, inte publicerat på den riktiga sidan.

- Ta bort innehållets begränsning på 1200 pixlar när instruktörspanelen visas. Översikten och alla dess moduler använder hela tillgängliga bredden mellan sidomenyn och högerkanten med samma desktopmarginaler som Planering. Innehållet kan använda återstående skärmhöjd och växa vidare vid behov.
- Gäller bland annat Dokument, Anteckningar, Att göra, Mallar, Anslagstavla, Introduktion, Påminnelser, Grundschema och Planering samt övriga moduler inom instruktörspanelen. Behåll anpassad kortlayout, ordning, storlekar och responsiva kolumner. Tvinga inte kort till onödigt stor höjd.
- Bevara dokumentens pappers-/utskriftsmått, sidomenyn och mobilens fasta topp- och kontorad. Den fristående planeringsappen påverkas inte.
- Anteckningarnas flexhöjd förs genom pull-to-refresh-omslagen så att editorn använder återstående höjd och lång text kan rullas inne i anteckningsytan.
- Bara två kodfiler: app/layout.tsx och app/update-v12.css. LAS-MIG-V12.md medföljer. Paketet innehåller tre filer och kräver installerad v11. Ingen ytterligare SQL-migration, miljövariabel eller nytt beroende.
- Produktionsbygge/TypeScript och CSS-parsning godkända. Stilarna gäller skärmvisning och instruktörspanelens vyer. Visuell kontroll på bred/smal dator och mobil i båda teman kvarstår eftersom webbläsare saknas i miljön.
- Förhandsbildens exempeldata och kortplaceringar är illustrationer, inte andra beställda ändringar.

## Till nästa samlade kodning – bakåtpilar och notisruta

Registrerat 2026-11-01. Användaren vill ha båda rättningarna i kodningsminnet.

### Bakåtpilar i instruktörspanelens moduler

- Ta med den separata bakåtpilsfixen i nästa samlade leverans. Generella knappstilar ska inte kunna skriva över pilens placering eller visning.
- Pilen ska ligga till vänster om modulrubriken i mobil/smal vy och vara utan ram, fylld bakgrund, rundning eller skugga i både ljust och mörkt läge. Behåll tillräcklig tryckyta och tangentbordsfokus.
- Den mobilavsedda pilen ska vara dold i datorvyn över 900 px, enligt tidigare omfattning. Behåll säker sparning och navigation tillbaka till instruktörspanelen.
- Redan kodad som separat kandidat i TC-Boden-Bakatpil-Fix.zip (libfile_f4df461db37c819185d27294cfe904f7), med app/update-v11.css. Produktionsbygge och CSS-syntax godkända; inte bekräftat installerad eller visuellt verifierad. Ska inte tappas när kommande paket byggs.
- Felreferens: image(20261101-132754).png (libfile_8f6bd02a1bfc819190f9cf5200b30d0e).

### Notisrutan utanför mobilskärmen

- Rätta popupen som öppnas från notisbjällran: hela rutan ska hållas inom den synliga mobilskärmen med små sidmarginaler. Vänsterkant, rubrik, meddelanden och stängknapp får inte klippas eller hamna utanför skärmen.
- Anpassa bredd och position till faktisk viewport, även vid smal skärm, ändrad orientering och större text. Begränsa höjden efter tillgängligt utrymme under den fasta toppmenyn och mobilens säkra ytor; låt innehållet rulla inne i rutan när det behövs.
- Behåll befintligt utseende, öppna/stäng-funktion, notisinnehåll och behörigheter. Ska fungera konsekvent i ljust/mörkt läge och i Safari/hemskärmsappen. Kontrollera även Android och att datorvyn fortsatt fungerar.
- Notisrättningen är endast sparad, ännu inte kodad eller publicerad. Referens IMG_9743.png (libfile_ff02fd0db4cc8191b08125da42584a7b) visar rutan förskjuten utanför vänster skärmkant.

## Till nästa samlade kodning – centrerad hjälpruta

Registrerat 2026-11-01. Endast sparat krav; inte kodat eller publicerat.

- Hjälprutan ska vara centrerad inom den synliga skärmytan och hållas helt inom skärmen med små marginaler, även på mobil. Centrera både horisontellt och vertikalt när höjden tillåter. Vid långt innehåll begränsas höjden till tillgänglig viewport och innehållet får rullas inne i rutan.
- Rubrik och stängknapp ska vara synliga och åtkomliga. Anpassa placering och storlek vid orienteringsbyte, större text och mobila säkra ytor. Undvik sidledes förskjutning eller klippning mot skärmkanter.
- Behåll befintliga hjälpbilder, innehåll och Visa större-funktion samt tillgänglig tangentbordsnavigation och fokusmarkering. Detta återinför inte det tidigare avbrutna önskemålet om modul-/flikanpassad hjälp.
- Kontrollera mobil och dator i ljust/mörkt läge, Safari/hemskärmsapp och Android samt att förstorade hjälpbilder ryms och kan stängas.
- Referens: IMG_9744.jpeg (libfile_bcd31990cc308191a5b001fd2609987a), där hjälprutan ligger förskjuten mot vänster kant.

## Genomfört i v13 – luftigare aktivitetslogg och backupknappar på mobil

Beställt och kodat 2026-11-01 efter bilderna IMG_9745.png (libfile_4037dfaf3530819182ced786b7184909) och IMG_9746.png (libfile_0bc26ed02b248191b0025cff41fa3279). Inte publicerat av assistenten.

- Aktivitetsloggens mobilhuvud staplar rubrik/beskrivning och åtgärdsknappar. Rymligare filter med tydliga fältkanter. Loggposter blir kort med fältnamn och radbrytning; bred dator behåller tabellen. Befintlig funktionalitet och behörighet behålls.
- Adminflikarnas knappar dimensioneras efter texten och får bryta rad; Säkerhetskopiering ska rymmas. Backupens intervall-/tidsfält och anslutningsknappar staplas på smal mobil.
- Leverans: TC-Boden-v13-Aktivitetslogg-Och-Backup-Mobil.zip, fyra filer, ovanpå v12. Ingen SQL eller nya beroenden. Produktionsbygge/TypeScript och CSS-syntax godkända; visuell mobilkontroll återstår.
- De väntande notis- och hjälprutefixarna är fortsatt väntande och ingår inte. Bakåtpilsfixen är fortsatt separat kandidat till nästa samlade leverans.

## Samla även v13-rättningarna med övriga inför nästa kodning

Förtydligat av användaren 2026-11-01: lägg aktivitetsloggens luftigare mobilrutor och anpassningen av Säkerhetskopiering tillsammans med de andra sparade rättningarna. Ta med dem i nästa samlade uppdatering ihop med bakåtpilar, notisruta och centrerad hjälpruta.

- Bevara v13:s staplade logghuvud/knappar, rymligare filter och loggkort med fältnamn på mobil. Bevara flikknapparnas textanpassade bredd och backupfältens mobilstapling så att texten ryms.
- Separat kodkandidat finns i TC-Boden-v13-Aktivitetslogg-Och-Backup-Mobil.zip (libfile_7e8b8b63ba5481918ce0672339d49bce). Inte bekräftat installerad. Användaren vill nu ha ändringarna med i den samlade kodningen; tappa inte dessa vid paketering och markera dem inte som publicerade.


## Till nästa samlade kodning – vald logga för planeringsappen

Godkänt av användaren 2026-11-01. Endast sparat krav; inte kodat eller publicerat.

- Använd den senast visade loggan med röd kalender, vitt frontvänt tåg och bock på mörk rundad bakgrund som planeringsappens egen logga. Den ska följa TC Bodens befintliga stil.
- Använd samma logga för planeringsappens hemskärmsikon och anpassa appikoner, Apple touch-ikon och manifest vid implementationen. Behåll hemsidans övriga logga.
- Vald bild: Röd kalenderikon med tåg och bock.png (libfile_6c4c7c5c69f88191a0d5a9dff235d800). Tidigare loggförslag är inte det valda utförandet.
- Ta med detta tillsammans med övriga sparade rättningar vid nästa kodning. Kontrollera skärpa, beskärning och visning på iPhone och Android.

### Förtydligande – hemskärmsikon och logga i menyraden

Förtydligat av användaren 2026-11-01. Sparat inför nästa kodning.

- Den valda loggan ska vara hemskärmsikon när planeringsappen sparas på både iPhone och Android, samt logga i menyraden inne i planeringsappen.
- Den valda loggan ska även visas på planeringsappens inloggningssida, anpassad för både ljus och mörk bakgrund. Tillagt av användaren 2026-11-01 inför nästa kodning.
- Anpassa utförandet för både mörk och ljus bakgrund med tydlig kontrast och bevarat motiv. Använd lämplig ljus-/mörkvariant i menyraden.
- Anpassa ikonstorlekar och säkra marginaler för iOS och Android, inklusive maskbar Android-ikon, så motivet inte klipps av plattformens ikonform. Kontrollera skärpa och beskärning.
- Detta kompletterar tidigare loggkrav och ska ingå i nästa samlade kodning; ännu inte implementerat.

### Förtydligande – genomskinlig bakgrund och vitt spår

Tillagt av användaren 2026-11-01 inför nästa kodning; ännu inte implementerat.

- Planeringsappens logga i menyraden och på inloggningsskärmen ska ha genomskinlig bakgrund, utan den mörka bakgrundsplattan från ikonförslaget. Bevara motivet och anpassningen för ljus och mörk bakgrund.
- Hemskärmsikonerna för iPhone och Android behåller separat anpassat ikonutförande; kravet på genomskinlig bakgrund gäller loggan inne på sidan och vid inloggningen.
- Den vanliga TC Boden-loggan får även anpassas med ett vitt spår under loket. Detta kompletterar den tidigare instruktionen att behålla hemsidans övriga logga; bevara dess övriga kännetecken.

## Till nästa samlade kodning – enhetlig sidomeny

Beställt 2026-11-01. Sparat inför nästa kodning; ännu inte implementerat.

- Sidomenyn ska ha samma bredd på samtliga sidor och moduler som den befintliga sidomenyn i planeringsmodulen. Övriga sidors nuvarande bredare meny ska anpassas till denna referens.
- Använd gemensam dimensionering så att sidomenyn inte ändrar storlek när man navigerar mellan sidor. Behåll innehåll, navigation, behörigheter och mobilmenyns funktion.
- Kontrollera att menytexter och profilraden ryms samt att innehållsytan anpassas korrekt i ljust och mörkt läge.

## Till nästa samlade kodning – samtidiga planeringsbehörigheter

Ändrat av användaren 2026-11-01. Sparat krav; ännu inte implementerat. Detta ersätter tidigare regel att redigeringsbehörighet alltid blockerar ändringsförslag, särskilt i planeringsappen.

- En person ska kunna ha både Redigera och Ändringsförslag aktiva samtidigt. De ska kunna sparas tillsammans i Planeringsbehörighet utan att den ena nollställer den andra.
- Hemsidans fullstora planeringsmodul behåller direktredigering för personer med redigeringsbehörighet. Planeringsappen erbjuder Föreslå ändring för personer med ändringsförslagsbehörighet även om de också har redigeringsbehörighet på hemsidan. Appen får fortsatt inte direktredigera planeringen.
- Administratören ska också ha rätt att föreslå ändringar i planeringsappen. Administratörsrollen eller dess redigeringsrätt får inte dölja knappen eller blockera förslaget på servern.
- Uppdatera både gränssnittets behörighetskontroller och API:s validering. Förslagen följer befintligt granskningsflöde och gäller endast vald tur- eller uppgiftsruta.
- Verifiera användare med enbart ändringsförslag, enbart redigering och båda behörigheterna samt administratör i appen. Bevara rollskydd, sessionsomfattning och databasvila.

## Till nästa samlade kodning – visa andras ändringsförslag i planeringsappen

Beställt 2026-11-01. Sparat inför nästa kodning; ännu inte implementerat.

- Användare med ändringsförslagsbehörighet, inklusive administratören och personer som samtidigt har redigeringsbehörighet, ska kunna öppna och läsa även andras väntande ändringsförslag i planeringsappen.
- Gör förslagen åtkomliga från berörd tur- eller uppgiftsruta med en tydlig markering när förslag finns. Visa samtliga väntande förslag för den valda rutan, vem som lämnat dem, tidpunkt, person/kolumn och datum samt ursprungligt och föreslaget värde. Visa även föreslagen uppgiftsfärg och turernas färger där relevant.
- Behåll möjligheten att lämna eget förslag. Att läsa andras förslag ger inte rätt att ändra deras förslag eller direktändra planeringen. Godkännande och slopning ligger kvar i hemsidans befintliga granskningsflöde med redigeringsbehörighet.
- Avgränsa visningen till den planering användaren har rätt att se. Behörigheten ska kontrolleras av servern. Behåll befintlig uppdatering och databasvila utan nya bakgrundsanrop.
- Kontrollera flera förslag på samma ruta, tomma rutor, egna och andras förslag samt mobilens båda färgteman.
- Förtydligat 2026-11-01: markeringen för väntande ändringsförslag i planeringsappens veckoöversikt ska använda samma utropstecken (!) och visuella symbol som webbversionens befintliga SuggestionBadge. Visa markeringen på berörd tur- eller uppgiftsruta, även tomma rutor, och låt den öppna rutans förslag. Behåll läsbarhet i båda teman och tillgänglig etikett med antal förslag. Inför ingen annan symbol. Sparat inför nästa kodning.

## Till nästa samlade kodning – mejla samtliga väntande ändringsförslag

Ändrat av användaren 2026-11-01. Sparat inför nästa kodning; ännu inte implementerat. Ersätter nuvarande urval av endast tidigare omejlade förslag.

- Varje ordinarie utskick ska innehålla samtliga aktuella väntande ändringsförslag i planeringen, från både hemsidan och planeringsappen. Även förslag som redan varit med i tidigare mejl ska tas med så länge de är väntande.
- Endast status pending ska ingå. Godkända, slopade och ersatta äldre versioner ska inte skickas. Tomma sammanställningar ska inte skickas.
- Behåll befintlig mottagare, utskicksintervall och klockslag. Ändra mejlets antal/texter från nya förslag till väntande förslag så att innehållet beskrivs korrekt.
- Anpassa utskickskö och återförsök så att ett senare utskick inte återanvänder inaktuellt innehåll med redan godkända eller slopade förslag. Bevara skydd mot dubbla utskick och befintlig hantering av osäker leverans.
- Verifiera att ett tidigare mejlat men fortsatt väntande förslag följer med nästa ordinarie utskick, att godkända/slopade förslag utesluts och att ingen e-post skickas när inga väntande förslag finns. Testa isolerat utan riktiga utskick.


## Genomfört i v14 – samlad leverans 2026-11-01

- Bakåtpilsfix, v12:s fulla skärmyta och v13:s luftigare aktivitetslogg/backupfält med i paketet.
- Notisrutan ligger utanför transformerade sidföräldrar, begränsas till synlig viewport och håller stängknappen åtkomlig. Hjälprutan centreras med begränsad höjd och intern rullning.
- Godkänd kalender-/tåglogga med genomskinlig bakgrund i planeringsappens menyrad och inloggning. Separata Apple touch-, Android- och maskbara ikoner samt appmanifest och ny service worker-cache. Samma röda/vita motiv fungerar på båda teman. Hemsidans övriga logga behålls.
- Sidomenyn använder planeringens 220 px bredd på dator på alla sidor. Profil och långa etiketter kan radbrytas. Mobilens befintliga gemensamma meny behålls.
- Redigera och Ändringsförslag kan sparas samtidigt på klient och server. Administratörer kan föreslå i appen. Direktredigering/granskning blockeras fortsatt för appsessioner.
- Appen visar egna och andras väntande förslag per vald tur-/uppgifts-/gemensam ruta, med författare, datum, svensk tid, ursprungligt/föreslaget värde och färger. Delad SuggestionBadge-komponent ger samma !-symbol som hemsidan, även på tomma rutor. Inga nya återkommande hämtningar.
- Ordinarie mejl väljer alla aktuella pending, även tidigare mejlade. Slutbehandlade/ersatta förslag och tomma sammanställningar utesluts. Befintlig mottagare och intervall behålls. Ej påbörjade köer förnyas; osäkra köer vars urval ändrats spärras för befintlig administratörskontroll utan inaktuellt återutskick.
- Verifierat: produktionsbygge/TypeScript, CSS-syntax, isolerade API-/databas-/mejltester och tidigare regressionskontroller för planering, sparning, databasvila, pull to refresh, backup och planeringslogg. Inga verkliga konton eller mejlutskick ändrades.
- Återstår efter installation: visuell enhetskontroll på iPhone/Android och dator i båda teman. Förhandsvisningsmiljön kunde inte starta Next.js-kommandot. Levererat är inte samma sak som publicerat.
- Installationsinstruktion: LAS-MIG-V14.md i ZIP-filen. Endast nya/ändrade filer ovanpå v11/v12/v13, färre än 100 filer. SQL 0042 ska köras efter 0041 före deploy.


## V17.6 – kodat och levererat 2026-11-04, inte publicerat
- Samlad ZIP ovanpå V17 med samtliga ändringar v17.1–v17.5 och nedanstående rättningar.
- Bjällran i appen ligger mellan Exportera och kugghjulet. Fasta top/right-värden från hemsidans CSS återställs för appens bjällra så att ikonerna centreras på samma rad.
- Ändringsförslagsnotiser tillåts bara på hemsidan och bara för planeringens redigerare. Appens API-lista filtrerar bort dem före begränsningen på 100 notiser; appen kan inte läsmarkera dem. Klienten filtrerar också före räknaren.
- Administratören får fortsatt appnotiser om någon annan ändrar administratörens eget schema enligt notisinställningarna. Regeln att egna ändringar inte aviserar en själv är oförändrad.
- Planeringscellernas utropstecken för väntande förslag är kvar. Ingen permanent förklaringsruta från mockupen tillagd.
- Åtta automatiska kanal-/behörighetsfall verifierade. Syntaxkontroll utförd; ingen fullständig projektbyggnad eller fysisk mobilkontroll. Ingen ny SQL eller nyckel krävs utöver V17.
- Leverans: TC-Boden-v17-6-Samlat-Med-v17-5.zip.

## Genomfört i V18 – hela planeringscellens skrivyta och markering (2026-11-04)
- Rättningen i v17.6 var otillräcklig enligt användarens skärmbild. Ny rättning genomförd och webbläsartestad i V18, inte publicerad.
- Hela cellens bredd och höjd ska vara klickbar och fungera som skrivyta, inklusive tomma ytor under och bredvid texten.
- Fokusmarkeringen ska omsluta hela cellen ända ut till radens och kolumnens verkliga kanter; ingen omarkerad remsa får finnas kvar.
- Både skrivytan, klickytan och markeringen ska automatiskt följa när cellen växer eller krymper, även när text i en annan cell ändrar radens höjd eller kolumnbredden ändras.
- Gäller planeringsarket på både dator och mobil. Befintliga färger och separata färgknappar ska bevaras.
- Kontrollera verkligt renderad cell vid storleksändring, även tom cell i en hög rad, innan rättningen markeras som klar.

## Genomfört i V18 – minska databasbelastning enligt godkänt förslag (2026-11-04)
- Inloggningskontroll: separat automatisk kontroll var tionde minut (600 000 ms) under aktiv användning, i stället för var 30:e sekund. Kontrollera även vid återgång till sidan. Vanliga dataanrop och sparningar ska fortfarande kontrollera inloggning och behörighet direkt; utgången session får inte förlängas eller accepteras utan kontroll.
- Notisbjällra: automatisk hämtning var tionde minut (600 000 ms), i stället för varje minut. Hämta fortfarande direkt när bjällran öppnas och efter relevanta egna åtgärder. Gäller gemensamma kontroller i webb och planeringsapp, för alla roller som använder dem.
- Återanvänd resultatet av autentiseringen inom samma notisanrop så att samma inloggning inte kontrolleras genom dubbla databasfrågor. Behörighetskontrollen ska bevaras.
- Planeringens vanliga GET/läsanrop ska inte synkronisera eller skriva personkolumner vid varje hämtning. Flytta synkroniseringen till när användare skapas, byter namn/roll, återaktiveras eller tas bort, med en säker initial synkronisering för befintliga konton vid införandet. Befintlig kolumnidentitet och historik ska bevaras.
- Detta följer det ursprungliga förslaget med ändrat intervall för just inloggningskontroll och bjällra. Övriga modulers automatiska datahämtning, inklusive planeringens befintliga intervall, ska inte ändras till tio minuter.
- Behåll paus vid dold flik, offline och inaktivitet. Pushnotisernas utskick ska inte fördröjas till tiominuterskontrollen. Befintlig regel: ändringsförslagsnotiser endast på hemsidan för redigerare; appen behåller schemanotiser enligt inställningarna.
- Nya notiser i bjällran kan ta upp till tio minuter att visas automatiskt; öppning hämtar direkt. Spärrat konto upptäcks vid nästa autentiserade dataanrop eller separata kontroll.
- Implementerat och testat i V18. Levererat som uppdateringspaket, inte publicerat.


## V18 – samlad kodning, verifierad och levererad 2026-11-04, inte publicerad
- Leverans: TC-Boden-v18-Optimering-Och-Kodminne-Samlat.zip, nya/ändrade filer ovanpå V17 inklusive samtliga V17.1–V17.6-rättningar.
- Ovanstående två väntande punkter (hela cellens dynamiska skriv-/klickyta och databasoptimering med tiominuterskontroller) är genomförda.
- Behörighetskontroller inom samma API-anrop återanvänds med AsyncLocalStorage; inga kontouppgifter cachelagras mellan anrop. Förhandsvisningens cache rensas vid byte.
- Planeringens GET gör inte personkolumnskrivningar. NY SQL 0047 ska köras efter 0046 FÖRE publicering. Trigger synkroniserar användare och befintliga kolumner utan att radera celler/historik.
- Lazy hämtning av elev-, personal-, bedömnings- och användardata. Samtidiga identiska GET-anrop slås ihop, dubbla handledarhämtningar vid vybyten borttagna. Panelens SQL hämtar endast tillåtna innehållstyper och hoppar över otillåtna dokument/läskvittenser.
- Notis-/sessionskontroller var tionde minut under aktivitet. Övriga intervall och pushregler behålls; pushleverans startar efter sparsvaret med beständig reservkö.
- Kolumnvis lås för cellsparningar och delad spärr mot breda schemaändringar. Grundschemaändringar behåller exklusiv spärr; notiser och celländring förblir atomiska.
- Felaktiga HTML/JSON-svar visar begripligt fel utan att radera texten i den öppna cellen. Ingen automatisk mutationsretry. Text är inte garanterat sparad genom omladdning.
- Verifierat: produktionsbygge/TypeScript; verkliga webbläsarkomponenter för hela cellen vid fem storlekar och mobilbredd; startsida för admin/handledare/chef med isolerade API-svar; tiominuterstimer och direkt öppning av bjällra; bevarade utkast/konflikt; anropslokal auth/spärrkontroll; isolerad SQL-migration inklusive omkörning; låsval samt befintliga planeringsregressionstester.
- Inga verkliga pushutskick, produktionsdatabasändringar eller publicering gjorda. Exakt driftstoppsorsak och faktisk GB-hours-minskning är inte fastställda. Fysisk iPhone/Android återstår efter installation.

## V19 – planeringsinstruktion i Hjälp och PDF-/Excel-export (2026-11-04)
- Lägg till användarens bifogade PDF "Nya planeringsarket - Tutorial for dummies.pdf" som planeringsinstruktion i befintlig hjälpruta. Originalfil: libfile_345a9e3c151c81918e186c764dafec0d. Använd denna fil, inte en äldre instruktion.
- Behåll de tre befintliga hjälpkorten. Det nya kortet ska ligga på raden under, centrerat under mittenkortet Bedömningsvyn, och får vara mindre än de övriga.
- Rubrik Planeringsinstruktion; miniatyr av PDF:ens första sida; länken Öppna instruktionen öppnar PDF-filen i en ny flik. Anpassa till mobil och båda färgteman.
- Både kortet, miniatyren och själva PDF-filen ska bara vara åtkomliga för inloggade användare med åtkomst till planeringsmodulen enligt befintlig individuell modulsynlighet. Kontrollera även behörigheten på servern vid direktlänk; det räcker inte att dölja kortet. Placera inte filerna oskyddat i public.
- Export till PDF och Excel ska återge planeringsarket med samma utseende: kolumner och deras ordning/bredd, personrubriker med Tur/Uppgift, färgmarkeringar för turer och uppgifter, kantlinjer, radhöjder och radbrytningar. Bevara hela innehållet när texten gör raden högre.
- Gäller befintlig PDF-/Excel-export på webb och app där den erbjuds. Kalenderexportens funktion behålls. Gör visuell jämförelse av samma planering mot båda exporter innan leverans; redovisa eventuella formatbegränsningar.
- Jämförelsen mellan planering, PDF och Excel längst ned i förhandsbilden är en illustration, inte ett nytt avsnitt som ska läggas till i hjälprutan.
- Senaste förhandsbild: Hjälpdialog med enhetlig planeringsvy.png (libfile_be0107b8d680819192464e6b2bfa2b41).
- Levererat i V19. Exporten använder motsvarande tabellstruktur. Visuell jämförelse i webbläsare och Excel återstår.

## V18.1 – kontrast i planeringsappens topprad (2026-11-05)
- Exportknappen och bjällran får vita ikoner mot den mörka toppraden i båda färglägena. Exportknappen får mörk bakgrund med synlig kant. Bjällran har genomskinlig bakgrund.
- Rättningen är avgränsad till planeringsappens topprad. Appens cacheversion höjs till tcpa-shell-v18-1.
- Leverans: TC-Boden-v18-1-Appkontrast-Samlat.zip (libfile_2298a7b886bc8191b960fa84428d3d9a). Innehåller V18. Vid installation ovanpå V18 behövs ingen ytterligare SQL.
- ZIP och CSS-regler kontrollerade lokalt. Publicering och visuell kontroll på iPhone återstår.

## V19 – tom sida när användaren saknar åtkomst (2026-11-05)
- Inloggade användare utan åtkomst till någon modul ska få en helt tom innehållsyta under TC Bodens topprad. Kontoinställningarna ska vara åtkomliga.
- Använd den tomma vyn när den sammanlagda behörigheten saknar synliga moduler. Välj inte planeringsmodulen som reservvy. Visa inga modulmenyer eller tomma modulpaneler i detta läge och starta inga hämtningar för dem.
- Kontrollera beteendet efter inloggning och vid byte av förhandsgranskad användare. Användare med åtkomst till minst en modul ska kunna öppna sina behöriga vyer.

## V19 – personlig kolumnlayout i planeringsmodulen (2026-11-05)
- Alla användare med åtkomst till planeringsmodulen ska kunna ändra kolumnordning och kolumnbredder i sin egen vy. Spara inställningarna separat per användare i aktuell webbläsare så att de finns kvar när planeringen öppnas igen. Ändringarna ska aldrig påverka andra användare.
- Kolumnlayouten är låst som standard. Knappen **Ordna** med stängt lås aktiverar ordningsläget och visar draghandtag vid rubrikerna och handtag vid kolumnkanterna. **Klar** med öppet lås avslutar ordningsläget och låser layouten igen.
- Dra rubrikerna för att ändra ordning och kolumnkanterna för att ändra bredd. Tur och Uppgift flyttas tillsammans som en persongrupp. Låset gäller kolumnlayouten och är skilt från behörigheten att redigera planeringsinnehåll.
- Förhandsbild: TC Boden: planering i låst och ordningsläge.png (libfile_3d0976756be88191b9ab24c3835742d8).

## V19 – prestanda för hela hemsidan och kvarstående driftmätning (2026-11-05)
- Mät först och jämför före och efter per roll. Mät inloggning och tid tills första vyn går att använda, modulbyte samt minst tio minuter med fliken öppen utan interaktion. Notera antal API-anrop, dubbletter, svarstider, överförd datamängd och fel. Jämför även databasens GB-hours och bandbredd över motsvarande tidsperioder med liknande användning.
- Ladda bara den öppna och behöriga modulens data. Hämta övriga behöriga moduler när de öppnas. Behåll serverns behörighetskontroller.
- Slå ihop identiska samtidiga hämtningar och återanvänd data inom rätt användar- och behörighetskontext. Uppdatera berörda data efter sparning och rensa användarbunden data vid kontobyte.
- Hämta endast översiktsdata för listvyer. Ladda moment, kommentarer och historik vid behov. Begränsa loggarnas hämtning till den aktuella sidan.
- Kartlägg bakgrundsanrop från öppna flikar och schemalagda jobb separat. Identifiera vilka som håller databasen vaken och minska onödiga körningar. Utgå från V18:s tiominutersintervall för inloggningskontroll och notisbjällra.
- Hantera oväntade API-svar, exempelvis HTML i stället för JSON, med begripliga felmeddelanden. Behåll osparade planeringsändringar så att användaren kan försöka spara igen.

## V19 – nattpil i Grundschema (2026-11-05)
- Visa en tunn pil åt höger. Turnamnet använder samma typografi som övriga turer i respektive Grundschemavy, utan extra fetstil. Pilens linje och spets följer natturens ordinarie textfärg, exempelvis mörk färg på ljusgrönt.
- Pilen börjar intill turnamnet på första dagen. Vid flera likadana natturer i följd visas turnamnet en gång och en sammanhängande pil till sista dagen i serien. En ensam nattpil går in i nästa dags ruta. Behåll nattpassets befintliga färgsättning och rutnätets stil. Lägg inte till klockslag vid pilen.


## V19 – levererat som samlad uppdatering (2026-11-05)
- Paket: TC-Boden-v19-Samlat.zip (libfile_69a9f5a2f3dc8191bcefa50519bc2125), för V17 eller senare. V18 och V18.1 ingår. Ingen ny SQL ovanpå V18/V18.1. För V17 krävs tidigare 0047 före publicering.
- Verifierat: produktionsbygge, TypeScript, planeringsregressioner, förhandsvisning och isolerade serverprov för PDF-/miniatyråtkomst och kompakta planeringsanrop. Provgenererad PDF renderad. XLSX läst tillbaka med kontroll av gruppering, färg, bredd och lång text.
- Genomförda prestandaändringar: kontot och modulåtkomst i samma svar, inget överflödigt översiktsanrop för elever, moment laddas vid behov, färre hämtningar vid manuell uppdatering, kompakta planeringen hämtar bara den egna kolumnen och planeringsvyer hämtar färre administrativa uppgifter. V18:s samtidiga deduplicering och sparfelshantering används fortsatt.
- Återstår: publicering, visuell verifiering på dator/mobil och Excel, samt mätning före/efter per roll och analys av schemalagda anrops påverkan på GB-hours. PDF kan dela breda tabeller och långa rader mellan sidor. Kolumnlayouten synkas inte mellan olika webbläsare.

## V19.2 – nattmarkeringens textstil i Grundschema (2026-11-05)
- Samlat paket: TC-Boden-v19-2-Samlat.zip (libfile_adb48b99a0308191a42857197c72f106). Ovanpå V19 eller V19.1 räcker app/grundschema-night.tsx och app/grundschema.css. Ingen ny SQL.

## Väntande kodning – veckoutskick och anpassat mailintervall (2026-11-07)
- Lägg till alternativet **Varje vecka** i planeringens Mailinställningar. Vid detta val visas en rullista med måndag–söndag. Utskicket sker på vald veckodag vid inställt klockslag.
- Lägg till **Anpassat intervall** med ett positivt heltal och enhet **dagar** eller **veckor**, exempelvis var tredje dag eller varannan vecka. Välj startdatum och klockslag. Intervallet räknas från startdatumet.
- Användaren har bekräftat denna tolkning. Sparat som väntande kodning.

## Väntande kodning – välj vilka schemaändringar som ger notiser (2026-11-07)
- Lägg till två separata reglage i Administratörsverktyg → Planering → Notiser om schemaändringar: **Ändrade turer** och **Ändrade uppgifter**.
- Det ska gå att välja enbart ändrade turer, enbart ändrade uppgifter eller båda. Visa hjälptexten ”Välj ett eller båda alternativen.”
- Valen styr schemanotiser både på hemsidan och i planeringsappen, tillsammans med befintlig aktivering och valt datumintervall. Använd vanliga horisontella reglage enligt förhandsbilden.
- Sparat som väntande kodning.

## Väntande kodning – bilder och emojis i dokument (2026-11-07)
- Lägg till **Infoga → Bilder och emojis** i dokumentredigeraren med sökning och kategorier. Emojis infogas vid textmarkören. Bilder ska gå att placera och ändra storlek på. Stöd uppladdning av egna bilder från mobil och dator. Innehållet ska följa med vid utskrift och export.
- Bildbibliotekets föreslagna kategorier är järnväg, utbildning, planering, information samt former och pilar. Exempel är tåg, räls, signaler, böcker, kalender, varningssymboler och pratbubblor. Använd enhetliga illustrationer och TC Bodens loggor där lämpligt. Det exakta bildurvalet är ännu inte bestämt.
- Emojibiblioteket ska även innehålla **Högtider och firande**, med jul (🎄 🎅 🎁), nyår (🎆 🥂 🎉), påsk (🐣 🐰 🥚), Halloween (🎃 👻 🦇), midsommar (🌸 🌿 ☀️) och andra firanden.
- Sparat som väntande kodning.

## Väntande kodning – kopplad bredd för Uppgift-kolumner (2026-11-07)
- I planeringsmodulens Ordna-läge ska alla personers **Uppgift**-kolumner ha samma bredd i användarens egen vy. När bredden ändras på en Uppgift-kolumn ska samtliga Uppgift-kolumner i samma vy följa med, även efter att layouten låsts eller öppnats igen.
- Varje persons **Tur och Uppgift** ska flyttas tillsammans som en persongrupp vid ändrad ordning.
- Den gemensamma Uppgift-bredden sparas per användares personliga layout. Andra användares vyer påverkas inte. Detta ersätter V19:s separata bredder per Uppgift-kolumn.
- Sparat som väntande kodning.

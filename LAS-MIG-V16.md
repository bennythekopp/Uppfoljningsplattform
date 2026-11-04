# TC Boden v16 – nya och ändrade filer

Lägg dessa filer ovanpå **v15.1**. Detta är ett uppdateringspaket, inte en komplett kopia av hemsidan. Befintliga bedömningar, dokument och planeringsdata bevaras. Ingenting är installerat eller publicerat av assistenten.

## Installation

1. Ersätt/lägg till filerna på samma sökvägar i projektet. `package.json` och `package-lock.json` ska båda uppdateras.
2. Kör **netlify/database/migrations/0045_notifications_and_people_visibility.sql** i Netlify Database, efter 0044. Migrationen kan köras igen utan att återställa sparade val.
3. Publicera projektet på vanligt sätt i Netlify. Paketinstallationen tar även med `web-push`.
4. Öppna **Administratörsverktyg → Planering → Notiser för schemaändringar**, välj period och aktivera **Skicka notiser till mobilen och hemsidan**. Inställningen är av vid första installationen. Spara.
5. För telefonpush, konfigurera nycklarna nedan. Webbens bjällrnotiser fungerar även utan pushnycklar.

## Telefonpush – en gång per webbplats

I projektmappen på din dator, med Node.js installerat:

```powershell
npm ci
node scripts/create-push-keys.cjs
```

Lägg de tre utskrivna värdena som miljövariabler i Netlify:

- `PLANNING_PUSH_PUBLIC_KEY`
- `PLANNING_PUSH_PRIVATE_KEY`
- `PLANNING_PUSH_SUBJECT` (skriptet använder `https://tcboden.se`)

Behåll samma nycklar vid framtida publiceringar. Den privata nyckeln ska endast ligga i Netlifys miljövariabler. Publicera på nytt efter att variablerna sparats. Befintlig `APP_ORIGIN` ska fortfarande omfatta den använda domänen.

Öppna sedan planeringsappen från hemskärmsikonen, öppna kugghjulet och slå på **Notiser på/av**. Godkänn telefonens fråga. På iPhone krävs en hemskärmssparad webbapp med stöd för webbpush, från iOS 16.4. På Android krävs en webbläsare som stöder webbpush. Ett serverval kan inte ge telefonens tillåtelse automatiskt.

## Det som ingår

- **Nya ändringsförslag:** en bjällrnotis till användare med redigeringsbehörighet för Planering, inklusive behöriga administratörer. Avsändare, person, datum, berört fält och färgade före/efter-värden visas. **Visa ändringsförslag** öppnar rätt förslag på hemsidan. Redan hanterade eller återtagna förslag försvinner ur dessa förslagsnotiser. Övriga befintliga notiser/läskvitton behålls.
- **Eget schema:** genomförda tur-, uppgifts- och färgändringar aviseras i hemsidans bjällra och på uttryckligen aktiverade telefoner. Godkända förslag omfattas; nya väntande förslag ändrar inte schemat. Ändringar som kommer av ändrat aktivt grundschema eller radtilldelning jämförs också. Personkolumnens kontokoppling avgör mottagaren.
- **Gemensam inställning:** på/av och en rullista med Innevarande vecka, Kommande 7 dagar, Kommande 14 dagar eller Innevarande månad. Vecka är måndag–söndag i svensk tid. Sju/fjorton dagar omfattar dagens datum och de följande sex/tretton dagarna. Kalenderperioderna beräknas i Europe/Stockholm. Perioden gäller schemadatum, inte ett periodiskt utskick.
- **Personligt val:** Notiser på/av ligger i de befintliga små kugghjulsrutorna. På webben styr det schemaändringsnotiser i bjällran; i appen styr det den aktuella telefonens push. Byt lösenord, Mörkt läge, Textstorlek respektive Logga ut behålls. Nya ändringsförslag och andra notistyper påverkas inte av detta personliga schemaändringsreglage.
- **Synlighet för Elever och Personal:** under Administratörsverktyg → Allmänt finns sökning och separata kryssrutor per användare, med Spara och Återställ ändringar. Menyer, översikter och skyddade dataanrop följer valen. Rollbehörigheterna gäller fortfarande; ett synlighetsval ger ingen ny rollbehörighet. Administratörer behåller åtkomst enligt samma princip som befintlig modulsynlighet. Data tas inte bort.

## Leverans och databasvila

Ändringar och notiser skapas i samma databastransaktion. Samma sparförsök skapar inte flera notiser. Telefonleveranser sker efter att ändringen sparats, med en beständig kö och begränsade återförsök. Taggar hjälper telefonen att ersätta dubbla leveranser efter ett avbrott; exakt en extern pushleverans kan inte garanteras vid nätverksavbrott. Borttagna pushprenumerationer avaktiveras.

Den schemalagda Netlify-funktionen **planning-push** använder samma vilogrind som övriga jobb. När kön är tom avslutas dess databasarbete tills en ny ändring väcker jobbet. Inga tätare pollingintervall har införts. Stängd, dold och inaktiv sida behåller tidigare pausregler. En notis kräver ingen öppen app. Explicit Logga ut återkallar push för den aktuella enheten; andra uttryckligen aktiverade enheter påverkas inte.

## Kontroller

Produktionsbygge och TypeScript samt isolerade tester för notiser, datumgränser, rätt mottagare, återförsök, ägarskap, spärrade konton, synlighet och databasvila. Tidigare tester för säker sparning, appbehörigheter, konto-/sessionshantering och adminnotiser passerar.

Inga riktiga mejl, pushutskick eller produktionsdatabasändringar har gjorts. Visuell webbläsar-/telefonkontroll återstår: förhandsvisningen kunde inte starta projektet i denna miljö. Kontrollera därför efter installation på iPhone, Android och dator, i ljust och mörkt läge, inklusive att egna notiser öppnar rätt datum och att båda kugghjulsrutorna ryms.

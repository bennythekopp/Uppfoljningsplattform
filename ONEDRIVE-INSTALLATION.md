# Säkerhetskopiering till privat OneDrive – TC Boden

Denna version ersätter anslutningen för organisationens SharePoint med **OneDrive för ett privat Microsoft-konto**. Den ansluts av administratören via Microsofts inloggning. Ingen organisationswebbplats, Sites.Selected-behörighet, Drive ID eller Root ID behöver konfigureras manuellt.

## 1. Installera kod och databasuppdatering

Lägg paketets filer i GitHub-projektets rot och behåll befintliga databas- och mailvariabler.

Kör migrationerna i nummerordning i samma databas som hemsidan använder:

- Har du kört till och med 0034: kör 0035, 0036 och 0037.
- Har du kört 0035: kör 0036 och 0037.
- Har du redan kört 0036: kör endast `0037_personal_onedrive.sql`.

Migration 0037 bevarar intervall, filval, historik och operativa passantal. Vid första körningen stängs automatisk backup av och pågående exporter stoppas för bytet av anslutning. Migreringen kan köras om utan att återställa de nya inställningarna.

## 2. Registrera Microsoft-appen en gång

Öppna Microsoft Entra administratörscenter och skapa en appregistrering, exempelvis **TC Boden reservkopior**. Registreringen kräver tillgång till en Microsoft Entra-katalog där du får registrera appar; själva filerna sparas sedan på det privata OneDrive-konto du ansluter. Om du inte kan skapa appen behöver den som hanterar katalogen hjälpa till med detta engångssteg.

Välj kontotypen **Personliga Microsoft-konton**. Om portalen i stället erbjuder kombinationen organisationer och personliga Microsoft-konton fungerar även den, men personliga konton måste ingå. Hemsidans anslutning använder `consumers` och accepterar privata Microsoft-konton.

Under Authentication lägger du till en **Web**-plattform med exakt denna redirect URI om din adress fortfarande är handledare.netlify.app:

```text
https://handledare.netlify.app/api/admin/backups/onedrive/callback
```

Välj Web, inte SPA. Aktivera inte implicit grant för detta flöde.

Spara appens **Application (client) ID**. Skapa sedan en klienthemlighet under Certificates & secrets → Client secrets och kopiera **Value**, inte Secret ID. Notera hemlighetens utgångsdatum.

Under Microsoft Graph → **Delegated permissions** använder anslutningen:

- `Files.ReadWrite.AppFolder`
- `offline_access`

Ingen Application-behörighet eller Sites.Selected används. Begär inte full åtkomst till hela OneDrive. Ett uteblivet godkännande ska inte lösas genom att lägga till bredare behörigheter.

## 3. Lägg in miljövariabler i Netlify

Variablerna ska vara tillgängliga för Functions i produktionskontexten och får inte börja med NEXT_PUBLIC_. Spara aldrig nycklar i GitHub.

| Variabel | Värde |
| --- | --- |
| ONEDRIVE_CLIENT_ID | Appens Application (client) ID |
| ONEDRIVE_CLIENT_SECRET | Klienthemlighetens Value |
| ONEDRIVE_TOKEN_KEY | En ny slumpmässig nyckel med exakt 64 hextecken, 32 byte |
| BACKUP_WORKER_TOKEN | En annan slumpmässig hemlighet på minst 32 tecken |
| APP_ORIGIN | `https://handledare.netlify.app` eller din aktuella riktiga HTTPS-adress |

Generera en ny nyckel två gånger på en dator med OpenSSL:

```sh
openssl rand -hex 32
```

Använd det ena värdet för ONEDRIVE_TOKEN_KEY och det andra för BACKUP_WORKER_TOKEN. Spara dem privat, inte i chatten. ONEDRIVE_TOKEN_KEY krypterar anslutningens åtkomst-/förnyelsenycklar i databasen. **Behåll samma nyckel mellan deployer.** Om den går förlorad eller ändras behöver du ansluta OneDrive igen.

Om du redan har SHAREPOINT_WORKER_TOKEN med ett starkt slumpvärde kan den befintliga arbetarnyckeln fortsätta användas tills du ersätter den med BACKUP_WORKER_TOKEN. De gamla SHAREPOINT_TENANT_ID/CLIENT_ID/CLIENT_SECRET/DRIVE_ID/ROOT_ID används inte längre och kan tas bort. Behåll NETLIFY_DB_URL/DATABASE_URL och eventuella Resend-/mailinställningar.

Gör en ny Netlify-deploy efter att variablerna har lagts till. Av kompatibilitetsskäl heter bakgrundsfunktionerna fortfarande `sharepoint-backup` och `sharepoint-backup-background`; de använder nu enbart den privata OneDrive-anslutningen.

## 4. Anslut det privata kontot på hemsidan

1. Logga in på TC Boden som administratör utan rollförhandsvisning.
2. Öppna Administratörsverktyg → Säkerhetskopiering.
3. Tryck **Anslut OneDrive**. Microsofts inloggning öppnas.
4. Välj ditt privata Microsoft-konto och godkänn åtkomst till appens egen mapp.
5. Efter inloggningen kommer du tillbaka till administratörsverktygen. Status ska visa Anslutet. **Öppna backupmappen** öppnar mappen direkt i OneDrive.
6. Bekräfta att valda personbedömningar och privata uppgifter får sparas i det anslutna privata kontot. Välj Samtliga filer för första kopian och tryck Spara inställningar.
7. Tryck Testa anslutning och därefter **Säkerhetskopiera nu**. Vänta på Klar i historiken.
8. Öppna OneDrive och kontrollera att KLAR.txt, Filöversikt.txt, dokument, protokoll och Excelplanering finns.
9. Välj önskat intervall/tidpunkt och kopieringsläge, aktivera Automatisk säkerhetskopiering och spara igen.

Mappen skapas automatiskt i OneDrives appområde, normalt **Apps/TC Boden reservkopior** om det är appens namn. Microsoft kan visa Apps med ett lokaliserat namn. Under den mappen får varje export en daterad undermapp.

## 5. Hur automatiken fungerar

- Privat konto ansluts med OAuth authorization code + PKCE. Tillfälliga anslutningsförsök är bundna till administratörens inloggningssession och kan bara användas en gång.
- Anslutningsnycklar lagras krypterat på servern och skickas inte till webbläsaren, aktivitetsloggen eller reservkopiorna.
- Åtkomst kan förnyas med offline_access medan Netlifys bakgrundsfunktion körs. Hemsidan behöver inte vara öppen. Om Microsoft kräver ny inloggning eller åtkomsten återkallas visas Anslut igen.
- Bara appens OneDrive-mapp används. Microsoft-kontots lagringsutrymme sätter gränsen. Befintliga kopior raderas inte automatiskt.
- Intervall 1/6/12/24 timmar eller daglig/veckovis svensk klocktid kan väljas. Kontroll sker ungefär var femte minut, inte exakt på sekunden.
- Alla filer, bara nya/ändrade filer eller utvalda mappar/filer kan väljas. Vid en ändringskopia hänvisar Filöversikt.txt till äldre mappar för oförändrade filer. Radera inte dessa mappar. Kör Samtliga filer för en ny fristående full kopia.
- Säkerhetskopiera nu fungerar även med automatiken avstängd, efter att inställningarna sparats och lagringen godkänts.
- Byt OneDrive-konto ansluter ett nytt konto. Automatiken och lagringsbekräftelsen stängs av för det nya godkännandet. En ny första full kopia behövs; gamla exporter flyttas inte automatiskt mellan konton.
- Koppla från raderar webbplatsens anslutningsnycklar, stoppar automatiken och pågående export. Befintliga OneDrive-kopior ligger kvar. Microsofts godkännande kan också återkallas i Microsoft-kontots appbehörigheter.

## 6. Reservåtkomst och begränsningar

Spara OneDrive-länken som bokmärke utanför hemsidan. För åtkomst utan internet kan du synkronisera mappen med OneDrive-appen och välja Behåll alltid på den här enheten. Kontrollera på varje dator att filerna verkligen laddats ned.

Kopiornas innehåll är samma som tidigare: separata modulmappar, planering som Excel, separata Personal/Elever-mappar och protokoll per person, samt originalinnehåll och metadata i JSON. Detta är en läsbar reservexport, inte en fullständig databasåterställning. Inga lösenord eller sessioner ingår och ändringar i Office-kopior återförs inte till hemsidan.

Den automatiska anslutningen är en gemensam backupdestination för hemsidan. Det privata kontots ägare kan läsa allt som valts för export, inklusive privata anteckningar och bedömningar. Åtkomsten i OneDrive följer inte hemsidans rollbehörigheter automatiskt. Dela därför inte backupmappen bredare än avsett.

Microsoft kan begära ny inloggning och åtkomst kan återkallas. Fullt lagringsutrymme, förlorad appmapp eller utgången klienthemlighet kan stoppa exporten. Anslutnings- och uppladdningstester mot ditt verkliga privata konto måste göras efter installationen; de kan inte genomföras utan ditt godkännande hos Microsoft.

## Felsökning

- Knappen Anslut OneDrive är grå: kontrollera de fyra ONEDRIVE-/APP_ORIGIN-variablerna och att ONEDRIVE_TOKEN_KEY är 64 hextecken. Gör ny deploy.
- Microsoft säger redirect URI mismatch: registrera exakt callbackadressen ovan som Web och kontrollera APP_ORIGIN.
- Microsoft accepterar inte kontot: appregistreringen måste stödja personliga Microsoft-konton. Anslutningen använder consumers, inte organisationsinloggning.
- Anslutningen avbröts/utgången: börja om från Anslut OneDrive och använd samma TC Boden-inloggning under hela flödet. Ett försök gäller i högst tio minuter.
- OneDrive svarar 403: kontrollera det privata kontots OneDrive och att Files.ReadWrite.AppFolder har godkänts. Bredda inte behörigheten till hela enheten som standardåtgärd.
- Anslut igen: Microsoft kräver ett nytt godkännande eller förnyelse. Ny anslutning stänger automatiken tills du bekräftar och sparar den igen.
- Exportarbetaren kan inte startas: kontrollera BACKUP_WORKER_TOKEN, APP_ORIGIN och att båda Netlify-funktionerna publicerats.
- Hemligheten har gått ut: byt dess Value i Netlify, gör ny deploy och anslut på nytt om det behövs.

Referenser: [Microsofts appmapp](https://learn.microsoft.com/en-us/graph/onedrive-sharepoint-appfolder), [behörighet för privat appmapp](https://learn.microsoft.com/en-us/graph/api/drive-get-specialfolder), [authorization code och PKCE](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow).

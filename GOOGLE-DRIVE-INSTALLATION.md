# Säkerhetskopiering till Google Drive

Denna version ersätter OneDrive som mål för nya säkerhetskopior. Gamla kopior flyttas eller raderas inte. Filval, intervall och tidigare exporthistorik bevaras. Automatiska körningar är avstängda tills du anslutit Google och godkänt åtkomsten.

## 1. Uppdatera sidan och databasen
Ladda upp paketets projektfiler till ditt befintliga GitHub-repository. Kör `netlify/database/migrations/0038_google_drive.sql` efter 0037 i samma databas som sidan använder. Om tidigare migrationer saknas måste de först köras i nummerordning. De gamla Microsoft-tabellerna lämnas kvar, men används inte längre.

## 2. Skapa Google-anslutningen
1. Gå till https://console.cloud.google.com/ och skapa ett projekt, exempelvis TC Boden Backup.
2. Aktivera **Google Drive API** under APIs & Services > Library.
3. Under Google Auth Platform: konfigurera appnamn TC Boden, kontaktadress och målgrupp External för ett privat Google-konto.
4. Lägg till behörigheten `https://www.googleapis.com/auth/drive.file` under Data Access. Den begränsar appen till filer som den skapar eller som uttryckligen delas med appen. Sidan begär inte åtkomst till hela ditt Drive.
5. Skapa en OAuth client under Clients, typ **Web application**.
6. Lägg till exakt följande Authorized redirect URI om du använder den nuvarande adressen:
   `https://handledare.netlify.app/api/admin/backups/googledrive/callback`
   Vid annan adress måste både URI och APP_ORIGIN använda den adressen.
7. Kopiera Client ID och Client secret till Netlify enligt nästa avsnitt.
8. Använd publiceringsstatus **In production** för den riktiga kopieringen. Om appen är i Testing kan Google låta uppdateringstoken löpa ut efter sju dagar. Följ eventuella krav som visas i Googles konsol. Anslut på nytt efter byte från testläge.

## 3. Miljövariabler i Netlify
Ange dessa som hemliga server-/Functions-variabler, aldrig med NEXT_PUBLIC-prefix:

| Namn | Värde |
|---|---|
| GOOGLE_DRIVE_CLIENT_ID | Client ID från Google |
| GOOGLE_DRIVE_CLIENT_SECRET | Client secret från Google |
| GOOGLE_DRIVE_TOKEN_KEY | Ny slumpmässig krypteringsnyckel med exakt 64 hextecken |
| APP_ORIGIN | https://handledare.netlify.app (eller din faktiska adress) |
| BACKUP_WORKER_TOKEN | Minst 32 slumpmässiga tecken; behåll befintligt värde om det redan finns |

En krypteringsnyckel kan genereras lokalt med `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Behåll nyckeln mellan uppdateringar; byter du den måste Google anslutas igen. Hemligheterna ska inte läggas i GitHub. ONEDRIVE_CLIENT_ID, ONEDRIVE_CLIENT_SECRET och ONEDRIVE_TOKEN_KEY används inte av denna version och kan tas bort efter bytet.

Gör en ny deploy i Netlify efter att variablerna sparats. Kontrollera att schemalagda Netlify Functions är aktiva på din produktionsdeploy; befintliga funktionsnamn sharepoint-backup och sharepoint-backup-background behålls för kompatibilitet men använder nu Google Drive.

## 4. Anslut och provkör
1. Logga in som administratör och öppna Administratörsverktyg > Säkerhetskopiering.
2. Klicka **Anslut Google Drive** och välj det privata Google-konto som ska äga kopiorna.
3. Godkänn Google-åtkomsten. En privat mapp **TC Boden säkerhetskopior** skapas i kontot.
4. Klicka **Testa anslutning**. Välj omfattning och intervall, godkänn att uppgifterna sparas i detta konto och spara inställningarna.
5. Klicka **Säkerhetskopiera nu**. Vänta på status Klar. Öppna backupmappen och kontrollera några PDF-, Word- och Excel-filer.
6. Aktivera automatisk kopiering och spara inställningarna.

Den första kopian till den nya anslutningen kopierar hela det valda innehållet även om läget Endast uppdaterade filer används. Oförändrade filer i senare ändringskopior hänvisar till tidigare daterade mappar. Radera därför inte äldre mappar som dessa kopior hänvisar till. Byte/återanslutning skapar en ny mapp och startar en ny kopieringskedja.

Samma exportstruktur behålls: separata modulmappar, planering som Excel, separata personmappar för elever/personal och bedömningshistorik. Filerna nås direkt via Drive även om Netlify-sidan inte fungerar. Detta är läsbara innehållsexporter, inte en fullständig databas-/serveravbildning med lösenord och sessioner. Befintliga kopior ligger kvar vid frånkoppling.

## Verifiering
Automatiska tester använder lokal PostgreSQL-kompatibel testdatabas och simulerade Google-svar: administratörsbehörighet, PKCE, sessionsbundet engångs-state, krypterade token, förnyelse, kontobyte, frånkoppling samt exportkö och dokumentformat. Riktig Google-inloggning och schemalagd drift måste provköras efter konfigurationen ovan.

Officiella referenser:
- https://developers.google.com/identity/protocols/oauth2/web-server
- https://developers.google.com/workspace/drive/api/guides/manage-uploads

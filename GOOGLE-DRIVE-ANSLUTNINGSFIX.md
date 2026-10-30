# Google Drive-anslutning – fix v3

Ersätter både fix v1 och v2. Alla filer i paketet behövs.

1. Packa upp zip-filen och ersätt/lägg till filerna på exakt samma sökvägar i GitHub-projektet.
2. Publicera en ny produktionsdeploy i Netlify. Vänta tills den är klar. Starta deployen manuellt om automatisk publicering är pausad.
3. Öppna hemsidans startsida i samma webbläsare och logga in som administratör. Avsluta eventuell rollförhandsvisning.
4. Öppna Administratörsverktyg → Säkerhetskopiering → Anslut Google Drive. Starta ett helt nytt försök; gamla callback-adresser fungerar inte.
5. Godkänn Google-åtkomsten inom tio minuter. Testa sedan anslutningen på hemsidan.

Ingen ny databasmigrering eller ändring av miljövariabler behövs för denna rättning. Den tidigare Google-konfigurationen och migration 0038 ska finnas kvar.

## Vad ändrades?
Mellanledets HTML/formulär tas bort. När en administratör startar anslutningen skapas en tillfällig HttpOnly-kaka med SameSite=Lax som bara skickas till callback-sökvägen. Den gäller högst tio minuter och tas bort när återkomsten hanterats. Endast callback använder den. Alla andra API:er använder fortfarande den vanliga SameSite=Strict-kakan. Servern verifierar fortfarande sessionens giltighet, administratörsroll, eventuell rollförhandsvisning, sessionsbundet engångs-state och PKCE. Att bara ha den tillfälliga kakan ger ingen åtkomst till vanliga API:er.

## Verifiering
Produktionsbygge och TypeScript godkända. Backupintegration med lokal databas och simulerade Google-svar godkänd: callback utan vanlig kaka men med tillfällig kaka, saknad/ogiltig kaka, fel roll, engångssvar, kryptering och övriga backupkontroller. Riktig webbläsarinloggning med Google måste fortfarande provköras efter publicering.

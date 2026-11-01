# TC Boden v10 – komplett hemsida med Testa utskick

Hela koden för hemsidan och den fristående planeringsappen ingår. Ändringarna från v5–v8, databasvilan från v9 samt Google Drive-anslutningsfixen ingår. Detta är kod, inte en kopia av produktionsdatabasen eller dina miljövariabler.

## Installera i befintligt projekt
1. Packa upp ZIP-filen och lägg innehållet i roten av ditt befintliga GitHub-projekt, bredvid package.json. Ersätt motsvarande filer och behåll projektets miljövariabler och databas.
2. Publicera en ny produktionsdeploy i Netlify. Kör inte om tidigare SQL-migrationer. Ovanpå fungerande v8/v9 med migration 0040 krävs ingen ny SQL-migration. Vid äldre version behöver tidigare migrationer först tillämpas i ordning.
3. Öppna hemsidan och planeringsappen online igen. Stäng gamla öppna flikar/appfönster så att äldre kod inte fortsätter göra databasanrop.
4. Öppna Administratörsverktyg → Planering → Mailinställningar. Ange mottagaradress och klicka Testa utskick. Kontrollera mottagarens inkorg och skräppost.

## Testa utskick
- Knapp med kuvertikon bredvid Spara. Under pågående test står det Skickar testmail… och knapparna är låsta.
- Skickar ett tydligt märkt testmail direkt till adressen som står i formuläret. Du behöver inte spara formuläret eller aktivera ordinarie utskick först.
- Bara administratörer kan använda funktionen. Rollförhandsvisning får inte skicka. Servern kontrollerar behörighet, ursprung, begäransstorlek och mottagaradress.
- Testet använder samma RESEND_API_KEY och PLANNING_MAIL_FROM som ordinarie utskick samt APP_ORIGIN för länken till sidan. Inga nya miljövariabler krävs.
- Inställningar, ordinarie mailkö, förslagens skickatmarkeringar och senaste ordinarie utskick ändras inte.
- Vid lyckat anrop visas mottagaradressen och en uppmaning att kontrollera skräpposten. Det betyder att mailtjänsten har accepterat utskicket; slutlig leverans kan kontrolleras hos Resend.
- Vid misslyckat anrop visas ett begripligt fel. Serverhemligheter och råa leverantörssvar visas inte.
- Upprepning efter ett osäkert svar använder samma unika leverantörsnyckel inom samma öppna formulär och mottagaradress för att minska risken för dubbla testmail.

## Databasvila
Läs UPPDATERING-V9-DATABASVILA.md för detaljer. Alla återkommande hämtningar omfattas av pausen när fliken döljs eller efter två minuters inaktivitet. Faktiska ändringar får autosparas. Backup och mail använder sparad nästa körtid i Netlify Blobs i stället för ständiga PostgreSQL-kontroller.

## Om du byter från fjtkl.se till tcboden.se
Koppla den nya domänen till samma Netlify-projekt och kontrollera HTTPS. Registrera https://tcboden.se/api/admin/backups/googledrive/callback i samma Google OAuth-klient. Sätt sedan APP_ORIGIN till https://tcboden.se och publicera igen. Behåll övriga hemligheter och databasanslutningen. Spara om mail-/backupinställningarna efter ändring av miljövariabler för att väcka schemaläggningen. Testa både utskick och backup från den nya adressen.

## Verifierat
- TypeScript och produktionsbygge.
- Nya API-tester för testmail: administratör/övriga roller, förhandsvisning, fel ursprung, mottagarvalidering, saknad konfiguration, leverantörsfel, nätverksfel, återförsöksnyckel och oberoende från ordinarie maildata.
- Databasvila/schemaläggning samt befintliga backup-/Google Drive-/Word-/PDF-/Excel- och admintester.
- Externa mail- och Google-tjänster simulerades. Inga riktiga mail skickades under arbetet och ingen produktionsdata ändrades. Kontrollera riktig leverans och schemalagda körningar efter publiceringen.

Inte publicerat på din riktiga sida av assistenten.

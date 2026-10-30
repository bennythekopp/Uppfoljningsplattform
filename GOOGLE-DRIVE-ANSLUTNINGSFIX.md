# Rättning: Behörighet saknas efter Google-inloggning

## Installera
1. Packa upp denna zip-fil.
2. Lägg filerna i samma sökvägar i ditt befintliga GitHub-projekt. Ersätt app/api-security.ts och app/api/admin/backups/googledrive/callback/route.ts. Testfilen och denna instruktion kan också läggas in.
3. Publicera ändringen med en ny produktionsdeploy i Netlify. Om automatiska byggen är pausade måste du starta deployen manuellt.
4. När deployen är klar: öppna hemsidans vanliga adress, logga in som administratör, avsluta eventuell rollförhandsvisning och välj Administratörsverktyg → Säkerhetskopiering → Anslut Google Drive.
5. Starta en NY anslutning; återanvänd inte den gamla callback-adressen. Google-svaret är kortlivat och kan bara användas en gång.
6. Om en Fortsätt-knapp visas, tryck på den. Normalt sker fortsättningen automatiskt.

Ingen ny databasmigrering eller ändring av Google/Netlify-miljövariabler behövs för just denna rättning. Tidigare Google Drive-konfiguration och migration 0038 måste redan finnas.

## Ändring
Google återvänder först till en offentlig mellansida utan dataåtkomst. Den skickar sedan svaret från samma webbplats till en skyddad POST-handler. Då följer den befintliga SameSite=Strict-inloggningskakan med. Administratörsbehörighet, ursprungskontroll, sessionsbundet engångs-state och PKCE verifieras som tidigare. Mellansidan använder no-store, no-referrer, escapade fält och strikt innehållspolicy.

## Kontroller
Backupintegrationstester med lokal databas och simulerade Google-svar: godkända. Inkluderar saknad session, främmande ursprung, HTML-injektion, engångs-state och rollförhandsvisning. Riktig Google-inloggning behöver provköras efter publicering.

Produktionsbygge inklusive TypeScript: godkänt.

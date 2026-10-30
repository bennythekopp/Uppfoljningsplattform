# TC Boden Planering – separat installerbar mobilapp (PWA)

## Vad som är implementerat
- Ny route: `/planering-app`, skild från alla huvudmenyer i Bedömningsstödet.
- Samma befintliga användarnamn/lösenord och sessionscookie (ingen andra inloggningsdatabas).
- Samma faktiska `/api/planning` GET som ordinarie webbplanering. Använder grundschema, medlemskap, turreferenser, färger och manuellt sparade uppgifter. Ingen demonstrationsdata.
- Vecka måndag–söndag, bläddring och inbyggd datumväljare, årsskiften fungerar.
- Stående: enbart inloggad persons Tur + Uppgift (koppling via user_email). Liggande: samtliga personer, individuella Tur/Uppgift samt gemensamma planeringskolumner. Horisontell scroll och fast datumkolumn.
- Läsning endast: inga skrivanrop i appen, inga redigeringskontroller. Den vanliga hemsidans behörigheter förändras inte.
- Uppdaterar planering när appen återfår fokus, vid pull to refresh och var 60:e sekund.
- Eget PWA-manifest under `/planering-app/manifest.webmanifest`, med startadress och scope begränsade till appen. Använder befintliga TC Boden-ikoner.

## Installation
1. Ta en kopia av befintligt projekt.
2. Kopiera `app/planering-app/` från detta uppdateringspaket till motsvarande katalog i ditt senaste projekt, utan att ersätta övriga filer.
3. Bygg och publicera via GitHub/Netlify som vanligt.
4. Öppna `https://handledare.netlify.app/planering-app` på iPhone i Safari och välj **Dela → Lägg till på hemskärmen**. På Android, öppna med Chrome och använd **Installera app** eller **Lägg till på startskärmen**.
5. Logga in med befintligt konto. Appen läser endast data från samma webbplats. För att se personens egen planering i stående läge måste kontot vara kopplat till motsvarande personkolumn i Planering.

## Säkerhet och avgränsningar
- Ingen delad cross-origin-inloggning. Samma domän används för app och API, annars fungerar inte befintlig SameSite=Strict-session utan separat autentiseringslösning.
- Befintligt serverkrav på modulåtkomst och roll gäller fortfarande. Utan behörighet visas ett fel.
- Läsbehörighet betyder endast att **denna mobilvy** inte skickar redigeringar. Det gör inte användarens eventuella redigeringsrätt på originalhemsidan ogiltig.
- Planeringen hämtas online, ingen offline-cache av personuppgifter. PWA-manifest i sig garanterar inte offlinefunktion.
- Inte produktionspublicerad och inte testad med riktig databas/inloggning. Kontrollera i riktiga iPhone- och Android-webbläsare innan driftsättning.

## Mobilapp v2
Nattpass markeras med sammanhängande lodrät fortsättning och slutpil. Manuella färger och Semester färgar både tur och uppgift. Dra ned från sidans topp för uppdatering med samma komponent som huvudsidans mobilvy. Utloggning finns under kugghjulet i sidhuvudet.

Senast hämtade veckor sparas på denna enhet för offlinevisning; öppna appen och önskade veckor online först. Offlinekopian kan vara inaktuell och serverns behörighet kan inte kontrolleras utan internet. Använd på en personlig, skärmlåst enhet. Utloggning rensar sparade veckor och kräver internet för att avsluta serverns session. Inga API-svar sparas av service worker; enbart appskal och statiska resurser. Automatisk uppdatering kräver internet.

Verifiering: TypeScript och produktionsbygge kontrolleras lokalt. Riktig iOS/Android-installation, offline-start och touchgester behöver fortfarande verifieras på en fysisk enhet efter deploy.

## Mobilapp v3
- Kugghjul med samma symboler och sol/måne-reglage som huvudhemsidan. Utloggning ligger i samma meny.
- Ljust/mörkt läge delar huvudhemsidans sparade användarinställning på samma enhet.
- Uppdateringsknapp, Läsbehörighet, Min planering-rubrik och instruktionen att vrida mobilen är borttagna.
- Veckotabellen fyller den tillgängliga skärmhöjden och går att skrolla på små skärmar.
- Dra nedåt för att uppdatera när schemat är skrollat till toppen.

Detta är ett komplett källkodspaket: ersätt projektfilerna i GitHub och låt Netlify bygga projektet. Behåll befintliga miljövariabler och databas.

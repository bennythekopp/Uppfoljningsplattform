# TC Boden v14-4 – återtagning, antal och profilrad

Installera ovanpå fungerande v14 eller v14-1/v14-2/v14-3. Paketet innehåller även de senaste samlade sidomeny- och förslagsöversiktsändringarna. Endast nya/ändrade filer ingår.

## Installation

1. Kör den nya SQL-filen netlify/database/migrations/0043_withdraw_planning_suggestions.sql efter 0042, före publicering. Den lägger till status withdrawn. Kör inte om äldre SQL-filer.
2. Ersätt motsvarande filer i ditt befintliga GitHub-projekt och publicera en ny deploy. Behåll alla övriga filer. Inga nya beroenden eller miljövariabler behövs.

## Ändringar

- Ta tillbaka visas på egna väntande förslag i ändringsförslagsöversikten och när ett förslag öppnas från en ruta i planeringen. Samma möjlighet finns i planeringsappens detaljruta.
- Servern kontrollerar författaren, aktuell status och åtkomst. Endast egna pending kan återtas; godkända/slopade/ersatta förslag påverkas inte. Ett upprepat återtagningsanrop är ofarligt. Åtgärden loggas och ändrar inte planeringsrutans innehåll.
- Återtagna förslag försvinner från väntelistor, utropstecken, antal och kommande sammanställningar. V14:s skydd för redan påbörjade/osäkra mejlutskick behålls. Ett mejl som redan levererats kan inte återkallas.
- Kopiera text tas bort från den gemensamma förslagsdialogen, både översikten och vald ruta. Godkänn/Slopa finns kvar för hemsidans redigerare.
- Knappen visar Ändringsförslag (antal), inklusive (0). Antalet gäller samtliga aktuella väntande förslag och hämtas i befintlig laddning. Inget nytt periodiskt nätverksanrop har införts.
- Planeringens rullningslist får samma tunna grå stil som sidomenyn, utan pilrutor. Horisontell och vertikal skrollning finns kvar.
- Avatar, namn/roll, inställningar och utloggning ligger på en gemensam rad i sidomenyn, även inne i Planering. Profilraden ligger kvar nedtill. Långa profilnamn kan förkortas med ellips.
- Menybredden 280 px och skrollning enbart i den nedre listan behålls. De fasta menyerna ligger kvar upptill.

## Verifiering

Produktionsbygge/TypeScript och CSS-syntax kontrolleras. Isolerade API-/databastester täcker ägarskap, åtkomst, pending/slutbehandlad status, återförsök, återtagning i appen och hemsidan, minskat antal och oförändrade planeringsceller. Mejltest utesluter återtagna förslag. Inga riktiga mejl skickades. Visuell enhetskontroll återstår; förhandsbilderna är funktionsförslag. Inte publicerat av assistenten.

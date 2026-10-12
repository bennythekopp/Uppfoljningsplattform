# Uppdatering: återställning från aktivitetsloggen

Paketet innehåller endast ändrade och nya filer sedan föregående uppdatering med Administratörsverktyg och migration 0018. Den uppdateringen måste redan finnas i projektet.

1. Kör netlify/database/migrations/0019_restore_assessments.sql efter 0018 i den databas som webbplatsen använder. Kör filen endast en gång. Vid manuell körning kan hela filen köras i en transaktion med BEGIN före och COMMIT efter innehållet.
2. Lägg paketets filer i motsvarande mappar i GitHub-projektet och ersätt de gamla versionerna. Behåll alla övriga filer.
3. Publicera via den befintliga Netlify-anslutningen.
4. Administratörsverktyg → Aktivitetslogg: en återställningsbar borttagning får knappen Återställ. Bekräfta för att återställa bedömningen. Återställningen registreras i loggen.

Nya borttagningar får en återställningskopia. Tidigare fysiskt borttagna bedömningar utan kopia kan inte återställas. Äldre arkivprotokoll som fortfarande finns i databasen kan bli tillgängliga när migrationen hittar en säker koppling till loggposten.

Nyare bedömningar skrivs inte över. Personen och aktuella elevmoment måste fortfarande finnas kvar. Vid konflikt visas ett meddelande och inget återställs. Ursprungliga resultat, kommentarer och bedömare behålls vid lyckad återställning.

Bygge, behörigheter, återställning av samtliga bedömningstyper, konflikter, versionskontroll och gemensam återställning vid loggningsfel har kontrollerats.

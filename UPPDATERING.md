# Uppdatering efter Examen-versionen

Detta paket innehåller bara ändrade och nya filer sedan senaste kompletta TC-Boden-Netlify-GitHub.zip med migration 0017. Det är inte en fristående installation.

1. Packa upp och lägg filerna i samma mappar i ditt befintliga GitHub-projekt. Ersätt motsvarande gamla filer och behåll resten av projektet.
2. Kör netlify/database/migrations/0018_administration_audit.sql i den databas som webbplatsen använder, efter att migrationerna till och med 0017 är tillämpade. Kör inte om redan körda migrationer. Vid manuell körning kan hela 0018 köras som en transaktion (BEGIN före innehållet och COMMIT efter).
3. Publicera det uppdaterade projektet via befintlig Netlify-anslutning.
4. Logga in som Administratör: vänstermenyn ska visa Administratörsverktyg med två flikar inne på sidan, Användare och Aktivitetslogg. Instruktörspanelen har bara Översikt och Bedömningsunderlag.
5. Prova att spara en bedömning och kontrollera att den registreras i Aktivitetslogg. Borttagning finns för Instruktör och Administratör och kräver bekräftelse.

Aktivitetsloggen börjar samla händelser från denna uppdatering. Inga äldre händelser kan visas retroaktivt. Om meddelandet ”Kunde inte läsa Examen” fortfarande visas, kontrollera att 0017 är körd i rätt databas innan du kör 0018.

Bygge och TypeScript-kontroll samt tester av behörigheter, borttagning, samtidiga ändringar, loggning, historik och mobilbredd har körts före paketering. Se README.md för detaljer om funktionerna.

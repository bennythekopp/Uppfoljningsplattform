# Grundschema – uppdatering 24 oktober 2026

- Nuvarande schema visar det aktiva schemat.
- Schemaförslag visar samtliga synliga, icke aktiva scheman direkt, utan gruppväljare.
- Inplacering visas överst. Schemanamnet står direkt ovanför respektive inplaceringsschema.
- Grundschema är en separat avdelning på samma sida. Två kompakta grundscheman ryms bredvid varandra på dator; de staplas på mobil.
- Alla turrutor i ett grundschema är lika breda. Bredden mäts automatiskt efter det längsta turnamnet och aktuell textstorlek.
- Varje schema har egna önskemål, rangordningar, tilldelningar och år/månadsnavigation.
- Turlista finns endast för administratörer och behåller gruppväljaren för redigering av även dolda grupper.
- Aktivering sker med kryssrutan Aktivt schema i Gruppinställningar, bredvid Öppen för önskemål, och sparas med Spara ändringar.
- Gäller i Planering från, dess datumväljare och Gör aktivt på översikterna är borttagna. Vid aktivering används gruppens Startdatum (måndag).
- Aktivering är en enda databastransaktion: det tidigare schemat avaktiveras, det nya blir synligt och önskemålen stängs.
- Ingen ny SQL-migrering behövs. Befintliga migrationer till och med 0030 gäller fortfarande.

## Installation
Ersätt filerna i projektet med innehållet i uppdateringspaketet och publicera en ny Netlify-version. Paketet med hela hemsidan innehåller även tidigare levererade uppdateringar.

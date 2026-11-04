# V17.4 – hela planeringsceller, samlat med V17.3

Lägg paketet ovanpå V17 (eller V17.1–V17.3). Paketet innehåller V17.1, V17.2 och V17.3 samt denna cellrättning. Ersätt filerna på motsvarande sökvägar och publicera på nytt i Netlify. Ingen ny SQL, miljövariabel eller pushnyckel behövs.

Textfälten för Uppgift och gemensamma textkolumner fyller hela cellens bredd och höjd, även när fältet är tomt eller bara innehåller en rad. En dold mättext ger raden rätt höjd för radbruten text; själva skrivfältet täcker hela cellen. Fokusramen följer cellens ytterkanter. Även vanliga turfält fyller höga rader. Den särskilda nattvisningen behålls. Färgval, automatisk sparning, felmeddelanden och ändringsförslagsflödet bevaras.

Samma cellkomponent används i webbens planeringsark på både mobil och dator. Detta är inte en ändring av textfältet i appens popup för ändringsförslag.

V17.3:s appbjällra mellan Exportera och kugghjulet, rättat notisreglage och regeln om inga notiser för egna schemaändringar ingår. Appens gränssnittscache får version tcpa-shell-v17-4. Öppna med uppkoppling och stäng/öppna vid behov efter publicering; utloggning behövs inte.

Verifierat: TSX-syntax, körning/rendering av den ändrade textcellskomponenten med isolerade adaptrar för tom, enkel och flerradig text, bevarade ändrings-/Enter-händelser samt CSS-syntax. Paketinnehåll och worker-syntax kontrollerade. Fullständigt produktionsbygge, full typkontroll och visuell kontroll i webbläsare/på fysisk mobil har inte körts för denna ändring. Inte publicerat av assistenten.

# TC Boden v15.1 – skärmbredd i planeringsappen

Lägg dessa tre uppdaterade kodfiler ovanpå v15 och publicera igen. Inga databasändringar, miljövariabler eller nya paket behövs.

- app/planering-app/page.tsx: deklarerar viewport-fit=cover för planeringsappen. Den tidigare CSS-rättningen saknade denna iPhone-inställning, så Safari kunde fortfarande begränsa visningsytan.
- app/planering-app/style.css: tar bort skyddsmarginaler runt hela appen. Toppfältets bakgrund och planeringsytan går kant till kant. Knappar och datumtext behåller skydd för kamerautskärningen, och nederkanten tar hänsyn till hemindikatorn. Scrollning åt båda håll behålls i liggande läge.
- app/planering-app/sw.js/route.ts: ny cacheversion så att gamla appfiler rensas när den nya service workern aktiveras.

Efter publiceringen: stäng den sparade planeringsappen helt och öppna den igen med internetanslutning för att hämta den nya versionen.

Kontroll: produktionsbygge och färdiggenererad viewport-tagg; webbläsarkontroll av den riktiga appens renderade markup och CSS i 852 × 393 respektive 393 × 852 pixlar. Kontrollerat även med simulerade skyddsytor på 59 px vid sidorna och 21 px nedtill. App och toppfält använder hela bredden, samtidigt som knapparna skyddas och tabellen kan scrollas.

Detta är inte testat på en fysisk iPhone. iOS hemindikator och webbläsarens egna kontroller styrs av telefonen.

Bakgrund till viewport-inställningen: https://webkit.org/blog/7929/designing-websites-for-iphone-x/

Inte publicerat av assistenten.

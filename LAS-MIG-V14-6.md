# TC Boden v14-6 – scrollning i planeringsappens liggande läge

Installera ovanpå v14-5 genom att ersätta `app/planering-app/style.css` och publicera om sidan på Netlify.

I liggande läge kan planeringsytan nu scrollas både nedåt/uppåt och i sidled. Veckans rader har mer utrymme och uppgiftstext kan visas på två rader. Menyraden och veckoväljaren ligger kvar ovanför scrollningen. Datumkolumnen följer med när man scrollar nedåt och ligger kvar vid scrollning i sidled. Stående läge behåller sin kompakta veckovy.

Pull-to-refresh fungerar vid planeringens överkant. När man är längre ned i planeringen används neddragningen för vanlig scrollning tillbaka upp.

Ingen SQL, nya beroenden eller miljövariabler behövs. Efter publicering: öppna appen med internetuppkoppling och starta om appen vid behov så att den nya versionen laddas.

Kontroller: godkänt produktionsbygge och TypeScript, CSS-parsning, isolerad webbläsarkontroll av samma app-CSS i 844×390, 667×300 och 390×844. Scrollpositionerna i båda riktningarna och fast toppmeny verifierades. Befintlig touchhantering kontrollerades isolerat för scrollning och pull-to-refresh. Inte testat på fysisk iPhone/Android.

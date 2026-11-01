# TC Boden v13 – luftigare administratörsverktyg på mobil

Installera ovanpå v12: ersätt motsvarande filer i repositoryt och publicera en ny deploy. Paketet innehåller app/layout.tsx, app/admin-activity.tsx, app/update-v13.css och denna instruktion. Ingen SQL-migration, miljövariabel eller nytt beroende krävs.

Aktivitetsloggens mobilvy får staplad rubrik/beskrivning och knappar, rymligare filter med tydliga kanter samt loggkort med fältnamn i stället för en bred tabell. Långa värden radbryts. På bred dator behålls tabellen. Filtrering, sidbyte, återställning och bekräftad rensning är oförändrade.

Flikknapparna i Administratörsverktyg använder bredd efter innehållet och får bryta till fler rader vid behov. Hela Säkerhetskopiering ryms utan att sticka ut. Backupinställningarnas intervall/tid och anslutningsknappar staplas på smal mobil.

Produktionsbygge inklusive TypeScript och CSS-syntax godkända. Visuell kontroll på faktisk mobil/webbläsare i båda teman återstår eftersom webbläsare saknas i utvecklingsmiljön. Ingen publicering på den riktiga sidan har gjorts.

Den väntande notis- och hjälprutefixen ingår inte i detta paket; de ligger fortsatt i kodningsminnet. Den tidigare separata bakåtpilsfixen finns kvar som separat paket.

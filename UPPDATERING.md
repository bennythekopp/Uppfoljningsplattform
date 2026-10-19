# Rättning: Spara som PDF hämtar en riktig PDF-fil

Ersätt filerna i paketet på samma sökvägar i GitHub och publicera via Netlify.
Ta även med hela den medföljande mappen `public/vendor/`.

Ingen ny SQL-migrering behövs för denna rättning. Den bygger vidare på föregående uppdatering med 0020.

Spara som PDF skapar nu PDF-filen direkt och startar hämtningen utan att öppna utskriftsdialogen. Skriv ut använder fortfarande den vanliga utskriftsdialogen.

Filen döps till `Personens namn_Protokolltyp_ÅÅMMDD.pdf`. Datumet hämtas från bedömningen; för vanlig elevbedömning används dagens datum. Äldre protokoll behåller sina bedömningsdatum.

Funktionen finns på elevbedömning, KP1, KP2, Examen, individuell uppföljning och historiska protokoll. Samma A4-underlag används med kommentarer och bedömningar.

# TC Boden v14-5 – planeringsrutor i ändringsförslag och enhetlig sidomeny

Installera ovanpå v14-4. Ersätt filerna i ditt befintliga projekt och publicera en ny deploy. Ingen ny SQL, miljövariabel eller beroende behövs för denna rättning. V14-4:s migration 0043 ska redan vara installerad.

## Förslagens utseende

- Nuvarande och föreslaget innehåll använder samma cellklasser, textvisning och färgfunktioner som den vanliga planeringen. Gäller översikten, vald ruta på hemsidan och appens detaljruta.
- Turernas namn visas utan loggens suffix med färgkod. Turer med samma namn men olika färger behåller rätt färg genom sparade turvärden/logguppgifter.
- Manuella färger och uppgiftsfärger visas som färgade rutor. Text, radbrytningar, tomma värden och avsiktligt borttagen färg behålls. Uppgifternas fritext bearbetas inte som turkoder.
- Äldre förslag utan sparad uppgiftsfärg använder rutans nuvarande färg som reserv. Nya förslag sparar den befintliga färgen vid förslagstillfället även om förslaget inte ändrar färgen.
- Vita/grå neutrala turer anpassas till mörkt läge på samma sätt som planeringen. Inställningar som tonar ned starka cellfärger gäller även förslagen.
- Återtagning, behörigheter, antal och mejlregler från v14-4 behålls. Inga nya periodiska nätverksanrop har lagts till.

## Sidomenyn

- Planeringens egna 220 px-regler och avvikande menytext-/profilregler är borttagna ur planning.css. Alla sidor använder gemensamma 280 px i datorvyn.
- Den gemensamma bredden skyddas mot att senare inläst modul-CSS ändrar måtten. Mobilens befintliga gemensamma menybredd behålls.
- Profilknapparna ligger kvar bredvid namnet. Endast listan mellan avdelarna skrollas.

## Verifiering

- Produktionsbygge/TypeScript och CSS-syntax godkända.
- Tester av färger/etiketter för turer, sparade turvarianter, stabila id:n, manuella färger, uppgiftstext/radbrytningar, tomma värden, borttagen färg, Semester och äldre data godkända.
- Befintliga isolerade API-/databas-/mejltester godkända; inga riktiga mejl skickades.
- Isolerad webbläsarkontroll med projektets faktiska CSS och renderade förslagskomponent: 280 px både med och utan planeringsvyn, profil på en rad, endast den nedre listan rullar, samt synliga färger utan färgkodstext.
- Verklig drift och fysisk mobil har inte ändrats eller testats av assistenten. Publicera paketet och kontrollera på dina enheter.

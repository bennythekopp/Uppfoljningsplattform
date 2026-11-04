# V17.3 – notisbjällra i appen samt V17.1 och V17.2

Paketet läggs ovanpå V17 och innehåller samtliga filer från V17.1 och V17.2 samt den nya bjällran. Tidigare delpaket behöver inte läggas in separat. Ersätt filerna på motsvarande sökvägar och publicera på nytt i Netlify. Ingen ny SQL, miljövariabel eller pushnyckel behövs.

## Nytt

Planeringsappens topprad visar Exportera → Notisbjällra → Kugghjul. Bjällran visar samma behörighetsstyrda notislista och lässtatus som på hemsidan, med antal olästa, datum och färgade före/efter-värden där sådana finns. Anropen använder planeringsappens egen inloggningscookie. Visa i planeringen/Visa ändringsförslag öppnar berörd vecka och detaljruta i appen. Redigering/godkännande får fortsatt göras på hemsidan enligt tidigare behörigheter. Bjällran kan användas utan att telefonpush har godkänts. Listan uppdateras vid öppning och via befintlig aktivitetsstyrd minutkontroll.

## Tidigare rättningar som ingår

- V17.1: inga schemaändringsnotiser till den som själv ändrar sitt eget schema. Andras ändringar av personens schema aviseras enligt tidigare val.
- V17.2: ovalt notisreglage, av/grått till vänster och på/rött till höger.
- Ny cacheversion tcpa-shell-v17-3 för appgränssnittet. Öppna med uppkoppling och stäng/öppna appen vid behov efter publicering. Ingen utloggning behövs för uppdateringen.

## Kontroll

Körda isolerade tester av verkliga funktionsdelar: rätt appsessionsheader för GET och läsmarkering, uppdaterad lässtatus, säker lokal datum-/kolumnlänk, oförändrad öppningshändelse på hemsidan och rätt detaljruta efter inläsning. Service-worker-syntax kontrollerad. Paketet kontrollerat för att båda tidigare rättningarna ingår. Fullständigt produktionsbygge, fullständig TSX-typkontroll och visuell kontroll i webbläsare/på telefon har inte körts i denna miljö. Inte publicerat av assistenten.

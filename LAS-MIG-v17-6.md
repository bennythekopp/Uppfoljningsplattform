TC Boden v17.6 – samlad uppdatering ovanpå V17

Innehåller samtliga uppdateringar från v17.1–v17.5 och följande rättningar:
- Appens bjällra ligger mellan Exportera och kugghjulet, centrerad på samma rad. Webbversionens fasta position återställs i apphuvudet.
- Ändringsförslagsnotiser visas bara på hemsidan för användare med redigeringsbehörighet i planeringen. De ingår inte i appens lista eller räknare.
- Administratören får fortfarande notiser om någon annan ändrar administratörens eget schema, enligt notisinställningarna. Egna ändringar ger ingen notis till en själv.
- Utropstecken för väntande ändringsförslag i planeringen finns kvar.

Packa upp och ersätt motsvarande filer i projektet. Kräver tidigare V17 inklusive V16. V17.5 behöver inte läggas in separat.
Ingen ny SQL, nya nycklar eller nya miljövariabler behövs utöver V17:s tidigare krav. Publicera därefter projektet på nytt.

Verifiering: automatiska tester av åtta kombinationer av app/webb, session och behörighet; spärrad läsmarkering av appens förslagsnotiser; schemanotiser kvar. Syntaxkontroll av ändrade TS/TSX-filer. Full projektbyggnad och kontroll på fysisk telefon har inte körts. Ingen publicering har gjorts.

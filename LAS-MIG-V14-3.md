# TC Boden v14-3 – ändringsförslag och samlad sidomenyfix

Installera ovanpå v14. Paketet ersätter även båda tidigare sidomenyfixarna (v14-1 och v14-2). Ersätt motsvarande filer i projektet och publicera en ny deploy. Ingen ny SQL eller miljövariabel krävs för detta paket. V14:s tidigare migration 0042 måste fortfarande vara installerad.

- Sidomenyn är 280 px bred på dator; långa fasta menynamn ryms. Bara den nedre modul-/personlistan mellan avdelarna rullar. Fasta menyer och användarprofil ligger kvar.
- Knappen Ändringsförslag visas mellan Operativa pass och + Kolumn i den fullstora planeringsmodulen, även för läsbehöriga och när listan är tom. + Kolumn visas fortsatt endast för redigerare.
- Knappen hämtar alla aktuella väntande förslag i planeringen, även utanför det valda året. Person, fullständigt datum, författare, tidpunkt, ursprungligt/föreslaget innehåll och uppgiftsfärg visas i den befintliga dialogen.
- Alla med tillgång till Planering får läsa. Utan rätt modulåtkomst blockeras serveranropet. Endast redigerare på hemsidan kan godkänna/slopa; appsessioner får fortfarande inte granska eller direktredigera. Rätt att läsa ger inte rätt att föreslå.
- V14:s övriga ändringar, databasvila och säkra sparning behålls. Inga extra periodiska bakgrundsanrop har lagts till.

Verifiering: Next.js-produktionsbygge/TypeScript samt isolerade API-tester för läsbehörig Chef utan förslagsrätt, alla år, endast pending, återkallad modulåtkomst och spärr mot granskning/förslag. CSS-syntax kontrollerad i sidomenyleveransen. Visuell webbläsarkontroll återstår. Inga riktiga uppgifter eller mejlutskick ändrades. Inte publicerat av assistenten.

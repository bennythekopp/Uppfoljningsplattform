# TC Boden V21.1 – dokumentens sidlayout

Lägg uppdateringens fyra app-filer ovanpå V21 och bygg/publicera projektet på vanligt sätt. Ingen ny SQL, inget nytt beroende och inga nya miljövariabler behövs. V21:s tidigare installationskrav gäller fortfarande. Paketet är källkod, inte en färdig statisk Netlify-sida.

Rättar två fel: befintliga sidmellanrum tappade display:block vid omberäkning; heltalsavrundad pappersbredd skapade en växande positionsavvikelse på långa dokument. Samma mått används nu även för klickplacering.

Utskrift och PDF använder nu dokumentredigerarens verkliga Tiptap-layout och sidberäkning. Varje utskriftssida visar motsvarande del av den beräknade layouten. Formateringen fryses före utskrift så särskilda utskriftsregler inte räknar om raderna. Flikurval och sidinställningar bevaras. Word-exporten är oförändrad; Word kan göra egna radbrytningar beroende på typsnitt och programversion.

Kontroller: TypeScript, produktionsbygge och V21-testsvit. Webbläsarprov använder verklig editor och verklig utskriftslayout med syntetiska dokument: 90 korta stycken, ett 39 100 tecken långt stycke samt tabell/manuell sidbrytning. Sidantal och textradernas geometri jämförs. Inga produktionsdata ändrade. Fysisk utskrift och telefoner har inte verifierats; välj dokumentets pappersformat, 100 % skala och stäng av webbläsarens egna sidhuvuden/sidfötter.

Inte publicerat av assistenten. Ladda om sidan efter publicering.

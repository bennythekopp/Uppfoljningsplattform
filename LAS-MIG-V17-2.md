# V17.2 – rättat notisreglage

Lägg filerna ovanpå V17/V17.1 och publicera på nytt i Netlify. Ingen SQL eller ändring av pushnycklar behövs. V17.1:s regel om inga egna schemaändringsnotiser påverkas inte.

Notiser på/av visas som ett ovalt reglage med en rund vit knapp: vänster/grått är av, höger/rött är på. Allmänna knappstilar ska inte kunna göra reglaget fyrkantigt. Samma rättning gäller webbens notisreglage. Befintlig tillstånds-, aktiverings- och sparlogik behålls; Mörkt läge-reglaget påverkas inte.

Appens service worker får en ny cacheversion för gränssnittet. Efter publicering, öppna appen med uppkoppling och stäng/öppna den igen vid behov för att läsa den nya stilen. Logga inte ut enbart för uppdateringen, eftersom utloggning avregistrerar telefonens push.

CSS-reglerna är granskade och service-worker-syntaxen kontrollerad. Ingen visuell webbläsar-/telefonkontroll eller fullständigt produktionsbygge har körts för denna stilrättning. Inte publicerat av assistenten.

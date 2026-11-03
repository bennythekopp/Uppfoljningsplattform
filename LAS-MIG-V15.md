# TC Boden v15 – uppdateringar från kodningsminnet

Paketet innehåller endast uppdaterade filer. Lägg dem ovanpå v14-7. Det fungerar även om den separata färgväljarrättningen v14-8 redan lagts in. Tidigare rättningar och provresultat från v14-7 behålls.

## Installation

1. Säkerhetskopiera databasen.
2. Kör `netlify/database/migrations/0044_user_login_block.sql` i databasen, efter tidigare uppdateringar till och med 0043. Uppdateringen lägger till ett fält för tillfällig inloggningsspärr och kan köras igen.
3. Ersätt filerna med samma sökvägar och publicera som vanligt. Inga nya paket eller miljövariabler behövs.

Ingenting har publicerats eller ändrats i den riktiga databasen av assistenten.

## Infört

- Planeringsloggen visar turernas sparade färger och utseende i både översikten och detaljerna. Tidigare och nytt/föreslaget värde behåller sina egna färger; råa färgkoder ersätts av färgrutor. Slopade förslag är fortfarande slopade.
- Försenade påminnelser och att göra-punkter får röd rubrik, beskrivning och förfallotid. Klarmarkeringstiden sparas på servern, och rödfärgen behålls i historiken. Poster avklarade i tid blir inte röda senare. Tider bedöms i Europe/Stockholm.
- Exportera finns i webbplaneringen och som nedladdningssymbol i appens toppmeny. Välj denna vecka, denna månad eller egen period, och Min planering eller samtliga personer och gemensamma kolumner. Format: PDF, Excel (.xlsx), Apple Kalender (.ics), Android / Google Kalender (.ics). Exporten respekterar inloggning och modulbehörighet och väntar på pågående sparningar.
- Färgväljaren Egen färg i appen har egen storlek och avstånd, med radbrytning vid behov. Ingen färg och förvalda färger behålls.
- Appen använder hela tillgängliga skärmytan i liggande läge och behåller scrollning åt båda håll och säkra skärmkanter.
- Spärra med stängt lås och Lås upp med öppet lås finns längst ned till vänster i Redigera användare. Ingen separat kontostatus i popupen. Ett spärrat konto får meddelandet Kontot spärrat när rätt inloggningsuppgifter anges. Spärrningen avslutar alla befintliga sessioner, men bevarar kontot och dess data.
- Användaröversikten reserverar en fast låskolumn. Lås visas bara för spärrade konton. På mobil ligger det mellan namnblocket och redigeringsknappen; på dator mellan namn och roll. Eget administratörskonto kan inte spärras från den egna sessionen. Andra administratörer kan spärras utan att deras roll eller lösenord kan ändras via de vanliga skyddade funktionerna.

## Praktiska gränser

Kalenderexport är en importfil och synkroniserar inte automatiskt. Turernas sparade arbetspass används, med svensk sommar-/vintertid och nattpass över midnatt. Turer utan arbetstider och fristående uppgifter blir heldagshändelser. Kalenderprogrammens färger kan skilja sig från planeringen.

Exporten omfattar högst 367 dagar och 20 000 rader åt gången. Mycket lång enskild text som inte ryms på en PDF-sida ger ett felmeddelande; välj Excel för hela texten.

För äldre avbockade poster utan lagrad klarmarkeringstid används senaste ändringstiden som uppskattning. Exakt historisk klarmarkeringstid går inte att återskapa om posten redigerats efteråt. Nya klarmarkeringar får korrekt tid sparad oberoende av senare redigering.

## Kontroll

- Produktionsbygge och TypeScript.
- Integrationstest mot isolerad PostgreSQL-kompatibel testdatabas: spärrning/upplåsning, sessioner, loginmeddelande, roller och appsessioner, svenska tidsgränser och sparad klarmarkeringstid, exportformat, datumgränser och modulbehörighet.
- Excel läses tillbaka och kontrolleras för turtext och färg. PDF-filen har öppnats och kontrollerats visuellt. Kalenderfilen kontrolleras för nattpass, tidszon, radbrytning och specialtecken.
- Verklig loggkomponent renderas för att kontrollera sparade färger och frånvaro av färgkodstext.
- Appens nya utseende har inte verifierats i webbläsare eller på fysisk iPhone/Android: förhandsvisningstjänsten kunde inte starta projektet i denna miljö. Kalenderimporten har inte provats i de fysiska kalenderapparna.

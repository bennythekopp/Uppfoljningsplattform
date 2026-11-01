# TC Boden – uppdatering v8

Datum: 2026-10-31

## Installera

1. Detta paket uppdaterar den befintliga hemsidan med v5, v6 eller v7. V7:s filändringar ingår också. Paketet är inte ett fristående nytt projekt.
2. Packa upp ZIP-filen. Lägg mapparna `app`, `lib`, `netlify` och `scripts` i projektets rot bredvid `package.json`. Ersätt motsvarande filer och behåll undermapparna.
3. **Om v7 redan fungerar med databasuppdatering 0040 behövs ingen ny SQL-migration.** Om du uppdaterar från v5/v6: tillämpa `netlify/database/migrations/0040_admin_notices_and_backup_time.sql` efter 0039 enligt v7-anvisningen. Den filen ingår även här. Kör inte om äldre migrationer.
4. Ladda upp filerna till GitHub och låt Netlify bygga om. Inga nya paket eller miljövariabler behövs.
5. Ladda om sidan och öppna Administratörsverktyg. Kontrollera Allmänt och Planering samt ett sidbyte i Planeringslogg.

## Fullbreddsavsnitt

- Avsnitten ligger under varandra i en kolumn och fyller innehållsbredden på både dator och mobil.
- Höjder följer innehållet. Onödiga minimihöjder och stora tomma ytor har tagits bort.
- Allmänt har denna stabila ordning, från de kortaste avsnitten: Förhandsgranska gränssnitt, Årets individuella uppföljning, Modulsynlighet, Notiser.
- Planering har denna ordning: Mailinställningar, Planeringsbehörighet, Planeringslogg.
- Ordningen ändras inte plötsligt när fler användare eller loggposter tillkommer.
- Mailfält delar rad när skärmen har plats. Modulsynlighetens användarval radbryts i en kompakt lista. Själva huvudavsnitten ligger alltid under varandra.
- Flikordning, Allmänt som startsida, befintliga fält, sparning och behörigheter behålls.

## Planeringslogg med sidor

- Fem loggposter per sida som standard. Välj 5, 10 eller 25 poster per sida.
- Föregående, Nästa och numrerade sidknappar ersätter Visa äldre. Sidbyte ersätter raderna i listan.
- Antal poster, vilka poster som visas och aktuell sida visas vid sidknapparna.
- Långa värden sammanfattas på två rader. Visa detaljer öppnar hela händelsen, inklusive tidigare och nytt värde, person, datum, kolumn och fält. Informationen har inte tagits bort.
- Sidorna använder samma tidsgräns tills du väljer Uppdatera. Nytillkomna händelser flyttar därför inte runt poster i den pågående visningen. Uppdatera hämtar aktuell logg och återgår till sida 1.
- Servern sorterar på tid och unikt id. Poster med samma tidsstämpel hamnar i en entydig ordning och försvinner inte vid sidbyte.
- Endast administratörer kommer åt planeringsloggen. Den äldre API-varianten finns kvar för redan öppna äldre klienter.
- Mobilvyn visar samma information i staplade rader. Detaljvyn kan rulla om en enskild ändring innehåller mycket text.

## Verifiering

- Produktionsbygge inklusive TypeScript godkänt.
- API-/PostgreSQL-test med 37 poster som har samma tidsstämpel: samtliga poster återfinns exakt en gång över sidorna.
- Testat sidstorlekar, framåt/bakåt, sista sidan, tom logg, totalantal, uppdatering, fast tidsgräns, ogiltiga parametrar samt behörighet och rollförhandsvisning.
- Befintliga backup-/Google Drive-/exporttester och planeringstester godkända. Inlineformulärens fält och samtliga 29 Avbryt-knappar har också kontrollerats.
- Inga riktiga konton eller uppgifter har ändrats av testerna. Uppdateringen är inte publicerad på den riktiga Netlify-sidan av assistenten.
- Visuell webbläsarkontroll kunde inte köras: förhandsvisningsmiljön skickar startargument som projektets Next.js-version inte accepterar. Kontrollera därför utseendet efter uppladdning.

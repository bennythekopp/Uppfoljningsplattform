# TC Boden – uppdatering v7

Datum: 2026-10-31

## Installera

1. Detta är ett uppdateringspaket för den befintliga hemsidan med v5 eller v6. Det innehåller även filändringarna från v6. Det är inte ett fristående nytt projekt.
2. Packa upp ZIP-filen. Lägg mapparna `app`, `lib`, `netlify` och `scripts` i projektets rot, bredvid `package.json`, och ersätt motsvarande filer. Behåll filernas undermappar. ZIP-paketet har färre än 100 filer.
3. Tillämpa **`netlify/database/migrations/0040_admin_notices_and_backup_time.sql` efter 0039** i samma PostgreSQL-databas som hemsidan använder. Kör bara nya migrationer. Om Netlify tillämpar migrationerna åt dig, kontrollera att 0040 finns med i driftsättningen. På separat PostgreSQL körs filen manuellt före den nya koden tas i bruk.
4. Ladda upp ändringarna till GitHub och låt Netlify bygga om sidan. Inga nya miljövariabler eller paket behövs.
5. Ladda om sidan. Administratörsverktyg ska öppnas på **Allmänt**. Kontrollera en notis och spara önskat backupklockslag i Säkerhetskopiering.

## Administratörsverktyg

Flikar: Allmänt, Aktivitetslogg, Användare, Planering, Säkerhetskopiering. Allmänt ligger först och är startsidan; övriga ligger i svensk alfabetisk ordning.

- Allmänt: Förhandsgranska gränssnitt, Modulsynlighet, Årets individuella uppföljning och Notiser.
- Planering: Mailinställningar, Planeringslogg och Planeringsbehörighet visas som modulrutor med befintligt innehåll direkt på sidan. Ingen extra öppningsknapp eller popup för huvudinnehållet. Sparning, sökning, Visa äldre, mottagarval och behörigheter behålls.
- Säkerhetskopiering ligger kvar i egen flik.
- IU-texten använder ”pågående år”. Själva nollställningen gäller fortfarande aktuellt år i svensk tid och har kvar sin bekräftelse.
- Roll, redigering och borttagning har fasta kolumner för alla användare. Administratörskonton är fortsatt skyddade; deras åtgärdsknappar visas inaktiva på samma plats.

## Notiser

- Hantering flyttad från bjällran till Allmänt. Bjällran visar och markerar mottagna notiser som lästa.
- Skapa/redigera text, valfri rubrik, mottagarroller samt start- och sluttid i svensk tid. ”Visa utan slutdatum” stöds. Gamla notiser behålls utan slutdatum.
- Servern visar bara notiser inom perioden och för rätt roll. Bjällran kontrollerar nya notiser varje minut och vid öppning; en redan inläst notis döljs vid sluttiden.
- Administratören kan ta bort notiser med separat bekräftelse. Läskvittona för den borttagna notisen tas då också bort.
- ”Läst av” öppnar en popup med personernas namn och lästid. Läsning registreras när mottagaren klickar på notisen. Administratörer kan se kvittona även efter att notisen slutat visas.
- Ändrad text/rubrik/mottagarroller nollställer läskvittona, eftersom det är nytt innehåll. En ändring av bara perioden behåller kvittona.
- Samtidiga ändringar skyddas med revisionskontroll. Förhandsvisning är fortsatt skrivskyddad.

## Aktivitetslogg

Administratörer kan rensa hela aktivitetsloggen efter bekräftelse. Detta tar även bort återställningskopiorna som finns i loggposterna. Sparade bedömningar och protokoll behålls. Rensningen registreras som en ny logghändelse.

## Backupklockslag

- Klockslag visas även för timintervall. Välj tid och spara inställningarna. Dagliga och veckovisa körningar använder fortsatt vald tid/veckodag.
- Timintervallen 1/6/12/24 timmar utgår efter sparning från valt klockslag i **Europe/Stockholm**, även vid byte mellan sommar- och vintertid.
- Befintliga intervall fortsätter som tidigare tills inställningarna sparas. Automatiken kontrolleras var femte minut; en körning kan därför starta några minuter efter valt klockslag. En pågående export avslutas först.
- Google Drive-anslutning, samtycke och val av filer behålls.

## Sparat kodminne som ingår

- Tydligt avstånd och separata klickytor mellan ”Redigera momentets text” och ”Ta bort momentets bedömning”, med radbrytning på små skärmar.
- ”Senast använda” i planeringens färgväljare: högst fem unika färger, senaste först. Återanvänd färg flyttas först; Ingen färg läggs inte till. Sparas per konto i webbläsaren och gäller där färgväljaren är tillgänglig. Ordinarie färgpalett och behörigheter behålls.
- Alla 29 befintliga native Avbryt-knappar har gemensam sekundär knappstil, tydliga klickytor och `type="button"`. Detta gäller även tilldela/byta/ta bort handledare. Funktionsknapparnas befintliga åtgärder behålls.

## Verifiering

Godkända kontroller: produktionsbygge inklusive TypeScript; API-/databastester för notishantering, period/rollfiltrering, läskvitton, revisionskonflikter, radering, skydd mot främmande origin och rollförhandsvisning, loggrensning och backupklockslag; befintliga backup-/Google Drive-/exporttester; handledartester; planeringsbehörighet och veckogränser; tester av färghistorik och sommar-/vintertid; serverrendering av inlineformulär och kontroll av samtliga Avbryt-knappar.

Google Drive anropades med testdubblar; inga riktiga konton eller uppgifter ändrades. Visuell kontroll i webbläsare kunde inte köras eftersom den tillgängliga förhandsvisningsmiljön saknar projektets beroenden. Paketet har inte publicerats på den riktiga Netlify-sidan av assistenten.

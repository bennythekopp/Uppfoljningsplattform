# TC Boden – samlad uppdatering 29 oktober 2026

**Denna leverans innehåller även version 2. Följ UPPDATERING-29OKT-V2.md för installation till och med migrering 0034. Texten nedan beskriver föregående deluppdatering och Operativa pass.**

## Installation
Den kompletta zipfilen innehåller hela projektet och samtliga tidigare levererade ändringar till och med 28 oktober samt denna uppdatering. Uppdateringsfilen innehåller bara ändringar jämfört med Komplett-28okt. Utgår du från en äldre version ska du använda komplettfilen för att inte missa mellanliggande uppdateringar.

1. Lägg in filerna i GitHub-projektet.
2. Kör databasfilerna i nummerordning till och med `0033_operational_passes.sql`. Har 0032 redan körts behövs bara 0033. Behåll befintlig databas och inloggningsuppgifter. Migrering 0033 kan köras igen utan att sparade inställningar försvinner.
3. Gör en ny Netlify-deploy. Ingen publicering eller ändring i din riktiga databas har gjorts under utvecklingen.
4. Öppna Planering → Operativa pass. Som administratör: öppna Turer som räknas, välj operativa turer och välj hur nattpass räknas. Spara. Innan detta är inställt visas ingen påhittad statistik.

## Operativa pass
Hela det valda året visas, med antal per person och månad. Varje månad kontrolleras mot de föregående fem månaderna, även över årsskifte. Vanliga godkända turändringar räknas; väntande ändringsförslag räknas inte.

För en avslutad månad under 30 på sex månader får själva månadssiffran en fylld röd statusruta och antalet som saknas står under. Pågående/framtida månader får gul ruta och antal saknade om den inlagda planeringen inte når 30. Övriga månadsrutor är neutrala. Under aktuell månad visas Minst N om personen uppfyller månadens behov. N är 30 minus antalet under föregående fem månader, lägst noll. 6 mån och Status sammanfattar senaste avslutade sexmånadersperioden för valt år, med Risk om framtida planering har ett underskott. Ingen förklaringstext finns nere till vänster.

Räkneregler styrs av administratören och sparas på servern. Varje uttryckligen vald tur räknas som ett pass; ej valda turer räknas inte. Olika varianter av samma turnamn behåller sina separata identiteter och färger. Fritextturer som finns sparade i det hämtade planeringsunderlaget kan också väljas. Blandade operativa/administrativa turer ska väljas uttryckligen om de ska räknas.

Nattregeln väljs uttryckligen: en gång per vald datumsruta eller en gång per sammanhängande vald nattperiod. Ingen regel väljs åt användaren. Äldre tidsperioder hämtas från daterade grundscheman och manuella avvikelser. Beräkningen utgår från schemat, inte från separat bekräftad närvaro; kontrollera att schemat återger faktiskt utförda pass om detta ska användas som genomförandestatistik. Underlaget uppdateras var 30:e sekund medan rutan är öppen.

Instruktörer och chefer med tillgång till Planering kan läsa översikten. Bara administratörer kan ändra räknereglerna. Rollförhandsvisning är skrivskyddad. Planeringsloggen är fortsatt enbart tillgänglig för administratörer, både knapp och API.

## Examinationspåminnelse
Påminnelsen `IU 4-mån ”Förnamn”` är gemensam och skapas vid sparad godkänd examination. Datumet är fyra kalendermånader efter senaste registrerade genomförandedatumet i examinationen, inte sparningsdagen. Månader med färre dagar kläms till sista dagen. Omsparning eller nytt godkännande av samma examination skapar inte dubbletter och skriver inte över en redan skapad påminnelse. Befintliga påminnelser ändras inte retroaktivt av denna uppdatering.

## Tidigare sparade krav som bevaras
- Mobilinloggning har minst 16 px i fälten, normal initial skala och fortsatt manuell zoom.
- Gemensamt/Privat ingår inte i nyckeln för sidbytesanimationer, så växling sker direkt i Anteckningar, Att göra och Påminnelser.
- Turlista hör till respektive schemagrupp. Befintlig kopieringsknapp kopierar turernas färger, pass och övriga egenskaper utan att ändra källschemat.
- Papperssidor, A2/A3/A4/A5, marginalinställningar och export/utskrift i dokumentredigeraren bevaras.
- Stängda moment döljer beskrivning, manuella rollstyrda bjällrenotiser, kompakt transparent logga och borttagen administratörslänk bevaras.
- Pull to refresh med sparningsskydd, kategorier och mjukare drag/släpp, scenariernas radåtgärder samt en knapp för nytt moment bevaras.
- Planeringsmodul, administratörsstyrd modulåtkomst, chefsrollens läsvy, nattpilar, separat planeringslogg, färgmarkeringar, flera datumstyrda aktiva scheman och introduktionschecklistan bevaras.
- Ändringsförslag med granskning och Resend-samlingsmail från 28 oktober bevaras. Se UPPDATERING-28OKT-ANDRINGSFORSLAG.md för mailinställningarna. För Resend används RESEND_API_KEY, PLANNING_MAIL_FROM och APP_ORIGIN i Netlify.

## Verifiering
Godkänd typkontroll och Next.js-produktionsbygge. Befintlig planeringstestsvit samt nya funktionstester för årsskifte, månadsbehov, risk/underskott, valbar nattregel, fyramånadersdatum, skottår, pappersstorlekar/marginaler och fristående turlistekopior. Lokalt PostgreSQL-kompatibelt API/databastest för administratörsregler, läsroller, revisionskonflikter, föregående års data, gemensam examinationspåminnelse, dubblettskydd och omkörningsbar migrering.

Ingen ny visuell webbläsarkontroll har genomförts i denna körning. Den publicerade sidan och produktionsdatabasen har inte berörts. Inga riktiga mail har skickats.

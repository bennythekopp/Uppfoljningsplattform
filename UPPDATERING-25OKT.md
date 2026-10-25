# TC Boden – uppdatering 25 oktober 2026

## Installation
1. Kör `netlify/database/migrations/0031_planning_colors_and_person_schedules.sql` efter 0030 i samma databas som sidan använder.
2. Ersätt projektets filer med uppdateringspaketet och publicera därefter den nya versionen via GitHub/Netlify. SQL och den nya koden hör ihop.
3. Ladda om sidan när publiceringen är färdig.

Migreringen är omkörbar. Bedömningar, dokument och sparade planeringstexter raderas inte. Den befintliga schemahistoriken omvandlas till daterade kopplingar per person.

## Planering – färgmarkering
- Varje Uppgift-ruta har en liten palettknapp vid fokus/hover, alltid åtkomlig på pekskärm. Välj förvald färg, Egen färg + Använd eller Ingen färg.
- Personens Tur-ruta får samma bakgrundsfärg för samma dag. Turlistans definition ändras inte.
- Semester använder Semester-turens sparade färg i båda rutorna. Om Semester väljs efter en manuell färg tas den tidigare manuella färgen bort. En senare manuell färg kan åter ändra båda rutorna.
- Ingen färg återgår till Semester-färgen när turen är Semester, annars till rutornas vanliga utseende.
- Även de fristående fritextkolumnerna kan färgmarkeras. Färgerna sparas separat från texten, visas i läsvy och i panelmodulen och loggas i Planeringsloggen.
- Samma redigeringsbehörighet gäller för text och färg. Endast administratörer kan läsa Planeringsloggen.

## Grundschema – flera aktiva scheman
- Flera grupper kan vara aktiva samtidigt. De visas under Nuvarande schema med inplacering överst och kompakta grundscheman nedanför.
- Aktivering görs i Turlista med Aktivt schema och Spara ändringar. Schemat börjar gälla från gruppens startdatum.
- Personkopplingarna är daterade och får inte överlappa. När Anna finns i A och sedan i B från 2027-01-04 slutar A för Anna 2027-01-03. Övriga personer i A fortsätter.
- Redan inlagda senare övergångar bevaras: ett nytt mellanschema gäller fram till nästa daterade övergång för personen.
- Tilldelning eller borttagning av en person i ett redan aktivt schema gäller tidigast idag, eller från schemats start om startdatumet ligger framåt i tiden.
- Personernas giltighetsperioder bevaras internt men visas inte vid namnen i inplaceringen. Planering och Grundschema-modulen på panelen väljer schemat per person och datum.
- Ett databasskydd stoppar överlappande personperioder även vid direkta skrivningar till databasen.

## Introduktion för nya instruktörer
- Hela checklistan med innehåll visas direkt i modulen på instruktörspanelen, utan begränsning till fem steg.
- Punkter kan bockas av direkt och ändringen syns omedelbart. Framstegen sparas personligt som tidigare och återställs i vyn om sparandet misslyckas.
- Listan scrollas inuti modulen och anpassas till den sparade modulstorleken, även på mobil. Rubriken leder fortfarande till den fullständiga introduktionssidan.

## Kontroller
- TypeScript, planeringskontroller och produktionsbygge.
- API-/databaskontroller av datumbyten, flera grupper samma startdatum, bevarade senare övergångar, överlappningsskydd, migrering av äldre historik, omkörning och rollbehörigheter.
- Webbläsarkontroller på dator/mobil i mörkt/ljust läge: färger, Semester, egen färg, omladdning, läsvy, scrollning och personliga avprickningar.

## Sortering av turer i Turlista
- Administratören väljer Turlista och trycker Sortera vid Turer. Dra turerna i handtagen på vänster sida; raderna flyttas direkt med mjuk rörelse.
- Klar låser sorteringen. Spara ändringar sparar den nya ordningen i gruppens turlista.
- Samma ordning används i turväljaren i Grundschema och Planering när den uppdaterade turlistan gäller.
- Turer med samma namn behåller sina egna färger, tider och placeringar. Sparade bedömningar och tidigare planeringsperioder påverkas inte.
- Sorteringen behöver ingen ytterligare SQL utöver 0031 som ingår i paketet.

## Anpassad textstorlek på turer
- Turnamn anpassar automatiskt textstorleken till rutans bredd i Planering (även läsvy och panelmodul), Grundschema och turkodsfältet i Turlista.
- Alla sju veckodagar ryms i varje grundschemaruta och i redigeringen, utan sidscrollning. Kolumnerna är lika breda och två grundscheman ryms fortsatt bredvid varandra på datorn.
- Texten mäts om vid ändrad rutbredd, turnamn, textstorlek eller typsnitt. Korta namn behåller normal storlek; längre namn minskas. Fritexten i Uppgift påverkas inte.
- Den årliga inplaceringen behåller sidscrollning mellan datum; de sju veckodagarna i själva grundschemat ryms alltid. Ingen ytterligare SQL behövs.

## Radbrytning i Inplacering
- Långa turnamn radbryts i inplaceringens datumrutor med normal textstorlek. Radhöjden växer så hela texten ryms.
- Giltighetsdatumen under personernas namn är borttagna från Inplacering. Schemakopplingarna och datumreglerna används fortfarande internt.
- Planering, veckogrundschema och turkodsfälten behåller automatisk textstorlek. Ingen ytterligare SQL behövs.

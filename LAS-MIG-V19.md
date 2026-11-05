# TC Boden V19

Samlat uppdateringspaket för ett befintligt projekt med V17 eller senare. V18 och V18.1 ingår.

1. Om V18 saknas, kör `netlify/database/migrations/0047_planning_column_sync.sql` efter migration 0046 och före publicering. Om V18 eller V18.1 redan är installerad behövs ingen ny SQL.
2. Kopiera filerna från ZIP-paketet till motsvarande sökvägar i projektet, inklusive `next.config.ts` och filerna i `app/private-guides`.
3. Publicera och öppna planeringsappen igen. Appens cacheversion är V19.

## Ändringar

- Grundschema visar turens namn på första dagen i en serie och en sammanhängande pil åt höger. En ensam nattpil kan fortsätta in på följande dag.
- Hjälpen visar Planeringsinstruktion för användare med åtkomst till Planering. Både PDF och miniatyr kräver serverkontrollerad åtkomst.
- Konton utan modulåtkomst får en tom innehållsyta med åtkomst till kontomenyn.
- Ordna och Klar låser upp respektive låser användarens kolumnlayout. Dra i rubriken eller använd vänster/höger pil när draghandtaget är fokuserat. Dra i kolumnkanten eller använd vänster/höger pil när breddhandtaget är fokuserat. Layouten sparas per konto i aktuell webbläsare.
- PDF och Excel bygger på en tabell med datum som rader och planeringskolumner i ordning. Excelbredd och PDF-bredd anpassas till respektive format. Breda PDF-tabeller kan delas i kolumngrupper och mycket höga rader kan fortsätta på nästa sida. Kalenderexporten använder samma dataformat som tidigare.
- Färre hämtningar från elevöversikt och planering. Startsidan får modulbehörighet tillsammans med kontot. Den kompakta planeringen hämtar den egna kolumnen. Planeringens huvudvy och appen hoppar över administrativa export- och behörighetsfält.

## Verifiering

Produktionsbygge och TypeScript, regressionstester för Planering och förhandsvisning, åtkomsttest för PDF och miniatyr mot isolerad databas samt kontroll av nattserier, exportkolumner, färger och långa texter. PDF-provet renderades till bild. Excel-provet lästes tillbaka programmatiskt. Visuell jämförelse i verkliga webbläsare och Excel samt före-/eftermätning av Netlifys GB-hours återstår. Ingen publicering har gjorts.

# TC Boden v12 – full skärmyta i instruktörspanelen

Detta är ett litet tillägg ovanpå v11. Paketet innehåller bara två nya/ändrade kodfiler och denna instruktion:

- app/layout.tsx – laddar den nya stilmallen efter tidigare stilar.
- app/update-v12.css – gemensamt utrymme för instruktörspanelens översikt och samtliga moduler.
- LAS-MIG-V12.md – instruktioner.

## Installera

Packa upp filerna i roten av ditt befintliga v11-projekt och ersätt app/layout.tsx. Behåll alla övriga filer. Publicera en ny deploy i Netlify och öppna hemsidan igen.

Ingen ny SQL-migration, miljövariabel eller något nytt beroende behövs för v12. Om v11 inte är installerad måste den först installeras enligt LAS-MIG-V11.md, inklusive migration 0041 efter 0040. Kör inte om migrationen om den redan är tillämpad.

## Ändringen

Instruktörspanelens översikt och samtliga moduler får använda hela innehållsbredden mellan sidomenyn och skärmens högra kant, med samma desktopmarginaler som Planering. Den tidigare begränsningen på 1200 pixlar tas bort för dessa vyer. Innehållsytan kan använda återstående skärmhöjd och växa vidare när mer innehåll kräver vanlig skrollning.

Det gäller bland annat Dokument, Anteckningar, Att göra, Mallar, Anslagstavla, Introduktion, Påminnelser, Grundschema och Planering samt övriga moduler i instruktörspanelen.

Befintlig anpassad kortlayout, ordning, storlekar och responsiva kolumner behålls. Kort tvingas inte bli onödigt höga. Dokumentets pappersformat och utskriftens mått behålls. Sidomeny, mobilens fasta toppmeny och kontorad behålls. Den fristående planeringsappen påverkas inte.

Anteckningseditorns höjd förs genom pull-to-refresh-omslagen så att den kan använda återstående höjd och lång text skrollas inne i anteckningsytan.

## Kontroll

Produktionsbygge inklusive TypeScript och CSS-parsning godkända. Reglerna är begränsade till skärmvisning och instruktörspanelens vyer. Funktioner, autosparande, behörigheter och databasanrop ändras inte.

Visuell kontroll på en riktig webbläsare/telefon kvarstår: webbläsaren saknas i utvecklingsmiljön. Kontrollera översikten och modulerna på bred dator, smal dator och mobil i ljust/mörkt läge samt anteckningars höjd, dokumentskrollning och pull to refresh.

Förhandsbildens exempeldata och föreslagna kortplaceringar har inte hårdkodats; detta tillägg gäller skärmutrymmet.

Ingen publicering på din riktiga hemsida är gjord av assistenten.

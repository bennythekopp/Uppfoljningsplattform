# Rättning: centrerad text och färgade rutor i PDF och utskrift

Ersätt filerna från paketet på samma sökvägar i GitHub och publicera via Netlify.
Ta med den nya filen `app/print.css` och den uppdaterade `app/layout.tsx` som laddar den.

Ingen ny SQL-migrering behövs. Paketet bygger vidare på senaste uppdateringen med direkt PDF-hämtning.

Texten i gröna, gula och röda bedömningsrutor centreras både vågrätt och lodrätt. Samma färger används i PDF och vanlig utskrift. Statusrutorna i PDF-exporten återges så att textcentreringen inte påverkas av webbläsarens canvas-rendering.

Kontrollerat med faktiska nedladdade PDF-filer samt utskrift där webbläsarens bakgrundsgrafik var avstängd.

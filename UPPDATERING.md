# Uppdatering: PDF, årets IU och historik på dator

1. Ersätt filerna från paketet på samma sökvägar i ditt GitHub-repository.
2. Kör `netlify/database/migrations/0020_iu_annual_reset.sql` i samma databas där tidigare migreringar till och med `0019` är körda.
3. Publicera den nya versionen via Netlify. Ladda om sidan om gamla stilar ligger kvar i webbläsarens cache.

**Spara som PDF** finns intill **Skriv ut** på elevbedömning, KP1, KP2, Examen, individuell uppföljning och sparade historikprotokoll. Den använder samma A4-utskrift. Välj **Spara som PDF** i webbläsarens utskriftsdialog. Föreslaget filnamn är `Namn_Protokolltyp_ÅÅMMDD.pdf` (bedömningens datum, när det finns).

**Nollställ årets IU** finns i Administratörsverktyg → Användare och kräver administratör. Årets gröna indikatorer nollställs och åtgärden registreras i aktivitetsloggen; protokoll ligger kvar i historiken. En ny sparad bedömning efter nollställning kan åter ge grön markering.

Historikraderna på datorskärm har separata kolumner för protokoll, utskrift, PDF och borttagning. Mobilens tidigare upplägg behålls.

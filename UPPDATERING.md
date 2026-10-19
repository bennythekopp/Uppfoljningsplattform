# Uppdatering 19 oktober 2026 · Instruktörspanel

Detta paket innehåller uppdaterade och nya filer, inte hela webbplatsen.

1. Databasen ska vara uppdaterad till och med 0020.
2. Kör `0021_order_and_role_preview.sql` om den inte redan är körd.
3. Kör sedan nya `0022_instructor_panel.sql` en gång.
4. Ersätt/lägg till filerna i GitHub-repots rot, inklusive package.json och package-lock.json. Behåll övriga filer.
5. Låt Netlify bygga och publicera. Ladda därefter om sidan.

Kör inte om migrationsfiler som redan är tillämpade.

Instruktörspanelen har nu dokument, att göra-lista, Mallar (dokument och Outlook), anslagstavla, introduktion och personliga påminnelser. Layout, antal moduler, placering och storlek ändras direkt i redigeringsläget och behålls med Spara. Favoriter och snabbåtgärder är personliga. Menyn under avskiljaren ändras efter valt huvudområde.

Outlook-kalendern, Formulär och Min arbetsyta ingår inte. Outlook-mallar öppnar förifyllda utkast i Outlook på webben; inget mejl skickas automatiskt.

Även dagens tidigare fixar för autosparning, borttagna delmomentsräknare, åtkomst/loggar, sortering och rollförhandsvisning ingår.

Läs INSTRUKTORSPANEL.md för handhavande, installation och dokumentredigerarens praktiska begränsningar.

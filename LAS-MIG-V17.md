# TC Boden – V17, samlat med V16

Detta paket innehåller alla nya och ändrade filer från V16 samt de senaste ändringarna. Det kan läggas ovanpå v15.1 eller V16. Det är inte en komplett webbplats.

1. Kopiera paketets filer till motsvarande mappar i projektet och ersätt befintliga filer.
2. Kör `0045_notifications_and_people_visibility.sql` om V16 inte redan är installerat. Kör därefter `0046_user_preview.sql` en gång. Tidigare migreringar till och med 0044 måste finnas. Befintliga uppgifter bevaras.
3. Kör `npm ci`. V16:s beroenden och låsfil ingår.
4. För telefonpush följer samma nycklar och aktivering som beskrivs i LAS-MIG-V16.md. Inga nya nycklar behövs för V17.
5. Bygg och publicera på Netlify enligt den vanliga rutinen. Avsluta eventuell pågående äldre rollförhandsvisning och välj därefter användare i den nya kontrollen.

## Nytt i V17

- Förhandsgranska en namngiven användare under Administratörsverktyg → Allmänt. Sök på namn/roll, välj person och tryck Förhandsgranska. Menyer, modulsynlighet, personliga data och behörigheter hämtas för vald person. Administratören behåller sin egen inloggning; förhandsgranskningen är skrivskyddad även om vald person är administratör. Avsluta med knappen i överkanten. Spärrade/borttagna konton kan inte väljas.
- Vänstermenyn börjar med Översikt och Planering; resterande moduler sorteras alfabetiskt på svenska. Dolda moduler förblir dolda.
- Ny notis och planeringsloggens detaljruta centreras i skärmen. Den delade dialogkomponenten använder webbläsarens dialoglager och placeras utanför modulernas layout. Stora dialoger kan rullas inom tillgänglig skärmhöjd.
- Hela anteckningsrutans innehållsyta, även tomma delar, öppnar anteckningsmodulen med vald Gemensamt/Privat-vy. Redigeraren får skrivfokus. Tangentbordets Enter/Mellanslag fungerar också.

## Kontroll

Produktionsbygge och TypeScript har passerat. Isolerade databastester verifierar V17:s identitet, användarstyrd synlighet, skrivskydd, återgång till administratör och menyordning. V16:s notis-/push-/synlighetstester samt befintliga säkerhetskontroller körs också. Ingen produktionsdatabas, riktig pushleverans eller publicering har utförts. Visuell kontroll på fysisk mobil och i webbläsare återstår; den tillgängliga förhandsvisningstjänsten kunde tidigare inte starta Next-projektet.

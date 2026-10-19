# PDF: moment hålls alltid hela

Ersätt filerna på samma sökvägar i GitHub och publicera via Netlify.
Ta med `app/pdf-pagination.ts` och `app/pdf-print.ts`.

Ingen ny SQL behövs.

Moment delas aldrig över flera PDF-sidor. Hela momentrutan flyttas till nästa sida när den inte får plats på den aktuella sidan. Om ett enskilt moment är större än en hel A4-sida skalas det ned för att rymmas i en enda ruta, utan att något innehåll tas bort.

Testat med vanliga moment, sidbrytningar och ett extra långt moment. Kontrollerat att momentet förekommer endast en gång, att allt innehåll följer med i rätt ordning och att ramen ryms helt på sidan.

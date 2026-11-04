# V17.1 – inga schemaändringsnotiser för egna ändringar

Lägg detta paket ovanpå V17 (som även innehåller V16). Ersätt app/planning-notifications-server.ts och publicera projektet på nytt i Netlify.

Ingen ny databasuppdatering, miljövariabel eller pushnyckel behövs.

Den inloggade person som sparar en ändring får inte någon notis om ändringen gäller sitt eget schema. Regeln gäller både hemsidans bjällra och telefonpush och gäller även när man själv godkänner ett förslag som ändrar det egna schemat. Om någon annan ändrar personens schema aviseras personen enligt tidigare notisinställningar. Vid ändringar som påverkar flera personer får övriga berörda personer fortfarande sina notiser. Notiser om nya ändringsförslag påverkas inte.

Gäller nya ändringar efter publicering. Redan skapade notiser eller köade leveranser tas inte bort.

Kontrollerat med TypeScript-parsning och körning av den riktiga notismodulen med isolerade databas- och inloggningsadaptrar: egna ändringar skapar varken webbnotis eller pushköpost; ändringar av annan person och flerpåverkande schemaändringar aviserar rätt övriga personer; misslyckad sparning aviseras inte. Fullständigt produktionsbygge och fysisk telefonkontroll har inte körts för denna lilla uppdatering. Inte publicerat av assistenten.

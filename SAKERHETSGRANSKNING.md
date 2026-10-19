# Behörigheter och säkerhetslogg – TC Boden

Granskat och testat i koden den 19 oktober 2026. Kontrollerna har körts lokalt med en testdatabas och testkonton, inte mot era riktiga bedömningar eller den publicerade Netlify-sidan.

## Rollernas åtkomst

| Funktion | Administratör | Instruktör | Handledare | Chef |
|---|---|---|---|---|
| Läsa vanliga elevbedömningar och kommentarer | Ja | Ja | Ja | Ja |
| Bedöma vanliga elevmoment och kommentera | Ja | Ja | Ja | Nej |
| Läsa KP1, KP2 och Examen | Ja | Ja | Nej | Ja |
| Redigera KP1, KP2 och Examen | Ja | Ja | Nej | Nej |
| Personal och individuell uppföljning | Ja | Ja | Nej | Nej |
| Hantera personer och bedömningsunderlag | Ja | Ja | Nej | Nej |
| Ta bort bedömningar och kommentarer | Ja | Ja | Nej | Nej |
| Användarhantering, aktivitetslogg och återställning | Ja | Nej | Nej | Nej |
| Ändra eget lösenord | Ja | Ja | Ja | Ja |

Servern kontrollerar varje API-operation mot en uttrycklig regel. En operation som saknar regel nekas. Att skriva in en adress direkt ger inte större behörighet. De befintliga kontrollerna i respektive funktion finns också kvar.

## Kompletteringar

- Misslyckade inloggningar och spärrade inloggningsförsök registreras.
- Försök att läsa eller använda skyddade funktioner utan rätt roll registreras.
- Rollbyten visar både tidigare och ny roll samt administratören som genomförde bytet.
- Administratörens återställning av ett lösenord registreras som en händelse utan lösenordets innehåll.
- Vid rollbyte, lösenordsåterställning eller borttagning av konto återkallas befintliga sessioner. Användaren måste logga in igen.
- Inloggningens session och loggpost sparas i samma transaktion. Om loggningen misslyckas skapas ingen ny session.
- Ändrande anrop från en annan webbplats avvisas.
- API-svar får uttryckliga instruktioner om att inte lagras i webbläsarens eller en delad caches minne.

Händelserna visas under Administratörsverktyg → Aktivitetslogg och kan filtreras med de befintliga filtren. Endast administratörer kan läsa loggen.

Misslyckade inloggningar visas som ”Ej inloggad”. Det är inte bevis för att innehavaren av ett visst konto har utfört försöket. Lösenord, sessionsnycklar, cookies, anropsinnehåll och råa IP-adresser skrivs inte till säkerhetsloggen.

Identiska säkerhetshändelser från samma konto eller anslutning grupperas per minut. Händelser om olika funktioner eller olika händelsetyper visas separat. Vanliga kontroller av om man är inloggad ger inte en säkerhetshändelse bara för att sessionen gått ut.

## Verifiering

325 kombinationer av roller, utloggat läge och serveroperationer har kontrollerats. Alla exporterade API-operationer har en granskad regel. Nekad åtkomst har även testats genom anrop direkt till de riktiga route-funktionerna.

Tillåtna arbetsflöden för handledare, chef och instruktör har testats med testdata. Ytterligare tester kontrollerar rollbyte, återkallade sessioner, lösenordsåterställning, lyckad/misslyckad/spärrad inloggning, gruppering av upprepade händelser, skydd mot att hemligheter hamnar i loggen samt återställning när en loggskrivning misslyckas.

Befintliga tester för att återskapa borttagna bedömningar har passerat. Produktionsbygget och TypeScript-kontrollen har passerat.

Underlag för granskningen: OWASP Authorization Cheat Sheet och Logging Cheat Sheet:
https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html


## Tillägg: rollförhandsvisning och sortering

Den nya sorteringsfunktionen kan bara användas av instruktörer och administratörer. Servern validerar att samma aktuella objekt finns med och att ingen nyare sortering skrivs över.

Rollförhandsvisning kan bara styras av en verklig administratör och gäller en session. Servern använder vald rolls läsbehörigheter och blockerar skrivningar under förhandsvisningen. Kontroll av verklig administratör används enbart för förhandsvisningens start/avslut; vanliga skyddade funktioner använder fortsatt effektiv roll. Kontots riktiga roll ändras inte.

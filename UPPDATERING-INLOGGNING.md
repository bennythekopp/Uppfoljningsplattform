# Inloggning – rättad adresskontroll på Netlify

Den tidigare kontrollen jämförde webbläsarens publika Origin-adress enbart med begärans adress inne i serverfunktionen. När Netlify vidarebefordrar begäran med en intern adress kan en korrekt inloggning därför avvisas med ”Begäran måste göras från den här webbplatsen.”

## Installation

1. Ersätt `app/api-security.ts` i det befintliga GitHub-repot med filen i detta paket.
2. Låt Netlify bygga och publicera ändringen.
3. Ladda om sidan och prova att logga in igen.

Ingen SQL-fil behöver köras för denna rättning. Den förutsätter att de tidigare databasuppdateringarna är gjorda.

Den publicerade adressen `https://handledare.netlify.app` är uttryckligen tillåten i koden. Egna ytterligare adresser kan anges i miljövariabeln APP_ORIGIN i Netlify, med Functions-scope, som fullständiga origin-adresser utan sökväg. Separera flera adresser med komma och gör en ny deploy efter ändringen. Netlifys URL, DEPLOY_URL och DEPLOY_PRIME_URL används också när de finns i servermiljön.

Begäranden med okänd Origin eller Sec-Fetch-Site: cross-site nekas fortfarande. Host och vidarebefordrade värdnamn räcker inte för att ge åtkomst. Roller, sessionskontroller, skyddet för rollförhandsvisning, SameSite-cookies och säkerhetsloggning behålls.

Verifierat lokalt med tester som efterliknar Netlifys interna adress, okända adresser, förfalskade proxyhuvuden och befintliga behörighetskontroller. Rättningen är inte publicerad till den driftsatta sidan av Codex.

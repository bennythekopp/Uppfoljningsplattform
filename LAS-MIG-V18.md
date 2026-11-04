# TC Boden V18 – samlat med V17.1–V17.6

Endast nya och uppdaterade filer. Läggs ovanpå projektet med V17 (inklusive V16). Tidigare V17.1–V17.6 ingår i samma paket och behöver inte läggas in separat.

## Installera i den här ordningen

1. Kör `netlify/database/migrations/0047_planning_column_sync.sql` i databasen, efter tidigare 0046 och FÖRE publicering av den nya koden. Filen kan köras igen. Den synkroniserar befintliga personkolumner och lägger till en trigger som sköter framtida namn-/rolländringar och nya konton. Befintliga celler, kolumn-ID:n och historik raderas inte.
2. Ersätt/lägg till motsvarande filer från ZIP-filen i projektet.
3. Publicera projektet på nytt och öppna appen på nytt efter publiceringen.

Inga nya beroenden, pushnycklar eller miljövariabler behövs utöver V17:s tidigare krav. Ingen publicering eller produktionsdatabasändring har gjorts av assistenten.

## Ändringar

- Separat inloggningskontroll och notisbjällra uppdateras automatiskt var tionde minut under aktiv användning. Bjällran hämtar direkt när den öppnas. Inloggningen kontrolleras också vid återgång till sidan. Behörigheter kontrolleras fortfarande på vanliga data- och sparanrop.
- Ett misslyckat inloggningskontrollanrop orsakar inte en ny automatisk förfrågan varje sekund.
- Autentisering och åtkomstregler återanvänds bara inom samma API-anrop. Ingen servercache delas mellan användare/anrop. Förhandsvisningens cache rensas när administratören byter användare.
- Planeringens vanliga läsanrop är fria från personkolumnskrivningar. Synkroniseringen sköts av SQL 0047 vid användarändringar.
- Elev-, personal-, bedömnings- och användarlistor hämtas när respektive del används, i stället för samtidigt vid administratörens start. Handledartilldelningar hämtas inte på varje vybyte. Modulbehörigheter hämtas vid kontobyte eller ändringssignal, inte varje menybyte.
- Identiska samtidiga GET-anrop delar en förfrågan. Inga mutationsanrop återförsöks automatiskt.
- Panelen hämtar inte dokument, läskvittenser eller ansvariglista för moduler som användaren saknar tillgång till; panelinnehåll filtreras redan i SQL.
- Cellsparningar låser den berörda personkolumnen i stället för att alla kolumner köar bakom samma exklusiva lås. En gemensam spärr behåller säkerheten vid breda grundschemaändringar. Sparning och skapande av notiser ligger fortfarande i samma transaktion.
- Pushleverans startar efter att sparsvaret skickats, med samma beständiga kö och schemalagda reservleverans. Den inväntar inte tiominuterskontrollen.
- HTML- och andra ogiltiga API-svar ger ett begripligt fel. Osparad celltext och konfliktval behålls i den öppna fliken. Det är inte en garanti att text överlever omladdning; spara/kopiera innan fliken stängs vid fel.
- Hela textcellen är skrivyta och markeras, även tomma ytor. Ytan följer radens faktiska höjd och kolumnens bredd när en annan cell växer, vid storleksändring och vid mobilbredd. Både direktredigering och ändringsförslagsfält använder detta. På hemsidan går direktredigering före förslagsinmatning när användaren har båda behörigheterna; appens befintliga förslagsbehörighet bevaras.
- Tidigare V17.6-regler bevaras: appbjällran mellan export och kugghjul; ändringsförslagsnotiser enbart på hemsidan för redigerare; administratören får appnotiser när någon annan ändrar det egna schemat; inga notiser om egna ändringar.

## Verifiering

- Produktionsbygge med TypeScript genomfört.
- Webbläsartest av verkliga redigerings- och förslagskomponenter: fem höjder/bredder, klick i tom nedre del, helcellsmarkering samt mobilstorlek.
- Webbläsartest av verklig startsida för administratör, handledare och chef med isolerade API-svar: dolda delar hämtas inte, handledartilldelningar hämtas en gång.
- Webbläsartest med simulerad tid: inga periodiska session-/bjällreanrop under nio aktiva minuter, uppdatering vid tio minuter, omedelbar hämtning när bjällran öppnas.
- Test av ogiltiga serversvar, bevarad osparad text, revisionskonflikt och sammanslagning av identiska GET-anrop.
- Isolerade tester av begäranslokal autentisering, spärrkontroll vid nästa anrop och separat autentisering för samtidiga anrop.
- SQL 0047 testad i isolerad PostgreSQL-motor: initial synk, omkörning, nytt konto, namnbyte, rollbyte, avaktivering och återaktivering med bevarat kolumn-ID.
- Låsval testat isolerat. Befintliga planeringstester för veckor, årsskifte, natt, snabbredigering, retry och konflikt passerar.

Detta är en kodoptimering och säkrare felhantering. Den exakta orsaken till driftstoppet är inte fastställd utan felstatus och serverloggar. Ingen mätning av minskad GB-hours eller belastningstest mot produktionsdatabasen har gjorts. Fysisk iPhone/Android har inte testats.

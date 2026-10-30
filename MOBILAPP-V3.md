# Mobilapp v3 – komplett hemsida

Ändringar: större veckoschema, borttagna extra rubriker och läsbehörighetstext, ingen uppdateringsknapp. Pull to refresh finns kvar. Kugghjulsmenyn innehåller sol/måne-reglage för ljust/mörkt läge och utloggning med samma Lucide-symbol som hemsidan. Temat använder huvudhemsidans sparade användarinställningar.

## Publicera
Ersätt projektfilerna i GitHub med innehållet i denna zip (package.json ska ligga i projektets rot). Behåll befintliga miljövariabler och databas i Netlify. Låt Netlify bygga och publicera. Mobilappen finns på /planering-app.

## Verifiering
Produktionsbygge inklusive TypeScript och befintliga planeringstester godkända. Visuell webbläsarkontroll kunde inte köras eftersom webbläsarinstallationen inte kunde hämtas i arbetsmiljön. Touchgester och installation behöver verifieras på iPhone/Android efter publicering.

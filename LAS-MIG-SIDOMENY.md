# TC Boden – samlad sidomenyfix ovanpå v14

Ersätt app/update-v14.css i ditt befintliga projekt och publicera en ny deploy. Denna fil ersätter även v14-1:s sidomenyfix; installera inte den äldre filen efteråt. Ingen ny SQL behövs för denna rättning.

- Menyn är 280 px bred i datorvyn på samtliga sidor, inklusive Planering. Långa menynamn bryts inte mitt i orden.
- Endast den nedre modul-/personlistan mellan avdelarna rullar. Loggan och de fasta menyerna ligger kvar upptill.
- Användaren, inställningar och utloggning ligger kvar längst ned.
- Samma uppdelning används i mobilens utfällbara meny. Navigation, fokusmarkeringar och kontroller behålls.

CSS-syntax kontrollerad och DOM-strukturen jämförd med den gemensamma sidomenyn. Visuell kontroll i webbläsare återstår. Koden är inte publicerad av assistenten.

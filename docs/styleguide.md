Oké, hier is een concept voor een Styleguide voor het "1106enZO" project, gebaseerd op de informatie uit de PDF's en jouw wens om wrappers te gebruiken rond `shadcn/ui` componenten.

---

**Styleguide: 1106enZO Platform**

**1. Introductie & Filosofie**

Deze styleguide definieert de visuele identiteit en UI-componentrichtlijnen voor het 1106enZO platform. Het doel is een consistente, toegankelijke en herkenbare gebruikerservaring te creëren die aansluit bij de kernwaarden van het platform: verbondenheid, toegankelijkheid en lokale identiteit van Holendrecht[cite: 4, 5]. De stijl moet optimisme en groei uitstralen, en zowel jongeren als ouderen aanspreken[cite: 62].

**2. Kleurenpalet**

Het kleurenpalet is ontworpen om warmte, optimisme en toegankelijkheid uit te stralen[cite: 62].

* **Primary Colors (Interactieve elementen: CTA's, links, actieve staten, etc.)[cite: 64]:**
    * `Orange (web)`: `#F8A300` [cite: 63]
    * `Orange (Pantone)`: `#F85E00` [cite: 63]
    * *Suggestie:* Gebruik deze tinten voor primaire knoppen, actieve navigatie-elementen en belangrijke accenten. De exacte verdeling van de 50-900 schalen voor primary [cite: 64] moet nog gedefinieerd worden, maar baseer ze rond deze kernkleuren.
* **Secondary Colors (Achtergronden, secundaire acties, accenten)[cite: 64]:**
    * `Cornell red`: `#A70B18` [cite: 63] (Gebruik spaarzaam, mogelijk voor accenten of specifieke waarschuwingen/meldingen).
    * Neutrale tinten (bijv. grijstinten, off-whites): Voor achtergronden, kaarten, tekstvelden om de primaire kleuren te laten opvallen en een rustige basis te bieden[cite: 62]. De exacte 50-900 schalen [cite: 64] moeten nog gedefinieerd worden.
* **Tertiary Colors (Subtiele highlights, decoratieve elementen, gedempte accenten)[cite: 64]:**
    * Pasteltinten[cite: 62, 66]: Lichte varianten van de primaire/secundaire kleuren of complementaire zachte tinten. Gebruik voor achtergrondpatronen, illustratieve elementen of inactieve staten. De exacte 50-900 schalen [cite: 64] moeten nog gedefinieerd worden.

**3. Typografie**

Typografie moet leesbaar, toegankelijk en modern zijn. Grote lettertypen worden aangemoedigd voor leesbaarheid[cite: 62, 66].

* **Heading Font Optie 1:**
    * Font: `Baloo ExtraBold` [cite: 65]
    * Gebruik: Voor paginatitels, sectiekoppen en belangrijke highlights.
* **Heading Font Optie 2:**
    * Font: `Bungee Bold` [cite: 65] (Meer display-achtig, gebruik mogelijk spaarzamer voor grote slogans of branding elementen).
* **Body Font Optie 1:**
    * Font: `Montserrat Regular` [cite: 65]
    * Gebruik: Voor paragraaftekst, labels, menu-items en algemene content. Zorg voor voldoende regelafstand en tekengrootte voor leesbaarheid.
* **Body Font Optie 2:**
    * Font: `Open Sans Regular` [cite: 65]
    * Gebruik: Alternatief voor body tekst, vergelijkbaar met Montserrat. Kies één van de twee voor consistentie.

**4. Componenten (Wrapper Principe)**

Om consistentie te waarborgen en het makkelijker te maken de 1106enZO-stijl toe te passen, maken we gebruik van wrapper-componenten rond de basiscomponenten van `shadcn/ui`. Dit betekent dat we de functionaliteit en toegankelijkheid van `shadcn/ui` behouden, maar onze eigen look-and-feel toepassen.

* **Basis Principe:**
    1.  Importeer het gewenste `shadcn/ui` component (bijv. `Button`) in een nieuw, project-specifiek component (bijv. `EnzoButton`).
    2.  Pas de 1106enZO styling toe binnen de wrapper met behulp van Tailwind CSS utility classes (of custom CSS indien nodig), gebruikmakend van de hierboven gedefinieerde kleur- en typografie-tokens.
    3.  Exporteer de wrapper component voor gebruik binnen de applicatie.

* **Voorbeeld: `EnzoButton`**

    ```jsx
    // components/ui/enzo-button.jsx (Voorbeeld structuur)
    import React from 'react';
    import { Button as ShadcnButton } from '@/components/ui/button'; // Pas pad aan indien nodig
    import { cn } from '@/lib/utils'; // shadcn/ui utility

    // Definieer varianten en stijlen gebaseerd op 1106enZO design
    // Gebruik Tailwind classes met de gedefinieerde kleuren (Primary/Secondary) en fonts
    const enzoButtonVariants = {
        variants: {
            variant: {
                default: 'bg-primary-orange-web text-primary-foreground hover:bg-primary-orange-web/90', // Gebruik #F8A300
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80', // Definieer secondary kleur
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
                // Voeg eventueel meer varianten toe
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8', // Overweeg grotere standaard maten ivm leesbaarheid [cite: 62]
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    };

    const EnzoButton = React.forwardRef(({ className, variant, size, ...props }, ref) => {
        // Hier combineer je de basis shadcn styles met jouw custom Enzo styles
        // Je moet mogelijk de `buttonVariants` van shadcn hier ook toepassen of mergen
        // Dit is een vereenvoudigd voorbeeld; exacte implementatie hangt af van hoe je shadcn/tailwind hebt opgezet.

        // Voorbeeld: Focus op het toepassen van de 1106enZO default variant kleur
        const baseClasses = ''; // Haal basis shadcn classes op indien nodig
        const enzoClasses = enzoButtonVariants.variants.variant[variant || 'default']; // Pas 1106enZO kleuren toe
        const sizeClasses = enzoButtonVariants.variants.size[size || 'default'];

        // Gebruik cn utility om classes te mergen
        return (
            <ShadcnButton
                className={cn(baseClasses, enzoClasses, sizeClasses, className)} // Combineer basis, variant, size en extra classes
                ref={ref}
                {...props}
            />
        );
    });
    EnzoButton.displayName = 'EnzoButton';

    export { EnzoButton };

    ```
    *Gebruik binnen de app:*
    ```jsx
    import { EnzoButton } from '@/components/ui/enzo-button';

    // ...
    <EnzoButton>Primaire Actie</EnzoButton>
    <EnzoButton variant="secondary">Secundaire Actie</EnzoButton>
    ```

* **Andere Componenten:** Pas ditzelfde wrapper-principe toe op andere benodigde `shadcn/ui` componenten zoals `Card`, `Input`, `Select`, `Dialog`, etc., en definieer hun `Enzo*` varianten met de projectkleuren en typografie. Kijk naar de prototype schermen voor inspiratie over hoe componenten zoals kaarten, zoekbalken, en lijsten eruit zouden kunnen zien.

**5. Iconografie**

* Gebruik iconen ter illustratie en ondersteuning van de interface[cite: 62, 66].
* Kies een consistente iconenset (bijv. Lucide Icons, vaak gebruikt met shadcn/ui) en pas eventueel de primaire/secundaire kleuren toe waar nodig.
* Iconen moeten duidelijk en universeel herkenbaar zijn.

**6. Imagery**

* Gebruik foto's die een positieve en realistische impressie van de buurt Holendrecht geven[cite: 62, 66].
* Focus op beelden van mensen, activiteiten, lokale plekken en natuur.
* Zorg voor hoge kwaliteit en consistente stijl in fotografie.

**7. Layout & Spacing**

* Hanteer een consistente spacing scale (bijv. gebaseerd op een 4px of 8px grid) voor marges, padding en tussenruimte tussen elementen.
* Gebruik voldoende witruimte om de layout luchtig en overzichtelijk te houden.
* Ontwerp mobile-first, maar zorg voor een goede weergave op alle schermformaten (responsiviteit). De prototypes lijken een mobiele weergave te tonen.

---

Dit is een startpunt. Het is belangrijk om deze richtlijnen verder te detailleren, met name de specifieke kleurgradaties (50-900 schalen) en de exacte styling van elke `Enzo*` component wrapper.
import { strapiFetch } from "./client";
import {
    FrontendHomepageCard,
    FrontendHomepageContent,
    HomepageContentFields,
    StrapiHomepageCardComponent,
} from "../../types/features/homepage";
import { getStrapiImageUrl } from "../utils/strapiUtils";

/**
 * Fetches the single Homepage content from Strapi API.
 * Handles the specific structure for single types.
 */
export async function fetchHomepageContent(): Promise<HomepageContentFields | null> {
     // Use broad population or specify component fields
     const populateQuery = new URLSearchParams({
         'populate[heroBackgroundImage][fields]': 'url,formats', // Populate specific fields for hero image
         'populate[cards][populate][cardImage][fields]': 'url,formats' // Populate specific fields for card images
         // Add other specific populations if needed
     }).toString();

    const path = `/api/homepage?${populateQuery}`;

    try {
        // Strapi v5: response.data is already flat HomepageContentFields
        const response = await strapiFetch<{ data: HomepageContentFields }>(path);

        if (!response?.data) {
            return null;
        }

        return response.data;
    } catch {
        return null;
    }
}

/**
 * Maps the Strapi Homepage data item to the FrontendHomepageContent structure.
 */
export function mapStrapiHomepageToFrontend(
    item: HomepageContentFields | null | undefined
): FrontendHomepageContent | null {
    if (!item) {
        return null;
    }

    const attrs = item;

    const frontendCards: FrontendHomepageCard[] = (attrs.cards || []).map((cardComponent: StrapiHomepageCardComponent): FrontendHomepageCard => {
        const imageUrl = getStrapiImageUrl(cardComponent.cardImage, 'medium');
        return {
            id: cardComponent.id,
            title: cardComponent.cardTitle ?? 'No Title',
            imageUrl: imageUrl,
            link: cardComponent.cardLink ?? '#',
        };
    });

    const heroImageUrl = getStrapiImageUrl(attrs.heroBackgroundImage, 'large');

    const frontendData: FrontendHomepageContent = {
        heroTitle: attrs.heroTitle ?? 'Hero Title Missing',
        heroBackgroundImageUrl: heroImageUrl,
        cardSectionTitle: attrs.cardSectionTitle ?? undefined,
        cards: frontendCards,
    };

    return frontendData;
}

/**
 * Fetches and maps homepage content to the frontend structure.
 */
export async function getFrontendHomepageContent(): Promise<FrontendHomepageContent | null> {
    const strapiData = await fetchHomepageContent();
    return mapStrapiHomepageToFrontend(strapiData);
}
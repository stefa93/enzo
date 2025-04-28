// src/api/strapi/newsService.ts
import { strapiFetch } from "./client";
import { FrontendItem } from "../../types/features/news";
import { getStrapiImageUrl } from "../utils/strapiUtils";
import type { StrapiComponentMedia } from "../../types/strapi/media";

// Flat v5 structure for news content fields
type NewsContentFields = {
    id: number;
    titel: string;
    samenvatting?: string;
    inhoud: string;
    afbeelding?: {
        id: number;
        url: string;
        formats?: Record<string, { url: string }>;
    };
    auteur?: string;
    publicatiedatum: string;
    categorieen?: Array<{
        id: number;
        naam: string;
    }>;
};

/**
 * Fetches news items from Strapi v5 API (flat structure, no .attributes).
 */
export async function fetchNewsItems(): Promise<NewsContentFields[]> {
    const populateQuery = new URLSearchParams({
        'populate[afbeelding][fields]': 'url,formats',
        'populate[categorieen][fields]': 'naam',
        'sort': 'publicatiedatum:desc',
    }).toString();
    const path = `/api/nieuwsberichten?${populateQuery}`;
    try {
        const response = await strapiFetch<{ data: NewsContentFields[] }>(path);
        if (!response?.data) return [];
        return response.data;
    } catch (error) {
        console.error("[fetchNewsItems] Failed to fetch news items:", error);
        return [];
    }
}

/**
 * Maps a flat Strapi v5 news item to the FrontendItem structure.
 */
export function mapStrapiItemToFrontend(item: NewsContentFields | null | undefined): FrontendItem | null {
    if (!item || !item.id) {
        console.warn("[mapStrapiItemToFrontend] Invalid item received:", item);
        return null;
    }
    // Map category (first category only)
    const rawCategory = item.categorieen?.[0]?.naam?.toLowerCase();
    const newsCategoryMap = {
        evenement: 'event',
        evenementen: 'event',
        verhaal: 'story',
        verhalen: 'story',
    } as const;
    const category = rawCategory && newsCategoryMap[rawCategory as keyof typeof newsCategoryMap] ? newsCategoryMap[rawCategory as keyof typeof newsCategoryMap] : 'news';
    // Use getStrapiImageUrl to get the full URL, preferring 'medium' format
    // Cast type as StrapiComponentMedia as our populated fields are sufficient
    const imageUrl = getStrapiImageUrl(item.afbeelding as unknown as StrapiComponentMedia, 'medium');

    // Construct FrontendItem
    const frontendItem: FrontendItem = {
        id: `s${item.id}`,
        strapiId: item.id,
        category: category,
        date: item.publicatiedatum ?? new Date().toISOString(),
        title: item.titel ?? 'No Title',
        description: item.samenvatting ?? '',
        imageUrl: imageUrl,
        content: item.inhoud ?? '',
        author: item.auteur ?? undefined,
    };
    return frontendItem;
}

/**
 * Fetches and maps news items to the frontend structure.
 */
export async function getFrontendNewsItems(): Promise<FrontendItem[]> {
    const newsItems = await fetchNewsItems();
    return newsItems
        .map(mapStrapiItemToFrontend)
        .filter((item): item is FrontendItem => item !== null);
}
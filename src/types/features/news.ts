// src/types/features/news.ts
import { StrapiBaseAttributes, StrapiDataItem, StrapiRelation } from "../strapi/common";
import { StrapiMedia } from "../strapi/media";

// --- Strapi Specific Types ---

export interface StrapiCategorieAttributes extends StrapiBaseAttributes {
    naam: string;
    // Add other category fields if needed
}

export interface StrapiNieuwsberichtAttributes extends StrapiBaseAttributes {
    titel: string;
    samenvatting?: string;
    inhoud: string; // Richtext content as string initially
    afbeelding: StrapiMedia; // Single Media Relation
    auteur?: string;
    publicatiedatum: string; // ISO Date string
    categorieen: StrapiRelation<StrapiCategorieAttributes>; // Many Relation
}

// Represents a full Nieuwsbericht item as returned by the API (nested structure)
export type StrapiNieuwsbericht = StrapiDataItem<StrapiNieuwsberichtAttributes>;


// --- Frontend Specific Types ---

export interface FrontendItem {
    id: string; // Unique ID for frontend use (e.g., `s${strapiId}`)
    strapiId: number; // Original Strapi ID
    category: 'news' | 'event' | 'story';
    imageUrl?: string;
    author?: string;
    date: string; // ISO Date String
    title: string;
    comments?: number; // Example field, adjust as needed
    description?: string;
    content?: string; // For detail view
    inlineImageUrl?: string; // Optional for detail view
}

// --- Potential API Input Variations (Helper for Mapping) ---
// Use this if your API might return flat structures sometimes, e.g. with specific populate depths
// If you *always* expect the nested StrapiDataItem structure, you might not need this.

/**
 * Represents the direct attributes of a Nieuwsbericht, potentially returned flat by the API.
 * Combine with StrapiNieuwsberichtAttributes for potential fields.
 */
type FlatNieuwsberichtAttributes = Partial<Omit<StrapiNieuwsberichtAttributes, 'afbeelding' | 'categorieen'>> & {
    afbeelding?: StrapiMedia | unknown; // Allow flexible types if flattening occurs
    categorieen?: StrapiRelation<StrapiCategorieAttributes> | StrapiDataItem<StrapiCategorieAttributes>[] | StrapiDataItem<StrapiCategorieAttributes> | unknown;
    // Add other potential flat fields if necessary
};

/**
 * Type representing the possible structures received from the API for a news item.
 * It could be the standard nested structure OR a flatter structure.
 */
export type PotentialNieuwsberichtInput = StrapiNieuwsbericht | (FlatNieuwsberichtAttributes & { id: number });
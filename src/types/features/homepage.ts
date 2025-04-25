// src/types/features/homepage.ts
import { StrapiComponentMedia, StrapiMedia } from "../strapi/media";

// --- Homepage Content Type for Strapi v5 (flat) ---

export interface HomepageContentFields {
    id: number;
    heroTitle: string;
    heroBackgroundImage: StrapiMedia | null;
    cardSectionTitle?: string;
    cards: StrapiHomepageCardComponent[];
}

// --- Strapi Specific Types ---

export interface StrapiHomepageCardComponent {
    id: number; // Component ID
    cardTitle: string;
    cardImage: StrapiComponentMedia; // Media directly within component
    cardLink: string;
}

// --- Frontend Specific Types ---

export interface FrontendHomepageCard {
    id: number;
    title: string;
    imageUrl?: string;
    link: string;
}

export interface FrontendHomepageContent {
    heroTitle: string;
    heroBackgroundImageUrl?: string;
    cardSectionTitle?: string;
    cards: FrontendHomepageCard[];
}
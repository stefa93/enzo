// src/types/strapi/media.ts
import { StrapiSingleRelation } from './common';

export interface StrapiImageFormat {
    name: string;
    hash: string;
    ext: string;
    mime: string;
    path: string | null;
    width: number;
    height: number;
    size: number;
    url: string;
}

// Attributes of the media item itself (often nested under 'data')
export interface StrapiImageDataAttributes {
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats: {
        thumbnail?: StrapiImageFormat;
        small?: StrapiImageFormat;
        medium?: StrapiImageFormat;
        large?: StrapiImageFormat;
    } | null; // formats can be null if only original exists
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: unknown; // Use unknown instead of any
    createdAt: string;
    updatedAt: string;
}

// The full data structure for a single media item in a relation
export interface StrapiImageData {
    id: number;
    attributes: StrapiImageDataAttributes;
}

// Type for a field containing a single media relation
export type StrapiMedia = StrapiSingleRelation<StrapiImageDataAttributes>;

// Type for media used directly within a Component (flatter structure)
export interface StrapiComponentMedia {
    id: number;
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats: {
        thumbnail?: StrapiImageFormat;
        small?: StrapiImageFormat;
        medium?: StrapiImageFormat;
        large?: StrapiImageFormat;
    } | null;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: unknown;
    createdAt: string;
    updatedAt: string;
}
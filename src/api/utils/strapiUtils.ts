// src/api/utils/strapiUtils.ts
import { STRAPI_URL } from "../strapi/client";
import { StrapiComponentMedia, StrapiImageFormat, StrapiMedia } from "../../types/strapi/media";

/**
 * Gets the full image URL from Strapi media data (handles nested and component media).
 * Prefers a specific format or falls back to original URL.
 */
export function getStrapiImageUrl(
    media: StrapiMedia | StrapiComponentMedia | undefined | null,
    format?: 'thumbnail' | 'small' | 'medium' | 'large' // Be explicit about format keys
): string | undefined {
    if (!media) {
        return undefined;
    }

    let url: string | undefined;
    let formats: Record<string, StrapiImageFormat> | null | undefined;

    // Check for the nested 'data.attributes' structure (StrapiMedia)
    if ('data' in media && media.data?.attributes) {
        const attrs = media.data.attributes;
        url = attrs.url;
        formats = attrs.formats;
    }
    // Check for the flatter structure (StrapiComponentMedia or potentially flattened relation)
    else if ('url' in media && media.url) {
        // This assumes media IS StrapiComponentMedia or a similar flat structure
        const componentMedia = media as StrapiComponentMedia; // Cast for type safety
        url = componentMedia.url;
        formats = componentMedia.formats;
    }

    // If no base URL found, return undefined
    if (!url) {
        return undefined;
    }

    // Try to get the formatted URL
    if (format && formats?.[format]?.url) {
        return `${STRAPI_URL}${formats[format]?.url}`;
    }

    // Fallback to the original URL
    return `${STRAPI_URL}${url}`;
}

/**
 * Generic function to map a category name from a Strapi DataItem using a provided mapping object.
 * @param dataItem - The Strapi DataItem containing category attributes
 * @param categoryMap - An object mapping lowercased category names to output values
 * @param defaultValue - The default value to return if no match is found
 */
export function mapStrapiCategory<Attrs extends { naam?: string }, T extends string>(
    dataItem: { attributes?: Attrs } | undefined | null,
    categoryMap: Record<string, T>,
    defaultValue: T
): T {
    const categoryName = dataItem?.attributes?.naam;
    if (!categoryName) {
        return defaultValue;
    }
    const lowerCaseName = categoryName.toLowerCase();
    return categoryMap[lowerCaseName] ?? defaultValue;
}
import { STRAPI_URL } from "../strapi/client";
import { StrapiComponentMedia, StrapiImageFormat, StrapiMedia } from "../../types/strapi/media";

/**
 * Gets the full image URL from Strapi media data.
 * Prefers a specific format or falls back to original URL.
 * Correctly handles absolute URLs from providers like Cloudinary.
 */
export function getStrapiImageUrl(
    media: StrapiMedia | StrapiComponentMedia | undefined | null,
    format?: 'thumbnail' | 'small' | 'medium' | 'large'
): string | undefined {
    if (!media) {
        return undefined;
    }

    let baseImageUrl: string | undefined;
    let availableFormats: Record<string, StrapiImageFormat> | null | undefined;

    // Check for the nested 'data.attributes' structure (StrapiMedia from relations)
    if ('data' in media && media.data?.attributes) {
        const attrs = media.data.attributes;
        baseImageUrl = attrs.url;
        availableFormats = attrs.formats;
    }
    // Check for the flatter structure (StrapiComponentMedia from components, or already flattened relation)
    else if ('url' in media && media.url) {
        const componentMedia = media as StrapiComponentMedia;
        baseImageUrl = componentMedia.url;
        availableFormats = componentMedia.formats;
    }

    // Determine the URL to use (preferring the specified format)
    let imageUrlToUse = baseImageUrl;
    if (format && availableFormats?.[format]?.url) {
        imageUrlToUse = availableFormats[format]?.url;
    }

    if (!imageUrlToUse) {
        return undefined;
    }

    // If the URL is already absolute (e.g., from Cloudinary), return it directly.
    // Otherwise, prepend the STRAPI_URL (for locally served files starting with '/').
    if (imageUrlToUse.startsWith('http://') || imageUrlToUse.startsWith('https://')) {
        return imageUrlToUse;
    } else if (imageUrlToUse.startsWith('/')) {
        return `${STRAPI_URL}${imageUrlToUse}`;
    } else {
        // Fallback for unexpected URL formats, potentially log a warning.
        // This case should ideally not be hit with properly configured providers.
        console.warn(`[getStrapiImageUrl] Received URL in unexpected format: ${imageUrlToUse}`);
        // As a last resort, treat as a relative path to STRAPI_URL
        return `${STRAPI_URL}/${imageUrlToUse}`;
    }
}

/**
 * Generic function to map a category name from a Strapi DataItem using a provided mapping object.
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
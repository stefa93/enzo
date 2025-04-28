// src/api/strapi/client.ts

// Ensure VITE_STRAPI_URL is defined in your .env file
export const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

if (!STRAPI_URL) {
    console.warn("VITE_STRAPI_URL environment variable is not set. Defaulting to http://localhost:1337");
}

/**
 * Basic fetch wrapper (optional, but can be expanded for error handling, auth, etc.)
 */
export async function strapiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${STRAPI_URL}${path}`;
    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            // Add Authorization header if needed:
            // 'Authorization': `Bearer ${YOUR_API_TOKEN}`
        },
        ...options,
    };

    console.log(`[strapiFetch] Fetching from URL: ${url}`);
    try {
        const response = await fetch(url, defaultOptions);
        console.log(`[strapiFetch] Response status: ${response.status}`);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[strapiFetch] API Error ${response.status} at ${path}:`, errorBody);
            // Throw a more specific error or handle it based on status code
            throw new Error(`Strapi API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        // Handle cases where response might be empty (e.g., 204 No Content)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null as T; // Or handle as appropriate
        }

        const data: T = await response.json();
        // console.log(`[strapiFetch] Raw Response JSON for ${path}:`, JSON.stringify(data, null, 2));
        return data;

    } catch (error) {
        console.error(`[strapiFetch] Network or processing error for ${path}:`, error);
        // Re-throw or return a specific error structure
        throw error; // Rethrow the caught error
    }
}
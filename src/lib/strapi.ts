// Facade for Strapi API, mappers, and types used in the app

// Homepage (HomeScreen)
export { fetchHomepageContent, mapStrapiHomepageToFrontend } from '../api/strapi/homepageService';
export type { FrontendHomepageContent, FrontendHomepageCard } from '../types/features/homepage';

// News (NewsListView, NewsDetailView, etc.)
export { fetchNewsItems, mapStrapiItemToFrontend, getFrontendNewsItems } from '../api/strapi/newsService';
export type { FrontendItem } from '../types/features/news';

// Main seeding script for Strapi
// To be implemented: logic to seed categories, homepage, news, and upload images

import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import FormData from 'form-data';
import mime from 'mime-types';
import { fileURLToPath } from 'url';
import { URL } from 'url';
import https from 'https';
import stream from 'stream';
import { promisify } from 'util';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_API_URL = process.env.STRAPI_API_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const DATA_DIR = path.join(__dirname, 'data');
const NIEUWS_DIR = path.join(DATA_DIR, 'nieuwsberichten');

const VERBOSE = true;
const CLEAR_EXISTING_DATA = true;

const log = (message, data = '') => {
  if (VERBOSE) {
    console.log(`[SEED] ${message}`, data);
  }
};

const warn = (message, error = '') => {
  console.warn(`[SEED] WARN: ${message}`, error instanceof Error ? error.message : error);
};

const error = (message, error = '') => {
  console.error(`[SEED] ERROR: ${message}`, error instanceof Error ? error.message : error);
  if (error instanceof Error && VERBOSE) {
    console.error(error.stack);
    if (error.response?.data) {
      console.error("Strapi Error Details:", JSON.stringify(error.response.data, null, 2));
    }
  }
};

const makeRequest = async (method, apiPath, payload = null, params = null) => {
  try {
    const config = {
      method,
      url: `${STRAPI_API_URL}/api${apiPath}`,
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: payload ? { data: payload } : null,
      params: params
    };
    log(`Requesting ${method} ${config.url}`);
    const response = await axios(config);
    log(`Success ${method} ${config.url}`);
    return response.data;
  } catch (err) {
    error(`Failed ${method} ${apiPath}`, err);
    throw err;
  }
};

const imageCache = new Map();
const categoryCache = new Map();

// --- Helper function: Fetch image as stream (for Unsplash and others) ---
async function fetchImageStream(imageUrl) {
  return new Promise((resolve, reject) => {
    https.get(imageUrl, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirect
        console.log(`Redirecting image fetch to: ${response.headers.location}`);
        fetchImageStream(response.headers.location).then(resolve).catch(reject);
      } else if (response.statusCode === 200) {
        resolve(response);
      } else {
        reject(new Error(`Failed to get '${imageUrl}' (${response.statusCode})`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

const uploadImage = async (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      warn(`Invalid image URL provided: ${imageUrl}. Skipping upload.`);
      return null;
  }
  if (imageCache.has(imageUrl)) {
    log(`Using cached image ID for ${imageUrl}`);
    return imageCache.get(imageUrl);
  }
  log(`Attempting to fetch and upload image from URL: ${imageUrl}`);
  try {
    // Use stream for Unsplash and remote images
    const imageStream = await fetchImageStream(imageUrl);
    let filename = 'upload.tmp';
    let contentType = 'image/jpeg';
    let contentLength = 0;
    if (imageStream.headers) {
      // Try to get filename and content-type from headers
      const disposition = imageStream.headers['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="(.+?)"/);
        if (match) filename = match[1];
      }
      if (imageStream.headers['content-type']) {
        contentType = imageStream.headers['content-type'];
      }
      if (imageStream.headers['content-length']) {
        contentLength = parseInt(imageStream.headers['content-length'], 10);
      }
    }
    // Fallback: try to get filename from URL
    try {
      const parsedUrl = new URL(imageUrl);
      const pathname = parsedUrl.pathname;
      if (pathname && pathname !== '/') {
        filename = path.basename(pathname);
      }
      if (filename === 'upload.tmp' || !filename.includes('.')) {
        const hash = Date.now().toString(36);
        filename = `image-${hash}.jpg`;
      }
    } catch {}
    // Warn and skip if image is larger than 1MB (Strapi default limit)
    if (contentLength && contentLength > 1024 * 1024) {
      warn(`Image ${filename} is too large (${contentLength} bytes). Skipping upload. (Strapi default upload limit is 1MB)`);
      return null;
    }
    log(`Fetched image. Filename: ${filename}, Content-Type: ${contentType}, Size: ${contentLength || 'unknown'} bytes`);
    const form = new FormData();
    form.append('files', imageStream, {
      filename: filename,
      contentType: contentType,
    });
    const uploadResponse = await axios.post(`${STRAPI_API_URL}/api/upload`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000
    });
    if (uploadResponse.data && uploadResponse.data.length > 0) {
      imageCache.set(imageUrl, uploadResponse.data[0]);
      log(`Image uploaded successfully. ID: ${uploadResponse.data[0].id}`);
      return uploadResponse.data[0];
    }
    warn(`Image upload did not return a file object for ${imageUrl}`);
    return null;
  } catch (err) {
    error(`Failed to fetch image from URL ${imageUrl}.`, err);
    return null;
  }
};

const parseMarkdownFile = async (filePath) => {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const yamlFrontMatterRegex = /^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/;
    const match = fileContent.match(yamlFrontMatterRegex);
    if (!match) {
        warn(`File ${filePath} does not contain valid YAML frontmatter. Skipping.`);
        return null;
    }
    try {
        const frontmatter = yaml.load(match[1]);
        const content = match[2].trim();
        return { frontmatter, content };
    } catch (e) {
        error(`Failed to parse YAML frontmatter in ${filePath}`, e);
        return null;
    }
};

const clearCollection = async (apiPath, pluralName) => {
    log(`Attempting to clear collection: ${pluralName}`);
    try {
        let page = 1;
        let hasMore = true;
        const pageSize = 100;
        while (hasMore) {
            const response = await makeRequest('GET', apiPath, null, {
                'pagination[page]': page,
                'pagination[pageSize]': pageSize,
                'fields[0]': 'id',
            });
            if (!response || !response.data || response.data.length === 0) {
                hasMore = false;
                continue;
            }
            log(`Found ${response.data.length} items to delete in ${pluralName} (page ${page})`);
            for (const item of response.data) {
                try {
                    await makeRequest('DELETE', `${apiPath}/${item.id}`);
                    log(`Deleted ${pluralName} item with ID: ${item.id}`);
                } catch (deleteErr) {
                    warn(`Failed to delete ${pluralName} item ID ${item.id}`, deleteErr);
                }
            }
            if (response.meta?.pagination?.pageCount && page < response.meta.pagination.pageCount) {
                page++;
            } else {
                hasMore = false;
            }
        }
        log(`Finished clearing collection: ${pluralName}`);
    } catch (err) {
        warn(`Could not fully clear collection ${pluralName}. It might be empty or an error occurred.`, err);
    }
};

const CATEGORY_API = '/categories';

const seedCategories = async () => {
  log('--- Seeding Categories ---');
  const filePath = path.join(DATA_DIR, 'categories.yaml');
  if (!await fs.pathExists(filePath)) {
    error('categories.yaml not found!');
    return;
  }
    try {
    const categories = yaml.load(await fs.readFile(filePath, 'utf8'));
    for (const cat of categories) {
      log('Attempting to process category object:', cat);
      if (!cat || typeof cat.naam !== 'string') {
          warn(`Invalid category object or missing/invalid name in categories.yaml:`, cat);
          continue; // Skip this invalid entry
      }
      try {
        const payload = {
          naam: cat.naam,
          kleurcode: cat.kleurcode,
        };
        log(`Payload for POST ${CATEGORY_API}:`, payload); // Log the payload too
        const created = await makeRequest('POST', CATEGORY_API, payload);
        categoryCache.set(cat.naam, created.data.id);
        log(`Created category: ${cat.naam} (ID: ${created.data.id})`);
      } catch (catErr) {
        warn(`Failed to create category "${cat.naam}". It might already exist or there was an API error.`, catErr);
         try {
             const existing = await makeRequest('GET', CATEGORY_API, null, { 'filters[naam][$eq]': cat.naam });
             if (existing?.data?.length > 0) {
                 const existingId = existing.data[0].id;
                 categoryCache.set(cat.naam, existingId);
                 log(`Found existing category: ${cat.naam} (ID: ${existingId})`);
             }
         } catch (fetchErr) {
              error(`Could not create or find category "${cat.naam}"`, fetchErr);
         }
      }
    }
  } catch (e) {
    error('Failed to read or parse categories.yaml', e);
  }
};

const seedNieuwsberichten = async () => {
  log('--- Seeding Nieuwsberichten ---');
  if (!await fs.pathExists(NIEUWS_DIR)) {
      warn(`Nieuwsberichten directory not found at ${NIEUWS_DIR}. Skipping.`);
      return;
  }
  const files = await fs.readdir(NIEUWS_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  for (const file of mdFiles) {
    const filePath = path.join(NIEUWS_DIR, file);
    log(`Processing ${file}...`);
    const parsed = await parseMarkdownFile(filePath);
    if (!parsed) continue;
    const { frontmatter, content } = parsed;

    // Try to find category IDs
    const categoryIds = [];
    if (frontmatter.categorieen && Array.isArray(frontmatter.categorieen)) {
      for (const catName of frontmatter.categorieen) {
        if (categoryCache.has(catName)) {
          categoryIds.push(categoryCache.get(catName));
        } else {
          warn(`Category "${catName}" mentioned in ${file} not found or wasn't created. Skipping relation.`);
        }
      }
    }

    // Upload image if present
    let imageObject = null;
    if (frontmatter.afbeelding) {
      imageObject = await uploadImage(frontmatter.afbeelding);
      log(`[DEBUG] uploadImage response for ${file}:`, JSON.stringify(imageObject, null, 2));
      if (!imageObject) {
        warn(`Could not upload or find image from URL "${frontmatter.afbeelding}" for ${file}. Proceeding without image.`);
      }
    }

    // Create nieuwsbericht
    try {
      const imageIdToLink = imageObject ? imageObject.id : null;
      log(`[DEBUG] ID being linked for ${file}:`, imageIdToLink);
      const payload = {
        titel: frontmatter.titel,
        samenvatting: frontmatter.samenvatting || null,
        inhoud: content,
        auteur: frontmatter.auteur || null,
        publicatiedatum: frontmatter.publicatiedatum,
        categorieen: categoryIds,
        afbeelding: imageIdToLink, // Pass ID directly or null
        publishedAt: frontmatter.publicatiedatum,
      };
      log(`Payload for POST /nieuwsberichten:`, payload); // Log payload
      const created = await makeRequest('POST', '/nieuwsberichten', payload);
      log(`Created nieuwsbericht: "${frontmatter.titel}" (ID: ${created.data.id})`);
    } catch (newsErr) {
      error(`Failed to create nieuwsbericht from ${file}`, newsErr);
    }
     await new Promise(resolve => setTimeout(resolve, 200));
  }
};

const seedHomepage = async () => {
  log('--- Seeding Homepage ---');
  const filePath = path.join(DATA_DIR, 'homepage.md');
   if (!await fs.pathExists(filePath)) {
       error(`Homepage file not found at ${filePath}. Skipping.`);
       return;
   }
  const parsed = await parseMarkdownFile(filePath);
  if (!parsed) return;
  const { frontmatter } = parsed;
  let heroImageId = null;
  if (frontmatter.heroBackgroundImage) {
    heroImageId = await uploadImage(frontmatter.heroBackgroundImage);
     if (!heroImageId) {
       warn(`Could not upload or find hero image from URL "${frontmatter.heroBackgroundImage}". Homepage might be incomplete.`);
     }
  } else {
       warn(`heroBackgroundImage is missing in homepage.md`);
  }
  const cardComponents = [];
  if (frontmatter.cards && Array.isArray(frontmatter.cards)) {
    for (const card of frontmatter.cards) {
      let cardImageId = null;
      if (card.cardImage) {
        cardImageId = await uploadImage(card.cardImage);
         if (!cardImageId) {
            warn(`Could not upload or find card image from URL "${card.cardImage}" for card "${card.cardTitle}". Component might be incomplete.`);
         }
      } else {
          warn(`cardImage is missing for card "${card.cardTitle}" in homepage.md`);
      }
       if (card.cardTitle && card.cardLink && cardImageId) {
          cardComponents.push({
            __component: 'layout.homepage-card',
            cardTitle: card.cardTitle,
            cardLink: card.cardLink,
            cardImage: [cardImageId],
          });
      } else {
         warn(`Skipping card component "${card.cardTitle || 'Untitled'}" due to missing required fields (Title, Link, or Image Upload failed).`);
      }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  try {
    const payload = {
      heroTitle: frontmatter.heroTitle,
      heroBackgroundImage: heroImageId ? [heroImageId] : [],
      cardSectionTitle: frontmatter.cardSectionTitle || null,
      cards: cardComponents,
      publishedAt: new Date().toISOString(),
    };
     try {
        const updated = await makeRequest('PUT', '/homepage', payload);
        log(`Updated homepage (ID: ${updated.data.id})`);
    } catch (putErr) {
        error(`Failed to PUT homepage data. Check if the single type exists or if there are validation errors.`, putErr);
    }
  } catch (homeErr) {
    error('Failed to prepare or send homepage data', homeErr);
  }
};

const runSeed = async () => {
  log('Starting Strapi Seeding Script...');
  if (!STRAPI_API_URL || !STRAPI_API_TOKEN) {
    error('STRAPI_API_URL and STRAPI_API_TOKEN must be set in your .env file.');
    return;
  }
  log(`Targeting Strapi instance: ${STRAPI_API_URL}`);
  if (CLEAR_EXISTING_DATA) {
    log('--- Clearing Existing Data ---');
    await clearCollection('/nieuwsberichten', 'Nieuwsberichten');
    await clearCollection(CATEGORY_API, 'Categories');
    log('--- Finished Clearing Data ---');
  } else {
    log('CLEAR_EXISTING_DATA is false, skipping data deletion.');
      try {
          const existingCats = await makeRequest('GET', CATEGORY_API, null, { pagination: { limit: -1 } });
          if (existingCats?.data) {
              existingCats.data.forEach(cat => categoryCache.set(cat.attributes.naam, cat.id));
              log(`Fetched ${categoryCache.size} existing categories.`);
          }
      } catch (fetchErr) {
           warn('Could not fetch existing categories.', fetchErr);
      }
  }
  await seedCategories();
  await seedNieuwsberichten();
  await seedHomepage();
  log('--- Seeding Script Finished ---');
};

runSeed().catch((err) => {
  error('Seeding script encountered a critical error:', err);
  process.exit(1);
});

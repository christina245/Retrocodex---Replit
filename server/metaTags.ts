import { storage } from "./storage";

interface MetaTagData {
  title: string;
  description: string;
}

const DEFAULT_TITLE = "Retrocodex: Stuff You Might Have Learned Wrong";
const DEFAULT_DESCRIPTION = "What have you been taught that's actually untrue? Explore a library of myths and misconceptions across history, life sciences, health and fitness, gender, and more.";

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  "history": "History",
  "life-sciences": "Life Sciences",
  "everyday-life": "Everyday Life",
  "health-fitness": "Health & Fitness",
  "social-sciences": "Social Sciences",
  "gender-sexuality": "Gender & Sexuality",
  "other": "Other",
};

const SUBCATEGORY_DISPLAY_NAMES: Record<string, string> = {
  "animals": "Animals",
  "astronomy": "Astronomy",
  "beauty": "Beauty",
  "earth-science": "Earth Science",
  "food": "Food",
  "linguistics": "Linguistics",
  "music": "Music",
  "physics": "Physics",
  "technology": "Technology",
  "uncategorized": "Uncategorized",
};

export async function getMetaTagsForUrl(url: string): Promise<MetaTagData> {
  // Handle fact pages - /fact/:slug
  const factMatch = url.match(/^\/fact\/([^?#]+)/);
  if (factMatch) {
    const slug = factMatch[1];
    try {
      const fact = await storage.getFactBySlug(slug);
      if (fact) {
        // Use mythHeader for description, with fallback to default
        const description = fact.mythHeader || DEFAULT_DESCRIPTION;
        return {
          title: fact.title || DEFAULT_TITLE,
          description: description,
        };
      }
    } catch (error) {
      console.error("Error fetching fact for meta tags:", error);
    }
    return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
  }

  // Handle subcategory pages - /category/other/:subcategory
  const subcategoryMatch = url.match(/^\/category\/other\/([^?#]+)/);
  if (subcategoryMatch) {
    const subcategorySlug = subcategoryMatch[1];
    const displayName = SUBCATEGORY_DISPLAY_NAMES[subcategorySlug];
    if (displayName) {
      return {
        title: `What You Learned Wrong About ${displayName}`,
        description: `Explore common myths and misconceptions about ${displayName.toLowerCase()}. Discover what you might have been taught that's actually untrue.`,
      };
    }
  }

  // Handle category pages - /category/:category
  const categoryMatch = url.match(/^\/category\/([^?#/]+)/);
  if (categoryMatch) {
    const categorySlug = categoryMatch[1];
    const displayName = CATEGORY_DISPLAY_NAMES[categorySlug];
    if (displayName) {
      return {
        title: `What You Learned Wrong About ${displayName}`,
        description: `Explore common myths and misconceptions about ${displayName.toLowerCase()}. Discover what you might have been taught that's actually untrue.`,
      };
    }
  }

  return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
}

export function injectMetaTags(html: string, metaData: MetaTagData): string {
  let modifiedHtml = html;

  modifiedHtml = modifiedHtml.replace(
    /<title>.*?<\/title>/,
    `<title>${escapeHtml(metaData.title)}</title>`
  );

  modifiedHtml = modifiedHtml.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${escapeHtml(metaData.description)}">`
  );

  modifiedHtml = modifiedHtml.replace(
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${escapeHtml(metaData.title)}">`
  );

  modifiedHtml = modifiedHtml.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${escapeHtml(metaData.description)}">`
  );

  modifiedHtml = modifiedHtml.replace(
    /<meta name="twitter:title" content="[^"]*">/,
    `<meta name="twitter:title" content="${escapeHtml(metaData.title)}">`
  );

  modifiedHtml = modifiedHtml.replace(
    /<meta name="twitter:description" content="[^"]*">/,
    `<meta name="twitter:description" content="${escapeHtml(metaData.description)}">`
  );

  return modifiedHtml;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

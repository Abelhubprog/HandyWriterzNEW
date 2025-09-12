type StructuredData = Record<string, any>;

/**
 * Generate structured data from a template
 */
export function generateStructuredData(
  template: StructuredData,
  data: Record<string, any>
): StructuredData {
  // Deep clone the template
  const result = JSON.parse(JSON.stringify(template));

  // Recursively replace placeholders in the template
  function replaceInObject(obj: any): any {
    if (typeof obj === 'string') {
      return replacePlaceholders(obj, data);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => replaceInObject(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const newObj: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = replaceInObject(value);
      }
      return newObj;
    }
    
    return obj;
  }

  return replaceInObject(result);
}

/**
 * Replace placeholders in template strings
 */
function replacePlaceholders(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return data[key.trim()] || '';
  });
}

/**
 * Generate meta tags from SEO data
 */
export function generateMetaTags(seoData: {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  robots?: string;
}): string[] {
  const tags: string[] = [];

  if (seoData.title) {
    tags.push(`<title>${escapeHtml(seoData.title)}</title>`);
    tags.push(`<meta property="og:title" content="${escapeHtml(seoData.title)}" />`);
  }

  if (seoData.description) {
    tags.push(`<meta name="description" content="${escapeHtml(seoData.description)}" />`);
    tags.push(`<meta property="og:description" content="${escapeHtml(seoData.description)}" />`);
  }

  if (seoData.keywords?.length) {
    tags.push(`<meta name="keywords" content="${escapeHtml(seoData.keywords.join(', '))}" />`);
  }

  if (seoData.ogImage) {
    tags.push(`<meta property="og:image" content="${escapeHtml(seoData.ogImage)}" />`);
  }

  if (seoData.canonicalUrl) {
    tags.push(`<link rel="canonical" href="${escapeHtml(seoData.canonicalUrl)}" />`);
  }

  if (seoData.robots) {
    tags.push(`<meta name="robots" content="${escapeHtml(seoData.robots)}" />`);
  }

  return tags;
}

/**
 * Generate JSON-LD structured data script tag
 */
export function generateJsonLd(data: StructuredData): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate XML sitemap entry
 */
export function generateSitemapEntry(params: {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}): string {
  const { url, lastmod, changefreq, priority } = params;
  
  let entry = `  <url>\n    <loc>${escapeHtml(url)}</loc>\n`;
  
  if (lastmod) {
    entry += `    <lastmod>${lastmod}</lastmod>\n`;
  }
  
  if (changefreq) {
    entry += `    <changefreq>${changefreq}</changefreq>\n`;
  }
  
  if (priority !== undefined) {
    entry += `    <priority>${priority.toFixed(1)}</priority>\n`;
  }
  
  entry += '  </url>';
  return entry;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(rules: {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
  sitemap?: string;
}[]): string {
  return rules.map(rule => {
    let content = `User-agent: ${rule.userAgent}\n`;
    
    if (rule.allow?.length) {
      content += rule.allow.map(path => `Allow: ${path}`).join('\n') + '\n';
    }
    
    if (rule.disallow?.length) {
      content += rule.disallow.map(path => `Disallow: ${path}`).join('\n') + '\n';
    }
    
    if (rule.sitemap) {
      content += `Sitemap: ${rule.sitemap}\n`;
    }
    
    return content;
  }).join('\n');
}

/**
 * Generate social media meta tags
 */
export function generateSocialTags(data: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
}): string[] {
  const tags: string[] = [
    // Open Graph
    `<meta property="og:title" content="${escapeHtml(data.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(data.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(data.image)}" />`,
    `<meta property="og:url" content="${escapeHtml(data.url)}" />`,
    `<meta property="og:type" content="${escapeHtml(data.type || 'website')}" />`,
    
    // Twitter
    `<meta name="twitter:card" content="${data.twitterCard || 'summary_large_image'}" />`,
    `<meta name="twitter:title" content="${escapeHtml(data.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(data.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(data.image)}" />`
  ];

  if (data.twitterSite) {
    tags.push(`<meta name="twitter:site" content="${escapeHtml(data.twitterSite)}" />`);
  }

  if (data.twitterCreator) {
    tags.push(`<meta name="twitter:creator" content="${escapeHtml(data.twitterCreator)}" />`);
  }

  return tags;
}

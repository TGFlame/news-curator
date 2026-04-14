const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

const seedFile = path.join(__dirname, 'assets', 'seedUrls.json');
const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
const excludedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.css', '.js', '.json', '.xml', '.rss', '.txt', '.pdf', '.zip'];

async function loadSeedConfig() {
  const raw = await fs.readFile(seedFile, 'utf-8');
  return JSON.parse(raw);
}

function normalizeUrl(rawUrl, baseUrl) {
  try {
    const url = new URL(rawUrl, baseUrl);
    url.hash = '';

    const params = new URLSearchParams(url.search);
    for (const p of trackingParams) {
      params.delete(p);
    }

    url.search = params.toString() ? `?${params.toString()}` : '';
    let normalized = url.toString();

    if (normalized.endsWith('/') && url.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch (error) {
    return null;
  }
}

function isSameDomain(candidateUrl, baseUrl) {
  try {
    return new URL(candidateUrl).hostname === new URL(baseUrl).hostname;
  } catch (error) {
    return false;
  }
}

function isValidCrawlUrl(rawUrl, baseUrl, config) {
  if (!rawUrl || rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:') || rawUrl.startsWith('javascript:')) {
    return false;
  }

  const normalized = normalizeUrl(rawUrl, baseUrl);
  if (!normalized) {
    return false;
  }

  if (config.sameDomainOnly && !isSameDomain(normalized, baseUrl)) {
    return false;
  }

  const parsed = new URL(normalized);
  const lowerPath = parsed.pathname.toLowerCase();
  if (excludedExtensions.some(ext => lowerPath.endsWith(ext))) {
    return false;
  }

  return true;
}

async function fetchPage(url, config) {
  let attempt = 0;
  let delayMs = config.retryBackoffMs;

  while (attempt <= config.retryCount) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': config.userAgent,
          Accept: 'text/html,application/xhtml+xml',
        },
        timeout: 15000,
      });

      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }

      if (response.status === 429 || response.status === 503) {
        await sleep(delayMs);
        delayMs *= 2;
      } else {
        break;
      }
    } catch (error) {
      attempt += 1;
      if (attempt > config.retryCount) {
        console.warn(`Failed to fetch ${url} after ${config.retryCount} retries:`, error.message);
        return null;
      }
      await sleep(delayMs);
      delayMs *= 2;
    }
  }

  return null;
}

function extractLinks(html, baseUrl, config) {
  const $ = cheerio.load(html);
  const links = new Set();

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) {
      return;
    }

    const normalized = normalizeUrl(href, baseUrl);
    if (normalized && isValidCrawlUrl(normalized, baseUrl, config)) {
      links.add(normalized);
    }
  });

  return Array.from(links);
}

function extractArticleMetadata(html, url) {
  const $ = cheerio.load(html);
  const title = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
  const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
  const author = $('meta[name="author"]').attr('content') || $('meta[property="article:author"]').attr('content') || '';
  const publishDate = $('meta[property="article:published_time"]').attr('content') || $('time').attr('datetime') || '';
  const body = $('article').text().trim() || $('main').text().trim() || $('body').text().trim();

  return {
    url,
    title,
    description,
    author,
    publishDate,
    body: body ? body.slice(0, 2000) : '',
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function crawlSeedPage(seedUrl, category, config, visitedUrls) {
  console.log(`Crawling seed [${category}]: ${seedUrl}`);
  const html = await fetchPage(seedUrl, config);
  if (!html) {
    return [];
  }

  const links = extractLinks(html, seedUrl, config);
  const articleUrls = links.filter(url => !visitedUrls.has(url));

  for (const url of articleUrls) {
    visitedUrls.add(url);
  }

  return articleUrls.slice(0, 30);
}

async function crawlArticle(url, category, config) {
  console.log(`Fetching article [${category}]: ${url}`);
  const html = await fetchPage(url, config);
  if (!html) {
    return null;
  }

  return extractArticleMetadata(html, url);
}

async function crawlHandler() {
  const seedConfig = await loadSeedConfig();
  const config = seedConfig.crawlConfig;
  const categories = seedConfig.categories;
  const visitedUrls = new Set();
  const results = [];

  for (const [category, seeds] of Object.entries(categories)) {
    for (const seedUrl of seeds) {
      const articles = await crawlSeedPage(seedUrl, category, config, visitedUrls);

      for (const articleUrl of articles) {
        await sleep(config.requestDelayMs);
        const metadata = await crawlArticle(articleUrl, category, config);
        if (metadata) {
          results.push({ category, ...metadata });
        }
      }

      await sleep(config.requestDelayMs);
    }
  }

  console.log(`Crawl complete: collected ${results.length} articles.`);
  await fs.writeFile(path.join(__dirname, 'crawler-results.json'), JSON.stringify(results, null, 2), 'utf-8');
}

// Execute if run directly
if (require.main === module) {
  crawlHandler().catch(error => {
    console.error('Crawler failed:', error);
    process.exit(1);
  });
}

module.exports = {
  crawlHandler,
  loadSeedConfig,
  crawlSeedPage,
  crawlArticle
};

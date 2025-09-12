// src/crawler.js
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require('puppeteer');
const RobotsParser = require("robots-parser");

// Global browser instance for efficiency
let globalBrowser = null;

// Browser management functions
async function getBrowser() {
  if (!globalBrowser || !globalBrowser.isConnected()) {
    console.log("🚀 Launching new Puppeteer browser instance...");
    globalBrowser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor'
      ],
    });
    console.log("✅ Browser launched successfully");
  }
  return globalBrowser;
}

async function closeBrowser() {
  if (globalBrowser && globalBrowser.isConnected()) {
    console.log("🔄 Closing Puppeteer browser instance...");
    await globalBrowser.close();
    globalBrowser = null;
    console.log("✅ Browser closed successfully");
  }
}

async function fetchRobotsTxt(rootUrl) {
  try {
    if (!rootUrl || typeof rootUrl !== 'string') {
      return { success: false, error: "Invalid URL provided for robots.txt fetch" };
    }

    const robotsUrl = new URL("/robots.txt", rootUrl).toString();
    const res = await axios.get(robotsUrl, { timeout: 5000 });
    const robots = RobotsParser(robotsUrl, res.data);
    return { success: true, robots };
  } catch (error) {
    console.log(`Could not fetch robots.txt from ${rootUrl}:`, error.message);
    return { success: true, robots: null }; // Not an error - many sites don't have robots.txt
  }
}

async function fetchHtml(url) {
  try {
    // Input validation
    if (!url || typeof url !== 'string') {
      return { success: false, error: "Invalid URL provided for HTML fetch" };
    }

    console.log(`🌐 Fetching dynamic content from: ${url}`);
    
    // Get the browser instance
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
      // Set realistic user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });

      // Set reasonable timeouts
      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      // Navigate to the URL and wait for dynamic content to load
      console.log(`📄 Loading page: ${url}`);
      await page.goto(url, { 
        waitUntil: 'networkidle2', // Wait until there are no more than 2 network connections for 500ms
        timeout: 30000 
      });

      // Wait a bit more for any lazy-loaded content
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the fully rendered HTML content
      const htmlContent = await page.content();
      console.log(`✅ Successfully fetched dynamic content from ${url} (${htmlContent.length} chars)`);

      return { success: true, html: htmlContent, finalUrl: url };

    } finally {
      // Always close the page to free memory
      await page.close();
    }

  } catch (error) {
    console.error(`❌ Puppeteer fetch error for ${url}:`, error.message);
    
    // Handle different types of errors
    if (error.name === 'TimeoutError') {
      return { success: false, error: "Page load timeout" };
    } else if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
      return { success: false, error: "Domain not found" };
    } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      return { success: false, error: "Connection refused" };
    } else if (error.message.includes('net::ERR_CERT_')) {
      return { success: false, error: "SSL certificate error" };
    } else {
      return { success: false, error: error.message };
    }
  }
}

function extractTextFromHtml(html) {
  try {
    if (!html || typeof html !== 'string') {
      return { success: false, error: "Invalid HTML provided for text extraction" };
    }

    const $ = cheerio.load(html, { decodeEntities: true });
    
    // Collect structured pieces: title, meta, headings, links, images, etc.
    const collected = [];

    // Title
    const title = $('title').first().text().replace(/\s+/g, ' ').trim();
    if (title) collected.push(`TITLE: ${title}`);

    // Meta description / og:description
    const metaDesc = $('meta[name="description"]').attr('content') || 
                    $('meta[property="og:description"]').attr('content') || '';
    if (metaDesc.trim()) {
      collected.push(`META DESCRIPTION: ${metaDesc.replace(/\s+/g, ' ').trim()}`);
    }

    // Keywords
    const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
    if (metaKeywords.trim()) {
      collected.push(`KEYWORDS: ${metaKeywords.replace(/\s+/g, ' ').trim()}`);
    }

    // Headings H1-H6
    for (let i = 1; i <= 6; i++) {
      $(`h${i}`).each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text) collected.push(`H${i}: ${text}`);
      });
    }

    // Anchor text and titles
    $('a').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) collected.push(`LINK: ${text}`);
      
      const titleAttr = $(el).attr('title');
      if (titleAttr) {
        collected.push(`LINK_TITLE: ${titleAttr.replace(/\s+/g, ' ').trim()}`);
      }
    });

    // Images: alt and title attributes
    $('img').each((_, el) => {
      const alt = $(el).attr('alt');
      if (alt) {
        const altText = alt.replace(/\s+/g, ' ').trim();
        if (altText) collected.push(`IMG_ALT: ${altText}`);
      }
      
      const imgTitle = $(el).attr('title');
      if (imgTitle) {
        collected.push(`IMG_TITLE: ${imgTitle.replace(/\s+/g, ' ').trim()}`);
      }
    });

    // Form inputs: placeholders, values, labels
    $('input, textarea, button').each((_, el) => {
      const attrs = el.attribs || {};
      const candidates = ['placeholder', 'value', 'title', 'aria-label'];
      
      for (const attr of candidates) {
        if (attrs[attr]) {
          const value = String(attrs[attr]).replace(/\s+/g, ' ').trim();
          if (value) {
            collected.push(`${el.name.toUpperCase()}_${attr.toUpperCase()}: ${value}`);
          }
        }
      }
      
      // Button text content
      if (el.name && el.name.toLowerCase() === 'button') {
        const buttonText = $(el).text().replace(/\s+/g, ' ').trim();
        if (buttonText) collected.push(`BUTTON: ${buttonText}`);
      }
    });

    // Deep traverse to collect all text nodes and text-like attributes
    const body = $('body').get(0) || $.root().get(0);
    if (body) {
      const deepTextNodes = extractTextFromNode(body, $);
      for (const text of deepTextNodes) {
        // Skip very short text (less than 2 chars)
        if (text.length >= 2) {
          collected.push(text);
        }
      }
    }

    // Additional meta tags
    $('meta').each((_, el) => {
      const name = $(el).attr('name') || $(el).attr('property') || '';
      const content = $(el).attr('content') || '';
      if (content && name && name !== 'description' && name !== 'keywords') {
        collected.push(`META[${name}]: ${content.replace(/\s+/g, ' ').trim()}`);
      }
    });

    // Normalize and deduplicate while preserving order
    const normalized = collected
      .map(s => s.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    const unique = uniqueKeepOrder(normalized);
    const finalText = unique.join('\n\n');

    return { success: true, text: finalText };
  } catch (error) {
    console.error("HTML text extraction error:", error.message);
    return { success: false, error: `Text extraction failed: ${error.message}` };
  }
}

// Helper function to extract text from DOM nodes recursively
function extractTextFromNode(node, $) {
  const results = [];

  if (!node) return results;

  if (node.type === 'text') {
    const raw = node.data || '';
    const text = raw.replace(/\s+/g, ' ').trim();
    if (text) results.push(text);
    return results;
  }

  if (node.type === 'tag') {
    const tagName = node.name && node.name.toLowerCase();

    // Skip tags that don't contain user-visible text
    const SKIP_TAGS = new Set([
      'script', 'style', 'noscript', 'template', 'svg', 'iframe', 
      'meta', 'link', 'head', 'nav', 'header', 'footer'
    ]);
    
    if (SKIP_TAGS.has(tagName)) {
      return results;
    }

    // Extract text-like attributes if present
    const attribs = node.attribs || {};
    const attrCandidates = [
      'alt', 'title', 'placeholder', 'aria-label', 'value', 
      'content', 'aria-describedby', 'aria-labelledby'
    ];
    
    for (const attr of attrCandidates) {
      if (attribs[attr]) {
        const value = String(attribs[attr]).replace(/\s+/g, ' ').trim();
        if (value) results.push(value);
      }
    }

    // Recursively process children
    const children = node.children || [];
    for (const child of children) {
      results.push(...extractTextFromNode(child, $));
    }
  }

  return results;
}

// Helper function to deduplicate while preserving order
function uniqueKeepOrder(arr) {
  const seen = new Set();
  const result = [];
  
  for (const item of arr) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  
  return result;
}

async function crawlWebsite(rootUrl, maxPages = 10, progressCallback = null) {
  try {
    // Input validation
    if (!rootUrl || typeof rootUrl !== 'string') {
      return { success: false, error: "Invalid root URL provided" };
    }

    // Limit maxPages to reasonable bounds
    if (maxPages <= 0 || maxPages > 50) {
      maxPages = Math.min(Math.max(maxPages, 1), 50);
    }

    let rootDomain;
    try {
      rootDomain = new URL(rootUrl).hostname;
    } catch (error) {
      return { success: false, error: "Invalid URL format" };
    }

    const queue = [rootUrl];
    const seen = new Set([rootUrl]);
    const results = [];
    const errors = [];

    // Fetch robots.txt
    const robotsResult = await fetchRobotsTxt(rootUrl);
    const robots = robotsResult.success ? robotsResult.robots : null;

    let processedPages = 0;
    const maxProcessingAttempts = maxPages * 3; // Allow more attempts to find good pages
    let lastReportedProgress = 0;

    console.log(`🔍 Starting crawl of ${rootUrl} (max ${maxPages} pages)`);

    // Initial progress update
    if (progressCallback) {
      await progressCallback(5, `Starting crawl of ${rootUrl}...`);
      lastReportedProgress = 5;
    }

    while (queue.length && results.length < maxPages && processedPages < maxProcessingAttempts) {
      const url = queue.shift();
      processedPages++;

      console.log(`📄 Crawling page ${processedPages}: ${url}`);

      // Update progress at start of page processing
      // Progress range: 5% to 40% (35% total for crawling phase)  
      // Use a simple linear progression based on target pages
      const startProgress = Math.min(5 + Math.floor((processedPages - 1) / maxPages * 35), 39);
      if (progressCallback && startProgress > lastReportedProgress) {
        await progressCallback(startProgress, `Starting page ${processedPages}: ${url}`);
        lastReportedProgress = startProgress;
      }

      // Check robots.txt
      if (robots && !robots.isAllowed(url, "Mozilla/5.0")) {
        console.log(`🚫 Skipping ${url} - blocked by robots.txt`);
        continue;
      }

      // Skip problematic URLs
      if (shouldSkipUrl(url)) {
        console.log(`⏭️  Skipping ${url} - problematic URL pattern`);
        continue;
      }

      // Fetch HTML
      const htmlResult = await fetchHtml(url);
      if (!htmlResult.success) {
        errors.push({ url, error: htmlResult.error });
        console.log(`❌ Failed to fetch ${url}: ${htmlResult.error}`);
        continue;
      }

      // Extract text
      const textResult = extractTextFromHtml(htmlResult.html);
      if (!textResult.success) {
        errors.push({ url, error: textResult.error });
        console.log(`❌ Failed to extract text from ${url}: ${textResult.error}`);
        continue;
      }

      // Log the full extracted text for debugging
      console.log(`\n� FULL TEXT CONTENT FROM ${url}:`);
      console.log(`${'='.repeat(80)}`);
      console.log(textResult.text);
      console.log(`${'='.repeat(80)}`);
      console.log(`📊 Content length: ${textResult.text.length} characters\n`);
      
      if (textResult.text.length > 20) {
        results.push({ url, text: textResult.text });
        console.log(`✅ Successfully crawled ${url} (${textResult.text.length} chars)`);
        
        // Update progress after successfully processing a page
        const completedProgress = Math.min(5 + Math.floor((results.length) / maxPages * 35), 39);
        if (progressCallback && completedProgress > lastReportedProgress) {
          await progressCallback(completedProgress, `Completed ${results.length}/${maxPages} pages: ${url}`);
          lastReportedProgress = completedProgress;
        }
      } else {
        console.log(`⚠️  Page ${url} has insufficient content (${textResult.text.length} chars)`);
      }

      // Find more links to crawl (simple selection)
      try {
        const $ = cheerio.load(htmlResult.html);
        let linksAdded = 0;
        
        $("a[href]").each((_, a) => {
          if (linksAdded >= 5) return false; // Limit links per page
          
          const href = $(a).attr("href");
          if (!href) return;
          
          try {
            const absolute = new URL(href, url).toString();
            const absoluteUrl = new URL(absolute);
            
            // Only crawl same domain
            if (absoluteUrl.hostname !== rootDomain) return;
            
            // Skip problematic URLs
            if (shouldSkipUrl(absolute)) return;
            
            // Only HTTP/HTTPS
            if (!absolute.startsWith("http")) return;
            
            // Avoid duplicates
            if (!seen.has(absolute)) {
              seen.add(absolute);
              queue.push(absolute);
              linksAdded++;
            }
          } catch (linkError) {
            // Ignore invalid links
          }
        });
        
        console.log(`🔗 Added ${linksAdded} new links from ${url}`);
        
        // Small progress update after link discovery
        if (linksAdded > 0 && progressCallback) {
          const linkProgress = Math.min(lastReportedProgress + 1, 39);
          if (linkProgress > lastReportedProgress) {
            await progressCallback(linkProgress, `Discovered ${linksAdded} new links from ${url}`);
            lastReportedProgress = linkProgress;
          }
        }
      } catch (linkParsingError) {
        errors.push({ url, error: "Failed to parse links from page" });
      }

      // Add small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`✅ Crawl completed: ${results.length} pages found, ${errors.length} errors`);

    // Final crawling progress update
    if (progressCallback) {
      await progressCallback(40, `Crawling completed: ${results.length} pages found`);
    }

    return { 
      success: true, 
      results,
      stats: {
        pagesFound: results.length,
        totalProcessed: processedPages,
        errors: errors.length,
        rootUrl,
        maxPagesLimit: maxPages,
        queueRemaining: queue.length
      },
      errors: errors.slice(0, 5) // Limit error reporting
    };

  } catch (error) {
    console.error("Website crawling error:", error.message);
    return { 
      success: false, 
      error: `Crawling failed: ${error.message}` 
    };
  }
}

// Helper function to skip problematic URLs
function shouldSkipUrl(url) {
  const skipPatterns = [
    '/login', '/signup', '/register', '/account', '/profile',
    '/cart', '/checkout', '/order', '/payment',
    '/admin', '/wp-admin', '/dashboard',
    '/search', '/filter', '?search', '?filter',
    '/api/', '/ajax/', '/json',
    '.pdf', '.doc', '.zip', '.exe', '.dmg',
    '/mailto:', 'tel:', 'javascript:',
    '#', '?ref=', '?utm_', '?fbclid',
    '/gp/', '/dp/', '/s?', // Amazon specific
  ];

  const urlLower = url.toLowerCase();
  return skipPatterns.some(pattern => urlLower.includes(pattern));
}

module.exports = {
  fetchRobotsTxt,
  fetchHtml,
  extractTextFromHtml,
  crawlWebsite,
  getBrowser,
  closeBrowser,
};

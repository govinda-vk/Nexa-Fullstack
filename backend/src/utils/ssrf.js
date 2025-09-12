// src/utils/ssrf.js
// CommonJS module
// npm install ipaddr.js
const dns = require('dns').promises;
const ipaddr = require('ipaddr.js');

const DEFAULT_OPTIONS = {
  allowedProtocols: ['http:', 'https:'],
  allowPrivate: false,       // whether to allow private IP ranges (default: false)
  whitelistHostnames: [],    // hosts that are allowed even if IP looks private (array of hostnames)
  timeoutMs: 5000,
};

function isPrivateAddress(addr) {
  // addr: string IP
  try {
    const parsed = ipaddr.parse(addr);
    const range = parsed.range(); // returns strings like: 'unspecified','broadcast','multicast','linkLocal','loopback','private','reserved','uniqueLocal', etc
    // treat these as disallowed unless allowPrivate is set:
    const disallowedRanges = ['loopback', 'linkLocal', 'private', 'uniqueLocal', 'unspecified', 'broadcast', 'reserved', 'carrierGradeNat'];
    return disallowedRanges.includes(range);
  } catch (e) {
    // If parsing fails, be conservative and treat as private
    return true;
  }
}

/**
 * Validate a URL string for SSRF safety.
 * Returns { valid: true, url: parsedURL } on success.
 * Returns { valid: false, error: string } on failure.
 *
 * options: same shape as DEFAULT_OPTIONS
 */
async function validateUrl(urlString, options = {}) {
  const opt = Object.assign({}, DEFAULT_OPTIONS, options);

  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, error: 'No URL provided' };
  }

  let parsed;
  try {
    parsed = new URL(urlString);
  } catch (err) {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Protocol check
  if (!opt.allowedProtocols.includes(parsed.protocol)) {
    return { valid: false, error: `Protocol not allowed: ${parsed.protocol}. Allowed: ${opt.allowedProtocols.join(', ')}` };
  }

  // Basic hosts like "localhost" or empty hostname
  const hostname = parsed.hostname;
  if (!hostname) {
    return { valid: false, error: 'URL must have a hostname' };
  }

  // Allow explicit whitelist hostnames (exact match)
  if (opt.whitelistHostnames && opt.whitelistHostnames.includes(hostname)) {
    return { valid: true, url: parsed };
  }

  // Resolve DNS to actual IPs (both A and AAAA)
  let addresses;
  try {
    // dns.lookup with all:true returns array of {address, family}
    addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch (err) {
    // If DNS fails, be conservative and reject
    return { valid: false, error: `DNS lookup failed for hostname: ${hostname}` };
  }

  if (!Array.isArray(addresses) || addresses.length === 0) {
    return { valid: false, error: `No IPs resolved for hostname: ${hostname}` };
  }

  // Check all resolved addresses for private/loopback/link-local etc.
  for (const a of addresses) {
    const ip = a.address;
    if (!opt.allowPrivate && isPrivateAddress(ip)) {
      return { valid: false, error: `Resolved IP ${ip} for ${hostname} is in a disallowed range` };
    }
  }

  return { valid: true, url: parsed };
}

/**
 * Express middleware wrapper.
 * Looks for URL in req.body.websiteUrl, req.query.websiteUrl or req.params.websiteUrl (in that order).
 * If no URL present, it just calls next().
 *
 * Usage:
 * const ssrf = require('./utils/ssrf');
 * app.post('/ingest', ssrf.middleware({ whitelistHostnames: ['example.com'] }), handler);
 */
function middleware(options) {
  return async function (req, res, next) {
    try {
      const url = (req.body && req.body.websiteUrl) ||
        (req.query && req.query.websiteUrl) ||
        (req.params && req.params.websiteUrl);

      if (!url) return next();

      const validation = await validateUrl(url, options);
      if (!validation.valid) {
        return res.status(400).json({ 
          error: 'Invalid or disallowed URL', 
          reason: validation.error 
        });
      }
      
      return next();
    } catch (err) {
      console.error('SSRF middleware error:', err);
      return res.status(500).json({ 
        error: 'URL validation failed', 
        reason: 'Internal server error during validation' 
      });
    }
  };
}

module.exports = {
  validateUrl,
  middleware,
};

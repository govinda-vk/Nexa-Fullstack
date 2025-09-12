// src/utils/rateLimit.js
// CommonJS module
// Simple in-memory rate limiter. NOT suitable for horizontally scaled apps.
// For production, back this with Redis (e.g., use redlock or a Redis-based token bucket).
//
// Usage:
// const rateLimit = require('./utils/rateLimit');
// app.use(rateLimit({ windowMs:60000, max:60 })); // 60 reqs/min per key (default key = req.ip)

const DEFAULTS = {
    windowMs: 60 * 1000, // 1 minute
    max: 60,             // max requests per window per key
    keyGenerator: (req) => req.ip || (req.headers && req.headers['x-forwarded-for']) || 'unknown',
    skip: null,          // optional (req) => boolean to skip rate limiting for some requests
    headers: true,       // include RateLimit headers
};

function createRateLimiter(opts = {}) {
    const conf = Object.assign({}, DEFAULTS, opts);
    // store: Map<key, {count:number, reset:number}>
    const store = new Map();

    function cleanup() {
        const now = Date.now();
        for (const [k, v] of store.entries()) {
            if (v.reset <= now) store.delete(k);
        }
    }
    // schedule cleanup every minute
    setInterval(cleanup, Math.max(1000, Math.floor(conf.windowMs / 2))).unref();

    return function rateLimiterMiddleware(req, res, next) {
        try {
            if (typeof conf.skip === 'function' && conf.skip(req)) return next();

            const key = conf.keyGenerator(req) || 'unknown';
            const now = Date.now();
            let entry = store.get(key);

            if (!entry || entry.reset <= now) {
                // initialize window
                entry = { count: 1, reset: now + conf.windowMs };
                store.set(key, entry);
            } else {
                entry.count += 1;
            }

            // Add headers if requested
            if (conf.headers) {
                const remaining = Math.max(0, conf.max - entry.count);
                res.setHeader('X-RateLimit-Limit', String(conf.max));
                res.setHeader('X-RateLimit-Remaining', String(Math.max(0, remaining)));
                res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.reset / 1000))); // epoch seconds
            }

            if (entry.count > conf.max) {
                const retrySecs = Math.ceil((entry.reset - now) / 1000);
                if (conf.headers) res.setHeader('Retry-After', String(retrySecs));
                res.status(429).json({ error: 'Too many requests', retryAfterSeconds: retrySecs });
                return;
            }

            return next();
        } catch (err) {
            // Fail-open: if limiter errors, allow the request (but log your error server-side)
            console.error('Rate limiter error', err);
            return next();
        }
    };
}

module.exports = createRateLimiter;

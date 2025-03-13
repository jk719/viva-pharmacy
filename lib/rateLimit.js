import { LRUCache } from 'lru-cache';

// Create options object for the cache
const cacheOptions = {
  max: 500,
  ttl: 60 * 1000, // 1 minute in milliseconds
  updateAgeOnGet: true
};

const sseCacheOptions = {
  max: 100,
  ttl: 300 * 1000, // 5 minutes in milliseconds
  updateAgeOnGet: true
};

// Initialize caches
const tokenCache = new LRUCache(cacheOptions);
const sseTokenCache = new LRUCache(sseCacheOptions);

class RateLimit {
  async check(request, limit = 60, window = 60000, type = 'api') {
    try {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
      const userId = request.headers.get('x-user-id');
      
      // Use different cache keys for different types of requests
      const key = type.startsWith('sse') 
        ? `sse-${userId || ip}`
        : `${type}-${userId || ip}`;
      
      let tokens = tokenCache.get(key);
      if (tokens === undefined) {
        tokens = limit;
        tokenCache.set(key, tokens);
      }
      
      if (tokens <= 0) {
        return { 
          success: false, 
          retryAfter: Math.ceil(window / 1000)
        };
      }

      tokenCache.set(key, tokens - 1);
      
      return { 
        success: true, 
        remaining: tokens - 1
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { success: true }; // Fail open for better UX
    }
  }
}

// Create and export a single instance
const rateLimit = new RateLimit();
export default rateLimit; 
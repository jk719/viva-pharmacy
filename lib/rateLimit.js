import { LRUCache } from 'lru-cache';

const tokenCache = new LRUCache({
  max: 1000,
  ttl: 60000, // 1 minute
  updateAgeOnGet: true
});

const sseTokenCache = new LRUCache({
  max: 500,
  ttl: 300000, // 5 minutes for SSE connections
});

export const rateLimit = {
  check: async function(req, limit = 30, interval = 60000, type = 'default') {
    try {
      const cache = type === 'sse' ? sseTokenCache : tokenCache;
      const ip = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'anonymous';
      
      const key = `${ip}_${type}`;
      const tokenCount = (cache.get(key) || 0) + 1;
      
      if (tokenCount > limit) {
        return {
          success: false,
          retryAfter: Math.ceil(interval / 1000)
        };
      }

      cache.set(key, tokenCount);
      return { success: true };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { success: true }; // Fail open
    }
  }
};

export default rateLimit; 
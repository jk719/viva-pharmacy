import { LRUCache } from 'lru-cache';

// Create the cache instance
const tokenCache = new LRUCache({
  max: 500,
  ttl: 60000, // 1 minute
});

const rateLimit = {
  getTokens: function(ip) {
    const tokenCount = tokenCache.get(ip) || 0;
    return tokenCount;
  },

  takeToken: function(ip) {
    const tokenCount = this.getTokens(ip);
    const newCount = tokenCount + 1;
    tokenCache.set(ip, newCount);
    return newCount;
  },

  check: function(req, limit = 30) {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const tokenCount = this.takeToken(ip);
    
    if (tokenCount > limit) {
      return false;
    }
    return true;
  }
};

export default rateLimit; 
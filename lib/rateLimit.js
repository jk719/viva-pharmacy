import { LRUCache } from 'lru-cache';

// Create the cache instance with more specific options
const tokenCache = new LRUCache({
  max: 500,
  ttl: 60000, // 1 minute
  updateAgeOnGet: true,
  updateAgeOnHas: true
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
    try {
      // Get IP from various possible headers
      const ip = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 req.headers.get('x-client-ip') || 
                 'anonymous';
      
      const tokenCount = this.takeToken(ip);
      
      if (tokenCount > limit) {
        console.log(`Rate limit exceeded for IP: ${ip}, count: ${tokenCount}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      // Default to allowing the request in case of errors
      return true;
    }
  },

  reset: function(ip) {
    return tokenCache.delete(ip);
  },

  // Helper method for testing
  getCurrentCount: function(ip) {
    return this.getTokens(ip);
  }
};

export default rateLimit; 
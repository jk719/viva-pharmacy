class SSEManager {
  constructor() {
    if (typeof window !== 'undefined') {
      if (window._sseManagerInstance) {
        return window._sseManagerInstance;
      }
      window._sseManagerInstance = this;
    }
    
    this.connection = null;
    this.userId = null;
    this.listeners = new Set();
    this.connectionPromise = null;
    this.isConnecting = false;
    this.connectionId = null;
    this.retryTimeout = null;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.lastConnectionAttempt = null;
  }

  async connect(userId) {
    if (this.connection && this.userId === userId) {
      console.log('📡 Using existing SSE connection for user', userId);
      return this.connection;
    }

    if (this.isConnecting) {
      console.log('⏳ Waiting for existing connection attempt...');
      return this.connectionPromise;
    }

    this.cleanup();
    this.isConnecting = true;
    this.connectionId = `${userId}-${Date.now()}`;

    // Add rate limiting for connection attempts
    const now = Date.now();
    const lastAttempt = this.lastConnectionAttempt || 0;
    const timeSinceLastAttempt = now - lastAttempt;

    if (timeSinceLastAttempt < 1000) { // Minimum 1 second between attempts
      console.log('🚦 Rate limiting connection attempt, waiting...');
      await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastAttempt));
    }

    this.lastConnectionAttempt = Date.now();

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        console.log(`🔌 Creating new SSE connection (${this.connectionId})`);
        
        const url = new URL(`/api/user/vivabucks/${userId}/events`, window.location.origin);
        url.searchParams.set('connectionId', this.connectionId);
        
        const eventSource = new EventSource(url.toString());
        this.connection = eventSource;
        this.userId = userId;

        eventSource.onopen = () => {
          console.log(`📡 SSE connection established (${this.connectionId})`);
          this.isConnecting = false;
          this.retryCount = 0;
          resolve(eventSource);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type !== 'HEARTBEAT') {
              console.log(`📨 SSE (${this.connectionId}): Received event:`, data);
              this.notifyListeners(data);
            }
          } catch (error) {
            console.error(`Error parsing SSE message (${this.connectionId}):`, error);
          }
        };

        eventSource.onerror = (error) => {
          console.error(`❌ SSE (${this.connectionId}): Connection error:`, error);
          this.handleError(error, reject);
        };
      } catch (error) {
        this.handleError(error, reject);
      }
    });

    return this.connectionPromise;
  }

  handleError(error, reject) {
    this.isConnecting = false;
    
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }

    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
      console.log(`🔄 Scheduling retry ${this.retryCount}/${this.maxRetries} in ${delay}ms`);
      
      this.retryTimeout = setTimeout(() => {
        this.connect(this.userId).catch(console.error);
      }, delay);
    } else {
      console.log('❌ Max retries reached');
      reject(error);
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => callback(data));
  }

  cleanup() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    if (this.connection) {
      console.log(`🔌 Closing SSE connection (${this.connectionId})`);
      this.connection.close();
      this.connection = null;
      this.userId = null;
      this.connectionPromise = null;
      this.connectionId = null;
    }
    
    this.isConnecting = false;
    this.retryCount = 0;
  }
}

const sseManager = typeof window !== 'undefined' ? new SSEManager() : null;
export default sseManager; 
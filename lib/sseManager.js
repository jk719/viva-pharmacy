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
    this.connectionTimeout = null;
    this.minReconnectDelay = 2000;
    this.connectionCheckInterval = null;
    this.heartbeatMissed = 0;
    this.maxHeartbeatMisses = 3;
  }

  async connect(userId) {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      console.error('Invalid userId provided to SSE connection:', userId);
      return Promise.reject(new Error('Invalid userId'));
    }

    // If already connecting, wait for that connection
    if (this.isConnecting && this.connectionPromise) {
      console.log('⏳ Waiting for existing connection attempt...');
      return this.connectionPromise;
    }

    // If we already have a valid connection for this user, use it
    if (this.connection && this.userId === userId && this.connection.readyState === 1) {
      console.log('📡 Using existing SSE connection for user', userId);
      return this.connection;
    }

    const now = Date.now();
    if (this.lastConnectionAttempt && (now - this.lastConnectionAttempt) < this.minReconnectDelay) {
      console.log('🚫 Preventing rapid reconnection');
      await new Promise(resolve => setTimeout(resolve, this.minReconnectDelay));
    }

    this.lastConnectionAttempt = now;
    this.cleanup(false); // Don't reset userId immediately
    this.isConnecting = true;
    this.connectionId = `${userId}-${Date.now()}`;

    console.log(`🔌 Attempting new SSE connection (${this.connectionId})`);

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const url = new URL(`/api/user/vivabucks/${userId}/events`, window.location.origin);
        url.searchParams.set('connectionId', this.connectionId);
        
        const eventSource = new EventSource(url.toString());
        this.connection = eventSource;
        this.userId = userId;
        this.heartbeatMissed = 0;

        eventSource.onopen = () => {
          console.log(`📡 SSE connection established (${this.connectionId})`);
          this.isConnecting = false;
          this.retryCount = 0;
          this.startHeartbeatCheck();
          resolve(eventSource);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'CONNECTED') {
              console.log(`✅ SSE connection confirmed (${this.connectionId})`);
            } else if (data.type === 'HEARTBEAT') {
              this.heartbeatMissed = 0;
            } else {
              console.log(`📨 SSE (${this.connectionId}): Received event:`, data);
            }
            this.notifyListeners(data);
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

  startHeartbeatCheck() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    
    this.connectionCheckInterval = setInterval(() => {
      this.heartbeatMissed++;
      if (this.heartbeatMissed >= this.maxHeartbeatMisses) {
        console.log('💔 Heartbeat check failed, reconnecting...');
        this.cleanup();
        if (this.userId) {
          this.connect(this.userId).catch(console.error);
        }
      }
    }, 45000); // Check every 45 seconds (heartbeat is every 30 seconds)
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
      
      // Notify listeners of connection status
      this.notifyListeners({
        type: 'CONNECTION_STATUS',
        status: 'reconnecting',
        retryCount: this.retryCount,
        delay
      });
      
      this.retryTimeout = setTimeout(() => {
        this.connect(this.userId).catch(console.error);
      }, delay);
    } else {
      console.log('❌ Max retries reached');
      this.notifyListeners({
        type: 'CONNECTION_STATUS',
        status: 'failed',
        error: error.message
      });
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

  cleanup(resetUserId = true) {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
    
    if (this.connection) {
      console.log(`🔌 Closing SSE connection (${this.connectionId})`);
      this.connection.close();
      this.connection = null;
    }

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    if (resetUserId) {
      setTimeout(() => {
        this.userId = null;
        this.connectionPromise = null;
        this.connectionId = null;
        this.isConnecting = false;
        this.retryCount = 0;
        this.heartbeatMissed = 0;
      }, this.minReconnectDelay);
    }
  }
}

const sseManager = typeof window !== 'undefined' ? new SSEManager() : null;
export default sseManager;
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
    this.heartbeatInterval = 30000;
    this.isReconnecting = false;
    this.lastHeartbeat = null;
    this.pendingEvents = new Set();
    this.eventRetryCount = new Map();
    this.maxEventRetries = 3;
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
      // Check if we've received a heartbeat recently
      if (this.lastHeartbeat && (Date.now() - this.lastHeartbeat) < this.heartbeatInterval * 2) {
        console.log('📡 Using existing SSE connection for user', userId);
        return this.connection;
      } else {
        console.log('💔 Connection stale, reconnecting...');
        this.cleanup(false);
      }
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
        const url = new URL(`/api/user/events`, window.location.origin);
        url.searchParams.set('userId', userId);
        url.searchParams.set('connectionId', this.connectionId);
        url.searchParams.set('lastEventId', Array.from(this.pendingEvents).join(','));
        
        const eventSource = new EventSource(url.toString());
        this.connection = eventSource;
        this.userId = userId;
        this.heartbeatMissed = 0;
        this.lastHeartbeat = Date.now();

        eventSource.onopen = () => {
          console.log(`📡 SSE connection established (${this.connectionId})`);
          this.isConnecting = false;
          this.isReconnecting = false;
          this.retryCount = 0;
          this.startHeartbeatCheck();
          resolve(eventSource);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'CONNECTED') {
              console.log(`✅ SSE connection confirmed (${this.connectionId})`);
              this.lastHeartbeat = Date.now();
              // Clear pending events on successful connection
              this.pendingEvents.clear();
              this.eventRetryCount.clear();
            } else if (data.type === 'HEARTBEAT') {
              this.heartbeatMissed = 0;
              this.lastHeartbeat = Date.now();
            } else {
              console.log(`📨 SSE (${this.connectionId}): Received event:`, data);
              if (data.id) {
                this.pendingEvents.add(data.id);
                this.retryEvent(data);
              }
            }
            this.notifyListeners(data);
          } catch (error) {
            console.error(`Error parsing SSE message (${this.connectionId}):`, error);
            this.handleMessageError(error);
          }
        };

        eventSource.onerror = (error) => {
          // Check if this is likely a navigation-related disconnection
          const isNavigationError = document.visibilityState === 'hidden' || 
                                   (typeof error === 'object' && error && error.isTrusted === true);
          
          if (isNavigationError) {
            // Just a navigation event, log at debug level rather than as an error
            console.log(`🛑 SSE (${this.connectionId}): Navigation disconnect detected`);
            // Still close the connection but don't treat as an error
            this.cleanup(false);
            // Don't reject the promise - this isn't a 'real' error
          } else {
            // This is a genuine error that should be logged and handled
            console.error(`❤️ SSE (${this.connectionId}): Connection error:`, error);
            this.handleError(error, reject);
          }
        };

      } catch (error) {
        this.handleError(error, reject);
      }
    });

    return this.connectionPromise;
  }

  retryEvent(data) {
    const eventId = data.id;
    if (!eventId) return;

    const retryCount = this.eventRetryCount.get(eventId) || 0;
    if (retryCount >= this.maxEventRetries) {
      console.error(`Max retries reached for event ${eventId}`);
      this.pendingEvents.delete(eventId);
      this.eventRetryCount.delete(eventId);
      return;
    }

    this.eventRetryCount.set(eventId, retryCount + 1);
    
    // Attempt to process the event
    try {
      this.notifyListeners(data);
      this.pendingEvents.delete(eventId);
      this.eventRetryCount.delete(eventId);
    } catch (error) {
      console.error(`Error processing event ${eventId}:`, error);
      // Will be retried on next connection
    }
  }

  handleMessageError(error) {
    console.error('Message processing error:', error);
    // Notify listeners of the error but don't reconnect
    this.notifyListeners({
      type: 'ERROR',
      error: error.message,
      timestamp: Date.now()
    });
  }

  startHeartbeatCheck() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    
    this.connectionCheckInterval = setInterval(() => {
      this.heartbeatMissed++;
      const timeSinceLastHeartbeat = Date.now() - (this.lastHeartbeat || 0);
      
      if (this.heartbeatMissed >= this.maxHeartbeatMisses || 
          timeSinceLastHeartbeat > this.heartbeatInterval * 2) {
        console.log('💔 Heartbeat check failed, reconnecting...');
        if (!this.isReconnecting) {
          this.isReconnecting = true;
          this.cleanup(false);
          if (this.userId) {
            setTimeout(() => {
              this.connect(this.userId)
                .catch(console.error)
                .finally(() => {
                  this.isReconnecting = false;
                });
            }, 1000);
          }
        }
      }
    }, this.heartbeatInterval);
  }

  handleError(error, reject) {
    this.isConnecting = false;
    
    // Check if this appears to be a navigation-related error
    const isNavigationError = document.visibilityState === 'hidden' || 
                           (typeof error === 'object' && error && error.isTrusted === true);
    
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    
    // For navigation errors, don't retry, just clean up
    if (isNavigationError) {
      console.log('📱 Navigation detected, not retrying SSE connection');
      return;
    }

    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      // Use much smaller fixed delay of 200ms instead of exponential backoff
      // This prevents long waits during checkout flow
      const delay = 200; // Fixed delay of 200ms 
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
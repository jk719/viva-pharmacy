import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useRateLimit() {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState(null);

  const handleRateLimit = useCallback((error, retryCallback) => {
    if (error.isRateLimit) {
      const seconds = error.retryAfter || 60;
      setIsRateLimited(true);
      setRetryAfter(seconds);

      toast.error(
        `Too many requests. Please wait ${seconds} seconds before trying again.`,
        { duration: seconds * 1000 }
      );

      // Set up automatic retry
      const timeoutId = setTimeout(() => {
        setIsRateLimited(false);
        setRetryAfter(0);
        if (retryCallback) {
          retryCallback();
        }
      }, seconds * 1000);

      setRetryTimeout(timeoutId);
      return true;
    }
    return false;
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryTimeout]);

  return {
    isRateLimited,
    retryAfter,
    handleRateLimit
  };
} 
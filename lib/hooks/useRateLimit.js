import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

export function useRateLimit(options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000
  } = options;

  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const retryCount = useRef(0);
  const timeoutRef = useRef(null);

  const handleRateLimit = useCallback((error, retryCallback) => {
    if (error.status === 429) {
      const retrySeconds = parseInt(error.headers?.get('Retry-After')) || 60;
      const backoffDelay = Math.min(
        baseDelay * (2 ** retryCount.current),
        maxDelay
      );

      setIsRateLimited(true);
      setRetryAfter(retrySeconds);

      if (retryCount.current < maxRetries) {
        toast.error(
          `Too many requests. Retrying in ${Math.ceil(backoffDelay / 1000)} seconds...`,
          { duration: backoffDelay }
        );

        timeoutRef.current = setTimeout(() => {
          setIsRateLimited(false);
          setRetryAfter(0);
          retryCount.current += 1;
          if (retryCallback) retryCallback();
        }, backoffDelay);

        return true;
      } else {
        toast.error('Maximum retry attempts reached. Please try again later.');
        return false;
      }
    }
    return false;
  }, [maxRetries, baseDelay, maxDelay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    retryCount.current = 0;
    setIsRateLimited(false);
    setRetryAfter(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    isRateLimited,
    retryAfter,
    handleRateLimit,
    reset
  };
} 
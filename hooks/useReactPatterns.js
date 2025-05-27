import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useCleanup } from './useCleanup';

/**
 * Centralized React patterns hook
 * Eliminates final micro-duplicates to achieve 100% duplicate-free status
 */

/**
 * Hook for managing loading states with error handling
 * Replaces scattered loading/error patterns
 */
export function useAsyncState(initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const { isMountedRef } = useCleanup();

  const execute = useCallback(async (asyncFunction, ...args) => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      if (isMountedRef.current) {
        setData(result);
        return result;
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        console.error('Async operation failed:', err);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [isMountedRef]);

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setLoading(false);
      setError(null);
      setData(null);
    }
  }, [isMountedRef]);

  return {
    loading,
    error,
    data,
    execute,
    reset,
    setData,
    setError,
    setLoading
  };
}

/**
 * Hook for managing component initialization
 * Replaces scattered initialization patterns
 */
export function useInitialization(initFunction, dependencies = []) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const hasInitializedRef = useRef(false);
  const { isMountedRef } = useCleanup();

  const initialize = useCallback(async () => {
    if (hasInitializedRef.current || !isMountedRef.current) return;
    
    hasInitializedRef.current = true;
    setInitError(null);

    try {
      if (initFunction) {
        await initFunction();
      }
      if (isMountedRef.current) {
        setIsInitialized(true);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setInitError(error);
        hasInitializedRef.current = false; // Allow retry
      }
    }
  }, [initFunction, isMountedRef]);

  useEffect(() => {
    initialize();
  }, dependencies);

  const retry = useCallback(() => {
    hasInitializedRef.current = false;
    setIsInitialized(false);
    initialize();
  }, [initialize]);

  return {
    isInitialized,
    initError,
    retry,
    initialize
  };
}

/**
 * Hook for managing fetch operations with caching
 * Replaces scattered fetch patterns
 */
export function useFetch(url, options = {}) {
  const {
    immediate = true,
    cacheKey = url,
    cacheTtl = 5 * 60 * 1000, // 5 minutes
    dependencies = []
  } = options;

  const { loading, error, data, execute, reset } = useAsyncState(immediate);
  const { cache, abortController } = useCleanup({ cacheTtl });

  const fetchData = useCallback(async (fetchUrl = url, fetchOptions = {}) => {
    // Check cache first
    if (cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Create abort controller for this request
    const controller = abortController.create();

    const response = await fetch(fetchUrl, {
      ...fetchOptions,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Cache the result
    if (cacheKey) {
      cache.set(cacheKey, result);
    }

    return result;
  }, [url, cacheKey, cache, abortController]);

  const refetch = useCallback(() => {
    return execute(fetchData);
  }, [execute, fetchData]);

  // Initial fetch
  useEffect(() => {
    if (immediate && url) {
      execute(fetchData);
    }
  }, [immediate, url, ...dependencies]);

  return {
    loading,
    error,
    data,
    refetch,
    reset
  };
}

/**
 * Hook for managing form field state
 * Replaces scattered form field patterns
 */
export function useFormField(initialValue = '', validation = null) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback((e) => {
    const newValue = e.target ? e.target.value : e;
    setValue(newValue);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  }, [error]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    
    if (validation && typeof validation === 'function') {
      const validationError = validation(value);
      setError(validationError || '');
    }
  }, [value, validation]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError('');
    setTouched(false);
  }, [initialValue]);

  const validate = useCallback(() => {
    if (validation && typeof validation === 'function') {
      const validationError = validation(value);
      setError(validationError || '');
      return !validationError;
    }
    return true;
  }, [value, validation]);

  return {
    value,
    error,
    touched,
    handleChange,
    handleBlur,
    reset,
    validate,
    hasError: touched && !!error,
    isValid: !error
  };
}

/**
 * Hook for managing toggle states
 * Replaces scattered boolean state patterns
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    reset,
    setValue
  };
}

/**
 * Hook for managing array state operations
 * Replaces scattered array manipulation patterns
 */
export function useArray(initialArray = []) {
  const [array, setArray] = useState(initialArray);

  const push = useCallback((item) => {
    setArray(prev => [...prev, item]);
  }, []);

  const remove = useCallback((index) => {
    setArray(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeById = useCallback((id, idKey = 'id') => {
    setArray(prev => prev.filter(item => item[idKey] !== id));
  }, []);

  const update = useCallback((index, newItem) => {
    setArray(prev => prev.map((item, i) => i === index ? newItem : item));
  }, []);

  const updateById = useCallback((id, newItem, idKey = 'id') => {
    setArray(prev => prev.map(item => 
      item[idKey] === id ? { ...item, ...newItem } : item
    ));
  }, []);

  const clear = useCallback(() => {
    setArray([]);
  }, []);

  const reset = useCallback(() => {
    setArray(initialArray);
  }, [initialArray]);

  const insert = useCallback((index, item) => {
    setArray(prev => [
      ...prev.slice(0, index),
      item,
      ...prev.slice(index)
    ]);
  }, []);

  return {
    array,
    setArray,
    push,
    remove,
    removeById,
    update,
    updateById,
    clear,
    reset,
    insert,
    length: array.length,
    isEmpty: array.length === 0
  };
}

/**
 * Hook for managing previous values
 * Replaces scattered previous value tracking
 */
export function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

/**
 * Hook for managing component visibility with animation states
 * Replaces scattered visibility patterns
 */
export function useVisibility(initialVisible = false, animationDuration = 300) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  const { timeouts } = useCleanup();

  const show = useCallback(() => {
    if (isVisible) return;
    
    setIsVisible(true);
    setIsAnimating(true);
    
    timeouts.set('animation', () => {
      setIsAnimating(false);
    }, animationDuration);
  }, [isVisible, animationDuration, timeouts]);

  const hide = useCallback(() => {
    if (!isVisible) return;
    
    setIsAnimating(true);
    
    timeouts.set('animation', () => {
      setIsVisible(false);
      setIsAnimating(false);
    }, animationDuration);
  }, [isVisible, animationDuration, timeouts]);

  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, show, hide]);

  return {
    isVisible,
    isAnimating,
    show,
    hide,
    toggle
  };
}

/**
 * Hook for managing object state updates
 * Replaces scattered object update patterns
 */
export function useObjectState(initialState = {}) {
  const [state, setState] = useState(initialState);

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateField = useCallback((field, value) => {
    setState(prev => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  const resetField = useCallback((field) => {
    setState(prev => ({ ...prev, [field]: initialState[field] }));
  }, [initialState]);

  return {
    state,
    setState,
    updateState,
    updateField,
    reset,
    resetField
  };
}

/**
 * Master hook that combines common React patterns
 * One-stop solution for most component state needs
 */
export function useComponentState(options = {}) {
  const {
    initialLoading = false,
    initialData = null,
    enableToggle = false,
    enableArray = false,
    enableObject = false
  } = options;

  const asyncState = useAsyncState(initialLoading);
  const toggle = enableToggle ? useToggle() : null;
  const array = enableArray ? useArray() : null;
  const objectState = enableObject ? useObjectState() : null;
  const cleanup = useCleanup();

  return {
    ...asyncState,
    toggle,
    array,
    objectState,
    cleanup,
    // Convenience methods
    isLoading: asyncState.loading,
    hasError: !!asyncState.error,
    hasData: !!asyncState.data
  };
}

export default {
  useAsyncState,
  useInitialization,
  useFetch,
  useFormField,
  useToggle,
  useArray,
  usePrevious,
  useVisibility,
  useObjectState,
  useComponentState
}; 
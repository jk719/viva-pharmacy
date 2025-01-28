import useSWR from 'swr';

const getBaseUrl = () => {
  // Always use relative URLs on client-side
  if (typeof window !== 'undefined') {
    return '';  // Return empty string for client-side
  }
  
  // Server-side: use full URLs
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

const BASE_URL = getBaseUrl();

// Enhanced fetcher with rate limit handling
const fetcher = async (url) => {
  const res = await fetch(url);
  
  // Handle rate limiting
  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After') || 60;
    const error = new Error('Rate limit exceeded');
    error.retryAfter = parseInt(retryAfter);
    error.isRateLimit = true;
    throw error;
  }

  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

// Enhanced SWR configuration
const swrConfig = {
  onError: (error, key) => {
    if (error.isRateLimit) {
      console.warn(`Rate limit exceeded for ${key}. Retry after ${error.retryAfter}s`);
    }
  },
  shouldRetryOnError: (error) => {
    // Don't retry immediately on rate limit errors
    return !error.isRateLimit;
  }
};

// Update SWR hooks with rate limit handling
export function useProduct(id, options = {}) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/products/${id}` : null,
    fetcher,
    { ...swrConfig, ...options }
  );

  return {
    product: data?.product,
    isLoading,
    isError: error,
    isRateLimited: error?.isRateLimit || false,
    retryAfter: error?.retryAfter
  };
}

export function useProducts(params = {}) {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  ).toString();
  
  const url = `/api/products${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading } = useSWR(url, fetcher, swrConfig);

  return {
    products: data?.products || [],
    isLoading,
    isError: error,
    isRateLimited: error?.isRateLimit || false,
    retryAfter: error?.retryAfter
  };
}

export function useUserProfile() {
  const { data, error, isLoading } = useSWR('/api/auth/user-profile', fetcher);

  return {
    profile: data,
    isLoading,
    isError: error
  };
}

export function useOrders(userId) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/orders/${userId}` : null,
    fetcher
  );

  return {
    orders: data,
    isLoading,
    isError: error
  };
}

// Update regular fetch functions with rate limit handling
export const fetchProduct = async (id) => {
  try {
    const url = `/api/products/${id}`;
    console.log('Fetching product from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 60;
      return {
        success: false,
        isRateLimited: true,
        retryAfter: parseInt(retryAfter),
        message: 'Rate limit exceeded'
      };
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data) {
      throw new Error('No data received');
    }
    
    return data;
  } catch (error) {
    console.error('Product fetch error:', {
      error: error.message,
      id
    });
    return { 
      success: false, 
      message: error.message,
      product: null,
      isRateLimited: false
    };
  }
};

export const fetchProducts = async (options = {}) => {
  try {
    const { signal, ...params } = options;
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    
    const queryString = searchParams.toString();
    const url = `/api/products${queryString ? `?${queryString}` : ''}`;
    
    console.log('API Request:', { url, params });
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
      cache: 'no-store'
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 60;
      return {
        success: false,
        isRateLimited: true,
        retryAfter: parseInt(retryAfter),
        message: 'Rate limit exceeded',
        products: []
      };
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      products: data.products || [],
      isRateLimited: false
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('Products fetch error:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to fetch products',
      products: [],
      isRateLimited: false
    };
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await fetch('/api/auth/user-profile', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('User profile fetch error:', error);
    return { success: false, message: error.message };
  }
};

export const fetchOrders = async (userId) => {
  try {
    const response = await fetch(`/api/orders/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Orders fetch error:', error);
    return { success: false, message: error.message };
  }
};

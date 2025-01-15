import useSWR from 'swr';

const getBaseUrl = () => {
  // Always use relative URLs on client-side
  if (typeof window !== 'undefined') {
  }
    return '';
  
  // Server-side: use full URLs
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

const BASE_URL = getBaseUrl();

// Helper function to handle fetch errors
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

// SWR hooks for data fetching
export function useProduct(id, options = {}) {
  const { data, error, isLoading } = useSWR(
    id ? `/api/products/${id}` : null,
    fetcher,
    options
  );

  return {
    product: data?.product,
    isLoading,
    isError: error
  };
}

export function useProducts(params = {}) {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  ).toString();
  
  const url = `/api/products${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading } = useSWR(url, fetcher);

  return {
    products: data?.products || [],
    isLoading,
    isError: error
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

// Keep your existing fetch functions for non-hook usage
export const fetchProduct = async (id) => {
  try {
    // Use relative URL
    const url = `/api/products/${id}`;
    console.log('Fetching product from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control
      cache: 'no-store'
    });
    
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
      product: null 
    };
  }
};

export const fetchProducts = async (options = {}) => {
  try {
    const { signal, ...params } = options;
    
    // Use relative URL instead of constructing base URL
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
      signal, // Add abort signal
      cache: 'force-cache' // Use cache to prevent unnecessary requests
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      products: data.products || []
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      // Don't log abort errors as they're expected
      throw error;
    }
    console.error('Products fetch error:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to fetch products',
      products: [] 
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

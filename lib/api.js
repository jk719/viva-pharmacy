const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URLs
    return '';
  }
  
  // Server-side
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Local development
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

const BASE_URL = getBaseUrl();

export const fetchProduct = async (id) => {
  try {
    const url = `/api/products/${id}`;
    console.log('Fetching product from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Product fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        url,
        id
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Product fetch error:', {
      error: error.message,
      id,
      baseUrl: BASE_URL
    });
    return { 
      success: false, 
      message: error.message,
      product: null 
    };
  }
};

export const fetchProducts = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/products${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching products from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Products fetch error:', {
      error: error.message,
      params,
      baseUrl: BASE_URL
    });
    return { 
      success: false, 
      message: error.message,
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

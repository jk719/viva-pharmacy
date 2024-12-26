const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const fetchProduct = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/products/${id}`);
    
    if (!response.ok) {
      console.error('Product fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        id: id
      });
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Product fetch error:', error);
    return { success: false, products: [] };
  }
};

export const fetchProducts = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching products from:', url); // Debug log
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('API Response:', { // Debug log
      success: data.success,
      productCount: data.products?.length,
      params: params,
      categories: data.products ? [...new Set(data.products.map(p => p.category))] : []
    });
    
    return data;
  } catch (error) {
    console.error('Product fetch error:', error);
    return { success: false, products: [] };
  }
};

// Add other API utilities as needed
export const fetchUserProfile = async () => {
  const response = await fetch(`${BASE_URL}/api/auth/user-profile`);
  const data = await response.json();
  return data;
};

export const fetchOrders = async (userId) => {
  const response = await fetch(`${BASE_URL}/api/orders/${userId}`);
  const data = await response.json();
  return data;
};

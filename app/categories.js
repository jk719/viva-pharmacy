import { fetchProducts } from '@/lib/api';

export async function getCategories() {
  try {
    const data = await fetchProducts();
    if (data.success) {
      return ["All", ...new Set(
        data.products.map(product => product.category)
      )].sort();
    }
    return ["All"];
  } catch (error) {
    console.error('Error loading categories:', error);
    return ["All"];
  }
} 
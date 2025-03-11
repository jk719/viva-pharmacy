import useSWR from 'swr';

export function useProducts() {
  const { data, error, isLoading } = useSWR('/api/products', async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    const json = await res.json();
    return json.products || [];
  });

  return {
    products: data || [],
    isLoading,
    error
  };
} 
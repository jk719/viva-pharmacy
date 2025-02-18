import { useState, useEffect } from 'react';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      console.log("useProducts: Starting fetch");
      try {
        const response = await fetch('/api/products');
        console.log("useProducts: Response status:", response.status);
        
        const data = await response.json();
        console.log("useProducts: Raw response data:", data);
        
        if (data.success && Array.isArray(data.products)) {
          console.log("useProducts: Successfully loaded", data.products.length, "products");
          setProducts(data.products);
          setIsLoading(false);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("useProducts: Error fetching products:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Log state changes
  useEffect(() => {
    console.log('useProducts: State updated', {
      productsCount: products.length,
      isLoading,
      hasError: !!error
    });
  }, [products, isLoading, error]);

  return {
    products,
    isLoading,
    error
  };
} 
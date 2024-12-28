// src/products/page.js
"use client";

import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductFilter from '@/components/products/ProductFilter';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fetchProducts } from '@/lib/api';

export default function ProductsPage() {
  const { addToCart, items } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams);
        const data = await fetchProducts(Object.fromEntries(params));

        if (data.success) {
          setProducts(data.products);
          const uniqueCategories = ['All', ...new Set(data.products.map(p => p.category))];
          setCategories(uniqueCategories);
        } else {
          setError(data.message || 'Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('An error occurred while fetching products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchParams]);

  const updateSearchParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    updateSearchParams({ search: value });
  };

  const handlePriceChange = (type, value) => {
    if (type === 'min') {
      setMinPrice(value);
      updateSearchParams({ minPrice: value });
    } else {
      setMaxPrice(value);
      updateSearchParams({ maxPrice: value });
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    updateSearchParams({ 
      category: category === 'All' ? '' : category 
    });
  };

  const getItemQuantity = (productId) => {
    const item = items?.find(item => item?._id === productId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductFilter 
        categories={categories}
        selectedCategory={searchParams.get('category') || 'All'}
        searchQuery={searchQuery}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onSearchChange={handleSearchChange}
        onPriceChange={handlePriceChange}
        onChange={handleCategoryChange}
      />

      <div className="container mx-auto px-6 py-8">
        {products.length === 0 ? (
          <div className="text-center text-gray-500">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 shadow-lg rounded-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href={`/products/${product._id}`}>
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={`/images/products/${product.image.split('/').pop()}`}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </Link>

                <h3 className="text-xl font-bold mb-2 text-primary">{product.name}</h3>
                <p className="text-gray-700 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
                  <button
                    className="bg-primary text-white py-2 px-4 rounded-full hover:bg-primary/90 
                             transition-colors duration-200 flex items-center gap-2"
                    onClick={() => {
                      addToCart({
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1
                      });
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFolder, FiStar, FiBox, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { HiOutlineFolderOpen, HiOutlineArchive, HiOutlineShoppingBag, HiOutlineCube, HiOutlineTag, HiOutlineCash, HiOutlineClipboardCheck } from 'react-icons/hi';
import Image from 'next/image';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import RecentProductEdits from './RecentProductEdits';
import { motion } from 'framer-motion';
import { categories } from '@/data/categories';

const SPECIAL_CATEGORIES = [
  { id: 'Featured', name: 'Featured', icon: FiStar, iconColor: 'text-yellow-500' },
  { id: 'Uncategorized', name: 'Uncategorized', icon: HiOutlineArchive, iconColor: 'text-red-600' }
];

export default function ProductManagement() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState({});

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        setMessage(data.message || 'Error loading products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage('Error loading products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add search functionality with memoization
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Updated organizedProducts memo to include all possible categories
  const organizedProducts = useMemo(() => {
    const featured = filteredProducts.filter(p => p.isFeatured);
    
    // Create initial structure with all possible categories and items
    const allCategories = categories.reduce((acc, category) => {
      acc[category.name] = category.items.reduce((itemAcc, item) => {
        itemAcc[item.name] = [];
        return itemAcc;
      }, {});
      return acc;
    }, {});

    // Add products to their respective categories
    filteredProducts.forEach(product => {
      const category = product.category || 'Uncategorized';
      const item = product.item || 'General';
      
      if (!allCategories[category]) {
        allCategories[category] = {};
      }
      if (!allCategories[category][item]) {
        allCategories[category][item] = [];
      }
      allCategories[category][item].push(product);
    });

    return {
      Featured: { 'Featured Products': featured },
      Uncategorized: allCategories['Uncategorized'] || { 'General': [] },
      ...Object.keys(allCategories)
        .filter(cat => cat !== 'Uncategorized')
        .sort()
        .reduce((obj, key) => {
          obj[key] = allCategories[key];
          return obj;
        }, {})
    };
  }, [filteredProducts]);

  // Updated category counts calculation
  const categoryCounts = useMemo(() => {
    const counts = {
      total: filteredProducts.length,
      featured: filteredProducts.filter(p => p.isFeatured).length,
      categories: {}
    };

    // Initialize counts for all possible categories and items
    categories.forEach(category => {
      counts.categories[category.name] = {
        total: 0,
        subCategories: {}
      };
      category.items.forEach(item => {
        counts.categories[category.name].subCategories[item.name] = 0;
      });
    });

    // Add Uncategorized
    counts.categories['Uncategorized'] = {
      total: 0,
      subCategories: { 'General': 0 }
    };

    // Count actual products
    filteredProducts.forEach(product => {
      const category = product.category || 'Uncategorized';
      const item = product.item || 'General';
      
      if (!counts.categories[category]) {
        counts.categories[category] = {
          total: 0,
          subCategories: {}
        };
      }
      
      counts.categories[category].total++;
      
      if (!counts.categories[category].subCategories[item]) {
        counts.categories[category].subCategories[item] = 0;
      }
      counts.categories[category].subCategories[item]++;
    });

    return counts;
  }, [filteredProducts]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const contentType = response.headers.get("content-type");
      console.log('Delete response content type:', contentType);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Delete error response:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Delete response:', data);
      
      if (data.success) {
        setMessage('Product deleted successfully');
        fetchProducts();
      } else {
        setMessage(data.message || 'Error deleting product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage('Error deleting product');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="w-full">
      <RecentProductEdits />

      {/* Search and Add Product Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <Link 
          href="/admin/products/add"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FiPlus />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Product Categories */}
      <div className="grid md:grid-cols-[300px,1fr] gap-6">
        {/* Category Sidebar */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-medium text-lg mb-4">Categories</h2>
          <div className="space-y-2">
            {/* Special Categories (Featured and Uncategorized) */}
            {SPECIAL_CATEGORIES.map(({ id, name, icon: Icon, iconColor }) => (
              <div key={id} className="select-none">
                <button
                  onClick={() => toggleCategory(id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    id === 'Uncategorized'
                      ? 'text-red-600 hover:bg-red-50'
                      : selectedCategory === id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className={iconColor} />
                  <span className="flex-1 text-left">{name}</span>
                  <span className={`text-sm mr-2 ${
                    id === 'Uncategorized' ? 'text-red-400' : 'text-gray-500'
                  }`}>
                    {id === 'Featured' ? categoryCounts.featured : (categoryCounts.categories[id]?.total || 0)}
                  </span>
                  {expandedCategories[id] ? <FiChevronDown /> : <FiChevronRight />}
                </button>

                {expandedCategories[id] && (
                  <div className="ml-6 mt-2 space-y-1">
                    <button
                      onClick={() => setSelectedCategory(`${id}-${id === 'Featured' ? 'Featured Products' : 'General'}`)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                        id === 'Uncategorized' ? 'text-red-600 hover:bg-red-50' : 'hover:bg-gray-100'
                      }`}
                    >
                      <FiFolder className={id === 'Uncategorized' ? 'text-red-400' : 'text-gray-400'} />
                      <span className="flex-1 text-left">{id === 'Featured' ? 'Featured Products' : 'General'}</span>
                      <span className={`text-sm ${id === 'Uncategorized' ? 'text-red-400' : 'text-gray-500'}`}>
                        {id === 'Featured' ? categoryCounts.featured : (categoryCounts.categories[id]?.subCategories?.General || 0)}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Regular Categories */}
            {categories
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(category => (
                <div key={category.name} className="select-none">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      selectedCategory === category.name 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <HiOutlineFolderOpen className="text-blue-500" />
                    <span className="flex-1 text-left">{category.name}</span>
                    <span className="text-sm text-gray-500 mr-2">
                      {categoryCounts.categories[category.name]?.total || 0}
                    </span>
                    {expandedCategories[category.name] ? <FiChevronDown /> : <FiChevronRight />}
                  </button>
                  
                  {expandedCategories[category.name] && (
                    <div className="ml-6 mt-2 space-y-1">
                      {category.items
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(item => (
                          <button
                            key={item.slug}
                            onClick={() => setSelectedCategory(`${category.name}-${item.name}`)}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                              selectedCategory === `${category.name}-${item.name}`
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <FiFolder className="text-gray-400" />
                            <span className="flex-1 text-left">{item.name}</span>
                            <span className="text-sm text-gray-500">
                              {categoryCounts.categories[category.name]?.subCategories[item.name] || 0}
                            </span>
                          </button>
                      ))}
                    </div>
                  )}
                </div>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(organizedProducts).map(([category, subCategories]) =>
              Object.entries(subCategories).map(([subCategory, products]) =>
                (selectedCategory === 'all' || 
                 selectedCategory === category || 
                 selectedCategory === `${category}-${subCategory}`) &&
                products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="group relative bg-gradient-to-b from-white to-gray-50 border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {/* Product Image Container */}
                    <div className="relative w-full h-48 bg-white">
                      <Image
                        src={product.imageUrl || '/images/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {product.isFeatured && (
                        <motion.div
                          initial={{ x: 100 }}
                          animate={{ x: 0 }}
                          className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
                        >
                          <span className="flex items-center gap-1">
                            <HiOutlineTag className="w-4 h-4" />
                            Featured
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-lg text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <span className="flex items-center gap-1 text-lg font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          <HiOutlineCash className="w-5 h-5" />
                          ${product.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded-lg flex items-center gap-1">
                          <HiOutlineCube className="w-4 h-4" />
                          {product.category}
                        </span>
                        <span className="text-sm bg-purple-50 text-purple-600 px-2 py-1 rounded-lg flex items-center gap-1">
                          <HiOutlineClipboardCheck className="w-4 h-4" />
                          {product.item || 'General'}
                        </span>
                        <span className="text-sm bg-green-50 text-green-600 px-2 py-1 rounded-lg flex items-center gap-1">
                          <HiOutlineShoppingBag className="w-4 h-4" />
                          In Stock
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                                   bg-gradient-to-r from-primary/90 to-primary text-white rounded-lg 
                                   hover:from-primary hover:to-primary/90 transition-all duration-300
                                   shadow-sm hover:shadow-md"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                                   bg-gradient-to-r from-red-500/90 to-red-600 text-white rounded-lg 
                                   hover:from-red-600 hover:to-red-700 transition-all duration-300
                                   shadow-sm hover:shadow-md"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
// src/app/products/[id]/page.js

import ClientProductView from './ClientProductView';
import { fetchProduct, fetchProducts } from '@/lib/api';
import { notFound } from 'next/navigation';

// Cache the product fetching
async function getProduct(id) {
  try {
    const data = await fetchProduct(id);
    
    // Add detailed logging
    console.log('Fetching product:', {
      requestedId: id,
      success: data.success,
      productsCount: data.products?.length || 0
    });

    if (!data.success || !data.products) {
      console.log('API request failed or no products returned');
      return null;
    }

    // Ensure string comparison for IDs
    const product = data.products.find(p => p._id.toString() === id.toString());
    
    if (!product) {
      console.log('Product lookup failed:', {
        requestedId: id,
        availableIds: data.products.map(p => p._id.toString())
      });
      return null;
    }

    console.log('Product found:', {
      id: product._id,
      name: product.name
    });

    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const { id } = await Promise.resolve(params);
  
  if (!id) {
    console.log('No ID in params');
    notFound();
  }

  console.log('Processing product page for ID:', id);
  const product = await getProduct(id);
  
  if (!product) {
    console.log('No product found for ID:', id);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <a 
            href="/products" 
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-full 
                     hover:bg-primary/90 transition-colors duration-200
                     shadow-md hover:shadow-lg"
          >
            Back to Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientProductView product={product} />
    </div>
  );
}

// Update metadata generation
export async function generateMetadata({ params }) {
  const { id } = await Promise.resolve(params);
  
  if (!id) {
    return {
      title: 'Product Not Found | Viva Pharmacy',
      description: 'The requested product could not be found.'
    };
  }

  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found | Viva Pharmacy',
      description: 'The requested product could not be found.'
    };
  }

  return {
    title: `${product.name} | Viva Pharmacy`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

// Update static params generation
export async function generateStaticParams() {
  try {
    const data = await fetchProducts();
    console.log('Generating static params:', {
      success: data.success,
      productsCount: data.products?.length || 0
    });

    if (!data.success || !data.products) {
      console.error('Failed to fetch products for static generation');
      return [];
    }
    
    return data.products.map((product) => ({
      id: product._id.toString()
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

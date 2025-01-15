// src/app/products/[id]/page.js

import { Suspense } from 'react';
import ClientProductView from './ClientProductView';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SWRConfig } from 'swr';

async function getProduct(id) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL;
    
    if (!baseUrl) {
      console.error('Base URL not configured in environment variables');
      throw new Error('API configuration error');
    }
    
    const url = new URL(`/api/products/${id}`, baseUrl);
    
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.product) {
      throw new Error(data.message || 'Failed to fetch product');
    }

    return data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const productId = params.id;
  
  if (!productId) {
    console.error('No product ID provided');
    notFound();
  }

  // Get initial data
  const product = await getProduct(productId);
  
  if (!product) {
    return <ProductNotFound />;
  }

  // Provide initial data to SWR
  return (
    <div className="min-h-screen bg-gray-50">
      <SWRConfig
        value={{
          fallback: {
            [`/api/products/${productId}`]: { success: true, product }
          }
        }}
      >
        <Suspense fallback={<ProductSkeleton />}>
          <ClientProductView product={product} />
        </Suspense>
      </SWRConfig>
    </div>
  );
}

const ProductNotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
        Product Not Found
      </h2>
      <p className="text-gray-600 mb-6">
        The product you're looking for doesn't exist or has been removed.
      </p>
      <Link 
        href="/products" 
        className="inline-block bg-primary text-white px-6 py-2.5 rounded-full 
                 hover:bg-primary/90 transition-colors duration-200
                 shadow-md hover:shadow-lg"
      >
        Back to Products
      </Link>
    </div>
  </div>
);

const ProductSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
      <div className="h-12 bg-gray-200 rounded-full w-48"></div>
    </div>
  </div>
);

export async function generateMetadata({ params }) {
  const productId = params.id;
  
  if (!productId) {
    return defaultMetadata;
  }

  const product = await getProduct(productId);

  if (!product) {
    return defaultMetadata;
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
    },
  };
}

const defaultMetadata = {
  title: 'Product Not Found | Viva Pharmacy',
  description: 'The requested product could not be found.'
};

// Use ISR instead of forcing dynamic
export const revalidate = 60; // Revalidate every minute

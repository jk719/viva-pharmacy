// src/app/products/[id]/page.js

import ClientProductView from './ClientProductView';
import { notFound } from 'next/navigation';

async function getProduct(id) {
  try {
    // Use existing environment variables
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL;
    
    if (!baseUrl) {
      console.error('Base URL not configured in environment variables');
      throw new Error('API configuration error');
    }
    
    // Use URL constructor for proper URL formation
    const url = new URL(`/api/products/${id}`, baseUrl);
    
    console.log('Fetching product:', {
      id,
      url: url.toString(),
      env: process.env.NODE_ENV,
      baseUrl
    });

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      },
      next: {
        revalidate: 0 // Disable cache
      }
    });

    if (!response.ok) {
      console.error('Product fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        url: url.toString()
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('Product fetch returned error:', {
        message: data.message,
        id
      });
      throw new Error(data.message || 'Failed to fetch product');
    }

    // Validate product data
    if (!data.product) {
      throw new Error('Product data is missing');
    }

    return data.product;
  } catch (error) {
    console.error('Error fetching product:', {
      error: error.message,
      id,
      stack: error.stack,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL
    });
    return null;
  }
}

export default async function ProductPage({ params }) {
  // Await params resolution
  const { id } = await Promise.resolve(params);
  
  if (!id) {
    console.error('No product ID provided');
    notFound();
  }

  const product = await getProduct(id);
  
  if (!product) {
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

export async function generateMetadata({ params }) {
  // Await params resolution
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
    },
  };
}

// Force dynamic rendering for product pages
export const dynamic = 'force-dynamic';

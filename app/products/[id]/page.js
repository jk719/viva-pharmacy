// src/app/products/[id]/page.js

import { Suspense } from 'react';
import ClientProductView from './ClientProductView';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

// Metadata generator
export async function generateMetadata({ params }) {
  const id = await Promise.resolve(params).then(p => p.id);
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return {
        title: 'Product Not Found - Viva Pharmacy',
        description: 'The requested product could not be found.'
      };
    }

    const { product } = await response.json();
    
    return {
      title: product.seo?.metaTitle || `${product.name} - Viva Pharmacy`,
      description: product.seo?.metaDescription || product.description,
      keywords: product.seo?.metaKeywords,
      openGraph: {
        title: product.seo?.metaTitle || product.name,
        description: product.seo?.metaDescription || product.description,
        type: 'product',
        url: product.seo?.canonical || `/products/${product._id}`,
        images: [{ 
          url: product.image,
          width: 800,
          height: 600,
          alt: product.name
        }]
      },
      alternates: {
        canonical: product.seo?.canonical || `/products/${product._id}`
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product - Viva Pharmacy',
      description: 'View our product details'
    };
  }
}

// Main page component
export default async function ProductPage({ params }) {
  const id = await Promise.resolve(params).then(p => p.id);

  if (!id) {
    console.error('No product ID provided');
    notFound();
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const { product } = await response.json();

    if (!product) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Add structured data */}
        {product.seo?.structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(product.seo.structuredData)
            }}
          />
        )}
        
        {/* Add breadcrumbs */}
        {product.seo?.breadcrumbs && (
          <Breadcrumbs items={product.seo.breadcrumbs} />
        )}

        <Suspense fallback={
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        }>
          <ClientProductView product={product} />
        </Suspense>
      </div>
    );

  } catch (error) {
    console.error('Error loading product:', error);
    throw error;
  }
}

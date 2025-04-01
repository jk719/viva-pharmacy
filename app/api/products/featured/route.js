import { NextResponse } from 'next/server';
import { getFeaturedProducts } from '@/lib/products/productDb';
import { getCloudinaryUrl } from '@/lib/cloudinary';

export async function GET() {
  try {
    const products = await getFeaturedProducts();
    
    // Transform products to include full image URLs
    const transformedProducts = products.map(product => {
      const productData = product.toObject();
      
      // Use the getCloudinaryUrl function instead of cloudinaryUrls.json
      const imageUrl = getCloudinaryUrl(productData);
      
      console.log('Product:', productData.name);
      console.log('Image URL:', imageUrl);

      return {
        ...productData,
        image: imageUrl,
        price: Number(productData.price),
        isInStock: productData.stock > 0,
        categoryPath: `${productData.category} > ${productData.item}`,
        categoryTagline: productData.categoryTagline || productData.category
      };
    });

    console.log('First transformed product:', transformedProducts[0]);

    return NextResponse.json({ 
      success: true, 
      products: transformedProducts 
    });
  } catch (error) {
    console.error('Featured Products API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
} 
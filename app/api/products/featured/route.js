import { NextResponse } from 'next/server';
import { getFeaturedProducts } from '@/lib/products/productDb';
import cloudinaryUrls from '@/data/cloudinaryUrls.json';

export async function GET() {
  try {
    const products = await getFeaturedProducts();
    
    // Transform products to include full image URLs
    const transformedProducts = products.map(product => {
      const productData = product.toObject();
      
      // Get image URL from cloudinaryUrls.json
      const imageFileName = `${productData.imageKey}.png`;
      const imageUrl = cloudinaryUrls[imageFileName] || '/images/placeholder.png';
      
      console.log('Product:', productData.name);
      console.log('Image file name:', imageFileName);
      console.log('Found in cloudinaryUrls:', !!cloudinaryUrls[imageFileName]);
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
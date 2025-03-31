import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import getProductModel from '@/models/Product';
import { authOptions } from '@/lib/auth';
import { categories } from '@/data/categories';
import rateLimit from '@/lib/rateLimit';
import { getCloudinaryUrl } from '@/lib/cloudinary';

const FALLBACK_IMAGE = '/images/placeholder.png';

// Helper function to get category names
function getCategoryNames(categorySlug, subcategorySlug, itemSlug) {
  const category = categories.find(c => c.slug === categorySlug);
  const subcategory = category?.subcategories.find(s => s.slug === subcategorySlug);
  const item = subcategory?.items.find(i => i.slug === itemSlug);
  
  return {
    category: category?.name || '',
    subcategory: subcategory?.name || '',
    item: item?.name || ''
  };
}

// Add this helper function
const handleError = (error) => {
  console.error('Products API Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code
  });

  // Check for specific error types
  if (error.name === 'MongooseError') {
    return {
      status: 500,
      body: {
        success: false,
        message: 'Database error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    };
  }

  if (error.name === 'ValidationError') {
    return {
      status: 400,
      body: {
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      }
    };
  }

  // Default error response
  return {
    status: 500,
    body: {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  };
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    console.log('Products API: Starting request');
    
    // Rate limit check with await
    const rateLimitResult = await rateLimit.check(request);
    if (!rateLimitResult.success) {
      console.log('Products API: Rate limit exceeded');
      return NextResponse.json({
        success: false,
        message: 'Too many requests',
        retryAfter: rateLimitResult.retryAfter
      }, { 
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfter)
        }
      });
    }

    // Connect to database
    console.log('Products API: Connecting to database...');
    await dbConnect();
    const Product = getProductModel();
    
    console.log('Products API: Executing database query...');
    const products = await Product.find({})
      .lean()
      .select('name description shortDescription price imageUrl cloudinaryPublicId imageKey category stock isNewProduct activeIngredients dosageForm slug item itemSlug isFeatured')
      .sort({ createdAt: -1 });

    console.log('Products API: Database query complete', {
      count: products.length,
      firstProduct: products[0] ? {
        id: products[0]._id,
        name: products[0].name
      } : null
    });

    const mappedProducts = products.map(product => {
      const imageUrl = getCloudinaryUrl(product);

      return {
        ...product,
        _id: product._id.toString(),
        imageUrl,
        image: imageUrl, // For backward compatibility
        category: product.category,
        categoryTagline: categories.find(cat => 
          cat.name.toLowerCase() === product.category.toLowerCase()
        )?.tagline || product.category,
        stock: product.stock,
        isInStock: product.stock > 0,
        isNew: product.isNewProduct || false,
        activeIngredients: product.activeIngredients || [],
        dosageForm: product.dosageForm,
        slug: product.slug,
        item: product.item,
        itemSlug: product.itemSlug,
        isFeatured: product.isFeatured
      };
    });

    console.log('Products API: Response ready', {
      success: true,
      count: mappedProducts.length
    });

    return NextResponse.json({
      success: true,
      products: mappedProducts
    });

  } catch (error) {
    console.error('Products API Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    await dbConnect();
    const Product = getProductModel();

    const body = await request.json();

    // Validate category hierarchy
    const category = categories.find(c => c.slug === body.categorySlug);
    if (!category) {
      return NextResponse.json(
        { success: false, message: `Category not found: ${body.categorySlug}` },
        { status: 400 }
      );
    }

    const item = category.items.find(i => i.slug === body.itemSlug);
    if (!item) {
      return NextResponse.json(
        { success: false, message: `Item not found: ${body.itemSlug}` },
        { status: 400 }
      );
    }

    // Generate SKU
    let sku = body.sku; // Use provided SKU if available
    
    if (!sku) {
      try {
        sku = await Product.generateSKU(body.categorySlug);
        
        // Verify the generated SKU doesn't already exist
        // This safeguards against race conditions
        let skuExists = await Product.findOne({ sku });
        let attempts = 0;
        const MAX_ATTEMPTS = 3;
        
        while (skuExists && attempts < MAX_ATTEMPTS) {
          attempts++;
          sku = await Product.generateSKU(body.categorySlug);
          skuExists = await Product.findOne({ sku });
        }
        
        if (skuExists) {
          // If we still have a conflict after multiple attempts,
          // create a unique timestamp-based SKU as fallback
          const prefix = body.categorySlug.substring(0, 3).toUpperCase();
          const timestamp = Date.now().toString().slice(-6);
          sku = `${prefix}${timestamp}`;
        }
      } catch (error) {
        console.error("Error generating SKU:", error);
        // Fallback SKU generation
        const prefix = body.categorySlug.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        sku = `${prefix}${timestamp}`;
      }
    } else {
      // If SKU was provided, check if it already exists
      const skuExists = await Product.findOne({ sku });
      if (skuExists) {
        return NextResponse.json(
          { success: false, message: 'SKU already exists' },
          { status: 409 } // Conflict status code
        );
      }
    }

    // Generate a slug for the product if not provided
    const slug = body.slug || body.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Generate a short description if not provided (truncate regular description)
    const shortDescription = body.shortDescription || 
      (body.description ? body.description.substring(0, 150) + (body.description.length > 150 ? '...' : '') : '');

    // Generate SEO data
    const seoData = {
      metaTitle: `${body.name} | ${category.name} | GoVivanova Pharmacy`,
      metaDescription: shortDescription,
      metaKeywords: [
        body.name,
        category.name,
        item.name,
        body.dosageForm,
        'pharmacy',
        'medicine',
        'online pharmacy'
      ].filter(Boolean),
      canonical: `/${category.slug}/${item.slug}/${slug}`,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: category.name, url: `/${category.slug}` },
        { name: item.name, url: `/${category.slug}/${item.slug}` },
        { name: body.name, url: `/${category.slug}/${item.slug}/${slug}` }
      ],
      structuredData: {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: body.name,
        description: body.description,
        brand: {
          "@type": "Brand",
          name: item.name
        },
        category: category.name,
        sku: sku,
        image: body.image || '/images/placeholder.png',
        offers: {
          "@type": "Offer",
          price: body.price,
          priceCurrency: "USD",
          availability: body.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "GoVivanova Pharmacy"
          }
        }
      }
    };

    const productData = {
      ...body,
      sku,
      slug,
      shortDescription,
      seo: seoData,
      subcategoryIndex: 0, // Default value for required field
      price: parseFloat(body.price),
      stock: parseInt(body.stock || 0),
      category: category.name,
      subcategory: category.name, // Same as category
      item: item.name,
      categoryPath: `${category.name} > ${item.name}`,
      createdBy: session.user.id
    };

    const product = await Product.create(productData);

    return NextResponse.json({
      success: true,
      product,
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to create product'
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const rateLimitResult = await rateLimit.check(request, 15);
    if (!rateLimitResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Too many requests. Please try again later.'
      }, { 
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfter),
          'X-RateLimit-Limit': '15',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining || 0)
        }
      });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 403 });
    }

    await dbConnect();
    const Product = getProductModel();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product ID is required' 
      }, { status: 400 });
    }

    const data = await request.json();
    
    // Find existing product first
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate category hierarchy
    const category = categories.find(c => c.slug === data.categorySlug);
    const item = category?.items?.find(i => i.slug === data.itemSlug);

    if (!category || !item) {
      return NextResponse.json(
        { success: false, message: 'Invalid category or item' },
        { status: 400 }
      );
    }

    // Generate SEO data for the update
    const seoData = generateSEOData(data, category, item);

    // Create update data
    const updateData = {
      ...data,
      createdBy: existingProduct.createdBy,
      _id: existingProduct._id,
      createdAt: existingProduct.createdAt,
      category: category.name,
      subcategory: category.name,
      item: item.name,
      categoryPath: `${category.name} > ${item.name}`,
      seo: seoData,
      // Clean specific fields
      activeIngredients: (data.activeIngredients || []).filter(i => i.name && i.amount),
      warnings: (data.warnings || []).filter(w => w.trim()),
      price: parseFloat(data.price),
      stock: parseInt(data.stock)
    };

    const result = await Product.replaceOne(
      { _id: id },
      updateData,
      { upsert: false }
    );

    if (result.modifiedCount !== 1) {
      return NextResponse.json(
        { success: false, message: 'Failed to update product' },
        { status: 400 }
      );
    }

    const updatedProduct = await Product.findById(id);
    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Product update error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update product' 
    }, { status: 500 });
  }
}

// Add the generateSEOData helper function at the top of the file with other helpers
function generateSEOData(product, category, item) {
  return {
    metaTitle: `${product.name} | ${category?.name || 'Medicine'} | GoVivanova Pharmacy`,
    metaDescription: `${product.shortDescription || product.description?.substring(0, 150)}. Available at GoVivanova Pharmacy. Fast delivery!`,
    metaKeywords: [
      product.name,
      category?.name,
      item?.name,
      product.dosageForm,
      'pharmacy',
      'medicine',
      'online pharmacy'
    ].filter(Boolean),
    canonical: `/${category?.slug || 'medicine'}/${item?.slug || 'general'}/${product.itemSlug}`,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: category?.name || 'Medicine', url: `/${category?.slug || 'medicine'}` },
      { name: item?.name || 'General', url: `/${category?.slug || 'medicine'}/${item?.slug || 'general'}` },
      { name: product.name, url: `/${category?.slug || 'medicine'}/${item?.slug || 'general'}/${product.itemSlug}` }
    ],
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      description: product.description,
      brand: {
        "@type": "Brand",
        name: product.item
      },
      category: category?.name,
      sku: product.sku,
      image: product.image || FALLBACK_IMAGE,
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "USD",
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "GoVivanova Pharmacy"
        }
      }
    }
  };
}

export async function DELETE(request) {
  try {
    const rateLimitResult = await rateLimit.check(request, 10);
    if (!rateLimitResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Too many requests. Please try again later.'
      }, { 
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.retryAfter),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining || 0)
        }
      });
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    
    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product ID is required' 
      }, { status: 400 });
    }

    const product = await Product.findByIdAndDelete(productId);
    
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete product' 
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import getProductModel from '@/models/Product';
import { authOptions } from '@/lib/auth';
import { categories } from '@/data/categories';
import rateLimit from '@/lib/rateLimit';

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

export async function GET(request) {
  try {
    console.log('Products API: Starting request');
    
    // Rate limit check
    if (!rateLimit.check(request)) {
      console.log('Products API: Rate limit exceeded');
      return NextResponse.json({
        success: false,
        message: 'Too many requests'
      }, { status: 429 });
    }

    // Connect to database
    console.log('Products API: Connecting to database...');
    await dbConnect();
    const Product = getProductModel();
    
    console.log('Products API: Executing database query...');
    const products = await Product.find({})
      .lean()
      .select('name description shortDescription price imageUrl category stock isNewProduct activeIngredients dosageForm slug item itemSlug isFeatured')
      .sort({ createdAt: -1 });

    console.log('Products API: Database query complete', {
      count: products.length,
      firstProduct: products[0] ? {
        id: products[0]._id,
        name: products[0].name
      } : null
    });

    const mappedProducts = products.map(product => ({
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      image: product.imageUrl || '/images/placeholder.png',
      imageUrl: product.imageUrl,
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
    }));

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
    const sku = await Product.generateSKU(body.categorySlug);

    const productData = {
      ...body,
      sku,
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
    if (!rateLimit.check(request, 15)) { // Moderate limit for PUT
      return NextResponse.json({
        success: false,
        message: 'Too many requests. Please try again later.'
      }, { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '15',
          'X-RateLimit-Remaining': '0'
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

    const updates = await request.json();
    
    // Clean updates
    if (updates.activeIngredients) {
      updates.activeIngredients = updates.activeIngredients.filter(i => i.name && i.amount);
    }
    if (updates.warnings) {
      updates.warnings = updates.warnings.filter(w => w.trim());
    }
    if (updates.price) {
      updates.price = parseFloat(updates.price);
    }
    if (updates.stock) {
      updates.stock = parseInt(updates.stock);
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product
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

export async function DELETE(request) {
  try {
    if (!rateLimit.check(request, 10)) { // Stricter limit for DELETE
      return NextResponse.json({
        success: false,
        message: 'Too many requests. Please try again later.'
      }, { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0'
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

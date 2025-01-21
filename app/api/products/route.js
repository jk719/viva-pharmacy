import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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

export async function GET(request) {
  console.log('GET /api/products: Starting request');
  
  try {
    // Apply rate limiting
    if (!rateLimit.check(request)) {
      return NextResponse.json({
        success: false,
        message: 'Too many requests. Please try again later.'
      }, { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': '0'
        }
      });
    }

    await dbConnect();
    
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Build the query object
    const query = {};
    
    // Get filter parameters
    const filters = {
      category: searchParams.get('category'),
      search: searchParams.get('search'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      isNew: searchParams.get('new') === 'true',
      isPopular: searchParams.get('popular') === 'true',
      isFeatured: searchParams.get('featured') === 'true',
      inStock: searchParams.get('inStock') === 'true'
    };

    console.log('Applied filters:', filters);

    // Apply category filter
    if (filters.category && filters.category !== 'All') {
      const categoryData = categories.find(c => c.name === filters.category);
      if (categoryData) {
        query.categorySlug = categoryData.slug;
      }
    }

    // Handle price range
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice && !isNaN(parseFloat(filters.minPrice))) {
        query.price.$gte = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice && !isNaN(parseFloat(filters.maxPrice))) {
        query.price.$lte = parseFloat(filters.maxPrice);
      }
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    // Add search functionality
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    console.log('Executing query:', JSON.stringify(query, null, 2));

    const products = await Product.find(query)
      .select('-contraindications -sideEffects')
      .sort({ createdAt: -1 })
      .lean()
      .populate('createdBy', 'name email');

    // Transform products to include category names
    const transformedProducts = products.map(product => {
      const names = getCategoryNames(
        product.categorySlug,
        product.subcategorySlug,
        product.itemSlug
      );
      
      return {
        ...product,
        category: names.category,
        subcategory: names.subcategory,
        item: names.item
      };
    });

    console.log(`Found ${transformedProducts.length} products`);

    const response = NextResponse.json({
      success: true,
      products: transformedProducts,
      pagination: {
        total: transformedProducts.length,
        pages: 1,
        currentPage: 1,
        perPage: transformedProducts.length,
        hasMore: false
      }
    });

    // Add rate limit headers to successful response
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const remaining = 30 - rateLimit.getTokens(ip);
    response.headers.set('X-RateLimit-Limit', '30');
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    
    return response;

  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to fetch products',
      products: [] 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!rateLimit.check(request, 10)) { // Stricter limit for POST
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
    const body = await request.json();
    
    // Add new required fields
    const requiredFields = [
      'name', 'price', 'description', 
      'categorySlug', 'subcategorySlug', 'itemSlug',
      'stock', 'dosageForm'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Validate price and stock
    if (body.price < 0) {
      return NextResponse.json({
        success: false,
        message: 'Price cannot be negative'
      }, { status: 400 });
    }

    if (body.stock < 0) {
      return NextResponse.json({
        success: false,
        message: 'Stock cannot be negative'
      }, { status: 400 });
    }

    // Generate SKU with new category structure
    const sku = await Product.generateSKU(body.categorySlug, body.subcategorySlug);

    const productData = {
      ...body,
      sku,
      price: parseFloat(body.price),
      stock: parseInt(body.stock),
      image: body.image || "https://via.placeholder.com/400x400?text=No+Image",
      activeIngredients: (body.activeIngredients || []).filter(i => i.name && i.amount),
      warnings: (body.warnings || []).filter(w => w.trim()),
      dosageForm: body.dosageForm,
      isPopular: body.isPopular || false,
      isFeatured: body.isFeatured || false,
      createdBy: session.user.id
    };

    const product = new Product(productData);
    await product.save();

    console.log('Created product:', {
      id: product._id,
      name: product.name,
      sku: product.sku
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product
    }, { status: 201 });

  } catch (error) {
    console.error('Product creation error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors
      }, { status: 400 });
    }

    // Handle duplicate SKU error
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        message: 'A product with this SKU already exists' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create product' 
    }, { status: 500 });
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

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  console.log('GET /api/products: Starting request');
  
  try {
    await dbConnect();
    
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Build query
    const query = {};
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const dosageForm = searchParams.get('dosageForm');
    
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (dosageForm) query.dosageForm = dosageForm;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'activeIngredients.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Add stock filter
    const inStock = searchParams.get('inStock');
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    console.log('Executing query:', JSON.stringify(query, null, 2));
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total: products.length,
        pages: 1,
        currentPage: 1,
        perPage: products.length,
        hasMore: false
      }
    });

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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'price', 'description', 'category', 'stock', 'dosageForm'];
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

    // Generate SKU
    const sku = await Product.generateSKU(body.category);

    // Clean and prepare data
    const productData = {
      ...body,
      sku,
      price: parseFloat(body.price),
      stock: parseInt(body.stock),
      image: body.image || "https://via.placeholder.com/400x400?text=No+Image",
      activeIngredients: (body.activeIngredients || []).filter(i => i.name && i.amount),
      warnings: (body.warnings || []).filter(w => w.trim()),
      createdBy: session.user.id
    };

    // Create new product
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

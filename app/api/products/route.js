import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Ensure proper URL parsing
    let searchParams;
    try {
      const url = new URL(request.url);
      searchParams = url.searchParams;
    } catch (error) {
      console.error('URL parsing error:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid request URL',
        products: [] 
      }, { status: 400 });
    }
    
    // Log incoming request
    console.log('API Request:', {
      url: request.url,
      params: Object.fromEntries(searchParams.entries())
    });
    
    // Build query with type checking
    const query = {};
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    if (category && typeof category === 'string') query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Execute query
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    // Return consistent response structure
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
    const { name, price, description, category, image, isFeatured = false } = body;
    if (!name || !price || !description || !category) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    // Create new product with isFeatured field
    const product = new Product({
      name,
      price: parseFloat(price),
      description,
      category,
      image: image || "https://via.placeholder.com/400x400?text=No+Image",
      isFeatured,
      createdBy: session.user.id
    });

    await product.save();

    console.log('Created product:', {
      id: product._id,
      name: product.name,
      isFeatured: product.isFeatured
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product
    }, { status: 201 });

  } catch (error) {
    console.error('Product creation error:', error);
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

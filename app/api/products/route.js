import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    // Log incoming request
    console.log('API Request:', {
      url: request.url,
      params: Object.fromEntries(searchParams.entries())
    });
    
    // Filter parameters
    const query = {};
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    // Build query
    if (category) query.category = category;
    if (featured) query.isFeatured = featured === 'true';
    if (search) {
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

    // Log the MongoDB query
    console.log('MongoDB Query:', {
      query,
      hasFilters: Object.keys(query).length > 0
    });

    // Execute query without pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 });
    
    // Get total count and detailed stats
    const total = products.length;
    const categoryStats = {};
    products.forEach(product => {
      if (!categoryStats[product.category]) {
        categoryStats[product.category] = {
          count: 0,
          minPrice: Infinity,
          maxPrice: -Infinity
        };
      }
      categoryStats[product.category].count++;
      categoryStats[product.category].minPrice = Math.min(categoryStats[product.category].minPrice, product.price);
      categoryStats[product.category].maxPrice = Math.max(categoryStats[product.category].maxPrice, product.price);
    });
    
    console.log('Found products:', {
      total,
      categories: Object.keys(categoryStats),
      categoryStats,
      firstProduct: products[0]?.name,
      lastProduct: products[products.length - 1]?.name
    });

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total,
        pages: 1,
        currentPage: 1,
        perPage: total,
        hasMore: false
      }
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch products' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    
    // Validate required fields
    const { name, price, description, category, imageUrl } = body;
    if (!name || !price || !description || !category) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    // Create new product
    const product = new Product({
      name,
      price,
      description,
      category,
      imageUrl,
      createdBy: session.user.id
    });

    await product.save();

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
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
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
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
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

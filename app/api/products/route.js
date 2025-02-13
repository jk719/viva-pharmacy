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

export async function GET(request) {
  try {
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
    
    if (!rateLimit.check(request)) {
      return NextResponse.json({
        success: false,
        message: 'Too many requests. Please try again later.'
      }, { 
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      });
    }

    await dbConnect();
    
    // Add a small delay to ensure connection is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const Product = getProductModel();
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    // Log raw product data
    if (products[0]) {
      console.log('API: Raw product data:', {
        name: products[0].name,
        category: products[0].category,
        tagline: products[0].categoryTagline,
        _raw: products[0].toObject()
      });
    }

    const mappedProducts = products.map(product => {
      const productObj = product.toObject();
      
      // Find the category tagline from categories data
      const categoryData = categories.find(cat => 
        cat.name.toLowerCase() === productObj.category.toLowerCase()
      );
      
      return {
        _id: productObj._id.toString(),
        name: productObj.name,
        description: productObj.description,
        price: productObj.price,
        image: productObj.imageUrl || '/images/placeholder.png', // Use Cloudinary URL
        category: productObj.category,
        categoryTagline: categoryData?.tagline || productObj.category, // Use category name as fallback
        isInStock: productObj.stock > 0,
        isNew: productObj.isNewProduct,
        stock: productObj.stock,
        activeIngredients: productObj.activeIngredients,
        dosageForm: productObj.dosageForm
      };
    });

    // Log mapped product
    if (mappedProducts[0]) {
      console.log('API: Mapped product:', {
        name: mappedProducts[0].name,
        category: mappedProducts[0].category,
        tagline: mappedProducts[0].categoryTagline
      });
    }

    return NextResponse.json({
      success: true,
      products: mappedProducts
    });
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
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

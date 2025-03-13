import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import getProductModel from '@/models/Product';
import { authOptions } from '@/lib/auth';
import { isValidObjectId } from 'mongoose';
import { categories, isCategoryValid, isSubcategoryValid, isItemValid } from '@/data/categories';
import { getCloudinaryUrl, FALLBACK_IMAGE } from '@/lib/cloudinary';

const generateSEOData = (product, category, item) => ({
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
});

export async function GET(request, context) {
    try {
        await dbConnect();
        const Product = getProductModel();
        
        const id = await Promise.resolve(context.params).then(p => p.id);
        
        if (!id || !isValidObjectId(id)) {
            console.error('Invalid product ID:', id);
            return NextResponse.json(
                { success: false, message: 'Invalid product ID' },
                { status: 400 }
            );
        }

        const product = await Product.findById(id);
        
        if (!product) {
            console.warn('Product not found:', id);
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Get category and item information
        const category = categories.find(c => c.slug === product.categorySlug);
        const item = category?.items?.find(i => i.slug === product.itemSlug);

        // Convert to plain object and handle image URL
        const productData = product.toObject();
        
        // Handle image URL
        let imageUrl = product.cloudinaryPublicId 
            ? getCloudinaryUrl(product.cloudinaryPublicId)
            : product.imageUrl || FALLBACK_IMAGE;

        // Update the product data with the resolved image URL
        productData.imageUrl = imageUrl;

        // Generate or use existing SEO data
        const seoData = product.seo || generateSEOData(product, category, item);

        // Update image in SEO data
        if (seoData.structuredData) {
            seoData.structuredData.image = imageUrl;
        }

        productData.seo = seoData;

        // Log only essential information
        console.log(`Product fetched successfully: ${id} - ${product.name}`);

        return NextResponse.json({ 
            success: true, 
            product: productData,
            message: 'Product fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch product', error: error.message }, 
            { status: 500 }
        );
    }
}

export async function PUT(request, context) {
    try {
        const id = await Promise.resolve(context.params).then(p => p.id);
        console.log('PUT request for product:', id);
        
        const session = await getServerSession(authOptions);
        if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        const data = await request.json();
        console.log('Received update data:', data);

        await dbConnect();
        const Product = getProductModel();
        
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
            seo: seoData
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
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to update product' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, context) {
    try {
        await dbConnect();
        const Product = getProductModel();
        
        const id = await Promise.resolve(context.params).then(p => p.id);
        console.log('DELETE request for product:', id);
        
        const session = await getServerSession(authOptions);
        console.log('Session user role:', session?.user?.role);
        
        if (!session?.user?.role || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Product ID is required' },
                { status: 400 }
            );
        }

        const product = await Product.findByIdAndDelete(id);
        
        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully',
            productId: id
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to delete product',
                error: error.message 
            }, 
            { status: 500 }
        );
    }
} 
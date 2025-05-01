import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next'; // Removed unused import
import dbConnect from '@/lib/dbConnect';
import getProductModel from '@/models/Product';
// import { authOptions } from '@/lib/auth'; // Removed unused import
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
        productData.imageUrl = getCloudinaryUrl(product);

        // Generate or use existing SEO data
        const seoData = product.seo || generateSEOData(product, category, item);

        // Update image in SEO data
        if (seoData.structuredData) {
            seoData.structuredData.image = productData.imageUrl;
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
        
        // Middleware ensures ADMIN or MANAGER role
        const token = request.nextauth?.token;
        if (!token?.email) { // Check for token/email presence
            console.error('Token or email missing in product PUT after middleware');
            return NextResponse.json({ success: false, message: 'Authentication Error' }, { status: 500 });
        }

        const data = await request.json();
        await dbConnect();
        const Product = getProductModel();

        // Fetch existing product first
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Check for SKU conflict ONLY if the SKU is actually changed
        if (data.sku && data.sku !== existingProduct.sku) {
            const skuExists = await Product.findOne({ 
                sku: data.sku,
                _id: { $ne: id } // Exclude the current product
            });
            
            if (skuExists) {
                return NextResponse.json({ 
                    success: false, 
                    message: 'SKU already exists. Please use a different SKU.' 
                }, { status: 409 });
            }
        } else {
            // If SKU is not provided or unchanged, use the existing one
            data.sku = existingProduct.sku;
        }

        // Ensure isFeatured is a boolean
        if (typeof data.isFeatured === 'string') {
            data.isFeatured = data.isFeatured === 'true';
        }

        // Compare old and new values to track changes
        const changes = Object.keys(data).reduce((acc, key) => {
            if (key !== 'editHistory' && // Skip editHistory field
                JSON.stringify(existingProduct[key]) !== JSON.stringify(data[key])) {
                acc.push({
                    field: key,
                    oldValue: existingProduct[key],
                    newValue: data[key]
                });
            }
            return acc;
        }, []);

        // Only proceed with update if there are actual changes
        if (changes.length > 0) {
            // Create new history entry
            const newHistoryEntry = {
                editedBy: token.email, // Use token.email
                timestamp: new Date(),
                changes
            };

            // SPLIT THE UPDATE INTO TWO OPERATIONS:
            
            // 1. First, update all the product data except editHistory
            const updateData = { ...data, updatedAt: new Date() };
            delete updateData.editHistory; // Remove editHistory to avoid conflicts
            
            await Product.findByIdAndUpdate(
                id,
                { $set: updateData },
                { runValidators: true }
            );
            
            // 2. Then in a separate operation, update the editHistory array
            const result = await Product.findByIdAndUpdate(
                id,
                { $push: { editHistory: newHistoryEntry } },
                { new: true, runValidators: true }
            );

            if (!result) {
                return NextResponse.json(
                    { success: false, message: 'Failed to update product' },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                success: true,
                product: result,
                message: 'Product updated successfully'
            });
        } else {
            // No changes detected
            return NextResponse.json({
                success: true,
                product: existingProduct,
                message: 'No changes detected'
            });
        }

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
        
        // Middleware ensures ADMIN or MANAGER role
        const token = request.nextauth?.token;
        if (!token) { // Simple check for token presence
            console.error('Token missing in product DELETE after middleware');
            return NextResponse.json({ success: false, message: 'Authentication Error' }, { status: 500 });
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
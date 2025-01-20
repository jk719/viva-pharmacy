import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isValidObjectId } from 'mongoose';

// Add the fallback image URL as a constant
const FALLBACK_IMAGE = 'https://res.cloudinary.com/dv3cd1aoy/image/upload/v1737391942/viva-pharmacy/products/placeholder.svg';

export async function GET(request, context) {
    try {
        await dbConnect();
        
        const id = await Promise.resolve(context.params).then(p => p.id);
        console.log('GET request for product:', id);
        
        if (!id) {
            console.error('No product ID provided');
            return NextResponse.json(
                { success: false, message: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Validate MongoDB ObjectId
        if (!isValidObjectId(id)) {
            console.error('Invalid product ID format');
            return NextResponse.json(
                { success: false, message: 'Invalid product ID format' },
                { status: 400 }
            );
        }

        const product = await Product.findById(id);
        
        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Use Cloudinary URL if available, otherwise use fallback
        const imageUrl = product.image?.startsWith('https://res.cloudinary.com/') 
            ? product.image 
            : FALLBACK_IMAGE;

        // Add image URL logging
        console.log('Product lookup result:', {
            id,
            found: true,
            name: product.name,
            imageUrl
        });

        // Return the product with the validated image URL
        const productData = product.toObject();
        productData.image = imageUrl;

        return NextResponse.json({ 
            success: true, 
            product: productData,
            message: 'Product fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to fetch product',
                error: error.message 
            }, 
            { status: 500 }
        );
    }
}

export async function PUT(request, context) {
    try {
        const id = await Promise.resolve(context.params).then(p => p.id);
        console.log('PUT request for product:', id);
        
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

        await dbConnect();
        const data = await request.json();
        console.log('Updating product:', { id, updates: data });

        const product = await Product.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to update product',
                error: error.message 
            }, 
            { status: 500 }
        );
    }
}

export async function DELETE(request, context) {
    try {
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

        await dbConnect();
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
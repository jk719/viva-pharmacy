import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isValidObjectId } from 'mongoose';

export async function GET(request, context) {
    const { id } = await Promise.resolve(context.params);
    console.log('GET request for product:', id);
    
    try {
        await dbConnect();
        
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
        
        // Add image URL logging
        console.log('Product lookup result:', {
            id,
            found: !!product,
            name: product?.name,
            imageUrl: product?.image
        });
        
        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Validate image URL
        if (!product.image?.startsWith('https://res.cloudinary.com/')) {
            console.warn('Invalid image URL format:', product.image);
        }

        return NextResponse.json({ 
            success: true, 
            product,
            message: 'Product fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching product:', {
            id,
            error: error.message,
            stack: error.stack
        });
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
    const { id } = await Promise.resolve(context.params);
    console.log('PUT request for product:', id);
    
    try {
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
    const { id } = await Promise.resolve(context.params);
    console.log('DELETE request for product:', id);
    
    try {
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
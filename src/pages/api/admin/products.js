import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { addProductToFile, validateProduct } from '@/lib/products/productUtils';

export default async function handler(req, res) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Validate the product data
    await validateProduct(req.body);

    // Add the product to the file
    const newProduct = await addProductToFile(req.body);

    // Send success response
    res.status(200).json({ 
      message: 'Product added successfully',
      product: newProduct 
    });

  } catch (error) {
    console.error('Error in product API:', error);
    res.status(500).json({ 
      message: error.message || 'Error adding product'
    });
  }
}
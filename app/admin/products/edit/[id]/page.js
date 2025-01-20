import EditProductClient from './EditProductClient';

export const metadata = {
  title: 'Edit Product - Admin Dashboard',
  description: 'Edit product details in the admin dashboard',
};

// Server Component
export default async function EditProductPage({ params }) {
  const { id } = await params;
  return <EditProductClient productId={id} />;
} 
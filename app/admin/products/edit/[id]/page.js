import EditProductClient from './EditProductClient';

// Server Component
export default function EditProductPage({ params }) {
  return <EditProductClient productId={params.id} />;
} 
// src/app/products/[id]/page.js

import products from '../../../data/products';
import ClientProductView from './ClientProductView';

export default async function ProductPage({ params }) {
  // Destructure `params.id` using await as an async operation
  const { id } = await params;
  
  // Parse `id` as an integer
  const productId = parseInt(id, 10);

  // Search for the product
  const product = products.find((prod) => prod.id === productId);

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <ClientProductView product={product} />
    </div>
  );
}

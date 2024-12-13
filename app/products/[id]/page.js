// src/app/products/[id]/page.js

import products from '../../../data/products';
import ClientProductView from './ClientProductView';

export default async function ProductPage({ params }) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  const product = products.find((prod) => prod.id === productId);

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientProductView product={product} />
    </div>
  );
}

// src/app/products/[id]/page.js

import products from '../../../data/products';
import ClientProductView from './ClientProductView';

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

export default function ProductPage({ params }) {
  const productId = parseInt(params.id, 10);
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

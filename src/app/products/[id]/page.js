import ProductDetails from './ProductDetails';

// Example product list - if you have a central products file, you can import it instead
const products = [
  { id: 1, name: "Vitamin C", price: 12.99, description: "Boost your immunity with Vitamin C supplements." },
  { id: 2, name: "Omega-3 Fish Oil", price: 19.99, description: "Heart health support with Omega-3 fish oil." },
  { id: 3, name: "Multivitamins", price: 24.99, description: "Daily multivitamins for overall health." }
];

// Generate static params for each product ID
export async function generateStaticParams() {
  return products.map((product) => ({ id: product.id.toString() }));
}

export default function ProductPage({ params }) {
  const { id } = params;
  const product = products.find((product) => product.id.toString() === id);

  if (!product) {
    return <div>Product not found</div>;
  }

  // Render the client component with the specific product
  return <ProductDetails product={product} />;
}

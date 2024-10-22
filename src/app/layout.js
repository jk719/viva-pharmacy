import { CartProvider } from '../context/CartContext';  // Ensure the correct path to CartProvider
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>  {/* Wrap the entire app with CartProvider */}
          <nav className="p-4 bg-blue-600 text-white">
            <div className="container mx-auto flex justify-between">
              <a href="/" className="text-xl font-bold">VIVA Pharmacy</a>
              <div className="space-x-4">
                <a href="/" className="hover:underline">Home</a>
                <a href="/products" className="hover:underline">Products</a>
                <a href="/cart" className="hover:underline">Cart</a>
              </div>
            </div>
          </nav>
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}

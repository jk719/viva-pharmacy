// src/components/Cart.js
import { useCart } from '../context/CartContext';
import Image from 'next/image';

export default function Cart() {
    const { cartItems, removeFromCart } = useCart();

    return (
        <div className="cart p-6 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
            {cartItems.length === 0 ? (
                <p className="text-gray-700">Your cart is empty.</p>
            ) : (
                cartItems.map((item) => (
                    <div 
                        key={item.id} 
                        className="cart-item flex items-center mb-4 p-4 bg-white rounded-lg shadow-sm"
                    >
                        <div className="cart-item-image w-24 h-24 mr-4">
                            <Image
                                src={item.image}
                                alt={item.name}
                                width={96}
                                height={96}
                                layout="responsive" // Ensure responsive layout
                                priority
                                className="object-contain rounded"
                            />
                        </div>
                        <div className="cart-item-info flex-grow">
                            <h3 className="text-lg font-semibold text-primary">{item.name}</h3>
                            <p className="text-gray-600">Quantity: {item.quantity}</p>
                            <p className="text-gray-800 font-medium">Price: ${item.price.toFixed(2)}</p>
                            <p className="text-gray-800 font-medium">
                                Total: ${(item.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 font-semibold ml-4"
                        >
                            Remove
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

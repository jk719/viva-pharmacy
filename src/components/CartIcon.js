// src/components/CartIcon.js
import { useCart } from '../context/CartContext';

export default function CartIcon() {
    const { cartItems } = useCart();
    const totalItems = cartItems.reduce(
        (total, item) => total + (Number(item.quantity) || 0), 
        0
    );

    return (
        <div className="flex items-center">
            <span className="mr-1">🛒</span> {/* Display cart icon */}
            <span>{totalItems}</span>
        </div>
    );
}

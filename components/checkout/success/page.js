import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

function SuccessContent() {
  const { clearCart } = useCart();
  const router = useRouter();
  const { data: session } = useSession();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const hasProcessedPayment = sessionStorage.getItem('paymentProcessed');
    const paymentIntentId = sessionStorage.getItem('paymentIntentId');
    
    if (!hasProcessedPayment || !paymentIntentId) {
        router.push('/');
        return;
    }

    // Clear cart and session storage
    clearCart();
    sessionStorage.removeItem('paymentProcessed');
    sessionStorage.removeItem('paymentIntentId');
    
    // No need to trigger another email - webhook has handled it
  }, [clearCart, router]);

  // ... rest of the code ...
}

export default SuccessContent;

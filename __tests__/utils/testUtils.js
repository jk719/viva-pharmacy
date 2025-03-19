import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/context/CartContext';

export const createMockSession = (overrides = {}) => ({
  user: {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    loyaltyProgram: {
      points: 1000,
      tier: 'Gold',
      multiplier: 1.5,
      ...overrides.loyaltyProgram
    },
    ...overrides
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
});

export const renderWithProviders = (ui, { session = null, ...options } = {}) => {
  const Wrapper = ({ children }) => (
    <SessionProvider session={session}>
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

export const mockFetch = (data) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data)
    })
  );
};

export const mockStripe = () => {
  return {
    confirmPayment: jest.fn(() => Promise.resolve({ paymentIntent: { status: 'succeeded', id: 'pi_123' } })),
    elements: jest.fn(() => ({
      getElement: jest.fn()
    }))
  };
}; 
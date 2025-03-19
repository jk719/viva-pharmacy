import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockSession, mockFetch, mockStripe } from '../utils/testUtils';
import PaymentForm from '@/components/checkout/PaymentForm';
import { LoyaltyCheckoutService } from '@/lib/checkout/loyaltyCheckoutService';

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: () => Promise.resolve(mockStripe())
}));

describe('Checkout Integration Tests', () => {
  const defaultProps = {
    amount: 100,
    amountDetails: {
      subtotal: 95,
      tax: 5,
      total: 100
    },
    items: [
      { id: '1', name: 'Test Product', price: 95, quantity: 1 }
    ],
    shippingAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345'
    },
    deliveryMethod: 'delivery',
    selectedTime: '2024-01-01T12:00:00'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calculates and displays correct loyalty benefits', async () => {
    const session = createMockSession();
    const loyaltyBenefits = {
      basePoints: 1000,
      tierMultiplier: 1.5,
      eventBenefits: {
        bonusPoints: 500,
        appliedEvents: [
          { name: 'Summer Sale', multiplier: 2 }
        ]
      },
      totalPoints: 2500
    };

    mockFetch({ loyaltyBenefits });

    renderWithProviders(
      <PaymentForm {...defaultProps} />,
      { session }
    );

    await waitFor(() => {
      expect(screen.getByText('VivaBucks Rewards Summary')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument(); // Base points
      expect(screen.getByText('2500')).toBeInTheDocument(); // Total points
      expect(screen.getByText('Summer Sale applied: 2x multiplier')).toBeInTheDocument();
    });
  });

  test('applies coupon correctly to order total', async () => {
    const session = createMockSession();
    const coupon = {
      code: 'TEST10',
      amount: 10
    };

    mockFetch({ coupons: [coupon] });

    renderWithProviders(
      <PaymentForm {...defaultProps} />,
      { session }
    );

    await waitFor(() => {
      expect(screen.getByText('Available Coupons')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('$10 off your purchase'));

    await waitFor(() => {
      expect(screen.getByText('$90.00')).toBeInTheDocument(); // Updated total
    });
  });

  test('processes successful payment and loyalty points', async () => {
    const session = createMockSession();
    const loyaltyUpdate = {
      points: 2500,
      tier: 'Platinum',
      multiplier: 1.75
    };

    mockFetch({ loyaltyUpdate });

    const { container } = renderWithProviders(
      <PaymentForm {...defaultProps} />,
      { session }
    );

    // Submit payment
    const submitButton = screen.getByText('Pay Now');
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Verify loyalty points were updated
      expect(fetch).toHaveBeenCalledWith(
        '/api/loyalty/points',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('orderId')
        })
      );

      // Verify success message
      expect(screen.getByText('Payment successful!')).toBeInTheDocument();
    });
  });

  test('handles special events during checkout', async () => {
    const session = createMockSession();
    const activeEvent = {
      name: 'Double Points Weekend',
      pointMultiplier: 2,
      bonusPoints: 1000
    };

    mockFetch({ 
      activeEvents: [activeEvent],
      loyaltyBenefits: {
        basePoints: 1000,
        tierMultiplier: 1.5,
        eventBenefits: {
          bonusPoints: 1000,
          appliedEvents: [activeEvent]
        },
        totalPoints: 4000
      }
    });

    renderWithProviders(
      <PaymentForm {...defaultProps} />,
      { session }
    );

    await waitFor(() => {
      expect(screen.getByText('Double Points Weekend applied: 2x multiplier')).toBeInTheDocument();
      expect(screen.getByText('4000')).toBeInTheDocument(); // Total points with event multiplier
    });
  });

  test('handles error states gracefully', async () => {
    const session = createMockSession();
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

    renderWithProviders(
      <PaymentForm {...defaultProps} />,
      { session }
    );

    const submitButton = screen.getByText('Pay Now');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });
}); 
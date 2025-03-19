import { createMocks } from 'node-mocks-http';
import { POST as loyaltyPointsHandler } from '@/app/api/loyalty/points/route';
import { POST as checkoutHandler } from '@/app/api/orders/confirmations/route';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase, clearDatabase, closeDatabase } from '../utils/dbHandler';

jest.mock('next-auth/next');

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('Loyalty Points API', () => {
    test('successfully awards points for purchase', async () => {
      const session = {
        user: {
          id: 'user123',
          email: 'test@example.com'
        }
      };
      getServerSession.mockResolvedValue(session);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          orderId: 'order123',
          amount: 100
        }
      });

      await loyaltyPointsHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.points).toBeDefined();
      expect(data.totalPoints).toBeDefined();
    });

    test('handles missing user session', async () => {
      getServerSession.mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          orderId: 'order123',
          amount: 100
        }
      });

      await loyaltyPointsHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe('Checkout API', () => {
    test('successfully processes order with loyalty benefits', async () => {
      const session = {
        user: {
          id: 'user123',
          email: 'test@example.com'
        }
      };
      getServerSession.mockResolvedValue(session);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          orderNumber: 'order123',
          items: [{ id: 'item1', price: 100, quantity: 1 }],
          total: 100
        }
      });

      await checkoutHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.order).toBeDefined();
      expect(data.loyaltyBenefits).toBeDefined();
    });
  });
}); 
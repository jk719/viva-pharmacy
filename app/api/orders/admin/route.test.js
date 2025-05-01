import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/orders/admin/route';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

// Mock next-auth/jwt
// jest.mock('next-auth/jwt'); // Remove this line
// const mockGetToken = getToken; // Remove this line

// Mock the module and provide a mock implementation for getToken
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(), 
}));

// Import the mocked getToken AFTER the mock is defined
import { getToken } from 'next-auth/jwt';
const mockGetToken = getToken; // Keep this reference for use in tests

// Mock dependencies
jest.mock('@/lib/dbConnect');
jest.mock('@/models/Order');

describe('/api/orders/admin GET Endpoint', () => {

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Default mock for unauthenticated
    mockGetToken.mockResolvedValue(null);
    // Mock dbConnect to resolve successfully by default
    dbConnect.mockResolvedValue(true);
    // Reset Order mock methods
    Order.find = jest.fn().mockReturnThis(); // Chainable
    Order.populate = jest.fn().mockReturnThis(); // Chainable
    Order.sort = jest.fn().mockReturnThis(); // Chainable
    Order.lean = jest.fn(); // Final method in chain
  });

  // --- Authentication & Authorization Tests ---

  test('should return 403 Forbidden if no token is provided', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await GET(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Unauthorized' });
    expect(dbConnect).not.toHaveBeenCalled();
    expect(Order.find).not.toHaveBeenCalled();
  });

  test('should return 403 Forbidden if user role is not ADMIN or MANAGER', async () => {
     mockGetToken.mockResolvedValue({ role: 'USER' }); // Simulate non-admin/manager user
     const { req, res } = createMocks({
      method: 'GET',
    });

    await GET(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Unauthorized' });
    expect(dbConnect).not.toHaveBeenCalled();
    expect(Order.find).not.toHaveBeenCalled();
  });

  // --- Functional Tests (Admin/Manager Access) ---

  test('should return 200 and orders if user role is ADMIN', async () => {
    const mockOrders = [
      { _id: 'order1', orderNumber: 'ORD001', userId: { name: 'Admin User', email: 'admin@example.com' }, status: 'Completed', total: 100, createdAt: new Date(), items: [], deliveryMethod: 'Pickup', paymentStatus: 'Paid' },
      { _id: 'order2', orderNumber: 'ORD002', userId: { name: 'Test User', email: 'test@example.com' }, status: 'Processing', total: 50, createdAt: new Date(), items: [], deliveryMethod: 'Delivery', paymentStatus: 'Paid' },
    ];
    Order.lean.mockResolvedValue(mockOrders); // Mock the final result of the query chain

    mockGetToken.mockResolvedValue({ role: 'ADMIN' }); // Simulate ADMIN user
    const { req, res } = createMocks({
      method: 'GET',
    });

    await GET(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(dbConnect).toHaveBeenCalledTimes(1);
    expect(Order.find).toHaveBeenCalledTimes(1);
    expect(Order.populate).toHaveBeenCalledWith('userId', 'email name');
    expect(Order.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(Order.lean).toHaveBeenCalledTimes(1);

    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(responseData.orders).toHaveLength(2);
    // Check transformation (e.g., _id -> id)
    expect(responseData.orders[0].id).toBe('order1');
    expect(responseData.orders[0].orderNumber).toBe('ORD001');
  });

   test('should return 200 and orders if user role is MANAGER', async () => {
    const mockOrders = [
      { _id: 'order3', orderNumber: 'ORD003', userId: { name: 'Manager User', email: 'manager@example.com' }, status: 'Pending', total: 200, createdAt: new Date(), items: [], deliveryMethod: 'Pickup', paymentStatus: 'Pending' }
    ];
    Order.lean.mockResolvedValue(mockOrders); // Mock the final result of the query chain

    mockGetToken.mockResolvedValue({ role: 'MANAGER' }); // Simulate MANAGER user
    const { req, res } = createMocks({
      method: 'GET',
    });

    await GET(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(dbConnect).toHaveBeenCalledTimes(1);
    expect(Order.find).toHaveBeenCalledTimes(1);
    expect(Order.populate).toHaveBeenCalledWith('userId', 'email name');
    expect(Order.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(Order.lean).toHaveBeenCalledTimes(1);

    const responseData = JSON.parse(res._getData());
    expect(responseData.success).toBe(true);
    expect(responseData.orders).toHaveLength(1);
    expect(responseData.orders[0].id).toBe('order3');
    expect(responseData.orders[0].orderNumber).toBe('ORD003');
  });


  test('should return 500 if database connection fails', async () => {
    dbConnect.mockRejectedValue(new Error('DB Connection Error')); // Simulate DB error

    mockGetToken.mockResolvedValue({ role: 'ADMIN' }); // Simulate ADMIN user
    const { req, res } = createMocks({
      method: 'GET',
    });

    await GET(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Failed to fetch orders' });
    expect(dbConnect).toHaveBeenCalledTimes(1);
    expect(Order.find).not.toHaveBeenCalled(); // Should fail before query
  });

  test('should return 500 if database query fails', async () => {
    Order.lean.mockRejectedValue(new Error('DB Query Error')); // Simulate query error

    mockGetToken.mockResolvedValue({ role: 'ADMIN' }); // Simulate ADMIN user
    const { req, res } = createMocks({
      method: 'GET',
    });

    await GET(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Failed to fetch orders' });
    expect(dbConnect).toHaveBeenCalledTimes(1);
    expect(Order.find).toHaveBeenCalledTimes(1); // Query starts but fails
  });

}); 
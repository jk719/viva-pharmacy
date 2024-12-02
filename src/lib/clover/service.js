import axios from 'axios';
import { CLOVER_CONFIG } from './config';

class CloverService {
  constructor() {
    this.api = axios.create({
      baseURL: CLOVER_CONFIG.baseUrl,
      headers: {
        'Authorization': `Bearer ${CLOVER_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createOrder(items) {
    try {
      const order = await this.api.post(`/merchants/${CLOVER_CONFIG.merchantId}/orders`, {
        currency: 'USD',
        items: items.map(item => ({
          name: item.name,
          price: Math.round(item.price * 100), // Convert to cents
          quantity: item.quantity
        }))
      });

      return order.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async createPayment(orderId, amount) {
    try {
      const payment = await this.api.post(`/merchants/${CLOVER_CONFIG.merchantId}/payments`, {
        orderId,
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD'
      });

      return payment.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
}

export const cloverService = new CloverService();

import eventEmitter, { Events } from '@/lib/eventEmitter';

class PaymentTracker {
  constructor() {
    this.payments = new Map();
  }

  startPayment(paymentIntentId, userId, amount) {
    console.log('🔄 Payment tracker: Starting payment', {
      paymentIntentId,
      userId,
      amount
    });

    this.payments.set(paymentIntentId, {
      startTime: Date.now(),
      status: 'pending',
      userId,
      amount
    });

    // Emit payment started event
    eventEmitter.emit(Events.PAYMENT_STARTED, {
      paymentIntentId,
      userId,
      amount,
      type: 'PAYMENT_STARTED',
      timestamp: new Date().toISOString()
    });
  }

  completePayment(paymentIntentId) {
    const payment = this.payments.get(paymentIntentId);
    if (!payment) return;

    console.log('✅ Payment tracker: Completing payment', {
      paymentIntentId,
      userId: payment.userId,
      amount: payment.amount
    });

    this.payments.set(paymentIntentId, {
      ...payment,
      status: 'completed',
      completedAt: Date.now()
    });

    // Emit payment completed event
    eventEmitter.emit(Events.PAYMENT_COMPLETED, {
      paymentIntentId,
      userId: payment.userId,
      amount: payment.amount,
      type: 'PAYMENT_COMPLETED',
      timestamp: new Date().toISOString()
    });
  }

  isProcessing(paymentIntentId) {
    const payment = this.payments.get(paymentIntentId);
    return payment && payment.status === 'pending';
  }

  cleanup() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [id, payment] of this.payments) {
      if (payment.startTime < fiveMinutesAgo) {
        this.payments.delete(id);
      }
    }
  }
}

export const paymentTracker = new PaymentTracker(); 
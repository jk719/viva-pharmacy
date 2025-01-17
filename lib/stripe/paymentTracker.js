class PaymentTracker {
  constructor() {
    this.payments = new Map();
  }

  startPayment(paymentIntentId) {
    this.payments.set(paymentIntentId, {
      startTime: Date.now(),
      status: 'pending'
    });
  }

  completePayment(paymentIntentId) {
    this.payments.set(paymentIntentId, {
      ...this.payments.get(paymentIntentId),
      status: 'completed',
      completedAt: Date.now()
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
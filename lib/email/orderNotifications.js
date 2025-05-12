import { emailService } from '@/lib/email/emailService';

const STATUS_MESSAGES = {
  Processing: 'Your order is being processed and will be prepared for shipping soon.',
  Shipped: 'Your order has been shipped and is on its way!',
  Delivered: 'Your order has been delivered. Thank you for shopping with us!',
  Completed: 'Your order is now complete. We hope you enjoyed your purchase!',
  Refunded: 'Your refund has been processed successfully.',
  Cancelled: 'Your order has been cancelled.'
};

export async function sendOrderStatusUpdate(order, newStatus) {
  if (!order?.userId?.email) return;

  const message = STATUS_MESSAGES[newStatus];
  if (!message) {
    console.warn(`No status message defined for order status: ${newStatus}`);
    return; // Or use a default message
  }

  const templateData = {
    orderNumber: order.orderNumber,
    status: newStatus,
    message,
    items: order.items,
    total: order.total,
    deliveryMethod: order.deliveryMethod,
    shippingAddress: order.shippingAddress,
    // Ensure all data expected by the 'orderUpdate' template is passed
    // For example, customerName might be needed by the template
    customerName: order.userId.name || order.userId.email, 
  };

  try {
    await emailService.sendEmail(
      order.userId.email,
      'orderUpdate', 
      templateData
    );
    console.log('✅ Order status update email sent successfully for order:', order.orderNumber);
  } catch (error) {
    console.error('❌ Error sending order status update email for order:', order.orderNumber, error);
  }
}

export async function sendRefundConfirmation(order, refundDetails) {
  if (!order?.userId?.email) return;

  const templateData = {
    orderNumber: order.orderNumber,
    name: order.userId.name || order.userId.email,
    amount: refundDetails.amount,
    reason: refundDetails.reason,
    processedDate: refundDetails.processedDate,
    // Ensure all data expected by the 'refundConfirmation' template is passed
  };

  try {
    await emailService.sendEmail(
      order.userId.email,
      'refundConfirmation',
      templateData
    );
    console.log('✅ Refund confirmation email sent successfully for order:', order.orderNumber);
  } catch (error) {
    console.error('❌ Error sending refund confirmation email for order:', order.orderNumber, error);
  }
}

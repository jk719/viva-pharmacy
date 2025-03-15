import { sendEmail } from './sendEmail';
import { orderUpdateTemplate } from '../email-templates/order-update';

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
  if (!message) return;

  const emailContent = orderUpdateTemplate({
    orderNumber: order.orderNumber,
    status: newStatus,
    message,
    items: order.items,
    total: order.total,
    deliveryMethod: order.deliveryMethod,
    shippingAddress: order.shippingAddress
  });

  try {
    await sendEmail({
      to: order.userId.email,
      subject: `Order #${order.orderNumber} Status Update`,
      html: emailContent,
      headers: {
        'X-Priority': '1',
        'X-Application': 'Viva Pharmacy'
      }
    });

    console.log('✅ Order status update email sent successfully');
  } catch (error) {
    console.error('❌ Error sending order status update email:', error);
    // Don't throw the error - we still want the status update to succeed
  }
}

export async function sendRefundConfirmation(order, refundDetails) {
  if (!order?.userId?.email) return;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>Refund Confirmation</h1>
      <p>Dear ${order.userId.name || 'Valued Customer'},</p>
      <p>Your refund for Order #${order.orderNumber} has been processed successfully.</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">
        <h2>Refund Details</h2>
        <p>Amount: $${refundDetails.amount.toFixed(2)}</p>
        <p>Reason: ${refundDetails.reason}</p>
        <p>Date Processed: ${new Date(refundDetails.processedDate).toLocaleDateString()}</p>
      </div>

      <p>The refund should appear in your account within 5-10 business days.</p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p>Thank you for shopping with Viva Pharmacy!</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: order.userId.email,
      subject: `Refund Processed for Order #${order.orderNumber}`,
      html: emailContent,
      headers: {
        'X-Priority': '1',
        'X-Application': 'Viva Pharmacy'
      }
    });

    console.log('✅ Refund confirmation email sent successfully');
  } catch (error) {
    console.error('❌ Error sending refund confirmation email:', error);
  }
}

import { emailService } from '@/lib/email/emailService';
import { twilioService } from '@/lib/sms/twilioService';
import { smsTemplates } from '@/lib/sms/templates';
import User from '@/models/User';

export async function sendPrescriptionNotification({
  userId,
  status,
  prescriptionId,
  note,
  type = 'all'
}) {
  try {
    const user = await User.findById(userId)
      .select('email phoneNumber name notificationPreferences')
      .lean();

    if (!user) {
      throw new Error('User not found');
    }

    const notifications = [];

    // Email notification
    if (type === 'all' || type === 'email') {
      notifications.push(
        emailService.sendPrescriptionStatusEmail(user, {
          status,
          prescriptionId,
          note
        })
      );
    }

    // SMS notification
    if ((type === 'all' || type === 'sms') && 
        user.phoneNumber && 
        user.smsPreferences?.prescriptionStatus) {
      const { message } = smsTemplates.prescriptionStatus({
        prescriptionId,
        status,
        note
      });

      notifications.push(
        twilioService.sendSMS(user.phoneNumber, message)
      );
    }

    // Wait for all notifications to complete
    await Promise.all(notifications);
    return true;
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
}

export async function sendOrderStatusNotification({
  orderId,
  status,
  userId
}) {
  try {
    const user = await User.findById(userId)
      .select('email phoneNumber name')
      .lean();
    
    if (!user) {
      throw new Error('User not found');
    }

    const notifications = [];

    // Email notification
    notifications.push(
      emailService.sendOrderUpdateEmail(user, {
        orderNumber: orderId,
        status,
        message: getStatusMessage(status),
        items: [], // These would be populated from the actual order
        total: 0,
        deliveryMethod: 'delivery', // Default
        shippingAddress: {}
      })
    );

    // SMS notification
    if (user.phoneNumber && user.smsPreferences?.orderUpdates) {
      const { message } = smsTemplates.orderStatus({
        orderNumber: orderId,
        status
      });

      notifications.push(
        twilioService.sendSMS(user.phoneNumber, message)
      );
    }

    await Promise.all(notifications);
    return true;
  } catch (error) {
    console.error('Order notification error:', error);
    return false;
  }
}

// Helper function to get status message
function getStatusMessage(status) {
  const STATUS_MESSAGES = {
    Processing: 'Your order is being processed and will be prepared for shipping soon.',
    Shipped: 'Your order has been shipped and is on its way!',
    Delivered: 'Your order has been delivered. Thank you for shopping with us!',
    Completed: 'Your order is now complete. We hope you enjoyed your purchase!',
    Refunded: 'Your refund has been processed successfully.',
    Cancelled: 'Your order has been cancelled.'
  };
  
  return STATUS_MESSAGES[status] || `Your order status has been updated to: ${status}`;
}

// Update the general notification function
export const sendNotification = async (type, data) => {
  try {
    switch (type) {
      case 'PRESCRIPTION_UPLOADED':
        return sendPrescriptionNotification({
          ...data,
          status: 'uploaded',
          note: 'Your prescription has been received and is being reviewed by our pharmacist.',
          type: 'email'
        });
      case 'PRESCRIPTION_VERIFIED':
        return sendPrescriptionNotification({
          ...data,
          status: 'verified',
          type: 'all'
        });
      case 'PRESCRIPTION_REJECTED':
        return sendPrescriptionNotification({
          ...data,
          status: 'rejected',
          type: 'all'
        });
      case 'ORDER_STATUS_UPDATE':
        return sendOrderStatusNotification(data);
      case 'REFUND_PROCESSED':
        return sendRefundNotification(data);
      default:
        console.log('Unknown notification type:', type);
        return false;
    }
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
}; 
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
        emailService.sendEmail(user.email, 'prescriptionStatus', {
          name: user.name || 'Valued Customer',
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
      emailService.sendEmail(user.email, 'orderStatus', {
        name: user.name,
        orderId,
        status
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
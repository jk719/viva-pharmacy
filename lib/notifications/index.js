import { emailService } from '@/lib/email/emailService';
import User from '@/models/User';

export async function sendPrescriptionNotification({
  userId,
  status,
  prescriptionId,
  note,
  type = 'all'
}) {
  try {
    const user = await User.findById(userId).select('email phone notificationPreferences name');

    if (!user) {
      throw new Error('User not found');
    }

    // Email notification
    if (type === 'all' || type === 'email') {
      await emailService.sendEmail(user.email, 'prescriptionStatus', {
        name: user.name || 'Valued Customer',
        status,
        prescriptionId,
        note
      });
    }

    // SMS notification (if configured)
    if ((type === 'all' || type === 'sms') && user.phone) {
      console.log('SMS would be sent:', {
        to: user.phone,
        message: `VIVA Pharmacy: Your prescription has been ${status}.`
      });
    }

    return true;
  } catch (error) {
    console.error('Notification error:', error);
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
      default:
        console.log('Unknown notification type:', type);
        return false;
    }
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
}; 
import { Resend } from 'resend';
import { createTransport } from 'nodemailer';
import twilio from 'twilio';

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendPrescriptionNotification({
  userId,
  status,
  prescriptionId,
  note,
  type = 'all'
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        phone: true,
        notificationPreferences: true,
        name: true
      }
    });

    const notifications = [];

    // Email notification
    if (type === 'all' || type === 'email') {
      notifications.push(
        resend.emails.send({
          from: 'VIVA Pharmacy <prescriptions@vivapharmacy.com>',
          to: user.email,
          subject: `Prescription ${status === 'verified' ? 'Approved' : 'Update Required'}`,
          react: PrescriptionEmailTemplate({
            name: user.name,
            status,
            prescriptionId,
            note
          })
        })
      );
    }

    // SMS notification
    if ((type === 'all' || type === 'sms') && user.phone) {
      notifications.push(
        twilioClient.messages.create({
          body: `VIVA Pharmacy: Your prescription has been ${status}. ${
            status === 'verified' 
              ? 'You can now proceed with checkout.' 
              : 'Please check your email for details.'
          }`,
          to: user.phone,
          from: process.env.TWILIO_PHONE_NUMBER
        })
      );
    }

    await Promise.all(notifications);
    return true;
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
} 
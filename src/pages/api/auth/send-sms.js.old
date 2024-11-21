import { sendSMS } from '@/lib/twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, message } = req.body;
    await sendSMS(phoneNumber, message);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('SMS Error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
}
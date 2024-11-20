import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  // Log environment variables (remove in production)
  console.log('Twilio Config:', {
    accountSid: accountSid?.slice(0, 5) + '...',
    authTokenLength: authToken?.length,
    phoneNumber: fromNumber
  });

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const data = new URLSearchParams();
    data.append('To', req.body.phoneNumber);
    data.append('From', fromNumber);
    data.append('Body', 'Test message from Viva Pharmacy');

    const response = await axios.post(url, data, {
      auth: {
        username: accountSid,
        password: authToken
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    res.status(200).json({
      success: true,
      messageId: response.data.sid,
      status: response.data.status
    });

  } catch (error) {
    console.error('Twilio Error:', {
      name: error.name,
      message: error.message,
      response: error.response?.data
    });

    res.status(500).json({
      error: 'Failed to send message',
      details: error.response?.data?.message || error.message
    });
  }
}
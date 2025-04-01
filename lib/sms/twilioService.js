import twilio from 'twilio';

class TwilioService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendSMS(to, message) {
    try {
      const formattedNumber = this.formatPhoneNumber(to);
      console.log('📱 Twilio Service - Starting SMS send:', {
        originalNumber: to,
        formattedNumber,
        messageLength: message.length,
        fromNumber: this.fromNumber
      });

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedNumber
      });
      
      console.log('✅ Twilio Service - SMS sent successfully:', {
        sid: result.sid,
        status: result.status,
        to: formattedNumber,
        from: this.fromNumber
      });
      
      return result;
    } catch (error) {
      console.error('❌ Twilio Service - Error sending SMS:', {
        error: error.message,
        code: error.code,
        status: error.status,
        to: to,
        from: this.fromNumber
      });
      throw error;
    }
  }

  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Ensure number starts with country code
    if (cleaned.length === 10) {
      return '+1' + cleaned; // Add US country code if not present
    }
    return '+' + cleaned; // Assume number already has country code
  }

  // Validate phone number format
  validatePhoneNumber(phone) {
    const formattedNumber = this.formatPhoneNumber(phone);
    const isValid = /^\+1\d{10}$/.test(formattedNumber);
    console.log('📱 Twilio Service - Phone number validation:', {
      original: phone,
      formatted: formattedNumber,
      isValid
    });
    return isValid;
  }
}

export const twilioService = new TwilioService(); 
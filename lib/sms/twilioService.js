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

  // --- Twilio Verify Methods ---

  async startPhoneNumberVerification(phoneNumber) {
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    if (!process.env.TWILIO_VERIFY_SERVICE_ID) {
      console.error('❌ Twilio Service - TWILIO_VERIFY_SERVICE_ID is not set.');
      throw new Error('Twilio Verify Service ID is not configured.');
    }

    try {
      console.log('📱 Twilio Service - Starting phone number verification:', {
        to: formattedNumber,
        serviceId: process.env.TWILIO_VERIFY_SERVICE_ID
      });
      const verification = await this.client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_ID)
        .verifications.create({ to: formattedNumber, channel: 'sms' });
      
      console.log('✅ Twilio Service - Phone verification started:', {
        sid: verification.sid,
        status: verification.status,
        to: formattedNumber
      });
      return verification;
    } catch (error) {
      console.error('❌ Twilio Service - Error starting phone verification:', {
        error: error.message,
        code: error.code,
        status: error.status,
        to: formattedNumber
      });
      throw error;
    }
  }

  async checkVerificationCode(phoneNumber, code) {
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    if (!process.env.TWILIO_VERIFY_SERVICE_ID) {
      console.error('❌ Twilio Service - TWILIO_VERIFY_SERVICE_ID is not set.');
      throw new Error('Twilio Verify Service ID is not configured.');
    }
    if (!code || code.trim() === '') {
      console.error('❌ Twilio Service - Verification code is empty or missing.');
      throw new Error('Verification code cannot be empty.');
    }

    try {
      console.log('📱 Twilio Service - Checking verification code:', {
        to: formattedNumber,
        code: '****' + code.slice(-2), // Log last 2 digits for debugging
        serviceId: process.env.TWILIO_VERIFY_SERVICE_ID
      });
      const verificationCheck = await this.client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_ID)
        .verificationChecks.create({ to: formattedNumber, code });

      console.log('✅ Twilio Service - Verification check completed:', {
        sid: verificationCheck.sid,
        status: verificationCheck.status,
        to: formattedNumber
      });
      return verificationCheck;
    } catch (error) {
      console.error('❌ Twilio Service - Error checking verification code:', {
        error: error.message,
        code: error.code,
        status: error.status,
        to: formattedNumber
      });
      // It's common for Twilio to return a 404 if the code is wrong but the request is valid
      // We might want to normalize this error for the frontend, but for now, just throw
      throw error;
    }
  }
}

export const twilioService = new TwilioService();
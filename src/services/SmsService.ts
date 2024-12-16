import Keys from "@/utils/constants/keys";
import axios from "axios";

export default class SmsService {
  static async sendSms(phoneNumber: string, message: string) {
    try {
      // Remove any non-digit characters
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      
      // Remove leading 250 if present
      if (formattedPhone.startsWith('250')) {
        formattedPhone = formattedPhone.substring(3);
      }
      
      // Validate phone format (must be 9 digits starting with 7)
      const phoneRegex = /^7[2-9]\d{7}$/;
      if (!phoneRegex.test(formattedPhone)) {
        throw new Error("Invalid phone number format. Must be a valid Rwanda phone number.");
      }

      // Add 250 prefix for the API
      const fullPhoneNumber = `250${formattedPhone}`;

      console.log('Sending SMS to:', fullPhoneNumber);
      console.log('Message:', message);

      if (!Keys.SMS_API_URL || !Keys.SMS_USERNAME || !Keys.SMS_PASSWORD) {
        throw new Error('SMS service configuration is incomplete');
      }

      const response = await axios.get(
        `${Keys.SMS_API_URL}?sender=${Keys.SMS_USERNAME}&phoneno=${fullPhoneNumber}&text=${encodeURIComponent(message)}&password=${Keys.SMS_PASSWORD}`,
        { timeout: 10000 } // 10 second timeout
      );

      if (response.status !== 200) {
        throw new Error(`SMS API returned status ${response.status}`);
      }

      console.log('SMS sent successfully');
      return response.data;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  static async sendSmsToAll(phoneNumbers: string[], message: string) {
    if (!phoneNumbers?.length) {
      console.log('No phone numbers provided for bulk SMS');
      return;
    }

    const results = await Promise.allSettled(
      phoneNumbers.map(async (phoneNumber) => {
        try {
          return await this.sendSms(phoneNumber, message);
        } catch (error) {
          console.error(`Failed to send SMS to ${phoneNumber}:`, error);
          return error;
        }
      })
    );

    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error(`Failed to send ${failures.length} out of ${phoneNumbers.length} messages`);
    }

    return results;
  }
}

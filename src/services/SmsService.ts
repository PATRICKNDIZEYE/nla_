import Keys from "@/utils/constants/keys";
import axios from "axios";

export default class SmsService {
  static sendSms(phoneNumber: string, message: string) {
    return axios.get(
      `${Keys.SMS_API_URL}?sender=${Keys.SMS_USERNAME}&phoneno=250${phoneNumber}&text=${message}&password=${Keys.SMS_PASSWORD}`
    );
  }

  static sendSmsToAll(phoneNumbers: string[], message: string) {
    phoneNumbers?.forEach((phoneNumber) => {
      this.sendSms(phoneNumber, message);
    });
  }
}

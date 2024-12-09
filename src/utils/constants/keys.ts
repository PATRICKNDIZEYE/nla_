const Keys = {
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  NIDA_API_URL: process.env.NIDA_API_URL,
  NLA_API_URL: process.env.NLA_API_URL,
  SMS_API_URL: process.env.SMS_API_URL,
  SMS_USERNAME: process.env.SMS_USERNAME,
  SMS_PASSWORD: process.env.SMS_PASSWORD,
  REDIRECT_TO:
    process.env.NEXT_PUBLIC_REDIRECT_TO || "skdlkss89292YuiwesiodUiod",
  USER_INFO:
    process.env.NEXT_PUBLIC_USER_INFO || "839389kdlskioi&223(982SKlksd",
  REACT_APP_ACCESS_TOKEN:
    process.env.NEXT_PUBLIC_APP_ACCESS_TOKEN ||
    "2389KLLklioie23893&283928Klksd",
  MONGODB_URI: process.env.MONGODB_URI,
  EXPIRES_IN: process.env.EXPIRES_IN,
  JWT_SECRET: process.env.JWT_SECRET || "klowi(8932jsdkjuiwsd",
  SESSION_PASSWORD:
    process.env.SESSION_PASSWORD || "NaYbyoViQyb8idPxKhL9oK72jkBh6oT5",
  NODE_ENV: process.env.NODE_ENV || "development",
  USER_ID: process.env.USER_ID || "oilksll9328Ydsklksd",
  LANG_KEY: process.env.LANG_KEY || "PWEOU2378",

  TRANSPORTER_SERVICE: process.env.TRANSPORTER_SERVICE,
  SERVICE_USERNAME: process.env.SERVICE_USERNAME,
  SERVICE_PASSWORD: process.env.SERVICE_PASSWORD,
  SERVICE_PORT: process.env.SERVICE_PORT,

  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,

  DISTRICT_OVERDUE_DAYS: Number(process.env.NEXT_PUBLIC_DISTRICT_OVERDUE_DAYS) || 30,
  NLA_OVERDUE_DAYS: Number(process.env.NEXT_PUBLIC_NLA_OVERDUE_DAYS) || 45,
};

export default Keys;

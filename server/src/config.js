import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";

loadEnv({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const jwtSecret = process.env.JWT_SECRET || "";

if (jwtSecret.length < 32 || jwtSecret.startsWith("replace-with-")) {
  throw new Error("JWT_SECRET must be configured with at least 32 random characters.");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be configured before starting the API.");
}

export const config = {
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  cashCollectionWebhookSecret: process.env.CASH_COLLECTION_WEBHOOK_SECRET || "",
  deliveryWebhookSecret: process.env.DELIVERY_WEBHOOK_SECRET || "",
  emailFrom: process.env.EMAIL_FROM?.trim() || "",
  openCageApiKey: process.env.OPENCAGE_API_KEY || "",
  resendApiKey: process.env.RESEND_API_KEY?.trim() || "",
  jwtSecret,
  mongoUri: process.env.MONGODB_URI,
  port: Number(process.env.PORT || 4000),
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
  twilioVerifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID || "",
};

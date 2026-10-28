import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import { authenticate } from "../middleware/authenticate.js";
import User from "../models/User.js";
import { passwordSchema } from "../utils/passwordValidation.js";
import {
  createEmailVerificationSender,
  EmailDeliveryError,
  EmailProviderNotConfiguredError,
} from "../services/emailVerification.js";

const router = Router();
const emailSchema = z.string().email().max(254).transform((email) => email.toLowerCase().trim());
const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
const phoneSchema = z.string().transform((value) => value.replace(/[\s()-]/g, "")).transform((value) => {
  const normalized = value.startsWith("+91") ? value.slice(3) : value.startsWith("91") && value.length === 12 ? value.slice(2) : value;
  return normalized;
}).refine((value) => /^[6-9][0-9]{9}$/.test(value), "Enter a valid Indian mobile number.");
const otpCooldownMs = 60_000;
const otpExpiryMs = 10 * 60_000;
const sendEmailVerificationCode = createEmailVerificationSender({
  apiKey: config.resendApiKey,
  from: config.emailFrom,
});

function createToken(userId) {
  return jwt.sign({ sub: userId.toString() }, config.jwtSecret, {
    expiresIn: "15m",
    issuer: "legends-store-api",
    audience: "legends-store-client",
  });
}

function accountPayload(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt || null,
    fullName: user.fullName,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    phoneVerifiedAt: user.phoneVerifiedAt || null,
    addresses: user.addresses || [],
  };
}

router.post("/register", async (request, response, next) => {
  try {
    const schema = credentialsSchema.extend({
      fullName: z.string().trim().min(2).max(100),
      phone: phoneSchema,
    });
    const input = schema.parse(request.body);
    if (await User.exists({ $or: [{ email: input.email }, { phone: input.phone }] })) {
      return response.status(409).json({ error: "An account with this email or phone number already exists." });
    }
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await User.create({
      email: input.email,
      emailVerified: false,
      emailVerifiedAt: null,
      fullName: input.fullName,
      phone: input.phone,
      phoneVerified: false,
      phoneVerifiedAt: null,
      passwordHash,
    });
    return response.status(201).json({
      token: createToken(user._id),
      user: accountPayload(user),
      message: "Account created. Verify your email and phone before placing an order.",
      expiresIn: 900,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return response.status(409).json({ error: "An account with this email or phone number already exists." });
    }
    return next(error);
  }
});

router.post("/login", async (request, response, next) => {
  try {
    const { email, password } = credentialsSchema.parse(request.body);
    const user = await User.findOne({ email }).select("+passwordHash");
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !passwordMatches) {
      return response.status(401).json({ error: "Email or password is incorrect." });
    }
    return response.json({ token: createToken(user._id), user: accountPayload(user), expiresIn: 900 });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authenticate, async (request, response, next) => {
  try {
    const user = await User.findById(request.user._id);
    return response.json({ user: accountPayload(user) });
  } catch (error) {
    return next(error);
  }
});

router.patch("/me", authenticate, async (request, response, next) => {
  try {
    const input = z.object({
      fullName: z.string().trim().min(2).max(100),
      email: emailSchema,
      phone: phoneSchema,
    }).strict().parse(request.body);
    const user = await User.findById(request.user._id);
    if (input.email !== user.email) {
      if (await User.exists({ email: input.email, _id: { $ne: user._id } })) {
        return response.status(409).json({ error: "That email is already in use." });
      }
      user.email = input.email;
      user.emailVerified = false;
      user.emailVerifiedAt = null;
      user.emailOtpHash = undefined;
      user.emailOtpExpiresAt = undefined;
      user.emailOtpAttempts = 0;
    }
    if (input.phone !== user.phone) {
      if (await User.exists({ phone: input.phone, _id: { $ne: user._id } })) {
        return response.status(409).json({ error: "That phone number is already in use." });
      }
      user.phone = input.phone;
      user.phoneVerified = false;
      user.phoneVerifiedAt = null;
      user.phoneOtpRequestedAt = undefined;
      user.phoneOtpAttempts = 0;
    }
    user.fullName = input.fullName;
    await user.save();
    return response.json({ user: accountPayload(user) });
  } catch (error) {
    return next(error);
  }
});

router.post("/phone/request-otp", authenticate, async (request, response, next) => {
  try {
    if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioVerifyServiceSid) {
      return response.status(503).json({
        error: "Phone verification is unavailable: configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.",
      });
    }
    const input = z.object({ phone: phoneSchema }).parse(request.body);
    const user = await User.findById(request.user._id).select("+phoneOtpRequestedAt +phoneOtpAttempts");
    if (await User.exists({ phone: input.phone, _id: { $ne: user._id } })) {
      return response.status(409).json({ error: "That phone number is already in use." });
    }
    if (user.phone !== input.phone) {
      user.phone = input.phone;
      user.phoneVerified = false;
      user.phoneVerifiedAt = null;
      user.phoneOtpRequestedAt = undefined;
      user.phoneOtpAttempts = 0;
    }
    if (user.phoneVerified) return response.json({ message: "Phone number is already verified." });
    if (user.phoneOtpRequestedAt && Date.now() - user.phoneOtpRequestedAt.getTime() < otpCooldownMs) {
      return response.status(429).json({ error: "Wait 60 seconds before requesting another phone code." });
    }
    const credentials = Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString("base64");
    const body = new URLSearchParams({ To: `+91${user.phone}`, Channel: "sms" });
    let result;
    try {
      result = await fetch(
        `https://verify.twilio.com/v2/Services/${config.twilioVerifyServiceSid}/Verifications`,
        {
          method: "POST",
          headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
          body,
          signal: AbortSignal.timeout(10_000),
        },
      );
    } catch {
      return response.status(502).json({ error: "The SMS provider could not start verification." });
    }
    if (!result.ok) {
      console.error("Twilio verification request failed:", result.status);
      return response.status(502).json({ error: "The SMS provider could not start verification." });
    }
    user.phoneOtpRequestedAt = new Date();
    user.phoneOtpAttempts = 0;
    await user.save();
    return response.json({ message: "Phone verification request accepted by the SMS provider." });
  } catch (error) {
    return next(error);
  }
});

router.post("/phone/verify-otp", authenticate, async (request, response, next) => {
  try {
    if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioVerifyServiceSid) {
      return response.status(503).json({
        error: "Phone verification is unavailable: configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID.",
      });
    }
    const { code } = z.object({ code: z.string().regex(/^[0-9]{4,10}$/) }).parse(request.body);
    const user = await User.findById(request.user._id).select("+phoneOtpRequestedAt +phoneOtpAttempts");
    if (user.phoneVerified) {
      return response.json({ user: accountPayload(user), message: "Phone number is already verified." });
    }
    if (!user.phoneOtpRequestedAt || Date.now() - user.phoneOtpRequestedAt.getTime() >= otpExpiryMs) {
      return response.status(410).json({ error: "Phone verification code expired. Request a new one." });
    }
    if (user.phoneOtpAttempts >= 5) {
      return response.status(429).json({ error: "Too many incorrect codes. Request a new code later." });
    }
    const credentials = Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString("base64");
    const body = new URLSearchParams({ To: `+91${user.phone}`, Code: code });
    let result;
    let verification;
    try {
      result = await fetch(
        `https://verify.twilio.com/v2/Services/${config.twilioVerifyServiceSid}/VerificationCheck`,
        {
          method: "POST",
          headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
          body,
          signal: AbortSignal.timeout(10_000),
        },
      );
      verification = await result.json();
    } catch {
      return response.status(502).json({ error: "The SMS provider could not verify the code." });
    }
    if (!result.ok) {
      console.error("Twilio verification check failed:", result.status);
      return response.status(502).json({ error: "The SMS provider could not verify the code." });
    }
    if (verification.status !== "approved") {
      user.phoneOtpAttempts += 1;
      await user.save();
      return response.status(400).json({ error: "The phone verification code is incorrect or expired." });
    }
    user.phoneVerified = true;
    user.phoneVerifiedAt = new Date();
    user.phoneOtpRequestedAt = undefined;
    user.phoneOtpAttempts = 0;
    await user.save();
    return response.json({ user: accountPayload(user), message: "Phone number verified." });
  } catch (error) {
    return next(error);
  }
});

router.post("/email/request-verification", authenticate, async (request, response, next) => {
  try {
    if (!config.resendApiKey?.trim() || !config.emailFrom?.trim()) {
      return response.status(503).json({ error: "Email verification is unavailable: configure RESEND_API_KEY and EMAIL_FROM." });
    }
    const user = await User.findById(request.user._id).select(
      "+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts +emailOtpRequestedAt",
    );
    if (user.emailVerified) return response.json({ message: "Email is already verified." });
    if (user.emailOtpRequestedAt && Date.now() - user.emailOtpRequestedAt.getTime() < otpCooldownMs) {
      return response.status(429).json({ error: "Wait 60 seconds before requesting another email code." });
    }
    const code = String(randomInt(100000, 1000000));
    try {
      await sendEmailVerificationCode(user.email, code);
    } catch (error) {
      if (error instanceof EmailProviderNotConfiguredError) {
        return response.status(503).json({ error: error.message });
      }
      if (error instanceof EmailDeliveryError) {
        return response.status(502).json({ error: error.message });
      }
      throw error;
    }
    user.emailOtpHash = createHash("sha256").update(code).digest("hex");
    user.emailOtpExpiresAt = new Date(Date.now() + otpExpiryMs);
    user.emailOtpAttempts = 0;
    user.emailOtpRequestedAt = new Date();
    await user.save();
    return response.json({ message: "Email verification code sent." });
  } catch (error) {
    return next(error);
  }
});

router.post("/email/verify", authenticate, async (request, response, next) => {
  try {
    const { code } = z.object({ code: z.string().regex(/^[0-9]{6}$/) }).parse(request.body);
    const user = await User.findById(request.user._id).select(
      "+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts +emailOtpRequestedAt",
    );
    if (user.emailVerified) {
      return response.json({ user: accountPayload(user), message: "Email address is already verified." });
    }
    if (!user.emailOtpHash || !user.emailOtpExpiresAt || user.emailOtpExpiresAt.getTime() <= Date.now()) {
      return response.status(410).json({ error: "Email verification code expired. Request a new one." });
    }
    if (user.emailOtpAttempts >= 5) {
      return response.status(429).json({ error: "Too many incorrect codes. Request a new code later." });
    }
    const supplied = Buffer.from(createHash("sha256").update(code).digest("hex"), "hex");
    const expected = Buffer.from(user.emailOtpHash, "hex");
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      user.emailOtpAttempts += 1;
      await user.save();
      return response.status(400).json({ error: "Email verification code is incorrect." });
    }
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailOtpHash = undefined;
    user.emailOtpExpiresAt = undefined;
    user.emailOtpAttempts = 0;
    user.emailOtpRequestedAt = undefined;
    await user.save();
    return response.json({ user: accountPayload(user), message: "Email address verified." });
  } catch (error) {
    return next(error);
  }
});

export default router;

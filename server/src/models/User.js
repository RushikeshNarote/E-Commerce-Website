import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, enum: ["Home", "Work", "Other"], required: true },
    recipientName: { type: String, trim: true, required: true, maxlength: 100 },
    phone: { type: String, required: true, match: /^[6-9][0-9]{9}$/ },
    houseFlat: { type: String, trim: true, required: true, maxlength: 100 },
    street: { type: String, trim: true, required: true, maxlength: 160 },
    locality: { type: String, trim: true, required: true, maxlength: 120 },
    landmark: { type: String, trim: true, default: "", maxlength: 120 },
    city: { type: String, trim: true, required: true, maxlength: 80 },
    state: { type: String, trim: true, required: true, maxlength: 80 },
    postalCode: { type: String, required: true, match: /^[1-9][0-9]{5}$/ },
    latitude: { type: Number, min: -90, max: 90, default: null },
    longitude: { type: Number, min: -180, max: 180, default: null },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      maxlength: 254,
    },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    emailOtpHash: { type: String, select: false },
    emailOtpExpiresAt: { type: Date, select: false },
    emailOtpAttempts: { type: Number, default: 0, select: false },
    emailOtpRequestedAt: { type: Date, select: false },
    fullName: { type: String, trim: true, default: "", maxlength: 100 },
    phone: { type: String, default: "", match: /^$|^[6-9][0-9]{9}$/ },
    phoneVerified: { type: Boolean, default: false },
    phoneVerifiedAt: { type: Date, default: null },
    phoneOtpRequestedAt: { type: Date, select: false },
    phoneOtpAttempts: { type: Number, default: 0, select: false },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);

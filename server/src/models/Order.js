import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productSlug: { type: String, required: true },
    productName: { type: String, required: true },
    unitPriceInr: { type: Number, required: true, min: 1 },
    size: { type: Number, required: true, min: 1, max: 16 },
    quantity: { type: Number, required: true, min: 1, max: 10 },
  },
  { timestamps: true },
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [orderItemSchema], required: true, validate: (items) => items.length > 0 },
    shippingAddress: {
      label: { type: String, enum: ["Home", "Work", "Other"], required: true },
      recipientName: { type: String, required: true, maxlength: 100 },
      phone: { type: String, required: true, match: /^[6-9][0-9]{9}$/ },
      houseFlat: { type: String, required: true, maxlength: 100 },
      street: { type: String, required: true, maxlength: 160 },
      locality: { type: String, required: true, maxlength: 120 },
      landmark: { type: String, default: "", maxlength: 120 },
      address: { type: String, required: true, maxlength: 500 },
      city: { type: String, required: true, maxlength: 80 },
      state: { type: String, required: true, maxlength: 80 },
      postalCode: { type: String, required: true, match: /^[1-9][0-9]{5}$/ },
      latitude: { type: Number, min: -90, max: 90, default: null },
      longitude: { type: Number, min: -180, max: 180, default: null },
    },
    subtotalInr: { type: Number, required: true, min: 1 },
    codFeeInr: { type: Number, required: true, min: 0, default: 0 },
    onlineDiscountInr: { type: Number, required: true, min: 0, default: 0 },
    totalInr: { type: Number, required: true, min: 1 },
    paymentMethod: { type: String, enum: ["COD", "ONLINE"], required: true },
    orderStatus: {
      type: String,
      enum: ["pending_payment", "placed", "paid", "cancelled", "payment_failed"],
      default: "pending_payment",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    deliveryStatus: {
      type: String,
      enum: ["not_dispatched", "in_transit", "delivered"],
      default: "not_dispatched",
    },
    providerOrderId: { type: String, default: undefined },
    providerPaymentId: { type: String, default: null },
    idempotencyKey: { type: String, default: undefined },
    cashCollectedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true },
);

orderSchema.index(
  { providerOrderId: 1 },
  { unique: true, partialFilterExpression: { providerOrderId: { $type: "string" } } },
);
orderSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } },
);

export default mongoose.model("Order", orderSchema);

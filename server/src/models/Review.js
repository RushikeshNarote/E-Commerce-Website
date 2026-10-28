import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    orderItemId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    text: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    verifiedPurchase: { type: Boolean, required: true, default: true, immutable: true },
    isDemo: { type: Boolean, required: true, default: false, immutable: true },
  },
  { timestamps: true },
);

reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, orderItemId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);

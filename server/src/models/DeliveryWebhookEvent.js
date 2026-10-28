import mongoose from "mongoose";

const deliveryWebhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  },
  { timestamps: true },
);

export default mongoose.model("DeliveryWebhookEvent", deliveryWebhookEventSchema);

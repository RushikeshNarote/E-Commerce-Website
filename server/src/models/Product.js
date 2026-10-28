import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    number: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    colorway: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    demoPriceInr: { type: Number, required: true, min: 1 },
    availableSizes: [{ type: Number, min: 1, max: 16 }],
    unavailableSizes: [{ type: Number, min: 1, max: 16 }],
    accent: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ active: 1, slug: 1 });

export default mongoose.model("Product", productSchema);

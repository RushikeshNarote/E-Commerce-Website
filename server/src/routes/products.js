import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const products = await Product.find({ active: true })
      .select("-__v")
      .sort({ number: 1 })
      .lean();
    return response.json({ products, pricingNote: "demoPriceInr values are development placeholders." });
  } catch (error) {
    return next(error);
  }
});

router.get("/:slug", async (request, response, next) => {
  try {
    const product = await Product.findOne({
      active: true,
      slug: request.params.slug.toLowerCase(),
    })
      .select("-__v")
      .lean();

    if (!product) return response.status(404).json({ error: "Product not found." });
    return response.json({ product, pricingNote: "demoPriceInr is a development placeholder." });
  } catch (error) {
    return next(error);
  }
});

export default router;

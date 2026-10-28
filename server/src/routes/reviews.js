import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

const router = Router();
const reviewSchema = z.object({
  orderId: z.string().refine(mongoose.isValidObjectId, "A valid order ID is required."),
  orderItemId: z.string().refine(mongoose.isValidObjectId, "A valid order item ID is required."),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(100),
  text: z.string().trim().min(10).max(2000),
});

router.get("/:slug/reviews", async (request, response, next) => {
  try {
    const product = await Product.findOne({
      slug: request.params.slug.toLowerCase(),
      active: true,
    }).select("_id");
    if (!product) return response.status(404).json({ error: "Product not found." });

    const summary = await Review.aggregate([
      { $match: { productId: product._id } },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
          total: { $sum: 1 },
          distribution: { $push: "$rating" },
        },
      },
    ]);
    const reviews = await Review.find({ productId: product._id })
      .select("rating title text verifiedPurchase createdAt userId")
      .populate({ path: "userId", select: "email" })
      .sort({ createdAt: -1 })
      .lean();
    const counts = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((review) => review.rating === rating).length,
    }));

    return response.json({
      summary: {
        average: summary[0]?.average || 0,
        total: summary[0]?.total || 0,
        counts,
      },
      reviews: reviews.map((review) => ({
        id: review._id,
        rating: review.rating,
        title: review.title,
        text: review.text,
        verifiedPurchase: review.verifiedPurchase,
        isDemo: false,
        reviewer: review.userId?.email ? "LEGENDS customer" : "Customer",
        date: review.createdAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:slug/reviews", authenticate, async (request, response, next) => {
  try {
    const input = reviewSchema.parse(request.body);
    const product = await Product.findOne({
      slug: request.params.slug.toLowerCase(),
      active: true,
    });
    if (!product) return response.status(404).json({ error: "Product not found." });

    const order = await Order.findOne({
      _id: input.orderId,
      userId: request.user._id,
    });
    if (!order) {
      return response.status(404).json({
        error: "No order belonging to this signed-in account matches the supplied order.",
      });
    }
    if (order.paymentStatus !== "paid") {
      return response.status(403).json({
        error: "A review can be submitted only after server-confirmed successful payment.",
      });
    }
    if (order.deliveryStatus !== "delivered") {
      return response.status(403).json({
        error: "A review can be submitted only after the order-management system confirms delivery.",
      });
    }

    const item = order.items.id(input.orderItemId);
    if (!item || !item.productId.equals(product._id)) {
      return response.status(403).json({
        error: "This delivered order does not contain the product being reviewed.",
      });
    }
    if (await Review.exists({ orderItemId: item._id })) {
      return response.status(409).json({
        error: "A review has already been submitted for this purchased item.",
      });
    }

    const review = await Review.create({
      productId: product._id,
      userId: request.user._id,
      orderId: order._id,
      orderItemId: item._id,
      rating: input.rating,
      title: input.title,
      text: input.text,
      verifiedPurchase: true,
      isDemo: false,
    });

    return response.status(201).json({
      review: {
        id: review._id,
        rating: review.rating,
        title: review.title,
        text: review.text,
        verifiedPurchase: true,
        isDemo: false,
        date: review.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

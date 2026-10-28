import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { z } from "zod";
import { config } from "../config.js";
import { authenticate } from "../middleware/authenticate.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { calculateOrderPricing } from "../utils/orderPricing.js";

const router = Router();
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1).max(80),
    size: z.number().int().min(1).max(16),
    quantity: z.number().int().min(1).max(10),
  }).strict()).min(1).max(20),
  paymentMethod: z.enum(["COD", "ONLINE"]),
  quoteToken: z.string().min(1),
  addressId: z.string().refine(mongoose.isValidObjectId, "A valid saved address is required.").optional(),
  shippingAddress: z.object({
    label: z.enum(["Home", "Work", "Other"]),
    recipientName: z.string().trim().min(2).max(100),
    phone: z.string().regex(/^[6-9][0-9]{9}$/),
    houseFlat: z.string().trim().min(1).max(100),
    street: z.string().trim().min(2).max(160),
    locality: z.string().trim().min(2).max(120),
    landmark: z.string().trim().max(120).optional().default(""),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    postalCode: z.string().regex(/^[1-9][0-9]{5}$/),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
  }).strict().optional(),
}).strict();

function orderResponse(order) {
  return {
    id: order._id.toString(),
    status: order.orderStatus,
    paymentStatus: order.paymentStatus,
    deliveryStatus: order.deliveryStatus,
    paymentMethod: order.paymentMethod,
    items: order.items,
    shippingAddress: order.shippingAddress,
    subtotalInr: order.subtotalInr,
    codFeeInr: order.codFeeInr,
    onlineDiscountInr: order.onlineDiscountInr,
    totalInr: order.totalInr,
    createdAt: order.createdAt,
  };
}

router.use(authenticate);

router.post("/quote", async (request, response, next) => {
  try {
    const user = await User.findById(request.user._id);
    if (!user.phoneVerified || !user.emailVerified) {
      return response.status(403).json({ error: "Verify both your phone number and email address to view a checkout quote." });
    }
    const input = z.object({
      items: z.array(z.object({
        productId: z.string().min(1).max(80),
        size: z.number().int().min(1).max(16),
        quantity: z.number().int().min(1).max(10),
      }).strict()).min(1).max(20),
      paymentMethod: z.enum(["COD", "ONLINE"]),
    }).strict().parse(request.body);
    let subtotalInr = 0;
    const pricedItems = [];
    for (const requested of input.items) {
      const product = await Product.findOne({ slug: requested.productId, active: true });
      if (!product) return response.status(404).json({ error: `Product "${requested.productId}" is unavailable.` });
      if (!product.availableSizes.includes(requested.size) || product.unavailableSizes.includes(requested.size)) {
        return response.status(409).json({ error: `UK size ${requested.size} is unavailable for ${product.name}.` });
      }
      subtotalInr += product.demoPriceInr * requested.quantity;
      if (!Number.isSafeInteger(subtotalInr)) {
        return response.status(400).json({ error: "Order subtotal is outside the supported range." });
      }
      pricedItems.push({
        productId: product._id.toString(),
        productSlug: product.slug,
        productName: product.name,
        unitPriceInr: product.demoPriceInr,
        size: requested.size,
        quantity: requested.quantity,
      });
    }
    const pricing = calculateOrderPricing(subtotalInr, input.paymentMethod);
    const itemsDigest = createHash("sha256").update(JSON.stringify(input.items)).digest("hex");
    const quoteToken = jwt.sign({
      itemsDigest,
      paymentMethod: input.paymentMethod,
      subtotalInr,
      ...pricing,
    }, config.jwtSecret, {
      expiresIn: "5m",
      issuer: "legends-store-api",
      audience: "legends-checkout-quote",
      subject: user._id.toString(),
    });
    return response.json({
      quoteToken,
      paymentMethod: input.paymentMethod,
      items: pricedItems,
      subtotalInr,
      ...pricing,
      expiresIn: 300,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const user = await User.findById(request.user._id);
    if (!user.phoneVerified || !user.emailVerified) {
      return response.status(403).json({
        error: "Verify both your phone number and email address before placing an order.",
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
      });
    }

    const idempotencyKey = request.get("idempotency-key");
    if (!idempotencyKey || !/^[a-zA-Z0-9._:-]{8,128}$/.test(idempotencyKey)) {
      return response.status(400).json({ error: "A valid Idempotency-Key header is required." });
    }
    const priorOrder = await Order.findOne({ userId: user._id, idempotencyKey });
    if (priorOrder) return response.status(200).json({ order: orderResponse(priorOrder), reused: true });

    const input = createOrderSchema.parse(request.body);
    let quote;
    try {
      quote = jwt.verify(input.quoteToken, config.jwtSecret, {
        issuer: "legends-store-api",
        audience: "legends-checkout-quote",
      });
    } catch {
      return response.status(409).json({ error: "Checkout price confirmation expired. Refresh the quote and review the total." });
    }
    const digest = createHash("sha256").update(JSON.stringify(input.items)).digest("hex");
    if (
      typeof quote !== "object" ||
      quote.sub !== user._id.toString() ||
      quote.itemsDigest !== digest ||
      quote.paymentMethod !== input.paymentMethod
    ) {
      return response.status(409).json({ error: "Checkout quote does not match your account, items, or payment method. Refresh the quote." });
    }
    if (Boolean(input.addressId) === Boolean(input.shippingAddress)) {
      return response.status(400).json({ error: "Select one saved address or provide a new shipping address." });
    }
    const savedAddress = input.addressId ? user.addresses.id(input.addressId) : null;
    if (input.addressId && !savedAddress) {
      return response.status(404).json({ error: "The selected saved address was not found." });
    }
    const address = savedAddress || input.shippingAddress;

    const orderItems = [];
    let subtotalInr = 0;
    for (const requested of input.items) {
      const product = await Product.findOne({ slug: requested.productId, active: true });
      if (!product) {
        return response.status(404).json({ error: `Product "${requested.productId}" is unavailable.` });
      }
      if (
        !product.availableSizes.includes(requested.size) ||
        product.unavailableSizes.includes(requested.size)
      ) {
        return response.status(409).json({
          error: `UK size ${requested.size} is unavailable for ${product.name}.`,
        });
      }
      subtotalInr += product.demoPriceInr * requested.quantity;
      if (!Number.isSafeInteger(subtotalInr)) {
        return response.status(400).json({ error: "Order subtotal is outside the supported range." });
      }
      orderItems.push({
        productId: product._id,
        productSlug: product.slug,
        productName: product.name,
        unitPriceInr: product.demoPriceInr,
        size: requested.size,
        quantity: requested.quantity,
      });
    }

    const pricing = calculateOrderPricing(subtotalInr, input.paymentMethod);
    if (
      quote.subtotalInr !== subtotalInr ||
      quote.codFeeInr !== pricing.codFeeInr ||
      quote.onlineDiscountInr !== pricing.onlineDiscountInr ||
      quote.totalInr !== pricing.totalInr
    ) {
      return response.status(409).json({ error: "Catalog pricing changed. Refresh the server quote and confirm the updated total." });
    }
    const addressSnapshot = {
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      houseFlat: address.houseFlat,
      street: address.street,
      locality: address.locality,
      landmark: address.landmark || "",
      address: [
        address.houseFlat,
        address.street,
        address.locality,
        address.landmark,
        address.city,
        address.state,
        address.postalCode,
      ].filter(Boolean).join(", "),
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      latitude: address.latitude ?? null,
      longitude: address.longitude ?? null,
    };

    const order = await Order.create({
      userId: user._id,
      items: orderItems,
      shippingAddress: addressSnapshot,
      subtotalInr,
      ...pricing,
      paymentMethod: input.paymentMethod,
      idempotencyKey,
      orderStatus: input.paymentMethod === "COD" ? "placed" : "pending_payment",
      paymentStatus: "pending",
      deliveryStatus: "not_dispatched",
    });

    return response.status(201).json({
      order: orderResponse(order),
      message: input.paymentMethod === "COD"
        ? "COD order placed. Payment remains pending until cash is collected."
        : "Online payment order created. Payment remains pending until confirmed.",
    });
  } catch (error) {
    if (error?.code === 11000) {
      const idempotencyKey = request.get("idempotency-key");
      const order = await Order.findOne({ userId: request.user._id, idempotencyKey });
      if (order) return response.status(200).json({ order: orderResponse(order), reused: true });
    }
    return next(error);
  }
});

router.post("/:orderId/payment", async (request, response, next) => {
  let reservation;
  try {
    if (!config.razorpayKeyId || !config.razorpayKeySecret || !config.razorpayWebhookSecret) {
      return response.status(503).json({
        error: "Online payment is unavailable: Razorpay credentials and webhook configuration are required.",
      });
    }
    if (!mongoose.isValidObjectId(request.params.orderId)) {
      return response.status(404).json({ error: "Online order was not found." });
    }
    const existing = await Order.findOne({
      _id: request.params.orderId,
      userId: request.user._id,
      paymentMethod: "ONLINE",
    });
    if (!existing) return response.status(404).json({ error: "Online order was not found." });
    if (existing.paymentStatus === "paid") {
      return response.status(409).json({ error: "This order is already paid." });
    }
    if (existing.paymentStatus === "failed") {
      existing.paymentStatus = "pending";
      existing.orderStatus = "pending_payment";
      await existing.save();
    }
    if (existing.providerOrderId) {
      if (existing.providerOrderId.startsWith("creating:")) {
        return response.status(409).json({ error: "Payment initialization is already in progress. Try again shortly." });
      }
      return response.json({
        providerOrderId: existing.providerOrderId,
        amount: existing.totalInr * 100,
        currency: "INR",
        keyId: config.razorpayKeyId,
      });
    }

    reservation = `creating:${randomUUID()}`;
    const order = await Order.findOneAndUpdate(
      {
        _id: existing._id,
        userId: request.user._id,
        paymentMethod: "ONLINE",
        paymentStatus: "pending",
        ...(existing.providerOrderId
          ? { providerOrderId: existing.providerOrderId }
          : { providerOrderId: { $in: [null] } }),
      },
      { $set: { providerOrderId: reservation } },
      { new: true },
    );
    if (!order) return response.status(409).json({ error: "Payment initialization is already in progress. Try again shortly." });

    const credentials = Buffer.from(
      `${config.razorpayKeyId}:${config.razorpayKeySecret}`,
    ).toString("base64");
    const providerResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        amount: order.totalInr * 100,
        currency: "INR",
        receipt: order._id.toString(),
      }),
    });
    const providerOrder = await providerResponse.json();
    if (
      !providerResponse.ok ||
      typeof providerOrder.id !== "string" ||
      providerOrder.amount !== order.totalInr * 100 ||
      providerOrder.currency !== "INR"
    ) {
      console.error("Razorpay order creation failed:", providerOrder.error?.code || providerResponse.status);
      await Order.updateOne(
        { _id: order._id, providerOrderId: reservation },
        { $unset: { providerOrderId: 1 } },
      );
      reservation = undefined;
      return response.status(502).json({ error: "The payment provider could not prepare online payment." });
    }

    const updated = await Order.findOneAndUpdate(
      { _id: order._id, providerOrderId: reservation },
      { $set: { providerOrderId: providerOrder.id } },
      { new: true },
    );
    if (!updated) return response.status(409).json({ error: "Payment reservation was lost; contact support before retrying." });
    reservation = undefined;
    return response.status(201).json({
      providerOrderId: providerOrder.id,
      amount: providerOrder.amount,
      currency: providerOrder.currency,
      keyId: config.razorpayKeyId,
      orderId: updated._id.toString(),
    });
  } catch (error) {
    if (reservation) {
      await Order.updateOne(
        { _id: request.params.orderId, userId: request.user._id, providerOrderId: reservation },
        { $unset: { providerOrderId: 1 } },
      );
    }
    return next(error);
  }
});

router.post("/:orderId/verify-payment", async (request, response, next) => {
  try {
    if (!config.razorpayKeyId || !config.razorpayKeySecret) {
      return response.status(503).json({ error: "Online payment verification is not configured." });
    }
    const input = z.object({
      razorpay_order_id: z.string().min(1),
      razorpay_payment_id: z.string().min(1),
      razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i),
    }).strict().parse(request.body);
    const order = await Order.findOne({
      _id: request.params.orderId,
      userId: request.user._id,
      paymentMethod: "ONLINE",
    });
    if (!order) return response.status(404).json({ error: "Online order was not found." });
    if (order.paymentStatus === "paid") return response.json({ order: orderResponse(order) });
    if (input.razorpay_order_id !== order.providerOrderId) {
      return response.status(400).json({ error: "Payment order does not match this order." });
    }
    const expected = createHmac("sha256", config.razorpayKeySecret)
      .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
      .digest();
    const supplied = Buffer.from(input.razorpay_signature, "hex");
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      return response.status(400).json({ error: "Payment signature is invalid." });
    }
    const authorization = Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString("base64");
    const providerResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(input.razorpay_payment_id)}`,
      { headers: { Authorization: `Basic ${authorization}` }, signal: AbortSignal.timeout(10_000) },
    );
    const payment = await providerResponse.json();
    if (
      !providerResponse.ok ||
      payment.order_id !== order.providerOrderId ||
      payment.amount !== order.totalInr * 100 ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return response.status(409).json({ error: "The provider has not confirmed a captured payment for this order yet." });
    }
    order.paymentStatus = "paid";
    order.orderStatus = "paid";
    order.providerPaymentId = payment.id;
    order.paidAt = new Date();
    await order.save();
    return response.json({ order: orderResponse(order), message: "Payment confirmed by the payment provider." });
  } catch (error) {
    return next(error);
  }
});

router.get("/mine", async (request, response, next) => {
  try {
    const orders = await Order.find({ userId: request.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return response.json({ orders });
  } catch (error) {
    return next(error);
  }
});

export default router;

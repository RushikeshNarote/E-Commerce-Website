import { createHash } from "node:crypto";
import express, { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import DeliveryWebhookEvent from "../models/DeliveryWebhookEvent.js";
import Order from "../models/Order.js";
import { verifyHmacSignature } from "../utils/webhookSignatures.js";

const router = Router();
const deliveryEventSchema = z.object({
  eventId: z.string().min(1).max(200),
  orderId: z.string().refine((value) => /^[a-f\d]{24}$/i.test(value)),
  deliveryStatus: z.enum(["in_transit", "delivered"]),
});
const cashCollectionSchema = z.object({
  eventId: z.string().min(1).max(200),
  orderId: z.string().refine((value) => /^[a-f\d]{24}$/i.test(value)),
  amountInr: z.number().int().positive(),
});

function parseJson(rawBody) {
  try {
    return JSON.parse(rawBody.toString("utf8"));
  } catch {
    return null;
  }
}

router.post(
  "/razorpay",
  (request, response, next) => {
    if (!config.razorpayWebhookSecret) {
      return response.status(503).json({ error: "Razorpay webhook verification is not configured." });
    }
    return next();
  },
  express.raw({ type: "application/json", limit: "100kb" }),
  async (request, response, next) => {
    try {
      const signature = request.get("x-razorpay-signature");
      if (!verifyHmacSignature(request.body, signature, config.razorpayWebhookSecret)) {
        return response.status(401).json({ error: "Webhook signature is invalid." });
      }

      const event = parseJson(request.body);
      if (!event || !["payment.captured", "payment.failed"].includes(event.event)) {
        return response.status(400).json({ error: "Unsupported or malformed payment event." });
      }
      const eventHeader = request.get("x-razorpay-event-id");
      if (!eventHeader || eventHeader.length > 200) {
        return response.status(400).json({ error: "A valid Razorpay event ID is required." });
      }

      const payment = event.payload?.payment?.entity;
      const providerOrderId = payment?.order_id;
      if (typeof providerOrderId !== "string" || typeof payment?.id !== "string") {
        return response.status(400).json({ error: "The payment event has no valid order or payment ID." });
      }

      const order = await Order.findOne({ providerOrderId });
      if (!order) return response.status(404).json({ error: "The payment order was not found." });
      if (order.paymentMethod !== "ONLINE") {
        return response.status(409).json({ error: "Online payment events cannot settle a COD order." });
      }

      if (event.event === "payment.failed") {
        if (order.paymentStatus === "pending") {
          order.paymentStatus = "failed";
          order.orderStatus = "payment_failed";
          await order.save();
        }
      } else {
        if (payment.status !== "captured") {
          return response.status(400).json({ error: "Payment is not in a confirmable state." });
        }
        if (
          payment.amount !== order.totalInr * 100 ||
          payment.currency !== "INR"
        ) {
          return response.status(400).json({ error: "Payment amount does not match the stored order." });
        }
        if (order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.orderStatus = "paid";
          order.providerPaymentId = payment.id;
          order.paidAt = new Date();
          await order.save();
        }
      }

      await DeliveryWebhookEvent.create({
        eventId: `razorpay:${eventHeader}`,
        orderId: order._id,
      }).catch((error) => {
        if (error?.code !== 11000) throw error;
      });

      return response.json({ received: true });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/delivery",
  (request, response, next) => {
    if (!config.deliveryWebhookSecret) {
      return response.status(503).json({ error: "Delivery webhook verification is not configured." });
    }
    return next();
  },
  express.raw({ type: "application/json", limit: "20kb" }),
  async (request, response, next) => {
    try {
      const signature = request.get("x-legends-signature");
      if (!verifyHmacSignature(request.body, signature, config.deliveryWebhookSecret)) {
        return response.status(401).json({ error: "Webhook signature is invalid." });
      }

      const parsed = parseJson(request.body);
      const result = deliveryEventSchema.safeParse(parsed);
      if (!result.success) {
        return response.status(400).json({
          error: "Delivery event validation failed.",
          details: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      const { eventId, orderId, deliveryStatus } = result.data;
      const eventKey = `delivery:${createHash("sha256").update(eventId).digest("hex")}`;
      const order = await Order.findById(orderId);
      if (!order) return response.status(404).json({ error: "The delivery order was not found." });
      if (order.paymentStatus !== "paid") {
        if (order.paymentMethod !== "COD") {
          return response.status(409).json({ error: "Online delivery cannot be confirmed before payment." });
        }
      }
      if (order.paymentMethod === "ONLINE" && order.paymentStatus !== "paid") {
        return response.status(409).json({ error: "Delivery status cannot change before payment is confirmed." });
      }
      if (order.deliveryStatus === "delivered" && deliveryStatus !== "delivered") {
        return response.status(409).json({ error: "A delivered order cannot move back to in-transit." });
      }

      await DeliveryWebhookEvent.create({ eventId: eventKey, orderId: order._id }).catch((error) => {
        if (error?.code !== 11000) throw error;
      });

      if (deliveryStatus === "delivered" && order.deliveryStatus !== "delivered") {
        order.deliveryStatus = "delivered";
        order.deliveredAt = new Date();
        await order.save();
      } else if (deliveryStatus === "in_transit" && order.deliveryStatus === "not_dispatched") {
        order.deliveryStatus = "in_transit";
        await order.save();
      }

      return response.json({ received: true, deliveryStatus: order.deliveryStatus });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/cash-collection",
  (request, response, next) => {
    if (!config.cashCollectionWebhookSecret) {
      return response.status(503).json({ error: "Trusted COD collection confirmation is not configured." });
    }
    return next();
  },
  express.raw({ type: "application/json", limit: "20kb" }),
  async (request, response, next) => {
    try {
      if (!verifyHmacSignature(
        request.body,
        request.get("x-legends-signature"),
        config.cashCollectionWebhookSecret,
      )) {
        return response.status(401).json({ error: "Cash-collection signature is invalid." });
      }
      const parsed = cashCollectionSchema.safeParse(parseJson(request.body));
      if (!parsed.success) {
        return response.status(400).json({ error: "Cash-collection event is invalid." });
      }
      const { eventId, orderId, amountInr } = parsed.data;
      const order = await Order.findById(orderId);
      if (!order) return response.status(404).json({ error: "COD order was not found." });
      if (order.paymentMethod !== "COD") {
        return response.status(409).json({ error: "Cash collection is only valid for COD orders." });
      }
      if (amountInr !== order.totalInr) {
        return response.status(409).json({ error: "Collected cash does not match the COD payable amount." });
      }
      if (order.paymentStatus === "paid") return response.json({ received: true, paymentStatus: "paid" });
      order.paymentStatus = "paid";
      order.orderStatus = "paid";
      order.cashCollectedAt = new Date();
      await order.save();
      await DeliveryWebhookEvent.create({
        eventId: `cash:${eventId}`,
        orderId: order._id,
      }).catch((error) => {
        if (error?.code !== 11000) throw error;
      });
      return response.json({ received: true, paymentStatus: "paid" });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;

import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import addressRoutes from "./routes/addresses.js";
import orderRoutes from "./routes/orders.js";
import productRoutes from "./routes/products.js";
import reviewRoutes from "./routes/reviews.js";
import webhookRoutes from "./routes/webhooks.js";
import { config } from "./config.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Idempotency-Key",
      "X-Razorpay-Signature",
      "X-Legends-Signature",
    ],
  }),
);
app.use("/api/webhooks", webhookRoutes);
app.use(express.json({ limit: "20kb" }));
app.use(
  "/api/auth",
  rateLimit({
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);
app.use("/api/auth", authRoutes);
app.use(
  "/api/account",
  rateLimit({
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);
app.use("/api/account/addresses", addressRoutes);
app.use("/api/account", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", reviewRoutes);

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "legends-store-api" });
});

app.use((_request, response) => {
  response.status(404).json({ error: "API endpoint not found." });
});

app.use((error, _request, response, _next) => {
  if (error?.name === "ZodError") {
    return response.status(400).json({
      error: "Request validation failed.",
      details: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return response.status(400).json({ error: "The supplied data is invalid." });
  }
  if (error?.code === 11000) {
    return response.status(409).json({ error: "This action has already been recorded." });
  }

  console.error("API request failed:", error);
  return response.status(500).json({ error: "An unexpected server error occurred." });
});

export default app;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { api } from "./routes/index.js";
import { razorpayWebhook } from "./controllers/payment.controller.js";
import { errorHandler, notFound } from "./middleware/error.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS === "*" ? true : env.CORS_ORIGINS.split(",").map((s) => s.trim()) }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Webhook needs the raw body for signature verification — mount BEFORE express.json().
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api", api);

app.use(notFound);
app.use(errorHandler);

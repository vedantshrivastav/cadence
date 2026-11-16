import type { Request, Response } from "express";
import type { z } from "zod";
import { Plan } from "../models/Plan.js";
import { Batch } from "../models/Batch.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { currentUserId } from "../middleware/auth.js";
import { env } from "../config/env.js";
import { createOrder, verifyPaymentSignature, verifyWebhookSignature } from "../services/razorpay.service.js";
import { fulfilPayment } from "../services/payment.service.js";
import type { createOrderSchema, verifyPaymentSchema } from "../validators/schemas.js";

/** Step 1: app asks for an order, then opens Razorpay Checkout (UPI / cards / netbanking) with it. */
export async function createPaymentOrder(req: Request, res: Response) {
  const userId = currentUserId(req);
  const { planId, instrument, batchId } = req.body as z.infer<typeof createOrderSchema>;

  const plan = await Plan.findOne({ _id: planId, isActive: true }).lean();
  if (!plan) throw AppError.notFound("Plan not found");

  if (batchId) {
    const batch = await Batch.findOne({ _id: batchId, isActive: true }).lean();
    if (!batch) throw AppError.notFound("Batch not found");
    if (batch.instrument !== instrument || batch.classesPerWeek !== plan.classesPerWeek) {
      throw AppError.badRequest("Selected batch does not match the chosen instrument and plan");
    }
  }

  const user = await User.findById(userId).lean();
  if (!user) throw AppError.notFound("User not found");

  const order = await createOrder(plan.pricePaise, `cad_${Date.now()}`, {
    userId, planId, instrument,
  });

  await Payment.create({
    user: userId,
    plan: plan._id,
    instrument,
    ...(batchId ? { batch: batchId } : {}),
    amountPaise: plan.pricePaise,
    razorpayOrderId: order.id,
  });

  // Everything react-native-razorpay's RazorpayCheckout.open() needs.
  res.status(201).json({
    success: true,
    checkout: {
      key: env.RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: plan.pricePaise,
      currency: "INR",
      name: "Cadence Music Academy",
      description: `${plan.name} — ${instrument}`,
      prefill: { name: user.name, email: user.email, contact: user.phone },
      theme: { color: "#6C3BFF" },
    },
  });
}

/** Step 2: app sends back what Checkout returned; we verify the signature and activate the subscription. */
export async function verifyPayment(req: Request, res: Response) {
  const userId = currentUserId(req);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body as z.infer<typeof verifyPaymentSchema>;

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id, user: userId }).lean();
  if (!payment) throw AppError.notFound("Order not found");

  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    await Payment.updateOne(
      { _id: payment._id, status: "created" },
      { $set: { status: "failed", failureReason: "Signature mismatch" } },
    );
    throw AppError.badRequest("Payment verification failed");
  }

  const result = await fulfilPayment({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  res.json({ success: true, payment: result.payment, subscription: result.subscription ?? null });
}

/**
 * Razorpay webhook (configure in Dashboard → Webhooks, events: payment.captured, payment.failed).
 * Safety net for when the app is killed after paying but before calling /verify — very common with UPI apps.
 * Must be mounted with express.raw() so we can verify the signature over the exact bytes.
 */
export async function razorpayWebhook(req: Request, res: Response) {
  const signature = req.header("x-razorpay-signature") ?? "";
  const raw = req.body as Buffer;
  if (!Buffer.isBuffer(raw) || !verifyWebhookSignature(raw, signature)) {
    throw AppError.badRequest("Invalid webhook signature");
  }

  const event = JSON.parse(raw.toString("utf8")) as {
    event: string;
    payload?: { payment?: { entity?: { id: string; order_id: string; method?: string; error_description?: string } } };
  };
  const entity = event.payload?.payment?.entity;

  if (entity?.order_id) {
    if (event.event === "payment.captured") {
      await fulfilPayment({ orderId: entity.order_id, paymentId: entity.id, method: entity.method });
    } else if (event.event === "payment.failed") {
      await Payment.updateOne(
        { razorpayOrderId: entity.order_id, status: "created" },
        { $set: { status: "failed", failureReason: entity.error_description ?? "Payment failed" } },
      );
    }
  }
  res.json({ received: true });
}

export async function myPayments(req: Request, res: Response) {
  const payments = await Payment.find({ user: currentUserId(req), status: { $ne: "created" } })
    .sort({ createdAt: -1 })
    .populate("plan", "name classesPerWeek")
    .select("-razorpaySignature")
    .lean();
  res.json({ success: true, payments });
}

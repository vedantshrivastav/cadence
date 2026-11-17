import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "../config/env.js";

export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** Verifies the signature Razorpay Checkout returns to the app after a successful payment. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqual(expected, signature);
}

/** Verifies the X-Razorpay-Signature header of a webhook against the raw request body. */
export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

export async function createOrder(amountPaise: number, receipt: string, notes: Record<string, string>) {
  return razorpay.orders.create({ amount: amountPaise, currency: "INR", receipt, notes });
}

import { Payment } from "../models/Payment.js";
import { grantSubscription } from "./subscription.service.js";

/**
 * Marks a payment as paid and grants/extends the subscription.
 * Idempotent: called from both the app's /verify call and the Razorpay webhook —
 * whichever arrives first does the work, the other is a no-op.
 */
export async function fulfilPayment(params: {
  orderId: string;
  paymentId: string;
  signature?: string | undefined;
  method?: string | undefined;
}) {
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: params.orderId, status: { $ne: "paid" } },
    {
      $set: {
        status: "paid",
        razorpayPaymentId: params.paymentId,
        paidAt: new Date(),
        ...(params.signature ? { razorpaySignature: params.signature } : {}),
        ...(params.method ? { method: params.method } : {}),
      },
    },
    { new: true },
  );

  if (!payment) {
    // Already fulfilled (or unknown order) — return the current record.
    return { payment: await Payment.findOne({ razorpayOrderId: params.orderId }), alreadyProcessed: true };
  }

  const subscription = await grantSubscription({
    userId: payment.user,
    instrument: payment.instrument,
    planId: payment.plan,
    batchId: payment.batch,
    source: "payment",
  });

  if (subscription) {
    payment.subscription = subscription._id;
    await payment.save();
  }
  return { payment, subscription, alreadyProcessed: false };
}

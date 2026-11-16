import { Schema, model, type InferSchemaType } from "mongoose";
import { INSTRUMENTS } from "../config/constants.js";

const paymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    instrument: { type: String, enum: INSTRUMENTS, required: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch" },
    amountPaise: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, sparse: true, unique: true },
    razorpaySignature: String,
    /** upi / card / netbanking etc. — filled from webhook. */
    method: String,
    paidAt: Date,
    subscription: { type: Schema.Types.ObjectId, ref: "Subscription" },
    failureReason: String,
  },
  { timestamps: true },
);

export type PaymentDoc = InferSchemaType<typeof paymentSchema>;
export const Payment = model("Payment", paymentSchema);

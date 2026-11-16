import { Schema, model, type InferSchemaType } from "mongoose";
import { INSTRUMENTS } from "../config/constants.js";

/**
 * One subscription per (student, instrument). Paying again extends `endDate`.
 * Access check = status "active" AND endDate > now.
 */
const subscriptionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    instrument: { type: String, enum: INSTRUMENTS, required: true },
    plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    classesPerWeek: { type: Number, enum: [2, 4], required: true },
    /** Optional: pin the student to one batch. If empty they see all batches for their instrument + plan. */
    batch: { type: Schema.Types.ObjectId, ref: "Batch" },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    /** How access was granted: paid in app, imported existing student, or manually by admin. */
    source: { type: String, enum: ["payment", "existing_student", "admin"], required: true },
    notes: String,
  },
  { timestamps: true },
);

subscriptionSchema.index({ user: 1, instrument: 1 }, { unique: true });
subscriptionSchema.index({ endDate: 1 });

export type SubscriptionDoc = InferSchemaType<typeof subscriptionSchema>;
export const Subscription = model("Subscription", subscriptionSchema);

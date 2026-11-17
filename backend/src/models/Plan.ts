import { Schema, model, type InferSchemaType } from "mongoose";

/** Pricing plan, e.g. "2 classes / week" and "4 classes / week". Admin can edit prices without a code change. */
const planSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    classesPerWeek: { type: Number, required: true, enum: [2, 4], unique: true },
    /** Price in paise (₹1 = 100 paise), as Razorpay expects. */
    pricePaise: { type: Number, required: true, min: 100 },
    /** How long one payment keeps the subscription active. */
    durationDays: { type: Number, required: true, default: 30 },
    description: String,
    features: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type PlanDoc = InferSchemaType<typeof planSchema>;
export const Plan = model("Plan", planSchema);

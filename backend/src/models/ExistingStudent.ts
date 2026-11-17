import { Schema, model, type InferSchemaType } from "mongoose";
import { INSTRUMENTS } from "../config/constants.js";

/**
 * Students who already paid fees outside the app (cash / direct UPI).
 * Admin imports this list; when someone signs up (or logs in) with a matching
 * phone number or email, a subscription is created for them automatically.
 */
const existingStudentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true }, // normalised 10-digit
    email: { type: String, lowercase: true, trim: true },
    instrument: { type: String, enum: INSTRUMENTS, required: true },
    classesPerWeek: { type: Number, enum: [2, 4], required: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch" },
    /** Fees are paid up to this date. */
    paidUntil: { type: Date, required: true },
    claimedBy: { type: Schema.Types.ObjectId, ref: "User" },
    claimedAt: Date,
  },
  { timestamps: true },
);

existingStudentSchema.index({ phone: 1, instrument: 1 }, { unique: true });
existingStudentSchema.index({ email: 1 });

export type ExistingStudentDoc = InferSchemaType<typeof existingStudentSchema>;
export const ExistingStudent = model("ExistingStudent", existingStudentSchema);

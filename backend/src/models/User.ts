import { Schema, model, type InferSchemaType } from "mongoose";
import { INSTRUMENTS, ROLES } from "../config/constants.js";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    /** From Google — always verified. */
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    /** Google account id ("sub"). Empty for an admin seeded by email who hasn't signed in yet. */
    googleId: { type: String, unique: true, sparse: true },
    /** Normalised 10-digit Indian mobile, set only after Firebase OTP verification. */
    phone: { type: String, unique: true, sparse: true },
    phoneVerified: { type: Boolean, default: false },
    role: { type: String, enum: ROLES, default: "student", required: true },
    instruments: [{ type: String, enum: INSTRUMENTS }],
    avatarUrl: String,
    /** Expo / FCM push token for class reminders. */
    pushToken: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);

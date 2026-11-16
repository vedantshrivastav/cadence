import { Schema, model, type InferSchemaType } from "mongoose";
import { INSTRUMENTS, ROLES } from "../config/constants.js";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    /** Normalised 10-digit Indian mobile — used to match pre-existing paid students. */
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "student", required: true },
    /** Instruments the student is interested in (for onboarding / announcements). */
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

import { z } from "zod";
import { INSTRUMENTS, WEEKDAYS } from "../config/constants.js";
import { isValidIndianMobile, normalizePhone } from "../utils/phone.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const phone = z
  .string()
  .refine(isValidIndianMobile, "Enter a valid 10-digit Indian mobile number")
  .transform(normalizePhone);
const instrument = z.enum(INSTRUMENTS);
const classesPerWeek = z.union([z.literal(2), z.literal(4)]);

// ---------- Auth ----------
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().toLowerCase(),
  phone,
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  instruments: z.array(instrument).optional(),
});

export const loginSchema = z.object({
  /** Email or phone number */
  identifier: z.string().trim().min(3),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  instruments: z.array(instrument).optional(),
  avatarUrl: z.url().optional(),
  pushToken: z.string().max(300).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

// ---------- Payments ----------
export const createOrderSchema = z.object({
  planId: objectId,
  instrument,
  batchId: objectId.optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

// ---------- Admin: plans ----------
export const planSchema = z.object({
  name: z.string().trim().min(2),
  classesPerWeek,
  pricePaise: z.number().int().min(100),
  durationDays: z.number().int().min(1).max(366).default(30),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// ---------- Admin: batches ----------
const scheduleSlot = z.object({
  day: z.enum(WEEKDAYS),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm (24h, IST)"),
});

export const batchSchema = z
  .object({
    title: z.string().trim().min(2),
    instrument,
    classesPerWeek,
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    teacherName: z.string().optional(),
    schedule: z.array(scheduleSlot).min(1),
    durationMinutes: z.number().int().min(15).max(240).optional(),
    meetLink: z.url().refine((u) => u.startsWith("https://meet.google.com/"), "Must be a Google Meet link"),
    isActive: z.boolean().optional(),
  });

// ---------- Admin: existing students ----------
export const existingStudentSchema = z.object({
  name: z.string().trim().min(1),
  phone,
  email: z.email().toLowerCase().optional(),
  instrument,
  classesPerWeek,
  batchId: objectId.optional(),
  /** "2026-12-31" or full ISO date */
  paidUntil: z.coerce.date(),
});

export const importExistingStudentsSchema = z.object({
  students: z.array(existingStudentSchema).min(1).max(1000),
});

// ---------- Admin: manual subscription ----------
export const grantSubscriptionSchema = z.object({
  userId: objectId,
  instrument,
  planId: objectId,
  batchId: objectId.optional(),
  days: z.number().int().min(1).max(366).optional(),
  until: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const assignBatchSchema = z.object({ batchId: objectId.nullable() });

// ---------- Admin: content ----------
export const announcementSchema = z.object({
  title: z.string().trim().min(2).max(150),
  body: z.string().trim().min(1).max(5000),
  instruments: z.array(instrument).optional(),
  isPinned: z.boolean().optional(),
});

export const resourceSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().optional(),
  instrument,
  type: z.enum(["pdf", "video", "audio", "recording", "link"]),
  url: z.url(),
  batchId: objectId.optional(),
});

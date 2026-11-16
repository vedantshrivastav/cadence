import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import type { z } from "zod";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { normalizePhone } from "../utils/phone.js";
import { currentUserId, signToken } from "../middleware/auth.js";
import { activeSubscriptions, claimExistingStudentRecords } from "../services/subscription.service.js";
import type {
  changePasswordSchema, loginSchema, registerSchema, updateProfileSchema,
} from "../validators/schemas.js";

function publicUser(u: { _id: unknown; name: string; email: string; phone: string; role: string; instruments?: unknown; avatarUrl?: string | null }) {
  return { id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, instruments: u.instruments ?? [], avatarUrl: u.avatarUrl ?? null };
}

export async function register(req: Request, res: Response) {
  const body = req.body as z.infer<typeof registerSchema>;

  const clash = await User.findOne({ $or: [{ email: body.email }, { phone: body.phone }] }).lean();
  if (clash) throw AppError.conflict(clash.email === body.email ? "Email already registered" : "Phone already registered");

  const user = await User.create({
    name: body.name,
    email: body.email,
    phone: body.phone,
    passwordHash: await bcrypt.hash(body.password, 10),
    instruments: body.instruments ?? [],
  });

  // Existing (already-paid) students get access automatically.
  const linkedSubscriptions = await claimExistingStudentRecords(user._id);

  res.status(201).json({
    success: true,
    token: signToken(user.id, user.role),
    user: publicUser(user),
    linkedSubscriptions,
    subscriptions: await activeSubscriptions(user._id),
  });
}

export async function login(req: Request, res: Response) {
  const { identifier, password } = req.body as z.infer<typeof loginSchema>;
  const query = identifier.includes("@")
    ? { email: identifier.toLowerCase() }
    : { phone: normalizePhone(identifier) };

  const user = await User.findOne(query).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw AppError.unauthorized("Invalid credentials");
  }
  if (!user.isActive) throw AppError.forbidden("Your account has been disabled. Please contact the academy.");

  // Admin may have added this student to the existing list after they signed up.
  const linkedSubscriptions = user.role === "student" ? await claimExistingStudentRecords(user._id) : 0;

  res.json({
    success: true,
    token: signToken(user.id, user.role),
    user: publicUser(user),
    linkedSubscriptions,
    subscriptions: await activeSubscriptions(user._id),
  });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(currentUserId(req)).lean();
  if (!user) throw AppError.notFound("User not found");
  res.json({ success: true, user: publicUser(user), subscriptions: await activeSubscriptions(user._id) });
}

export async function updateProfile(req: Request, res: Response) {
  const body = req.body as z.infer<typeof updateProfileSchema>;
  const user = await User.findByIdAndUpdate(currentUserId(req), { $set: body }, { new: true }).lean();
  if (!user) throw AppError.notFound("User not found");
  res.json({ success: true, user: publicUser(user) });
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>;
  const user = await User.findById(currentUserId(req)).select("+passwordHash");
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw AppError.badRequest("Current password is incorrect");
  }
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ success: true, message: "Password updated" });
}

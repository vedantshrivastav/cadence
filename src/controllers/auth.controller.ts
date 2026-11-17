import type { Request, Response } from "express";
import type { z } from "zod";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { normalizePhone } from "../utils/phone.js";
import { currentUserId, signToken } from "../middleware/auth.js";
import { activeSubscriptions, claimExistingStudentRecords } from "../services/subscription.service.js";
import { verifyFirebasePhoneToken, verifyGoogleIdToken } from "../services/identity.service.js";
import type { googleLoginSchema, updateProfileSchema, verifyPhoneSchema } from "../validators/schemas.js";

interface PublicUserSource {
  _id: unknown; name: string; email: string; phone?: string | null; phoneVerified?: boolean | null;
  role: string; instruments?: unknown; avatarUrl?: string | null;
}

function publicUser(u: PublicUserSource) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? null,
    phoneVerified: Boolean(u.phoneVerified),
    role: u.role,
    instruments: u.instruments ?? [],
    avatarUrl: u.avatarUrl ?? null,
  };
}

/**
 * Step 1 — Google Sign-In. Creates the account on first login.
 * If `needsPhoneVerification` is true the app must show the OTP screen next.
 */
export async function googleLogin(req: Request, res: Response) {
  const { idToken } = req.body as z.infer<typeof googleLoginSchema>;
  const profile = await verifyGoogleIdToken(idToken);

  let user = await User.findOne({ googleId: profile.googleId });
  if (!user) {
    // Same email already in DB (e.g. seeded admin) → link the Google account to it.
    user = await User.findOne({ email: profile.email });
    if (user) {
      if (user.googleId && user.googleId !== profile.googleId) throw AppError.conflict("Email linked to another Google account");
      user.googleId = profile.googleId;
      if (!user.avatarUrl && profile.picture) user.avatarUrl = profile.picture;
      await user.save();
    } else {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        googleId: profile.googleId,
        ...(profile.picture ? { avatarUrl: profile.picture } : {}),
      });
    }
  }
  if (!user.isActive) throw AppError.forbidden("Your account has been disabled. Please contact the academy.");

  const needsPhoneVerification = user.role === "student" && !user.phoneVerified;
  // Admin may have added this student to the existing list after they verified — re-check each login.
  const linkedSubscriptions = !needsPhoneVerification && user.role === "student"
    ? await claimExistingStudentRecords(user._id)
    : 0;

  res.json({
    success: true,
    token: signToken(user.id, user.role),
    user: publicUser(user),
    needsPhoneVerification,
    linkedSubscriptions,
    subscriptions: needsPhoneVerification ? [] : await activeSubscriptions(user._id),
  });
}

/**
 * Step 2 — phone OTP. The app does the OTP with Firebase (signInWithPhoneNumber → confirm(code)),
 * then sends `await firebaseUser.getIdToken()` here. We read the verified number from that token,
 * attach it to the account and auto-link any existing (already-paid) student record with that number.
 */
export async function verifyPhone(req: Request, res: Response) {
  const userId = currentUserId(req);
  const { firebaseIdToken } = req.body as z.infer<typeof verifyPhoneSchema>;
  const e164 = await verifyFirebasePhoneToken(firebaseIdToken);
  if (!e164.startsWith("+91")) throw AppError.badRequest("Only Indian (+91) mobile numbers are supported");
  const phone = normalizePhone(e164);

  const owner = await User.findOne({ phone, _id: { $ne: userId } }).select("_id").lean();
  if (owner) throw AppError.conflict("This phone number is already linked to another account");

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { phone, phoneVerified: true } },
    { new: true },
  ).lean();
  if (!user) throw AppError.notFound("User not found");

  const linkedSubscriptions = await claimExistingStudentRecords(user._id);

  res.json({
    success: true,
    user: publicUser(user),
    linkedSubscriptions,
    subscriptions: await activeSubscriptions(user._id),
  });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(currentUserId(req)).lean();
  if (!user) throw AppError.notFound("User not found");
  res.json({
    success: true,
    user: publicUser(user),
    needsPhoneVerification: user.role === "student" && !user.phoneVerified,
    subscriptions: await activeSubscriptions(user._id),
  });
}

export async function updateProfile(req: Request, res: Response) {
  const body = req.body as z.infer<typeof updateProfileSchema>;
  const user = await User.findByIdAndUpdate(currentUserId(req), { $set: body }, { new: true }).lean();
  if (!user) throw AppError.notFound("User not found");
  res.json({ success: true, user: publicUser(user) });
}

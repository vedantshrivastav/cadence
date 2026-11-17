import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { User } from "../models/User.js";
import type { Role } from "../config/constants.js";

interface JwtPayload { sub: string; role: Role }

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role; phoneVerified: boolean };
    }
  }
}

export function signToken(userId: string, role: Role): string {
  return jwt.sign({ sub: userId, role } satisfies JwtPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] & string,
  });
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw AppError.unauthorized();

  let payload: JwtPayload;
  try {
    payload = jwt.verify(header.slice(7), env.JWT_SECRET) as JwtPayload;
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }

  // Re-check the DB so disabled accounts / role changes take effect immediately.
  const user = await User.findById(payload.sub).select("role isActive phoneVerified").lean();
  if (!user || !user.isActive) throw AppError.unauthorized("Account not found or disabled");

  req.user = { id: payload.sub, role: user.role, phoneVerified: Boolean(user.phoneVerified) };
  next();
};

/** Students must finish phone OTP verification before using the app. Admins are exempt. */
export const requireVerifiedPhone: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== "admin" && !req.user?.phoneVerified) {
    throw new AppError(403, "Please verify your phone number to continue", { code: "PHONE_NOT_VERIFIED" });
  }
  next();
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== "admin") throw AppError.forbidden("Admin access required");
  next();
};

/** The authenticated user's id (requireAuth must run first). */
export function currentUserId(req: { user?: { id: string } }): string {
  if (!req.user) throw AppError.unauthorized();
  return req.user.id;
}

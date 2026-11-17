import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("30d"),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().default(""),
  /** Comma-separated OAuth client IDs (Web + Android + iOS) the app uses for Google Sign-In. */
  GOOGLE_CLIENT_IDS: z.string().min(1).transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean)),
  /** Firebase project used for Phone Auth (OTP). Project ID alone is enough to verify tokens. */
  FIREBASE_PROJECT_ID: z.string().min(1),
  /** Optional service-account credentials (only needed if you later use other Firebase Admin features). */
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  ADMIN_NAME: z.string().default("Cadence Admin"),
  /** Google account email of the academy admin (created by `npm run seed`). */
  ADMIN_EMAIL: z.string().optional(),
  CORS_ORIGINS: z.string().default("*"),
  /** Enables POST /api/auth/dev-login (test users, no Google/OTP). Ignored when NODE_ENV=production. */
  DEV_LOGIN_ENABLED: z.enum(["true", "false"]).default("false").transform((v) => v === "true"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const devLoginEnabled = env.DEV_LOGIN_ENABLED && env.NODE_ENV !== "production";

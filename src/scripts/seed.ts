/**
 * npm run seed
 * Creates the two pricing plans and the first admin account (from .env). Safe to run more than once.
 * Prices below are PLACEHOLDERS — change them here or later via PATCH /api/admin/plans/:id.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";
import { Plan } from "../models/Plan.js";
import { User } from "../models/User.js";
import { normalizePhone } from "../utils/phone.js";

async function seed() {
  await connectDB();

  const plans = [
    {
      name: "Regular — 2 classes / week",
      classesPerWeek: 2,
      pricePaise: 2000_00, // ₹2,000 placeholder
      durationDays: 30,
      description: "8 live classes a month on Google Meet",
      features: ["2 live classes every week", "Practice material", "Attendance tracking"],
    },
    {
      name: "Intensive — 4 classes / week",
      classesPerWeek: 4,
      pricePaise: 3500_00, // ₹3,500 placeholder
      durationDays: 30,
      description: "16 live classes a month on Google Meet",
      features: ["4 live classes every week", "Practice material", "Attendance tracking", "Faster progress"],
    },
  ];
  for (const p of plans) {
    await Plan.updateOne({ classesPerWeek: p.classesPerWeek }, { $setOnInsert: p }, { upsert: true });
  }
  console.log("Plans ready");

  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD && env.ADMIN_PHONE) {
    const exists = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
    if (!exists) {
      await User.create({
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL.toLowerCase(),
        phone: normalizePhone(env.ADMIN_PHONE),
        passwordHash: await bcrypt.hash(env.ADMIN_PASSWORD, 10),
        role: "admin",
      });
      console.log(`Admin created: ${env.ADMIN_EMAIL}`);
    } else {
      console.log("Admin already exists");
    }
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PHONE / ADMIN_PASSWORD not set — skipped admin creation");
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

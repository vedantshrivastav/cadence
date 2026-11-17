/**
 * npm run seed
 * Creates the two pricing plans and marks ADMIN_EMAIL (a Google account) as admin. Safe to run more than once.
 * Prices below are PLACEHOLDERS — change them here or later via PATCH /api/admin/plans/:id.
 */
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";
import { Plan } from "../models/Plan.js";
import { User } from "../models/User.js";

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

  // The admin signs in with Google using this email; the Google account is linked on first login.
  if (env.ADMIN_EMAIL) {
    const email = env.ADMIN_EMAIL.toLowerCase();
    const res = await User.updateOne(
      { email },
      { $set: { role: "admin" }, $setOnInsert: { name: env.ADMIN_NAME, email } },
      { upsert: true },
    );
    console.log(res.upsertedCount ? `Admin created: ${email}` : `Admin role ensured for: ${email}`);
  } else {
    console.log("ADMIN_EMAIL not set — skipped admin creation");
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

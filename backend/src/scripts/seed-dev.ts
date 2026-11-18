/**
 * npm run seed:dev   (run `npm run seed` first so the plans exist)
 * DEVELOPMENT ONLY: sample batches, test users, a subscription for the dev student and an announcement.
 * The first piano class is scheduled ~10 minutes from now (IST) so the countdown / Join button can be tested.
 * Re-run any time to move that class to "soon" again.
 */
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";
import { DEV_USERS } from "../config/devUsers.js";
import { IST_OFFSET_MINUTES, WEEKDAYS, type Weekday } from "../config/constants.js";
import { Announcement } from "../models/Announcement.js";
import { Batch } from "../models/Batch.js";
import { Plan } from "../models/Plan.js";
import { Resource } from "../models/Resource.js";
import { User } from "../models/User.js";
import { grantSubscription } from "../services/subscription.service.js";

if (env.NODE_ENV === "production") {
  console.error("Refusing to run seed:dev with NODE_ENV=production");
  process.exit(1);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Weekday + "HH:mm" in IST, `minutesFromNow` from now (rounded to 5 min). */
function istSlot(minutesFromNow: number): { day: Weekday; startTime: string } {
  const t = new Date(Date.now() + (IST_OFFSET_MINUTES + minutesFromNow) * 60_000);
  const m = Math.ceil(t.getUTCMinutes() / 5) * 5;
  t.setUTCMinutes(m, 0, 0);
  return { day: WEEKDAYS[t.getUTCDay()]!, startTime: `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}` };
}

async function seedDev() {
  await connectDB();

  const plan2 = await Plan.findOne({ classesPerWeek: 2 });
  if (!plan2) throw new Error("Plans missing — run `npm run seed` first");

  const soon = istSlot(10);
  const later = { day: WEEKDAYS[(WEEKDAYS.indexOf(soon.day) + 3) % 7]!, startTime: "18:00" };

  const batches = [
    { title: "Piano Beginners", instrument: "piano", classesPerWeek: 2, teacherName: "Ms. Ananya", schedule: [soon, later], meetLink: "https://meet.google.com/abc-defg-hij" },
    { title: "Piano Intensive", instrument: "piano", classesPerWeek: 4, teacherName: "Ms. Ananya", schedule: [{ day: "mon", startTime: "17:00" }, { day: "tue", startTime: "17:00" }, { day: "thu", startTime: "17:00" }, { day: "fri", startTime: "17:00" }], meetLink: "https://meet.google.com/klm-nopq-rst" },
    { title: "Violin Beginners", instrument: "violin", classesPerWeek: 2, teacherName: "Mr. Rohan", schedule: [{ day: "wed", startTime: "19:00" }, { day: "sat", startTime: "11:00" }], meetLink: "https://meet.google.com/uvw-xyza-bcd" },
    { title: "Drums Beginners", instrument: "drums", classesPerWeek: 2, teacherName: "Mr. Kabir", schedule: [{ day: "tue", startTime: "18:30" }, { day: "sun", startTime: "10:00" }], meetLink: "https://meet.google.com/efg-hijk-lmn" },
  ] as const;

  for (const b of batches) {
    await Batch.updateOne({ title: b.title }, { $set: { ...b, isActive: true } }, { upsert: true });
  }
  console.log(`Batches ready — Piano Beginners next class: ${soon.day} ${soon.startTime} IST`);

  for (const data of Object.values(DEV_USERS)) {
    await User.updateOne({ email: data.email }, { $set: { ...data, isActive: true } }, { upsert: true });
  }
  const student = await User.findOne({ email: DEV_USERS.student.email });
  const admin = await User.findOne({ email: DEV_USERS.admin.email });
  if (!student || !admin) throw new Error("Dev users not created");

  // 20 days left, so the "days left" card shows (renewal warning kicks in at ≤ 5).
  await grantSubscription({
    userId: student._id,
    instrument: "piano",
    planId: plan2._id,
    until: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    source: "admin",
    notes: "seed:dev",
  });
  console.log("Dev student: piano 2x/week, 20 days left");

  await Announcement.updateOne(
    { title: "Welcome to Cadence!" },
    {
      $set: {
        body: "Classes run on Google Meet. Tap Join a few minutes before your class starts. Keep your instrument tuned!",
        instruments: [],
        isPinned: true,
        createdBy: admin._id,
      },
    },
    { upsert: true },
  );
  await Announcement.updateOne(
    { title: "Piano recital this Sunday" },
    {
      $set: {
        body: "All piano students: we're holding a short online recital this Sunday at 5 PM. Prepare one piece you've learnt this month.",
        instruments: ["piano"],
        isPinned: false,
        createdBy: admin._id,
      },
    },
    { upsert: true },
  );
  console.log("Announcements ready");

  const resources = [
    { title: "C major scale — fingering chart", type: "pdf", description: "Right and left hand fingering, two octaves." },
    { title: "Hanon exercise No. 1 (slow practice)", type: "video", description: "Play along at 60 bpm, then 80 bpm." },
    { title: "Metronome track — 60 to 100 bpm", type: "audio" },
    { title: "Class recording — Lesson 3", type: "recording", description: "Chords and left-hand accompaniment." },
  ] as const;
  for (const r of resources) {
    await Resource.updateOne(
      { title: r.title },
      { $set: { ...r, instrument: "piano", url: "https://example.com/cadence-dev-sample", createdBy: admin._id } },
      { upsert: true },
    );
  }
  console.log("Practice resources ready");

  await mongoose.disconnect();
}

seedDev().catch((err) => {
  console.error(err);
  process.exit(1);
});

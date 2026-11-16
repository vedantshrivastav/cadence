import type { Request, Response } from "express";
import { Batch } from "../models/Batch.js";
import { Attendance } from "../models/Attendance.js";
import { Plan } from "../models/Plan.js";
import { AppError } from "../utils/AppError.js";
import { currentUserId } from "../middleware/auth.js";
import { activeSubscriptions } from "../services/subscription.service.js";
import { istDateKey, nextOccurrence, type ScheduleSlot } from "../utils/schedule.js";
import { INSTRUMENTS, type Instrument } from "../config/constants.js";

/** Public: active plans for the pricing screen. */
export async function listPlans(_req: Request, res: Response) {
  const plans = await Plan.find({ isActive: true }).sort({ classesPerWeek: 1 }).lean();
  res.json({ success: true, plans });
}

/** Public: batch timings (WITHOUT meet links) so new students can pick a slot before paying. */
export async function listBatches(req: Request, res: Response) {
  const filter: Record<string, unknown> = { isActive: true };
  const instrument = req.query.instrument;
  if (typeof instrument === "string" && (INSTRUMENTS as readonly string[]).includes(instrument)) {
    filter.instrument = instrument as Instrument;
  }
  if (req.query.classesPerWeek) filter.classesPerWeek = Number(req.query.classesPerWeek);

  const batches = await Batch.find(filter).sort({ instrument: 1, classesPerWeek: 1 }).lean();
  res.json({ success: true, batches });
}

/**
 * Home screen: the student's classes with Google Meet links and next class time.
 * Only batches covered by an active subscription are returned.
 */
export async function myClasses(req: Request, res: Response) {
  const userId = currentUserId(req);
  const subs = await activeSubscriptions(userId);
  if (subs.length === 0) {
    res.json({ success: true, hasActiveSubscription: false, classes: [] });
    return;
  }

  const or = subs.map((s) =>
    s.batch ? { _id: s.batch } : { instrument: s.instrument, classesPerWeek: s.classesPerWeek },
  );
  const batches = await Batch.find({ isActive: true, $or: or }).select("+meetLink").lean();

  const now = new Date();
  const classes = batches
    .map((b) => {
      const nextClassAt = nextOccurrence(b.schedule as ScheduleSlot[], now, b.durationMinutes ?? 60);
      const sub = subs.find((s) => s.instrument === b.instrument);
      return {
        ...b,
        nextClassAt,
        isLiveNow: nextClassAt !== null && nextClassAt <= now,
        subscriptionEndsAt: sub?.endDate ?? null,
      };
    })
    .sort((a, b) => (a.nextClassAt?.getTime() ?? Infinity) - (b.nextClassAt?.getTime() ?? Infinity));

  res.json({ success: true, hasActiveSubscription: true, subscriptions: subs, classes });
}

/** "Join class" button: checks access, records attendance, returns the Meet link to open. */
export async function joinClass(req: Request<{ batchId: string }>, res: Response) {
  const userId = currentUserId(req);
  const batch = await Batch.findOne({ _id: req.params.batchId, isActive: true }).select("+meetLink").lean();
  if (!batch) throw AppError.notFound("Class not found");

  const subs = await activeSubscriptions(userId);
  const allowed = subs.some(
    (s) =>
      s.instrument === batch.instrument &&
      (s.batch ? String(s.batch) === String(batch._id) : s.classesPerWeek === batch.classesPerWeek),
  );
  if (!allowed) throw AppError.forbidden("Your subscription does not include this class. Please subscribe or renew.");

  await Attendance.updateOne(
    { user: userId, batch: batch._id, date: istDateKey() },
    { $setOnInsert: { joinedAt: new Date() } },
    { upsert: true },
  );

  res.json({ success: true, meetLink: batch.meetLink });
}

export async function myAttendance(req: Request, res: Response) {
  const records = await Attendance.find({ user: currentUserId(req) })
    .sort({ date: -1 })
    .limit(100)
    .populate("batch", "title instrument")
    .lean();
  res.json({ success: true, count: records.length, attendance: records });
}

import type { Types } from "mongoose";
import { Subscription } from "../models/Subscription.js";
import { Plan } from "../models/Plan.js";
import { ExistingStudent } from "../models/ExistingStudent.js";
import { User } from "../models/User.js";
import type { Instrument } from "../config/constants.js";
import { AppError } from "../utils/AppError.js";
import { addDays } from "../utils/schedule.js";

type Id = Types.ObjectId | string;

interface GrantInput {
  userId: Id;
  instrument: Instrument;
  planId: Id;
  batchId?: Id | null | undefined;
  source: "payment" | "existing_student" | "admin";
  /** Extend by N days (defaults to the plan's durationDays) ... */
  days?: number | undefined;
  /** ... or set an explicit end date (used for imported students). */
  until?: Date | undefined;
  notes?: string | undefined;
}

/**
 * Creates or extends the student's subscription for an instrument.
 * If they still have time left, the new period is added on top of it (no days lost on early renewal).
 */
export async function grantSubscription(input: GrantInput) {
  const plan = await Plan.findById(input.planId).lean();
  if (!plan) throw AppError.notFound("Plan not found");

  const now = new Date();
  const existing = await Subscription.findOne({ user: input.userId, instrument: input.instrument });
  const stillActive = existing && existing.status === "active" && existing.endDate > now;
  const base = stillActive ? existing.endDate : now;

  let endDate: Date;
  if (input.until) {
    endDate = stillActive && existing.endDate > input.until ? existing.endDate : input.until;
  } else {
    endDate = addDays(base, input.days ?? plan.durationDays);
  }

  const update = {
    plan: plan._id,
    classesPerWeek: plan.classesPerWeek,
    status: "active" as const,
    startDate: stillActive ? existing.startDate : now,
    endDate,
    source: input.source,
    ...(input.batchId ? { batch: input.batchId } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };

  return Subscription.findOneAndUpdate(
    { user: input.userId, instrument: input.instrument },
    { $set: update, $setOnInsert: { user: input.userId, instrument: input.instrument } },
    { upsert: true, new: true },
  );
}

/** Active subscriptions of a user (status active and not expired). */
export function activeSubscriptions(userId: Id) {
  return Subscription.find({ user: userId, status: "active", endDate: { $gt: new Date() } })
    .populate("plan", "name classesPerWeek")
    .lean();
}

/**
 * Links a newly registered / logged-in user to any matching pre-paid record
 * from the admin's existing-student list (matched on phone, or email as fallback).
 * Returns how many subscriptions were activated.
 */
export async function claimExistingStudentRecords(userId: Id): Promise<number> {
  const user = await User.findById(userId).select("phone email").lean();
  if (!user) return 0;

  const records = await ExistingStudent.find({
    claimedBy: { $exists: false },
    $or: [{ phone: user.phone }, { email: user.email }],
  });

  let activated = 0;
  for (const rec of records) {
    const plan = await Plan.findOne({ classesPerWeek: rec.classesPerWeek }).select("_id").lean();
    if (!plan) continue;

    // Atomically claim so the same record can't be used twice.
    const claimed = await ExistingStudent.findOneAndUpdate(
      { _id: rec._id, claimedBy: { $exists: false } },
      { $set: { claimedBy: userId, claimedAt: new Date() } },
    );
    if (!claimed) continue;

    if (rec.paidUntil > new Date()) {
      await grantSubscription({
        userId,
        instrument: rec.instrument,
        planId: plan._id,
        batchId: rec.batch,
        until: rec.paidUntil,
        source: "existing_student",
        notes: "Auto-linked from existing student list",
      });
      activated++;
    }
  }
  return activated;
}

import type { Request, Response } from "express";
import type { z } from "zod";
import { Plan } from "../models/Plan.js";
import { Batch } from "../models/Batch.js";
import { User } from "../models/User.js";
import { Subscription } from "../models/Subscription.js";
import { Payment } from "../models/Payment.js";
import { ExistingStudent } from "../models/ExistingStudent.js";
import { Attendance } from "../models/Attendance.js";
import { Announcement } from "../models/Announcement.js";
import { Resource } from "../models/Resource.js";
import { AppError } from "../utils/AppError.js";
import { currentUserId } from "../middleware/auth.js";
import { claimExistingStudentRecords, grantSubscription } from "../services/subscription.service.js";
import { addDays } from "../utils/schedule.js";
import type {
  announcementSchema, assignBatchSchema, batchSchema, existingStudentSchema, grantSubscriptionSchema,
  importExistingStudentsSchema, planSchema, resourceSchema,
} from "../validators/schemas.js";

type IdParams = { id: string };

function pageParams(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

// ================= Dashboard =================
export async function dashboard(_req: Request, res: Response) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [students, activeSubs, expiringSoon, revenue, unclaimed] = await Promise.all([
    User.countDocuments({ role: "student" }),
    Subscription.countDocuments({ status: "active", endDate: { $gt: now } }),
    Subscription.countDocuments({ status: "active", endDate: { $gt: now, $lte: addDays(now, 7) } }),
    Payment.aggregate<{ total: number; count: number }>([
      { $match: { status: "paid", paidAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amountPaise" }, count: { $sum: 1 } } },
    ]),
    ExistingStudent.countDocuments({ claimedBy: { $exists: false } }),
  ]);
  res.json({
    success: true,
    stats: {
      totalStudents: students,
      activeSubscriptions: activeSubs,
      expiringIn7Days: expiringSoon,
      revenueThisMonthPaise: revenue[0]?.total ?? 0,
      paymentsThisMonth: revenue[0]?.count ?? 0,
      existingStudentsNotYetSignedUp: unclaimed,
    },
  });
}

// ================= Plans =================
export async function listAllPlans(_req: Request, res: Response) {
  res.json({ success: true, plans: await Plan.find().sort({ classesPerWeek: 1 }).lean() });
}
export async function createPlan(req: Request, res: Response) {
  const plan = await Plan.create(req.body as z.infer<typeof planSchema>);
  res.status(201).json({ success: true, plan });
}
export async function updatePlan(req: Request<IdParams>, res: Response) {
  const plan = await Plan.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!plan) throw AppError.notFound("Plan not found");
  res.json({ success: true, plan });
}

// ================= Batches (classes + Meet links) =================
export async function listAllBatches(_req: Request, res: Response) {
  const batches = await Batch.find().select("+meetLink").sort({ instrument: 1, classesPerWeek: 1 }).lean();
  res.json({ success: true, batches });
}
export async function createBatch(req: Request, res: Response) {
  const batch = await Batch.create(req.body as z.infer<typeof batchSchema>);
  res.status(201).json({ success: true, batch });
}
export async function updateBatch(req: Request<IdParams>, res: Response) {
  const batch = await Batch.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true })
    .select("+meetLink");
  if (!batch) throw AppError.notFound("Batch not found");
  res.json({ success: true, batch });
}
export async function deleteBatch(req: Request<IdParams>, res: Response) {
  // Soft delete keeps attendance history intact.
  const batch = await Batch.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true });
  if (!batch) throw AppError.notFound("Batch not found");
  res.json({ success: true, message: "Batch deactivated" });
}
export async function batchAttendance(req: Request<IdParams>, res: Response) {
  const filter: Record<string, unknown> = { batch: req.params.id };
  if (typeof req.query.date === "string") filter.date = req.query.date;
  const records = await Attendance.find(filter).sort({ date: -1 }).limit(500).populate("user", "name phone").lean();
  res.json({ success: true, count: records.length, attendance: records });
}

// ================= Students =================
export async function listStudents(req: Request, res: Response) {
  const { page, limit, skip } = pageParams(req);
  const filter: Record<string, unknown> = { role: "student" };
  if (typeof req.query.search === "string" && req.query.search.trim()) {
    const rx = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  const subs = await Subscription.find({ user: { $in: users.map((u) => u._id) } })
    .populate("plan", "name classesPerWeek")
    .populate("batch", "title")
    .lean();
  const now = new Date();
  const students = users.map((u) => ({
    ...u,
    subscriptions: subs
      .filter((s) => String(s.user) === String(u._id))
      .map((s) => ({ ...s, isActive: s.status === "active" && s.endDate > now })),
  }));
  res.json({ success: true, page, limit, total, students });
}

export async function setStudentActive(req: Request<IdParams>, res: Response) {
  const isActive = Boolean((req.body as { isActive?: unknown }).isActive);
  const user = await User.findOneAndUpdate({ _id: req.params.id, role: "student" }, { $set: { isActive } }, { new: true });
  if (!user) throw AppError.notFound("Student not found");
  res.json({ success: true, message: isActive ? "Account enabled" : "Account disabled" });
}

// ================= Subscriptions (manual) =================
export async function grantSubscriptionManually(req: Request, res: Response) {
  const body = req.body as z.infer<typeof grantSubscriptionSchema>;
  const user = await User.findById(body.userId).lean();
  if (!user) throw AppError.notFound("Student not found");
  const subscription = await grantSubscription({
    userId: body.userId,
    instrument: body.instrument,
    planId: body.planId,
    batchId: body.batchId,
    days: body.days,
    until: body.until,
    source: "admin",
    notes: body.notes,
  });
  res.json({ success: true, subscription });
}

export async function assignBatch(req: Request<IdParams>, res: Response) {
  const { batchId } = req.body as z.infer<typeof assignBatchSchema>;
  const update = batchId ? { $set: { batch: batchId } } : { $unset: { batch: 1 } };
  const sub = await Subscription.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!sub) throw AppError.notFound("Subscription not found");
  res.json({ success: true, subscription: sub });
}

export async function cancelSubscription(req: Request<IdParams>, res: Response) {
  const sub = await Subscription.findByIdAndUpdate(req.params.id, { $set: { status: "cancelled" } }, { new: true });
  if (!sub) throw AppError.notFound("Subscription not found");
  res.json({ success: true, subscription: sub });
}

// ================= Existing (already-paid) students =================
async function upsertExisting(s: z.infer<typeof existingStudentSchema>) {
  const { batchId, ...rest } = s;
  return ExistingStudent.findOneAndUpdate(
    { phone: s.phone, instrument: s.instrument },
    { $set: { ...rest, ...(batchId ? { batch: batchId } : {}) } },
    { upsert: true, new: true },
  );
}

/** Links the record immediately if that student already has an account. */
async function linkIfRegistered(phone: string, email?: string) {
  const user = await User.findOne({ $or: [{ phone }, ...(email ? [{ email }] : [])] }).select("_id").lean();
  return user ? claimExistingStudentRecords(user._id) : 0;
}

export async function addExistingStudent(req: Request, res: Response) {
  const body = req.body as z.infer<typeof existingStudentSchema>;
  const record = await upsertExisting(body);
  const linked = await linkIfRegistered(body.phone, body.email);
  res.status(201).json({ success: true, record, linkedToExistingAccount: linked > 0 });
}

/** Bulk import — e.g. the app's admin screen parses your Excel/Google Sheet and sends JSON. */
export async function importExistingStudents(req: Request, res: Response) {
  const { students } = req.body as z.infer<typeof importExistingStudentsSchema>;
  let linked = 0;
  for (const s of students) {
    await upsertExisting(s);
    linked += await linkIfRegistered(s.phone, s.email);
  }
  res.json({ success: true, imported: students.length, linkedToExistingAccounts: linked });
}

export async function listExistingStudents(req: Request, res: Response) {
  const filter: Record<string, unknown> = {};
  if (req.query.claimed === "true") filter.claimedBy = { $exists: true };
  if (req.query.claimed === "false") filter.claimedBy = { $exists: false };
  const records = await ExistingStudent.find(filter).sort({ createdAt: -1 }).populate("claimedBy", "name email").lean();
  res.json({ success: true, count: records.length, records });
}

export async function deleteExistingStudent(req: Request<IdParams>, res: Response) {
  const rec = await ExistingStudent.findByIdAndDelete(req.params.id);
  if (!rec) throw AppError.notFound("Record not found");
  res.json({ success: true, message: "Removed" });
}

// ================= Payments =================
export async function listPayments(req: Request, res: Response) {
  const { page, limit, skip } = pageParams(req);
  const filter: Record<string, unknown> = {};
  if (typeof req.query.status === "string") filter.status = req.query.status;
  const [payments, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate("user", "name phone email").populate("plan", "name").select("-razorpaySignature").lean(),
    Payment.countDocuments(filter),
  ]);
  res.json({ success: true, page, limit, total, payments });
}

// ================= Announcements & resources =================
export async function createAnnouncement(req: Request, res: Response) {
  const announcement = await Announcement.create({
    ...(req.body as z.infer<typeof announcementSchema>),
    createdBy: currentUserId(req),
  });
  // TODO: send a push notification to matching students (Expo / FCM) using User.pushToken.
  res.status(201).json({ success: true, announcement });
}
export async function updateAnnouncement(req: Request<IdParams>, res: Response) {
  const a = await Announcement.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!a) throw AppError.notFound("Announcement not found");
  res.json({ success: true, announcement: a });
}
export async function deleteAnnouncement(req: Request<IdParams>, res: Response) {
  const a = await Announcement.findByIdAndDelete(req.params.id);
  if (!a) throw AppError.notFound("Announcement not found");
  res.json({ success: true, message: "Deleted" });
}

export async function createResource(req: Request, res: Response) {
  const { batchId, ...rest } = req.body as z.infer<typeof resourceSchema>;
  const resource = await Resource.create({ ...rest, ...(batchId ? { batch: batchId } : {}), createdBy: currentUserId(req) });
  res.status(201).json({ success: true, resource });
}
export async function deleteResource(req: Request<IdParams>, res: Response) {
  const r = await Resource.findByIdAndDelete(req.params.id);
  if (!r) throw AppError.notFound("Resource not found");
  res.json({ success: true, message: "Deleted" });
}

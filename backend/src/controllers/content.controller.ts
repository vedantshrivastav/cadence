import type { Request, Response } from "express";
import { Announcement } from "../models/Announcement.js";
import { Resource } from "../models/Resource.js";
import { User } from "../models/User.js";
import { currentUserId } from "../middleware/auth.js";
import { activeSubscriptions } from "../services/subscription.service.js";

/** Announcements for everyone + those targeted at the student's instruments. */
export async function listAnnouncements(req: Request, res: Response) {
  const user = await User.findById(currentUserId(req)).select("instruments role").lean();
  const subs = await activeSubscriptions(currentUserId(req));
  const instruments = [...new Set([...(user?.instruments ?? []), ...subs.map((s) => s.instrument)])];

  const filter = user?.role === "admin"
    ? {}
    : { $or: [{ instruments: { $size: 0 } }, { instruments: { $in: instruments } }] };

  const announcements = await Announcement.find(filter)
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(50)
    .lean();
  res.json({ success: true, announcements });
}

/** Practice material — subscribers only, for the instruments they're subscribed to. */
export async function listResources(req: Request, res: Response) {
  const subs = await activeSubscriptions(currentUserId(req));
  if (subs.length === 0) {
    res.json({ success: true, resources: [], message: "Subscribe to access practice material" });
    return;
  }
  const resources = await Resource.find({
    $or: subs.map((s) => ({
      instrument: s.instrument,
      ...(s.batch
        ? { $or: [{ batch: { $exists: false } }, { batch: null }, { batch: s.batch }] }
        : { $or: [{ batch: { $exists: false } }, { batch: null }] }),
    })),
  })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, resources });
}

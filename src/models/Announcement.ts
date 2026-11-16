import { Schema, model, type InferSchemaType } from "mongoose";
import { INSTRUMENTS } from "../config/constants.js";

/** Notices like "No class on Diwali", "Recital on Sunday", "Batch timing changed". */
const announcementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    /** Empty = visible to everyone; otherwise only to students of these instruments. */
    instruments: [{ type: String, enum: INSTRUMENTS }],
    isPinned: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export type AnnouncementDoc = InferSchemaType<typeof announcementSchema>;
export const Announcement = model("Announcement", announcementSchema);

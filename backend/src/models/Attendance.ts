import { Schema, model, type InferSchemaType } from "mongoose";

/** Recorded when a student taps "Join class" — gives the admin free attendance tracking. */
const attendanceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    batch: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    /** IST date "YYYY-MM-DD" — one record per student per batch per day. */
    date: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

attendanceSchema.index({ user: 1, batch: 1, date: 1 }, { unique: true });
attendanceSchema.index({ batch: 1, date: 1 });

export type AttendanceDoc = InferSchemaType<typeof attendanceSchema>;
export const Attendance = model("Attendance", attendanceSchema);

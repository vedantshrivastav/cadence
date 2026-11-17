import { Schema, model, type InferSchemaType } from "mongoose";
import { INSTRUMENTS, WEEKDAYS } from "../config/constants.js";

/**
 * A recurring class group with a fixed Google Meet link,
 * e.g. "Piano Beginners — Mon & Thu 6pm" (2x/week plan).
 */
const batchSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    instrument: { type: String, enum: INSTRUMENTS, required: true },
    /** Which plan this batch belongs to (2 or 4 classes per week). */
    classesPerWeek: { type: Number, enum: [2, 4], required: true },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    teacherName: String,
    schedule: [
      {
        _id: false,
        day: { type: String, enum: WEEKDAYS, required: true },
        startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ }, // HH:mm IST
      },
    ],
    durationMinutes: { type: Number, default: 60 },
    /** Never sent to users without an active subscription. */
    meetLink: { type: String, required: true, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

batchSchema.index({ instrument: 1, classesPerWeek: 1, isActive: 1 });

export type BatchDoc = InferSchemaType<typeof batchSchema>;
export const Batch = model("Batch", batchSchema);

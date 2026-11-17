import { Schema, model, type InferSchemaType } from "mongoose";
import { INSTRUMENTS } from "../config/constants.js";

/** Practice material: sheet music PDFs, YouTube practice videos, class recordings (Drive links). */
const resourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    instrument: { type: String, enum: INSTRUMENTS, required: true },
    type: { type: String, enum: ["pdf", "video", "audio", "recording", "link"], required: true },
    url: { type: String, required: true },
    /** Optional: only for one batch (e.g. a class recording). */
    batch: { type: Schema.Types.ObjectId, ref: "Batch" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

resourceSchema.index({ instrument: 1, createdAt: -1 });

export type ResourceDoc = InferSchemaType<typeof resourceSchema>;
export const Resource = model("Resource", resourceSchema);

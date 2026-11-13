import mongoose, { Schema, InferSchemaType } from "mongoose";

// Unfinished registrations, so admin can follow up. Auto-deleted after 30 days.
const DraftSchema = new Schema(
  {
    draftId: { type: String, required: true, unique: true },
    course: String,
    mode: String,
    fullName: String,
    email: String,
    phone: String,
    step: Number,
    updatedAt: { type: Date, default: Date.now, index: { expireAfterSeconds: 60 * 60 * 24 * 30 } },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type DraftDoc = InferSchemaType<typeof DraftSchema>;
export default (mongoose.models.Draft as mongoose.Model<DraftDoc>) || mongoose.model<DraftDoc>("Draft", DraftSchema);

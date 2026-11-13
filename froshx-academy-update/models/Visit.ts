import mongoose, { Schema, InferSchemaType } from "mongoose";

// Anonymous page views — no IP address, no personal data.
const VisitSchema = new Schema(
  {
    sid: { type: String, required: true, index: true },
    path: { type: String, required: true },
    referrer: String,
    device: String,
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

export type VisitDoc = InferSchemaType<typeof VisitSchema>;
export default (mongoose.models.Visit as mongoose.Model<VisitDoc>) || mongoose.model<VisitDoc>("Visit", VisitSchema);

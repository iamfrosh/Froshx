import mongoose, { Schema, InferSchemaType } from "mongoose";

// A visitor question the assistant could not answer. The visitor left an email so the team can reply.
const ChatEnquirySchema = new Schema(
  {
    sid: { type: String, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    question: { type: String, required: true },
    transcript: [{ from: String, text: String, _id: false }],
    status: { type: String, enum: ["open", "answered"], default: "open", index: true },
    replies: [{ subject: String, text: String, at: { type: Date, default: Date.now }, _id: false }],
  },
  { timestamps: true }
);

export type ChatEnquiryDoc = InferSchemaType<typeof ChatEnquirySchema>;
export default (mongoose.models.ChatEnquiry as mongoose.Model<ChatEnquiryDoc>) || mongoose.model<ChatEnquiryDoc>("ChatEnquiry", ChatEnquirySchema);

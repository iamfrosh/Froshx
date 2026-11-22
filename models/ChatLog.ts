import mongoose, { Schema, InferSchemaType } from "mongoose";

// What visitors ask the website assistant. Deleted automatically after 90 days.
const ChatLogSchema = new Schema(
  {
    sid: { type: String, index: true },
    question: String,
    answer: String,
    source: { type: String, enum: ["rules", "ai", "none"], default: "rules", index: true }, // none = nobody could answer
    intent: String,
    createdAt: { type: Date, default: Date.now, index: { expireAfterSeconds: 60 * 60 * 24 * 90 } },
  },
  { versionKey: false }
);

export type ChatLogDoc = InferSchemaType<typeof ChatLogSchema>;
export default (mongoose.models.ChatLog as mongoose.Model<ChatLogDoc>) || mongoose.model<ChatLogDoc>("ChatLog", ChatLogSchema);

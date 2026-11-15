import mongoose, { Schema, InferSchemaType } from "mongoose";

// One document (key "main") holding the site music settings.
const MusicSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    enabled: { type: Boolean, default: true },
    volume: { type: Number, default: 0.7, min: 0, max: 1 },
    source: { type: String, enum: ["builtin", "upload", "url"], default: "builtin" },
    url: { type: String, default: "" },
    hasUpload: { type: Boolean, default: false },
    audioName: { type: String, default: "" },
    audioType: { type: String, default: "" },
    audioData: { type: Buffer, select: false },
  },
  { timestamps: true }
);

export type MusicDoc = InferSchemaType<typeof MusicSchema>;
export default (mongoose.models.MusicSetting as mongoose.Model<MusicDoc>) || mongoose.model<MusicDoc>("MusicSetting", MusicSchema);

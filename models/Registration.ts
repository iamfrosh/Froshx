import mongoose, { Schema, InferSchemaType } from "mongoose";

const RegistrationSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true },
    course: { type: String, required: true, index: true },
    courseTitle: { type: String, required: true },
    mode: { type: String, enum: ["online", "physical"], required: true },
    fee: { type: Number, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    gender: String,
    ageRange: String,
    location: String,
    education: String,
    device: String,
    experience: String,
    startAsap: Boolean,
    preferredStart: String,
    goal: String,
    source: String,
    committed: { type: Boolean, default: false },
    consent: { type: Boolean, default: false },
    emailStatus: { type: String, default: "pending" }, // pending | sent | failed
    status: { type: String, enum: ["new", "contacted", "confirmed", "cancelled"], default: "new", index: true },
  },
  { timestamps: true }
);

// One registration per person per course
RegistrationSchema.index({ email: 1, course: 1 }, { unique: true });

export type RegistrationDoc = InferSchemaType<typeof RegistrationSchema>;
export default (mongoose.models.Registration as mongoose.Model<RegistrationDoc>) ||
  mongoose.model<RegistrationDoc>("Registration", RegistrationSchema);

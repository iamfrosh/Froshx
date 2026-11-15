import mongoose, { Schema, InferSchemaType } from "mongoose";

const StudentSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: String,
    phone: String,
    passwordHash: { type: String, required: true },
    mustChangePassword: { type: Boolean, default: true },
    failedLogins: { type: Number, default: 0 },
    lockUntil: Date,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

export type StudentDoc = InferSchemaType<typeof StudentSchema>;
export default (mongoose.models.Student as mongoose.Model<StudentDoc>) || mongoose.model<StudentDoc>("Student", StudentSchema);

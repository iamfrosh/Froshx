import mongoose, { Schema, InferSchemaType } from "mongoose";

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, default: "" },
    type: { type: String, default: "" }, // e.g. "E-commerce"
    tech: { type: String, default: "" }, // e.g. "React, Node.js"
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" }, // preview image found on the link, or pasted by admin
    hasUpload: { type: Boolean, default: false },
    imageData: { type: Buffer, select: false },
    imageType: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
    featured: { type: Boolean, default: true }, // show on the homepage
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type ProjectDoc = InferSchemaType<typeof ProjectSchema>;
export default (mongoose.models.Project as mongoose.Model<ProjectDoc>) || mongoose.model<ProjectDoc>("Project", ProjectSchema);

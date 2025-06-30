import mongoose from "mongoose";

export interface IPost {
  _id?: string;
  title: string;
  content: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
PostSchema.index({ slug: 1 });
PostSchema.index({ createdAt: -1 });

export default mongoose.models.Post || mongoose.model("Post", PostSchema);

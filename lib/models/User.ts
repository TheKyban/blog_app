import mongoose from "mongoose";

export enum USER {
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
}

export interface IUser {
  _id?: string;
  username: string;
  role: USER;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(USER),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
UserSchema.index({ username: 1 });

export default mongoose?.models?.User || mongoose.model("User", UserSchema);

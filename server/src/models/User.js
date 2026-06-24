import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    refreshTokenHash: { type: String, select: false, default: "" },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);

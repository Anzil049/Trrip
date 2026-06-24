import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    verificationId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otpHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

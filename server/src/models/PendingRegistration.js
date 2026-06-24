import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema(
  {
    verificationId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export const PendingRegistration = mongoose.model("PendingRegistration", pendingRegistrationSchema);

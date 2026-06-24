import bcrypt from "bcryptjs";
import crypto from "crypto";
import { nanoid } from "nanoid";
import { z } from "zod";
import { User } from "../models/User.js";
import { PendingRegistration } from "../models/PendingRegistration.js";
import { PasswordReset } from "../models/PasswordReset.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/token.js";
import { sendOtpEmail } from "../services/mailService.js";

const authSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email(),
  password: z.string().min(6),
});

const verifySchema = z.object({
  verificationId: z.string().min(6),
  otp: z.string().trim().regex(/^\d{6}$/),
});

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt,
});

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: false, // Must be false for HTTP deployments without SSL
  path: "/",
});

const setAuthCookies = async (res, user) => {
  const accessToken = signAccessToken({ id: user._id });
  const refreshToken = signRefreshToken({ id: user._id });
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save();

  res.cookie("trrrip_access", accessToken, {
    ...cookieOptions(),
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("trrrip_refresh", refreshToken, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie("trrrip_access", cookieOptions());
  res.clearCookie("trrrip_refresh", cookieOptions());
};

export const register = asyncHandler(async (req, res) => {
  const body = authSchema.parse(req.body);
  const existing = await User.findOne({ email: body.email });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const pending = await PendingRegistration.findOne({ email: body.email });
  if (pending) {
    await pending.deleteOne();
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const otp = String(crypto.randomInt(100000, 1000000));
  const otpHash = await bcrypt.hash(otp, 10);
  const verificationId = nanoid(18);

  await PendingRegistration.create({
    verificationId,
    name: body.name || "Traveler",
    email: body.email,
    passwordHash,
    otpHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendOtpEmail({ to: body.email, name: body.name || "Traveler", otp });

  res.status(201).json({
    verificationId,
    email: body.email,
    message: "Verification code sent to your email.",
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const body = verifySchema.parse(req.body);
  const pending = await PendingRegistration.findOne({
    verificationId: body.verificationId,
    expiresAt: { $gt: new Date() },
  });

  if (!pending) {
    throw new AppError("Verification code expired or invalid", 400);
  }

  const isValidOtp = await bcrypt.compare(body.otp, pending.otpHash);
  if (!isValidOtp) {
    throw new AppError("Invalid verification code", 400);
  }

  const user = await User.create({
    name: pending.name,
    email: pending.email,
    passwordHash: pending.passwordHash,
  });

  await setAuthCookies(res, user);
  await pending.deleteOne();

  res.status(201).json({
    user: serializeUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const body = authSchema.omit({ name: true }).parse(req.body);
  const user = await User.findOne({ email: body.email }).select("+passwordHash +refreshTokenHash");

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const match = await bcrypt.compare(body.password, user.passwordHash);
  if (!match) {
    throw new AppError("Invalid credentials", 401);
  }

  await setAuthCookies(res, user);
  res.json({ user: serializeUser(user) });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.trrrip_refresh;
  if (!token) {
    throw new AppError("No refresh token", 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await User.findById(decoded.id).select("+refreshTokenHash");
  if (!user || !user.refreshTokenHash) {
    throw new AppError("Session expired", 401);
  }

  const matches = await bcrypt.compare(token, user.refreshTokenHash);
  if (!matches) {
    throw new AppError("Session expired", 401);
  }

  await setAuthCookies(res, user);
  res.json({ user: serializeUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);

  const token = req.cookies?.trrrip_refresh;
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      await User.findByIdAndUpdate(decoded.id, { $unset: { refreshTokenHash: 1 } });
    } catch {
      // Ignore invalid refresh tokens during logout.
    }
  }

  res.json({ message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError("Email is required", 400);

  const user = await User.findOne({ email });
  if (!user) {
    // Return success to prevent email enumeration
    return res.json({ message: "If that email is registered, a reset code was sent.", verificationId: nanoid(18) });
  }

  // Generate OTP and verification ID
  const otp = String(crypto.randomInt(100000, 1000000));
  const otpHash = await bcrypt.hash(otp, 10);
  const verificationId = nanoid(18);

  // Invalidate previous requests for this email
  await PasswordReset.deleteMany({ email });

  await PasswordReset.create({
    verificationId,
    email,
    otpHash,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
  });

  await sendOtpEmail({ to: email, name: user.name, otp });

  res.json({
    verificationId,
    message: "If that email is registered, a reset code was sent.",
  });
});

export const verifyResetOtp = asyncHandler(async (req, res) => {
  const body = verifySchema.parse(req.body);
  const resetRequest = await PasswordReset.findOne({
    verificationId: body.verificationId,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRequest) {
    throw new AppError("Reset code expired or invalid", 400);
  }

  const isValidOtp = await bcrypt.compare(body.otp, resetRequest.otpHash);
  if (!isValidOtp) {
    throw new AppError("Invalid reset code", 400);
  }

  resetRequest.isVerified = true;
  await resetRequest.save();

  res.json({ message: "OTP verified successfully." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { verificationId, password } = req.body;
  if (!password || password.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400);
  }

  const resetRequest = await PasswordReset.findOne({
    verificationId,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRequest || !resetRequest.isVerified) {
    throw new AppError("Reset session invalid or expired", 400);
  }

  const user = await User.findOne({ email: resetRequest.email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  await user.save();

  await resetRequest.deleteOne();

  await setAuthCookies(res, user);

  res.json({
    message: "Password reset successfully",
    user: serializeUser(user),
  });
});

import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

export const signAccessToken = (payload) =>
  jwt.sign(payload, accessSecret, { expiresIn: "15m" });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, refreshSecret, { expiresIn: "7d" });

export const verifyAccessToken = (token) => jwt.verify(token, accessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret);

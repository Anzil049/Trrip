import { AppError } from "../utils/AppError.js";
import { User } from "../models/User.js";
import { verifyAccessToken } from "../utils/token.js";

export const protect = async (req, _res, next) => {
  const bearer = req.headers.authorization;
  const accessToken = req.cookies?.trrrip_access || (bearer?.startsWith("Bearer ") ? bearer.split(" ")[1] : "");

  if (!accessToken) {
    return next(new AppError("Not authorized", 401));
  }

  try {
    const decoded = verifyAccessToken(accessToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    req.user = user;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
};

export const optionalAuth = async (req, _res, next) => {
  const bearer = req.headers.authorization;
  const accessToken = req.cookies?.trrrip_access || (bearer?.startsWith("Bearer ") ? bearer.split(" ")[1] : "");

  if (!accessToken) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(accessToken);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch {
    // Ignore error
  }
  next();
};

import { Itinerary } from "../models/Itinerary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export const getSharedItinerary = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOne({
    shareToken: req.params.shareToken,
    isPublic: true,
  }).populate("user", "name avatarUrl");

  if (!itinerary) {
    throw new AppError("Shared itinerary not found", 404);
  }

  res.json({ itinerary });
});


import mongoose from "mongoose";
import { Itinerary } from "../models/Itinerary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { generateItinerary } from "../services/aiService.js";
import { getTemplateById } from "../services/templateService.js";
import { nanoid } from "nanoid";

export const listItineraries = asyncHandler(async (req, res) => {
  const itineraries = await Itinerary.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ itineraries });
});

export const getItinerary = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!itinerary) {
    throw new AppError("Itinerary not found", 404);
  }

  res.json({ itinerary });
});

export const createShareLink = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!itinerary) {
    throw new AppError("Itinerary not found", 404);
  }

  itinerary.isPublic = true;
  await itinerary.save();

  const shareUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/share/${itinerary.shareToken}`;
  res.json({ shareUrl, shareToken: itinerary.shareToken });
});

export const updatePublicVisibility = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!itinerary) {
    throw new AppError("Itinerary not found", 404);
  }

  itinerary.isPublic = Boolean(req.body.isPublic);
  await itinerary.save();

  res.json({ itinerary });
});

export const createFromTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.body;
  const template = getTemplateById(templateId);

  if (!template) {
    throw new AppError("Destination template not found", 404);
  }

  const itineraryAi = await generateItinerary({
    destination: template.destination,
    startDate: "",
    endDate: "",
    budget: template.budget,
    travelerName: req.user.name,
    tripType: template.tripType,
    preferences: [template.promptNotes],
    notes: template.promptNotes,
    extractedText: template.promptNotes,
  });

  const itinerary = await Itinerary.create({
    user: req.user._id,
    title: `${template.title} Itinerary`,
    destination: template.destination,
    tripType: template.tripType,
    startDate: "",
    endDate: "",
    budget: template.budget,
    durationDays: template.durationDays,
    sourceDocuments: [],
    extractedData: {
      templateId: template.templateId,
      destination: template.destination,
      promptNotes: template.promptNotes,
    },
    itineraryDays: itineraryAi.itineraryDays.length ? itineraryAi.itineraryDays : template.itineraryDays,
    summary: itineraryAi.summary || template.summary,
    shareToken: nanoid(18),
    isPublic: false,
  });

  res.status(201).json({ itinerary });
});

export const generateFromForm = asyncHandler(async (req, res) => {
  const profile = req.body;

  if (!profile.destination) {
    throw new AppError("Destination is required", 400);
  }

  const itineraryAi = await generateItinerary(profile);

  const title = `${profile.destination} Itinerary`;

  const itinerary = await Itinerary.create({
    user: req.user._id,
    title,
    destination: profile.destination,
    tripType: profile.travelPace || "Balanced",
    startDate: "",
    endDate: "",
    budget: profile.budget === "luxury" ? 3 : profile.budget === "mid-range" ? 2 : 1,
    durationDays: profile.days || 3,
    sourceDocuments: [],
    extractedData: profile,
    itineraryDays: itineraryAi.itineraryDays,
    summary: itineraryAi.summary,
    shareToken: nanoid(18),
    isPublic: false,
  });

  res.status(201).json({ itinerary });
});

export const deleteItinerary = asyncHandler(async (req, res) => {
  const itinerary = await Itinerary.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!itinerary) {
    throw new AppError("Itinerary not found", 404);
  }

  res.json({ message: "Itinerary deleted successfully" });
});

export const searchItineraries = asyncHandler(async (req, res) => {
  const query = req.query.q || "";
  if (!query) return res.json({ itineraries: [] });

  const searchRegex = new RegExp(query, "i");

  // Find users whose name matches the query
  const matchedUsers = await mongoose.model("User").find({ name: searchRegex }).select("_id");
  const matchedUserIds = matchedUsers.map(u => u._id);

  // Allow searching public itineraries or current user's itineraries
  const itineraries = await Itinerary.find({
    $and: [
      {
        $or: [
          { isPublic: true },
          // If logged in, also search user's private itineraries
          ...(req.user ? [{ user: req.user._id }] : [])
        ]
      },
      {
        $or: [
          { destination: searchRegex },
          { title: searchRegex },
          { user: { $in: matchedUserIds } }
        ]
      }
    ]
  })
    .populate("user", "name")
    .limit(10)
    .sort({ createdAt: -1 });

  res.json({ itineraries });
});

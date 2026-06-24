import { nanoid } from "nanoid";
import { Itinerary } from "../models/Itinerary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { extractFromFile } from "../services/extractionService.js";
import { generateItinerary } from "../services/aiService.js";

export const analyzeUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("A booking file is required", 400);
  }

  const notes = req.body.notes || "";
  const fileData = await extractFromFile({
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    originalname: req.file.originalname,
    notes,
  });

  const itineraryAi = await generateItinerary({
    destination: fileData.destination,
    startDate: fileData.startDate,
    endDate: fileData.endDate,
    budget: fileData.budget,
    travelerName: fileData.travelerName,
    tripType: fileData.tripType,
    preferences: fileData.preferences,
    notes,
    extractedText: fileData.extractedText,
  });

  const shareToken = nanoid(18);
  const title = `${fileData.destination} ${fileData.tripType} Itinerary`;

  const itinerary = await Itinerary.create({
    user: req.user._id,
    title,
    destination: fileData.destination,
    tripType: fileData.tripType,
    startDate: fileData.startDate,
    endDate: fileData.endDate,
    budget: fileData.budget,
    sourceDocuments: [
      {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        extractedText: fileData.extractedText,
        uploadType: req.file.mimetype.startsWith("image/") ? "image" : "pdf",
      },
    ],
    extractedData: fileData,
    itineraryDays: itineraryAi.itineraryDays,
    summary: itineraryAi.summary,
    shareToken,
    isPublic: false,
  });

  res.status(201).json({
    itinerary,
    extractedData: fileData,
  });
});

export const extractUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("A booking file is required", 400);
  }

  const notes = req.body.notes || "";
  const fileData = await extractFromFile({
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    originalname: req.file.originalname,
    notes,
  });

  res.status(200).json({
    extractedData: fileData,
  });
});

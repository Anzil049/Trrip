import mongoose from "mongoose";

const daySchema = new mongoose.Schema(
  {
    day: Number,
    title: String,
    highlights: [String],
    meals: [String],
    transport: mongoose.Schema.Types.Mixed,
    notes: mongoose.Schema.Types.Mixed,
  },
  { _id: false },
);

const documentSchema = new mongoose.Schema(
  {
    originalName: String,
    mimeType: String,
    size: Number,
    extractedText: String,
    uploadType: String,
  },
  { _id: false },
);

const itinerarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    tripType: { type: String, default: "Leisure" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    durationDays: { type: Number, default: 3 },
    budget: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "ready", "shared"], default: "ready" },
    sourceDocuments: [documentSchema],
    extractedData: { type: Object, default: {} },
    itineraryDays: [daySchema],
    summary: { type: String, default: "" },
    shareToken: { type: String, default: "" },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Itinerary = mongoose.model("Itinerary", itinerarySchema);


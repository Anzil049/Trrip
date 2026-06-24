import pdf from "pdf-parse";
import { extractDetailsWithAI } from "./aiService.js";

const cleanWhitespace = (value) => value.replace(/\s+/g, " ").trim();

const pick = (text, patterns, fallback = "") => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanWhitespace(match[1]);
  }
  return fallback;
};

const dateFallback = () => {
  const date = new Date();
  return date.toISOString().slice(0, 10);
};

export const extractFromFile = async ({ buffer, mimetype, originalname, notes = "" }) => {
  let extractedText = "";

  if (mimetype === "application/pdf") {
    const parsed = await pdf(buffer);
    extractedText = parsed.text || "";
  } else if (mimetype.startsWith("image/")) {
    extractedText = `Image upload: ${originalname}. ${notes}`.trim();
  } else {
    extractedText = `${originalname}. ${notes}`.trim();
  }

  const normalized = cleanWhitespace(`${extractedText} ${notes}`.trim());
  const lower = normalized.toLowerCase();

  // Call AI for intelligent multimodal extraction
  const aiData = (process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY) ? await extractDetailsWithAI(normalized, buffer, mimetype) : {};

  const destination =
    aiData.destination ||
    pick(normalized, [/destination[:\s]+([A-Za-z0-9 ,.-]+)/i], "") ||
    pick(normalized, [/to[:\s]+([A-Za-z0-9 ,.-]+)/i], "") ||
    (lower.includes("delhi") ? "Delhi, India" : "") ||
    (lower.includes("jaipur") ? "Jaipur, India" : "") ||
    (lower.includes("goa") ? "Goa, India" : "") ||
    (lower.includes("kerala") ? "Kerala, India" : "") ||
    (lower.includes("udaipur") ? "Udaipur, India" : "") ||
    (lower.includes("varanasi") ? "Varanasi, India" : "") ||
    (lower.includes("leh") ? "Leh-Ladakh, India" : "") ||
    (lower.includes("mumbai") ? "Mumbai, India" : "") ||
    "Unknown destination";

  const startDate =
    aiData.startDate ||
    pick(normalized, [/depart(?:ure)?[:\s]+([A-Za-z0-9, /-]+)/i], "") ||
    pick(normalized, [/check[-\s]?in[:\s]+([A-Za-z0-9, /-]+)/i], "") ||
    dateFallback();

  const endDate =
    pick(normalized, [/return[:\s]+([A-Za-z0-9, /-]+)/i], "") ||
    pick(normalized, [/check[-\s]?out[:\s]+([A-Za-z0-9, /-]+)/i], "") ||
    "";

  const budget =
    aiData.budget ||
    Number(
      (pick(normalized, [/\$([0-9,]+(?:\.[0-9]+)?)/], "0") || "0").replace(/,/g, ""),
    ) || 0;

  const travelerName =
    pick(normalized, [/passenger[:\s]+([A-Za-z ,.'-]+)/i], "") ||
    pick(normalized, [/guest[:\s]+([A-Za-z ,.'-]+)/i], "") ||
    "";

  const tripType = lower.includes("hotel")
    ? "Accommodation"
    : lower.includes("flight")
      ? "Flight"
      : lower.includes("train") || lower.includes("bus")
        ? "Ground transport"
        : "Leisure";

  return {
    extractedText: normalized,
    destination,
    startDate,
    endDate,
    budget,
    travelers: aiData.travelers || "",
    transport: aiData.transport || "",
    notes: aiData.notes || "",
    travelerName,
    tripType,
    durationDays: 3,
    preferences: inferPreferences(lower),
    rawSourceLabel: originalname,
  };
};

const inferPreferences = (lowerText) => {
  const preferences = [];
  if (lowerText.includes("business")) preferences.push("Business friendly");
  if (lowerText.includes("family")) preferences.push("Family trip");
  if (lowerText.includes("luxury")) preferences.push("Luxury stay");
  if (lowerText.includes("food")) preferences.push("Food focused");
  if (lowerText.includes("adventure")) preferences.push("Adventure");
  if (!preferences.length) preferences.push("Balanced schedule");
  return preferences;
};

/* ------------------------------------------------------------------ */
/*  Groq AI Service (primary) with Gemini fallback                    */
/* ------------------------------------------------------------------ */

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_TEXT_MODEL = "llama-3.3-70b-versatile";
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
];

/* ------------------------------------------------------------------ */
/*  Fallback builders (used when AI is unavailable)                   */
/* ------------------------------------------------------------------ */

const buildFallbackDays = (profile) => {
  const destination = profile.destination || "your destination";
  const days = [];

  days.push({
    day: 1,
    title: "Arrival and settle in",
    highlights: [
      `Check in and recover from travel.`,
      `Take a gentle neighborhood walk around ${destination}.`,
      `Confirm local transport and ticket reservations.`,
    ],
    meals: ["Airport or hotel breakfast", "Light local lunch", "Relaxed dinner"],
    transport: "Private transfer or taxi",
    notes: "Keep the first day light to absorb any delays.",
  });

  days.push({
    day: 2,
    title: "Core city experience",
    highlights: [
      `Visit the headline attractions in ${destination}.`,
      `Reserve a lunch stop near the main sightseeing zone.`,
      `Capture a few itinerary anchors for the rest of the trip.`,
    ],
    meals: ["Hotel breakfast", "Lunch near attractions", "Local dinner"],
    transport: "Metro, rideshare, or guided walking",
    notes: "This is the best day for timed entries and museums.",
  });

  days.push({
    day: 3,
    title: "Flexible buffer day",
    highlights: [
      "Use this day for shopping, a short excursion, or weather backup.",
      "Review your return booking and pack early.",
      "Leave room for a final dinner or night stroll.",
    ],
    meals: ["Breakfast with a slow start", "Casual lunch", "Farewell dinner"],
    transport: "Local transit",
    notes: "A flexible day makes the itinerary feel premium, not packed.",
  });

  return days;
};

const buildFallbackSummary = (profile) =>
  `AI-generated itinerary for ${profile.destination}. Built from the uploaded booking details and tuned for a ${(profile.tripType || profile.travelPace || "balanced").toLowerCase()} trip.`;

/* ------------------------------------------------------------------ */
/*  Groq helper (OpenAI-compatible API)                               */
/* ------------------------------------------------------------------ */

const callGroq = async (messages, { model = GROQ_TEXT_MODEL, temperature = 0.7, maxTokens = 4000, jsonMode = true } = {}) => {
  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode && { response_format: { type: "json_object" } }),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq ${response.status}: ${err.substring(0, 300)}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content || "{}";
};

/* ------------------------------------------------------------------ */
/*  Gemini helper (fallback)                                          */
/* ------------------------------------------------------------------ */

const callGemini = async (parts, { temperature = 0.7, maxTokens = 4000 } = {}) => {
  const payload = JSON.stringify({
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      responseMimeType: "application/json",
    },
  });

  for (const modelName of GEMINI_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    let retries = 2;
    while (retries > 0) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });

        if (response.ok) {
          const json = await response.json();
          const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim() || "{}";
          let clean = text;
          if (clean.startsWith("```json")) clean = clean.substring(7);
          else if (clean.startsWith("```")) clean = clean.substring(3);
          if (clean.endsWith("```")) clean = clean.substring(0, clean.length - 3);
          return clean.trim();
        }

        if (response.status === 429 || response.status === 503) {
          retries--;
          if (retries > 0) {
            console.warn(`Gemini (${modelName}) ${response.status}. Retrying in 2s...`);
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
        }
        const errText = await response.text();
        console.warn(`Gemini (${modelName}) failed ${response.status}:`, errText.substring(0, 200));
        break;
      } catch (e) {
        console.warn(`Gemini (${modelName}) network error:`, e.message);
        break;
      }
    }
  }

  throw new Error("Gemini: all models exhausted");
};

/* ------------------------------------------------------------------ */
/*  Generate itinerary – Groq → Gemini → Fallback                    */
/* ------------------------------------------------------------------ */

export const generateItinerary = async (profile) => {
  const systemPrompt = [
    "You are a world-class travel planner AI.",
    "Your itineraries must be extremely comprehensive. Include specific places to visit, hotels, exact names of recommended restaurants, detailed activities, and localized tips.",
    "CRITICAL: You must provide ALL details as point-by-point bullet lists (arrays of strings). Do NOT write long paragraphs.",
    "For 'notes', provide deep, insightful local advice such as opening hours, ticket booking tips, hotels, or cultural norms.",
    'Return ONLY valid JSON with this exact shape: {"summary": string, "itineraryDays": [{"day": number, "title": string, "highlights": string[], "activities": [{"time": string, "details": string}], "meals": string[], "transport": string[], "notes": string[]}]}',
  ].join("\n\n");

  const userPrompt = `Build a structured, highly detailed travel itinerary from this profile:\n${JSON.stringify(profile, null, 2)}`;

  let raw = null;

  // Try Groq first (14,400 free requests/day!)
  if (process.env.GROQ_API_KEY) {
    try {
      console.log("Trying Groq for itinerary generation...");
      raw = await callGroq(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        { temperature: 0.7, maxTokens: 4000 }
      );
      console.log("Groq itinerary generated successfully.");
    } catch (e) {
      console.warn("Groq failed:", e.message);
    }
  }

  // Fall back to Gemini
  if (!raw && process.env.GEMINI_API_KEY) {
    try {
      console.log("Trying Gemini for itinerary generation...");
      raw = await callGemini(
        [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        { temperature: 0.7, maxTokens: 4000 }
      );
      console.log("Gemini itinerary generated successfully.");
    } catch (e) {
      console.warn("Gemini failed:", e.message);
    }
  }

  if (!raw) {
    console.warn("All AI providers failed. Using fallback template.");
    return { summary: buildFallbackSummary(profile), itineraryDays: buildFallbackDays(profile) };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      summary: parsed.summary || buildFallbackSummary(profile),
      itineraryDays: Array.isArray(parsed.itineraryDays) ? parsed.itineraryDays : buildFallbackDays(profile),
    };
  } catch {
    console.error("Failed to parse AI response. Using fallback.");
    return { summary: buildFallbackSummary(profile), itineraryDays: buildFallbackDays(profile) };
  }
};

/* ------------------------------------------------------------------ */
/*  Extract details from uploaded document – Groq → Gemini → empty    */
/* ------------------------------------------------------------------ */

export const extractDetailsWithAI = async (text, buffer = null, mimetype = null) => {
  const extractionPrompt = [
    "Extract the following travel details from this booking document.",
    "The 'destination' MUST be the pure geographic arrival city name ONLY (e.g., 'Rio de Janeiro', 'Dubai'). Do NOT include airport codes (like '(GIG)') or countries.",
    "Ignore warning labels or instructions like 'provide PNR'.",
    "Count the number of passengers to determine 'travelers'. 1 = 'solo', 2 = 'couple', 3+ = 'family'.",
    "Extract the transportation mode as 'transport' (e.g., 'flight', 'train', 'bus').",
    "Extract any special instructions, PNR, or booking reference into 'notes'.",
    'Return ONLY valid JSON: {"destination": "City Name", "startDate": "YYYY-MM-DD", "budget": "mid-range", "travelers": "solo", "transport": "flight", "notes": ""}',
    "If any field cannot be found, return an empty string.",
    "",
    "Text context:",
    text,
  ].join("\n");

  let raw = null;

  // Try Groq first (supports vision with llama-3.2-11b-vision-preview)
  if (process.env.GROQ_API_KEY) {
    try {
      const isImage = buffer && mimetype && mimetype.startsWith("image/");
      const content = [];

      if (isImage) {
        content.push({
          type: "image_url",
          image_url: { url: `data:${mimetype};base64,${buffer.toString("base64")}` },
        });
      }
      content.push({ type: "text", text: extractionPrompt });

      raw = await callGroq(
        [
          { role: "system", content: "You are a travel document parser. Extract travel details accurately." },
          { role: "user", content },
        ],
        {
          model: isImage ? GROQ_VISION_MODEL : GROQ_TEXT_MODEL,
          temperature: 0.1,
          maxTokens: 300,
          jsonMode: !isImage, // vision model doesn't support json_object mode
        }
      );
      console.log("Groq extraction succeeded.");
    } catch (e) {
      console.warn("Groq extraction failed:", e.message);
    }
  }

  // Fall back to Gemini
  if (!raw && process.env.GEMINI_API_KEY) {
    try {
      const parts = [];
      if (buffer && mimetype) {
        parts.push({ inlineData: { mimeType: mimetype, data: buffer.toString("base64") } });
      }
      parts.push({ text: extractionPrompt });

      raw = await callGemini(parts, { temperature: 0.1, maxTokens: 300 });
      console.log("Gemini extraction succeeded.");
    } catch (e) {
      console.warn("Gemini extraction failed:", e.message);
    }
  }

  if (!raw) {
    return { destination: "", startDate: "", budget: "mid-range" };
  }

  try {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(raw.substring(firstBrace, lastBrace + 1));
    }
    return JSON.parse(raw);
  } catch {
    console.error("Failed to parse AI extraction response.");
    return { destination: "", startDate: "", budget: "mid-range" };
  }
};

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

export const generateItinerary = async (profile) => {
  if (process.env.GEMINI_API_KEY) {
    return generateWithGemini(profile);
  }

  return {
    summary: buildFallbackSummary(profile),
    itineraryDays: buildFallbackDays(profile),
  };
};

const generateWithGemini = async (profile) => {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const payload = JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "Your itineraries must be extremely comprehensive. Include specific places to visit, hotels, exact names of recommended restaurants, detailed activities, and localized tips.",
              "CRITICAL: You must provide ALL details as point-by-point bullet lists (arrays of strings). Do NOT write long paragraphs.",
              "For 'notes', provide deep, insightful local advice such as opening hours, ticket booking tips, hotels, or cultural norms.",
              "Return ONLY valid JSON with this exact shape: {\"summary\": string, \"itineraryDays\": [{\"day\": number, \"title\": string, \"highlights\": string[], \"activities\": [{\"time\": string, \"details\": string}], \"meals\": string[], \"transport\": string[], \"notes\": string[]}]}",
              `Build a structured, highly detailed travel itinerary from this profile:\n${JSON.stringify(profile, null, 2)}`,
            ].join("\n\n"),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4000,
      responseMimeType: "application/json",
    },
  });

  const fallbackModels = [
    process.env.GEMINI_MODEL || "gemini-3.5-flash",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];

  let response;
  let successModel = null;

  for (const modelName of fallbackModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    let retries = 2;
    while (retries > 0) {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      if (response.ok) {
        successModel = modelName;
        break;
      }
      
      if (response.status === 503 || response.status === 429) {
        retries--;
        if (retries > 0) {
          console.warn(`Gemini (${modelName}) ${response.status}. Retrying in 2 seconds...`);
          await new Promise((res) => setTimeout(res, 2000));
          continue;
        }
      } else {
        break; // break retry loop for 400s etc
      }
    }
    
    if (successModel) break; // found a working model
    console.warn(`Model ${modelName} failed, falling back to next...`);
  }

  if (!response || !response.ok) {
    const errorText = response ? await response.text() : "No response";
    const status = response ? response.status : 500;
    console.error("Gemini API Error (All models exhausted):", status, errorText);
    
    if (status === 429) {
      throw new Error("API Rate limit exceeded on all models. Please wait a minute and try again.");
    } else if (status === 503) {
      throw new Error("Google's AI servers are completely overloaded right now. Please try again later.");
    }
    throw new Error("Failed to generate itinerary with AI. Please try again.");
  }

  const json = await response.json();
  const text =
    json?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || "";

  let cleanText = text;
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  cleanText = cleanText.trim();

  try {
    const parsed = JSON.parse(cleanText);
    return {
      summary: parsed.summary || buildFallbackSummary(profile),
      itineraryDays: Array.isArray(parsed.itineraryDays) ? parsed.itineraryDays : buildFallbackDays(profile),
    };
  } catch (err) {
    console.error("Failed to parse AI response:", err);
    console.warn("Falling back to standard template due to JSON parse error.");
    return {
      summary: buildFallbackSummary(profile),
      itineraryDays: buildFallbackDays(profile),
    };
  }
};

export const extractDetailsWithAI = async (text, buffer = null, mimetype = null) => {
  const fallbackModels = [
    process.env.GEMINI_MODEL || "gemini-3.5-flash",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];

  const parts = [];
  
  if (buffer && mimetype) {
    parts.push({
      inlineData: {
        mimeType: mimetype,
        data: buffer.toString("base64")
      }
    });
  }

  parts.push({
    text: [
      "Extract the following travel details from this booking document.",
      "Return ONLY valid JSON with this exact shape: {\"destination\": \"City, Country\", \"startDate\": \"YYYY-MM-DD\", \"budget\": number}",
      "If any field cannot be found, return an empty string for text or 0 for numbers.",
      "Text context (if any):",
      text
    ].join("\n")
  });

  const payload = JSON.stringify({
    contents: [{
      role: "user",
      parts: parts
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 200,
      responseMimeType: "application/json",
    }
  });

  for (const modelName of fallbackModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    let retries = 2;
    let successModel = false;

    while (retries > 0) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });

        if (response.ok) {
          successModel = true;
          const json = await response.json();
          const responseText = json?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
          let cleanText = responseText;
          const firstBrace = responseText.indexOf('{');
          const lastBrace = responseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
            cleanText = responseText.substring(firstBrace, lastBrace + 1);
          } else {
            cleanText = "{}";
          }
          
          try {
            return JSON.parse(cleanText.trim());
          } catch (parseError) {
            console.error(`AI Extraction JSON parse failed for ${modelName}. Response:`, responseText);
            break;
          }
        } else {
          if (response.status === 503 || response.status === 429) {
            retries--;
            if (retries > 0) {
              console.warn(`Gemini (${modelName}) ${response.status}. Retrying in 2 seconds...`);
              await new Promise((res) => setTimeout(res, 2000));
              continue;
            }
          }
          const errorText = await response.text();
          console.error(`AI Extraction API failed for ${modelName} with status ${response.status}:`, errorText);
          break; // break retry loop for 400s etc
        }
      } catch (e) {
        console.error(`AI Extraction network error for ${modelName}:`, e);
        break; // break retry loop on network error
      }
    }
  }

  return { destination: "", startDate: "", budget: 0 };
};



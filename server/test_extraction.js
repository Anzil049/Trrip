import fs from "fs";
import { extractDetailsWithAI } from "./src/services/aiService.js";
import dotenv from "dotenv";

dotenv.config();

const test = async () => {
  try {
    const aiData = await extractDetailsWithAI("Avianca Miami (MIA) -> Rio de Janeiro (GIG) 19 Jul, 2020", null, null);
    console.log("Result:", aiData);
  } catch (e) {
    console.error("Error:", e);
  }
};

test();

import dotenv from "dotenv";

dotenv.config();

const test = async () => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const json = await response.json();
    console.log(json.models.map(m => m.name));
  } catch (e) {
    console.error("Error:", e);
  }
};

test();

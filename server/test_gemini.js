import dotenv from "dotenv";
dotenv.config();

const test = async () => {
  const models = ["gemini-3.5-flash", "gemini-2.0-flash", "gemini-pro-latest"];
  for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    console.log(`Testing ${model}...`);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Write a 2 sentence travel summary of Paris." }] }]
      })
    });
    
    if (!response.ok) {
      console.log(`${model} failed with ${response.status}`);
    } else {
      console.log(`${model} success!`);
    }
  }
};

test();

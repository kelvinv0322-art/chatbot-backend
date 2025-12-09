import OpenAI from "openai";

// ---- Helper: Manually parse JSON body (required on Vercel Serverless) ----
async function parseJSONBody(req) {
  return new Promise((resolve) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk.toString();
    });

    req.on("end", () => {
      console.log("🔥 RAW BODY RECEIVED:", raw);

      if (!raw) return resolve({});

      try {
        const json = JSON.parse(raw);
        console.log("✅ PARSED JSON BODY:", json);
        resolve(json);
      } catch (err) {
        console.log("❌ JSON PARSE ERROR:", err);
        resolve({});
      }
    });
  });
}

export default async function handler(req, res) {
  // ---- CORS ----
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  console.log("🔥 REQ METHOD:", req.method);
  console.log("🔥 REQ HEADERS:", req.headers);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST method." });
  }

  // ---- Parse request body ----
  const body = await parseJSONBody(req);

  // ---- Validate body ----
  if (!body.messages || !Array.isArray(body.messages)) {
    console.log("❌ INVALID BODY RECEIVED:", body);
    return res.status(400).json({ error: "Invalid messages format." });
  }

  console.log("✅ VALID MESSAGES RECEIVED:", body.messages);

  try {
    // ---- GPT CALL ----
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: body.messages,
      temperature: 0.6,
    });

    console.log("✅ GPT RESPONSE:", completion.choices);

    return res.status(200).json({
      choices: completion.choices,
    });

  } catch (err) {
    console.log("💥 GPT ERROR:", err);
    return res.status(500).json({
      error: "OpenAI request failed",
      detail: err.message,
    });
  }
}

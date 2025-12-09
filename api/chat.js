import OpenAI from "openai";

// ---- Manual body parser for Vercel Serverless Functions ----
async function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (err) {
        reject(err);
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  try {
    // ---- Parse JSON body manually ----
    const body = await getBody(req);
    console.log("REQ BODY:", body);

    if (!body.messages || !Array.isArray(body.messages)) {
      return res.status(400).json({ error: "Invalid messages format." });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: body.messages,
      temperature: 0.7,
    });

    return res.status(200).json({
      choices: completion.choices,
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      error: "Server crashed",
      detail: err.message,
    });
  }
}

import OpenAI from "openai";

export default async function handler(req, res) {
  // --- CORS FIX ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // -----------------

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "No messages provided." });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.4,
    });

    return res.status(200).json({
      reply: completion.choices[0].message,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("❌ OPENAI_API_KEY is missing in server environment");
      return res.status(500).json({ error: "Server missing API credentials." });
    }

    let body;

    try {
      body = await req.json(); // Required for Vercel Serverless
    } catch {
      return res.status(400).json({ error: "Invalid JSON body." });
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      return res.status(400).json({ error: "Invalid messages format." });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: body.messages,
      }),
    });

    const data = await openaiRes.json();

    return res.status(200).json(data);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

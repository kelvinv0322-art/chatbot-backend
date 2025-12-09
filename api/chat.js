export default async function handler(req, res) {
  // --- CORS FIX ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Fixes 405 on preflight
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

  try {
    // --- LOAD API KEY ---
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ API key missing in server environment");
      return res.status(500).json({ error: "Server missing OpenAI API key" });
    }

    // --- PARSE JSON BODY ---
    const body = req.body;

    console.log("REQ BODY:", body);

    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return res.status(400).json({ error: "Invalid messages format." });
    }

    // --- CALL OPENAI ---
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: body.messages
      })
    });

    const data = await aiRes.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

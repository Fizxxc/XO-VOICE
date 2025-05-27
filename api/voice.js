export default async function handler(req, res) {
  const { text } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "OpenAI API key not configured." });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: text }],
        temperature: 0.7
      })
    });

    const result = await openaiRes.json();
    const reply = result.choices?.[0]?.message?.content || "No reply from AI.";

    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ reply: "Failed to fetch response from AI." });
  }
}

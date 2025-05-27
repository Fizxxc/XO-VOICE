export default async function handler(req, res) {
  const { text } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "API key belum dikonfigurasi di environment Vercel." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Kamu adalah XO AI V2.1, asisten pintar berbicara dengan suara ramah dan informatif." },
          { role: "user", content: text }
        ],
        temperature: 0.7
      })
    });

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content?.trim() || "XO AI tidak dapat memberikan jawaban.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ reply: "Terjadi kesalahan saat memproses jawaban." });
  }
}

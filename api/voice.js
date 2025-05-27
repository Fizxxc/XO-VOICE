export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No input text provided' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Project': process.env.OPENAI_PROJECT_ID // opsional, jika kamu menggunakannya
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // gunakan model 4o-mini
        messages: [
          { role: "system", content: "You are XO AI, a friendly and helpful assistant." },
          { role: "user", content: text }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI Error:", data);
      return res.status(500).json({
        error: data.error?.message || "Terjadi kesalahan saat memproses jawaban XO AI."
      });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Gagal terhubung ke XO AI." });
  }
}

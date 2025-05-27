export default async function handler(req, res) {
  const { text } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  const projectId = process.env.OPENAI_PROJECT_ID;

  if (!apiKey || !projectId) {
    return res.status(500).json({ reply: "API key atau Project ID belum dikonfigurasi di environment Vercel." });
  }

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ reply: "Permintaan tidak valid. Harap kirimkan input suara yang benar." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Project": projectId // <- ini wajib untuk API key proj
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Kamu adalah XO AI V2.1, asisten pintar yang merespons dengan suara ramah dan informatif." },
          { role: "user", content: text }
        ],
        temperature: 0.7
      })
    });

    const result = await response.json();

    if (!response.ok || !result.choices) {
      throw new Error(result.error?.message || "Gagal mendapatkan balasan dari OpenAI.");
    }

    const reply = result.choices[0].message.content.trim();
    res.status(200).json({ reply });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ reply: "Terjadi kesalahan saat memproses jawaban XO AI." });
  }
}

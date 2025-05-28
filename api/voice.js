export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode tidak diizinkan' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Teks input tidak valid' });
  }

  try {
    // Langkah 1: Dapatkan respons dari GPT
    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o", // atau "gpt-4o-mini"
        messages: [
          { role: "system", content: "Kamu adalah XO AI, asisten cerdas yang ramah dan menjawab dalam bahasa Indonesia." },
          { role: "user", content: text }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const chatData = await chatRes.json();

    if (!chatRes.ok || !chatData.choices?.length) {
      console.error("OpenAI Chat Error:", chatData);
      return res.status(500).json({ error: chatData.error?.message || 'Gagal mendapatkan jawaban dari XO AI.' });
    }

    const reply = chatData.choices[0].message.content.trim();

    // Langkah 2: Ubah jawaban menjadi audio menggunakan TTS
    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "tts-1", // atau "tts-1-hd"
        input: reply,
        voice: "nova" // bisa diubah ke shimmer, echo, alloy, fable, onyx
      })
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.json();
      console.error("OpenAI TTS Error:", err);
      return res.status(500).json({ error: err.error?.message || "Gagal menghasilkan suara dari XO AI." });
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    res.status(200).json({ reply, audio: `data:audio/mpeg;base64,${audioBase64}` });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server XO AI.' });
  }
}

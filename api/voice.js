export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No input text provided' });
  }

  try {
    // 1. Minta jawaban teks dari GPT
    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        ...(process.env.OPENAI_PROJECT_ID && {
          'OpenAI-Project': process.env.OPENAI_PROJECT_ID
        })
      },
      body: JSON.stringify({
        model: "gpt-4o", // atau gpt-4o-mini jika ingin versi lebih ringan
        messages: [
          { role: "system", content: "You are XO AI, a friendly and helpful assistant." },
          { role: "user", content: text }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    const chatData = await chatRes.json();

    if (!chatRes.ok) {
      console.error("OpenAI Chat Error:", chatData);
      return res.status(500).json({ error: chatData.error?.message || 'Gagal mendapatkan respon dari XO AI.' });
    }

    const reply = chatData.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(500).json({ error: "XO AI tidak memberikan jawaban." });
    }

    // 2. Buat suara dari balasan GPT
    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        ...(process.env.OPENAI_PROJECT_ID && {
          'OpenAI-Project': process.env.OPENAI_PROJECT_ID
        })
      },
      body: JSON.stringify({
        model: "tts-1", // atau "tts-1-hd"
        input: reply,
        voice: "nova" // bisa juga shimmer, echo, alloy, fable
      })
    });

    if (!ttsRes.ok) {
      const ttsErr = await ttsRes.json();
      console.error("TTS Error:", ttsErr);
      return res.status(500).json({ error: ttsErr.error?.message || "Gagal menghasilkan suara dari XO AI." });
    }

    const arrayBuffer = await ttsRes.arrayBuffer();
    const audioBase64 = Buffer.from(arrayBuffer).toString("base64");
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    return res.status(200).json({ reply, audio: audioDataUrl });

  } catch (err) {
    console.error("Unexpected Server Error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan internal di server." });
  }
}

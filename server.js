import express from "express";
import OpenAI from "openai";
import "dotenv/config";

const app = express();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let conversationHistory = [];

app.use(express.json());
app.use(express.static("."));

app.post("/api/chat", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 2) {
      return res.status(400).json({ error: "Bana bir şey yazmalısın." });
    }

    conversationHistory.push({
      role: "user",
      content: text
    });

    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    const messages = [
      {
        role: "system",
        content: "Sen samimi, zeki ve arkadaş canlısı bir AI'sın. Kullanıcıyla doğal konuş."
      },
      ...conversationHistory
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages
    });

    const answer = completion.choices[0].message.content;

    conversationHistory.push({
      role: "assistant",
      content: answer
    });

    res.json({ answer });

  } catch (error) {
    console.error("HATA:", error.message);
    res.status(500).json({ error: "AI cevap verirken hata oluştu." });
  }
});

app.listen(3000, () => {
  console.log("Man Of Letters hafızalı çalışıyor");
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Support both env var names so you don’t have to rename your .env
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: OPENAI_KEY });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5000",
      "http://localhost:5001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5001",
    ],
  })
);

// Health check route
app.get("/", (_req, res) => res.send("OK"));

// Recipe endpoint
app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).send("missing prompt");
    }

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",   // 🔒 locked to mini
      messages: [
        { role: "system", content: "You are a helpful recipe generator. Provide concise, realistic recipes." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const text = resp.choices?.[0]?.message?.content?.trim() || "";
    return res.send(text); // frontend already expects plain text
  } catch (err) {
    const status = err?.status || err?.response?.status || 500;
    console.error("OpenAI error:", status, err?.response?.data || err);
    if (status === 429) {
      return res.status(429).json({
        error: "quota",
        message:
          "Your OpenAI quota is exhausted. Please add billing or use a key with credits.",
      });
    }
    return res.status(500).json({ error: "upstream", message: "Server error." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}, using gpt-4o-mini`);
});


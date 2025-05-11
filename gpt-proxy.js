const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-3.5-turbo";

app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    const data = await response.json();
    console.log("Réponse OpenAI :", data);

    if (data.choices && data.choices.length > 0) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "Pas de réponse de l'IA." });
    }
  } catch (error) {
    console.error("Erreur proxy GPT :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur GPT Proxy actif sur le port ${PORT}`);
});

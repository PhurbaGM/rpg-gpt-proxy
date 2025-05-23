const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

const contextPath = path.join(__dirname, "Data", "game-context.txt");
let gameContext = "";

try {
  gameContext = fs.readFileSync(contextPath, "utf8");
  console.log("Contexte du jeu chargé.");
} catch (err) {
  console.error("Erreur lors du chargement du contexte :", err.message);
}

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message requis." });
  }

  const fullPrompt = `${gameContext}\n\nJoueur : ${userMessage}`;

  try {
    const response = await axios.post(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        model: "accounts/fireworks/models/mixtral-8x22b-instruct", // ou llama-3-70b
        messages: [
          {
            role: "system",
            content: `You are the AI interface of a futuristic mother-ship named Hammaël.  
Always respond in fluent and immersive English, using a tone appropriate for a science-fiction adventure.  
Keep your answers concise (2 to 3 sentences maximum), and never reply in French, even if the user's question is in French.  
You may use modern expressions if they are widely understandable and in-universe.  
Stay in character as the ship’s AI and maintain a consistent personality.`
          },
          { role: "user", content: fullPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ reply: response.data.choices[0].message.content.trim() });

  } catch (err) {
    console.error("Erreur API :", err.response?.data || err.message);
    res.status(500).json({ error: "Erreur API" });
  }
});

app.listen(port, () => {
  console.log(`Serveur GPT Proxy actif sur le port ${port}`);
});

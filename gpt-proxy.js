const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

// Lire le contexte du jeu au démarrage
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
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Tu es un personnage du jeu Les Chroniques d'Hammaël." },
          { role: "user", content: fullPrompt },
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ response: response.data.choices[0].message.content.trim() });
  } catch (err) {
    console.error("Erreur API :", err.response?.data || err.message);
    res.status(500).json({ error: "Erreur API" });
  }
});

app.listen(port, () => {
  console.log(`Serveur GPT Proxy actif sur le port ${port}`);
});

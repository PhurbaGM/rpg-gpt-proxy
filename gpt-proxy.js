// gpt-proxy.js
const fs = require('fs');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Chargement du contexte
const context = fs.readFileSync('./game-context.txt', 'utf-8');

// Traitement des requêtes utilisateur
app.post('/ask', async (req, res) => {
  const userMessage = req.body.message;

  const fullPrompt = [
    { role: "system", content: context },
    { role: "user", content: userMessage }
  ];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: fullPrompt,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Erreur API' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur GPT Proxy actif sur le port ${PORT}`);
});

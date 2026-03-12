const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Remplacez par votre clé API Gemini dans un fichier .env ou ici directement
const API_KEY = process.env.GEMINI_API_KEY || "VOTRE_CLE_API_GEMINI";
const genAI = new GoogleGenerativeAI(API_KEY);

app.post('/api/solve', async (req, res) => {
    try {
        const { subject, prompt } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const fullPrompt = `Tu es un expert en enseignement niveau Terminale (France). 
        Sujet: ${subject}. 
        Exercice: ${prompt}.
        
        Tu DOIS répondre impérativement selon ce plan :
        1. ÉNONCÉ RECOPIÉ : (Le texte original)
        2. DONNÉES : (Extraire les variables et informations clés)
        3. MÉTHODE : (Expliquer la stratégie de résolution)
        4. CALCULS / DÉVELOPPEMENT : (Détailler toutes les étapes mathématiques ou argumentatives)
        5. RÉSULTAT FINAL : (La réponse précise encadrée)
        6. EXPLICATION SIMPLE : (Vulgariser le concept pour l'élève)`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        res.json({ success: true, answer: response.text() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Erreur lors de la génération." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));

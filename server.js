// server.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors'); // Necesario para permitir llamadas desde React
require('dotenv').config(); // Para leer variables de entorno

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS: Permite llamadas desde CUALQUIER origen (*), 
// lo cual es necesario para que React pueda comunicarse.
app.use(cors()); 

// Middleware para leer datos JSON en las peticiones
app.use(express.json());

// ----------------------------------------------------
// RUTAS
// ----------------------------------------------------

// Ruta principal (solo para verificar que el servidor está activo)
app.get('/', (req, res) => {
    res.send('Servidor Express del Chef activo y funcionando.');
});

// Ruta segura para la comunicación con Gemini
app.post('/api/chat', async (req, res) => {
    // La clave API es leída de forma segura desde las variables de entorno de Render
    const apiKey = process.env.GEMINI_API_KEY; 
    const userMessage = req.body.message;

    if (!apiKey) {
        return res.status(500).json({ error: "Clave API no configurada en el servidor (Render.com)." });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }],
                config: {
                     systemInstruction: { parts: [{ text: "Eres un chef experto llamado Sabor Expres. Responde solo sobre cocina, recetas y alimentos. Sé amable y usa emojis y habla siempre en español." }] }
                }
            })
        });

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        res.status(200).json({ reply: text });
        
    } catch (error) {
        console.error("Error en la conexión con Gemini:", error);
        res.status(500).json({ error: "Error de conexión del servidor seguro con Gemini." });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});

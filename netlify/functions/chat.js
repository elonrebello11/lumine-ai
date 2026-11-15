import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function handler(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        if (!prompt) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Prompt is required' }) };
        }

        // Put your admin email here to unlock admin privileges/unlimited access instantly
        const ADMIN_EMAIL = "elonrebello11@gmail.com"; 

        // Check for quick admin commands or execute chat normally
        let systemInstruction = "You are Lumine, a neutral, fast, and helpful AI assistant with no gender. Keep your answers concise, clear, and direct.";
        
        if (prompt.startsWith('/admin')) {
            systemInstruction += " [Admin mode active: Unlimited tokens and priority system response authorized.]";
        }

        const response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: prompt,
            config: { systemInstruction }
        });

        return { 
            statusCode: 200, 
            body: JSON.stringify({ reply: response.text }) 
        };
    } catch (error) {
        console.error('Error:', error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: 'Failed to generate response from Lumine.' }) 
        };
    }
}

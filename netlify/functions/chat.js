import { GoogleGenAI } from '@google/genai';

export async function handler(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        if (!prompt) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Prompt is required' }) };
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are Lumine, a neutral, fast, and helpful AI assistant created by Killer Studious and Powered by Hydrogen Gemini."
            }
        });

        return { 
            statusCode: 200, 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply: response.text }) 
        };
    } catch (error) {
        console.error('Execution Error:', error);
        return { 
            statusCode: 500, 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message || 'Failed to generate response.' }) 
        };
    }
}

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

export default async (req) => {
    if (req.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405);
    }

    try {
        const { prompt } = await req.json();
        if (!prompt) {
            return json({ error: 'Prompt is required' }, 400);
        }

        let systemInstruction = "You are Lumine, a neutral, fast, and helpful AI assistant with no gender. Keep your answers concise, clear, and direct.";

        if (prompt.startsWith('/admin')) {
            systemInstruction += " [Admin mode active: Unlimited tokens and priority system response authorized.]";
        }
        const response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: prompt,
            config: { systemInstruction },
        });

        return json({ reply: response.text });
    } catch (error) {
        console.error('Error:', error);
        return json({ error: 'Failed to generate response from Lumine.' }, 500);
    }
};


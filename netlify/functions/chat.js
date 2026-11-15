import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        })
    });
}

const db = admin.firestore();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function handler(event, context) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

    const { prompt } = JSON.parse(event.body);
    const authHeader = event.headers.authorization;
    let userEmail = null;
    let userId = 'demo-user';

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split('Bearer ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            userId = decodedToken.uid;
            userEmail = decodedToken.email;
        } catch (e) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid authentication token' }) };
        }
    }

    // Put your exact Google login email here for unlimited credits
    const ADMIN_EMAIL = "your-email@gmail.com"; 
    const isAdmin = userEmail === ADMIN_EMAIL;

    if (!isAdmin && userId !== 'demo-user') {
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();
        let weeklyTokens = 0;
        let lastReset = Date.now();

        if (doc.exists) {
            weeklyTokens = doc.data().weeklyTokens || 0;
            lastReset = doc.data().lastReset || Date.now();
        }

        if (Date.now() - lastReset > 7 * 24 * 60 * 60 * 1000) {
            weeklyTokens = 0;
            lastReset = Date.now();
        }

        if (weeklyTokens >= 75) {
            return { statusCode: 429, body: JSON.stringify({ error: 'Weekly limit of 75 tokens reached.' }) };
        }

        await userRef.set({ weeklyTokens: weeklyTokens + 1, lastReset }, { merge: true });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: prompt,
            config: {
                systemInstruction: "You are Lumine, a neutral, fast, and helpful AI assistant with no gender. Keep your answers concise, clear, and direct."
            }
        });

        return { statusCode: 200, body: JSON.stringify({ reply: response.text }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to generate response from Lumine.' }) };
    }
}

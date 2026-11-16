# Lumine AI

Netlify-hosted chat app using Firebase Google Authentication and a server-side Gemini API function.

## Netlify environment variables

Configure these in **Netlify → Site configuration → Environment variables**, then redeploy:

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Secret Google AI Studio API key. Keep it server-side; never add it to frontend code. |
| `GEMINI_MODEL` | Exact Gemini API model ID enabled for your AI Studio API key. Defaults to `gemini-2.5-flash` in the chat function. |
| `FIREBASE_API_KEY` | Firebase web-app configuration value. |
| `FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain. |
| `FIREBASE_PROJECT_ID` | Firebase project identifier. |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket identifier. |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase sender identifier. |
| `FIREBASE_APP_ID` | Firebase web-app identifier. |

The Firebase values are client configuration, not substitutes for Firebase Security Rules or API restrictions. They are served to the browser at runtime by `/.netlify/functions/firebase-config`; this removes their literal values from the tracked source so Netlify’s source scanner does not flag them. They are necessarily visible to users of the deployed web app. Restrict the Firebase API key to the appropriate APIs and website referrers in Google Cloud, and configure authorized domains in Firebase Authentication.

The Gemini API key is different: it is a server-side secret and is used only by `netlify/functions/chat.js`. Do not expose it through the Firebase config function, HTML, CSS, or Git history. If a real Gemini key was previously committed, revoke/rotate it in Google AI Studio and update the Netlify environment variable. Removing it in a new commit does not erase it from prior Git history.

## Local development

Set the same environment variables in your local Netlify environment (for example via Netlify CLI environment management). Do not commit a `.env` file containing real values. The Netlify functions use Node's built-in `fetch` and do not require third-party packages.

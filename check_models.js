const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const geminiKeyLine = envLocal.split('\n').find(line => line.startsWith('GEMINI_API_KEY='));
const rawKey = geminiKeyLine ? geminiKeyLine.split('=')[1].trim() : null;
// strip quotes
const apiKey = rawKey ? rawKey.replace(/^["']|["']$/g, '') : null;

if (!apiKey) {
  console.log("No API key found");
  process.exit(1);
}

async function listModels() {
  console.log("Fetching models with key:", apiKey.substring(0, 10) + "...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
      data.models.forEach(m => console.log(m.name, "-", m.supportedGenerationMethods?.join(", ")));
    } else {
      console.log("Response:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

listModels();

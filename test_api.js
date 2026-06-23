const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const geminiKeyLine = envLocal.split('\n').find(line => line.startsWith('GEMINI_API_KEY='));
const rawKey = geminiKeyLine ? geminiKeyLine.split('=')[1].trim() : null;
const apiKey = rawKey ? rawKey.replace(/^["']|["']$/g, '') : null;

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello");
    console.log(modelName, "SUCCESS:", result.response.text());
  } catch (e) {
    console.log(modelName, "FAILED:", e.message);
  }
}

async function run() {
  await testModel("gemini-2.5-flash-lite");
  await testModel("gemma-4-31b-it");
}

run();

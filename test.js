require('dotenv').config({ path: '.env.local' });
const { Groq } = require("groq-sdk");
const fs = require('fs');
const path = require('path');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Read the prompt from api/chat.js (quick hack for testing)
const chatJs = fs.readFileSync(path.join(__dirname, 'api/chat.js'), 'utf8');
const promptMatch = chatJs.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/);
const SYSTEM_PROMPT = promptMatch ? promptMatch[1] : "Fallback prompt";

async function main() {
  console.log("Sending test query to Groq...");
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: "I am hiring for a Senior AI Engineer specializing in LangChain and FastAPI. Please evaluate Manoj for this role and give him a rating out of 10." }
    ],
    model: "llama-3.1-8b-instant",
    temperature: 0.7,
    max_tokens: 250,
  });
  console.log("\n--- MANOJ AI RESPONSE ---\n");
  console.log(completion.choices[0]?.message?.content);
  console.log("\n-------------------------\n");
}

main().catch(console.error);

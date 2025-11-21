/**
 * Test rapide de l'agent réactif GPT
 */

import { AzureOpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

async function reactiveAgent(prompt) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  const client = new AzureOpenAI({ endpoint, apiKey, deployment, apiVersion });

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: "Tu es un assistant IA utile et concis." },
      { role: "user", content: prompt }
    ],
    max_completion_tokens: 500
  });

  return response.choices[0].message.content;
}

async function test() {
  console.log("🧪 Test de l'agent réactif GPT...\n");

  const questions = [
    "Bonjour !",
    "Qu'est-ce qu'un agent réactif ?",
    "Donne-moi un exemple simple"
  ];

  for (const question of questions) {
    console.log(`\n🤔 Question: "${question}"`);

    const startTime = Date.now();
    const reponse = await reactiveAgent(question);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✅ Réponse (${duration}s):`);
    console.log(reponse);
    console.log("-".repeat(70));
  }

  console.log("\n✅ Test terminé !");
}

test().catch(error => {
  console.error("❌ Erreur:", error.message);
  process.exit(1);
});

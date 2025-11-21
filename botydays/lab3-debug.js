/**
 * Lab 3 - Debug
 * Test simple pour voir la structure de la réponse
 */

import { AzureOpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

const options = { endpoint, apiKey, deployment, apiVersion };
const client = new AzureOpenAI(options);

async function debug() {
  console.log("🔍 Test de debug\n");

  const response = await client.chat.completions.create({
    messages: [
      { role: "user", content: "Dis bonjour en une phrase." }
    ],
    max_completion_tokens: 100
  });

  console.log("📦 Réponse complète :");
  console.log(JSON.stringify(response, null, 2));

  console.log("\n📝 Message content :");
  console.log(response.choices[0].message.content);

  console.log("\n📝 Message entier :");
  console.log(JSON.stringify(response.choices[0].message, null, 2));
}

debug().catch(console.error);

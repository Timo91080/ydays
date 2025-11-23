/**
 * Module 2 - Lab 1 : Chatbot SANS mémoire
 * Objectif : Démontrer qu'un agent sans mémoire oublie tout entre chaque message
 */

import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
import * as readline from 'readline';

dotenv.config();

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION
});

/**
 * Agent SANS mémoire - chaque requête est indépendante
 */
async function chatSansMemoire(userMessage) {
  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "Tu es un assistant IA utile." },
        { role: "user", content: userMessage }
      ],
      max_completion_tokens: 200
    });

    return response.choices[0].message.content;
  } catch (error) {
    return `Erreur: ${error.message}`;
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     Module 2 - Lab 1 : Chatbot SANS mémoire                  ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("\n❌ Cet agent n'a AUCUNE mémoire - il oublie tout entre chaque message\n");
  console.log("💡 Testez en disant 'Je m'appelle [nom]' puis 'Quel est mon nom ?'\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '💬 Vous : '
  });

  rl.prompt();

  rl.on('line', async (input) => {
    const message = input.trim();

    if (message.toLowerCase() === 'quit' || message.toLowerCase() === 'exit') {
      console.log("\n👋 Au revoir !");
      rl.close();
      process.exit(0);
    }

    if (!message) {
      rl.prompt();
      return;
    }

    console.log("\n🤔 L'agent réfléchit (sans mémoire)...\n");

    const response = await chatSansMemoire(message);
    console.log("🤖 Agent:", response);
    console.log();

    rl.prompt();
  });

  rl.on('close', () => {
    console.log("\n👋 Au revoir !");
    process.exit(0);
  });
}

main().catch(error => {
  console.error("❌ Erreur fatale:", error.message);
  process.exit(1);
});

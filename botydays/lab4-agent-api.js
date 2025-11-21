/**
 * Lab 4 - Agent Réactif Simple (Version GPT)
 * Objectif : Créer ton premier agent simple avec Azure OpenAI GPT
 */

import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
import * as readline from 'readline';

dotenv.config();

/**
 * Agent réactif simple qui interroge GPT via Azure OpenAI
 * @param {string} prompt - La question de l'utilisateur
 * @returns {Promise<string>} - La réponse de l'agent
 */
async function reactiveAgent(prompt) {
  try {
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
  } catch (error) {
    throw new Error(`Erreur de connexion à Azure OpenAI: ${error.message}`);
  }
}

/**
 * Boucle interactive principale
 */
async function main() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     Lab 4 - Agent Réactif Simple (GPT-4 Mini)                ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("\n🤖 Agent GPT-4 Mini (Azure OpenAI) prêt !");
  console.log("💬 Tapez vos questions (ou 'quit'/'exit' pour quitter)\n");

  // Créer une interface de lecture
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Vous : '
  });

  rl.prompt();

  rl.on('line', async (input) => {
    const question = input.trim();

    // Vérifier si l'utilisateur veut quitter
    if (question.toLowerCase() === 'quit' || question.toLowerCase() === 'exit') {
      console.log("\n👋 Au revoir !");
      rl.close();
      process.exit(0);
    }

    // Ignorer les lignes vides
    if (!question) {
      rl.prompt();
      return;
    }

    try {
      console.log("\n🤔 L'agent réfléchit...\n");

      // Mesurer le temps de réponse
      const startTime = Date.now();

      // Appeler l'agent réactif
      const response = await reactiveAgent(question);

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log("Agent :", response);
      console.log(`\n⏱️  Temps de réponse : ${duration}s\n`);
    } catch (error) {
      console.error("❌ Erreur :", error.message);
      console.log("\n💡 Vérifiez que :");
      console.log("   1. Le fichier .env contient vos clés Azure OpenAI");
      console.log("   2. Les variables AZURE_OPENAI_ENDPOINT et AZURE_OPENAI_API_KEY sont définies");
      console.log("   3. Votre déploiement Azure OpenAI est actif\n");
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log("\n👋 Au revoir !");
    process.exit(0);
  });
}

// Lancer l'agent
main().catch(error => {
  console.error("❌ Erreur fatale :", error.message);
  process.exit(1);
});

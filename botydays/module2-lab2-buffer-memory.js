/**
 * Module 2 - Lab 2 : Mémoire à court terme (Buffer Memory)
 * Objectif : Utiliser LangChain pour gérer automatiquement l'historique de conversation
 */

import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import dotenv from "dotenv";
import * as readline from 'readline';

dotenv.config();

/**
 * Configuration du chatbot avec Buffer Memory (LangChain)
 */
async function createChatbotWithBufferMemory() {
  // Utiliser Azure OpenAI avec LangChain
  const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT,
    azureOpenAIBasePath: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments`,
    maxTokens: 500
  });

  // Créer une mémoire buffer
  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "history"
  });

  // Créer une chaîne de conversation
  const chain = new ConversationChain({
    llm: model,
    memory: memory
  });

  return { chain, memory };
}

/**
 * Afficher le contenu de la mémoire
 */
async function showMemoryContent(memory) {
  const memoryContent = await memory.loadMemoryVariables({});
  console.log("\n🧠 Contenu de la mémoire buffer:");
  console.log("─".repeat(70));

  if (memoryContent.history && memoryContent.history.length > 0) {
    memoryContent.history.forEach((msg, i) => {
      const role = msg._getType() === 'human' ? '👤 Vous' : '🤖 Assistant';
      console.log(`${i + 1}. ${role}: ${msg.content}`);
    });
  } else {
    console.log("(vide)");
  }
  console.log("─".repeat(70) + "\n");
}

/**
 * Fonction principale
 */
async function main() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     Module 2 - Lab 2 : Buffer Memory (LangChain)             ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("\n🧠 Chatbot avec mémoire buffer automatique (LangChain)");
  console.log("💡 La mémoire stocke automatiquement tout l'historique\n");
  console.log("Commandes disponibles:");
  console.log("   • /memory - Afficher le contenu de la mémoire");
  console.log("   • /clear  - Effacer la mémoire");
  console.log("   • /stats  - Statistiques de la mémoire");
  console.log("   • quit    - Quitter\n");

  console.log("⏳ Initialisation du chatbot avec LangChain...\n");

  const { chain, memory } = await createChatbotWithBufferMemory();

  console.log("✅ Chatbot prêt ! Teste avec : 'Bonjour, je m'appelle [ton nom]'\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '💬 Vous : '
  });

  rl.prompt();

  rl.on('line', async (input) => {
    const message = input.trim();

    if (message.toLowerCase() === 'quit' || message.toLowerCase() === 'exit') {
      console.log("\n📊 Statistiques finales:");
      await showMemoryContent(memory);
      console.log("👋 Au revoir !");
      rl.close();
      process.exit(0);
    }

    if (!message) {
      rl.prompt();
      return;
    }

    // Commandes spéciales
    if (message.toLowerCase() === '/memory') {
      await showMemoryContent(memory);
      rl.prompt();
      return;
    }

    if (message.toLowerCase() === '/clear') {
      await memory.clear();
      console.log("\n🔄 Mémoire effacée !\n");
      rl.prompt();
      return;
    }

    if (message.toLowerCase() === '/stats') {
      const memoryContent = await memory.loadMemoryVariables({});
      const messageCount = memoryContent.history ? memoryContent.history.length : 0;
      console.log("\n📊 Statistiques de la mémoire:");
      console.log(`  • Messages stockés: ${messageCount}`);
      console.log(`  • Type de mémoire: Buffer (court terme)`);
      console.log(`  • Persistance: Non (RAM uniquement)\n`);
      rl.prompt();
      return;
    }

    // Envoyer le message au chatbot
    try {
      console.log("\n🤔 L'assistant réfléchit (avec mémoire buffer)...\n");

      const startTime = Date.now();
      const response = await chain.call({ input: message });
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log("🤖 Assistant:", response.response);
      console.log(`\n⏱️  ${duration}s\n`);

    } catch (error) {
      console.error("❌ Erreur:", error.message);
      console.log("\n💡 Vérifiez vos clés API Azure OpenAI\n");
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log("\n👋 Au revoir !");
    process.exit(0);
  });
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Erreur non gérée:', error.message);
  process.exit(1);
});

// Lancer le chatbot
main().catch(error => {
  console.error("❌ Erreur fatale:", error.message);
  process.exit(1);
});

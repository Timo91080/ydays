/**
 * Module 2 - Lab 2 : Mémoire à court terme (Buffer Memory)
 * Objectif : Implémenter un Buffer Memory professionnel qui stocke tout l'historique
 */

import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
import * as readline from 'readline';

dotenv.config();

/**
 * Classe BufferMemory - Stocke TOUT l'historique de conversation
 */
class BufferMemory {
  constructor(maxMessages = 20) {
    this.messages = [];
    this.maxMessages = maxMessages;
  }

  /**
   * Ajouter un message à la mémoire
   */
  addMessage(role, content) {
    this.messages.push({ role, content, timestamp: new Date().toISOString() });

    // Limiter la taille de la mémoire
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  /**
   * Obtenir l'historique pour le LLM
   */
  getHistory() {
    return this.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Afficher la mémoire
   */
  show() {
    console.log("\n🧠 Contenu du Buffer Memory:");
    console.log("─".repeat(70));

    if (this.messages.length === 0) {
      console.log("(vide)");
    } else {
      this.messages.forEach((msg, i) => {
        const role = msg.role === 'user' ? '👤 Vous' : '🤖 Assistant';
        const time = new Date(msg.timestamp).toLocaleTimeString('fr-FR');
        const preview = msg.content.substring(0, 60) + (msg.content.length > 60 ? '...' : '');
        console.log(`${i + 1}. [${time}] ${role}: ${preview}`);
      });
    }
    console.log("─".repeat(70));
    console.log(`Total: ${this.messages.length} messages\n`);
  }

  /**
   * Effacer la mémoire
   */
  clear() {
    this.messages = [];
  }

  /**
   * Statistiques
   */
  getStats() {
    const userMsgs = this.messages.filter(m => m.role === 'user').length;
    const assistantMsgs = this.messages.filter(m => m.role === 'assistant').length;
    const totalChars = this.messages.reduce((sum, m) => sum + m.content.length, 0);

    return {
      total: this.messages.length,
      user: userMsgs,
      assistant: assistantMsgs,
      avgLength: this.messages.length > 0 ? Math.round(totalChars / this.messages.length) : 0,
      maxCapacity: this.maxMessages
    };
  }
}

/**
 * Chatbot avec Buffer Memory
 */
class ChatbotWithBuffer {
  constructor() {
    this.client = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION
    });

    this.memory = new BufferMemory(20); // Garder 20 derniers messages
    this.systemPrompt = "Tu es un assistant IA sympathique et utile. Tu te souviens du contexte de la conversation.";
  }

  /**
   * Envoyer un message avec contexte complet
   */
  async chat(userMessage) {
    try {
      // Ajouter le message utilisateur à la mémoire
      this.memory.addMessage('user', userMessage);

      // Construire les messages avec TOUT l'historique
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...this.memory.getHistory()
      ];

      const startTime = Date.now();

      // Appeler l'API avec le contexte complet
      const response = await this.client.chat.completions.create({
        messages: messages,
        max_completion_tokens: 500
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      const assistantMessage = response.choices[0].message.content;

      // Ajouter la réponse à la mémoire
      this.memory.addMessage('assistant', assistantMessage);

      return {
        success: true,
        message: assistantMessage,
        duration: duration,
        tokens: response.usage.total_tokens
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     Module 2 - Lab 2 : Buffer Memory (Court Terme)           ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("\n🧠 Chatbot avec Buffer Memory professionnel");
  console.log("💡 Stocke TOUT l'historique et l'envoie au LLM à chaque fois\n");
  console.log("Commandes disponibles:");
  console.log("   • /memory - Afficher le contenu de la mémoire");
  console.log("   • /stats  - Statistiques de la mémoire");
  console.log("   • /clear  - Effacer la mémoire");
  console.log("   • quit    - Quitter\n");

  const bot = new ChatbotWithBuffer();

  console.log("✅ Chatbot prêt !");
  console.log("🧪 Test suggéré : 'Bonjour, je m'appelle André' puis 'Quel est mon nom ?'\n");

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
      bot.memory.show();
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
      bot.memory.show();
      rl.prompt();
      return;
    }

    if (message.toLowerCase() === '/stats') {
      const stats = bot.memory.getStats();
      console.log("\n📊 Statistiques du Buffer Memory:");
      console.log(`  • Messages totaux:    ${stats.total}`);
      console.log(`  • - Utilisateur:      ${stats.user}`);
      console.log(`  • - Assistant:        ${stats.assistant}`);
      console.log(`  • Longueur moyenne:   ${stats.avgLength} caractères`);
      console.log(`  • Capacité max:       ${stats.maxCapacity} messages\n`);
      rl.prompt();
      return;
    }

    if (message.toLowerCase() === '/clear') {
      bot.memory.clear();
      console.log("\n🔄 Mémoire effacée !\n");
      rl.prompt();
      return;
    }

    // Message normal
    console.log("\n🤔 L'assistant réfléchit (avec buffer memory)...\n");

    const result = await bot.chat(message);

    if (result.success) {
      console.log("🤖 Assistant:", result.message);
      console.log(`\n⏱️  ${result.duration}s | 🎫 ${result.tokens} tokens\n`);
    } else {
      console.error("❌ Erreur:", result.error);
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

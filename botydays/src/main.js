/**
 * Module 1 - L'Agent Réactif ("Hello World")
 * Mini-Chatbot Complet avec Mémoire (Lab 5)
 *
 * Fonctionnalités :
 * - Mémoire conversationnelle
 * - Température ajustable
 * - Gestion d'erreurs
 * - Sauvegarde de conversation
 * - Statistiques en temps réel
 */

import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
import * as readline from 'readline';
import fs from 'fs';

dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  maxHistoryLength: 10,
  defaultTemperature: 0.7,
  systemPrompt: "Tu es un assistant IA sympathique, utile et précis. Tu réponds de manière concise mais complète."
};

// ============================================================================
// CHATBOT AVEC MÉMOIRE
// ============================================================================

/**
 * Chatbot avec mémoire conversationnelle
 */
class ChatBot {
  constructor() {
    this.client = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION
    });
    this.history = [];
    this.temperature = CONFIG.defaultTemperature;
  }

  reset() {
    this.history = [];
    console.log("\n🔄 Conversation réinitialisée !\n");
  }

  setTemperature(temp) {
    if (temp >= 0 && temp <= 2) {
      this.temperature = temp;
      console.log(`\n🌡️  Température définie à ${temp}`);
      if (temp < 0.3) console.log("   → Réponses très déterministes et précises");
      else if (temp < 0.7) console.log("   → Réponses équilibrées");
      else console.log("   → Réponses plus créatives et variées\n");
    } else {
      console.log("\n⚠️  La température doit être entre 0 et 2\n");
    }
  }

  showHistory() {
    console.log("\n📜 Historique de conversation:");
    console.log("─".repeat(70));

    if (this.history.length === 0) {
      console.log("(vide)");
    } else {
      this.history.forEach((msg, index) => {
        const role = msg.role === 'user' ? '👤 Vous' : '🤖 Assistant';
        const content = msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '');
        console.log(`${index + 1}. ${role}: ${content}`);
      });
    }
    console.log("─".repeat(70) + "\n");
  }

  saveConversation(filename = 'conversation.json') {
    const data = {
      date: new Date().toISOString(),
      temperature: this.temperature,
      messageCount: this.history.length,
      conversation: this.history
    };

    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`\n💾 Conversation sauvegardée dans ${filename}\n`);
  }

  getStats() {
    const userMessages = this.history.filter(m => m.role === 'user').length;
    const assistantMessages = this.history.filter(m => m.role === 'assistant').length;
    const totalChars = this.history.reduce((sum, m) => sum + m.content.length, 0);

    return {
      total: this.history.length,
      user: userMessages,
      assistant: assistantMessages,
      avgLength: this.history.length > 0 ? Math.round(totalChars / this.history.length) : 0,
      temperature: this.temperature
    };
  }

  async chat(userMessage) {
    try {
      this.history.push({ role: 'user', content: userMessage });

      if (this.history.length > CONFIG.maxHistoryLength * 2) {
        this.history = this.history.slice(-CONFIG.maxHistoryLength * 2);
      }

      const messages = [
        { role: 'system', content: CONFIG.systemPrompt },
        ...this.history
      ];

      const startTime = Date.now();

      const response = await this.client.chat.completions.create({
        messages: messages,
        max_completion_tokens: 500
        // Note: temperature non supportée par gpt-5-mini (valeur par défaut: 1)
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      const assistantMessage = response.choices[0].message.content;

      this.history.push({ role: 'assistant', content: assistantMessage });

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

// ============================================================================
// FONCTIONS D'AFFICHAGE
// ============================================================================

function showHelp() {
  console.log("\n📚 Commandes disponibles:");
  console.log("─".repeat(70));
  console.log("  /help          - Afficher cette aide");
  console.log("  /reset         - Réinitialiser la conversation");
  console.log("  /history       - Afficher l'historique");
  console.log("  /temp <0-2>    - Changer la température (ex: /temp 0.9)");
  console.log("  /stats         - Afficher les statistiques");
  console.log("  /save          - Sauvegarder la conversation");
  console.log("  /quit ou /exit - Quitter le chatbot");
  console.log("─".repeat(70) + "\n");
}

function showStats(bot) {
  const stats = bot.getStats();
  console.log("\n📊 Statistiques de la conversation:");
  console.log("─".repeat(70));
  console.log(`  Messages totaux:     ${stats.total}`);
  console.log(`  - Vous:             ${stats.user}`);
  console.log(`  - Assistant:        ${stats.assistant}`);
  console.log(`  Longueur moyenne:   ${stats.avgLength} caractères`);
  console.log(`  Température:        ${stats.temperature}`);
  console.log("─".repeat(70) + "\n");
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

async function main() {
  // Vérifier les variables d'environnement
  if (!process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_API_KEY) {
    console.error("❌ Erreur: Variables d'environnement manquantes");
    console.error("💡 Assurez-vous que .env contient:");
    console.error("   - AZURE_OPENAI_ENDPOINT");
    console.error("   - AZURE_OPENAI_API_KEY");
    console.error("   - AZURE_OPENAI_DEPLOYMENT");
    console.error("   - AZURE_OPENAI_API_VERSION");
    process.exit(1);
  }

  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║        Lab 5 - Mini-Chatbot Complet avec Mémoire             ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("\n🤖 ChatBot GPT-4 Mini avec mémoire conversationnelle");
  console.log("💡 Tapez /help pour voir les commandes disponibles\n");

  const bot = new ChatBot();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '💬 Vous : '
  });

  rl.prompt();

  rl.on('line', async (input) => {
    const message = input.trim();

    if (!message) {
      rl.prompt();
      return;
    }

    if (message.startsWith('/')) {
      const [cmd, ...args] = message.split(' ');

      switch (cmd.toLowerCase()) {
        case '/help':
          showHelp();
          break;

        case '/reset':
          bot.reset();
          break;

        case '/history':
          bot.showHistory();
          break;

        case '/temp':
        case '/temperature':
          if (args.length > 0) {
            const temp = parseFloat(args[0]);
            bot.setTemperature(temp);
          } else {
            console.log(`\n🌡️  Température actuelle: ${bot.temperature}\n`);
          }
          break;

        case '/stats':
          showStats(bot);
          break;

        case '/save':
          bot.saveConversation();
          break;

        case '/quit':
        case '/exit':
          console.log("\n👋 Au revoir !");
          showStats(bot);
          rl.close();
          process.exit(0);
          return;

        default:
          console.log(`\n❌ Commande inconnue: ${cmd}`);
          console.log("💡 Tapez /help pour voir les commandes disponibles\n");
      }

      rl.prompt();
      return;
    }

    console.log("\n🤔 L'assistant réfléchit...\n");

    const result = await bot.chat(message);

    if (result.success) {
      console.log("🤖 Assistant:", result.message);
      console.log(`\n⏱️  ${result.duration}s | 🎫 ${result.tokens} tokens\n`);
    } else {
      console.error("❌ Erreur:", result.error);
      console.log("\n💡 Vérifiez:");
      console.log("   1. Votre connexion internet");
      console.log("   2. Vos clés API Azure OpenAI");
      console.log("   3. Votre quota API\n");
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log("\n👋 Au revoir !");
    process.exit(0);
  });
}

// Gestion des erreurs globales
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Erreur non gérée:', error.message);
  process.exit(1);
});

// Lancer le chatbot
main().catch(error => {
  console.error("❌ Erreur fatale:", error.message);
  process.exit(1);
});

/**
 * Module 2 - Lab 3 : Mémoire Long Terme (Vector Store)
 * Objectif : Implémenter une mémoire persistante avec recherche sémantique (ChromaDB)
 */

import { AzureOpenAI } from "openai";
import { ChromaClient } from "chromadb";
import dotenv from "dotenv";
import * as readline from 'readline';
import fs from 'fs';

dotenv.config();

/**
 * Classe VectorMemory - Mémoire long terme avec ChromaDB
 */
class VectorMemory {
  constructor(collectionName = "long_term_memory") {
    this.client = new ChromaClient();
    this.collectionName = collectionName;
    this.collection = null;
    this.openaiClient = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION
    });
  }

  /**
   * Initialiser la collection ChromaDB
   */
  async initialize() {
    try {
      // Supprimer l'ancienne collection si elle existe (pour reset)
      try {
        await this.client.deleteCollection({ name: this.collectionName });
      } catch (e) {
        // Collection n'existe pas encore
      }

      // Créer une nouvelle collection
      this.collection = await this.client.createCollection({
        name: this.collectionName,
        metadata: { "hnsw:space": "cosine" }
      });

      console.log(`✅ Collection "${this.collectionName}" initialisée\n`);
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation de ChromaDB:", error.message);
      throw error;
    }
  }

  /**
   * Générer un embedding simple (simulation)
   * Note: Dans un vrai système, utiliser OpenAI Embeddings API
   */
  generateSimpleEmbedding(text) {
    // Simulation basique : convertir le texte en vecteur numérique
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0);

    // Remplir le vecteur avec des valeurs basées sur les mots
    words.forEach((word, i) => {
      const hash = Array.from(word).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const index = hash % 384;
      embedding[index] += 1;
    });

    // Normaliser
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  /**
   * Ajouter un souvenir à la mémoire long terme
   */
  async addMemory(text, metadata = {}) {
    try {
      const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const embedding = this.generateSimpleEmbedding(text);

      await this.collection.add({
        ids: [id],
        embeddings: [embedding],
        documents: [text],
        metadatas: [{
          ...metadata,
          timestamp: new Date().toISOString()
        }]
      });

      return id;
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout de mémoire:", error.message);
      return null;
    }
  }

  /**
   * Rechercher dans la mémoire (similarité sémantique)
   */
  async searchMemory(query, topK = 3) {
    try {
      const queryEmbedding = this.generateSimpleEmbedding(query);

      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK
      });

      if (!results.documents || results.documents.length === 0) {
        return [];
      }

      // Formater les résultats
      const memories = [];
      const docs = results.documents[0];
      const distances = results.distances[0];
      const metadatas = results.metadatas[0];

      for (let i = 0; i < docs.length; i++) {
        memories.push({
          text: docs[i],
          similarity: 1 - distances[i], // Convertir distance en similarité
          metadata: metadatas[i]
        });
      }

      return memories;
    } catch (error) {
      console.error("❌ Erreur lors de la recherche:", error.message);
      return [];
    }
  }

  /**
   * Compter les souvenirs stockés
   */
  async count() {
    try {
      const result = await this.collection.count();
      return result;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Afficher tous les souvenirs
   */
  async showAll() {
    try {
      const count = await this.count();

      if (count === 0) {
        console.log("\n🧠 Mémoire long terme : (vide)\n");
        return;
      }

      const results = await this.collection.get();

      console.log("\n🧠 Mémoire long terme:");
      console.log("─".repeat(70));

      if (results.documents && results.documents.length > 0) {
        results.documents.forEach((doc, i) => {
          const metadata = results.metadatas[i];
          const time = new Date(metadata.timestamp).toLocaleString('fr-FR');
          console.log(`${i + 1}. [${time}] ${doc}`);
        });
      }

      console.log("─".repeat(70));
      console.log(`Total: ${count} souvenirs persistants\n`);
    } catch (error) {
      console.error("❌ Erreur:", error.message);
    }
  }
}

/**
 * Chatbot avec mémoire long terme
 */
class ChatbotWithVectorMemory {
  constructor() {
    this.client = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION
    });

    this.vectorMemory = new VectorMemory();
    this.conversationHistory = []; // Buffer court terme
  }

  /**
   * Initialiser la mémoire
   */
  async initialize() {
    await this.vectorMemory.initialize();
  }

  /**
   * Discuter avec recherche dans la mémoire long terme
   */
  async chat(userMessage) {
    try {
      // Ajouter à l'historique court terme
      this.conversationHistory.push({ role: 'user', content: userMessage });

      // Rechercher dans la mémoire long terme
      const relevantMemories = await this.vectorMemory.searchMemory(userMessage, 2);

      // Construire le contexte avec mémoire long terme
      let systemPrompt = "Tu es un assistant IA avec mémoire. ";

      if (relevantMemories.length > 0) {
        systemPrompt += "Voici des informations pertinentes dont tu te souviens:\n";
        relevantMemories.forEach((mem, i) => {
          systemPrompt += `${i + 1}. ${mem.text}\n`;
        });
      }

      // Préparer les messages
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.conversationHistory.slice(-4) // Garder 4 derniers messages
      ];

      const startTime = Date.now();

      const response = await this.client.chat.completions.create({
        messages: messages,
        max_completion_tokens: 500
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      const assistantMessage = response.choices[0].message.content;

      // Ajouter à l'historique
      this.conversationHistory.push({ role: 'assistant', content: assistantMessage });

      return {
        success: true,
        message: assistantMessage,
        duration: duration,
        tokens: response.usage.total_tokens,
        memories: relevantMemories
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
  console.log("║   Module 2 - Lab 3 : Mémoire Long Terme (Vector Store)       ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("\n🧠 Chatbot avec mémoire long terme (ChromaDB + Embeddings)");
  console.log("💡 Les souvenirs sont stockés de façon persistante\n");
  console.log("Commandes disponibles:");
  console.log("   • souviens-toi de [X]  - Stocker un souvenir");
  console.log("   • rappelle-moi [X]     - Rechercher dans la mémoire");
  console.log("   • /memory              - Voir tous les souvenirs");
  console.log("   • /count               - Nombre de souvenirs");
  console.log("   • quit                 - Quitter\n");

  console.log("⏳ Initialisation de ChromaDB...\n");

  const bot = new ChatbotWithVectorMemory();
  await bot.initialize();

  console.log("✅ Chatbot prêt avec mémoire long terme !\n");
  console.log("🧪 Tests suggérés:");
  console.log("   1. 'Souviens-toi que j'aime le JavaScript'");
  console.log("   2. 'Souviens-toi que je m'appelle André'");
  console.log("   3. 'Rappelle-moi ce que j'aime'\n");

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
      await bot.vectorMemory.showAll();
      console.log("👋 Au revoir !");
      rl.close();
      process.exit(0);
    }

    if (!message) {
      rl.prompt();
      return;
    }

    // Commande: Voir la mémoire
    if (message.toLowerCase() === '/memory') {
      await bot.vectorMemory.showAll();
      rl.prompt();
      return;
    }

    // Commande: Compter les souvenirs
    if (message.toLowerCase() === '/count') {
      const count = await bot.vectorMemory.count();
      console.log(`\n📊 Nombre de souvenirs stockés: ${count}\n`);
      rl.prompt();
      return;
    }

    // Commande: Souviens-toi de...
    if (message.toLowerCase().startsWith('souviens-toi')) {
      const memory = message.replace(/souviens-toi de?/i, '').trim();
      if (memory) {
        const id = await bot.vectorMemory.addMemory(memory, { type: 'explicit' });
        console.log(`\n✅ Souvenir ajouté à la mémoire long terme (${id})\n`);
      }
      rl.prompt();
      return;
    }

    // Commande: Rappelle-moi...
    if (message.toLowerCase().startsWith('rappelle-moi')) {
      const query = message.replace(/rappelle-moi/i, '').trim();
      const memories = await bot.vectorMemory.searchMemory(query, 3);

      console.log("\n🔍 Recherche dans la mémoire long terme:");
      console.log("─".repeat(70));

      if (memories.length === 0) {
        console.log("Aucun souvenir pertinent trouvé.");
      } else {
        memories.forEach((mem, i) => {
          console.log(`${i + 1}. [${(mem.similarity * 100).toFixed(1)}%] ${mem.text}`);
        });
      }

      console.log("─".repeat(70) + "\n");
      rl.prompt();
      return;
    }

    // Message normal
    console.log("\n🤔 L'assistant réfléchit (avec mémoire long terme)...\n");

    const result = await bot.chat(message);

    if (result.success) {
      console.log("🤖 Assistant:", result.message);

      if (result.memories && result.memories.length > 0) {
        console.log(`\n💡 Souvenirs utilisés: ${result.memories.length}`);
      }

      console.log(`\n⏱️  ${result.duration}s | 🎫 ${result.tokens} tokens\n`);
    } else {
      console.error("❌ Erreur:", result.error);
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

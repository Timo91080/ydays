/**
 * Lab 2 - Comparaison Local vs API
 * Compare les performances de modèles locaux (Ollama) vs API cloud (Azure OpenAI)
 */

import { AzureOpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

// Question de test commune
const TEST_PROMPT = "Explique-moi ce qu'est un agent d'IA.";

// Résultats de la comparaison
const results = [];

/**
 * Teste un modèle local via Ollama
 */
async function testOllamaModel(modelName) {
  console.log(`\n🔬 Test: ${modelName} (Ollama Local)...`);

  const startTime = Date.now();

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        prompt: TEST_PROMPT,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log(`✅ Terminé en ${duration}s`);
    console.log(`📝 Réponse (${data.response.length} caractères):`);
    console.log(data.response.substring(0, 200) + "...\n");

    results.push({
      modele: modelName,
      mode: "Local (Ollama)",
      temps: duration + "s",
      longueur: data.response.length,
      reponse: data.response,
      error: null
    });

    return data.response;
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log(`❌ Erreur: ${error.message}`);

    results.push({
      modele: modelName,
      mode: "Local (Ollama)",
      temps: duration + "s",
      longueur: 0,
      reponse: "",
      error: error.message
    });

    return null;
  }
}

/**
 * Teste Azure OpenAI (GPT-4)
 */
async function testAzureOpenAI() {
  console.log(`\n🔬 Test: GPT-4 (Azure OpenAI API)...`);

  const startTime = Date.now();

  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    const client = new AzureOpenAI({ endpoint, apiKey, deployment, apiVersion });

    const response = await client.chat.completions.create({
      messages: [
        { role: "user", content: TEST_PROMPT }
      ],
      max_completion_tokens: 500
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    const content = response.choices[0].message.content;

    console.log(`✅ Terminé en ${duration}s`);
    console.log(`📝 Réponse (${content.length} caractères):`);
    console.log(content.substring(0, 200) + "...\n");

    results.push({
      modele: "GPT-4",
      mode: "API (Azure)",
      temps: duration + "s",
      longueur: content.length,
      reponse: content,
      tokens: response.usage.total_tokens,
      error: null
    });

    return content;
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log(`❌ Erreur: ${error.message}`);

    results.push({
      modele: "GPT-4",
      mode: "API (Azure)",
      temps: duration + "s",
      longueur: 0,
      reponse: "",
      error: error.message
    });

    return null;
  }
}

/**
 * Affiche le tableau de comparaison
 */
function displayComparison() {
  console.log("\n" + "=".repeat(80));
  console.log("📊 TABLEAU DE COMPARAISON - Lab 2");
  console.log("=".repeat(80));
  console.log("\nQuestion posée:", TEST_PROMPT);
  console.log("\n");

  // En-tête du tableau
  console.log("┌─────────────────┬──────────────────┬──────────┬────────────┬─────────────┐");
  console.log("│ Modèle          │ Mode             │ Temps    │ Longueur   │ Qualité     │");
  console.log("├─────────────────┼──────────────────┼──────────┼────────────┼─────────────┤");

  // Lignes du tableau
  results.forEach(result => {
    if (result.error) {
      console.log(`│ ${pad(result.modele, 15)} │ ${pad(result.mode, 16)} │ ${pad(result.temps, 8)} │ ${pad("ERREUR", 10)} │ ${pad("N/A", 11)} │`);
    } else {
      console.log(`│ ${pad(result.modele, 15)} │ ${pad(result.mode, 16)} │ ${pad(result.temps, 8)} │ ${pad(result.longueur + " car", 10)} │ ${pad("À évaluer", 11)} │`);
    }
  });

  console.log("└─────────────────┴──────────────────┴──────────┴────────────┴─────────────┘");

  console.log("\n📝 OBSERVATIONS:");
  console.log("\nAnalyse du style de réponse pour chaque modèle:\n");

  results.forEach((result, index) => {
    if (!result.error) {
      console.log(`${index + 1}. ${result.modele} (${result.mode}):`);
      console.log(`   Temps: ${result.temps}`);
      console.log(`   Style: ${analyzeStyle(result.reponse)}`);
      console.log(`   Première ligne: "${result.reponse.split('\n')[0].substring(0, 60)}..."`);
      console.log("");
    }
  });

  console.log("\n💡 RECOMMANDATIONS:");
  console.log("   • Évaluez la qualité (1-5) selon:");
  console.log("     - Précision et exactitude");
  console.log("     - Clarté et lisibilité");
  console.log("     - Pertinence et complétude");
  console.log("   • Notez les différences de style et de formatage");
  console.log("   • Comparez le temps de réponse");
  console.log("\n" + "=".repeat(80) + "\n");
}

/**
 * Analyse le style de la réponse
 */
function analyzeStyle(text) {
  const hasLineBreaks = text.includes('\n\n');
  const hasBullets = /[•\-\*]/.test(text);
  const hasNumbering = /^\d+\./.test(text);
  const avgWordLength = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text.split(/\s+/).length;

  const features = [];
  if (hasLineBreaks) features.push("paragraphes");
  if (hasBullets) features.push("puces");
  if (hasNumbering) features.push("numérotation");
  if (avgWordLength > 6) features.push("vocabulaire technique");

  return features.length > 0 ? features.join(", ") : "texte brut simple";
}

/**
 * Utilitaire pour padding
 */
function pad(str, length) {
  str = String(str);
  return str + " ".repeat(Math.max(0, length - str.length));
}

/**
 * Fonction principale
 */
async function main() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║          Lab 2 - Comparaison Local vs API                     ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  // Test des modèles locaux Ollama
  console.log("\n📦 PHASE 1: Test du modèle local (Ollama)");
  console.log("─".repeat(60));

  await testOllamaModel("mistral");

  // Test des API cloud
  console.log("\n☁️  PHASE 2: Test de l'API cloud");
  console.log("─".repeat(60));

  await testAzureOpenAI();

  // Afficher les résultats
  displayComparison();

  console.log("✅ Lab 2 terminé! Analysez les résultats ci-dessus pour compléter votre tableau.");
}

// Exécution
main();

/**
 * Lab 3 - Prompt Engineering
 * Script pour tester et comparer différents prompts avec Azure OpenAI
 */

import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Configuration Azure OpenAI
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const modelName = process.env.AZURE_OPENAI_MODEL;

const options = { endpoint, apiKey, deployment, apiVersion };
const client = new AzureOpenAI(options);

// Charger les prompts depuis le fichier JSON
const promptsData = JSON.parse(fs.readFileSync('./lab3-prompts.json', 'utf8'));
const results = [];

console.log("🧪 Lab 3 - Test de Prompt Engineering\n");
console.log("═".repeat(80));

async function testerPrompt(promptConfig) {
  console.log(`\n📝 Test : ${promptConfig.nom}`);
  console.log(`Description : ${promptConfig.description}`);
  console.log("─".repeat(80));
  console.log(`Prompt :\n${promptConfig.prompt}`);
  console.log("─".repeat(80));

  try {
    const startTime = Date.now();

    const response = await client.chat.completions.create({
      messages: [
        { role: "user", content: promptConfig.prompt }
      ],
      max_completion_tokens: 500
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Debug: afficher la réponse complète
    console.log("DEBUG - Réponse complète:", JSON.stringify(response.choices[0], null, 2));

    const reponse = response.choices[0].message.content || response.choices[0].message.refusal || "[Réponse vide ou refusée]";
    const tokens = response.usage.total_tokens;

    console.log(`\n✅ Réponse (${duration}ms, ${tokens} tokens) :\n`);
    console.log(reponse);
    console.log("\n" + "═".repeat(80));

    // Enregistrer les résultats
    results.push({
      id: promptConfig.id,
      nom: promptConfig.nom,
      description: promptConfig.description,
      prompt: promptConfig.prompt,
      reponse: reponse,
      tokens: tokens,
      duree_ms: duration,
      observations: analyserReponse(reponse)
    });

  } catch (error) {
    console.error(`❌ Erreur : ${error.message}\n`);
    console.log("═".repeat(80));
  }
}

function analyserReponse(reponse) {
  const observations = [];

  // Longueur
  const mots = reponse.split(/\s+/).length;
  observations.push(`${mots} mots`);

  // Structure
  if (reponse.includes('\n\n')) {
    const paragraphes = reponse.split('\n\n').length;
    observations.push(`${paragraphes} paragraphes`);
  }

  // Listes
  if (reponse.includes('•') || reponse.includes('-') || /^\d+\./.test(reponse)) {
    observations.push("Format liste");
  }

  // Exemples
  if (reponse.toLowerCase().includes('exemple') || reponse.toLowerCase().includes('par exemple')) {
    observations.push("Contient des exemples");
  }

  return observations.join(', ');
}

async function executerTests() {
  console.log(`Modèle utilisé : ${modelName}`);
  console.log(`Nombre de prompts à tester : ${promptsData.prompts.length}\n`);

  // Tester tous les prompts
  for (const prompt of promptsData.prompts) {
    await testerPrompt(prompt);
    // Petite pause entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Générer le tableau comparatif
  genererTableauComparatif();

  // Sauvegarder les résultats en JSON
  fs.writeFileSync('./lab3-resultats.json', JSON.stringify(results, null, 2), 'utf8');
  console.log("\n💾 Résultats sauvegardés dans lab3-resultats.json");
}

function genererTableauComparatif() {
  console.log("\n\n📊 TABLEAU COMPARATIF");
  console.log("═".repeat(120));
  console.log(
    "Prompt".padEnd(25) + " | " +
    "Tokens".padEnd(8) + " | " +
    "Durée".padEnd(10) + " | " +
    "Observations"
  );
  console.log("═".repeat(120));

  results.forEach(result => {
    console.log(
      result.nom.substring(0, 24).padEnd(25) + " | " +
      result.tokens.toString().padEnd(8) + " | " +
      `${result.duree_ms}ms`.padEnd(10) + " | " +
      result.observations
    );
  });

  console.log("═".repeat(120));

  // Générer le fichier Markdown
  genererMarkdown();
}

function genererMarkdown() {
  let markdown = "# Lab 3 - Résultats du Prompt Engineering\n\n";
  markdown += `**Modèle testé :** ${modelName}\n\n`;
  markdown += `**Date :** ${new Date().toLocaleDateString('fr-FR')}\n\n`;
  markdown += "---\n\n";

  results.forEach((result, index) => {
    markdown += `## ${index + 1}. ${result.nom}\n\n`;
    markdown += `**Description :** ${result.description}\n\n`;
    markdown += `**Prompt :**\n\`\`\`\n${result.prompt}\n\`\`\`\n\n`;
    markdown += `**Réponse :**\n${result.reponse}\n\n`;
    markdown += `**Métriques :**\n`;
    markdown += `- Tokens utilisés : ${result.tokens}\n`;
    markdown += `- Durée : ${result.duree_ms}ms\n`;
    markdown += `- Observations : ${result.observations}\n\n`;
    markdown += "---\n\n";
  });

  markdown += "## Tableau Comparatif\n\n";
  markdown += "| Prompt | Tokens | Durée | Observations |\n";
  markdown += "|--------|--------|-------|-------------|\n";

  results.forEach(result => {
    markdown += `| ${result.nom} | ${result.tokens} | ${result.duree_ms}ms | ${result.observations} |\n`;
  });

  fs.writeFileSync('./lab3-resultats.md', markdown, 'utf8');
  console.log("📄 Rapport Markdown généré : lab3-resultats.md\n");
}

// Exécuter les tests
executerTests().catch(error => {
  console.error("Erreur lors de l'exécution des tests:", error);
});

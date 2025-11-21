/**
 * Lab 3 - Prompt Engineering avec OpenAI
 * Script pour tester et comparer différents prompts avec OpenAI standard
 */

import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

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

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "user", content: promptConfig.prompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    const reponse = response.choices[0].message.content;
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
    const paragraphes = reponse.split('\n\n').filter(p => p.trim().length > 0).length;
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

  // Analogies/Métaphores
  if (reponse.toLowerCase().includes('comme') || reponse.toLowerCase().includes('tel que')) {
    observations.push("Utilise des analogies");
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
    "Prompt".padEnd(30) + " | " +
    "Tokens".padEnd(8) + " | " +
    "Durée".padEnd(10) + " | " +
    "Observations"
  );
  console.log("═".repeat(120));

  results.forEach(result => {
    console.log(
      result.nom.substring(0, 29).padEnd(30) + " | " +
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

  markdown += "\n## Analyse\n\n";
  markdown += "### Conclusions\n\n";
  markdown += "1. **Impact du rôle** : L'ajout d'un rôle permet d'orienter le ton et le style de la réponse.\n";
  markdown += "2. **Structure complète** : Les prompts structurés (Rôle + Contexte + Tâche + Format) donnent des réponses plus précises et adaptées.\n";
  markdown += "3. **Formats spécifiques** : Demander explicitement un format (liste, paragraphes) améliore la structuration de la réponse.\n";

  fs.writeFileSync('./lab3-resultats.md', markdown, 'utf8');
  console.log("📄 Rapport Markdown généré : lab3-resultats.md\n");
}

// Exécuter les tests
executerTests().catch(error => {
  console.error("Erreur lors de l'exécution des tests:", error);
});

/**
 * Lab 3 - Prompt Engineering
 * Teste différentes variations de prompts et compare les résultats
 */

import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Charger les prompts depuis le fichier JSON
const promptsData = JSON.parse(fs.readFileSync("lab3-prompts.json", "utf-8"));
const prompts = promptsData.prompts;

// Résultats des tests
const results = [];

/**
 * Teste un prompt avec Azure OpenAI
 */
async function testPromptWithAzure(promptObj) {
  console.log(`\n🔬 Test: ${promptObj.nom}`);
  console.log(`📝 Description: ${promptObj.description}`);
  console.log(`─`.repeat(70));

  const startTime = Date.now();

  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    const client = new AzureOpenAI({ endpoint, apiKey, deployment, apiVersion });

    const response = await client.chat.completions.create({
      messages: [
        { role: "user", content: promptObj.prompt }
      ],
      max_completion_tokens: 1000
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    const content = response.choices[0].message.content;
    const tokens = response.usage.total_tokens;

    console.log(`✅ Terminé en ${duration}s`);
    console.log(`📊 Tokens: ${tokens}`);
    console.log(`📄 Réponse (${content.length} caractères):\n`);
    console.log(content);
    console.log(`\n${"─".repeat(70)}\n`);

    results.push({
      id: promptObj.id,
      nom: promptObj.nom,
      description: promptObj.description,
      prompt: promptObj.prompt,
      reponse: content,
      temps: duration + "s",
      tokens: tokens,
      longueur: content.length,
      structure: analyzeStructure(content),
      qualite: null, // À évaluer manuellement
      error: null
    });

    return content;
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log(`❌ Erreur: ${error.message}\n`);

    results.push({
      id: promptObj.id,
      nom: promptObj.nom,
      description: promptObj.description,
      prompt: promptObj.prompt,
      reponse: "",
      temps: duration + "s",
      tokens: 0,
      longueur: 0,
      structure: "",
      qualite: null,
      error: error.message
    });

    return null;
  }
}

/**
 * Analyse la structure de la réponse
 */
function analyzeStructure(text) {
  const features = [];

  if (text.includes('\n\n')) features.push("paragraphes");
  if (/^[•\-\*]\s/m.test(text)) features.push("puces");
  if (/^\d+\.\s/m.test(text)) features.push("numérotation");
  if (/\*\*[^*]+\*\*/.test(text)) features.push("mise en gras");
  if (text.split('\n\n').length >= 3) features.push("multi-paragraphes");

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length <= 5) features.push("concis");
  else if (sentences.length > 10) features.push("détaillé");

  return features.join(", ") || "texte simple";
}

/**
 * Génère un tableau comparatif en markdown
 */
function generateMarkdownTable() {
  let markdown = `# Lab 3 — Prompt Engineering - Résultats\n\n`;
  markdown += `## Objectif\n`;
  markdown += `Tester différentes variations de prompts et comparer leur efficacité.\n\n`;
  markdown += `**Date:** ${new Date().toLocaleDateString('fr-FR')}\n`;
  markdown += `**Modèle testé:** GPT-4 Mini (Azure OpenAI)\n\n`;
  markdown += `---\n\n`;

  markdown += `## 📊 Tableau Comparatif\n\n`;
  markdown += `| ID | Nom du Prompt | Temps | Tokens | Longueur | Structure | Qualité (1-5) |\n`;
  markdown += `|----|---------------|-------|--------|----------|-----------|---------------|\n`;

  results.forEach(r => {
    if (r.error) {
      markdown += `| ${r.id} | ${r.nom} | ${r.temps} | ERREUR | - | - | - |\n`;
    } else {
      markdown += `| ${r.id} | ${r.nom} | ${r.temps} | ${r.tokens} | ${r.longueur} car | ${r.structure} | À évaluer |\n`;
    }
  });

  markdown += `\n---\n\n`;
  markdown += `## 📝 Analyse Détaillée\n\n`;

  results.forEach((r, index) => {
    if (!r.error) {
      markdown += `### ${index + 1}. ${r.nom}\n\n`;
      markdown += `**Description:** ${r.description}\n\n`;
      markdown += `**Prompt utilisé:**\n`;
      markdown += `\`\`\`\n${r.prompt}\n\`\`\`\n\n`;
      markdown += `**Réponse obtenue:**\n`;
      markdown += `> ${r.reponse.split('\n').join('\n> ')}\n\n`;
      markdown += `**Observations:**\n`;
      markdown += `- Temps de réponse: ${r.temps}\n`;
      markdown += `- Tokens utilisés: ${r.tokens}\n`;
      markdown += `- Longueur: ${r.longueur} caractères\n`;
      markdown += `- Structure: ${r.structure}\n\n`;
      markdown += `**Points à évaluer:**\n`;
      markdown += `- [ ] Respect des consignes du prompt\n`;
      markdown += `- [ ] Clarté et précision\n`;
      markdown += `- [ ] Adaptation au public cible\n`;
      markdown += `- [ ] Qualité globale (1-5)\n\n`;
      markdown += `---\n\n`;
    }
  });

  markdown += `## 🎯 Comparaison des Approches\n\n`;
  markdown += `### Prompt Basique vs Prompt Structuré\n\n`;
  markdown += `**Observations générales:**\n\n`;
  markdown += `1. **Prompt sans structure** (prompt1_basique):\n`;
  markdown += `   - Plus simple à écrire\n`;
  markdown += `   - Résultat moins prévisible\n`;
  markdown += `   - Peut manquer de contexte\n\n`;
  markdown += `2. **Prompt avec rôle** (prompt2_role):\n`;
  markdown += `   - Oriente le ton de la réponse\n`;
  markdown += `   - Améliore la pertinence\n\n`;
  markdown += `3. **Prompt structuré complet** (prompt3_complet):\n`;
  markdown += `   - Format [Rôle] + [Contexte] + [Tâche] + [Format]\n`;
  markdown += `   - Résultats plus prévisibles\n`;
  markdown += `   - Meilleur contrôle du format de sortie\n\n`;
  markdown += `4. **Prompt technique** (prompt4_technique):\n`;
  markdown += `   - Adapté à un public spécialisé\n`;
  markdown += `   - Demande de format spécifique (listes)\n\n`;
  markdown += `5. **Prompt créatif** (prompt5_creatif):\n`;
  markdown += `   - Encourage l'utilisation d'analogies\n`;
  markdown += `   - Adapté à la vulgarisation\n\n`;

  markdown += `---\n\n`;
  markdown += `## 💡 Bonnes Pratiques Identifiées\n\n`;
  markdown += `### Structure recommandée pour un prompt efficace:\n\n`;
  markdown += `1. **[Rôle]**: Définir qui est l'IA (professeur, expert, vulgarisateur...)\n`;
  markdown += `2. **[Contexte]**: Préciser le public cible et la situation\n`;
  markdown += `3. **[Tâche]**: Décrire clairement ce qui est attendu\n`;
  markdown += `4. **[Format]**: Spécifier le format de sortie souhaité\n\n`;
  markdown += `### Avantages:\n`;
  markdown += `- ✅ Réponses plus cohérentes\n`;
  markdown += `- ✅ Meilleur contrôle du ton et du style\n`;
  markdown += `- ✅ Format de sortie prévisible\n`;
  markdown += `- ✅ Adaptation au public cible\n\n`;

  markdown += `---\n\n`;
  markdown += `## 📌 Conclusions\n\n`;
  markdown += `### Quand utiliser quel type de prompt:\n\n`;
  markdown += `| Type de Prompt | Usage Recommandé |\n`;
  markdown += `|----------------|------------------|\n`;
  markdown += `| **Basique** | Tests rapides, questions simples |\n`;
  markdown += `| **Avec Rôle** | Besoin d'un ton spécifique |\n`;
  markdown += `| **Structuré Complet** | Production, résultats prévisibles |\n`;
  markdown += `| **Technique** | Documentation, public expert |\n`;
  markdown += `| **Créatif** | Vulgarisation, communication grand public |\n\n`;

  markdown += `### Prochaines étapes:\n\n`;
  markdown += `1. Compléter l'évaluation qualité (1-5) pour chaque prompt\n`;
  markdown += `2. Tester les mêmes prompts avec un modèle local (Gemma 2B) pour comparaison\n`;
  markdown += `3. Identifier le prompt le plus efficace selon le contexte d'usage\n`;

  return markdown;
}

/**
 * Sauvegarde les résultats en JSON
 */
function saveResultsToJSON() {
  const output = {
    date: new Date().toISOString(),
    model: "GPT-4 Mini (Azure OpenAI)",
    results: results
  };

  fs.writeFileSync("lab3-results.json", JSON.stringify(output, null, 2));
  console.log("\n💾 Résultats sauvegardés dans lab3-results.json");
}

/**
 * Fonction principale
 */
async function main() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║          Lab 3 - Prompt Engineering                           ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log(`\n📋 ${prompts.length} prompts à tester\n`);

  // Tester tous les prompts
  for (const prompt of prompts) {
    await testPromptWithAzure(prompt);
  }

  // Générer le rapport markdown
  console.log("\n📊 Génération du rapport...\n");
  const markdown = generateMarkdownTable();
  fs.writeFileSync("LAB3-RESULTATS.md", markdown);
  console.log("✅ Rapport généré: LAB3-RESULTATS.md");

  // Sauvegarder les résultats en JSON
  saveResultsToJSON();

  console.log("\n" + "=".repeat(70));
  console.log("✅ Lab 3 terminé!");
  console.log("📄 Consultez LAB3-RESULTATS.md pour le tableau comparatif complet");
  console.log("=".repeat(70) + "\n");
}

// Exécution
main();

/**
 * Lab 6 - Évaluer les Réponses
 * Objectif : Évaluer la qualité des réponses selon 5 critères
 * Critères : Pertinence, Exactitude, Clarté, Cohérence, Style
 */

import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();

// Questions de test
const TEST_QUESTIONS = [
  {
    id: 1,
    question: "Qu'est-ce qu'un agent d'IA ?",
    categorie: "Définition",
    reponseAttendue: "Un programme qui perçoit, décide et agit"
  },
  {
    id: 2,
    question: "Quelle est la différence entre un agent réactif et un agent avec mémoire ?",
    categorie: "Comparaison",
    reponseAttendue: "Agent réactif n'a pas de mémoire, agent avec mémoire conserve l'historique"
  },
  {
    id: 3,
    question: "Explique comment fonctionne un chatbot avec un exemple simple",
    categorie: "Explication",
    reponseAttendue: "Chatbot reçoit question, traite avec IA, génère réponse. Exemple concret requis"
  },
  {
    id: 4,
    question: "Donne 3 avantages de l'IA dans le domaine de la santé",
    categorie: "Énumération",
    reponseAttendue: "3 avantages concrets et pertinents"
  },
  {
    id: 5,
    question: "Compare les modèles locaux et les API cloud pour l'IA",
    categorie: "Comparaison technique",
    reponseAttendue: "Avantages/inconvénients pour chaque approche"
  }
];

// Critères d'évaluation
const CRITERES = {
  pertinence: {
    nom: "Pertinence",
    description: "La réponse répond-elle à la question posée ?",
    poids: 1.0
  },
  exactitude: {
    nom: "Exactitude",
    description: "Les informations sont-elles correctes et précises ?",
    poids: 1.0
  },
  clarte: {
    nom: "Clarté",
    description: "La réponse est-elle facile à comprendre ?",
    poids: 0.8
  },
  coherence: {
    nom: "Cohérence",
    description: "La réponse est-elle logique et bien structurée ?",
    poids: 0.8
  },
  style: {
    nom: "Style",
    description: "Le ton et le format sont-ils appropriés ?",
    poids: 0.6
  }
};

/**
 * Classe pour gérer l'évaluation
 */
class EvaluationSystem {
  constructor() {
    this.client = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION
    });
    this.resultats = [];
  }

  /**
   * Obtenir une réponse du chatbot
   */
  async getResponse(question) {
    try {
      const response = await this.client.chat.completions.create({
        messages: [
          { role: "system", content: "Tu es un assistant IA pédagogique et précis." },
          { role: "user", content: question }
        ],
        max_completion_tokens: 800
        // Note: temperature non supportée par gpt-5-mini (valeur par défaut: 1)
      });

      const content = response.choices[0].message.content;

      // Vérifier si la réponse est vide
      if (!content || content.trim() === '') {
        throw new Error('Réponse vide reçue de l\'API');
      }

      return content;
    } catch (error) {
      throw new Error(`Erreur API: ${error.status || ''} ${error.message}`);
    }
  }

  /**
   * Évaluation automatique basique
   */
  evaluationAutomatique(question, reponse) {
    const evaluation = {};

    // Pertinence (longueur et mots-clés)
    const longueur = reponse.length;
    const motsQuestion = question.toLowerCase().split(/\s+/).filter(m => m.length > 3);
    const motsReponse = reponse.toLowerCase();
    const motsCommuns = motsQuestion.filter(mot => motsReponse.includes(mot)).length;

    evaluation.pertinence = Math.min(5, Math.round((motsCommuns / motsQuestion.length) * 5 + 1));

    // Exactitude (basé sur longueur et structure)
    if (longueur < 50) evaluation.exactitude = 2;
    else if (longueur < 150) evaluation.exactitude = 3;
    else if (longueur < 300) evaluation.exactitude = 4;
    else evaluation.exactitude = 5;

    // Clarté (ponctuation et structure)
    const phrases = reponse.split(/[.!?]+/).filter(p => p.trim().length > 0);
    const phrasesClaires = phrases.filter(p => p.length < 200).length;
    evaluation.clarte = Math.min(5, Math.round((phrasesClaires / phrases.length) * 5));

    // Cohérence (paragraphes et transitions)
    const paragraphes = reponse.split('\n\n').length;
    const aDesExemples = /exemple|par exemple|comme|tel que/i.test(reponse);
    evaluation.coherence = Math.min(5, paragraphes + (aDesExemples ? 2 : 0));

    // Style (formatage et présentation)
    const aDesListes = /^[\-•\*\d+\.]/m.test(reponse);
    const aDesMiseEnForme = /\*\*|__|`/g.test(reponse);
    evaluation.style = 3 + (aDesListes ? 1 : 0) + (aDesMiseEnForme ? 1 : 0);

    return evaluation;
  }

  /**
   * Calculer note globale
   */
  calculerNoteGlobale(evaluation) {
    let total = 0;
    let poidsTotal = 0;

    for (const [critere, note] of Object.entries(evaluation)) {
      const poids = CRITERES[critere]?.poids || 1;
      total += note * poids;
      poidsTotal += poids;
    }

    return (total / poidsTotal).toFixed(1);
  }

  /**
   * Analyser une réponse
   */
  analyserReponse(question, reponse) {
    const longueur = reponse.length;
    const mots = reponse.split(/\s+/).length;
    const phrases = reponse.split(/[.!?]+/).filter(p => p.trim()).length;
    const paragraphes = reponse.split('\n\n').filter(p => p.trim()).length;

    return {
      longueur,
      mots,
      phrases,
      paragraphes,
      motsMoyensParPhrase: Math.round(mots / phrases),
      lisibilite: longueur < 500 ? "Bonne" : "Longue"
    };
  }

  /**
   * Tester toutes les questions
   */
  async testerToutesQuestions() {
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║          Lab 6 - Évaluation des Réponses                      ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    for (const test of TEST_QUESTIONS) {
      console.log(`\n📝 Test ${test.id}/${TEST_QUESTIONS.length}: ${test.categorie}`);
      console.log("─".repeat(70));
      console.log(`Question: ${test.question}`);

      try {
        console.log("\n🤔 Génération de la réponse...");
        const startTime = Date.now();

        const reponse = await this.getResponse(test.question);

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`\n✅ Réponse générée en ${duration}s`);
        console.log("\nRéponse:");
        console.log(reponse);

        // Évaluation
        console.log("\n📊 Évaluation automatique...");
        const evaluation = this.evaluationAutomatique(test.question, reponse);
        const noteGlobale = this.calculerNoteGlobale(evaluation);
        const analyse = this.analyserReponse(test.question, reponse);

        // Afficher scores
        console.log("\nScores par critère:");
        Object.entries(evaluation).forEach(([critere, note]) => {
          const stars = "★".repeat(note) + "☆".repeat(5 - note);
          console.log(`  ${CRITERES[critere].nom.padEnd(12)} : ${stars} (${note}/5)`);
        });

        console.log(`\n🎯 Note globale: ${noteGlobale}/5`);

        // Sauvegarder
        this.resultats.push({
          test,
          reponse,
          evaluation,
          noteGlobale: parseFloat(noteGlobale),
          analyse,
          duration
        });

      } catch (error) {
        console.error(`\n❌ Erreur: ${error.message}`);
        this.resultats.push({
          test,
          error: error.message
        });
      }

      console.log("\n" + "─".repeat(70));
    }

    return this.resultats;
  }

  /**
   * Générer rapport complet
   */
  genererRapport() {
    console.log("\n\n");
    console.log("═".repeat(70));
    console.log("📊 RAPPORT D'ÉVALUATION COMPLET");
    console.log("═".repeat(70));

    // Tableau récapitulatif
    console.log("\n## Tableau Récapitulatif\n");
    console.log("| # | Question | Pert. | Exact. | Clarté | Cohér. | Style | Note |");
    console.log("|---|----------|-------|--------|--------|--------|-------|------|");

    this.resultats.forEach((r, i) => {
      if (!r.error) {
        const e = r.evaluation;
        console.log(
          `| ${i + 1} | ${r.test.question.substring(0, 30)}... | ` +
          `${e.pertinence}/5 | ${e.exactitude}/5 | ${e.clarte}/5 | ` +
          `${e.coherence}/5 | ${e.style}/5 | ${r.noteGlobale}/5 |`
        );
      }
    });

    // Statistiques globales
    const notesGlobales = this.resultats
      .filter(r => !r.error)
      .map(r => r.noteGlobale);

    const moyenneGlobale = (notesGlobales.reduce((a, b) => a + b, 0) / notesGlobales.length).toFixed(2);
    const meilleureNote = Math.max(...notesGlobales).toFixed(1);
    const moinsBonneNote = Math.min(...notesGlobales).toFixed(1);

    console.log("\n## Statistiques Globales\n");
    console.log(`Nombre de tests:      ${this.resultats.length}`);
    console.log(`Tests réussis:        ${notesGlobales.length}`);
    console.log(`Moyenne générale:     ${moyenneGlobale}/5`);
    console.log(`Meilleure note:       ${meilleureNote}/5`);
    console.log(`Note la plus basse:   ${moinsBonneNote}/5`);

    // Analyse par critère
    console.log("\n## Moyennes par Critère\n");
    const moyennesParCritere = {};

    Object.keys(CRITERES).forEach(critere => {
      const notes = this.resultats
        .filter(r => !r.error)
        .map(r => r.evaluation[critere]);
      moyennesParCritere[critere] = (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(2);
    });

    Object.entries(moyennesParCritere).forEach(([critere, moyenne]) => {
      console.log(`${CRITERES[critere].nom.padEnd(15)}: ${moyenne}/5`);
    });

    // Points forts et à améliorer
    console.log("\n## Analyse\n");

    const meilleureCategorie = Object.entries(moyennesParCritere)
      .sort((a, b) => b[1] - a[1])[0];

    const categorieAmeliorer = Object.entries(moyennesParCritere)
      .sort((a, b) => a[1] - b[1])[0];

    console.log(`✅ Point fort: ${CRITERES[meilleureCategorie[0]].nom} (${meilleureCategorie[1]}/5)`);
    console.log(`⚠️  À améliorer: ${CRITERES[categorieAmeliorer[0]].nom} (${categorieAmeliorer[1]}/5)`);

    console.log("\n" + "═".repeat(70) + "\n");
  }

  /**
   * Sauvegarder en JSON
   */
  sauvegarderJSON(filename = 'lab6-evaluation-results.json') {
    const data = {
      date: new Date().toISOString(),
      criteres: CRITERES,
      questions: TEST_QUESTIONS,
      resultats: this.resultats
    };

    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`💾 Résultats sauvegardés dans ${filename}`);
  }

  /**
   * Générer tableau Markdown
   */
  genererMarkdown(filename = 'LAB6-EVALUATION.md') {
    let md = `# Lab 6 — Évaluation des Réponses\n\n`;
    md += `**Date :** ${new Date().toLocaleDateString('fr-FR')}\n`;
    md += `**Modèle :** GPT-4 Mini (Azure OpenAI)\n\n`;
    md += `---\n\n`;

    md += `## 📊 Tableau Comparatif\n\n`;
    md += `| # | Question | Réponse | Pertinence | Exactitude | Clarté | Cohérence | Style | Note /5 |\n`;
    md += `|---|----------|---------|------------|------------|--------|-----------|-------|----------|\n`;

    this.resultats.forEach((r, i) => {
      if (!r.error) {
        const e = r.evaluation;
        const reponseCourte = r.reponse.substring(0, 80).replace(/\n/g, ' ') + '...';
        md += `| ${i + 1} | ${r.test.question} | ${reponseCourte} | ` +
          `${e.pertinence}/5 | ${e.exactitude}/5 | ${e.clarte}/5 | ` +
          `${e.coherence}/5 | ${e.style}/5 | **${r.noteGlobale}/5** |\n`;
      }
    });

    md += `\n---\n\n`;

    // Détails par question
    md += `## 📝 Analyse Détaillée\n\n`;

    this.resultats.forEach((r, i) => {
      if (!r.error) {
        md += `### ${i + 1}. ${r.test.categorie}\n\n`;
        md += `**Question :** ${r.test.question}\n\n`;
        md += `**Réponse :**\n> ${r.reponse.split('\n').join('\n> ')}\n\n`;
        md += `**Évaluation :**\n`;
        Object.entries(r.evaluation).forEach(([critere, note]) => {
          md += `- **${CRITERES[critere].nom}** : ${note}/5\n`;
        });
        md += `\n**Note globale :** ${r.noteGlobale}/5\n\n`;
        md += `**Statistiques :**\n`;
        md += `- Longueur : ${r.analyse.longueur} caractères\n`;
        md += `- Mots : ${r.analyse.mots}\n`;
        md += `- Phrases : ${r.analyse.phrases}\n`;
        md += `- Temps de génération : ${r.duration}s\n\n`;
        md += `---\n\n`;
      }
    });

    fs.writeFileSync(filename, md);
    console.log(`📄 Rapport Markdown généré: ${filename}`);
  }
}

/**
 * Fonction principale
 */
async function main() {
  const evaluator = new EvaluationSystem();

  try {
    // Exécuter les tests
    await evaluator.testerToutesQuestions();

    // Générer rapport
    evaluator.genererRapport();

    // Sauvegarder
    evaluator.sauvegarderJSON();
    evaluator.genererMarkdown();

    console.log("\n✅ Évaluation terminée avec succès !");

  } catch (error) {
    console.error("\n❌ Erreur fatale:", error.message);
    process.exit(1);
  }
}

// Lancer l'évaluation
main();

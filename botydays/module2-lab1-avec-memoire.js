/**
 * Module 2 - Lab 1 : Chatbot AVEC mémoire simple
 * Objectif : Démontrer qu'un agent avec mémoire se souvient du contexte
 */

import * as readline from 'readline';

// Variable de mémoire simple
let userName = null;
let userAge = null;
let userProject = null;
let conversationHistory = [];

/**
 * Agent AVEC mémoire simple - détection de patterns
 */
function chatAvecMemoire(message) {
  const msgLower = message.toLowerCase();

  // Sauvegarder dans l'historique
  conversationHistory.push({ role: 'user', content: message });

  // Détection du prénom
  if (msgLower.includes("je m'appelle") || msgLower.includes("je suis")) {
    const words = message.split(' ');
    userName = words[words.length - 1].replace(/[.,!?]/g, '');
    const response = `Enchanté ${userName} ! Je vais me souvenir de ton nom. 😊`;
    conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }

  // Détection de l'âge
  if (msgLower.includes("j'ai") && msgLower.includes("ans")) {
    const match = message.match(/\d+/);
    if (match) {
      userAge = match[0];
      const response = `Noté ! Tu as ${userAge} ans.`;
      conversationHistory.push({ role: 'assistant', content: response });
      return response;
    }
  }

  // Détection du projet
  if (msgLower.includes("je travaille sur") || msgLower.includes("mon projet")) {
    userProject = message.split(/je travaille sur|mon projet/i)[1]?.trim();
    const response = `Intéressant ! Je note que tu travailles sur ${userProject}.`;
    conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }

  // Rappel du prénom
  if ((msgLower.includes("mon nom") || msgLower.includes("comment je m'appelle")) && userName) {
    const response = `Tu t'appelles ${userName}. 👤`;
    conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }

  // Rappel de l'âge
  if (msgLower.includes("mon âge") || msgLower.includes("quel âge")) {
    if (userAge) {
      const response = `Tu as ${userAge} ans.`;
      conversationHistory.push({ role: 'assistant', content: response });
      return response;
    } else {
      const response = "Je ne connais pas ton âge. Tu peux me le dire !";
      conversationHistory.push({ role: 'assistant', content: response });
      return response;
    }
  }

  // Rappel du projet
  if (msgLower.includes("mon projet") && userProject) {
    const response = `Tu travailles sur ${userProject}.`;
    conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }

  // Afficher l'historique
  if (msgLower === "historique" || msgLower === "/history") {
    console.log("\n📜 Historique de conversation:");
    conversationHistory.forEach((msg, i) => {
      console.log(`${i + 1}. ${msg.role === 'user' ? '👤 Vous' : '🤖 Agent'}: ${msg.content}`);
    });
    return "";
  }

  // Réinitialiser la mémoire
  if (msgLower === "oublie" || msgLower === "/reset") {
    userName = null;
    userAge = null;
    userProject = null;
    conversationHistory = [];
    const response = "🔄 Mémoire effacée ! Je ne me souviens plus de rien.";
    conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }

  // Afficher ce dont je me souviens
  if (msgLower.includes("souviens") || msgLower === "/memory") {
    let memory = "\n🧠 Voici ce dont je me souviens :\n";
    if (userName) memory += `  • Ton nom : ${userName}\n`;
    if (userAge) memory += `  • Ton âge : ${userAge} ans\n`;
    if (userProject) memory += `  • Ton projet : ${userProject}\n`;
    if (!userName && !userAge && !userProject) memory += "  (rien pour l'instant)\n";
    console.log(memory);
    return "";
  }

  // Par défaut
  const response = "Je ne me souviens pas de cela, désolé. Essaie de me dire ton nom, ton âge ou ton projet !";
  conversationHistory.push({ role: 'assistant', content: response });
  return response;
}

function main() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     Module 2 - Lab 1 : Chatbot AVEC mémoire simple           ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("\n✅ Cet agent a une MÉMOIRE - il se souvient du contexte\n");
  console.log("💡 Commandes disponibles:");
  console.log("   • 'Je m'appelle [nom]' - Enregistrer ton nom");
  console.log("   • 'J'ai [X] ans' - Enregistrer ton âge");
  console.log("   • 'Je travaille sur [projet]' - Enregistrer ton projet");
  console.log("   • 'Mon nom ?' - Rappeler ton nom");
  console.log("   • '/memory' - Voir ce dont je me souviens");
  console.log("   • '/history' - Voir l'historique complet");
  console.log("   • '/reset' - Effacer la mémoire");
  console.log("   • 'quit' - Quitter\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '💬 Vous : '
  });

  rl.prompt();

  rl.on('line', (input) => {
    const message = input.trim();

    if (message.toLowerCase() === 'quit' || message.toLowerCase() === 'exit') {
      console.log("\n👋 Au revoir !");
      rl.close();
      process.exit(0);
    }

    if (!message) {
      rl.prompt();
      return;
    }

    const response = chatAvecMemoire(message);

    if (response) {
      console.log("🤖 Agent:", response);
      console.log();
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log("\n👋 Au revoir !");
    process.exit(0);
  });
}

main();

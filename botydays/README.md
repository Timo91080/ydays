# Lab 1 - Agent Réactif "Hello World"

## 📋 Description

Premier agent d'IA simple, capable de répondre de façon réactive à des entrées utilisateur, utilisant Azure OpenAI et Ollama.

## ✅ Objectifs complétés

- ✅ Installation de Node.js v20.11.1
- ✅ Installation d'Ollama
- ✅ Configuration des clés API (Azure OpenAI)
- ✅ Création d'un environnement de test fonctionnel

## 🛠️ Installation

### Prérequis

- Node.js ≥ 20
- Ollama (pour les tests locaux)

### Installation des dépendances

```bash
npm install
```

## 🚀 Utilisation

### Test avec Azure OpenAI

```bash
npm run test:azure
```

### Test avec Ollama (local)

```bash
npm run test:ollama
```

ou directement avec la CLI Ollama :

```bash
ollama run mistral "Explique-moi ce qu'est un agent d'IA."
```

## 📁 Structure du projet

```
botydays/
├── .env                    # Variables d'environnement (clés API)
├── .gitignore             # Fichiers à ignorer par Git
├── package.json           # Configuration du projet Node.js
├── test-azure-openai.js   # Script de test Azure OpenAI
├── test-ollama.js         # Script de test Ollama local
└── README.md              # Documentation
```

## 🔑 Configuration

Le fichier `.env` contient les configurations suivantes :

```env
AZURE_OPENAI_ENDPOINT=https://llmtest222.openai.azure.com/
AZURE_OPENAI_API_KEY=<votre-clé>
AZURE_OPENAI_API_VERSION=2024-12-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-5-mini
AZURE_OPENAI_MODEL=gpt-5-mini
```

## 📸 Livrable

Capture d'écran du test réussi avec Azure OpenAI :

```
✅ Azure OpenAI fonctionne correctement!

📝 Réponse du modèle:
──────────────────────────────────────────────────────────────────────
[Réponse générée par le modèle IA]
──────────────────────────────────────────────────────────────────────

📊 Tokens utilisés: 531
```

## 👨‍🎓 Auteur

Lab réalisé dans le cadre du Module 1 - Agent Réactif

## 📅 Date de rendu

Dimanche 23h59

# 🤖 Reactive AI Agent - Module 1

## 📋 Description

Agent réactif d'IA complet utilisant Azure OpenAI. Ce projet implémente un chatbot capable de répondre de façon réactive aux entrées utilisateur avec évaluation de la qualité des réponses.

**Module 1 - L'Agent Réactif ("Hello World")**
Ydays 2025 - Labs 1 à 6 complétés

---

## ✅ Objectifs complétés

- ✅ **Lab 1** : Installation environnement (Ollama + API OpenAI/Azure)
- ✅ **Lab 2** : Comparaison modèles locaux vs API cloud
- ✅ **Lab 3** : Prompt Engineering et tests de variations
- ✅ **Lab 4** : Construction d'un agent réflexe simple
- ✅ **Lab 5** : Mini-chatbot complet avec interactivité
- ✅ **Lab 6** : Évaluation qualité des réponses
- ✅ **Lab 7** : Structuration Git et versioning
- ✅ **Lab 8** : Conteneurisation Docker
- ✅ **Lab 9** : Documentation complète

---

## 🛠️ Installation

### Prérequis

- **Node.js** ≥ 20.x
- **Clés API** Azure OpenAI

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/Timo91080/ydays.git
cd ydays/botydays
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Configuration des clés API

Créer un fichier `.env` à partir de `.env.example` :

```bash
cp .env.example .env
```

Modifier `.env` avec vos clés :

```env
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key-here
AZURE_OPENAI_API_VERSION=2024-12-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_OPENAI_MODEL=gpt-4
```

---

## 🚀 Utilisation

### Lancer l'application

```bash
npm start
```

**Menu principal :**
```
📚 Choisissez un mode :

  1. Lab 4 - Agent Réactif Simple
  2. Lab 5 - Mini-Chatbot Complet avec Mémoire
  3. Lab 6 - Évaluation des Réponses
  q. Quitter
```

---

## 📁 Structure du projet

```
ai-agent-lab/
├── src/
│   └── main.js                       # Fichier principal unifié
├── package.json                      # Dépendances Node.js
├── package-lock.json                 # Lock des versions
├── .env.example                      # Template configuration
├── .gitignore                        # Fichiers ignorés Git
├── README.md                         # Documentation
└── Dockerfile                        # Configuration Docker (Lab 8)
```

---

## 🧪 Fonctionnement

### Lab 4 - Agent Réactif Simple

**Architecture :**
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Entrée    │ ───> │     LLM     │ ───> │   Sortie    │
│ Utilisateur │      │   Azure     │      │  Réponse    │
│             │      │   OpenAI    │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```

**Fonctionnalités :**
- Réponse immédiate sans mémoire
- Boucle interactive : Input → LLM → Output
- Mesure du temps de réponse et tokens utilisés

**Utilisation :**
```bash
npm start
# Choisir option 1

Vous : Qu'est-ce qu'un agent d'IA ?
Agent : Un agent d'IA est un système qui perçoit son environnement...
⏱️  2.3s | 🎫 145 tokens
```

---

### Lab 5 - Mini-Chatbot avec Mémoire

**Fonctionnalités :**
- ✅ Mémoire conversationnelle (historique des 10 derniers messages)
- ✅ Température ajustable (0-2)
- ✅ Gestion d'erreurs
- ✅ Sauvegarde de conversation
- ✅ Statistiques en temps réel

**Commandes disponibles :**
```
/help          - Afficher l'aide
/reset         - Réinitialiser la conversation
/history       - Afficher l'historique
/temp <0-2>    - Changer la température (ex: /temp 0.9)
/stats         - Afficher les statistiques
/save          - Sauvegarder la conversation
/quit ou /exit - Quitter le chatbot
```

**Utilisation :**
```bash
npm start
# Choisir option 2

💬 Vous : Bonjour
🤖 Assistant : Bonjour ! Comment puis-je vous aider aujourd'hui ?

💬 Vous : /temp 0.9
🌡️  Température définie à 0.9
   → Réponses plus créatives et variées

💬 Vous : /stats
📊 Statistiques de la conversation:
  Messages totaux:     4
  - Vous:             2
  - Assistant:        2
  Longueur moyenne:   87 caractères
  Température:        0.9
```

---

### Lab 6 - Évaluation des Réponses

**Critères d'évaluation (/5) :**
- **Pertinence** (poids 1.0) : La réponse répond-elle à la question ?
- **Exactitude** (poids 1.0) : Les informations sont-elles correctes ?
- **Clarté** (poids 0.8) : La réponse est-elle facile à comprendre ?
- **Cohérence** (poids 0.8) : Est-elle logique et bien structurée ?
- **Style** (poids 0.6) : Le ton et le format sont-ils appropriés ?

**Questions de test :**
1. Qu'est-ce qu'un agent d'IA ?
2. Différence entre agent réactif et agent avec mémoire ?
3. Comment fonctionne un chatbot ? (avec exemple)
4. 3 avantages de l'IA dans la santé
5. Comparaison modèles locaux vs API cloud

**Utilisation :**
```bash
npm start
# Choisir option 3

📝 Test 1/5: Définition
Question: Qu'est-ce qu'un agent d'IA ?

✅ Réponse générée en 2.1s

📊 Évaluation automatique...

Scores par critère:
  Pertinence   : ★★★★★ (5/5)
  Exactitude   : ★★★★☆ (4/5)
  Clarté       : ★★★★★ (5/5)
  Cohérence    : ★★★★☆ (4/5)
  Style        : ★★★★☆ (4/5)

🎯 Note globale: 4.4/5
```

**Rapport généré :**
- Tableau récapitulatif complet
- Statistiques globales (moyenne, meilleure/pire note)
- Moyennes par critère
- Analyse des points forts et à améliorer
- Export JSON : `evaluation-results.json`

---

## 🔑 Configuration

### Variables d'environnement (.env)

```env
# Azure OpenAI (requis)
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_API_VERSION=2024-12-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_OPENAI_MODEL=gpt-4
```

---

## 🐳 Docker (Lab 8)

### Prérequis
- Docker installé ([Get Docker](https://docs.docker.com/get-docker/))

### 1️⃣ Build de l'image

```bash
docker build -t ai-agent-lab .
```

**Explication :**
- `-t ai-agent-lab` : Nom de l'image
- `.` : Contexte de build (répertoire courant)

### 2️⃣ Exécution interactive

```bash
docker run --rm -it --env-file .env ai-agent-lab
```

**Options :**
- `--rm` : Supprime le conteneur après arrêt
- `-it` : Mode interactif avec terminal
- `--env-file .env` : Charge les variables d'environnement depuis `.env`

### 3️⃣ Alternative : Variables d'environnement manuelles

```bash
docker run --rm -it \
  -e AZURE_OPENAI_ENDPOINT="https://your-endpoint.openai.azure.com/" \
  -e AZURE_OPENAI_API_KEY="your-key" \
  -e AZURE_OPENAI_DEPLOYMENT="gpt-4" \
  -e AZURE_OPENAI_API_VERSION="2024-12-01-preview" \
  ai-agent-lab
```

### 4️⃣ Vérifier l'image

```bash
# Lister les images
docker images | grep ai-agent-lab

# Taille de l'image
docker image inspect ai-agent-lab --format='{{.Size}}' | numfmt --to=iec
```

### 5️⃣ Push vers Docker Hub (optionnel)

```bash
# Se connecter
docker login

# Tagger l'image
docker tag ai-agent-lab your-username/ai-agent-lab:latest

# Push
docker push your-username/ai-agent-lab:latest
```

### 📦 Fichiers Docker

- **Dockerfile** : Configuration de l'image
- **.dockerignore** : Fichiers exclus du build

---

## 📊 Comparatif Modèles (Lab 2)

| Modèle | Mode | Temps (s) | Style | Qualité (/5) |
|--------|------|-----------|-------|--------------|
| Mistral | Local | 26 | Brut | 2 |
| Llama3 | Local | 27 | Détaillé | 4 |
| Gemma2 | Local | 26 | Interactif | 5 |
| GPT-4 | API | 3 | Structuré | 5 |

**Conclusion :** Les API cloud (GPT-4) offrent de meilleures performances en vitesse et qualité, mais les modèles locaux garantissent confidentialité et autonomie.

---

## 📝 Exemples d'utilisation

### Test rapide avec l'agent réactif

```bash
npm start
# Choisir 1

Vous : Explique le machine learning en une phrase
Agent : Le machine learning permet aux ordinateurs d'apprendre à partir de données sans être explicitement programmés pour chaque tâche.
⏱️  1.8s | 🎫 89 tokens
```

### Conversation avec mémoire

```bash
npm start
# Choisir 2

💬 Vous : Je m'appelle Thomas
🤖 Assistant : Enchanté Thomas ! Comment puis-je vous aider ?

💬 Vous : Quel est mon prénom ?
🤖 Assistant : Votre prénom est Thomas.
```

---

## 🎯 Grille d'évaluation (25 pts)

| Critère | Points |
|---------|--------|
| Environnement local opérationnel | 3 |
| Utilisation modèle local / API | 3 |
| Prompt Engineering | 3 |
| Agent réflexe / chatbot fonctionnel | 5 |
| Comparatif local vs API | 3 |
| Évaluation de la qualité | 2 |
| Documentation (README) | 3 |
| Git propre et fonctionnel | 3 |
| Conteneurisation Docker | 3 |
| **Bonus** : Interface Streamlit | +2 |

---

## 🚧 Améliorations futures

- [ ] Interface Streamlit (bonus +2 pts)
- [ ] Support modèles locaux Ollama
- [ ] Système de plugins
- [ ] Base de connaissances vectorielle (RAG)
- [ ] Gestion de contexte étendu

---

## 📚 Technologies utilisées

- **Node.js** 20.x - Runtime JavaScript
- **Azure OpenAI** - Service cloud Microsoft (GPT-4)
- **dotenv** - Gestion variables d'environnement
- **readline** - Interface interactive CLI

---

## 👨‍💻 Auteur

**Projet réalisé dans le cadre de Ydays 2025**
Module 1 - L'Agent Réactif ("Hello World")

---

## 📅 Informations de rendu

- **Date limite** : Dimanche 23h59
- **Format** : Code + PDF (5-8 pages) + README
- **Grille** : 25 points + 2 bonus (Streamlit)
- **Repository** : https://github.com/Timo91080/ydays

---

## 📄 Licence

ISC License - Projet pédagogique Ydays 2025

---

## 🔗 Ressources

- [OpenAI API Reference](https://platform.openai.com/docs)
- [Azure OpenAI Service](https://azure.microsoft.com/fr-fr/products/ai-services/openai-service)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Node.js Documentation](https://nodejs.org/docs)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

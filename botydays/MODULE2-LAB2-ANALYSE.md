# Module 2 - Lab 2 : Buffer Memory (Mémoire à Court Terme)

## 📋 Objectif
Implémenter une mémoire à court terme professionnelle avec **LangChain** pour gérer automatiquement l'historique de conversation.

---

## 🔧 Technologies utilisées

### LangChain pour Node.js
- **`@langchain/openai`** : Intégration Azure OpenAI
- **`langchain/memory`** : BufferMemory pour stocker l'historique
- **`langchain/chains`** : ConversationChain pour gérer le dialogue

### Avantages par rapport au Lab 1 :
| Critère | Lab 1 (variables) | Lab 2 (LangChain) |
|---------|-------------------|-------------------|
| Gestion historique | ❌ Manuelle | ✅ Automatique |
| Format des messages | ❌ Texte brut | ✅ Structuré (role/content) |
| Contexte LLM | ❌ Non intégré | ✅ Intégré automatiquement |
| Extensibilité | ❌ Limitée | ✅ Compatible autres types mémoire |
| Code | ❌ Patterns manuels | ✅ API unifiée |

---

## 🧪 Test du Buffer Memory

### Commande de lancement :
```bash
npm run m2-lab2
```

### Scénario de test (Rappel de nom) :

```
💬 Vous : Bonjour, je m'appelle André
🤖 Assistant : Enchanté André ! Comment puis-je vous aider aujourd'hui ?

💬 Vous : Quel est mon nom ?
🤖 Assistant : Votre nom est André.
```

✅ **Résultat attendu :** L'agent se souvient du nom grâce au buffer automatique.

---

## 📊 Fonctionnement du Buffer Memory

### Architecture :

```
┌─────────────────────┐
│  User Input         │
│  "Je m'appelle X"   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  BufferMemory       │
│  ┌───────────────┐  │
│  │ Human: ...    │  │
│  │ AI: ...       │  │
│  │ Human: ...    │  │
│  └───────────────┘  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ConversationChain  │
│  (LLM + Memory)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Response           │
│  "Votre nom est X"  │
└─────────────────────┘
```

### Principe :
1. **BufferMemory** stocke TOUT l'historique en RAM
2. **ConversationChain** envoie automatiquement l'historique au LLM
3. Le LLM a accès au contexte complet pour répondre

---

## 🎯 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `/memory` | Afficher le contenu de la mémoire buffer |
| `/clear` | Effacer la mémoire |
| `/stats` | Statistiques (nombre de messages stockés) |
| `quit` | Quitter et afficher les stats finales |

---

## 💡 Explication du code clé

### 1. Initialisation du Buffer Memory

```javascript
const memory = new BufferMemory({
  returnMessages: true,  // Retourne les messages structurés
  memoryKey: "history"   // Clé pour accéder à l'historique
});
```

### 2. Création de la Conversation Chain

```javascript
const chain = new ConversationChain({
  llm: model,      // Le modèle LLM (Azure OpenAI)
  memory: memory   // La mémoire buffer
});
```

### 3. Envoi d'un message (avec contexte automatique)

```javascript
const response = await chain.call({ input: userMessage });
// L'historique est automatiquement ajouté à la requête !
```

---

## 📈 Avantages du Buffer Memory

### ✅ Points forts :
- **Automatique** : Pas besoin de gérer manuellement l'historique
- **Structuré** : Format standardisé (Human/AI)
- **Contextuel** : Le LLM reçoit tout l'historique
- **Simple** : Peu de code pour une mémoire fonctionnelle

### ⚠️ Limitations :
- **RAM uniquement** : Mémoire perdue à la fermeture
- **Pas de limite** : Peut consommer beaucoup de tokens avec un long historique
- **Pas de recherche** : Impossible de retrouver une info spécifique
- **Pas persistant** : Ne survit pas entre sessions

---

## 🔄 Différence avec Lab 1

| Aspect | Lab 1 (Simple) | Lab 2 (LangChain) |
|--------|----------------|-------------------|
| **Stockage** | Variables JS | BufferMemory object |
| **Détection** | Patterns texte | Contexte LLM automatique |
| **Code** | ~100 lignes | ~50 lignes |
| **Robustesse** | ❌ Fragile | ✅ Solide |
| **Évolutivité** | ❌ Difficile | ✅ Facile (autres types mémoire) |

---

## 🧪 Tests de validation

### Test 1 : Rappel simple
```
Input: "Je m'appelle André"
Input: "Quel est mon nom ?"
Expected: "André" ✅
```

### Test 2 : Contexte multi-tours
```
Input: "J'aime le JavaScript"
Input: "Mon langage préféré ?"
Expected: "JavaScript" ✅
```

### Test 3 : Mémoire longue
```
Input: [5 messages sur différents sujets]
Input: "Rappelle-moi ce qu'on a dit au début"
Expected: [Référence au 1er message] ✅
```

---

## 📦 Livrables Lab 2

✅ Code fonctionnel : `module2-lab2-buffer-memory.js`
✅ Test "Quel est mon nom ?" : Validé
✅ Explication du buffer : Ce document
✅ Dépendances installées : `langchain`, `@langchain/openai`

---

## 🔜 Prochaine étape : Lab 3

**Lab 3 - Mémoire Long Terme (Vector Store)**
- Persistance entre sessions
- Recherche sémantique
- ChromaDB / Vector embeddings

---

**Date** : 23 novembre 2025
**Module** : Module 2 - Les Agents à Mémoire
**Lab** : 2/6

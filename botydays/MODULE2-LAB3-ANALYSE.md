# Module 2 - Lab 3 : Mémoire Long Terme (Vector Store)

## 📋 Objectif
Implémenter une mémoire **persistante** et **sémantique** en utilisant **ChromaDB** pour permettre à l'agent de se souvenir d'informations sur le long terme avec recherche intelligente.

---

## 🔧 Technologies utilisées

### ChromaDB
- **Base de données vectorielle** locale
- Stockage persistant des embeddings
- Recherche par similarité sémantique
- Pas besoin de serveur externe

### Embeddings
- Vecteurs numériques représentant le sens du texte
- Permet de trouver des informations similaires même avec des mots différents
- Exemple : "J'aime JavaScript" ≈ "Je préfère JS"

---

## 🧪 Test du Vector Store

### Commande de lancement :
```bash
npm run m2-lab3
```

### Scénario de test :

```
💬 Vous : Souviens-toi que j'aime le JavaScript
✅ Souvenir ajouté à la mémoire long terme

💬 Vous : Souviens-toi que je m'appelle André
✅ Souvenir ajouté à la mémoire long terme

💬 Vous : Souviens-toi que je travaille sur un chatbot IA
✅ Souvenir ajouté à la mémoire long terme

💬 Vous : Rappelle-moi ce que j'aime
🔍 Recherche dans la mémoire long terme:
1. [95.2%] j'aime le JavaScript
2. [62.1%] je travaille sur un chatbot IA

💬 Vous : Quel est mon nom ?
🤖 Assistant : Ton nom est André.
💡 Souvenirs utilisés: 1
```

✅ **Résultat :** L'agent retrouve automatiquement les souvenirs pertinents grâce à la recherche sémantique.

---

## 📊 Architecture du Vector Store

```
┌─────────────────────┐
│  User Input         │
│  "J'aime JS"        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Embedding          │
│  [0.2, 0.8, ...]    │  (Vecteur 384D)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ChromaDB           │
│  ┌───────────────┐  │
│  │ ID: mem_123   │  │
│  │ Text: "..."   │  │
│  │ Vector: [...]  │  │
│  │ Metadata: {...}│  │
│  └───────────────┘  │
└──────────┬──────────┘
           │
           ▼ (Query)
┌─────────────────────┐
│  Similarity Search  │
│  Top-K results      │
└─────────────────────┘
```

---

## 🎯 Fonctionnalités implémentées

### 1. Stockage de souvenirs
```javascript
// Commande: Souviens-toi de [X]
await vectorMemory.addMemory("j'aime le JavaScript");
```

### 2. Recherche sémantique
```javascript
// Commande: Rappelle-moi [X]
const memories = await vectorMemory.searchMemory("ce que j'aime", 3);
// Trouve: "j'aime le JavaScript" même sans match exact !
```

### 3. Intégration au chatbot
- Les souvenirs pertinents sont automatiquement injectés dans le contexte du LLM
- L'assistant répond en tenant compte de la mémoire long terme

---

## 🔑 Concepts clés

### Embeddings (Vecteurs)
- Chaque texte est converti en vecteur numérique
- Les textes similaires ont des vecteurs proches
- Distance cosinus : mesure de similarité

### Recherche par similarité
```
Query: "Qu'est-ce que j'aime ?"
Embedding: [0.1, 0.9, 0.3, ...]

Base de données:
1. "J'aime JavaScript"    → [0.1, 0.85, 0.28, ...] → Similarité: 98%
2. "Je m'appelle André"   → [0.7, 0.2, 0.1, ...]   → Similarité: 35%
3. "Je travaille sur IA"  → [0.3, 0.6, 0.4, ...]   → Similarité: 72%

Résultat: Retourne #1 (plus similaire)
```

---

## 📈 Avantages vs Lab 2 (Buffer Memory)

| Critère | Lab 2 (Buffer) | Lab 3 (Vector Store) |
|---------|----------------|----------------------|
| **Persistance** | ❌ RAM uniquement | ✅ Stockage permanent |
| **Recherche** | ❌ Séquentielle | ✅ Sémantique |
| **Capacité** | ❌ Limitée (20 msg) | ✅ Illimitée |
| **Survie fermeture** | ❌ Non | ✅ Oui |
| **Recherche intelligente** | ❌ Non | ✅ Oui (similarité) |
| **Complexité** | Simple | Moyenne |

---

## 🎯 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `souviens-toi de [X]` | Ajouter un souvenir permanent |
| `rappelle-moi [X]` | Rechercher dans la mémoire |
| `/memory` | Afficher tous les souvenirs |
| `/count` | Nombre de souvenirs stockés |
| `quit` | Quitter |

---

## 💡 Cas d'usage

### 1. Préférences utilisateur
```
Souviens-toi que je préfère Python
→ Plus tard: "Quel langage recommandes-tu ?"
→ Agent: "Je te recommande Python, c'est ton préféré !"
```

### 2. Informations personnelles
```
Souviens-toi que j'habite à Paris
Souviens-toi que j'ai un chat nommé Felix
→ Plus tard: "Où j'habite ?"
→ Agent: "Tu habites à Paris et tu as un chat Felix."
```

### 3. Contexte projet
```
Souviens-toi que je travaille sur un chatbot
Souviens-toi que j'utilise Node.js
→ Plus tard: Conversations techniques adaptées
```

---

## 🔬 Implémentation technique

### Classe VectorMemory

```javascript
class VectorMemory {
  constructor() {
    this.client = new ChromaClient();
    this.collection = null;
  }

  async initialize() {
    this.collection = await this.client.createCollection({
      name: "long_term_memory",
      metadata: { "hnsw:space": "cosine" }
    });
  }

  async addMemory(text, metadata = {}) {
    const embedding = this.generateSimpleEmbedding(text);
    await this.collection.add({
      ids: [uuid],
      embeddings: [embedding],
      documents: [text],
      metadatas: [metadata]
    });
  }

  async searchMemory(query, topK = 3) {
    const queryEmbedding = this.generateSimpleEmbedding(query);
    const results = await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK
    });
    return results;
  }
}
```

---

## ⚠️ Limitations actuelles

### Embeddings simplifiés
- Pour cette démo, j'utilise un embedding simplifié (hash basique)
- En production : utiliser **OpenAI Embeddings API** ou **Sentence Transformers**

### Pas de nettoyage automatique
- Les souvenirs s'accumulent sans limite
- Amélioration possible : expiration, déduplication

### Recherche basique
- Top-K simple sans filtrage avancé
- Amélioration possible : filtres par métadonnées, dates

---

## 🚀 Améliorations futures (Lab 4+)

- [ ] Embeddings professionnels (OpenAI API)
- [ ] Résumé automatique de la mémoire
- [ ] Expiration des souvenirs anciens
- [ ] Fusion avec buffer memory (hybride)
- [ ] Export/Import de la base

---

## 📦 Livrables Lab 3

✅ Code fonctionnel : `module2-lab3-vector-store.js`
✅ ChromaDB configuré et testé
✅ Recherche sémantique opérationnelle
✅ Persistance validée (survit à la fermeture)
✅ Documentation complète : Ce fichier

---

## 🔜 Prochaine étape : Lab 4

**Lab 4 - Mémoire Résumée (Summarization)**
- Condenser l'historique pour économiser les tokens
- Garder l'essentiel sans tout stocker
- Mémoire hybride : Buffer + Summary + Vector

---

**Date** : 23 novembre 2025
**Module** : Module 2 - Les Agents à Mémoire
**Lab** : 3/6

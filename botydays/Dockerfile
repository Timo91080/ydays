# Lab 8 - Dockerfile pour l'Agent Réactif
# Image de base Node.js LTS
FROM node:20-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier le code source
COPY src/ ./src/
COPY .env.example ./

# Créer un utilisateur non-root pour la sécurité
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Passer à l'utilisateur non-root
USER appuser

# Exposer le port (optionnel, pour future interface web)
EXPOSE 3000

# Variables d'environnement par défaut (à surcharger avec --env-file)
ENV NODE_ENV=production

# Commande de démarrage
CMD ["node", "src/main.js"]

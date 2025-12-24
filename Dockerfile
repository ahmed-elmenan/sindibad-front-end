# Étape 1 : build
FROM node:20-alpine AS build

WORKDIR /app

# Copier uniquement les fichiers de dépendances pour optimiser le cache Docker
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du code source
COPY . .

# Modifier la commande build pour s'assurer que les chemins sont correctement résolus
RUN npm run build || (echo "Build failed. Checking for path alias issues..." && ls -la src/ && exit 1)

# Étape 2 : production avec Nginx
FROM nginx:stable-alpine

# Supprimer le contenu par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copier le build Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Ajouter une configuration Nginx pour gérer les routes SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 3000

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]

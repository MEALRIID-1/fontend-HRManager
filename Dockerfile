# ── ÉTAPE 1 : Build ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les dépendances en premier (optimisation cache)
COPY package.json package-lock.json* ./
RUN npm ci

# Copier le reste du code
COPY . .

# URL du backend Laravel (obligatoire : passer via --build-arg)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
# Builder l'application
RUN npm run build

# ── ÉTAPE 2 : Production ─────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Copier uniquement ce qui est nécessaire depuis le builder
COPY --from=builder /app/public            ./public
COPY --from=builder /app/.next/standalone  ./
COPY --from=builder /app/.next/static      ./.next/static

# Droits sur les fichiers
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
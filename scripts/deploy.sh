#!/bin/bash
# ==============================================================================
# ROBÔ LED PARTNER — PROXMOX / DOCKER DEPLOYMENT SCRIPT
# ==============================================================================

set -euo pipefail

echo "=================================================================="
echo "  ROBÔ LED PARTNER — INICIANDO DEPLOY EM PRODUÇÃO                "
echo "=================================================================="

# Check if .env exists
if [ ! -f .env ]; then
  echo "ERRO: Arquivo .env não encontrado!"
  echo "Copie .env.example para .env e preencha as variáveis antes do deploy."
  exit 1
fi

# 1. Pull latest code from GitHub
echo "--> 1. Baixando atualizações do Git..."
git pull origin main

# 2. Build and start containers
echo "--> 2. Compilando imagens Docker..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "--> 3. Subindo banco de dados e cache..."
docker compose -f docker-compose.prod.yml up -d postgres redis

# 4. Wait for database health
echo "--> 4. Aguardando banco de dados ficar pronto..."
sleep 5

# 5. Run Prisma database migrations
echo "--> 5. Executando migrações do banco de dados (Prisma)..."
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# 6. Start all services
echo "--> 6. Inicializando aplicação, Nginx e Cloudflare Tunnel..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "--> 7. Verificando integridade (Health Check)..."
sleep 5
docker compose -f docker-compose.prod.yml ps

echo "=================================================================="
echo "  DEPLOY CONCLUÍDO COM SUCESSO!                                  "
echo "  Acesse: https://marketing.roboledpartner.com.br                "
echo "=================================================================="

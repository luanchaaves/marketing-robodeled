# Guia de Deploy em Produção — Proxmox & Cloudflare Tunnel

Este documento detalha o processo completo para provisionar e hospedar a **Plataforma Privada de Marketing Robô LED Partner** em um servidor Linux no ambiente Proxmox VE, protegida por Cloudflare Tunnel sob o domínio `marketing.roboledpartner.com.br`.

---

## 1. Requisitos do Sistema

- **Host:** Proxmox VE (Container LXC ou VM dedicada)
- **Sistema Operacional:** Ubuntu 22.04/24.04 LTS ou Debian 12
- **Recursos Mínimos Recomendados:**
  - 2 vCPUs
  - 4 GB de memória RAM
  - 30 GB de armazenamento SSD
- **Portas:** Nenhuma porta de entrada pública precisa ser aberta no firewall/roteador (graças ao Cloudflare Zero Trust Tunnel).

---

## 2. Preparação do Servidor Proxmox

### 2.1. Instalação do Docker e Docker Compose

```bash
# Atualizar repositórios do sistema
sudo apt update && sudo apt upgrade -y

# Instalar pacotes pré-requisito
sudo apt install -y ca-certificates curl gnupg lsb-release git ufw

# Adicionar chave GPG oficial do Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Adicionar repositório oficial do Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine, CLI e Plugin Docker Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Habilitar e iniciar o serviço Docker
sudo systemctl enable docker
sudo systemctl start docker
```

---

## 3. Instalação e Configuração da Aplicação

### 3.1. Clonagem do Repositório

```bash
cd /opt
sudo git clone https://github.com/luanchaaves/marketing-robodeled.git
sudo chown -R $USER:$USER /opt/marketing-robodeled
cd /opt/marketing-robodeled
```

### 3.2. Configuração do Arquivo `.env`

Copie o template de variáveis de ambiente e preencha os valores de produção:

```bash
cp .env.example .env
nano .env
```

> [!IMPORTANT]
> Gere senhas fortes e uma chave de sessão segura:
> ```bash
> openssl rand -hex 32
> ```
> Preencha `SESSION_SECRET`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD` e o `CLOUDFLARE_TUNNEL_TOKEN`.

---

## 4. Configuração do Cloudflare Zero Trust Tunnel

O Cloudflare Tunnel permite expor a aplicação sem necessidade de IP público fixo ou abertura de portas 80/443 no roteador do provedor.

1. Acesse o painel **Cloudflare Zero Trust** (`one.dash.cloudflare.com`).
2. Vá em **Networks** -> **Tunnels** -> **Create a Tunnel**.
3. Escolha **Cloudflared** e dê o nome `roboled-marketing`.
4. Copie o **Token do Tunnel** e cole na variável `CLOUDFLARE_TUNNEL_TOKEN` no arquivo `.env`.
5. Na aba **Public Hostnames**:
   - **Subdomain:** `marketing`
   - **Domain:** `roboledpartner.com.br`
   - **Type:** `HTTP`
   - **URL:** `nginx:80` (quando rodando pelo docker-compose) ou `localhost:80`
6. Salve o Hostname. O certificado SSL/TLS de ponta a ponta é provisionado automaticamente pela Cloudflare.

---

## 5. Inicialização dos Contêineres em Produção

Execute o script de automação ou inicie manualmente via Docker Compose:

```bash
# Permissão de execução para os scripts utilitários
chmod +x scripts/*.sh

# Executar deploy completo
./scripts/deploy.sh
```

Ou execute passo a passo:

```bash
# 1. Compilar imagens e subir infraestrutura
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d postgres redis

# 2. Executar migrações do banco de dados
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# 3. Subir todos os serviços (App, Nginx, Cloudflared)
docker compose -f docker-compose.prod.yml up -d
```

---

## 6. Criação do Primeiro Administrador

Como o sistema é estritamente privado, não há cadastro público. Para criar o primeiro usuário Administrador:

### Opção A: Via CLI no Servidor (Recomendado)
```bash
docker compose -f docker-compose.prod.yml exec app npm run setup:admin "Luan Chaves" "luan@roboledpartner.com.br" "SuaSenhaUltraSegura123@"
```

### Opção B: Via Interface Web Inicial
Acesse no navegador:
`https://marketing.roboledpartner.com.br/setup-admin`
(Esta rota só permite criação se não houver nenhum administrador registrado no banco de dados).

---

## 7. Verificação de Saúde e Logs

```bash
# Status dos contêineres
docker compose -f docker-compose.prod.yml ps

# Logs em tempo real da aplicação
docker compose -f docker-compose.prod.yml logs -f app

# Health check local
curl http://localhost:4000/health
```

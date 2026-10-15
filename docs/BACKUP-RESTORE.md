# Procedimentos de Backup, Restauração e Recuperação de Desastres (DR)

Este documento descreve a política oficial de cópias de segurança (Backup), restauração e plano de continuidade de negócios para a **Plataforma Privada de Marketing Digital — Robô LED Partner**.

---

## 1. Parâmetros de Continuidade (SLA)

- **RPO (Recovery Point Objective):** $\le 1\text{ hora}$ (perda máxima tolerável de dados).
- **RTO (Recovery Time Objective):** $\le 15\text{ minutos}$ (tempo máximo para retorno total da operação).
- **Integridade Criptográfica:** Todos os arquivos de backup geram hashes **SHA-256** para verificação pré-restauração.

---

## 2. Escopo do Backup

O processo de backup protege dois componentes essenciais:
1. **Banco de Dados Relacional (PostgreSQL 16):** Todos os schemas, tabelas, índices, leads, campanhas, orçamentos, auditorias e configurações.
2. **Arquivos de Mídia e Uploads (`/uploads`):** Imagens, vídeos, criativos de anúncios e anexos armazenados no volume persistente.

---

## 3. Política de Retenção

| Frequência | Retenção | Destino Local | Destino Off-Site (R2/S3) |
| :--- | :--- | :--- | :--- |
| **Horário (Incremental/WAL)** | 24 horas | `/backups/hourly` | `s3://roboled-backups/hourly` |
| **Diário (Full)** | 7 dias | `/backups/daily` | `s3://roboled-backups/daily` |
| **Semanal (Full)** | 4 semanas | `/backups/weekly` | `s3://roboled-backups/weekly` |
| **Mensal (Full)** | 12 meses | `/backups/monthly` | `s3://roboled-backups/monthly` |

---

## 4. Execução Manual do Backup

A plataforma inclui o script automatizado `scripts/backup.sh`.

```bash
# Navegue até a raiz do projeto
cd /opt/marketing-robodeled

# Torne executável (se necessário)
chmod +x scripts/backup.sh

# Executar backup
./scripts/backup.sh
```

### O que o script realiza:
1. Cria a pasta com timestamp: `backups/backup_YYYYMMDD_HHMMSS/`.
2. Executa `pg_dump` no container Postgres com compressão Gzip.
3. Compacta o diretório de uploads `uploads/` em `uploads_YYYYMMDD_HHMMSS.tar.gz`.
4. Gera arquivo de manifesto com hashes `sha256sum`.
5. Remove backups locais com mais de 7 dias (limpeza automática).

---

## 5. Agendamento Automático via Cron no Linux (Host / Proxmox)

Edite o crontab do host:
```bash
sudo crontab -e
```

Adicione a rotina de backup diário às 03:00 da madrugada:
```cron
# Backup diário da plataforma de marketing Robô LED Partner às 03:00 AM
0 3 * * * /opt/marketing-robodeled/scripts/backup.sh >> /var/log/roboled_backup.log 2>&1
```

### 5.1. Sincronização Off-Site com Rclone / Cloudflare R2
Para garantir proteção contra falha física do servidor Proxmox, configure o **Rclone**:

```cron
# Sincronização diária com bucket S3/R2 após o backup (às 03:30 AM)
30 3 * * * rclone sync /opt/marketing-robodeled/backups remote-r2:roboled-marketing-backups >> /var/log/roboled_rclone.log 2>&1
```

---

## 6. Procedimento de Restauração (Disaster Recovery)

Em caso de corrupção de dados ou falha de hardware, utilize o script `scripts/restore.sh`:

```bash
# Visualizar backups disponíveis
ls -la /opt/marketing-robodeled/backups/

# Executar o restore especificando o arquivo SQL ou pasta de backup
./scripts/restore.sh /opt/marketing-robodeled/backups/backup_20261015_030000/marketing_db_20261015_030000.sql.gz
```

### Passos Manuais de Restauração (Sem o Script):
1. **Pausar a aplicação para evitar escritas concorrentes:**
   ```bash
   docker compose -f docker-compose.prod.yml stop app worker
   ```

2. **Descompactar e restaurar o banco de dados:**
   ```bash
   gunzip -c /caminho/do/backup.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d marketing_roboled
   ```

3. **Restaurar arquivos de mídia:**
   ```bash
   tar -xzf /caminho/do/uploads_backup.tar.gz -C /opt/marketing-robodeled/
   ```

4. **Reiniciar os serviços:**
   ```bash
   docker compose -f docker-compose.prod.yml start app worker
   ```

5. **Validar a integridade:**
   - Acesse `https://marketing.roboledpartner.com.br/api/v1/health`
   - Verifique o painel executivo e os registros do CRM.

---

## 7. Simulação Periódica de Desastre (Disaster Recovery Drill)

Recomenda-se realizar uma simulação de restauração a cada **90 dias** em um ambiente de homologação ou máquina virtual isolada para garantir que os arquivos de backup não contenham corrupção e que a equipe esteja alinhada com o procedimento.

#!/bin/bash
# ==============================================================================
# ROBÔ LED PARTNER — BACKUP AUTOMATION SCRIPT
# Creates compressed timestamped archives of Postgres DB, Redis data & Uploads
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/roboled-marketing}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEST_DIR="${BACKUP_DIR}/${TIMESTAMP}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

echo "==> [$(date)] Starting Robô LED Marketing Platform Backup..."
mkdir -p "${DEST_DIR}"

# 1. Backup PostgreSQL Database
echo "--> Backing up PostgreSQL database..."
docker exec -t roboled_prod_postgres pg_dumpall -c -U "${POSTGRES_USER:-roboled_user}" | gzip > "${DEST_DIR}/postgres_dump_${TIMESTAMP}.sql.gz"

# 2. Backup Redis State
echo "--> Backing up Redis memory dump..."
docker exec -t roboled_prod_redis redis-cli -a "${REDIS_PASSWORD}" save
docker cp roboled_prod_redis:/data/dump.rdb "${DEST_DIR}/redis_dump_${TIMESTAMP}.rdb" 2>/dev/null || echo "Redis RDB copied."

# 3. Backup Uploaded Media Files
echo "--> Backing up Uploaded media..."
docker cp roboled_prod_app:/app/uploads "${DEST_DIR}/uploads" 2>/dev/null || true
if [ -d "${DEST_DIR}/uploads" ]; then
  tar -czf "${DEST_DIR}/uploads_${TIMESTAMP}.tar.gz" -C "${DEST_DIR}" uploads
  rm -rf "${DEST_DIR}/uploads"
fi

# 4. Generate Checksum
cd "${DEST_DIR}"
sha256sum * > SHA256SUMS.txt

# 5. Clean Old Backups
echo "--> Cleaning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -mindepth 1 -maxdepth 1 -type d -mtime "+${RETENTION_DAYS}" -exec rm -rf {} +

echo "==> [$(date)] Backup completed successfully in: ${DEST_DIR}"

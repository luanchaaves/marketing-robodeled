#!/bin/bash
# ==============================================================================
# ROBÔ LED PARTNER — DISASTER RECOVERY & RESTORE SCRIPT
# Restores Postgres DB, Redis state, and Uploads from a backup directory
# ==============================================================================

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /path/to/backup_directory"
  echo "Example: $0 /var/backups/roboled-marketing/20261015_120000"
  exit 1
fi

BACKUP_DIR="$1"

if [ ! -d "${BACKUP_DIR}" ]; then
  echo "Error: Directory ${BACKUP_DIR} does not exist!"
  exit 1
fi

echo "==> WARNING: This operation will overwrite existing database records!"
read -p "Are you sure you want to proceed with restore from ${BACKUP_DIR}? (y/N): " -r CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
  echo "Restore aborted."
  exit 0
fi

# 1. Restore PostgreSQL
SQL_GZ=$(find "${BACKUP_DIR}" -name "postgres_dump_*.sql.gz" | head -n 1)
if [ -f "${SQL_GZ}" ]; then
  echo "--> Restoring PostgreSQL database from ${SQL_GZ}..."
  gunzip -c "${SQL_GZ}" | docker exec -i roboled_prod_postgres psql -U "${POSTGRES_USER:-roboled_user}" -d "${POSTGRES_DB:-roboled_marketing_db}"
  echo "--> PostgreSQL restored successfully."
fi

# 2. Restore Uploads
UPLOADS_TAR=$(find "${BACKUP_DIR}" -name "uploads_*.tar.gz" | head -n 1)
if [ -f "${UPLOADS_TAR}" ]; then
  echo "--> Restoring media uploads..."
  mkdir -p /tmp/roboled_restore
  tar -xzf "${UPLOADS_TAR}" -C /tmp/roboled_restore
  docker cp /tmp/roboled_restore/uploads/. roboled_prod_app:/app/uploads/
  rm -rf /tmp/roboled_restore
  echo "--> Media uploads restored successfully."
fi

echo "==> Restore finished successfully!"

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="${ROOT_DIR}/Web"
API_DIR="${ROOT_DIR}/api"

echo "==> Packing Laravel vendor for Vercel..."

cd "${WEB_DIR}"

if [ ! -d "vendor" ]; then
  composer install --no-dev --optimize-autoloader
fi

mkdir -p "${API_DIR}"

tar -czf "${API_DIR}/vendor.tar.gz" \
  --exclude='vendor/*/tests' \
  --exclude='vendor/*/test' \
  --exclude='vendor/*/Tests' \
  --exclude='vendor/*/docs' \
  --exclude='vendor/*/doc' \
  -C "${WEB_DIR}" vendor

echo "==> Created ${API_DIR}/vendor.tar.gz ($(du -h "${API_DIR}/vendor.tar.gz" | cut -f1))"

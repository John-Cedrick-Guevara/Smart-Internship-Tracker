#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="${ROOT_DIR}/Web"
API_DIR="${ROOT_DIR}/api"
LARAVEL_DIR="${API_DIR}/laravel"
PHP_FPM_BIN="${API_DIR}/php-fpm-bin"
PHP_FPM_URL="${PHP_FPM_URL:-https://github.com/crazywhalecc/static-php-cli/releases/download/v2.5.0/php-8.4.0-micro-linux-x86_64.tar.gz}"

echo "==> Preparing Laravel source for Vercel..."

rm -rf "${LARAVEL_DIR}"
mkdir -p "${LARAVEL_DIR}"

RSYNC_EXCLUDES=(
  --exclude 'node_modules'
  --exclude 'vendor'
  --exclude '.env'
  --exclude 'storage/logs/*'
  --exclude 'storage/framework/cache/data/*'
  --exclude 'storage/framework/sessions/*'
  --exclude 'storage/framework/views/*'
  --exclude 'database/database.sqlite'
)

if command -v rsync >/dev/null 2>&1; then
  rsync -a "${RSYNC_EXCLUDES[@]}" "${WEB_DIR}/" "${LARAVEL_DIR}/"
else
  cp -R "${WEB_DIR}/." "${LARAVEL_DIR}/"
  rm -rf "${LARAVEL_DIR}/node_modules" "${LARAVEL_DIR}/vendor"
fi

mkdir -p "${LARAVEL_DIR}/storage/app/public"
mkdir -p "${LARAVEL_DIR}/storage/framework/cache/data"
mkdir -p "${LARAVEL_DIR}/storage/framework/sessions"
mkdir -p "${LARAVEL_DIR}/storage/framework/views"
mkdir -p "${LARAVEL_DIR}/storage/logs"
mkdir -p "${LARAVEL_DIR}/bootstrap/cache"

cat > "${LARAVEL_DIR}/public/index.php" <<'PHP'
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$vendorPath = '/tmp/vendor';
$basePath = dirname(__DIR__);

if (file_exists($maintenance = $basePath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $vendorPath.'/autoload.php';

/** @var Application $app */
$app = require_once $basePath.'/bootstrap/app.php';

$app->useStoragePath(getenv('VERCEL_STORAGE_PATH') ?: '/tmp/storage');

$app->handleRequest(Request::capture());
PHP

echo "==> Downloading static PHP-FPM binary..."

if [ ! -f "${PHP_FPM_BIN}" ]; then
  TMP_TAR="$(mktemp)"
  curl -fsSL "${PHP_FPM_URL}" -o "${TMP_TAR}"
  tar -xzf "${TMP_TAR}" -C "${API_DIR}"
  rm -f "${TMP_TAR}"

  if [ -f "${API_DIR}/php" ]; then
    mv "${API_DIR}/php" "${PHP_FPM_BIN}"
  elif [ -f "${API_DIR}/php-fpm" ]; then
    mv "${API_DIR}/php-fpm" "${PHP_FPM_BIN}"
  fi

  chmod +x "${PHP_FPM_BIN}" 2>/dev/null || true
fi

if [ ! -f "${PHP_FPM_BIN}" ]; then
  echo "WARNING: PHP-FPM binary not found. Vercel deploy may fail until scripts/setup.sh is run."
fi

echo "==> Vercel prepare complete."

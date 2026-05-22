#!/usr/bin/env bash
set -euo pipefail

DRY_RUN=""

print_usage() {
  echo "Usage: $0 [-d]"
  echo "  -d  Dry-run (show what would be removed)"
  exit 1
}

while getopts "dh" opt; do
  case "$opt" in
    d) DRY_RUN="yes" ;;
    h) print_usage ;;
    *) print_usage ;;
  esac
done

echo "==> Docker Cleanup"

if [ -n "$DRY_RUN" ]; then
  echo "[DRY-RUN] Containers to remove:"
  docker ps -a --filter "ancestor=auth-service" --format "{{.Names}}" 2>/dev/null || echo "  (none)"
  echo "[DRY-RUN] Images to remove:"
  docker images "auth-service*" --format "{{.Repository}}:{{.Tag}}" 2>/dev/null || echo "  (none)"
  echo "[DRY-RUN] Dangling images:"
  docker images -f "dangling=true" --format "{{.ID}} {{.Repository}}" 2>/dev/null || echo "  (none)"
  exit 0
fi

echo "  Removing stopped containers..."
docker container prune -f > /dev/null 2>&1 || true

echo "  Removing dangling images..."
docker image prune -f > /dev/null 2>&1 || true

echo "  Removing unused networks..."
docker network prune -f > /dev/null 2>&1 || true

echo "==> Cleanup complete"

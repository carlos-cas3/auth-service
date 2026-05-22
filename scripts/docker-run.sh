#!/usr/bin/env bash
set -euo pipefail

NAME="auth-service"
VERSION="latest"
PORT="3006"
ENV_FILE=".env"
DETACH=""
ENVIRONMENT="production"

print_usage() {
  echo "Usage: $0 [-n name] [-t version] [-p port] [-e env_file] [-d] [-E environment]"
  echo "  -n  Image name (default: auth-service)"
  echo "  -t  Image tag (default: latest)"
  echo "  -p  Host port mapping (default: 3006)"
  echo "  -e  Env file path (default: .env)"
  echo "  -d  Detach mode"
  echo "  -E  Environment: production | development (default: production)"
  exit 1
}

while getopts "n:t:p:e:E:dh" opt; do
  case "$opt" in
    n) NAME="$OPTARG" ;;
    t) VERSION="$OPTARG" ;;
    p) PORT="$OPTARG" ;;
    e) ENV_FILE="$OPTARG" ;;
    E) ENVIRONMENT="$OPTARG" ;;
    d) DETACH="-d" ;;
    h) print_usage ;;
    *) print_usage ;;
  esac
done

CONTAINER_NAME="${NAME}-${ENVIRONMENT}"

# Stop and remove existing container if any
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "==> Removing existing container: ${CONTAINER_NAME}"
  docker rm -f "$CONTAINER_NAME" > /dev/null
fi

echo "==> Running ${NAME}:${VERSION} on port ${PORT} (env=${ENVIRONMENT})"
echo "    Container name: ${CONTAINER_NAME}"

docker run $DETACH \
  --name "$CONTAINER_NAME" \
  -p "${PORT}:3006" \
  --env-file "$ENV_FILE" \
  --add-host host.docker.internal:host-gateway \
  --restart unless-stopped \
  "${NAME}:${VERSION}"

if [ -n "$DETACH" ]; then
  echo "==> Container started: ${CONTAINER_NAME}"
  echo "    docker logs -f ${CONTAINER_NAME}"
else
  echo "==> Container stopped"
fi

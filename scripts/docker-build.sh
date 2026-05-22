#!/usr/bin/env bash
set -euo pipefail

NAME="auth-service"
VERSION="latest"
ENV="production"
PLATFORM=""

print_usage() {
  echo "Usage: $0 [-n name] [-t version] [-e environment] [-p platform]"
  echo "  -n  Image name (default: auth-service)"
  echo "  -t  Image tag (default: latest)"
  echo "  -e  Environment: production | development (default: production)"
  echo "  -p  Target platform (e.g. linux/amd64, linux/arm64)"
  exit 1
}

while getopts "n:t:e:p:h" opt; do
  case "$opt" in
    n) NAME="$OPTARG" ;;
    t) VERSION="$OPTARG" ;;
    e) ENV="$OPTARG" ;;
    p) PLATFORM="$OPTARG" ;;
    h) print_usage ;;
    *) print_usage ;;
  esac
done

DOCKERFILE="Dockerfile"
TARGET="runtime"

if [ "$ENV" = "development" ]; then
  DOCKERFILE="Dockerfile.dev"
  TARGET=""
fi

BUILD_ARGS=(
  -t "${NAME}:${VERSION}"
  -f "$DOCKERFILE"
)

if [ -n "$TARGET" ]; then
  BUILD_ARGS+=(--target "$TARGET")
fi

if [ -n "$PLATFORM" ]; then
  BUILD_ARGS+=(--platform "$PLATFORM")
fi

echo "==> Building ${NAME}:${VERSION} (env=${ENV})"
echo "    Dockerfile: ${DOCKERFILE}"
[ -n "$TARGET" ] && echo "    Target: ${TARGET}"
[ -n "$PLATFORM" ] && echo "    Platform: ${PLATFORM}"

docker build "${BUILD_ARGS[@]}" .

echo "==> Build complete: ${NAME}:${VERSION}"

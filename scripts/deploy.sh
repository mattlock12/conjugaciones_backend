#!/usr/bin/env bash
# Runs on the droplet (invoked over SSH by .github/workflows/deploy.yml).
# Pulls master, rebuilds the images, builds the client bundle, restarts the
# stack and applies migrations.
set -euo pipefail

cd "${DEPLOY_PATH:?DEPLOY_PATH must be set}"

compose() {
  docker compose -f docker-compose.yml -f docker-compose.prod.yml "$@"
}

echo "==> Updating code"
git fetch --prune origin master
# fails loudly instead of clobbering anything if the server checkout has diverged
git merge --ff-only origin/master
git log -1 --oneline

echo "==> Building images"
# the client sits in the "build" profile, which a plain `build` would skip
compose --profile build build

echo "==> Building client bundle into ./static"
compose run --rm client

echo "==> Starting services"
compose up -d --remove-orphans

echo "==> Applying migrations"
compose exec -T backend python manage.py migrate --noinput

echo "==> Pruning dangling images"
docker image prune -f

compose ps

#!/usr/bin/env bash
# Runs on the droplet (invoked over SSH by .github/workflows/deploy.yml).
# Moves the checkout to the commit being deployed, rebuilds the images,
# restarts the stack and applies migrations. The client bundle is built by the
# workflow and uploaded into ./static after this script succeeds.
set -euo pipefail

cd "${DEPLOY_PATH:?DEPLOY_PATH must be set}"

compose() {
  docker compose -f docker-compose.yml -f docker-compose.prod.yml "$@"
}

echo "==> Updating code"
git fetch --prune origin master
# DEPLOY_SHA is the commit the workflow built the bundle from; fall back to the
# tip of master when run by hand. --ff-only fails loudly instead of clobbering
# anything if the server checkout has diverged.
git merge --ff-only "${DEPLOY_SHA:-origin/master}"
git log -1 --oneline

echo "==> Building images"
# skips the client image (profile "build"): the bundle is built in CI
compose build

echo "==> Starting services"
compose up -d --remove-orphans

echo "==> Reloading nginx config"
# nginx.conf is bind-mounted, so editing it doesn't make `up` recreate nginx
compose exec -T nginx nginx -s reload

echo "==> Applying migrations"
compose exec -T backend python manage.py migrate --noinput

echo "==> Pruning dangling images"
docker image prune -f

compose ps

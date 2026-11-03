#!/usr/bin/env bash
# Deploy the local working tree (including uncommitted changes) to production.
# Uploads every tracked or untracked-but-not-ignored file to ~/minewolf/src on
# the server, then rebuilds the image, runs migrations and restarts the app.
set -euo pipefail

HOST="${DEPLOY_HOST:-hetzner-arch}"
DIR="${DEPLOY_DIR:-minewolf}" # relative to the remote home directory

cd "$(dirname "$0")/.."

rev="$(git rev-parse --short HEAD)"
[[ -n "$(git status --porcelain)" ]] && rev+="+dirty"
echo "Uploading $rev to $HOST..."

# Skip tracked files that were deleted locally but not yet committed.
git ls-files -z -co --exclude-standard |
    while IFS= read -r -d '' f; do [[ -e "$f" ]] && printf '%s\0' "$f"; done |
    COPYFILE_DISABLE=1 tar --no-xattrs --null -czf - -T - |
    ssh "$HOST" "set -e
        cd ~/$DIR
        rm -rf src.new && mkdir src.new
        tar -xzf - -C src.new
        rm -rf src.old
        if [ -d src ]; then mv src src.old; fi
        mv src.new src
        rm -rf src.old"

echo "Building and restarting..."
ssh "$HOST" "set -e
    cd ~/$DIR
    docker compose build migrate
    docker compose up -d --remove-orphans
    docker image prune -f >/dev/null"

echo "Deployed $rev."

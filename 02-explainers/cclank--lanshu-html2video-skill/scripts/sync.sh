#!/usr/bin/env bash
# Sync the skill's template (the source of truth) into the runtime studio, which
# is where node_modules lives. Source never lives in two places: edit the
# template, run this, then typecheck/render in the studio.
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE="$SKILL_DIR/assets/template"
STUDIO="${H2V_STUDIO:-$HOME/.cache/html2video/studio}"

mkdir -p "$STUDIO/public/fonts"

# Config files.
for f in package.json tsconfig.json remotion.config.ts; do
  [ -f "$TEMPLATE/$f" ] && cp "$TEMPLATE/$f" "$STUDIO/$f"
done

# Source and build scripts. --delete so a file removed from the template does
# not linger in the studio and keep typechecking.
rsync -a --delete "$TEMPLATE/src/" "$STUDIO/src/"
if [ -d "$TEMPLATE/studio-scripts" ]; then
  rsync -a --delete "$TEMPLATE/studio-scripts/" "$STUDIO/scripts/"
fi

echo "synced template -> $STUDIO"

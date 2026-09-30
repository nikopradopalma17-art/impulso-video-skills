#!/usr/bin/env bash
# Uninstall claude-gif skill from Claude Code
set -euo pipefail

SKILLS_DIR="${HOME}/.claude/skills"

echo "Uninstalling claude-gif skill..."

for skill in claude-gif claude-gif-create claude-gif-generate claude-gif-convert claude-gif-optimize claude-gif-edit; do
    if [ -d "${SKILLS_DIR}/${skill}" ]; then
        rm -rf "${SKILLS_DIR}/${skill}"
        echo "  Removed: $skill"
    fi
done

echo "claude-gif uninstalled."

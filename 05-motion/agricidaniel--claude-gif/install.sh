#!/usr/bin/env bash
# Install claude-gif skill for Claude Code
# Usage: bash install.sh
set -euo pipefail

SKILLS_DIR="${HOME}/.claude/skills"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing claude-gif skill..."

# Copy skill directories
for skill in claude-gif claude-gif-create claude-gif-generate claude-gif-convert claude-gif-optimize claude-gif-edit; do
    src="${SCRIPT_DIR}/skills/${skill}"
    dest="${SKILLS_DIR}/${skill}"
    if [ -d "$src" ]; then
        mkdir -p "$dest"
        cp -r "$src"/* "$dest"/
        echo "  Installed: $skill"
    fi
done

# Make scripts executable
chmod +x "${SKILLS_DIR}/claude-gif/scripts/"*.sh "${SKILLS_DIR}/claude-gif/scripts/"*.py 2>/dev/null || true

# Create output directory
mkdir -p "${HOME}/Documents/gif_output"
mkdir -p /tmp/claude-gif

echo ""
echo "claude-gif installed successfully!"
echo ""
echo "Usage:"
echo "  /gif              Interactive mode"
echo "  /gif create       Programmatic GIF (Remotion)"
echo "  /gif generate     AI video to GIF (Veo 3.1)"
echo "  /gif convert      Video/images/SVG to GIF"
echo "  /gif optimize     Reduce file size"
echo "  /gif edit         Modify existing GIF"
echo "  /gif setup        Install dependencies (gifsicle)"
echo ""
echo "Run '/gif setup' to check and install dependencies."

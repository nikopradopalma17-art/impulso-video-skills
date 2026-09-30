from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills" / "book-video-production"
REQUIRED = [
    SKILL / "SKILL.md",
    SKILL / "agents" / "openai.yaml",
    SKILL / "references" / "editorial-style.md",
    SKILL / "references" / "music-mix.md",
    SKILL / "references" / "premium-literary-style.md",
    SKILL / "references" / "production-schema.md",
    SKILL / "references" / "quality-gates.md",
    SKILL / "references" / "visual-assets-and-cover.md",
]

errors = []
for path in REQUIRED:
    if not path.is_file():
        errors.append(f"missing: {path.relative_to(ROOT)}")

if (SKILL / "SKILL.md").is_file():
    text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not match:
        errors.append("SKILL.md must begin with YAML frontmatter")
    else:
        frontmatter = match.group(1)
        if not re.search(r"^name:\s*book-video-production\s*$", frontmatter, re.MULTILINE):
            errors.append("frontmatter name must be book-video-production")
        if not re.search(r"^description:\s*\S", frontmatter, re.MULTILINE):
            errors.append("frontmatter description is required")
        keys = re.findall(r"^([A-Za-z0-9_-]+):", frontmatter, re.MULTILINE)
        if set(keys) != {"name", "description"}:
            errors.append("frontmatter may contain only name and description")

if errors:
    print("Validation failed:")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Skill package validation passed.")

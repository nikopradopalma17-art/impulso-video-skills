#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Importa las 7 skills de estilo de IMPULSO IA (instaladas en ~/.zcode/skills)
al repo, en forma portable para que cualquiera las copie a su propio agente.

Por estilo genera:
  estilos/<id>/SKILL.md          <- la skill (texto pegable en cualquier carpeta de skills)
  estilos/<id>/referencia/anim.html  <- maquinaria validada del estilo
Y una sola vez:
  estilos/fuentes/               <- TTFs del motor (Google Fonts, SIL OFL)
  estilos/LEEME.md               <- como usarlos + licencias

Las rutas absolutas de fuentes (file:///C:/Users/.../motor-estilos-video/fonts/)
se reescriben a rutas relativas ../../fuentes/ para que funcionen en cualquier maquina.
Reejecutable: recrea cada estilos/<id> y sobreescribe fuentes.

Uso:
    python scripts/importar_estilos.py [--skills-dir C:/Users/USER/.zcode/skills]
"""
import argparse
import shutil
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = Path(__file__).resolve().parent.parent
DESTINO = BASE / "estilos"

ESTILOS = [
    "bauhaus", "ciencia-animada", "grafico-datos", "izometrico",
    "linograbado", "pizarra-blanca", "pizarra-negra",
]
PREFIJO = "video-estilo-"
URL_FUENTES_ABS = "file:///C:/Users/USER/.zcode/skills/motor-estilos-video/fonts/"

LEEME = """# Estilos de video IMPULSO IA

7 estilos de diseño de video listos para copiar y pegar en tu agente de código
(Claude Code, Codex, ZCode...). Cada carpeta ES la skill:

```
estilos/<estilo>/
├── SKILL.md              <- la skill completa: biblia del estilo + contrato técnico
└── referencia/anim.html  <- implementación validada del motor del estilo
estilos/fuentes/          <- tipografías (Google Fonts, SIL OFL)
```

## Cómo usarlos

1. **Opción rápida**: copia la carpeta del estilo que quieras a tu directorio de
   skills (`~/.claude/skills/` en Claude Code, o el equivalente de tu agente) y
   pídele el estilo por su nombre. También puedes pegar solo el contenido del
   `SKILL.md` como instrucciones en tu prompt.
2. **Opción completa**: copia el estilo Y la carpeta `fuentes/` (el `SKILL.md`
   referencia las fuentes en `../../fuentes/`), así el motor renderiza en tu
   máquina sin descargar nada más.
3. El landing del repo tiene un botón "Copiar SKILL.md" por estilo.

## Qué hay en cada estilo

Cada `SKILL.md` define la biblia visual (paleta estricta, tipografía, lenguaje
de movimiento, prohibiciones), la estructura narrativa y el contrato técnico
del `anim.html` (canvas 1920x1080, `window.draw({t})` pura y determinista,
renderizable con Chrome headless + ffmpeg a mp4/GIF).

## Licencias

- Estilos y documentación: © IMPULSO IA (Nikolas Prado) — úsalos, adáptalos y
  redis-tribúyelos con atribución.
- Tipografías en `fuentes/`: Google Fonts bajo SIL Open Font License
  (Archivo Black, Anton, Bangers, Baloo 2, Caveat, Fredoka, Inter, JetBrains
  Mono, Orbitron, Patrick Hand, Playfair Display, Poppins, Press Start 2P,
  Righteous, Share Tech Mono, Space Grotesk, Alfa Slab One).
"""


def portabilizar(texto: str) -> str:
    return texto.replace(URL_FUENTES_ABS, "../../fuentes/")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--skills-dir", default="C:/Users/USER/.zcode/skills")
    args = ap.parse_args()
    origen_skills = Path(args.skills_dir)

    if not origen_skills.exists():
        raise SystemExit(f"no existe la carpeta de skills: {origen_skills}")

    DESTINO.mkdir(exist_ok=True)
    (DESTINO / "LEEME.md").write_text(LEEME, encoding="utf-8")

    fonts_src = origen_skills / "motor-estilos-video" / "fonts"
    fonts_dst = DESTINO / "fuentes"
    fonts_dst.mkdir(exist_ok=True)
    n_fonts = 0
    for f in sorted(fonts_src.glob("*.ttf")):
        shutil.copy2(f, fonts_dst / f.name)
        n_fonts += 1

    reporte = []
    for estilo in ESTILOS:
        src = origen_skills / (PREFIJO + estilo)
        dst = DESTINO / estilo
        skill = src / "SKILL.md"
        anim = src / "referencia" / "anim.html"
        if not skill.exists() or not anim.exists():
            raise SystemExit(f"faltan archivos en {src} (SKILL.md o referencia/anim.html)")
        if dst.exists():
            shutil.rmtree(dst)  # carpeta generada por este script: seguro recrear
        (dst / "referencia").mkdir(parents=True)
        (dst / "SKILL.md").write_text(portabilizar(skill.read_text(encoding="utf-8")), encoding="utf-8")
        (dst / "referencia" / "anim.html").write_text(portabilizar(anim.read_text(encoding="utf-8")), encoding="utf-8")
        reporte.append(estilo)

    print(f"estilos/ importado: {len(reporte)} estilos ({', '.join(reporte)}) + {n_fonts} fuentes")
    return 0


if __name__ == "__main__":
    sys.exit(main())

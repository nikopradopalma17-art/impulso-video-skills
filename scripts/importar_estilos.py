#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Importa las 11 skills de estilo de IMPULSO IA (instaladas en ~/.codex/skills)
al repo, en forma portable para que cualquiera las copie a su propio agente.

Por estilo genera:
  estilos/<id>/SKILL.md          <- la skill (texto pegable en cualquier carpeta de skills)
  estilos/<id>/referencia/anim.html  <- maquinaria validada del estilo
  estilos/<id>/referencia/demo-<id>.mp4  <- render de validación (si existe en la skill)
Y una sola vez:
  estilos/fuentes/               <- TTFs del motor (Google Fonts, SIL OFL)
  estilos/LEEME.md               <- como usarlos + licencias

Las rutas absolutas de fuentes (file:///C:/Users/.../motor-estilos-video/fonts/)
se reescriben a rutas relativas ../../fuentes/ para que funcionen en cualquier maquina.
No se publican los videos de terceros usados como referencia en local
(original.mp4, hoja-contacto.jpg): solo el demo renderizado por nuestro motor.
Reejecutable: recrea cada estilos/<id> y sobreescribe fuentes.

Uso:
    python scripts/importar_estilos.py [--skills-dir C:/Users/USER/.codex/skills]
"""
import argparse
import os
import shutil
import stat
import sys
import time
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = Path(__file__).resolve().parent.parent
DESTINO = BASE / "estilos"

ESTILOS = [
    # clásicos (galería original)
    "bauhaus", "ciencia-animada", "grafico-datos", "izometrico",
    "linograbado", "pizarra-blanca", "pizarra-negra",
    # producto (con demo mp4 de validación)
    "cuaderno-cosmos", "explicador-producto", "metricas-producto", "pelota-animada",
]
PREFIJO = "video-estilo-"
URL_FUENTES_ABS = [
    "file:///C:/Users/USER/.codex/skills/motor-estilos-video/fonts/",
    "file:///C:/Users/USER/.zcode/skills/motor-estilos-video/fonts/",
]

LEEME = """# Estilos de video IMPULSO IA

11 estilos de diseño de video listos para copiar y pegar en tu agente de código
(Claude Code, Codex, ZCode...). Cada carpeta ES la skill:

```
estilos/<estilo>/
├── SKILL.md              <- la skill completa: biblia del estilo + contrato técnico
└── referencia/
    ├── anim.html         <- implementación validada del motor del estilo
    └── demo-<estilo>.mp4 <- render de validación (en los estilos que lo tienen)
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
renderizable con Chrome headless + ffmpeg a mp4/GIF). En los estilos de
producto, `referencia/demo-<estilo>.mp4` es el render de validación: míralo
para saber exactamente qué esperar del estilo antes de renderizar.

## Licencias

- Estilos y documentación: © IMPULSO IA (Nikolas Prado) — úsalos, adáptalos y
  redis-tribúyelos con atribución.
- Tipografías en `fuentes/`: Google Fonts bajo SIL Open Font License
  (Archivo Black, Anton, Bangers, Baloo 2, Caveat, Fredoka, Inter, JetBrains
  Mono, Orbitron, Patrick Hand, Playfair Display, Poppins, Press Start 2P,
  Righteous, Share Tech Mono, Space Grotesk, Alfa Slab One).
"""


def _desbloquear(func, path, exc_info):
    """OneDrive a veces lockea archivos/directorios: chmod + reintento."""
    os.chmod(path, stat.S_IWRITE)
    func(path)


def borrar_dir(p: Path) -> None:
    for intento in range(4):
        try:
            shutil.rmtree(p, onexc=_desbloquear)
            return
        except PermissionError:
            if intento == 3:
                raise
            time.sleep(1.5 * (intento + 1))


def portabilizar(texto: str) -> str:
    for url in URL_FUENTES_ABS:
        texto = texto.replace(url, "../../fuentes/")
    return texto


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
    n_demos = 0
    for estilo in ESTILOS:
        src = origen_skills / (PREFIJO + estilo)
        dst = DESTINO / estilo
        skill = src / "SKILL.md"
        anim = src / "referencia" / "anim.html"
        if not skill.exists() or not anim.exists():
            raise SystemExit(f"faltan archivos en {src} (SKILL.md o referencia/anim.html)")
        if dst.exists():
            borrar_dir(dst)  # carpeta generada por este script: seguro recrear
        (dst / "referencia").mkdir(parents=True)
        (dst / "SKILL.md").write_text(portabilizar(skill.read_text(encoding="utf-8")), encoding="utf-8")
        (dst / "referencia" / "anim.html").write_text(portabilizar(anim.read_text(encoding="utf-8")), encoding="utf-8")
        demo = src / "referencia" / f"demo-{estilo}.mp4"
        if demo.exists():
            shutil.copy2(demo, dst / "referencia" / demo.name)
            n_demos += 1
        reporte.append(estilo)

    print(f"estilos/ importado: {len(reporte)} estilos ({', '.join(reporte)}) "
          f"+ {n_demos} demos mp4 + {n_fonts} fuentes")
    return 0


if __name__ == "__main__":
    sys.exit(main())

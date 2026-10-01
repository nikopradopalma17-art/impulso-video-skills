#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Prepara los assets web dentro de docs/ para GitHub Pages (limite de 1 GB).

Escribe SOLO los archivos gestionados del landing, conviviendo con docs/fuente/
(el catalogo original, ~250 KB, tambien se publica y sirve como trazabilidad):
  docs/index.html   <- copia de la raiz con WEB_REPO_TREE inyectado (enlaces
                       "● En este repo" apuntando al arbol de GitHub)
  docs/indice.js    <- datos del catalogo
  docs/indice.json  <- datos en JSON legible
  docs/brand/       <- logos
  docs/.nojekyll    <- desactiva el procesado Jekyll de Pages

NUNCA borra nada: solo crea/sobrescribe sus propios archivos, para no tocar
documentacion preexistente en docs/.
Despues de subir, activa Pages: Settings -> Pages -> Deploy from a branch
-> main -> /docs.

Uso:
    python scripts/preparar_pages.py [--repo usuario/nombre-repo]
"""
import argparse
import shutil
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = Path(__file__).resolve().parent.parent
# Cuenta/repo destino por defecto (cambiar con --repo si se publica en otro).
REPO_DEFAULT = "nikopradopalma17-art/impulso-video-skills"

MARCADOR = "<body>"

ASSETS = ["indice.js", "indice.json"]
BRAND = ["logo-horizontal.png", "logo-cuadrado.png"]


def inyectar_repo(html: str, repo: str) -> str:
    tree = f"https://github.com/{repo}/tree/main"
    insercion = f"<script>window.WEB_REPO_TREE = '{tree}';</script>"
    if MARCADOR not in html:
        raise SystemExit("index.html no contiene <body>; revisar version")
    return html.replace(MARCADOR, f"{MARCADOR}\n  {insercion}", 1)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=REPO_DEFAULT, help="usuario/repo en GitHub")
    args = ap.parse_args()

    docs = BASE / "docs"
    docs.mkdir(exist_ok=True)

    (docs / "index.html").write_text(
        inyectar_repo((BASE / "index.html").read_text(encoding="utf-8"), args.repo),
        encoding="utf-8",
    )
    for nombre in ASSETS:
        origen = BASE / nombre
        if origen.exists():
            shutil.copy2(origen, docs / nombre)
    brand = docs / "brand"
    brand.mkdir(exist_ok=True)
    for nombre in BRAND:
        origen = BASE / "brand" / nombre
        if origen.exists():
            shutil.copy2(origen, brand / nombre)
    estilos = docs / "brand" / "estilos"
    estilos.mkdir(parents=True, exist_ok=True)
    for gif in sorted((BASE / "brand" / "estilos").glob("*.gif")):
        shutil.copy2(gif, estilos / gif.name)
    if (BASE / "estilos").exists():
        shutil.copytree(BASE / "estilos", docs / "estilos", dirs_exist_ok=True)
    (docs / ".nojekyll").write_text("", encoding="utf-8")

    gestionados = ["index.html", "indice.js", "indice.json", "brand", ".nojekyll"]
    peso = sum(
        (docs / g).stat().st_size
        for g in gestionados
        if (docs / g).is_file()
    )
    for g in ("brand",):
        peso += sum(f.stat().st_size for f in (docs / g).iterdir() if f.is_file())
    print(f"docs/ actualizado (~{peso / (1024 * 1024):.1f} MB del sitio) | repo web: {args.repo}")
    print("Al subir: Settings -> Pages -> Deploy from a branch -> main -> /docs")
    return 0


if __name__ == "__main__":
    sys.exit(main())

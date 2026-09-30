#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera indice.json e indice.js (window.INDICE) para el landing del consolidado
Impulso IA, cruzando docs/fuente/skills.json con lo efectivamente clonado.

Uso:
    python scripts/generar_indice.py [--min-stars 10]
"""
import argparse
import json
import sys
from datetime import date
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = Path(__file__).resolve().parent.parent
SKILLS_JSON = BASE / "docs" / "fuente" / "skills.json"

CATEGORIAS = {
    "general": {"carpeta": "01-frameworks", "nombre": "Frameworks y toolkits", "emoji": "🧱"},
    "explainer": {"carpeta": "02-explainers", "nombre": "Explainers y divulgación", "emoji": "🎓"},
    "editing": {"carpeta": "03-edicion", "nombre": "Edición de video", "emoji": "✂️"},
    "shorts": {"carpeta": "04-shorts", "nombre": "Shorts y social", "emoji": "📱"},
    "motion": {"carpeta": "05-motion", "nombre": "Motion graphics", "emoji": "🎞"},
}

ORDEN_SEGURIDAD = {"orden": ["clonado", "pendiente", "externo"]}


def tiene_contenido(p: Path) -> bool:
    return p.is_dir() and any(p.iterdir())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-stars", type=int, default=10, help="umbral usado en el clonado (para estado 'pendiente')")
    args = ap.parse_args()

    data = json.loads(SKILLS_JSON.read_text(encoding="utf-8"))
    skills = data["skills"]

    repos = []
    conteo = {k: {"clonado": 0, "pendiente": 0, "externo": 0} for k in CATEGORIAS}
    for e in skills:
        kind = e["kind"]
        repo = e["repo_full_name"]
        meta = CATEGORIAS.get(kind)
        en_scope = meta is not None and (e.get("stars") or 0) >= args.min_stars
        if meta and en_scope:
            carpeta = meta["carpeta"]
            ruta = f"{carpeta}/{repo.lower().replace('/', '--')}"
            estado = "clonado" if tiene_contenido(BASE / ruta) else "pendiente"
        else:
            carpeta = meta["carpeta"] if meta else None
            ruta = carpeta
            estado = "externo"
        if meta:
            conteo[kind][estado] += 1
        repos.append({
            "repo": repo,
            "url": f"https://github.com/{repo}",
            "carpeta": ruta if estado == "clonado" else None,
            "categoria_id": kind,
            "categoria": meta["nombre"] if meta else None,
            "categoria_emoji": meta["emoji"] if meta else None,
            "estado": estado,
            "stars": e.get("stars") or 0,
            "descripcion": e.get("description"),
            "seguridad": e.get("security_grade"),
            "lenguaje": e.get("language"),
            "licencia": e.get("license"),
        })

    repos.sort(key=lambda r: (-r["stars"], r["repo"].lower()))
    clonados = sum(1 for r in repos if r["estado"] == "clonado")
    pendientes = sum(1 for r in repos if r["estado"] == "pendiente")

    indice = {
        "marca": {
            "nombre": "IMPULSO IA",
            "tagline": "Crecimiento ágil · IA nativa",
            "fuente": data.get("source"),
            "fuente_nombre": "zhuyansen/awesome-claude-video-skills",
            "catalogo_generado": data.get("generated"),
        },
        "generado": str(date.today()),
        "resumen": {
            "total": len(repos),
            "clonados": clonados,
            "pendientes": pendientes,
            "externos": len(repos) - clonados - pendientes,
            "categorias": [
                {"id": k, "nombre": v["nombre"], "emoji": v["emoji"], "carpeta": v["carpeta"], **conteo[k]}
                for k, v in CATEGORIAS.items()
            ],
        },
        "repos": repos,
    }

    (BASE / "indice.json").write_text(json.dumps(indice, ensure_ascii=False, indent=2), encoding="utf-8")
    (BASE / "indice.js").write_text(
        "window.INDICE = " + json.dumps(indice, ensure_ascii=False) + ";\n", encoding="utf-8"
    )
    print(f"indice.json/indice.js generados: {len(repos)} repos | clonados={clonados} pendientes={pendientes} externos={len(repos) - clonados - pendientes}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

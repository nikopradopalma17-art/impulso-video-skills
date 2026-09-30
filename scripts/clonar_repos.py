#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Clonador masivo de repos de video-skills para el consolidado Impulso IA.

Lee docs/fuente/skills.json (catalogo de zhuyansen/awesome-claude-video-skills)
y clona superficialmente los repos de las categorias clave en carpetas numeradas.
Es reanudable: los repos ya clonados se saltan.

Uso:
    python scripts/clonar_repos.py --categoria editing
    python scripts/clonar_repos.py --categoria todas --min-stars 10 --workers 3
"""
import argparse
import csv
import json
import os
import shutil
import stat
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = Path(__file__).resolve().parent.parent
SKILLS_JSON = BASE / "docs" / "fuente" / "skills.json"

CATEGORIAS = {
    "general": "01-frameworks",
    "explainer": "02-explainers",
    "editing": "03-edicion",
    "shorts": "04-shorts",
    "motion": "05-motion",
}

REINTENTOS = 2
TIMEOUT_SEG = 420


def nombre_carpeta(repo_full_name: str) -> str:
    return repo_full_name.lower().replace("/", "--")


def rmtree_forzado(path: Path) -> None:
    def _onerror(func, p, _exc):
        try:
            os.chmod(p, stat.S_IWRITE)
        except OSError:
            pass
        try:
            func(p)
        except OSError:
            pass

    shutil.rmtree(path, onerror=_onerror)


def carpeta_con_contenido(p: Path) -> bool:
    return p.is_dir() and any(p.iterdir())


def clonar_repo(repo: str, destino: Path) -> tuple[str, str]:
    """Devuelve (estado, detalle). estado: ok | fallo"""
    url = f"https://github.com/{repo}.git"
    detalle = ""
    for intento in range(1, REINTENTOS + 1):
        try:
            # core.longpaths: evita fallos de checkout por MAX_PATH (260) en Windows/OneDrive
            r = subprocess.run(
                ["git", "-c", "core.longpaths=true", "clone", "--depth", "1", "--single-branch", "--quiet", url, str(destino)],
                capture_output=True,
                text=True,
                timeout=TIMEOUT_SEG,
            )
            if r.returncode == 0:
                gitdir = destino / ".git"
                if gitdir.exists():
                    rmtree_forzado(gitdir)
                return "ok", ""
            lineas = (r.stderr or r.stdout or "").strip().splitlines()
            detalle = lineas[-1][:200] if lineas else f"exit code {r.returncode}"
        except subprocess.TimeoutExpired:
            detalle = f"timeout {TIMEOUT_SEG}s"
        if destino.exists():
            rmtree_forzado(destino)
        if intento < REINTENTOS:
            time.sleep(3 * intento)
    return "fallo", detalle


def tamano_mb(p: Path) -> float:
    total = 0
    for raiz, _dirs, archivos in os.walk(p):
        for a in archivos:
            try:
                total += (Path(raiz) / a).stat().st_size
            except OSError:
                pass
    return round(total / (1024 * 1024), 1)


def seleccionar_repos(skills: list, categorias: list, min_stars: int) -> list:
    vistos = set()
    seleccion = []
    for kind in categorias:  # orden del dict CATEGORIAS gana en duplicados
        for e in skills:
            if e["kind"] != kind:
                continue
            repo = e["repo_full_name"]
            if repo in vistos or (e.get("stars") or 0) < min_stars:
                continue
            vistos.add(repo)
            seleccion.append(e)
    return seleccion


def main() -> int:
    ap = argparse.ArgumentParser(description="Clona los repos del catalogo awesome-claude-video-skills")
    ap.add_argument("--categoria", required=True, choices=list(CATEGORIAS) + ["todas"])
    ap.add_argument("--min-stars", type=int, default=10)
    ap.add_argument("--workers", type=int, default=3)
    args = ap.parse_args()

    skills = json.loads(SKILLS_JSON.read_text(encoding="utf-8"))["skills"]
    cats = list(CATEGORIAS) if args.categoria == "todas" else [args.categoria]
    seleccion = seleccionar_repos(skills, cats, args.min_stars)

    tareas = []
    for e in seleccion:
        destino = BASE / CATEGORIAS[e["kind"]] / nombre_carpeta(e["repo_full_name"])
        if carpeta_con_contenido(destino):
            print(f"[skip ] {e['repo_full_name']} (ya clonado)")
            continue
        tareas.append((e, destino))

    print(f"== Impulso IA :: clonador == categorias={','.join(cats)} | candidatos={len(seleccion)} | por clonar={len(tareas)} | workers={args.workers}")

    resultados = []
    if tareas:
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            futuros = {pool.submit(clonar_repo, e["repo_full_name"], d): (e, d) for e, d in tareas}
            for i, fut in enumerate(as_completed(futuros), 1):
                e, d = futuros[fut]
                estado, detalle = fut.result()
                mb = tamano_mb(d) if estado == "ok" else 0.0
                resultados.append({
                    "categoria": e["kind"],
                    "repo": e["repo_full_name"],
                    "estado": estado,
                    "error": detalle,
                    "tamano_mb": mb,
                    "licencia": e.get("license") or "",
                    "stars": e.get("stars") or 0,
                })
                marca = "OK  " if estado == "ok" else "FALLO"
                print(f"[{i:>3}/{len(tareas)}] [{marca}] {e['repo_full_name']} ({mb} MB) {detalle}")

    csv_path = BASE / "scripts" / f"reporte-clones-{'todas' if args.categoria == 'todas' else args.categoria}.csv"
    con_csv = csv_path if csv_path.exists() else None
    existe = con_csv is not None
    with csv_path.open("a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["categoria", "repo", "estado", "error", "tamano_mb", "licencia", "stars"])
        if not existe:
            w.writeheader()
        w.writerows(resultados)

    ok = sum(1 for r in resultados if r["estado"] == "ok")
    mb_total = round(sum(r["tamano_mb"] for r in resultados), 1)
    print(f"== resumen {args.categoria}: ok={ok} fallos={len(resultados) - ok} nuevos_MB={mb_total} reporte={csv_path.name}")
    return 0 if len(resultados) == ok or not tareas else 1


if __name__ == "__main__":
    sys.exit(main())

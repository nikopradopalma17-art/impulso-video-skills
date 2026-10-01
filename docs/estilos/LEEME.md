# Estilos de video IMPULSO IA

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

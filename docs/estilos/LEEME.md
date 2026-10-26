# Estilos de video IMPULSO IA

17 estilos de diseño de video listos para copiar y pegar en tu agente de código
(Claude Code, Codex, ZCode...): **11 del motor de estilos IMPULSO IA** y **6 looks
explicadores del motor explainroo (MIT)**. Cada carpeta ES la skill:

```
estilos/<estilo>/
├── SKILL.md              <- la skill completa: biblia del estilo + contrato técnico
└── referencia/
    ├── anim.html         <- implementación validada del motor del estilo
    │                        (en los looks explicadores: demo de galería con los tokens reales)
    └── demo-<estilo>.mp4 <- render de validación (en los estilos de producto que lo tienen)
estilos/fuentes/          <- tipografías (Google Fonts, SIL OFL)
```

## Cómo usarlos

### Estilos del motor IMPULSO IA (11)
1. **Opción rápida**: copia la carpeta del estilo que quieras a tu directorio de
   skills (`~/.claude/skills/` en Claude Code, o el equivalente de tu agente) y
   pídele el estilo por su nombre. También puedes pegar solo el contenido del
   `SKILL.md` como instrucciones en tu prompt.
2. **Opción completa**: copia el estilo Y la carpeta `fuentes/` (el `SKILL.md`
   referencia las fuentes en `../../fuentes/`), así el motor renderiza en tu
   máquina sin descargar nada más.
3. El landing del repo tiene un botón "Copiar SKILL.md" por estilo.

### Looks explicadores · motor explainroo (6: paper, clean, chalk, blueprint, midnight, editorial)
Estos looks producen **videos explicativos completos y narrados** (voz + música +
subtítulos + portada, 45–120 s, en español con la voz local `ef_dora`):

1. Copia la skill del look (o pégala como prompt) y pídele a tu agente un
   explicativo "en look paper/chalk/…" sobre tu tema.
2. El agente clona el motor la primera vez:
   `git clone https://github.com/vincentsch/explainroo.git && npm install &&
   node bin/explainroo.js doctor --fetch`.
3. Sigue el pipeline del `SKILL.md`: `init --theme <look> --language es`, escribe
   `script.md` (narración) y `scenes.js` (escenas), `voice` → `check` → `still` →
   `render` → `verify`.
4. El `referencia/anim.html` de cada look es su **demo de galería** (miniatura
   animada con los tokens exactos del tema, canvas 1920×1080): ábrela en el
   navegador para ver el lenguaje visual del look. Regenerables con
   `node scripts/generar_anim_explicadores.mjs`.

## Qué hay en cada estilo

Cada `SKILL.md` define la biblia visual (paleta estricta, tipografía, lenguaje
de movimiento, prohibiciones), la estructura narrativa y el contrato técnico
del `anim.html` (canvas 1920x1080, `window.draw({t})` pura y determinista,
renderizable con Chrome headless + ffmpeg a mp4/GIF). En los estilos de
producto, `referencia/demo-<estilo>.mp4` es el render de validación: míralo
para saber exactamente qué esperar del estilo antes de renderizar. En los
looks explicadores, el "motor" es explainroo y el `SKILL.md` documenta su
pipeline completo de principio a fin. Cinco de ellos incluyen además un
**demo mp4 real** en `referencia/` (renderizado aquí con el motor incluido,
uno narrado en español): míralo para saber qué produce cada look antes de
empezar.

## Licencias

- Estilos y documentación del motor IMPULSO IA: © IMPULSO IA (Nikolas Prado) —
  úsalos, adáptalos y redistribúyelos con atribución.
- Looks explicadores: temas y tokens derivados de
  [vincentsch/explainroo](https://github.com/vincentsch/explainroo) (MIT, Vincent
  Schmalbach); las demos `anim.html` y su generador son adaptaciones propias con
  esos tokens. El motor viene incluido en `02-explainers/vincentsch--explainroo`
  (clon superficial con `README.md` y `AGENTS.md` traducidos al español); el
  original vive en github.com/vincentsch/explainroo. Ejemplos vivos: [explainroo.com/videos](https://www.explainroo.com/videos/).
- Tipografías en `fuentes/`: Google Fonts bajo SIL Open Font License (Archivo
  Black, Alfa Slab One, Anton, Architects Daughter, Bangers, Baloo 2, Cabin
  Sketch, Caveat, Fredoka, Instrument Serif, Inter, JetBrains Mono, Kalam,
  Orbitron, Patrick Hand, Playfair Display, Plus Jakarta Sans, Poppins, Press
  Start 2P, Righteous, Share Tech Mono, Space Grotesk).

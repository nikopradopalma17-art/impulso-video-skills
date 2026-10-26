---
name: video-estilo-explicador-midnight
description: Genera un VIDEO EXPLICATIVO COMPLETO (narrado con voz, música y efectos) en LOOK MIDNIGHT del motor explainroo — modo oscuro de developer tools: fondo navy casi negro con brillos teal/morado, tarjetas con glow, terminal que se teclea, Space Grotesk. Úsalo SIEMPRE que el usuario pida "look midnight", "estilo dark/dev explainroo", "explicativo de programación con terminal narrada", "video oscuro con neón suave" o un explainer para desarrolladores de 45 a 120 s — aunque no mencione "midnight".
---

# Look Midnight (explainroo) — developer tools con glow

## Qué es y cuándo usarlo
Video explicativo **completo y narrado** (45–120 s) con la estética del IDE en modo oscuro:
fondo navy casi negro con dos brillos radiales (teal y morado), tarjetas oscuras de
esquinas suaves con borde luminoso, terminales que se teclean solas y texto en Space
Grotesk con leve glow. Transición de zoom y música electrónica calmada. Es el look de
**herramientas de desarrollador**: git, caches, contraseñas, async/await, SSO — y el que
mejor funciona en vertical para audiencia dev.

**Ideal para**: conceptos de programación e infraestructura, demostraciones de CLI y
herramientas, seguridad para devs, contenido técnico en Shorts/TikTok/Reels.

## Ejemplos de uso
- *"Un video en look midnight de git merge vs rebase"* → ramas que divergen y se
  reescriben, 0:41, 9:16 (ejemplo oficial).
- *"Explica en midnight cómo un gestor de contraseñas te protege"* → bóveda + contraseñas
  únicas por sitio, 0:53, TikTok.
- *"Look midnight para callbacks → async/await"* → pirámide de callbacks que se aplana en
  await, 1:07, 16:9.

## Cómo se replica: el motor explainroo (contrato técnico)
Este look lo produce el motor **explainroo** (MIT, `vincentsch/explainroo`): convierte
`script.md` (narración) + `scenes.js` (dibujo) en un MP4 narrado con música.

**1. Preparar el motor (una vez por máquina)** — ya viene incluido en este catálogo
(`02-explainers/vincentsch--explainroo`, clon superficial con README y AGENTS.md en español):
```bash
# Copia la carpeta del catálogo a tu espacio de trabajo (o clona el original de GitHub):
cp -r 02-explainers/vincentsch--explainroo ~/explainroo && cd ~/explainroo
npm install
node bin/explainroo.js doctor --fetch   # verifica Node/ffmpeg/Chrome; baja modelos de voz (~400 MB)
```

**2. Crear el proyecto en este look:**
```bash
node bin/explainroo.js init videos/<nombre> --theme midnight --title "Título" \
  --language es --size vertical     # sizes: youtube|shorts|tiktok|reels|vertical|instagram|linkedin|square
```
En `video.json` queda `"theme": "midnight"`, `"language": "es"` (voz `ef_dora`). El español
necesita `espeak-ng` (Windows: instalador de su GitHub; macOS: `brew`; Linux: `apt`).
`--size vertical` cubre Shorts+TikTok+Reels de una vez y respeta las zonas seguras de esas
apps; `--pace 1.3` funciona muy bien en vertical dev.

**3. Escribir la narración (`script.md`)** — la narración va primero y fija el timing:
```markdown
# Título del video

## intro {hold=1.5}
Primera frase que plantea la pregunta. [#rama] Cada marcador nombra un momento animable.
```
Una idea por escena (1–3 frases, 4–15 s). Frases de 8–18 palabras. Sin cifras inventadas.

**4. Generar la voz y revisar:**
```bash
node bin/explainroo.js voice videos/<nombre>
```

**5. Escribir las escenas (`scenes.js`)** — una función por escena; cada elemento anclado
a la palabra: `s.box('main', { at: '#rama', color: 'teal' })`, `s.code(...)` para
fragmentos que se teclean. Layouts base: número grande, comparación, pasos en orden, hub.
En vertical apila en vez de poner lado a lado y usa pocas palabras. Títulos 80–110 px,
etiquetas 40–56 px, todo dentro de `s.safe`.

**6. Revisar viendo frames:**
```bash
node bin/explainroo.js check videos/<nombre>    # en feeds densos prueba también: check --view-width 854
node bin/explainroo.js still videos/<nombre>
node bin/explainroo.js sheet videos/<nombre>
```

**7. Render final y verificación:**
```bash
node bin/explainroo.js render videos/<nombre> --draft
node bin/explainroo.js render videos/<nombre>     # MP4 + .srt/.vtt + cover.jpg
node bin/explainroo.js verify videos/<nombre>
```

## Biblia del look (tokens exactos del tema `midnight`)
- **Fondo**: navy `#0b1020` con dos glows radiales — teal `rgba(34,211,238,0.10)` arriba
  izquierda y morado `rgba(167,139,250,0.10)` abajo derecha — más grano sutil.
- **Colores**: tinta clara `#e8eef8` · superficie `#141c31` · atenuado `#8a97ad` · acento
  **teal**. Paleta neón suave: rojo `#fb7185`, naranja `#fb923c`, amarillo `#fcd34d`,
  verde `#34d399`, teal `#22d3ee`, azul `#60a5fa`, morado `#a78bfa`, rosa `#f472b6`.
- **Tipografía**: display **Space Grotesk 700** (tracking −0.02) · cuerpo **Inter 400**.
- **Trazo**: liso con **glow** (blur 14), ancho 3, radio 18, sombra profunda
  `rgba(0,0,0,0.45)` blur 34 y 14.
- **Entradas**: tarjetas, íconos e imágenes **pop**; textos y listas **rise**; flechas y
  líneas se dibujan.
- **Transición de escena**: `zoom`. **Música**: `tech`. **SFX**: pop, whoosh, type en
  terminal, sparkle en bursts.
- **Terminal/código**: bloque `#0f172a` VS Code oscuro (keyword morado `#c084fc`, string
  verde `#86efac`, número `#fbbf24`, fn cyan `#67e8f9`); terminal `#070b16` con prompt
  verde `#34d399`.

## Reglas de narración y encuadre (del propio motor)
- Tono de doc de herramienta: directo, técnico donde toca, cero paja.
- Algo nuevo cada 2–4 s; el terminal tecleándose es un buen reloj visual.
- Un concepto = un color (rama principal azul, la nueva teal...); consistencia total.
- En vertical, respeta `s.safe`: las apps tapan arriba y abajo.
- La cámara sigue la narración; dibuja la escena completa y deja que ella encuadre.

## Prohibido
- Glow en TODO (resérvalo al elemento héroe y a los bordes) ni neón saturado de gamer.
- Texto pequeño fuera de `s.safe` en vertical: las apps lo tapan.
- Poner la narración completa en pantalla (usa `"captions": true` si debe leerse).
- Inventar comandos, flags o resultados que no verificaste.

## Demo de galería y créditos
`referencia/anim.html` es la miniatura animada del look (canvas 1920×1080, contrato
`window.DUR/ready/draw`, determinista): terminal que se teclea + chip con glow. La genera
`scripts/generar_anim_explicadores.mjs` con los tokens reales.

Look del motor **explainroo** de Vincent Schmalbach — MIT
(github.com/vincentsch/explainroo). Tokens de `engine/themes.js`. Ejemplos vivos:
explainroo.com/videos/ (merge vs rebase, cache, callbacks → async/await, SSO en 4:5,
gestor de contraseñas en TikTok).

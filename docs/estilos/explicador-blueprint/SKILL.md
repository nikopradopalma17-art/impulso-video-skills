---
name: video-estilo-explicador-blueprint
description: Genera un VIDEO EXPLICATIVO COMPLETO (narrado con voz, música y efectos) en LOOK BLUEPRINT del motor explainroo — plano de ingeniería: azul técnico con grilla milimétrica, trazos finos a mano en Architects Daughter, cotas con flechas, acento amarillo. Úsalo SIEMPRE que el usuario pida "look blueprint", "estilo plano técnico explainroo", "explicativo de ingeniería/arquitectura narrado" o un explainer técnico de sistemas e infraestructura de 45 a 120 s — aunque no mencione "blueprint".
---

# Look Blueprint (explainroo) — el plano técnico de tu idea

## Qué es y cuándo usarlo
Video explicativo **completo y narrado** (45–120 s) con el lenguaje del plano de ingeniería:
fondo azul técnico con grilla milimétrica (líneas menores y mayores), trazos finos casi
precisos, cotas con flechas en ambos extremos, cruces de eje y etiquetas en Architects
Daughter. Todo se dibuja trazo a trazo y la transición es un barrido firme. Música tech.
Es el look de **ingeniería y arquitectura de sistemas**: cómo encajan las piezas, qué
conecta con qué, qué mide qué.

**Ideal para**: arquitectura de software e infraestructura (APIs, TLS, redes), cualquier
explicación donde importen dimensiones, capas y conexiones.

## Ejemplos de uso
- *"Un video en look blueprint de qué hace una API"* → cliente y servidor como piezas
  acotadas conectadas por flecha, 1:12, 16:9 (ejemplo oficial).
- *"Explica en plano técnico cómo HTTPS protege tu contraseña"* → candado, certificado y
  túnel con cotas de tiza blanca, 1:12, 16:9.
- *"Blueprint para explicar la topología de nuestra red"* → routers y segmentos como plano
  con cruces de eje, 16:9 o LinkedIn 4:5.

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
node bin/explainroo.js init videos/<nombre> --theme blueprint --title "Título" \
  --language es --size youtube     # sizes: youtube|shorts|tiktok|reels|vertical|instagram|linkedin|square
```
En `video.json` queda `"theme": "blueprint"`, `"language": "es"` (voz `ef_dora`). El
español necesita `espeak-ng` (Windows: instalador de su GitHub; macOS: `brew`; Linux: `apt`).

**3. Escribir la narración (`script.md`)** — la narración va primero y fija el timing:
```markdown
# Título del video

## intro {hold=1.5}
Primera frase que plantea la pregunta. [#pieza] Cada marcador nombra un momento animable.
```
Una idea por escena (1–3 frases, 4–15 s). Frases de 8–18 palabras. Sin cifras inventadas.

**4. Generar la voz y revisar:**
```bash
node bin/explainroo.js voice videos/<nombre>
```

**5. Escribir las escenas (`scenes.js`)** — una función por escena; cada pieza anclada a
la palabra: `s.box('Balanceador', { at: '#entrada' })`, `s.arrow('api','db')`. Layouts
base: número grande, comparación, pasos en orden, hub con partes. Títulos 80–110 px,
etiquetas 40–56 px, dentro de `s.safe`.

**6. Revisar viendo frames:**
```bash
node bin/explainroo.js check videos/<nombre>
node bin/explainroo.js still videos/<nombre>
node bin/explainroo.js sheet videos/<nombre>
```

**7. Render final y verificación:**
```bash
node bin/explainroo.js render videos/<nombre> --draft
node bin/explainroo.js render videos/<nombre>     # MP4 + .srt/.vtt + cover.jpg
node bin/explainroo.js verify videos/<nombre>
```

## Biblia del look (tokens exactos del tema `blueprint`)
- **Fondo**: azul plano `#12508f` con degradado vertical (`#14589d` → `#0f4680`) y grilla
  técnica: línea menor cada ~32 px, línea mayor cada 5 (alfa 0.08 / 0.20).
- **Colores**: trazo blanco `#f1f7ff` · superficie `#185c9f` · atenuado `#a9cbef` · acento
  **amarillo**. Paleta luminosa: rojo `#ff8a80`, naranja `#ffbd70`, amarillo `#ffd866`,
  verde `#a3f0b8`, teal `#8ff0e4`, azul `#9fd6ff`, morado `#d0b8ff`, rosa `#ffb3d1`, gris
  `#c3daf2`.
- **Tipografía**: **Architects Daughter 400** en los tres roles (display, cuerpo, mano) —
  la letra de arquitecto; mono JetBrains Mono 400.
- **Trazo**: rugoso fino (roughness 0.55, bowing 0.6) — mano de dibujante técnico, no
  garabato — ancho 3.5, radio 6, sin sombra.
- **Entradas**: formas e íconos se **dibujan**; texto y listas se **escriben**; imágenes y
  código fade; gráficos crecen.
- **Transición de escena**: `wipe` (barrido firme). **Música**: `tech`. **SFX**: click en
  íconos, whoosh en flechas, scribble en líneas y anotaciones.
- **Código/terminal**: bloque `#0d3d6e` con sintaxis clara sobre azul (keyword amarillo
  `#ffd866`, string verde `#a3f0b8`, fn azul `#9fd6ff`).

## Reglas de narración y encuadre (del propio motor)
- Tono de ingeniero que explica con las manos: piezas, conexiones, medidas.
- Algo nuevo cada 2–4 s: acota, conecta, señala — el plano se construye en vivo.
- Un componente = un color y su posición; el amarillo marca lo que importa.
- La cámara sigue la narración; dibuja la escena completa y deja que ella encuadre.

## Prohibido
- Sombras, degradados decorativos o neón: un plano es plano.
- Garabatos exagerados (el temblor aquí es sutil, de regla y escuadra).
- Poner la narración completa en pantalla (usa `"captions": true` si debe leerse).
- Inventar medidas, puertos, cifras o topologías.

## Demo de galería y créditos
`referencia/anim.html` es la miniatura animada del look (canvas 1920×1080, contrato
`window.DUR/ready/draw`, determinista): rectángulo acotado con cotas y cruz de centro.
La genera `scripts/generar_anim_explicadores.mjs` con los tokens reales.

**Demo**: este look no trae proyecto de ejemplo en el repo; los
ejemplos vivos (qué es una API, cómo HTTPS guarda tu contraseña) solo están en
[explainroo.com/videos](https://www.explainroo.com/videos/). El resto de looks sí trae
demo mp4 renderizado en su carpeta.

Look del motor **explainroo** de Vincent Schmalbach — MIT
(github.com/vincentsch/explainroo). Tokens de `engine/themes.js`. Ejemplos vivos:
explainroo.com/videos/ (qué es una API, cómo HTTPS guarda tu contraseña).

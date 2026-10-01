---
name: video-estilo-bauhaus
description: Genera un segmento de video animado en ESTILO BAUHAUS (cartel modernista: formas geométricas primarias rojo/azul/amarillo sobre crema, retícula con cruces de registro, sellos con impacto mecánico, tipografía Archivo Black) para insertar en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo Bauhaus", "cartel modernista", "estilo cartel geométrico", o quiera comunicar reglas, pasos, principios o mensajes contundentes y ordenados (listas numeradas, manifiestos, anuncios secos) — aunque no diga "Bauhaus".
---

# Estilo Bauhaus — cartel geométrico con sellos

## Qué es y cuándo meterlo en un video
Escena de 5-15 s que comunica **reglas, pasos o un mensaje contundente** como un cartel de la Bauhaus animado: formas primarias gigantes, retícula visible y "sellos" que estampan cada idea con impacto mecánico. Ideal para **enumerar cosas** (3 reglas, 4 pasos) en el desarrollo de un video, o para un cierre de mensaje claro. Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada ("3 reglas para hablar en público", 9 s). **Léela completa primero**: tiene la retícula con cruces de registro, la textura halftone precalculada, el sistema de estampado (impacto + anillo + confeti geométrico + sacudida + settle) y la reorganización de retícula como transición. Reusa la maquinaria y cambia el contenido.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('400 40px ArchivoBlack')` explícito y tras precalcular texturas (halftone) — canvas `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado. `Math.random` PROHIBIDO: PRNG con semilla o hash.
- Fuentes por URL absoluta: `@font-face{font-family:'ArchivoBlack';font-weight:400;src:url(../../fuentes/archivo-black-400.ttf) format('truetype');}`

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB; mira un JPG con Read para confirmar la tipografía (no serif de respaldo).

## Biblia del estilo (inmutable)
- **Fondo**: crema `#f2ead8`.
- **Paleta estricta de 5**: rojo `#d0342c`, azul `#1f5fa8`, amarillo `#e8b73a`, negro tinta `#171512`, blanco. NADA fuera de esta lista.
- **Formas**: círculo, semicírculo, triángulo, barra negra; números gigantes (280-400 px) dentro de formas; superposiciones en `multiply`.
- **Tipografía**: Archivo Black, todo en mayúsculas, alineada a retícula (márgenes asimétricos pensados). Texto en ESPAÑOL.
- **Elementos firma**: retícula fina con cruces de registro de imprenta; trama halftone de puntos (precalculada) multiplicada dentro de formas; marca de registro discontinua que aparece antes de cada sello; descripciones de pie de imprenta en los bordes.
- **Lenguaje de movimiento**: SECO Y MECÁNICO. Sellos: caída con easeIn cuadrático → impacto (anillo expansivo + confeti geométrico determinista + micro-sacudida global decreciente) → settle con outBack. Transiciones: la retícula se desplaza medio módulo en pasos cuantizados y las formas vuelan (con volteo) a su nueva posición. Pulsos de "tic" (0.14 s) rompen las pausas.
- **Prohibido**: easings blandos tipo elástico/lluvia, degradados, más de 5 colores, curvas orgánicas, sombras difusas.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Cabecera (0-10%)**: barra de título del cartel + retícula se dibuja.
2. **Estampados (10-75%)**: cada idea/paso se ESTAMPA con el ritual completo (registro → caída → impacto → settle); entre estampados la composición se reorganiza (esa ES la transición de escena).
3. **Cartel final (75-100%)**: todas las formas conviven equilibradas + frase de cierre sellada; todo quieto y compuesto al final. Vida sutil (tics) en pausas.

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')`, renderiza PNG y compón con `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex "[0:v][1:v]overlay=0:0" -c:v libx264 -crf 18 out.mp4` (el cartel tiene fondo crema; para superponer de verdad, pinta el fondo con transparencia en tu anim).
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas.
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu `anim.html` (200-350 líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** (paleta de 5, sellos, retícula); corrige y repite.
4. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

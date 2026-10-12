---
name: video-estilo-metricas-producto
description: Genera un segmento de video animado en ESTILO MÉTRICAS DE PRODUCTO (escenarios
navy y crema alternos con retícula de puntos, chrome de cámara con brackets y timecode,
contadores odómetro que ruedan, gauge radial con ticks, palabra gigante sobre full-bleed
amarillo y gráfico con tooltip) para insertar en un video más largo. Úsalo SIEMPRE que el
usuario pida "métricas de producto", "métricas de SaaS", "números de producto", "estilo
fintech", "HUD de datos", "showreel de métricas", "estilo Flexprice" o quiera comunicar
facturación, uso de plataforma o crecimiento con credibilidad técnica — aunque no diga
"métricas".
---

# Estilo Métricas de Producto — números con chrome de cámara

## Qué es y cuándo meterlo en un video
Escena de 5-15 s que comunica **números de producto con autoridad**: contadores que ruedan
como odómetros, gauges radiales que aterrizan en beat, una palabra-concepto gigante sobre
amarillo pleno y un gráfico que se dibuja con tooltip. Ideal para **showreels de SaaS,
kickers de métricas, informes de crecimiento y cierres de producto** en el desarrollo de
un video. Regla de oro: UNA cifra protagonista por escena, y siempre aterriza exacta.
Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Ejemplos de uso
- *"Un video con las métricas de mi SaaS: 2 millones de eventos procesados"* → escena
  odómetro + gauge + palabra + gráfico, con tus cifras reales.
- *"Muestras de producto estilo fintech para el all-hands"* → este estilo (tono frío y
  técnico; para explicar flujos usa mejor `video-estilo-explicador-producto`).
- *"Un HUD de datos con facturación y uso"* → misma maquinaria: HUD persistente +
  odómetro + gráfico con tooltip.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada
("medipay · reel de datos", 9 s) y `referencia/demo-metricas-producto.mp4` es su render
de validación. **Léela completa primero**: tiene el HUD persistente (brackets, timecode
corriendo, etiqueta de sección, barra de progreso), el confeti de guiones determinista,
el odómetro de tambor (un solo glifo por celda que gira en descenso y aterriza exacto), el gauge con overshoot y arco de exceso rojo, la palabra
con estelas de motion blur y el gráfico con área, tooltip y leyenda. Reusa la maquinaria
y cambia el contenido.
`referencia/original.mp4` (15 s) y `referencia/hoja-contacto.jpg` son el ground truth
visual del estilo.

## Origen del estilo (trazabilidad)
Entrada "Flexprice motion showreel" de **prompt-motion.com/sudeepsd-1a3485**, video IA
generado por **@sudeepsd_** (Sudeep S D) con Opus 5.5 (15 s, one-shot). El video y el
prompt pertenecen a su creador; esta skill reproduce el **lenguaje visual** (paleta navy/
crema/amarillo, HUD, odómetros, gauges, tipografía grotesca + mono) con contenido demo
original en español, no el material de la marca.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('700 120px Inter')`
  explícito por cada fuente y tras precalcular texturas (retículas de puntos de ambos
  fondos) — canvas `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve
  `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado.
  `Math.random` PROHIBIDO: PRNG con semilla o hash.
- Fuentes por URL absoluta: `@font-face{font-family:'Inter';font-weight:700;
  src:url(../../fuentes/inter-700.ttf)
  format('truetype');}`

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 1.2,3.3,5.0,7.0,8.6
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`;
si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB;
mira 2-3 JPG con Read y verifica: HUD legible en ambos fondos, dígitos alineados en sus
celdas, gauge cerrando en la cifra exacta (sin pasarse del arco).

## Biblia del estilo (inmutable)
- **Fondo**: navy `#16344a` y crema `#f1ecdf` ALTERNANDO por escena, con retícula de
  puntos precalculada (blanca 5% en navy, tinta 9% en crema) + viñeta suave. Amarillo
  pleno `#f5c445` reservado a UNA escena de palabra.
- **Paleta estricta de 7**: navy `#16344a`, tinta navy `#1d3a52`, crema `#f1ecdf`,
  amarillo `#f5c445`, rojo `#e2574c`, blanco `#ffffff`, gris azulado `#9fb3c1`. NADA
  fuera de esta lista.
- **Formas**: anillos y arcos de gauge con extremos redondeados, ticks radiales, guiones
  de confeti (18×6 px), tarjetas/gráficos con líneas de 5 px, chips tooltip con esquina
  14 px, brackets de cámara en las 4 esquinas.
- **Tipografía**: Inter 700 para cifras y palabras gigantes (odómetros 96-148 px, palabra
  300 px con tracking -14), JetBrains Mono 400 para TODO el chrome y las etiquetas
  (mayúsculas, espaciado manual con espacios), Poppins 700 solo para el wordmark.
  Texto en ESPAÑOL.
- **Elementos firma**: HUD persistente (brackets, "MARCA / REEL DE DATOS", timecode
  00:00:SS:FF corriendo, "0N / SECCIÓN", progreso abajo-derecha); odómetro con dígitos
  de tambor que giran en descenso y aterrizan exactos (UN solo glifo por celda,
  jamás dos dígitos superpuestos); confeti de guiones blanco/amarillo/rojo en los acentos;
  gauge con ticks que se encienden y arco rojo de sobrecosto; tooltip que aparece en el
  pico del gráfico; palabra gigante con punto blanco que cae con outBack.
- **Lenguaje de movimiento**: cifras que ruedan con easeOut largo (~1,4 s) y aterrizan
  exactas; gauges con overshoot outBack; palabra que entra con estelas verticales de
  motion blur (3 copias alpha decreciente); cortes de escena con flash blanco de 0,13 s;
  nada flota: todo aterriza y queda quieto.
- **Prohibido**: curvas orgánicas, degradados decorativos, colores fuera de la paleta,
  manuscritas, sombras difusas, más de una cifra protagonista por escena.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Evento (0-24%)**: burst de guiones + odómetro gigante que aterrizan la métrica
   _hero con etiqueta mono debajo.
2. **Medidor (24-47%)**: gauge radial en crema que cierra en el % exacto con overshoot,
   ticks encendidos y arco rojo de exceso.
3. **Palabra (47-67%)**: full-bleed amarillo, UNA palabra-concepto gigante en tinta navy
   con estelas de blur y punto blanco; kicker mono debajo.
4. **Uso (67-87%)**: odómetro secundario + gráfico que se dibuja con área, ticks inferiores
   (gris/amarillo/rojo), tooltip en el pico y leyenda.
5. **Logo (87-100%)**: burst + wordmark con barra de acento, hairline y claim mono
   tecleado. El wordmark debe quedar COMPLETO al menos 0,6 s antes del final.

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')`, renderiza PNG y
  compón con `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex
  "[0:v][1:v]overlay=0:0" -c:v libx264 -crf 18 out.mp4` (los fondos son opacos; para
  superponer de verdad, pinta el fondo con transparencia en tu anim).
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas (marca, métricas, duración).
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu
   `anim.html` (280-360 líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** (HUD legible, odómetro alineado, gauge
   exacto); corrige y repite.
4. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf
   "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

---
name: video-estilo-grafico-datos
description: Genera un segmento de video animado en ESTILO VISUALIZACIÓN DE DATOS (gráfico editorial de noticias: barras que crecen con overshoot, ejes y ticks que se dibujan, números que rulletan, callouts con óvalo a mano, fondo blanco con acento naranja, tipografía Inter) para insertar en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo data viz", "gráfico animado", "estilo editorial/noticias", o quiera mostrar números, pruebas, comparaciones antes/después o progreso medido dentro de su video — aunque solo diga "enséñalo con datos".
---

# Estilo Gráfico de Datos — evidencia editorial animada

## Qué es y cuándo meterlo en un video
Escena de 5-15 s que **prueba algo con números**: un gráfico editorial limpio donde los datos se
animan con precisión (barras, líneas, valores que cuentan). Es el estilo del **argumento
cuantitativo** en el desarrollo de un video: el "los datos lo confirman" después de la promesa, o la
comparación antes/después que justifica el mensaje. Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Ejemplos de uso
- *"Enséñalo con datos: mi mejora de ventas del trimestre, estilo editorial"* → masthead + barras
  ANTES/DESPUÉS por mes + callout con óvalo a mano sobre el dato clave.
- *"Un gráfico animado de mi tiempo de pantalla antes y después del cambio de hábito"* → misma
  maquinaria, con los datos reales del usuario y kicker de conclusión.
- *"Style data viz para probar el +180% de leads tras la campaña"* → serie protagonista naranja con
  overshoot + "+180%" de 48 px y óvalo dibujado a mano.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada ("10 minutos al
día, medidos", 9 s: barras antes/después por semana + reescalado de eje + tendencia + callout
"+180%" + kicker). **Léela completa primero**: tiene la maquetación con retícula (caja de gráfico
170-1560 × 280-840, márgenes asimétricos), los ejes/ticks que se dibujan, el REESCALADO del eje Y
como transformación de escena, las barras con overshoot y stagger, los números que rulletan, la
tendencia punteada trazada con nudos, el óvalo dibujado a mano en 2 pasadas y el cierre editorial.
Reusa la maquinaria y cambia los datos.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.ready` = promesa que resuelve tras `document.fonts.load('300 30px Inter')`,
  `document.fonts.load('italic 300 30px Inter')`, `document.fonts.load('400 30px Inter')` y
  `document.fonts.load('700 30px Inter')` — canvas `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve
  `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado.
  `Math.random` PROHIBIDO: PRNG con semilla o hash (el temblor del óvalo a mano usa
  ruido determinista).
- Fuentes por URL absoluta:
  `@font-face{font-family:'Inter';font-weight:700;src:url(../../fuentes/inter-700.ttf)
  format('truetype');}` (también inter-400.ttf e inter-300.ttf).

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta,
`CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB; mira un JPG con Read para
confirmar que Inter carga (no serif de respaldo).

## Biblia del estilo (inmutable)
- **Fondo**: blanco `#fafafa`. **Tinta**: `#1a1a1a`; grises de apoyo: subtítulo `#6f6f6f`,
  ticks/esquinas `#9a9a9a`, barras ANTES `#c4c4c4` (valores `#7a7a7a`), semanas `#454545`, leyenda
  `#555555`; gridlines `rgba(26,26,26,0.08)`; filete de masthead `rgba(26,26,26,0.18)`; tendencia
  `rgba(26,26,26,0.75)` y guía de callout `rgba(26,26,26,0.8)`. **UN acento**: naranja `#e8590c`
  para la serie protagonista. Nada más de color.
- **Tipografía**: Inter 700 (titular 58 px con la conjunción en Inter 300 itálica naranja; "+180%"
  48 px; valores DESPUÉS 30 px; kicker 46 px), Inter 400 (etiquetas, ticks, leyenda, valores ANTES:
  28 px con tracking 1-2 px), Inter 300 (subtítulo 30 px). Texto en ESPAÑOL.
- **Maquetación**: retícula editorial con márgenes asimétricos — título arriba-izquierda (y 118),
  marca de esquina ("DATOS / 30 DÍAS · N=1", con cuadrado naranja 14 px) arriba-derecha, área de
  gráfico alineada a ejes reales (caja 170-1560 × 280-840) con ticks y gridlines finos cada 2
  unidades.
- **Elementos firma**: ejes trazados progresivamente (Y 1.0-1.6 s, X 1.3-1.95 s, trazo 2.5); barras
  de 72 px con par separado 16 px — ANTES gris sin overshoot (stagger 0.18 s, dur 0.55 s), DESPUÉS
  naranja con overshoot back s=1.8 (stagger 0.22 s, dur 0.62 s); REESCALADO del eje 6→12 (3.35-4.15
  s, easeInOutCúbico) mientras los valores RULLETAN sobre cada barra; línea de tendencia punteada
  (dash [1.5, 9]) trazada por longitud con nudos naranjas de 7 px; callout con línea guía curva
  (Bézier) + óvalo a mano en 2 pasadas (72 segmentos, temblor sen(3a+1.4), trazo 3 naranja); leyenda
  con swatches 18 px.
- **Lenguaje de movimiento**: limpio y preciso — easeOutCubic / easeInOutCúbico / back s=1.8
  moderado, stagger 0.1-0.15 s entre series, nada gira ni rebota; entradas de texto con
  deslizamiento corto ≤ 26 px; el kicker entra con regla naranja de 5 px.
- **Prohibido**: 3D, sombras, gráficos de pastel con explosión, más de un color de acento, pie de
  gráfico ilegible (< 24 px), datos inventados sin etiqueta.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Titular (3-17%, 0.25-1.5 s)**: masthead editorial ("Práctica diaria *vs.* resultado") +
   subtítulo gris + filete + marca de esquina; los ejes comienzan a dibujarse.
2. **Datos base (11-37%, 1.0-3.35 s)**: ejes/ticks/gridlines y etiquetas S1-S4 con stagger; leyenda;
   primera serie gris ("antes"/control) crece (2.2-3.29) con rulleteo de valores.
3. **La prueba (37-87%, 3.35-7.85 s)**: reescalado del eje (3.35-4.15); serie protagonista naranja
   crece con overshoot (4.1-5.38); tendencia punteada con nudos (5.9-7.0); callout "+180% de
   confianza" y óvalo a mano sobre la barra clave (6.6-7.85).
4. **Kicker (88-100%, 7.9-8.75 s)**: regla naranja + frase de conclusión ("Pequeño, diario,
   medible."); composición quieta y perfectamente alineada.

## Dependencias y portabilidad
- Depende del motor compartido `motor-estilos-video` (render.mjs + `fonts/` + package.json con
  playwright-core) y de ffmpeg + Chrome headless en el sistema.
- Fuentes que usa este estilo: `inter-300.ttf`, `inter-400.ttf`, `inter-700.ttf` (en
  `motor-estilos-video/fonts/`; si te falta el motor, bájalas de Google Fonts: Inter 300, 400 y
  700).
- Si recibes solo esta carpeta: 1) copia la carpeta a la carpeta de skills de tu agente; 2) consigue
  `motor-estilos-video` y colócalo junto a las skills; 3) `npm install` dentro del motor; 4)
  reemplaza la ruta `C:/Users/USER/.codex/skills/motor-estilos-video` por tu ubicación local en los
  comandos de este documento y en los `@font-face` de `referencia/anim.html`.
- El ground truth visual viaja con la skill: `referencia/anim.html` es una implementación completa y
  ejecutable del estilo.

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')` y compón con `ffmpeg -i
  fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex "[0:v][1:v]overlay=0:0" -c:v libx264
  -crf 18 out.mp4` (fondo blanco puro funciona bien como tarjeta a media pantalla).
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas.
2. Pide/define los datos reales del usuario (o inventa verosímiles marcándolos como ejemplo) y crea
   la carpeta del proyecto (dentro del proyecto del usuario).
3. Escribe tu `anim.html` (200-260 líneas).
4. Smoke test + **mira 2-3 fotogramas con Read** (alineación a retícula, rulleteo, callout); corrige
   y repite.
5. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf "fps=2,scale=320:-1,tile=6x3"
   -frames:v 1 hoja.jpg`) y revísala con Read.
6. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

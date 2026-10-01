---
name: video-estilo-grafico-datos
description: Genera un segmento de video animado en ESTILO VISUALIZACIÓN DE DATOS (gráfico editorial de noticias: barras que crecen con overshoot, ejes y ticks que se dibujan, números que rulletan, callouts con óvalo a mano, fondo blanco con acento naranja, tipografía Inter) para insertar en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo data viz", "gráfico animado", "estilo editorial/noticias", o quiera mostrar números, pruebas, comparaciones antes/después o progreso medido dentro de su video — aunque solo diga "enséñalo con datos".
---

# Estilo Gráfico de Datos — evidencia editorial animada

## Qué es y cuándo meterlo en un video
Escena de 5-15 s que **prueba algo con números**: un gráfico editorial limpio donde los datos se animan con precisión (barras, líneas, valores que cuentan). Es el estilo del **argumento cuantitativo** en el desarrollo de un video: el "los datos lo confirman" después de la promesa, o la comparación antes/después que justifica el mensaje. Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada ("10 minutos al día, medidos", 9 s: barras antes/después por semana + tendencia + callout +180%). **Léela completa primero**: tiene la maquetación con retícula, los ejes/ticks que se dibujan, las barras con overshoot y stagger, los números que rulletan, la tendencia punteada trazada y el óvalo dibujado a mano. Reusa la maquinaria y cambia los datos.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load()` explícitos de cada peso Inter usado ('300','400','700 40px Inter') — canvas `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado. `Math.random` PROHIBIDO: PRNG con semilla o hash (el temblor del óvalo a mano usa ruido determinista).
- Fuentes por URL absoluta: `@font-face{font-family:'Inter';font-weight:700;src:url(../../fuentes/inter-700.ttf) format('truetype');}` (también inter-400.ttf e inter-300.ttf).

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB; mira un JPG con Read para confirmar que Inter carga (no serif de respaldo).

## Biblia del estilo (inmutable)
- **Fondo**: blanco `#fafafa`. **Tinta**: `#1a1a1a`; grises de apoyo `#7a7a7a`/`#9a9a9a`/`#c4c4c4` (etiquetas secundarias, gridlines). **UN acento**: naranja `#e8590c` para la serie protagonista. Nada más de color.
- **Tipografía**: Inter 700 (titular editorial 54-64 px, con palabras en acento), 400 (etiquetas ≥ 28 px), 300 (números grandes decorativos). Texto en ESPAÑOL.
- **Maquetación**: retícula editorial con márgenes asimétricos — título arriba-izquierda, marca de esquina ("DATOS / 30 días · n=1") arriba-derecha, área de gráfico alineada a ejes reales con ticks y gridlines finos (`rgba(26,26,26,0.08)`).
- **Elementos firma**: ejes y ticks que se dibujan (trazo progresivo); barras con overshoot + stagger; valores numéricos que RULLETAN (cuentan hacia arriba con easing) sobre cada barra; línea de tendencia punteada que se traza con nudos; callout con línea guía curva + óvalo dibujado a mano (2 pasadas, temblor determinista) alrededor del dato clave; leyenda con swatches.
- **Lenguaje de movimiento**: limpio y preciso — easing OutCubic/OutBack moderado, stagger de 0.1-0.15 s entre series, nada gira ni rebota; el "kicker" final entra con deslizamiento corto y regla de acento.
- **Prohibido**: 3D, sombras, gráficos de pastel con explosión, más de un color de acento, pie de gráfico ilegible (< 24 px), datos inventados sin etiqueta.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Titular (0-12%)**: titular editorial + subtítulo gris; los ejes comienzan a dibujarse.
2. **Datos base (12-40%)**: primera serie (gris, "antes" o control) crece con stagger y rulleteo de valores.
3. **La prueba (40-78%)**: serie protagonista (naranja) crece con overshoot; tendencia trazada; callout con el insight ("+180% de confianza") y óvalo a mano en el dato clave.
4. **Kicker (78-100%)**: frase de conclusión abajo con regla naranja; composición quieta y perfectamente alineada.

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')` y compón con `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex "[0:v][1:v]overlay=0:0" -c:v libx264 -crf 18 out.mp4` (fondo blanco puro funciona bien como tarjeta a media pantalla).
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas.
2. Pide/define los datos reales del usuario (o inventa verosímiles marcándolos como ejemplo) y crea la carpeta del proyecto (dentro del proyecto del usuario).
3. Escribe tu `anim.html` (200-260 líneas).
4. Smoke test + **mira 2-3 fotogramas con Read** (alineación a retícula, rulleteo, callout); corrige y repite.
5. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
6. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

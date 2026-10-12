---
name: video-estilo-explicador-producto
description: Genera un segmento de video animado en ESTILO EXPLICADOR DE PRODUCTO (crema
con dot grid, titular bold con chip de color en la palabra remate, mockups de documentos
flotantes, flujo de UI con chips numerados y botones pill, escena azul full-bleed con
calendario y cronómetro, CTA con tachado y chip degradado) para insertar en un video más
largo. Úsalo SIEMPRE que el usuario pida "explicador de producto", "explainer de
producto", "estilo SaaS", "explicar mi producto", "explicador con UI", "estilo
DistilBook" o quiera explicar un flujo de producto paso a paso con calidez comercial —
aunque no diga "explicador".
---

# Estilo Explicador de Producto — chips, UI y flujo de producto

## Qué es y cuándo meterlo en un video
Escena de 5-15 s que explica **un producto como una historia de problema → flujo → pago**:
el dolor en un titular con chip de color, el flujo como tarjetas de UI que se completan
(chips numerados, guion que se teclea, botón que se aprueba con sello), la promesa de
velocidad en una escena azul con calendario tachado y cronómetro, y el CTA con tachado
rojo y chip degradado. Ideal para **demos de producto, lanzamientos y explicadores de
flujo de trabajo**. Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Ejemplos de uso
- *"Explícame mi producto con un video estilo SaaS"* → dolor con chip + flujo UI + CTA.
- *"Un explainer de producto para mi startup de turnos médicos"* → este estilo: el flujo
  se adapta a los pasos reales del producto (agenda → confirmación → recordatorio).
- *"Quiero un explicador con UI y botones que se pulsan"* → mismo estilo; el cursor y los
  chips numerados son la maquinaria clave.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada
("NotaViva", 9 s) y `referencia/demo-explicador-producto.mp4` es su render de validación.
**Léela completa primero**: tiene las primitivas chip/numChip/pill con outBack, el mockup
de documento con esquina doblada y sello "SIN LEER", el flujo de UI con resaltados
amarillos que se dibujan, guion tecleado con cursor, aprobación con borde verde y sello
"CADA PALABRA", el calendario 7×3 con X rosas estampando en stagger, tachón sobre
"Semanas" y cronómetro con arco amarillo, y el CTA con tachado, chip degradado y cursor.
Reusa la maquinaria y cambia el contenido.
`referencia/original.mp4` (30 s) y `referencia/hoja-contacto.jpg` son el ground truth
visual del estilo.

## Origen del estilo (trazabilidad)
Entrada "DistilBook product explainer" de **prompt-motion.com/sudo-kiran-6609ed**, video
IA generado por **@sudo_kiran** (Kiran) con Opus 5.5 (30 s). El video y el prompt
pertenecen a su creador; esta skill reproduce el **lenguaje visual** (paleta crema con
chips saturados, Poppins bold, mockups de UI, escena azul) con contenido demo original en
español, no el material de la marca.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('800 96px Poppins')`
  explícito por cada fuente y tras precalcular texturas (dot grid) — canvas `fillText`
  NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve
  `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado.
  `Math.random` PROHIBIDO: PRNG con semilla o hash.
- Fuentes por URL absoluta: `@font-face{font-family:'Poppins';font-weight:800;
  src:url(../../fuentes/poppins-800.ttf)
  format('truetype');}`

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 1.6,4.9,6.3,8.6
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`;
si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB;
mira 2-3 JPG con Read y verifica: el chip no tapa palabras del titular (mide con
`measureText`, nunca anchos a mano), botones y sellos dentro de sus tarjetas, calendario
completo dentro de frame.

## Biblia del estilo (inmutable)
- **Fondo**: crema `#f4f1ea` con dot grid sutil; UNA escena azul pleno `#4b7af2` con
  flash de corte de 2-3 frames al entrar y salir.
- **Paleta estricta de 9**: crema `#f4f1ea`, tinta `#23252b`, rojo `#ee5d54`, azul
  `#4f7df9`, verde `#35b96f`, magenta `#d9439b`, amarillo `#f5d564`, azul pleno `#4b7af2`,
  gris `#8b8e96` (+ rosa `#e56a9a` solo para X del calendario/tachón). NADA fuera.
- **Formas**: chips redondeados (radio ~40%) como palabra remate y etiquetas de paso;
  tarjetas blancas con esquina 14-18 px, sombra difusa suave y micro-rotación ±2°;
  botones pill negros/verdes/azules; sellos rotados con borde; cursor de flecha con
  pulso de clic; barras placeholder redondeadas.
- **Tipografía**: Poppins 800 para titulares (96-120 px) y wordmark, Poppins 700 para
  chips/botones/UI, Inter 400 para cuerpo, JetBrains Mono 400 para micro-datos
  ("archivo.pdf · abierto 0 veces"). Texto en ESPAÑOL.
- **Elementos firma**: chip de color en la palabra final del titular; pasos con chips
  numerados de colores distintos; resaltados amarillos que se dibujan sobre líneas;
  texto que se teclea con cursor; sello rotado al aprobar; calendario con X que estampan
  en stagger y tachón rosa sobre la palabra costosa; cronómetro con arco amarillo y
  tiempo corriendo; CTA con tachado rojo y chip degradado azul→magenta con "▶".
- **Lenguaje de movimiento**: todo entra con pop outBack (0.22-0.3 s) o deslize de 60 px;
  clicks de cursor con anillo expansivo; flashes secos entre escenas; elementos antiguos
  NO vuelven; el fondo azul dura un beat corto y contundente.
- **Prohibido**: gradientes fuera del chip CTA, sombras duras, tipografía manuscrita,
  más de 5 documentos flotantes, texturas de papel, color fuera de paleta.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Dolor (0-29%)**: titular bold en DOS líneas con chip de color en el remate +
   micro-dato mono con icono ojo + mockups de documentos flotando con sello "SIN LEER".
2. **Flujo (29-59%)**: chips numerados de pasos + tarjeta problema con resaltados +
   tarjeta solución que se rellena (tecledo, botón, clic, borde verde, sello).
3. **Velocidad (59-78%)**: azul pleno: palabra costosa tachada + calendario con X +
   "listo en minutos." + cronómetro.
4. **CTA (78-100%)**: logo (3 barras + wordmark), "Deja de X." tachado, "Empieza a Y"
   con chip degradado, confeti suave y pill de acción con cursor.

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')`, renderiza PNG y
  compón con `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex
  "[0:v][1:v]overlay=0:0" -c:v libx264 -crf 18 out.mp4` (el fondo es opaco; para
  superponer de verdad, pinta el fondo con transparencia en tu anim).
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas (producto, flujo, duración).
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu
   `anim.html` (300-400 líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** (chips sin tapar texto, UI dentro de
   tarjetas, calendario completo); corrige y repite.
4. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf
   "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

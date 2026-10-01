---
name: video-estilo-pizarra-blanca
description: Genera un segmento de video animado en ESTILO PIZARRA BLANCA (rotulador negro que dibuja progresivamente sobre papel blanco con temblor de mano, tipo RSAnimate/explicación en whiteboard) para insertar en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo pizarra blanca", "whiteboard", "estilo RSAnimate", "que se vaya dibujando", o quiera explicar paso a paso cómo algo funciona o se hace mientras se dibuja en pantalla — aunque no use la palabra "whiteboard".
---

# Estilo Pizarra Blanca — dibujo progresivo con rotulador

## Qué es y cuándo meterlo en un video
Escena de 5-15 s donde **un rotulador dibuja la explicación en vivo**: los trazos aparecen progresivamente (revelado por longitud) con un temblor de mano sutil que los hace humanos. Es el estilo clásico del **tutorial paso a paso** y del "cómo funciona X" en el desarrollo de un video: la mano que dibuja mantiene la atención mientras la voz lo narra. Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada ("Cómo vencer los nervios en 3 pasos", 9 s). **Léela completa primero**: tiene el trazador progresivo por longitud de arco con jitter de mano, el efecto borrador con mancha gris, el grano de papel precalculado y los subrayados rápidos. Reusa la maquinaria y cambia el contenido dibujado.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('400 40px PatrickHand')` explícito y tras precalcular el grano de papel — canvas `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado. `Math.random` PROHIBIDO: PRNG con semilla (mulberry32) o hash — el temblor de mano usa ruido determinista.
- Fuentes por URL absoluta: `@font-face{font-family:'PatrickHand';font-weight:400;src:url(../../fuentes/patrick-hand-400.ttf) format('truetype');}`

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB (en este estilo los frames iniciales pueden pesar poco por el blanco dominante: verifica VISUALMENTE con Read que el trazo progresa).

## Biblia del estilo (inmutable)
- **Fondo**: papel blanco levemente cálido `#f8f4ea` con grano sutil y sombra suave de marcador.
- **Tintas**: rotulador negro `#262319` (dominante), UN acento rojo `#cf3a2b` (círculos numerados, subrayados dobles, énfasis). Nada más.
- **Tipografía**: Patrick Hand para etiquetas y palabras manuscritas (≥ 30 px). Texto en ESPAÑOL.
- **Elementos firma**: TODO trazo se dibuja progresivamente (parámetro p de longitud, con jitter de mano sobre los puntos); manchas/borrones ocasionales de marcador; subrayados dobles rápidos al enfatizar; borraduras con mancha gris y borrador entre pasos; flechas dibujadas a mano conectando ideas.
- **Lenguaje de movimiento**: el ritmo lo marca el dibujo — cada trazo tiene velocidad irregular (como una mano real); los elementos ya dibujados se quedan con vida mínima (el dibujo "respira": jitter de 1 px determinista). Un dibujo puede animarse al completarse (un pulmón se hincha, un metrónomo oscila).
- **Prohibido**: formas perfectas sin jitter (círculos con `arc()` puro se ven falsos: distorsiónalos), más de 2 tintas, degradados, movimiento de cámara.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Título escrito (0-10%)**: el título se escribe con efecto manuscrito.
2. **Pasos (10-80%)**: cada paso se NUMERA (círculo rojo) y su dibujo aparece trazo a trazo mientras su etiqueta se escribe; entre pasos, transición de borrado parcial (mancha) si el lienzo está lleno.
3. **Cierre (80-100%)**: recapitulación en una línea con subrayado doble rojo; todo se asienta.

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')` y compón con `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex "[0:v][1:v]overlay=0:0" -c:v libx264 -crf 18 out.mp4`. Este estilo es EXCELENTE para overlay: fondo blanco con alfa sobre el video del hablante.
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas.
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu `anim.html` (200-350 líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** (trazo con jitter, sin formas perfectas, tipografía manuscrita); corrige y repite.
4. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

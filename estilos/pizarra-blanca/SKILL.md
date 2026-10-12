---
name: video-estilo-pizarra-blanca
description: Genera un segmento de video animado en ESTILO PIZARRA BLANCA (rotulador negro que dibuja progresivamente sobre papel blanco con temblor de mano, tipo RSAnimate/explicación en whiteboard) para insertar en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo pizarra blanca", "whiteboard", "estilo RSAnimate", "que se vaya dibujando", o quiera explicar paso a paso cómo algo funciona o se hace mientras se dibuja en pantalla — aunque no use la palabra "whiteboard".
---

# Estilo Pizarra Blanca — dibujo progresivo con rotulador

## Qué es y cuándo meterlo en un video
Escena de 5-15 s donde **un rotulador dibuja la explicación en vivo**: los trazos aparecen progresivamente (revelado por longitud) con un temblor de mano sutil que los hace humanos. Es el estilo clásico del **tutorial paso a paso** y del "cómo funciona X" en el desarrollo de un video: la mano que dibuja mantiene la atención mientras la voz lo narra. Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Ejemplos de uso
- *"Explícame en whiteboard cómo funciona una bomba centrífuga"* → título escrito +
  2-3 pasos numerados en círculos rojos con su dibujo trazo a trazo + cierre con
  subrayado doble.
- *"Un clip RSAnimate con el paso a paso de bloqueo y etiquetado (LOTO)" → mismo
  motor: insignias numeradas, dibujo progresivo y borraduras entre pasos.
- *"Quiero que se vaya dibujando el proceso de mi servicio"* → este estilo (el dibujo
  progresivo ES el estilo); adapta los garabatos al oficio del usuario.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada
(demo "CÓMO VENCER LOS NERVIOS en 3 pasos": 1 RESPIRA con pulmones que se hinchan,
2 ANCLA con tienda tensada por cuerdas, 3 RITMO con metrónomo oscilante; DUR 9 s).
**Léela completa primero**: tiene el trazador progresivo por longitud de arco con
temblor de mano vivo (`hand` + `trace`), la escritura con revelado y punta de rotulador
(`write`), el borrador con 8 manchas grises (`eraser`), el desvanecido por paso
(`gone`), el grano de papel precalculado, los subrayados dobles rápidos y el péndulo
con física amortiguada. Reusa la maquinaria y cambia el contenido dibujado.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('400 80px PatrickHand')` explícito y tras precalcular el grano de papel — canvas `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado. `Math.random` PROHIBIDO: PRNG con semilla (mulberry32) o hash — el temblor de mano usa ruido determinista (`vnoise`).
- Fuentes por URL absoluta: `@font-face{font-family:'PatrickHand';font-weight:400;src:url(../../fuentes/patrick-hand-400.ttf) format('truetype');}`

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB (en este estilo los frames iniciales pueden pesar poco por el blanco dominante: verifica VISUALMENTE con Read que el trazo progresa).

## Biblia del estilo (inmutable)
- **Fondo**: papel blanco levemente cálido `#f8f4ea` con grano precalculado (motas
  rgba(120,108,86,≤0.05) + nubes blancas) y viñeta cálida rgba(96,84,60,0.14).
- **Tintas**: rotulador negro `#262319` (dominante; sombra suave de marcador
  rgba(60,52,40,0.16) desplazada 3/4 px en cada trazo), UN acento rojo `#cf3a2b`
  (círculos numerados, subrayados dobles, énfasis). Nada más.
- **Tipografía**: Patrick Hand 400 para todo el texto — título 82 px, subtítulo 48 px,
  número de insignia 66 px, etiqueta de paso 88 px, cierre 56 px. Texto en ESPAÑOL.
- **Elementos firma**: TODO trazo se dibuja progresivamente por longitud de arco con
  ease cúbico (`trace`) y temblor de mano que VIVE con el tiempo (`hand` con vnoise,
  ±2.1 px, refrescado a t×2.1); la escritura se revela con clip horizontal y punta de
  rotulador (círculo de 4.5 px) mientras se escribe (`write`); insignias numeradas =
  círculo r=54 con lw 6 rojo + número; borraduras entre pasos: 8 manchas grises
  rgba(150,146,136,0.20) de 132→70 px que barren la franja en 0.45 s + fade `gone` de
  0.45 s; dibujos que se ANIMAN al completarse (pulmones que respiran escala 1+0.14·br,
  metrónomo con péndulo A=0.8·e^(−0.75t)·cos(6.8t) y caja roja 28×40 px); subrayados
  dobles rápidos (lw 8 + 5) al enfatizar; 3 puntitos de rotulador con vida residual.
- **Composición**: título arriba (y≈138/212); insignia numerada del paso a la izquierda
  (círculo r=54 en ~(500,500)) y dibujo del paso centrado a la derecha (~x1150) con su
  etiqueta de 88 px debajo; recapitulación numerada en el pie (y≈962).
- **Lenguaje de movimiento**: el ritmo lo marca el dibujo — cada trazo tiene velocidad
  irregular (como una mano real); los elementos ya dibujados se quedan con vida mínima;
  los pasos se separan con borraduras cuando el lienzo se llena (nunca cortes de
  cámara); nada de cámara ni deslizamientos.
- **Prohibido**: formas perfectas sin jitter (círculos con `arc()` puro se ven falsos: distorsiónalos), más de 2 tintas, degradados, movimiento de cámara.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
Beats del demo (DUR 9 s):
1. **Título escrito (2-20%)**: "CÓMO VENCER LOS NERVIOS" 82 px (0.15-1.35 s) +
   subtítulo rojo "en 3 pasos" 48 px (1.35-1.78 s).
2. **Pasos con borraduras (22-72%)**: paso 1 RESPIRA 1.95-4.15 s (insignia → etiqueta
   → pulmones → respiración) con borrador 4.05-4.5 s; paso 2 ANCLA 4.5-6.05 s (suelo con
   hatch, pies, cuerdas y estacas rojas) con borrador 6.0-6.45 s; paso 3 RITMO
   6.45-7.75 s (caja del metrónomo + péndulo oscilante desde 7.5 s).
3. **Cierre (86-98%)**: recapitulación numerada "1 RESPIRA · 2 ANCLA · 3 RITMO"
   (7.78/8.0/8.22 s) + subrayado doble rojo (8.45-8.8 s); todo se asienta.

## Dependencias y portabilidad
- Depende del motor compartido `motor-estilos-video` (render.mjs + `fonts/` + package.json con playwright-core) y de ffmpeg + Chrome headless en el sistema.
- Fuentes que usa este estilo: `patrick-hand-400.ttf` (en `motor-estilos-video/fonts/`; si te falta el motor, bájala de Google Fonts: Patrick Hand 400).
- Si recibes solo esta carpeta: 1) copia la carpeta a la carpeta de skills de tu agente; 2) consigue `motor-estilos-video` y colócalo junto a las skills; 3) `npm install` dentro del motor; 4) reemplaza la ruta `C:/Users/USER/.codex/skills/motor-estilos-video` por tu ubicación local en los comandos de este documento y en los `@font-face` de `referencia/anim.html`.
- El ground truth visual viaja con la skill: `referencia/anim.html` es una implementación completa y ejecutable del estilo.

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

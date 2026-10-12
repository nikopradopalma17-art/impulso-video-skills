---
name: video-estilo-cuaderno-cosmos
description: Genera un segmento de video animado en ESTILO CUADERNO COSMOS (dos mundos:
papel con grano y doodles de tinta salmón —asterisco con boil, documento esbozado, script
manuscrito— que se transforma por zoom en un cosmos indigo con estrellas, órbitas de libros
pastel y prisma que refracta un arcoíris, y regresa al papel para el logo) para insertar en
un video más largo. Úsalo SIEMPRE que el usuario pida "estilo cuaderno", "boceto que cobra
vida", "estilo cósmico", "estilo DistilBook showreel" o quiera narrar la transformación de
una idea en producto con aire onírico — aunque no diga "cuaderno".
---

# Estilo Cuaderno Cosmos — del boceto al universo

## Qué es y cuándo meterlo en un video
Escena de 5-15 s que narra **"una idea en papel se convierte en un mundo"**: el cuaderno
con doodles de tinta hace zoom hacia un orbe escondido en el documento, el zoom se rompe
en un cosmos indigo (órbitas con libros pastel, prisma que refracta un arcoíris, anillos
que colapsan) y regresa al papel donde el documento ya es una escena viva y llega el logo.
Ideal para **openers de marca, transformaciones "antes → después" y momentos mágicos** en
el desarrollo de un video. Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada
("TintaLab", 9 s) y `referencia/demo-cuaderno-cosmos.mp4` es su render de validación.
**Léela completa primero**: tiene el grano de papel precalculado, el
asterisco salmón con boil (jitter determinista por frame), el documento esbozado con
doble trazo y orbe-semilla, el manuscrito Caveat con recorte progresivo y subrayado
garabateado, la flecha con cabeza que se dibuja, el zoom de cámara por `setTransform`
hacia un punto de fuga, el mundo cosmos (estrellas titilantes, nebulosas, 3 órbitas con
libros pastel, destello, prisma con haz y abanico arcoíris, anillos de colapso) y el
regreso con tarjeta-video que se dibuja (brote) + logo. Reusa la maquinaria y cambia el
contenido.
`referencia/original.mp4` (32 s) y `referencia/hoja-contacto.jpg` son el ground truth
visual del estilo.

## Origen del estilo (trazabilidad)
Entrada "Distilbook motion showreel" de **prompt-motion.com/ajith-io-ea7f2d**, video IA
generado por **@ajith_io** (AAjith) con Opus 5.5 (32 s). El video y el prompt pertenecen
a su creador; esta skill reproduce el **lenguaje visual** (mundo papel ↔ cosmos, doodles
de tinta salmón, script manuscrito, libros pastel, prisma-arcoíris) con contenido demo
original en español, no el material de la marca.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('700 64px Caveat')`
  explícito por cada fuente y tras precalcular texturas (grano/nubes del papel) — canvas
  `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve
  `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado.
  `Math.random` PROHIBIDO: PRNG con semilla o hash.
- Fuentes por URL absoluta: `@font-face{font-family:'Caveat';font-weight:700;
  src:url(../../fuentes/caveat-700.ttf)
  format('truetype');}`

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 1.8,3.4,4.9,6.1,8.3
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`;
si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB;
mira 2-3 JPG con Read y verifica: manuscrito en Caveat (no serif de respaldo), el zoom
apunta al punto de fuga correcto, el arcoíris sale del vértice del prisma.

## Biblia del estilo (inmutable)
- **Fondos**: papel `#ecebe6` con nubes y grano precalculados + cosmos indigo `#262150`
  con nebulosas pastel (lila/rosa/azul al 12-16%).
- **Paleta estricta**: papel `#fbfaf7`, tinta gris `#55534c`, líneas `#c9c6bd`, salmón
  `#d97a5a` (ÚNICO acento del papel), indigo `#262150`, libros pastel verde `#7fe3a8` /
  azul `#8fc3ff` / rosa `#f7a8cd` / naranja `#ffcf8f`, arcoíris de 7 bandas ROYGBIV,
  brote verde `#7fae6a`. NADA fuera de esta lista.
- **Formas**: documento esbozado con doble contorno a mano y esquina doblada; asterisco
  orgánico de 9 brazos; orbe esférico oscuro con brillo; órbitas elípticas rotadas con
  libros-píldora; prisma triangular de doble contorno; tarjetas de video con barra de
  progreso salmón; barras de logo redondeadas.
- **Tipografía**: Caveat 700 para TODO lo manuscrito (62-68 px, gris tinta, con
  subrayado garabateado), Poppins 700 para el wordmark, Inter 400 para micro-texto.
  Texto en ESPAÑOL.
- **Elementos firma**: el boil del asterisco (jitter por frame de 8 fps); el orbe como
  SEMILLA del cosmos dentro del documento; el zoom de cámara como única transición entre
  mundos (flash blanco de 0,15 s en el clímax); destello de 4 puntas con glow cálido;
  arcoíris que nace del vértice del prisma; el documento que "revive" como tarjeta de
  video con brote dibujándose y barra de progreso.
- **Lenguaje de movimiento**: cámara lenta y decidida (zoom con easeInOut de 0,45 s);
  doodles que aparecen con golpecito outBack; escritura progresiva con recorte; órbitas
  a velocidades distintas y sentidos alternos; el cosmos NUNCA se corta: siempre se
  disuelve en anillos/flash hacia el papel.
- **Prohibido**: cortes secos papel↔cosmos sin zoom/flash, colores saturados en el papel
  (todo es tinta salmón/gris), sombras difusas en el mundo papel, tipografía geométrica
  en los doodles, más de un arcoíris por escena.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Papel (0-28%)**: línea base se dibuja, asterisco cae con boil, documento esbozado,
   script manuscrito con flecha; el zoom arranca hacia el orbe del documento.
2. **Cosmos (28-71%)**: zoom se rompe en el universo: estrella cálida, órbitas con libros
   pastel; la estrella se apaga y entra el prisma → haz blanco → abanico arcoíris →
   anillos que colapsan al centro con flash.
3. **Regreso (71-100%)**: zoom out: el documento es ahora una tarjeta-video con brote que
   se dibuja + script nuevo ("y el apunte se vuelve escena") + logo (3 barras pastel +
   wordmark + dominio).

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')`, renderiza PNG y
  compón con `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex
  "[0:v][1:v]overlay=0:0" -c:v libx264 -crf 18 out.mp4` (ambos fondos son opacos; para
  superponer de verdad, pinta el fondo con transparencia en tu anim).
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas (marca, oración manuscrita,
   icono del brote, duración).
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu
   `anim.html` (330-420 líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** (papel vs cosmos con la paleta exacta,
   zoom al punto de fuga, arcoíris desde el prisma); corrige y repite.
4. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf
   "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

---
name: video-estilo-bauhaus
description: Genera un segmento de video animado en ESTILO BAUHAUS (cartel modernista: formas geométricas primarias rojo/azul/amarillo sobre crema, retícula con cruces de registro, sellos con impacto mecánico, tipografía Archivo Black) para insertar en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo Bauhaus", "cartel modernista", "estilo cartel geométrico", o quiera comunicar reglas, pasos, principios o mensajes contundentes y ordenados (listas numeradas, manifiestos, anuncios secos) — aunque no diga "Bauhaus".
---

# Estilo Bauhaus — cartel geométrico con sellos

## Qué es y cuándo meterlo en un video
Escena de 5-15 s que comunica **reglas, pasos o un mensaje contundente** como un cartel de
la Bauhaus animado: formas primarias gigantes, retícula visible y "sellos" que estampan
cada idea con impacto mecánico. Ideal para **enumerar cosas** (3 reglas, 4 pasos) en el
desarrollo de un video, o para un cierre de mensaje claro. Produce un `mp4` 1920×1080 @
30 fps autónomo.

## Ejemplos de uso
- *"Hazme un segmento estilo Bauhaus con las 4 reglas de nuestro taller"* → cartel de 4
  estampados: cada regla cae como sello (registro → impacto → settle), la retícula se
  reorganiza entre reglas y el cartel final reúne todas las formas.
- *"Cierra mi video con un manifiesto geométrico rojo/azul/amarillo"* → estampados
  comprimidos + barra final negra con la frase de cierre sellada y confeti geométrico.
- *"Enumera los 3 pasos del proceso como cartel modernista"* → misma maquinaria con
  números gigantes dentro de círculo/semicírculo/triángulo y chips "PASO 0n".

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada
("3 reglas para hablar en público", 9 s). **Léela completa primero**: tiene la retícula de
96 px con cruces de registro y desplazamiento cuantizado entre reglas, las texturas
precalculadas (halftone + grano de papel), el sistema de estampado completo (marca de
registro → caída → anillo + confeti + micro-sacudida + flash → settle), los vuelos con
volteo a insignia, las barras de título/final con confeti, el contador de progreso y los
wordStamps de recapitulación. Reusa la maquinaria y cambia el contenido.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras
  `document.fonts.load('400 100px ArchivoBlack')` explícito y tras precalcular texturas
  (halftone) — canvas `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve
  `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado.
  `Math.random` PROHIBIDO: PRNG con semilla o hash.
- Fuentes por URL absoluta: `@font-face{font-family:'ArchivoBlack';font-weight:400;
  src:url(../../fuentes/archivo-black-400.ttf)
  format('truetype');}`

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`;
si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB; mira
un JPG con Read para confirmar la tipografía (no serif de respaldo).

## Biblia del estilo (inmutable)
- **Fondo**: crema `#f2ead8` + grano de papel precalculado (motas `rgba(23,21,18,0.5)`
  cada 24 px, dibujadas en `multiply` con alpha 0.16).
- **Paleta estricta de 5**: rojo `#d0342c`, azul `#1f5fa8`, amarillo `#e8b73a`, negro
  tinta `#171512`, blanco `#ffffff` (solo el flash de impacto, alpha ≤ 0.28). NADA fuera
  de esta lista.
- **Retícula**: líneas `rgba(23,21,18,0.10)` cada 96 px + cruces de registro
  `rgba(23,21,18,0.4)` cada 288 px (brazos 9 px, grosor 1.6); en transiciones el alpha
  se refuerza ×2.8 y la retícula se desplaza 48/24 px en 6 pasos cuantizados (0.40 s).
  Cuadraditos de color de 16 px como marcas de imprenta.
- **Formas**: círculo, semicírculo (plano abajo) y triángulo equilátero de radio
  ~300 px; números gigantes dentro (glifos de 285-345 px según la forma);
  contorno-fantasma desplazado (7,9 px) como descripción de registro antes del
  estampado; superposiciones en `multiply`.
- **Tipografía**: Archivo Black 400 única, TODO EN MAYÚSCULAS: barra-título 40 px,
  barra final 70 px, chips/pies/meta 28 px, pie de regla 30 px con tracking 5 px,
  titular de regla 138-158 px, recapitulación 34 px. Texto en ESPAÑOL.
- **Elementos firma**: ritual de sello de 0.42 s — caída 0.23 s con easeIn cuadrático
  desde −1.35·r (escala 1.22→0.98) → impacto (anillo expansivo lw 3→23 px, confeti
  determinista de 10 piezas de 6-18 px alternando tinta y color, micro-sacudida global
  `A·e^(−11u)·sin(210u)`, flash blanco) → settle outBack s=2.4; marca de registro
  discontinua (dash [10,8], círculo r+46, alpha 0.6) 0.16 s antes como anticipación;
  trama halftone (puntos `rgba(0,0,0,0.6)`, paso 17 px, radio 5.4 decreciente)
  multiplicada dentro de cada forma con alpha 0.55; tic mecánico de 0.14 s (pulso de
  escala ×1.035) en las pausas; barras negras que caen 300 px con confeti de 14-16 piezas.
- **Lenguaje de movimiento**: SECO Y MECÁNICO — easeOut cuártico `1−(1−p)^4`, outBack
  s=2.4, pasos cuantizados (6-9), cero flotación; los textos se revelan por recorte
  horizontal en 7 pasos con stagger 0.10 s por línea; las formas vuelan a su insignia
  con 1 volteo en 9 pasos (0.38-0.40 s, radio 300→85 px).
- **Prohibido**: easings blandos tipo elástico/lluvia, degradados, más de 5 colores,
  curvas orgánicas, sombras difusas.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Cabecera (0-10%, 0-0.9 s)**: el marco se traza por lados (4 lados cuantizados,
   0.10-0.72) y la barra-título cae y se sella (0.30-0.72).
2. **Regla 1 (10-32%, 0.92-2.90 s)**: círculo rojo "1" se estampa (0.92); chip
   "REGLA 01" + titular 158 px + barrita + pie "INHALA · EXHALA · EMPIEZA" (1.30+);
   tic 2.10; la forma vuela a insignia y la retícula se desplaza (2.50-2.90).
3. **Regla 2 (33-58%, 2.95-5.20 s)**: semicírculo azul "2" (2.95); textos desde 3.30;
   tic 4.35; reorganización 4.80-5.20.
4. **Regla 3 (60-83%, 5.42-7.50 s)**: triángulo amarillo "3" (5.42); textos desde
   5.78; tic 6.75; reorganización 7.10-7.50.
5. **Cartel final (78-100%, 7.05-9.00 s)**: las tres formas vuelan reducidas (radio
   175-205) a su hueco; recapitulación estampada de las 3 reglas (7.65/7.77/7.89,
   34 px); barra final "HABLAR BIEN / SE APRENDE" (8.25) con contador "03 / 03"; todo
   quieto y compuesto.

## Dependencias y portabilidad
- Depende del motor compartido `motor-estilos-video` (render.mjs + `fonts/` +
  package.json con playwright-core) y de ffmpeg + Chrome headless en el sistema.
- Fuentes que usa este estilo: `archivo-black-400.ttf` (en `motor-estilos-video/fonts/`;
  si te falta el motor, bájala de Google Fonts: Archivo Black 400).
- Si recibes solo esta carpeta: 1) copia la carpeta a la carpeta de skills de tu agente;
  2) consigue `motor-estilos-video` y colócalo junto a las skills; 3) `npm install`
  dentro del motor; 4) reemplaza la ruta `C:/Users/USER/.codex/skills/motor-estilos-video`
  por tu ubicación local en los comandos de este documento y en los `@font-face` de
  `referencia/anim.html`.
- El ground truth visual viaja con la skill: `referencia/anim.html` es una implementación
  completa y ejecutable del estilo.

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')`, renderiza PNG y
  compón con `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex
  "[0:v][1:v]overlay=0:0" -c:v libx264 -crf 18 out.mp4` (el cartel tiene fondo crema;
  para superponer de verdad, pinta el fondo con transparencia en tu anim).
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas.
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu
   `anim.html` (200-350 líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** (paleta de 5, sellos, retícula);
   corrige y repite.
4. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf
   "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

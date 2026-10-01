---
name: video-estilo-pizarra-negra
description: Genera un segmento de video animado en ESTILO PIZARRA NEGRA (pizarra de aula verde-negra con marco de madera, escritura a tiza con triple pasada y polvo, garabatos de tiza, tipografía Caveat) para insertar en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo pizarra", "pizarra negra", "tiza", "estilo aula/clase", o quiera dar una lección, regla o recordatorio ("bunu unutma" / "no olvides esto") dentro de su video — aunque no diga "pizarra".
---

# Estilo Pizarra Negra — lección a tiza

## Qué es y cuándo meterlo en un video
Escena de 5-15 s con la calidez de un **aula**: una pizarra verde-negra con marco de madera donde la tiza escribe la lección, dibuja garabatos y subraya lo importante. Es el estilo de los **momentos didácticos** de un video: reglas que no hay que olvidar, definiciones, "la clave está en...". Funciona muy bien después de una intro con energía (contraste: aquí todo es lento y cálido). Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada ("La regla de los 10 minutos", 9 s). **Léela completa primero**: tiene la escritura a tiza con triple pasada y polvo, el marco garabateado con estrellas, el calendario con casillas tachadas, la balanza y la bandeja con tiza y borrador. Reusa la maquinaria y cambia la lección.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('700 40px Caveat')` explícito y tras precalcular texturas — canvas `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado. `Math.random` PROHIBIDO: PRNG con semilla (mulberry32) o hash.
- Fuentes por URL absoluta: `@font-face{font-family:'Caveat';font-weight:700;src:url(../../fuentes/caveat-700.ttf) format('truetype');}`

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB; mira un JPG con Read para confirmar la caligrafía (no serif de respaldo).

## Biblia del estilo (inmutable)
- **Pizarra**: verde-negra `#20362e` con borrosidades fantasma de tiza borrada (manchas muy sutiles `rgba(243,239,226,0.02-0.05)`); marco de madera en marrones `#5a3719`/`#6b4423`/`#3a2412` con bandeja inferior (tiza y borrador apoyados).
- **Tizas**: blanco hueso `#f3efe2` (dominante) y amarilla `#f6d76b` (énfasis, números clave). Los trazos de tiza NO son líneas limpias: triple pasada desplazada con alpha variable + motas de polvo en las puntas.
- **Tipografía**: Caveat 700 como escritura a tiza (títulos 80-120 px, notas ≥ 30 px). Texto en ESPAÑOL.
- **Elementos firma**: marco garabateado a tiza alrededor del título con estrellas; subrayados con golpes repetidos; calendarios/casillas que se tachan en orden barajado; garabatos (flechas, sol, estrella); regla dibujada; polvillo de tiza que cae al escribir fuerte.
- **Lenguaje de movimiento**: escritura progresiva (revelado por longitud con jitter de mano), la barrita de tiza visible como punta que escribe; pausas de profesor entre frases; los garabatos completos se animan sutilmente (la estrella titila, la balanza oscila y se asienta con overshoot).
- **Prohibido**: trazos vectoriales perfectos, colores saturados de pantalla (todo debe verse mineral/polvo), sombras duras, movimiento rápido.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **La regla (0-25%)**: título a tiza con marco garabateado; la tiza "entra" a escribir.
2. **Desarrollo (25-75%)**: la lección se apoya en un garabato funcional (calendario tachado, gráfico a tiza, balanza, tabla) que se dibuja y se anima; anotaciones al margen.
3. **Recapitulación (75-100%)**: subrayado doble con golpes + polvo cayendo; la lección queda centrada y quieta (con vida mínima).

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')` y compón con `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex "[0:v][1:v]overlay=0:0" -c:v libx264 -crf 18 out.mp4`.
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas.
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu `anim.html` (200-300 líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** (trazo con polvo, marco de madera, caligrafía Caveat); corrige y repite.
4. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

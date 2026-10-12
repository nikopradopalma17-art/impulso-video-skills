---
name: video-estilo-pizarra-negra
description: Genera un segmento de video animado en ESTILO PIZARRA NEGRA (pizarra de aula verde-negra con marco de madera, escritura a tiza con triple pasada y polvo, garabatos de tiza, tipografía Caveat) para insertar en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo pizarra", "pizarra negra", "tiza", "estilo aula/clase", o quiera dar una lección, regla o recordatorio ("bunu unutma" / "no olvides esto") dentro de su video — aunque no diga "pizarra".
---

# Estilo Pizarra Negra — lección a tiza

## Qué es y cuándo meterlo en un video
Escena de 5-15 s con la calidez de un **aula**: una pizarra verde-negra con marco de madera donde la tiza escribe la lección, dibuja garabatos y subraya lo importante. Es el estilo de los **momentos didácticos** de un video: reglas que no hay que olvidar, definiciones, "la clave está en...". Funciona muy bien después de una intro con energía (contraste: aquí todo es lento y cálido). Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Ejemplos de uso
- *"Cierra el video con estilo pizarra: la regla de oro del EPP"* → lema grande a tiza
  (número en amarillo) + marco garabateado con estrellas + subrayado doble con polvo.
- *"Un momento tipo aula para explicar qué es un permiso de trabajo"* → lección apoyada
  en un garabato funcional (calendario de casillas tachadas, balanza) dibujado a tiza.
- *"Quiero estilo tiza para un recordatorio: no olvides revisar el extintor"* → este
  estilo (tiza = este motor); adapta el garabato al objeto de la lección.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada
(demo "la regla: 10 minutos al día" con calendario "30 días" tachado, balanza
"10 min ↔ cambio real" y remate "cada día cuenta", DUR 9 s). **Léela completa
primero**: tiene el trazo de tiza con triple pasada (glow + 2 pasadas granuladas +
motas de polvo, `chalkTrace`), la escritura con revelado y barrita de tiza como punta
(`chalkWrite`), el polvo precalculado de la pizarra, el marco de madera con bandeja
(tiza y borrador apoyados), el marco doble garabateado con estrellas, el tachado de 30
casillas en orden barajado y la balanza que se inclina con overshoot. Reusa la maquinaria
y cambia la lección.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('700 120px Caveat')` explícito y tras precalcular texturas — canvas `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado. `Math.random` PROHIBIDO: PRNG con semilla (mulberry32) o hash.
- Fuentes por URL absoluta: `@font-face{font-family:'Caveat';font-weight:700;src:url(../../fuentes/caveat-700.ttf) format('truetype');}`

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB; mira un JPG con Read para confirmar la caligrafía (no serif de respaldo).

## Biblia del estilo (inmutable)
- **Pizarra**: verde-negra `#20362e` con polvo precalculado (1500 motas
  rgba(243,239,226,0.015-0.055) + 12 manchas fantasma de tiza borrada + motas amarillas
  rgba(246,215,107,≤0.03)); marco de madera `#6b4423` de 38 px con betas
  rgba(58,34,14,0.8) y filete interior `#3a2412`; bandeja `#5a3719`/`#7a4f2a` de
  840×34 px con tiza blanca y borrador `#4a4038` + espuma `#d8d2c4`; viñeta
  rgba(0,0,0,0.34).
- **Tizas**: blanco hueso `#f3efe2` (dominante) y amarilla `#f6d76b` (énfasis, números
  clave, tachados). Los trazos de tiza NO son líneas limpias: triple pasada en
  `chalkTrace` (glow blur 7 con alpha 0.3 y lw+3.5 → 2 pasadas granuladas alpha
  0.35/0.8 con jitter ±2.4 px → motas de polvo sobre lo revelado).
- **Tipografía**: Caveat 700 como escritura a tiza — kicker 52 px, número clave 165 px,
  lema 150 px, notas 44-58 px. La escritura (`chalkWrite`) es doble pasada (halo alpha
  0.55 blur 9 + sólida) con clip de revelado y barrita de tiza (9×26 px rotada −0.7 rad)
  como punta que deja 3 motas. Texto en ESPAÑOL.
- **Elementos firma**: marco doble garabateado alrededor del lema (rr 36 px y 26 px +
  4 estrellas de 5 puntas r17/7 en las esquinas); garabatos sueltos (estrella, flecha con
  cabeza); calendario con casillas que se tachan en ORDEN BARAJADO (hash1, cada X en
  ~0.06 s); balanza con brazo de 410 px que oscila 0.02·sin(3t) y se inclina 0.16 rad
  con back (s=2.2); subrayado doble con golpes (lw 7 + 5) y polvo de tiza cayendo con
  caída cuadrática (30 partículas); brillo que titila sobre la estrella; motas flotantes
  de vida sutil.
- **Lenguaje de movimiento**: escritura progresiva (revelado por longitud con jitter de
  mano vivo); pausas de profesor entre frases; los garabatos completos se animan
  sutilmente y se asientan con overshoot; todo lento y cálido.
- **Prohibido**: trazos vectoriales perfectos, colores saturados de pantalla (todo debe verse mineral/polvo), sombras duras, movimiento rápido.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
Beats del demo (DUR 9 s):
1. **La regla (2-27%)**: kicker "la regla:" 52 px (0.15-0.7 s); número clave "10"
   amarillo 165 px (0.7-1.4 s); lema "minutos al día" 150 px (1.35-2.4 s).
2. **Desarrollo (27-76%)**: marco doble garabateado + 4 estrellas (2.45-3.62 s);
   garabatos estrella y flecha (3.35-4.25 s); calendario "30 días" dibujado y tachado
   en orden barajado (4.0-5.85 s); balanza "10 min ↔ cambio real" que se dibuja y se
   inclina (5.75-6.8 s).
3. **Recapitulación (77-100%)**: subrayado doble amarillo (6.95-7.5 s); remate "cada
   día cuenta" 58 px (7.6-8.3 s); polvo cayendo desde 7.3 s; la lección queda quieta
   con vida mínima (motas, brillo de estrella).

## Dependencias y portabilidad
- Depende del motor compartido `motor-estilos-video` (render.mjs + `fonts/` + package.json con playwright-core) y de ffmpeg + Chrome headless en el sistema.
- Fuentes que usa este estilo: `caveat-700.ttf` (en `motor-estilos-video/fonts/`; si te falta el motor, bájala de Google Fonts: Caveat 700).
- Si recibes solo esta carpeta: 1) copia la carpeta a la carpeta de skills de tu agente; 2) consigue `motor-estilos-video` y colócalo junto a las skills; 3) `npm install` dentro del motor; 4) reemplaza la ruta `C:/Users/USER/.codex/skills/motor-estilos-video` por tu ubicación local en los comandos de este documento y en los `@font-face` de `referencia/anim.html`.
- El ground truth visual viaja con la skill: `referencia/anim.html` es una implementación completa y ejecutable del estilo.

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

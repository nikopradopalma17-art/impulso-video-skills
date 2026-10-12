---
name: video-estilo-izometrico
description: Genera un segmento de video animado en ESTILO ISOMÉTRICO (mundo miniatura de maqueta con bloques 2:1 de tres caras sombreadas, paneo de cámara, etiquetas técnicas) para insertar como escena en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo isométrico", "mundo miniatura/maqueta", "estilo miniworld", o quiera explicar un sistema, proceso o flujo con partes conectadas (viajes de datos, logística, arquitectura, "cómo funciona X por dentro") — aunque no use la palabra "isométrico".
---

# Estilo Isométrico — maqueta animada de sistemas

## Qué es y cuándo meterlo en un video
Escena de 5-15 s que muestra un **sistema o proceso como un mundo en miniatura**: bloques
isométricos con tres caras sombreadas, plataformas flotantes y una cámara que panea entre estaciones
mientras algo "viaja" por el sistema. Es el estilo ideal para el **desarrollo de un video cuando la
explicación tiene pasos o piezas conectadas** (emisor → canal → receptor, pedido → envío → entrega).
Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Ejemplos de uso
- *"Explícame cómo viaja un pedido por nuestra logística en mundo miniatura"* → estaciones (tienda →
  centro → reparto) + burbuja viajera + sello final ENTREGADO.
- *"Un miniworld isométrico de nuestra arquitectura de microservicios"* → nodos-bloque, cable con
  impulsos y paneo de cámara entre estaciones con chips numerados.
- *"Muestra emisor → canal → receptor estilo maqueta"* → misma maquinaria: caída de bloques,
  anticipación, arcos de viaje y pop de llegada.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada ("El viaje de un
mensaje", 9 s: teléfono → torre → mar → centro de datos → ENTREGADO). **Léela completa primero**:
tiene los helpers de proyección isométrica 2:1 (`P(x,y,z)`, `K=0.8`) y `cube()` de 3 caras con
sombras elípticas, las caídas con overshoot y stagger (`fall`), 4 estaciones completas (teléfono con
plataforma que se hunde, torre con luz parpadeante, placa de mar hexagonal con olas y velero,
servidores con LEDs acelerables), la burbuja mensajera con cola, el cable Bézier con impulsos
discontinuos, el paneo de cámara de 1730 px y los chips numerados con línea guía. Reusa la
maquinaria y cambia el mundo y la historia.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.ready` = promesa que resuelve tras `document.fonts.load('700 20px SpaceGrotesk')` y
  `document.fonts.load('500 20px SpaceGrotesk')` — canvas `fillText` NO dispara la carga — y tras
  precalcular texturas.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Dibuja el cuadro completo y devuelve
  `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado. `Math.random`
  PROHIBIDO: PRNG con semilla (mulberry32) o hash.
- Fuentes por URL absoluta:
  `@font-face{font-family:'SpaceGrotesk';font-weight:700;src:url(../../fuentes/space-grotesk-700.ttf)
  format('truetype');}` (y 500).

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta,
`CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB; mira un JPG con Read para
confirmar que la tipografía carga (no serif de respaldo).

## Biblia del estilo (inmutable)
- **Fondo**: crema papel `#f4efe6`, tinta `#26332f`, secundario `#5a6b62`; retícula de puntos
  `rgba(15,118,110,0.09)` cada 64 px en parallax (×0.3 del paneo) + manchas suaves
  `rgba(15,118,110,0.05)`; sombras elípticas de contacto `#8a7f6d` alpha 0.13 bajo los bloques;
  viñeta `rgba(88,70,52,0.15)`.
- **Paleta de bloques por caras** (top/left/right): teal `#2aa793`/`#0f766e`/`#0a4f48`, coral
  `#f0876f`/`#e8604c`/`#b23f2e`, mostaza `#f6cf4d`/`#eab308`/`#b08705`, crema
  `#fbf7ef`/`#e8e0d0`/`#cfc4ae`, gris pizarra `#5c6773`/`#3d4650`/`#272e36`, mar
  `#8fc7ee`/`#5d9bd6`/`#3d74ae`; acentos: azul `#2f6fb2` y mostaza oscura `#b89007` (chips), cable
  `#3f4d47`. Contrastes limpios, sin degradados.
- **Proyección**: isométrica 2:1 (ejes a 30°) con `P(x,y,z)=[(x−y)·K,(x+y)·K·0.5−z·K]`, `K=0.8`.
  Todo bloque = cara superior clara + izquierda media + derecha oscura (`cube()`).
- **Tipografía**: Space Grotesk 700 (título 66 px, sello 46 px, chips 28 px con número 23 px en caja
  de 36 px) y 500 (subtítulo tecleado 29 px, pie 28 px). Etiquetas técnicas tipo chip numerado con
  línea guía discontinua. Texto en ESPAÑOL.
- **Elementos firma**: bloques que entran CAYENDO desde 280 px con overshoot back s=1.7 (stagger
  0.12-0.14 s, dur 0.45-0.6 s); paneo lateral de cámara de 1730 px con easeInOutCúbico (3.7-4.9 s) +
  deriva senoidal (±5/±3.5 px); burbuja coral (r 13→22, borde crema, brillo blanco, cola según
  dirección) que viaja por arcos Bézier; cable Bézier que se traza (3.35-3.85) con guiones en flujo
  continuo; luz de torre coral con anillos expandiéndose; 6×3 LEDs que aceleran (6→13 Hz) al
  procesar; olas sinusoidales del mar (4 líneas, `sin(x·0.02+t·1.7)`) y velero; placas/hexágonos y
  cubos flotantes de ambiente; pop final con 10 shards triangulares y sello mostaza 392×112
  (esquinas 26) con check dibujado.
- **Lenguaje de movimiento**: anticipación antes de cada lanzamiento (la plataforma del emisor se
  hunde 7 px en 2.02-2.38 s y dispara), trayectorias curvas Bézier con eases `ez`/`eio`, pop con
  confeti pequeño al final de un hito; vida sutil permanente (parpadeos, olas, flotación).
- **Prohibido**: perspectiva con punto de fuga, rotación libre de la cámara (solo paneo), texturas
  de papel/grano, números sin etiqueta.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Construcción (2-26%, 0.15-2.3 s)**: teléfono, torre y servidores caen en stagger; título 66 px
   con subrayado teal de 560×7 px y punto mostaza (0.25-1.2); subtítulo tecleado con cursor
   (1.0-2.3).
2. **Estación A (19-37%, 1.15-3.35 s)**: la placa del mar sube (1.15-1.8); la burbuja nace (1.75)
   con puntos "escribiendo" (1.7-2.35); chip 01 REDACTAR (1.85); la plataforma se hunde
   (anticipación) y lanza la burbuja en arco hacia la torre (2.3-3.35).
3. **Trayecto (37-68%, 3.35-6.1 s)**: el cable se traza (3.35-3.85) y sus impulsos fluyen; paneo de
   cámara (3.7-4.9); chips 02 SEÑAL (3.4) y 03 TRÁNSITO (4.8); la burbuja cabalga el cable (3.8-6.1)
   y desciende al centro de datos (6.1-6.45); los LEDs aceleran (6.45-7.95).
4. **Llegada (72-100%, 6.5-9.0 s)**: escotilla destella (6.35-6.8) y "procesa" con anillos y
   burbujitas (6.5-7.95); la burbuja sube y estalla (7.9-8.25) con shards; chip 04 ENTREGA (6.2);
   sello ENTREGADO con check dibujado (8.22-8.85) y pie "09:41 · MENSAJE RECIBIDO" (8.55-8.95).

## Dependencias y portabilidad
- Depende del motor compartido `motor-estilos-video` (render.mjs + `fonts/` + package.json con
  playwright-core) y de ffmpeg + Chrome headless en el sistema.
- Fuentes que usa este estilo: `space-grotesk-700.ttf` y `space-grotesk-500.ttf` (en
  `motor-estilos-video/fonts/`; si te falta el motor, bájalas de Google Fonts: Space Grotesk 700 y
  500).
- Si recibes solo esta carpeta: 1) copia la carpeta a la carpeta de skills de tu agente; 2) consigue
  `motor-estilos-video` y colócalo junto a las skills; 3) `npm install` dentro del motor; 4)
  reemplaza la ruta `C:/Users/USER/.codex/skills/motor-estilos-video` por tu ubicación local en los
  comandos de este documento y en los `@font-face` de `referencia/anim.html`.
- El ground truth visual viaja con la skill: `referencia/anim.html` es una implementación completa y
  ejecutable del estilo.

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')`, renderiza PNG y compón con
  `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex "[0:v][1:v]overlay=0:0" -c:v
  libx264 -crf 18 out.mp4`.
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas.
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu `anim.html` (200-400
   líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** (bloques con 3 caras correctas, etiquetas
   legibles); corrige y repite.
4. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf "fps=2,scale=320:-1,tile=6x3"
   -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

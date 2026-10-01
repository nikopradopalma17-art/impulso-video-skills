---
name: video-estilo-linograbado
description: Genera un segmento de video animado en ESTILO LINOGRAVADO (grabado en linóleo: solo negro + crema + rojo bermellón, tipografía slab gigante tallada, sellos con rodillo e impacto, texturas de gubia) para insertar en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo linograbado/linocut", "grabado", "xilografía", o quiera un mensaje único y potente tipo manifiesto o afiche de protesta (una sola frase que golpea) — apertura de impacto o cierre rotundo del video — aunque no sepa nombrar el estilo.
---

# Estilo Linograbado — manifiesto tallado a golpe de sello

## Qué es y cuándo meterlo en un video
Escena de 5-15 s con la fuerza física de un **grabado en linóleo**: tres tintas, tipografía enorme tallada que se ESTAMPA con rodillo e impacto, y texturas de gubia por todas partes. Es el estilo del **mensaje único**: una frase-manifiesto que abre el video con autoridad o lo cierra sin réplica. NO sirve para explicaciones de varios pasos — si el usuario necesita explicar, combina varios sellos secuenciales o usa otro estilo. Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada ("HABLA. AUNQUE TIEMBLE.", 9 s). **Léela completa primero**: tiene los sellos precalculados "tallados" (gubias diagonales + muescas de borde vía destination-out), el rodillo mecánico, el impacto con sacudida y virutas, el rayado de esquina y la franja roja de cierre. Reusa la maquinaria y cambia el mensaje.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('400 40px AlfaSlab')` explícito y tras precalcular los sellos tallados — canvas `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado. `Math.random` PROHIBIDO: PRNG con semilla (mulberry32) o hash.
- Fuentes por URL absoluta: `@font-face{font-family:'AlfaSlab';font-weight:400;src:url(../../fuentes/alfa-slab-one-400.ttf) format('truetype');}`

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB; mira un JPG con Read para confirmar la slab tallada (no serif de respaldo).

## Biblia del estilo (inmutable)
- **Papel**: crema `#efe5d2` con fibra sutil. **Tinta**: negro `#161311` (dominante absoluto). **Acento único**: rojo bermellón `#c22f24` (un elemento, no más). Sombras calculadas como mezclas `rgb(239-11*mix...)` — jamás grises limpios.
- **Tipografía**: Alfa Slab One GIGANTE (140-260 px) tallada: muescas en los bordes y gubias diagonales dentro del trazo (destination-out sobre el sello precalculado). Texto en ESPAÑOL, mayúsculas, frases cortas con punto final.
- **Elementos firma**: rodillo de tinta que pasa ANTES de cada estampado; estampado = caída + impacto + sacudida (2-3 px, decreciente) + virutas de tinta; rayado tallado en esquinas/marcos; imágenes talladas (puño, micrófono, estrella) reveladas por hileras; franja roja que SELLA al final con texto pequeño de pie de imprenta; desregistro de tinta (doble impresión desplazada 2-3 px) en el golpe.
- **Lenguaje de movimiento**: seco y mecánico, sin suavidades — los impactos sacuden, los descansos son quietos con leve temblor de fibra. El entintado "sube contraste" en el cierre.
- **Prohibido**: colores extra, degradados, curvas suaves elásticas, movimiento flotante o lento tipo "glow", fondos con luz.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Rodillo (0-15%)**: el rodillo entinta la plancha (traveseo mecánico, ruido visual).
2. **Sellos (15-75%)**: cada palabra/frase se estampa con ritual completo (rodillo → caída → impacto → sacudida → settle); composición apilada asimétrica, jerarquía por tamaño.
3. **Sello final (75-100%)**: la imagen tallada en rojo (o la franja roja) cierra; contraste máximo; quietud total con fibra respirando.

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')` y compón con `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex "[0:v][1:v]overlay=0:0" -c:v libx264 -crf 18 out.mp4`. Para título sobre footage, talla el texto en negro con alfa en el resto.
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest` (este estilo pide golpes secos graves).

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas.
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu `anim.html` (200-300 líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** (muescas de talla visibles, solo 3 tintas); corrige y repite.
4. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

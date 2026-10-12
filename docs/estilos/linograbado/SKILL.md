---
name: video-estilo-linograbado
description: Genera un segmento de video animado en ESTILO LINOGRAVADO (grabado en linóleo: solo negro + crema + rojo bermellón, tipografía slab gigante tallada, sellos con rodillo e impacto, texturas de gubia) para insertar en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo linograbado/linocut", "grabado", "xilografía", o quiera un mensaje único y potente tipo manifiesto o afiche de protesta (una sola frase que golpea) — apertura de impacto o cierre rotundo del video — aunque no sepa nombrar el estilo.
---

# Estilo Linograbado — manifiesto tallado a golpe de sello

## Qué es y cuándo meterlo en un video
Escena de 5-15 s con la fuerza física de un **grabado en linóleo**: tres tintas, tipografía enorme tallada que se ESTAMPA con rodillo e impacto, y texturas de gubia por todas partes. Es el estilo del **mensaje único**: una frase-manifiesto que abre el video con autoridad o lo cierra sin réplica. NO sirve para explicaciones de varios pasos — si el usuario necesita explicar, combina varios sellos secuenciales o usa otro estilo. Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Ejemplos de uso
- *"Abre el video con un manifiesto estilo grabado: EL CASCO NO SE NEGOCIA"* → rodillo
  que entinta + la frase estampada en 2-3 sellos Alfa Slab + franja roja de cierre.
- *"Un cierre rotundo tipo linocut con la palabra BASTA"* → un solo sello gigante con
  sacudida y motivo tallado en rojo; quietud con temblor de fibra al final.
- *"Quiero estilo xilografía para una frase de protesta"* → este estilo (mismo género);
  apilado asimétrico de palabras con jerarquía por tamaño.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada
(demo "HABLA. AUNQUE TIEMBLE." con pie de imprenta "TALLADO A MANO - EJ. 1/100",
DUR 9 s). **Léela completa primero**: tiene los sellos de texto precalculados "tallados"
(gubias diagonales + muescas de borde vía destination-out + triple pasada de strokeText
desplazada), el motivo tallado del puño con micrófono, el rodillo mecánico, el impacto
con sacudida y virutas de tinta, el grano de madera precalculado, los rayados de esquina,
las cruces de registro, el marco de doble filete y la franja roja que sella abajo.
Reusa la maquinaria y cambia el mensaje.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('400 100px AlfaSlab')` explícito y tras precalcular los sellos tallados — canvas `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado. `Math.random` PROHIBIDO: PRNG con semilla (mulberry32) o hash.
- Fuentes por URL absoluta: `@font-face{font-family:'AlfaSlab';font-weight:400;src:url(../../fuentes/alfa-slab-one-400.ttf) format('truetype');}`

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB; mira un JPG con Read para confirmar la slab tallada (no serif de respaldo).

## Biblia del estilo (inmutable)
- **Papel**: crema `#efe5d2` con grano de madera tallada precalculado (vetas
  rgba(22,19,17,0.04-0.085) cada 12 px, nudos elípticos y motas rgba(120,96,66,≤0.06));
  al entintado final baja luminosidad: `rgb(239-11m, 229-16m, 210-16m)` con m≤0.5.
  **Tinta**: negro `#161311` (dominante absoluto; también rodillo `#241f1b` con puente
  `#3a332c`). **Acento único**: rojo bermellón `#c22f24` (un elemento, no más). Viñeta
  de imprenta rgba(22,19,17,0.22). Sombras como mezclas del crema, jamás grises limpios.
- **Tipografía**: Alfa Slab One GIGANTE tallada — 200 px "HABLA.", 150 px "AUNQUE",
  165 px "TIEMBLE.", pie de imprenta 46 px. Cada sello se precalcula: gubias diagonales
  destination-out (~(w+h)/9 trazos, alpha 0.14-0.52, lw 1-3.4) + 3 pasadas de strokeText
  desplazadas ±1.5 px (desregistro de doble impresión). Texto en ESPAÑOL, mayúsculas,
  frases cortas con punto final.
- **Elementos firma**: rodillo 240×76 px (radio 16) con estela rgba(22,19,17,0.05) que
  pasa 0.45 s a velocidad constante ANTES de cada estampado; estampado = caída desde
  −70 px con easeOut cuártico en 0.11 s + escala 1.3→1 + sacudida decreciente 0.3 s
  (amplitudes 4-7 px por impacto) + 12 virutas de tinta; sombra roja desplazada (+4,+3)
  alpha 0.34 tras el entintado; motivo tallado (puño con micrófono, 520×420 px
  precalculado) revelado por hileras en 1.6 s con línea roja y chispas; rayados de
  esquina 240×170 px (diagonales lw 5-8 con huecos); marco doble filete 12 px + 3 px;
  franja roja de 116 px que barre desde la izquierda en 0.24 s con salpicaduras; cruces
  de registro (26 px + círculo r11) en las 4 esquinas; temblor de fibra ±0.45 px al final.
- **Composición**: sellos apilados en el eje central (y ≈ 232 / 404 / 578) con
  jerarquía por tamaño (200/150/165 px); motivo tallado centrado bajo el texto
  (~(960,800), 374×302 px); cruces de registro y rayados reservan las 4 esquinas;
  la franja roja de 116 px reserva el pie de imprenta.
- **Lenguaje de movimiento**: seco y mecánico, sin suavidades — impactos que sacuden,
  descansos quietos con leve temblor de fibra; el entintado final "sube contraste".
  PRNG mulberry32 + hash1; nada elástico, nada flotante.
- **Prohibido**: colores extra, degradados, curvas suaves elásticas, movimiento flotante o lento tipo "glow", fondos con luz.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
Beats del demo (DUR 9 s):
1. **Primer sello (3-12%)**: cruces de registro (0.25-0.5 s); rodillo 0.55-1.0 s;
   "HABLA." estampa en 1.0 s con impacto 6 px.
2. **Sellos + motivo (17-67%)**: "AUNQUE" en 2.0 s y "TIEMBLE." en 2.95 s (cada una con
   su rodillo previo); puño con micrófono tallado en rojo revelado por hileras 3.5-5.1 s;
   rayados de esquina 5.35-6.04 s.
3. **Sello final (70-100%)**: entintado global 6.3-7.1 s + marco doble filete 6.6 s;
   franja roja barre 7.32-7.56 s + banda de pie de imprenta 7.6-7.75 s; quietud total
   con fibra respirando (±0.45 px) desde 8.2 s.

## Dependencias y portabilidad
- Depende del motor compartido `motor-estilos-video` (render.mjs + `fonts/` + package.json con playwright-core) y de ffmpeg + Chrome headless en el sistema.
- Fuentes que usa este estilo: `alfa-slab-one-400.ttf` (en `motor-estilos-video/fonts/`; si te falta el motor, bájala de Google Fonts: Alfa Slab One 400).
- Si recibes solo esta carpeta: 1) copia la carpeta a la carpeta de skills de tu agente; 2) consigue `motor-estilos-video` y colócalo junto a las skills; 3) `npm install` dentro del motor; 4) reemplaza la ruta `C:/Users/USER/.codex/skills/motor-estilos-video` por tu ubicación local en los comandos de este documento y en los `@font-face` de `referencia/anim.html`.
- El ground truth visual viaja con la skill: `referencia/anim.html` es una implementación completa y ejecutable del estilo.

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

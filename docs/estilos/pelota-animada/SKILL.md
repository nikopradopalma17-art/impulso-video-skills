---
name: video-estilo-pelota-animada
description: Genera un segmento de video animado en ESTILO PELOTA ANIMADA (lienzo de papel
cálido con grano y una pelota teal protagonista con física real —caída, rebotes
decrecientes, squash/stretch, onion-skin—, documentos flat-lay con anotaciones
manuscritas terracota y flechas, corte seco claro↔oscuro y tipografía cinética condensada
con sombras riso rojo/verde) para insertar en un video más largo. Úsalo SIEMPRE que el
usuario pida "pelota animada", "pelota que rebota", "estilo papel", "papel kinético",
"física de pelota", "anotaciones a mano", "producto paper" o quiera contar un
lanzamiento de producto con calidez artesanal y energía física — aunque no diga "pelota".
---

# Estilo Pelota Animada — física de pelota y tipo riso

## Qué es y cuándo meterlo en un video
Escena de 5-15 s donde **una pelota con física real es la protagonista que conecta los
mundos**: cae sobre papel cálido, rebota y recorre los documentos del oficio, y al cortar
a oscuro la tipografía cinética estampa la promesa. Ideal para **lanzamientos de producto,
demos "antes/después" y storytelling con testimonio visual** (curva que rompe el techo).
La pelota ES el mensaje: representa al usuario/equipo que choca contra el trabajo manual
y lo supera. Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Ejemplos de uso
- *"Hazme un segmento estilo pelota animada para lanzar mi app de presupuestos"* → flat-lay
  de documentos del oficio + switch a oscuro + curva que rompe el techo.
- *"Un clip con una pelota que rebota sobre papeles y luego tipografía gigante"* → misma
  maquinaria, contenido adaptado.
- *"Quiero algo tipo papel kinético para presentar mi startup"* → este estilo (el nombre
  anterior del estilo era "papel kinético"; dispara igual).

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada
("Cota · IA para equipos que presupuestan", 9 s) y `referencia/demo-pelota-animada.mp4`
es su render de validación. **Léela completa primero**: tiene el simulador de rebote por
tramos con squash/contacto, el trail de onion-skin, el sistema de escritura manuscrita
progresiva + flechas con cabeza, las tarjetas de papel con sombra y sello rotado, el
bloque de tipo cinética con sombras riso y salida volando, el gráfico con curva sigmoide
que rompe el techo y el regreso con logo. Reusa la maquinaria y cambia el contenido.
`referencia/original.mp4` (15 s) y `referencia/hoja-contacto.jpg` son el ground truth
visual del estilo: consúltalos si dudas de un color, peso o ritmo.

## Origen del estilo (trazabilidad)
Entrada "Paper-style product launch film" de **prompt-motion.com/ik-builds-b8bdcf**,
video IA generado por **@ik_builds** (IIttehadul Karim) con Opus 5.5 (stack HyperFrames +
GSAP, 15 s, one-shot). El video y el prompt pertenecen a su creador; esta skill reproduce
el **lenguaje visual** (paleta, física, anotaciones, switches, tipografía riso) con
contenido demo original en español, no el material de la marca.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('400 90px Anton')`
  explícito por cada fuente y tras precalcular texturas (grano de papel, ruido oscuro,
  retícula de puntos) — canvas `fillText` NO dispara la carga de fuentes.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Devuelve
  `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado.
  `Math.random` PROHIBIDO: PRNG con semilla o hash.
- Fuentes por URL absoluta: `@font-face{font-family:'Anton';font-weight:400;
  src:url(../../fuentes/anton-400.ttf)
  format('truetype');}`

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 1,3.6,5.8,7.6,8.8
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`;
si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB;
mira 2-3 JPG con Read y verifica: pelota redonda en reposo (nunca aplastada), manuscrita
legible (no serif de respaldo), sombras riso visibles en el tipo.

## Biblia del estilo (inmutable)
- **Fondo**: papel cálido `#f0efe9` con grano precalculado + viñeta suave; mundo oscuro
  verde-negro `#1c211e` con retícula de puntos y ruido de grano.
- **Paleta estricta de 6**: papel `#fdfdfb`, tinta `#2f2e2b`, teal `#3fd6b2` (+ sombra
  `#1f9a7c`), terracota `#c4674f`, verde riso `#2f7f6a`, nota adhesiva `#f6e6a8`. NADA
  fuera de esta lista.
- **Formas**: pelota esférica teal con sombreado radial; tarjetas blancas con esquina 10px,
  sombra difusa y rotaciones ±5°; nota adhesiva; tablas y planos con líneas de lápiz;
  subrayados, óvalos y flechas curvas "a mano".
- **Tipografía**: Anton (tipo cinética gigante, 118-132 px), Caveat 700 (anotaciones
  manuscritas, 40-52 px), JetBrains Mono (etiquetas técnicas y dominio), Poppins 700
  (wordmark), Playfair 700 (subtítulo serif). Texto en ESPAÑOL.
- **Elementos firma**: pelota con física real (caída con easeIn cuadrático, contacto con
  squash 0.9 durante ~0.07 s, rebotes decrecientes); trail de onion-skin (anillos fantasma
  + línea punteada); anotaciones que se ESCRIBEN con recorte progresivo; flechas con cabeza
  rellena que se dibujan; sello rotado tipo "ENVIADO"; corte seco con flash blanco de
  2-3 frames entre claro y oscuro; sombras riso (terracota -7px, verde +7px) bajo el tipo
  blanco; curva teal con glow que rompe una línea-techo terracota tachada.
- **Lenguaje de movimiento**: física de verdad (nada de flotar); stagger 0.05 s por letra
  con aterrizaje outBack y squash; entradas de tarjeta con caída 60 px + easeOut; salidas
  volando con rotación; switches de mundo en 1 frame + flash; la pelota conecta escenas.
- **Prohibido**: easings elásticos de "nube", degradados decorativos, colores fuera de la
  paleta, tipografía manuscrita para titulares (solo anotaciones), movimiento sin peso.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Física (0-25%)**: la pelota cae y rebota sobre una línea base dibujándose; primera
   anotación manuscrita nombra al protagonista ("tu empresa").
2. **Mesa de trabajo (25-48%)**: 4 documentos del oficio en flat-lay con stagger
   (resumen con sello, plano, nota adhesiva, tabla de precios) + anotaciones con flechas.
3. **Switch a oscuro + promesa (48-70%)**: corte seco con flash; tarjetas en versión
   fantasma; TIPO CINÉTICA gigante estampa la promesa en 2 líneas con sombras riso,
   subrayado terracota y punto-teal brillante; las letras salen volando.
4. **Prueba (70-88%)**: gráfico con ejes que se dibujan: línea-techo terracota ondulada
   ("el techo", tachada) vs curva sigmoide teal con glow que la rompe; la pelota la cabalga;
   anotaciones "más obras ✓" y corchete "mismo equipo".
5. **Regreso + logo (88-100%)**: flash a papel; la pelota aterriza en su línea; wordmark
   + subtítulo serif + dominio mono con óvalo manuscrito dibujándose.

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')`, renderiza PNG y
  compón con `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex
  "[0:v][1:v]overlay=0:0" -c:v libx264 -crf 18 out.mp4` (el papel tiene fondo opaco;
  para superponer de verdad, pinta el fondo con transparencia en tu anim).
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas (contenido, marca, duración).
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu
   `anim.html` (280-380 líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** (paleta de 6, pelota redonda, sombras
   riso); corrige y repite.
4. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf
   "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

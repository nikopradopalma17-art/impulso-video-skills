---
name: video-estilo-ciencia-animada
description: Genera un segmento de video animado en ESTILO CIENCIA ANIMADA (divulgación científica animada tipo Kurzgesagt: vector plano, colores saturados sobre azul noche, estrellas, partículas con glow, tipografía redonda Fredoka) listo para insertar como escena en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo Kurzgesagt", "ciencia animada", "estilo divulgación científica", "estilo documental animado", "como kurzgesagt", o quiera abrir o explicar un tema con ese look de divulgación espacial — aunque no diga "Kurzgesagt" exactamente. También cuando pida una animación de canvas con este estilo para un punto específico de su video.
---

# Estilo Ciencia Animada (Kurzgesagt) — escena animada de divulgación

## Qué es y cuándo meterlo en un video
Escena animada de 5-15 s (extensible) que **abre o explica un concepto** con la estética de
Kurzgesagt: espacio nocturno, colores planos saturados, formas redondeadas, glow sutil. Es el estilo
de **apertura/enganche** ideal (primeros segundos de un video) y de **explicación de ideas
científicas o abstractas**. Produce un `mp4` 1920×1080 @ 30 fps autónomo, pensado para concatenar
con otros clips (o superponer).

## Ejemplos de uso
- *"Hazme la apertura de mi video de divulgación sobre los agujeros negros estilo Kurzgesagt"* →
  título-pregunta con overshoot sobre campo de estrellas + concepto ocurriendo en pantalla.
- *"Explica la fotosíntesis con ese look de ciencia animada"* → planeta/escenario con el proceso
  visual (partículas, glow) y remate en píldora con squash.
- *"Una intro espacial de 8 s con estrellas y partículas"* → misma maquinaria (estrellas titilantes,
  partículas con estela, transición de escena con transform), otro contenido.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada ("¿Por qué el cielo
es azul?", 9 s). **Léela completa primero** y adáptala: tiene el campo de 120 estrellas titilantes
deterministas (7% con destello en cruz rotando), la Tierra-curva (círculo R 1400) con ciudad de
siluetas y ventanas encendibles, la cúpula atmosférica de 3 arcos, el sol con 10 rayos escalonados y
rim-light, los haces de luz, las 36 partículas con estela de 6 muestras, la transición noche→día con
zoom, el título-pregunta y la píldora-remate con squash. Reusa las utilidades (mulberry32, back,
partículas, easings) y cambia las escenas manteniendo el sistema visual y el ritmo.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('700 40px Fredoka')` y
  `document.fonts.load('500 40px Fredoka')` (canvas `fillText` NO dispara la carga; sin esto el
  texto sale en serif de respaldo) y tras precalcular texturas caras.
- `window.draw({t})` = **función pura de `t`** (0..DUR, segundos). Dibuja el cuadro completo y
  devuelve `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame`, sin estado mutado entre
  llamadas. `Math.random` PROHIBIDO: usa PRNG con semilla (mulberry32) o funciones hash.
- Texturas caras precalcúlalas una vez en offscreen canvas dentro de `ready`.
- Fuentes por URL absoluta:
  `@font-face{font-family:'Fredoka';font-weight:700;src:url(../../fuentes/fredoka-700.ttf)
  format('truetype');}` (mismo patrón para 500).

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.codex/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Usa Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta,
define `CHROME_PATH`). El smoke test debe terminar sin líneas `[pageerror]`/`[console]` y con JPG >
25 KB (un JPG minúsculo = canvas vacío o fuente sin cargar: mira un JPG con Read y verifica que la
tipografía sea redonda, no serif).

## Biblia del estilo (inmutable)
- **Fondo**: gradiente vertical nocturno `#0a112e`→`#151f52`; el amanecer lo aclara a
  `#3fa9e8`→`#bfe9ff`; tinta azul `#0b1233`; viñeta `rgba(4,8,26,0.38)`.
- **Colores planos saturados**: sol `#ff9f43` (rim-light `#ffd98a`), celestes
  `#4fc3f7`/`#8ed8ff`/`#bfe9ff`, azul profundo `#2f9fe0`, rosa `#ff6e9c`, tierra `#131c4a`,
  edificios `#182254`, ventanas cálidas `#ffd166`, estrellas `#dcecff`, pájaros `#123f66`, blanco
  `#ffffff`, partículas en `#4fc3f7`/`#8ed8ff`/`#bfe9ff`/`#ffffff`/`#2f9fe0`, píldora-remate
  `rgba(11,18,51,0.92)`.
- **Tipografía**: Fredoka 700 (título-pregunta 72 px, remate 62 px) y 500 (leyendas 30 px). Texto en
  ESPAÑOL.
- **Elementos firma**: 120 estrellas (r 1-3.1 px, titileo 0.35-1.0, entrada escalonada 0-1.3 s, 7%
  con destello en cruz rotando); sol de r 92 px con 10 rayos (trazo 30 px, largo ~172, glow
  `shadowBlur` 55±18) y rim `#ffd98a`; cúpula atmosférica de 3 arcos concéntricos (trazo 26-64 px,
  `rgba(79,195,247,0.14-0.24)`); 36 partículas azules (r 3-6.2 px, vida 1.9-2.8 s, estela de 6
  muestras cada 0.055 s, glow 12) que rebotan y se dispersan; ventanas de 6×8 px que se encienden en
  stagger; nubes y pájaros redondeados del día; píldora-remate (esquinas 58 px) que cae con squash
  0.85→1 y polvito al aterrizar.
- **Lenguaje de movimiento**: entradas con overshoot suave (back-ease s=1.9), easeOutCubic y
  easeInOutCúbico; flotación senoidal lenta; zoom de cámara sutil 1.0→1.07 hacia el encuadre final;
  transición de escena con transform global (no corte duro); nada estático > 1.5 s (parpadeo,
  flotación).
- **Prohibido**: líneas rectas ásperas o esquinas sin redondear, gradientes realistas, texturas de
  papel/grano, tipografías serif o condensadas, movimiento seco/mecánico.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Gancho (0-15%, 0.45-1.35 s)**: título-pregunta de 72 px entra con overshoot (la palabra clave
   en celeste); las estrellas titilan escalonadas.
2. **Setup (22-40%, 2.0-3.6 s)**: la cúpula atmosférica se dibuja (2.0-2.95); la Tierra-ciudad con
   ventanas encendibles; el sol entra con anticipación y overshoot (2.3-3.25) y despliega rayos
   escalonados (2.9+).
3. **Explicación (39-73%, 3.5-6.6 s)**: haces de luz (3.5-4.2), 3 destellos de impacto (3.55+), 36
   partículas rebotan y se dispersan (3.62-5.3), leyenda corta con guía punteada (4.75-6.6). El
   concepto ocurre EN PANTALLA, no en texto largo.
4. **Amanecer + remate (63-100%, 5.7-9.0 s)**: noche→día + zoom (5.7-6.95); el título sale
   (5.95-6.55); nubes y pájaros (6.0-7.9); la píldora cae con squash (6.95-8.0) y todo se asienta.

## Dependencias y portabilidad
- Depende del motor compartido `motor-estilos-video` (render.mjs + `fonts/` + package.json con
  playwright-core) y de ffmpeg + Chrome headless en el sistema.
- Fuentes que usa este estilo: `fredoka-700.ttf` y `fredoka-500.ttf` (en
  `motor-estilos-video/fonts/`; si te falta el motor, bájalas de Google Fonts: Fredoka 700 y 500).
- Si recibes solo esta carpeta: 1) copia la carpeta a la carpeta de skills de tu agente; 2) consigue
  `motor-estilos-video` y colócalo junto a las skills; 3) `npm install` dentro del motor; 4)
  reemplaza la ruta `C:/Users/USER/.codex/skills/motor-estilos-video` por tu ubicación local en los
  comandos de este documento y en los `@font-face` de `referencia/anim.html`.
- El ground truth visual viaja con la skill: `referencia/anim.html` es una implementación completa y
  ejecutable del estilo.

## Integración en un video mayor
- **Escena completa**: usa el mp4 tal cual (concat con ffmpeg `-f concat -c copy` si todos los clips
  comparten specs, o re-encodea).
- **Superposición sobre footage**: cambia `toDataURL('image/jpeg',0.92)` por
  `toDataURL('image/png')` (con alfa donde haga falta), renderiza la secuencia PNG y compón: `ffmpeg
  -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex "[0:v][1:v]overlay=0:0" -c:v libx264
  -crf 18 out.mp4`.
- Para sonorizar: agrega audio con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy
  -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas.
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu `anim.html` (200-350
   líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** verificando estilo y legibilidad; corrige y repite.
4. Render completo; genera una hoja de contacto (`ffmpeg -i out/x.mp4 -vf
   "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

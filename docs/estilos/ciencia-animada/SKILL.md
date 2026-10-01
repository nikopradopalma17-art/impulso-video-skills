---
name: video-estilo-ciencia-animada
description: Genera un segmento de video animado en ESTILO CIENCIA ANIMADA (divulgación científica animada tipo Kurzgesagt: vector plano, colores saturados sobre azul noche, estrellas, partículas con glow, tipografía redonda Fredoka) listo para insertar como escena en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo Kurzgesagt", "ciencia animada", "estilo divulgación científica", "estilo documental animado", "como kurzgesagt", o quiera abrir o explicar un tema con ese look de divulgación espacial — aunque no diga "Kurzgesagt" exactamente. También cuando pida una animación de canvas con este estilo para un punto específico de su video.
---

# Estilo Ciencia Animada (Kurzgesagt) — escena animada de divulgación

## Qué es y cuándo meterlo en un video
Escena animada de 5-15 s (extensible) que **abre o explica un concepto** con la estética de Kurzgesagt: espacio nocturno, colores planos saturados, formas redondeadas, glow sutil. Es el estilo de **apertura/enganche** ideal (primeros segundos de un video) y de **explicación de ideas científicas o abstractas**. Produce un `mp4` 1920×1080 @ 30 fps autónomo, pensado para concatenar con otros clips (o superponer).

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada ("¿Por qué el cielo es azul?", 9 s). **Léela completa primero** y adáptala: cambia el contenido y las escenas manteniendo el sistema visual (paleta, helpers de easing/partículas, ritmo). Si el pedido es otro tema, reutiliza sus utilidades (estrellas, glow, partículas con estela, entrada con overshoot).

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load('700 40px Fredoka')` y `document.fonts.load('500 40px Fredoka')` (canvas `fillText` NO dispara la carga; sin esto el texto sale en serif de respaldo) y tras precalcular texturas caras.
- `window.draw({t})` = **función pura de `t`** (0..DUR, segundos). Dibuja el cuadro completo y devuelve `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame`, sin estado mutado entre llamadas. `Math.random` PROHIBIDO: usa PRNG con semilla (mulberry32) o funciones hash.
- Texturas caras precalcúlalas una vez en offscreen canvas dentro de `ready`.
- Fuentes por URL absoluta: `@font-face{font-family:'Fredoka';font-weight:700;src:url(../../fuentes/fredoka-700.ttf) format('truetype');}` (mismo patrón para 500).

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Usa Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta, define `CHROME_PATH`). El smoke test debe terminar sin líneas `[pageerror]`/`[console]` y con JPG > 25 KB (un JPG minúsculo = canvas vacío o fuente sin cargar: mira un JPG con Read y verifica que la tipografía sea redonda, no serif).

## Biblia del estilo (inmutable)
- **Fondo**: azul noche profundo `#0b1233` (escenas nocturnas/espacio) o `#0a112e`; en el cierre diurno puede aclararse a celeste `#8ed8ff`→`#bfe9ff`.
- **Colores planos saturados**: sol/naranja `#ff9f43` (rim-light `#ffd9a0`), celeste `#4fc3f7` / `#2f9fe0`, rosa `#ff6e9c`, blanco cálido `#eaf6ff`, azul edificios `#151f52`/`#131c4a`.
- **Tipografía**: Fredoka 700 (títulos, 60-90 px) y 500 (cuerpo ≥ 30 px). Texto en ESPAÑOL.
- **Elementos firma**: estrellas titilantes + destellos en cruz; curvas planetarias con rim-light glow (`shadowBlur` moderado); partículas pequeñas con estela y posiciones deterministas; ventanas/luces que se encienden en stagger; nubes y pájaros redondeados.
- **Lenguaje de movimiento**: entradas con overshoot suave (back-ease), flotación senoidal lenta, zoom de cámara sutil (escala 1.0→1.04), transición de escena con transform global (no corte duro).
- **Prohibido**: líneas rectas ásperas o esquinas sin redondear, gradientes realistas, texturas de papel/grano, tipografías serif o condensadas, movimiento seco/mecánico.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Gancho (0-15%)**: título-pregunta o promesa entra con overshoot.
2. **Setup (15-40%)**: sujeto principal (planeta, objeto) entra flotando; contexto.
3. **Explicación (40-75%)**: el concepto ocurre EN PANTALLA (proceso visual, no texto largo); etiquetas cortas aparecen cuando el gesto lo pide.
4. **Remate (75-100%)**: conclusión en píldora/cinta que cae con squash; todo se asienta (nada cortado a medias en el último segundo). Vida sutil siempre (parpadeo, flotación) — nada estático > 1.5 s.

## Integración en un video mayor
- **Escena completa**: usa el mp4 tal cual (concat con ffmpeg `-f concat -c copy` si todos los clips comparten specs, o re-encodea).
- **Superposición sobre footage**: cambia `toDataURL('image/jpeg',0.92)` por `toDataURL('image/png')` (con alfa donde haga falta), renderiza la secuencia PNG y compón: `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex "[0:v][1:v]overlay=0:0" -c:v libx264 -crf 18 out.mp4`.
- Para sonorizar: agrega audio con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas.
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu `anim.html` (200-350 líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** verificando estilo y legibilidad; corrige y repite.
4. Render completo; genera una hoja de contacto (`ffmpeg -i out/x.mp4 -vf "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

---
name: video-estilo-izometrico
description: Genera un segmento de video animado en ESTILO ISOMÉTRICO (mundo miniatura de maqueta con bloques 2:1 de tres caras sombreadas, paneo de cámara, etiquetas técnicas) para insertar como escena en un video más largo. Úsalo SIEMPRE que el usuario pida "estilo isométrico", "mundo miniatura/maqueta", "estilo miniworld", o quiera explicar un sistema, proceso o flujo con partes conectadas (viajes de datos, logística, arquitectura, "cómo funciona X por dentro") — aunque no use la palabra "isométrico".
---

# Estilo Isométrico — maqueta animada de sistemas

## Qué es y cuándo meterlo en un video
Escena de 5-15 s que muestra un **sistema o proceso como un mundo en miniatura**: bloques isométricos con tres caras sombreadas, plataformas flotantes y una cámara que panea entre estaciones mientras algo "viaja" por el sistema. Es el estilo ideal para el **desarrollo de un video cuando la explicación tiene pasos o piezas conectadas** (emisor → canal → receptor, pedido → envío → entrega). Produce un `mp4` 1920×1080 @ 30 fps autónomo.

## Referencia funcional (ADAPTAR, no reinventar)
`referencia/anim.html` en esta carpeta es una implementación completa y validada ("El viaje de un mensaje", 9 s: teléfono → torre → mar → centro de datos → ENTREGADO). **Léela completa primero**: tiene los helpers de proyección isométrica, bloques de 3 caras, paneo de cámara y etiquetas-chip. Reusa la maquinaria y cambia el mundo y la historia.

## Contrato técnico (inmutable)
Archivo único `<carpeta>/anim.html`:
- Canvas `id="c"` 1920×1080, `body{margin:0}`, fondo del color base en CSS.
- `window.DUR` = duración en segundos.
- `window.ready` = promesa que resuelve tras `document.fonts.load()` explícitos de cada peso usado (p. ej. `document.fonts.load('700 40px SpaceGrotesk')`) — canvas `fillText` NO dispara la carga — y tras precalcular texturas.
- `window.draw({t})` = **función pura de `t`** (0..DUR). Dibuja el cuadro completo y devuelve `cv.toDataURL('image/jpeg', 0.92)`. Sin `requestAnimationFrame` ni estado mutado. `Math.random` PROHIBIDO: PRNG con semilla (mulberry32) o hash.
- Fuentes por URL absoluta: `@font-face{font-family:'SpaceGrotesk';font-weight:700;src:url(../../fuentes/space-grotesk-700.ttf) format('truetype');}` (y 500).

## Motor de render (ya instalado)
```
# Smoke test (obligatorio antes del render completo):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto> --times 0.5,3,6,8.5
# Render completo → <carpeta>/out/<nombre>.mp4 (H.264 yuv420p crf 18 + AAC silencioso):
node C:/Users/USER/.zcode/skills/motor-estilos-video/render.mjs <carpeta-del-proyecto>
```
Chrome headless del sistema (`C:/Program Files/Google/Chrome/Application/chrome.exe`; si falta, `CHROME_PATH`). Smoke test sin `[pageerror]`/`[console]` y JPG > 25 KB; mira un JPG con Read para confirmar que la tipografía carga (no serif de respaldo).

## Biblia del estilo (inmutable)
- **Fondo**: crema papel `#f4efe6`, con retícula de puntos muy sutil y sombras elípticas grises bajo los bloques.
- **Paleta de bloques**: teal `#0f766e` (cara clara `#2aa793`, oscura `#0a4f48`), coral `#e8604c`, mostaza `#eab308`, azul `#3d74ae`, techos mostaza. Contrastes limpios, sin degradados.
- **Proyección**: isométrica 2:1 (ejes a 30°). Todo bloque = cara superior clara + izquierda media + derecha oscura. Aprende del helper de la referencia.
- **Tipografía**: Space Grotesk 700 (títulos) y 500 (etiquetas ≥ 28 px). Etiquetas técnicas tipo chip numerado con línea guía discontinua. Texto en ESPAÑOL.
- **Elementos firma**: bloques que entran CAYENDO a su sitio con overshoot escalonado; paneo lateral de cámara entre estaciones (mundo desplazado con transform, determinista); placas/hexágonos flotantes; luces y LEDs que parpadean en secuencia; burbujas/objetos que viajan siguiendo arcos con cola.
- **Lenguaje de movimiento**: anticipation antes de cada lanzamiento (el emisor se hunde, luego dispara), trayectorias curvas, pop con confeti pequeño al final de un hito.
- **Prohibido**: perspectiva con punto de fuga, rotación libre de la cámara (solo paneo), texturas de papel/grano, números sin etiqueta.

## Estructura narrativa (adapta a la duración pedida; si no hay, 9 s)
1. **Construcción (0-15%)**: el mundo se monta (bloques caen en stagger) + título.
2. **Estación A (15-40%)**: primer nodo con su etiqueta; el objeto/mensaje se prepara (anticipation).
3. **Trayecto (40-75%)**: paneo de cámara siguiendo el viaje por el sistema (cable, camino, proceso); estaciones intermedias reaccionan (luces, olas, LEDs).
4. **Llegada (75-100%)**: sello/burbuja de resultado ("ENTREGADO", check) con pop; todo se asienta. Vida sutil permanente (parpadeos, olas, flotación de placas).

## Integración en un video mayor
- **Escena completa**: concat el mp4 (`-f concat -c copy` con specs iguales, o re-encode).
- **Superposición sobre footage**: cambia a `toDataURL('image/png')`, renderiza PNG y compón con `ffmpeg -i fondo.mp4 -framerate 30 -i frames/%05d.png -filter_complex "[0:v][1:v]overlay=0:0" -c:v libx264 -crf 18 out.mp4`.
- Sonoriza con `ffmpeg -i clip.mp4 -i audio.m4a -map 0:v -map 1:a -c:v copy -shortest`.

## Proceso obligatorio
1. Lee `referencia/anim.html` completa; identifica qué adaptas.
2. Crea la carpeta del proyecto (dentro del proyecto del usuario) y escribe tu `anim.html` (200-400 líneas).
3. Smoke test + **mira 2-3 fotogramas con Read** (bloques con 3 caras correctas, etiquetas legibles); corrige y repite.
4. Render completo; hoja de contacto (`ffmpeg -i out/x.mp4 -vf "fps=2,scale=320:-1,tile=6x3" -frames:v 1 hoja.jpg`) y revísala con Read.
5. Entrega la ruta del mp4 + 1 frase de qué muestra y 1 defecto conocido si lo hay.

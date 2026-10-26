---
name: video-estilo-explicador-editorial
description: Genera un VIDEO EXPLICATIVO COMPLETO (narrado con voz, música y efectos) en LOOK EDITORIAL del motor explainroo — ensayo impreso: papel cálido, titular serif en Instrument Serif, reglas finas, paleta desaturada con rojo profundo, ritmo sereno con fades. Úsalo SIEMPRE que el usuario pida "look editorial", "estilo ensayo/revista explainroo", "explicativo elegante narrado de historia o dinero" o un video contemplativo de 45 a 120 s sobre un tema serio — aunque no mencione "editorial".
---

# Look Editorial (explainroo) — el ensayo elegante en serif

## Qué es y cuándo usarlo
Video explicativo **completo y narrado** (45–120 s) con la sobriedad de un buen ensayo
impreso: papel cálido, titulares en **serif** (Instrument Serif), reglas horizontales
finas, kickers en versalitas y una paleta desaturada cuyo único grito es un rojo profundo.
Todo entra con rises y fades suaves; nada se dibuja a mano. Música calmada, transición
fade. Es el look de los **temas que hay que pensar**: historia, dinero, tiempo, decisiones.

**Ideal para**: ensayos en video, "por qué existe X" (los años bisiestos son el ejemplo
oficial), economía personal, historias con fecha y contexto, cualquier tema donde la
elegancia serene el argumento.

## Ejemplos de uso
- *"Un video en look editorial de por qué existen los años bisiestos"* → el cuarto de día
  perdido, la regla de los siglos y 1900 como contraejemplo, 1:09, 16:9 (ejemplo oficial).
- *"Look editorial para explicar la historia del tipo de cambio en 90 segundos"* → línea
  de tiempo con reglas finas y fechas en versalitas, 16:9.
- *"Un ensayo en video sobre por qué fracasan las resoluciones de año nuevo"* → titular
  serif + tres razones numeradas con ritmo sereno, 1:20.

## Cómo se replica: el motor explainroo (contrato técnico)
Este look lo produce el motor **explainroo** (MIT, `vincentsch/explainroo`): convierte
`script.md` (narración) + `scenes.js` (dibujo) en un MP4 narrado con música.

**1. Preparar el motor (una vez por máquina)** — ya viene incluido en este catálogo
(`02-explainers/vincentsch--explainroo`, clon superficial con README y AGENTS.md en español):
```bash
# Copia la carpeta del catálogo a tu espacio de trabajo (o clona el original de GitHub):
cp -r 02-explainers/vincentsch--explainroo ~/explainroo && cd ~/explainroo
npm install
node bin/explainroo.js doctor --fetch   # verifica Node/ffmpeg/Chrome; baja modelos de voz (~400 MB)
```

**2. Crear el proyecto en este look:**
```bash
node bin/explainroo.js init videos/<nombre> --theme editorial --title "Título" \
  --language es --size youtube     # sizes: youtube|shorts|tiktok|reels|vertical|instagram|linkedin|square
```
En `video.json` queda `"theme": "editorial"`, `"language": "es"` (voz `ef_dora`). El
español necesita `espeak-ng` (Windows: instalador de su GitHub; macOS: `brew`; Linux:
`apt`).

**3. Escribir la narración (`script.md`)** — la narración va primero y fija el timing:
```markdown
# Título del video

## intro {hold=1.5}
Primera frase que plantea la pregunta. [#fecha] Cada marcador nombra un momento animable.
```
Una idea por escena (1–3 frases, 4–15 s). Frases de 8–18 palabras. Tono ensayo: pausado,
con contexto, sin gritar. Sin cifras inventadas.

**4. Generar la voz y revisar:**
```bash
node bin/explainroo.js voice videos/<nombre>
```

**5. Escribir las escenas (`scenes.js`)** — una función por escena; cada elemento anclado
a la palabra: `s.text('1900', { at: '#siglo', size: 96 })`, reglas con `s.line`. Layouts
base: número grande, comparación, pasos en orden, hub con partes. Títulos 80–110 px,
etiquetas 40–56 px, dentro de `s.safe`.

**6. Revisar viendo frames:**
```bash
node bin/explainroo.js check videos/<nombre>
node bin/explainroo.js still videos/<nombre>
node bin/explainroo.js sheet videos/<nombre>
```

**7. Render final y verificación:**
```bash
node bin/explainroo.js render videos/<nombre> --draft
node bin/explainroo.js render videos/<nombre>     # MP4 + .srt/.vtt + cover.jpg
node bin/explainroo.js verify videos/<nombre>
```

## Biblia del look (tokens exactos del tema `editorial`)
- **Fondo**: papel cálido `#f5f1ea` con grano sutil y viñeta (la misma textura paper, más
  quieta).
- **Colores**: tinta `#1c1a17` · superficie `#fffdf9` · atenuado `#76706a` · acento
  **rojo profundo**. Paleta desaturada de revista: rojo `#c2462b`, naranja `#c7782a`,
  amarillo `#b8932a`, verde `#3d7a57`, teal `#2c7a74`, azul `#2f5b88`, morado `#6a4e8c`,
  rosa `#b04870`, gris `#8a847b`.
- **Tipografía**: display y mano **Instrument Serif 400** (tracking −0.01) · cuerpo
  **Inter 400** — el contraste serif/serif con sans de apoyo es la firma.
- **Trazo**: liso y fino (2.5), radio 8, sombra muy suave `rgba(40,32,20,0.10)`.
- **Entradas**: todo **rise** o **fade** — sin pops bruscos; flechas y líneas se dibujan.
- **Transición de escena**: `fade`. **Música**: `calm`. **SFX**: discretos (pop suave,
  whoosh apagado, tick).
- **Código/terminal**: bloque tinta `#1c1a17` con sintaxis apagada (keyword `#e0896f`,
  string `#a9c49a`, número `#e3b866`).

## Reglas de narración y encuadre (del propio motor)
- Tono de ensayo: contexto primero, una idea por escena, cierre que resume sin moralina.
- Algo nuevo cada 2–4 s, pero con ritmo sereno (una regla nueva, una fecha, un número).
- Fechas y cifras protagonistas en grande; el rojo solo para el subrayado héroe.
- La cámara sigue la narración; dibuja la escena completa y deja que ella encuadre.

## Prohibido
- Neón, sombras duras, garabatos o texturas de pizarra: esto es papel de revista.
- Más de un acento rojo fuerte por escena.
- Poner la narración completa en pantalla (usa `"captions": true` si debe leerse).
- Inventar fechas, citas o cifras históricas: si no se verifica, fuera.

## Demo de galería y créditos
`referencia/anim.html` es la miniatura animada del look (canvas 1920×1080, contrato
`window.DUR/ready/draw`, determinista): kicker en versalitas, cita serif entre reglas y
subrayado rojo. La genera `scripts/generar_anim_explicadores.mjs` con los tokens reales.

**Demo real incluido** (renderizado con el motor de este repo):
`referencia/demo-por-que-bisiestos.mp4` — «Why we have leap years», 69 s, en inglés,
subtítulos `.srt` incluidos. Proyecto fuente:
`02-explainers/vincentsch--explainroo/examples/leap-years`.

Look del motor **explainroo** de Vincent Schmalbach — MIT
(github.com/vincentsch/explainroo). Tokens de `engine/themes.js`. Ejemplos vivos:
explainroo.com/videos/ (por qué existen los años bisiestos).

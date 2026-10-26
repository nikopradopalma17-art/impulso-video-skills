---
name: video-estilo-explicador-paper
description: Genera un VIDEO EXPLICATIVO COMPLETO (narrado con voz, música y efectos) en LOOK PAPER del motor explainroo — papel crema con grano, trazo a mano alzada en Kalam, todo se DIBUJA y se ESCRIBE mientras la voz narra, transición de brochazo. Úsalo SIEMPRE que el usuario pida "look paper", "estilo papel explainroo", "explicativo amigable dibujado a mano con narración", "video tipo cuaderno que se dibuja solo" o un explainer narrado de 45 a 120 s con calidez artesanal — aunque no mencione "paper".
---

# Look Paper (explainroo) — el explicador amigable que se dibuja a mano

## Qué es y cuándo usarlo
Video explicativo **completo y narrado** (45–120 s) donde todo se dibuja a mano sobre papel
crema con grano: el título se escribe con rotulador, las formas aparecen trazo a trazo con
temblor humano y los pasos se conectan con flechas garabateadas. Es el look **por defecto de
explainroo** y el más versátil: cae bien en cualquier audiencia. La voz (Kokoro local o
ElevenLabs) marca el tiempo de cada dibujo palabra por palabra, con música cálida y efectos
de garabato. Produce MP4 + subtítulos (.srt/.vtt) + portada, en horizontal, vertical o cuadrado.

**Ideal para**: tutoriales paso a paso, "cómo funciona X", consejos de trabajo, divulgación
científica amable, cualquier tema que se construya en pantalla mientras se explica.

## Ejemplos de uso
- *"Hazme un video en look paper explicando cómo dar retroalimentación útil"* → 4 partes que
  se dibujan y numeran en círculos rojos, 56 s, formato cuadrado para feed.
- *"Un explicativo de 70 s en estilo papel sobre cómo arrancar un auto con cables"* → pasos
  con el orden de los cables dibujado trazo a trazo, flechas de brochazo entre pasos.
- *"Video narrado dibujado a mano de cómo explainroo hace un video"* → el propio ejemplo
  oficial del look (1:26, 16:9): script → escenas → voz → MP4.

## Cómo se replica: el motor explainroo (contrato técnico)
Este look NO es un canvas propio: lo produce el motor **explainroo** (MIT,
`vincentsch/explainroo`), que convierte `script.md` (narración) + `scenes.js` (dibujo) en un
MP4 narrado con música. Tu agente escribe ambos archivos; el motor hace el resto.

**1. Preparar el motor (una vez por máquina):**
```bash
git clone https://github.com/vincentsch/explainroo.git
cd explainroo
npm install
node bin/explainroo.js doctor --fetch   # verifica Node/ffmpeg/Chrome; baja modelos de voz (~400 MB)
```

**2. Crear el proyecto en este look:**
```bash
node bin/explainroo.js init videos/<nombre> --theme paper --title "Título" \
  --language es --size youtube     # sizes: youtube|shorts|tiktok|reels|vertical|instagram|linkedin|square
```
En `video.json` queda `"theme": "paper"`, `"language": "es"` (voz española por defecto:
`ef_dora`). El español necesita `espeak-ng` instalado (Windows: instalador de su GitHub;
macOS: `brew install espeak-ng`; Linux: `sudo apt install espeak-ng`). Añade `--pace 1.2`
si el usuario quiere un video más rápido.

**3. Escribir la narración (`script.md`)** — la narración va primero y fija el timing:
```markdown
# Título del video

## intro {hold=1.5}
Primera frase que plantea la pregunta. [#idea] Cada marcador nombra un momento animable.
[pause 0.6] Las siglas se escriben {SQL|sequel} para que la voz las diga bien.
```
Una idea por escena (1–3 frases, 4–15 s). Frases de 8–18 palabras. Sin cifras inventadas.

**4. Generar la voz y revisar:**
```bash
node bin/explainroo.js voice videos/<nombre>   # imprime duración por escena y palabras confirmadas
```

**5. Escribir las escenas (`scenes.js`)** — una función por escena, cada dibujo anclado a la
palabra: `s.box('Paso 1', { at: '#idea', color: 'red' })`, `s.arrow('a','b',{at:'luego'})`.
Layouts base: número grande, comparación, pasos en orden, hub con partes. Títulos 80–110 px,
etiquetas 40–56 px, dentro de `s.safe`. Máx 5–6 elementos simultáneos.

**6. Revisar viendo frames (el agente no "mira" el video, ve imágenes):**
```bash
node bin/explainroo.js check videos/<nombre>   # corrige TODO error y warning
node bin/explainroo.js still videos/<nombre>   # fin de cada escena
node bin/explainroo.js sheet videos/<nombre>   # hoja de contacto del video entero
```

**7. Render final y verificación:**
```bash
node bin/explainroo.js render videos/<nombre> --draft   # versión rápida a media resolución
node bin/explainroo.js render videos/<nombre>           # final: MP4 + .srt/.vtt + cover.jpg
node bin/explainroo.js verify videos/<nombre>           # loudness, frames negros, voz vs música
```

## Biblia del look (tokens exactos del tema `paper`)
- **Fondo**: papel crema `#f7f3ea` con grano (motas), fibras y viñeta cálida.
- **Colores**: tinta `#26221d` · superficie `#fffdf8` · atenuado `#857f73` · acento **rojo**.
  Paleta: rojo `#df5a3f`, naranja `#ee8f3a`, amarillo `#f1c04e`, verde `#4f9a66`, teal
  `#2c9c8f`, azul `#3c6fa8`, morado `#7b5fa6`, rosa `#e07397`, gris `#8f887b`.
- **Tipografía**: display **Kalam 700** · cuerpo **Kalam 400** · mano Patrick Hand 400 ·
  mono JetBrains Mono 400.
- **Trazo**: rugoso (roughness 1.15, bowing 1.2), ancho 4.5, esquinas radio 14, sin sombra.
- **Entradas**: formas e íconos se **dibujan**; texto y títulos se **escriben**; imágenes
  hacen pop; listas se escriben; código y números hacen fade.
- **Transición de escena**: `brush` (brochazo). **Música**: `warm`. **SFX**: garabato en
  formas/flechas/líneas, pop en íconos, blip en listas, tick en números, type en código.
- **Código/terminal**: bloque oscuro `#2b2723` con sintaxis cálida (keyword `#f19a6b`,
  string `#a8d08d`, número `#f1c04e`, fn `#8cc4f2`).

## Reglas de narración y encuadre (del propio motor)
- Escribe como se le explica a alguien en una mesa: frases cortas, palabras cotidianas,
  quién hace qué. Nada de eslóganes ni "vamos a ver".
- Algo nuevo en pantalla cada 2–4 s; cada frase debe disparar al menos un dibujo (`at`).
- Un mismo concepto conserva su color y su sitio de principio a fin; el acento rojo solo
  para lo más importante.
- La cámara del motor sigue la narración: tú dibujas la escena completa como cuadro final y
  ella encuentra los acercamientos.

## Prohibido
- Poner en pantalla la narración completa (si debe leerse, activa `"captions": true`).
- Cambiar de sitio o de color un concepto a mitad de video.
- Más de 2 tipografías, degradados, 3D o formas perfectas sin temblor (se ven falsas).
- Inventar cifras, citas o afirmaciones: si no se puede verificar, fuera.

## Demo de galería y créditos
`referencia/anim.html` es la miniatura animada de este look (canvas 1920×1080, contrato
`window.DUR/ready/draw`, determinista, ~4.6 s): ábrela en el navegador para ver su lenguaje
visual, o re-renderízala con el motor de estilos. La genera
`scripts/generar_anim_explicadores.mjs` a partir de los tokens reales.

Look del motor **explainroo** de Vincent Schmalbach — MIT
(github.com/vincentsch/explainroo). Tokens tomados de `engine/themes.js`. Ejemplos vivos
del look: explainroo.com/videos/ (feedback, stand-ups, café, ¿por qué el cielo es azul?).

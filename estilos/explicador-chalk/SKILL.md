---
name: video-estilo-explicador-chalk
description: Genera un VIDEO EXPLICATIVO COMPLETO (narrado con voz, música y efectos) en LOOK CHALK del motor explainroo — pizarra verde oscuro con textura de tiza, trazos de tiza con temblor en Cabin Sketch, encerrar ideas en círculos amarillos y conectar con flechas de tiza. Úsalo SIEMPRE que el usuario pida "look chalk", "estilo pizarra explainroo", "clase magistral en pizarra narrada", "explicativo de enseñanza con tiza" o un explainer didáctico de 45 a 120 s — aunque no mencione "chalk".
---

# Look Chalk (explainroo) — dar clase con tiza viva

## Qué es y cuándo usarlo
Video explicativo **completo y narrado** (45–120 s) que reproduce la experiencia de una
clase magistral: pizarra verde oscuro con manchas de borrado, y todo se traza con **tiza**
— círculos alrededor de la idea clave, flechas que conectan concepto y ejemplo, subrayados
con temblor. Música calmada y transición de brochazo (como pasar el borrador). Es el look
de **enseñanza**: física, matemáticas, sistemas, cualquier cosa que se explique encerrando
y conectando. Produce MP4 + subtítulos + portada en todos los formatos.

**Ideal para**: ciencias y matemáticas, conceptos técnicos que se construyen con diagramas,
decisión de escribir las cosas ("por qué documentar decisiones"), lecciones en cualquier
idioma (hay ejemplos oficiales en japonés y chino).

## Ejemplos de uso
- *"Un video en look chalk de cómo el DNS encuentra un sitio"* → resolutor → caché → IP con
  flechas de tiza, 1:08, 16:9 (ejemplo oficial).
- *"Explica en pizarra por qué el área del círculo es πr²"* → gajos que se reordenan en un
  rectángulo, 1:20, 16:9.
- *"Look chalk para explicar por qué la masa madre hace subir el pan"* → levadura + gluten
  + horno trazados con tiza, 0:56, 9:16.

## Cómo se replica: el motor explainroo (contrato técnico)
Este look lo produce el motor **explainroo** (MIT, `vincentsch/explainroo`): convierte
`script.md` (narración) + `scenes.js` (dibujo) en un MP4 narrado con música.

**1. Preparar el motor (una vez por máquina):**
```bash
git clone https://github.com/vincentsch/explainroo.git
cd explainroo
npm install
node bin/explainroo.js doctor --fetch   # verifica Node/ffmpeg/Chrome; baja modelos de voz (~400 MB)
```

**2. Crear el proyecto en este look:**
```bash
node bin/explainroo.js init videos/<nombre> --theme chalk --title "Título" \
  --language es --size youtube     # sizes: youtube|shorts|tiktok|reels|vertical|instagram|linkedin|square
```
En `video.json` queda `"theme": "chalk"`, `"language": "es"` (voz `ef_dora`). El español
necesita `espeak-ng` (Windows: instalador de su GitHub; macOS: `brew`; Linux: `apt`).

**3. Escribir la narración (`script.md`)** — la narración va primero y fija el timing:
```markdown
# Título del video

## intro {hold=1.5}
Primera frase que plantea la pregunta. [#idea] Cada marcador nombra un momento animable.
```
Una idea por escena (1–3 frases, 4–15 s). Frases de 8–18 palabras. Sin cifras inventadas.

**4. Generar la voz y revisar:**
```bash
node bin/explainroo.js voice videos/<nombre>
```

**5. Escribir las escenas (`scenes.js`)** — una función por escena; cada trazo anclado a
la palabra: `s.box('ejemplo', { at: '#paso' })`, `s.arrow('idea','ejemplo')`. Layouts base:
número grande, comparación, pasos en orden, hub con partes. Títulos 80–110 px, etiquetas
40–56 px, dentro de `s.safe`.

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

## Biblia del look (tokens exactos del tema `chalk`)
- **Fondo**: pizarra verde `#233d31` con degradado radial (centro `#2a4a3b`, bordes
  `#1b3127`), manchas suaves de borrado y grano de tiza.
- **Colores**: tiza `#f2f0e6` · superficie `#2b4a3c` · atenuado `#a9b8ae` · acento
  **amarillo**. Paleta pastel luminosa: rojo `#f28b82`, naranja `#f7b267`, amarillo
  `#f6e27f`, verde `#a8e6a1`, teal `#84dcc6`, azul `#9fd3ef`, morado `#c7aef2`, rosa
  `#f6a8bf`, gris `#c9d1cb`.
- **Tipografía**: display **Cabin Sketch 700** (la fuente que parece hecha a mano con
  doble trazo) · cuerpo y mano **Patrick Hand 400**.
- **Trazo**: rugoso con textura chalk (roughness 1.35), ancho 5, radio 12, sin sombra.
- **Entradas**: formas e íconos se **dibujan** con tiza; texto y listas se **escriben**;
  imágenes fade.
- **Transición de escena**: `brush` (pasada de borrador). **Música**: `calm`. **SFX**:
  sonido de tiza en formas, flechas, íconos y anotaciones; pop en imágenes.
- **Código/terminal**: bloque `#1b3027` con sintaxis en tonos tiza (keyword amarillo
  `#f6e27f`, string verde `#a8e6a1`, fn azul `#9fd3ef`).

## Reglas de narración y encuadre (del propio motor)
- Tono de buena clase: una pregunta, pasos pequeños, un ejemplo concreto y un cierre.
- Algo nuevo cada 2–4 s: encierra, conecta, subraya — la pizarra debe vivir.
- Un concepto = un color de tiza y su sitio. Amarillo solo para LA idea.
- La cámara sigue la narración; dibuja la escena completa y deja que ella encuadre.

## Prohibido
- Trazos perfectos y limpios (sin temblor no parece tiza) ni paletas saturadas de neón.
- Poner la narración completa en pantalla (usa `"captions": true` si debe leerse).
- Más de una idea por escena o más de 5–6 elementos simultáneos.
- Inventar cifras o fórmulas: si no se puede verificar, fuera.

## Demo de galería y créditos
`referencia/anim.html` es la miniatura animada del look (canvas 1920×1080, contrato
`window.DUR/ready/draw`, determinista): círculo de tiza alrededor de la idea y flecha al
ejemplo. La genera `scripts/generar_anim_explicadores.mjs` con los tokens reales.

Look del motor **explainroo** de Vincent Schmalbach — MIT
(github.com/vincentsch/explainroo). Tokens de `engine/themes.js`. Ejemplos vivos:
explainroo.com/videos/ (DNS, área del círculo, nevera, años bisiestos en japonés).

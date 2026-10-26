---
name: video-estilo-explicador-clean
description: Genera un VIDEO EXPLICATIVO COMPLETO (narrado con voz, música y efectos) en LOOK CLEAN del motor explainroo — interfaz clara estilo SaaS: fondo gris azulado con puntos, tarjetas blancas con sombra suave que aparecen con pop/rise, tipografía Plus Jakarta Sans + Inter, acento azul. Úsalo SIEMPRE que el usuario pida "look clean", "estilo limpio explainroo", "explicativo de producto/negocio", "video corporativo claro narrado" o un explainer B2B de 45 a 120 s — aunque no mencione "clean".
---

# Look Clean (explainroo) — claridad de producto y negocio

## Qué es y cuándo usarlo
Video explicativo **completo y narrado** (45–120 s) con la estética de las buenas
interfaces SaaS: fondo gris azulado con patrón de puntos, tarjetas blancas de esquinas
amplias que aparecen con pop y sombra suave, chips de color y flechas que se dibujan.
Todo entra con rise/pop — nada se escribe a mano. Música upbeat y transición de
deslizamiento. Es el look de **producto y negocio**: pipelines, tickets, facturación,
onboarding. Produce MP4 + subtítulos + portada en cualquier formato de plataforma.

**Ideal para**: demos de producto, procesos de negocio (CRM, soporte, pagos), vídeos de
marketing B2B, explicaciones de finanzas cotidianas.

## Ejemplos de uso
- *"Un video en look clean de cómo funciona un pipeline de ventas en un CRM"* → etapas del
  deal como tarjetas que aparecen en fila, 1:19, 16:9 (ejemplo oficial).
- *"Explica con estilo limpio cómo se paga una factura online"* → enlace de pago → tarjeta
  → confirmación, 1:03, cuadrado 1:1.
- *"Look clean, tema baterías de celular, para Shorts"* → ciclos de carga como tarjetas con
  pop, 1:01, 9:16.

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
node bin/explainroo.js init videos/<nombre> --theme clean --title "Título" \
  --language es --size youtube     # sizes: youtube|shorts|tiktok|reels|vertical|instagram|linkedin|square
```
En `video.json` queda `"theme": "clean"`, `"language": "es"` (voz `ef_dora`). El español
necesita `espeak-ng` (Windows: instalador de su GitHub; macOS: `brew`; Linux: `apt`).
Añade `--pace 1.15` para videos algo más ágiles (típico en demos).

**3. Escribir la narración (`script.md`)** — la narración va primero y fija el timing:
```markdown
# Título del video

## intro {hold=1.5}
Primera frase que plantea la pregunta. [#marcador] Cada marcador nombra un momento animable.
```
Una idea por escena (1–3 frases, 4–15 s). Frases de 8–18 palabras. Sin cifras inventadas.

**4. Generar la voz y revisar:**
```bash
node bin/explainroo.js voice videos/<nombre>
```

**5. Escribir las escenas (`scenes.js`)** — una función por escena; cada tarjeta anclada a
la palabra: `s.box('Lead', { at: '#etapa1', color: 'blue' })`, `s.arrow('lead','deal')`.
Layouts base: número grande, comparación lado a lado, pasos en orden, hub con partes.
Títulos 80–110 px, etiquetas 40–56 px, dentro de `s.safe`.

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

## Biblia del look (tokens exactos del tema `clean`)
- **Fondo**: gris azulado `#f4f6fb` con degradado sutil y patrón de puntos (paso 48 px).
- **Colores**: tinta `#111827` · superficie `#ffffff` · atenuado `#667085` · acento **azul**.
  Paleta: rojo `#f04452`, naranja `#ff8a3d`, amarillo `#f5b829`, verde `#12b886`, teal
  `#0ea5a4`, azul `#3b6cf6`, morado `#7c5cff`, rosa `#ec4899`, gris `#98a2b3`.
- **Tipografía**: display **Plus Jakarta Sans 800** (tracking −0.025) · cuerpo **Inter 400**.
- **Trazo**: liso, ancho 3.5; radio de esquinas 22; sombra suave
  `rgba(16,24,40,0.12)` blur 30 y 12.
- **Entradas**: tarjetas, íconos e imágenes hacen **pop**; textos y listas **rise**;
  flechas y líneas se dibujan.
- **Transición de escena**: `slide` (deslizamiento). **Música**: `upbeat`. **SFX**: pop en
  formas, whoosh en flechas, blip en listas, tick en números, type en código.
- **Código/terminal**: bloque `#0f172a` estilo VS Code oscuro (keyword `#c084fc`, string
  `#86efac`, número `#fbbf24`, fn `#7dd3fc`).

## Reglas de narración y encuadre (del propio motor)
- Tono directo de negocio: frases cortas, sin jerga sin explicar, quién hace qué.
- Algo nuevo cada 2–4 s; cada frase dispara al menos un elemento (`at`).
- Un concepto = un color y un sitio. El azul es del elemento héroe; no lo repartas.
- La cámara sigue la narración; dibuja la escena completa y deja que ella encuadre.

## Prohibido
- Poner la narración completa en pantalla (usa `"captions": true` si debe leerse).
- Mezclar con trazos "a mano" o texturas de papel: la calidez aquí NO va con garabatos.
- Sombras duras, esquinas rectas, neón o glow (eso es midnight, no clean).
- Inventar métricas o testimonios.

## Demo de galería y créditos
`referencia/anim.html` es la miniatura animada del look (canvas 1920×1080, contrato
`window.DUR/ready/draw`, determinista): tarjetas que aparecen, chip de API y check verde.
La genera `scripts/generar_anim_explicadores.mjs` con los tokens reales.

Look del motor **explainroo** de Vincent Schmalbach — MIT
(github.com/vincentsch/explainroo). Tokens de `engine/themes.js`. Ejemplos vivos:
explainroo.com/videos/ (pipeline de ventas, factura online, ticket de soporte, interés
compuesto, baterías).

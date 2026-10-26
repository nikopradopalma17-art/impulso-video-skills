# explainroo para agentes de código

> **Réplica en español** del `AGENTS.md` de [vincentsch/explainroo](https://github.com/vincentsch/explainroo)
> (MIT). Si algo aquí no cuadra con el comportamiento del motor, manda el original en inglés.

Este archivo te dice a ti, el agente de código, cómo hacer un video con explainroo.
El usuario normalmente te da un tema, y a veces una duración o un estilo. Tú escribes
las palabras y las imágenes. explainroo hace el video.

explainroo convierte dos archivos en un video MP4 con narración. `script.md`
lleva lo que dice la voz. `scenes.js` dibuja lo que ve el espectador. Cada dibujo
puede aparecer sobre una palabra que dice la voz. Un modelo de voz (Kokoro) lee el
guion en esta computadora, o la narración viene de ElevenLabs o de tu propia
grabación. Whisper escucha la narración y anota cuándo se dice cada palabra.
Chrome dibuja los fotogramas en segundo plano. explainroo añade música y efectos
de sonido, y ffmpeg arma el MP4. No necesitas clave de API para las voces locales
ni para las grabaciones. ElevenLabs y las imágenes de IA sí necesitan claves.

La documentación completa para personas está en https://www.explainroo.com/docs/.

## Antes de empezar

Quizá el usuario pegó el prompt del README o de explainroo.com y todavía no estás
en una carpeta de explainroo. Entonces clona primero. Este catálogo ya incluye una
copia del motor en `02-explainers/vincentsch--explainroo`: úsala copiándola a tu
carpeta de trabajo, o clona el original. Si el usuario nombró otro lugar, úsalo.

```bash
git clone https://github.com/vincentsch/explainroo.git
cd explainroo
```

Ejecuta esto una vez en la carpeta de explainroo:

```bash
npm install
node bin/explainroo.js doctor --fetch
```

`doctor` revisa Node, ffmpeg y Chrome, y los programas extra que necesitan algunos
idiomas. También descarga los modelos de voz en inglés, unos 400 MB, solo la
primera vez. Otros idiomas descargan su modelo de revisión de habla al primer uso.
Si el usuario ejecutó `npm link`, puedes escribir `explainroo` en vez de
`node bin/explainroo.js` en los comandos de abajo. Los comandos que trabajan sobre
un video reciben primero la carpeta del proyecto, y todos aceptan `--json`.

### Cuándo preguntar al usuario

Decide tú lo normal: el look, la duración, la voz, el layout y las palabras.
Pregunta solo cuando no puedas avanzar sin una respuesta. Cuando preguntes, pon
todo lo que necesitas en un solo mensaje. Motivos típicos para preguntar:

- El tema no está claro, o necesitas un dato que no puedes verificar.
- El usuario quiere imágenes de IA y no hay clave de OpenRouter (ver Imágenes).
- El usuario quiere ElevenLabs y no hay clave de ElevenLabs (ver Voces).
- El usuario quiere algo que explainroo no puede hacer, como video filmado con
  cámara.

## Hacer un video, paso a paso

1. **Aprende el tema.** Lee el código, la documentación o las páginas que señale
   el usuario. Anota los datos que vas a usar. Nunca inventes cifras, citas ni
   afirmaciones. Si un número importa y no puedes verificarlo, déjalo fuera.

2. **Crea el proyecto.**

   ```bash
   node bin/explainroo.js init videos/<nombre> --theme paper --title "..."
   ```

   Los proyectos van en `videos/`. Git ignora esa carpeta. Elige el look que
   encaje con la audiencia: `paper` (amigable, dibujado a mano, el default),
   `clean` (producto y negocio), `chalk` (enseñanza), `blueprint` (ingeniería),
   `midnight` (herramientas de desarrollador) o `editorial` (ensayos, historia,
   dinero y otros temas reflexivos). Elige el tamaño según dónde va el video,
   por ejemplo `--size tiktok` o `--size linkedin`. Los tamaños están en
   «Tamaños para cada plataforma», más abajo. Añade `--pace 1.2` cuando el
   usuario quiera un video más rápido. Para narrar en español:
   `--language es`.

3. **Escribe `script.md`.** La narración va primero. Fija el timing de todo lo
   demás. Ver «Cómo escribir la narración» más abajo.

4. **Genera la voz.**

   ```bash
   node bin/explainroo.js voice videos/<nombre>
   ```

   El comando imprime cuánto dura cada escena y cuántas palabras confirmó la
   revisión de habla. Si una palabra no se confirma, la voz probablemente la dijo
   mal. Corrígela con `{shown|spoken}` en el guion y ejecuta el comando otra vez.
   Para una grabación, haz que script.md diga lo que realmente se dijo. Solo las
   escenas que cambiaste se vuelven a hacer. `check`, `still`, `sheet`, `render`
   y `preview` también generan la narración que falte, así que arráncalos
   después de que `voice` termine, no al mismo tiempo.

5. **Planifica las imágenes.** Para cada escena, decide qué hay en pantalla cuando
   se dice cada marcador o palabra importante. Decide dónde se sienta cada cosa y
   qué sale de pantalla. Mantén las cosas en el mismo sitio de escena a escena.
   Responde cuatro preguntas por escena. ¿Cuál es la única cosa que debe mirar el
   espectador? ¿Qué relación muestra el layout: un orden, una comparación, las
   partes de un todo o una causa? ¿Qué aparece y qué se va en cada señal? ¿Qué se
   queda en el mismo sitio en la escena siguiente? En «Layouts que funcionan»,
   más abajo, hay cuatro layouts para partir.

6. **Haz imágenes, si el video las necesita.** Los íconos y diagramas cubren la
   mayoría de los temas técnicos. Los temas cotidianos (cocina, autos, jardinería)
   funcionan mejor con imágenes. Ver «Imágenes» más abajo.

7. **Escribe `scenes.js`.** Una función por escena. Ancla cada imagen a la
   narración con `at: 'palabra'` o `at: '#marcador'`. La API de escenas está al
   final de este archivo.

8. **Revisa.**

   ```bash
   node bin/explainroo.js check videos/<nombre>
   ```

   Corrige todos los errores y todos los warnings. Los hints los decides tú.

9. **Mira los fotogramas.** No puedes ver el video, así que así es como lo ves.

   ```bash
   node bin/explainroo.js still videos/<nombre>                 # el final de cada escena
   node bin/explainroo.js still videos/<nombre> intro@2.5 12.0  # cualquier momento
   node bin/explainroo.js sheet videos/<nombre> --scene intro   # una escena en el tiempo
   node bin/explainroo.js sheet videos/<nombre>                 # el video entero
   ```

   Abre las imágenes y júzgalas como lo haría un espectador. ¿El texto es
   suficientemente grande? ¿Algo está cortado o encima de otra cosa? ¿Medio
   fotograma está vacío? ¿La hoja muestra algo nuevo cada pocos segundos? Arregla
   lo que esté mal y vuelve a mirar.

   Para Reddit y otros feeds, ejecuta también `check videos/<nombre>
   --view-width 854`. Avisa cuando el texto visible queda bajo 16 px en ese
   reproductor. Es una revisión de tamaño, no una garantía sobre la compresión de
   la plataforma. Muestra solo la consulta o el resultado actual, usa tipografía
   más grande y acércate a los detalles. Revisa también un still a
   `--scale 0.4448` (unos 480p para un video 1080p). Nunca subas `draft.mp4`.
   Tras subirlo, revisa también la copia de baja calidad de la plataforma además
   de la de tamaño completo.

10. **Haz el video y revisa el archivo.**

    ```bash
    node bin/explainroo.js render videos/<nombre> --draft   # versión rápida a media resolución
    node bin/explainroo.js render videos/<nombre>           # video final
    node bin/explainroo.js verify videos/<nombre>
    ```

    `render` también escribe archivos de subtítulos (`.srt` y `.vtt`) y una
    imagen de portada (`.cover.jpg`) junto al video. Cuando las escenas nombran
    capítulos, escribe `.chapters.txt` para la descripción de YouTube y añade los
    capítulos al MP4. `--format gif` produce un GIF sin sonido, para un README o
    una publicación. `verify` revisa el MP4: mide el volumen y busca fotogramas
    negros y silencios. También corre la revisión de habla sobre el sonido
    terminado para comprobar que la voz sigue clara sobre la música.

11. **Cuéntale al usuario** dónde están el video y sus subtítulos, capítulos y
    portada, cuánto dura, qué dijo `verify` y qué no pudiste comprobar.

## Cómo escribir la narración

Salvo que el usuario pida otro estilo, escribe como una persona que le explica
algo a un amigo en una mesa.

- Español (o el idioma que toque) llano y cotidiano, con palabras de todos los
  días. Si necesitas una palabra técnica, di qué significa la primera vez.
- Frases cortas, de 8 a 18 palabras, una idea por frase.
- Di quién hace qué: «El navegador le pregunta a un resolutor».
- Cada frase aporta un dato. Corta las medias frases que repiten.
- Sin rayas (—) entre frases: usa coma o punto aparte.
- Nada de eslóganes ni remates («Solo código.»), giros «no X, sino Y»,
  revelaciones con dos puntos, cadenas de tres frases cortas, metáforas y
  muletillas como «simplemente», «realmente», «de hecho» o «exactamente».
- No le digas al espectador que haga lo obvio («Veamos», «No te vayas»).
- Cierra con una frase sencilla que resuma la idea principal.

Duración y ritmo:

- Apunta a 45–120 segundos salvo indicación contraria. Un video terminado lleva
  unas 150 palabras por minuto, pausas incluidas. En japonés son unos 270
  caracteres por minuto; en chino, unos 200.
- Empieza por la pregunta o el problema. Explica en pasos pequeños. Da un
  ejemplo concreto y resume.
- Una idea por escena, normalmente 1 a 3 frases (4 a 15 segundos).
- Las listas leídas en voz alta («A, B, C y D») solo funcionan si cada elemento
  aparece en pantalla.

Sintaxis del guion:

```markdown
# Título del video

## id-escena {hold=1.5}
Narración de esta escena. [#marcador] Un marcador nombra un momento que puedes animar.
[pause 0.6] añade silencio. {SQL|sequel} muestra «SQL» en los subtítulos pero dice «sequel».
> Las líneas que empiezan con > son notas para ti y no se dicen.
```

- `## id-escena` abre una escena. El id debe coincidir con una función de `scenes.js`.
- Pon un `[#marcador]` donde deba cambiar una imagen. Cada frase debería
  disparar al menos una imagen.
- Usa `{shown|spoken}` para todo lo que la voz pueda leer mal: siglas
  (`{CLI|C E I}`), versiones (`{v2.1|versión dos punto uno}`), símbolos y
  dominios (`{example.com|ejemplo punto com}`, si no la voz dice «ejemplo com»).
- Una escena admite estos ajustes entre llaves tras su id: `hold` (segundos
  tras la voz, por defecto 0,7), `min` (lo mínimo que puede durar la escena, en
  segundos), `lead` (segundos antes de la voz, por defecto 0,35) y
  `transition` (`fade`, `slide`, `wipe`, `zoom`, `brush`, `cut`).
- Una escena sin narración dura `min` segundos (3 por defecto).
- `chapter="Cómo lo encuentra el resolutor"` entre las llaves de una escena abre
  un capítulo ahí. Dura hasta el próximo capítulo. Los títulos van de 1 a 60
  caracteres. Si la primera escena no nombra capítulo, el primero es el título
  del video. YouTube muestra capítulos solo cuando hay al menos 3 y cada uno
  dura 10 segundos o más.

## Qué hace buenas a las imágenes

- **Muéstralo cuando se dice.** Una imagen aparece cuando la voz la menciona.
  Usa señales de palabra.
- **Algo cambia cada 2 a 4 segundos.** Un elemento nuevo, una flecha o un
  resaltado. La cámara aporta sus propios movimientos. `check` señala tramos
  largos sin nada nuevo.
- **Texto corto en pantalla.** Etiquetas, números y frases clave de pocas
  palabras. La narración completa nunca va en pantalla. Cuando la narración deba
  poder leerse, activa los subtítulos (`"captions": true`). Y entonces no
  muestres también como texto la frase que la voz está diciendo.
- **Pocas cosas a la vez.** Cinco o seis elementos como máximo. Quita cosas con
  `out` antes de la próxima idea.
- **Grande y legible.** Títulos de 80 a 110 px, etiquetas de 40 a 56 px, texto
  pequeño de al menos 32 px en un lienzo de 1920 × 1080. Quédate dentro de
  `s.safe`.
- **Mismo significado, mismo color.** Dale a cada cosa un color y un sitio, y
  consérvalos. Usa el color de acento para lo único que más importa.
- **Ejemplos reales.** Un comando que se puede ejecutar, un número con su fuente
  o una captura de la pantalla real valen más que tres cajas con palabras
  genéricas.
- **Un último fotograma claro** que muestre la idea principal.

### Layouts que funcionan

Estos cuatro layouts cubren muchas escenas: un número grande, una comparación,
pasos en orden y una cosa principal con sus partes. Parte del que encaje y
cambia palabras, colores y señales. Cada uno funciona también en marcos
verticales y cuadrados.

```js
export default {
  // Un número grande con un pie corto debajo.
  number(s) {
    const u = Math.max(s.W, s.H) / 100;
    // El número también tiene que caber en un marco vertical angosto.
    const n = s.number(1000000, { y: s.cy - u * 2, size: Math.min(u * 10, s.safe.w / 6), at: '#number' });
    s.text('requests a day', { y: n.bottom + u * 3, size: u * 3.6, color: 'muted', at: '#caption' });
  },

  // Dos cosas lado a lado, o apiladas en un marco vertical.
  compare(s) {
    const u = Math.max(s.W, s.H) / 100;
    const cells = s.grid(s.portrait ? 1 : 2, s.portrait ? 2 : 1, { gap: u * 4 });
    const sides = [
      { title: 'Callbacks', note: 'one function inside another', color: 'orange', at: '#left' },
      { title: 'async / await', note: 'reads from top to bottom', color: 'green', at: '#right' },
    ];
    sides.forEach(({ title, note, color, at }, i) => {
      const c = cells[i];
      // La nota cuelga de la tarjeta, así que una nota que envuelve crece hacia abajo.
      const card = s.box(title, { x: c.x, y: c.y - u * 3, w: c.w * 0.8, size: u * 4, color, at });
      s.text(note, { x: c.x, y: card.bottom + u * 1.2, valign: 'top', size: u * 2.6, color: 'muted', maxWidth: c.w * 0.85, at });
    });
  },

  // Pasos en orden, de izquierda a derecha, o de arriba abajo en vertical.
  steps(s) {
    const u = Math.max(s.W, s.H) / 100;
    const labels = ['Browser', 'Resolver', 'Address'];
    const xs = s.portrait ? labels.map(() => s.cx) : s.row(labels.length, { width: s.safe.w * 0.72 });
    const ys = s.portrait ? s.col(labels.length) : labels.map(() => s.cy);
    labels.forEach((label, i) => {
      const at = i ? `#step${i + 1}` : 0.3;
      s.box(label, { id: `step${i}`, x: xs[i], y: ys[i], size: u * 3.6, at });
      if (i) s.arrow(`step${i - 1}`, `step${i}`, { at });
    });
  },

  // Una cosa principal con sus partes alrededor. En vertical no hay sitio a los
  // lados, así que las partes van en fila debajo.
  hub(s) {
    const u = Math.max(s.W, s.H) / 100;
    const parts = ['Email', 'Calendar', 'Files'];
    const hubY = s.portrait ? s.cy - s.safe.h * 0.18 : s.cy;
    const spots = s.portrait
      ? s.row(parts.length, { width: s.safe.w * 0.72 }).map((x) => ({ x, y: s.cy + s.safe.h * 0.16 }))
      : [-90, 30, 150].map((d) => ({ x: s.cx + Math.cos((d * Math.PI) / 180) * s.safe.w * 0.34, y: s.cy + Math.sin((d * Math.PI) / 180) * s.safe.h * 0.3 }));
    s.box('Login server', { id: 'hub', x: s.cx, y: hubY, size: u * 4, color: 'accent', at: '#hub' });
    parts.forEach((label, i) => {
      const at = `#spoke${i + 1}`;
      s.box(label, { id: `part${i}`, ...spots[i], size: u * (s.portrait ? 2.4 : 3.2), at });
      s.arrow('hub', `part${i}`, { at });
    });
  },
};
```

Los tamaños de texto salen del lado largo del marco, así que se ven parecidos en
marcos anchos y verticales. Un número grande también tiene que caber en un marco
angosto.

### La cámara

explainroo filma cada escena con una cámara que sigue la narración. Abre con la
imagen. Cuando una escena empieza pequeña, la cámara arranca cerca y se abre
según las cosas nuevas necesitan espacio. Algo nuevo que ya cabe en el plano no
exige movimiento. De vez en cuando la cámara se acerca a lo que la voz comenta
—por ejemplo una tarjeta nueva y la que se relaciona con ella— cuando el
espectador tiene tiempo de mirar. Luego sigue las cosas nuevas a esa distancia.
Cerca del final de la escena se aleja, para que el último fotograma muestre la
idea completa. Durante la escena también empuja muy despacio.

Mientras un plano se mantiene, cada tarjeta y etiqueta está entera dentro del
plano o fuera de él. Las flechas y líneas pueden salirse del borde, pero sus
etiquetas quedan enteras, y también las de los gráficos. Mientras la cámara
pasa de un plano al siguiente, las cosas pueden cruzar el borde un momento.
Los planos se mantienen lejos de los subtítulos y de las zonas que la app tapa
en Shorts, TikTok y Reels.

Dibuja cada escena como una sola imagen en el marco completo, tal como debe
verse al final, y deja que la cámara encuentre los acercamientos:

- Pon el próximo elemento cerca del que sigue, para que un plano muestre ambos.
- Una escena que empieza con una cosa y crece es la que más movimientos de
  cámara recibe: la cámara arranca cerca y se abre con la imagen.
- Mantén una caja con su etiqueta, o un ícono con su pie, como una sola unidad.
  Las cosas lejos una de otra reciben planos propios.
- Líneas, flechas y cosas añadidas dentro de un elemento ya en pantalla, como
  una línea de un gráfico, no reciben acercamiento propio. Tampoco un ícono sin
  etiqueta ni una caja sin palabras, porque de cerca no muestran nada nuevo.
  Dale una etiqueta, o usa `s.focus` cuando algo deba recibir un primer plano.
- Cuando una escena sigue con la misma imagen, dibuja los elementos arrastrados
  con `at: -1` en los mismos sitios. La cámara continúa donde se detuvo y las
  dos escenas se funden entre sí.

La cámara mide cada elemento, incluido lo que dibuja `s.draw`, y sigue los
tiempos de `at` y `out`. Mide cada elemento donde está al final de la escena.
Cuando algo viaja por el marco durante una escena, deja la cámara de esa escena
quieta con `s.camera([])`. Todo lo dibujado directo sobre `s.ctx` cuenta como
un bloque presente toda la escena, así que la cámara lo mantiene entero y no
puede filmarlo por separado. Usa `s.draw` para un dibujo que aparece con una
señal. Las líneas de código resaltadas y los comandos de terminal reciben
acercamiento propio cuando quedan pequeños en el plano. `s.focus` apunta la
cámara a cualquier parte de la imagen.

`s.camera([...])` en una escena toma el control de su cámara, y `s.camera([])`
deja la escena quieta. `"camera": "still"` en `video.json` apaga la cámara para
todo el video. `check` revisa el layout tal como lo escribiste, sin cámara.
Los stills, sheets y renders muestran la cámara.

El render final añade desenfoque de movimiento a los fotogramas donde algo se
mueve, como una cámara de cine. Los drafts lo omiten. `"motionBlur": false` lo
apaga.

## Voces

Kokoro corre en esta computadora y no necesita clave. Elige una voz con
`explainroo voices`. Un string en `video.json` sigue usando Kokoro:

```json
"voice": "af_heart"
```

`{ "provider": "kokoro", "id": "af_heart" }` significa lo mismo.

ElevenLabs ofrece voces premium y clonadas. Cuesta dinero en la cuenta del
usuario y recibe el texto del guion. Si el usuario lo quiere y no hay clave,
pídele una clave de API de elevenlabs.io. Deja `ELEVENLABS_API_KEY` en el
entorno, o guarda `ELEVENLABS_API_KEY=...` en un `.env` en la carpeta del
proyecto o de explainroo. El entorno manda, luego el archivo del proyecto.
Nunca imprimas la clave ni la pongas en un guion, un commit o un log. Mantén
`.env` fuera de git.

```bash
node bin/explainroo.js voices videos/<nombre> --elevenlabs
node bin/explainroo.js voices videos/<nombre> --elevenlabs --json
```

La lista muestra los nombres, ids y etiquetas disponibles para esa clave. Usa
un id en `video.json`:

```json
"voice": { "provider": "elevenlabs", "id": "JBFqnCBsd6RMkjVDRZzb", "model": "eleven_multilingual_v2" }
```

`model` es opcional y por defecto es `eleven_multilingual_v2`. El comando de
voces informa los caracteres usados. Cada petición queda en
`build/voice/elevenlabs-usage.jsonl`, sin la clave ni el texto del guion.
ElevenLabs usa `speed` por `pace`, con límite de 0,7 a 1,2. El comando de voz
avisa cuando aplica ese límite.

También puedes grabar la narración tú mismo. Usa una habitación silenciosa y
lee script.md tal como está. Pon una sola toma de todo el video en `assets/`:

```json
"voice": { "provider": "recording", "src": "assets/narration.m4a" }
```

O un archivo por escena en una carpeta:

```json
"voice": { "provider": "recording", "src": "assets/narration/" }
```

Cada escena con narración necesita `<id-escena>.<ext>`, por ejemplo `intro.wav`.
Formatos: wav, mp3, m4a, aac, flac, ogg y opus. Los archivos deben quedar
dentro de `assets/`, sin `..` en la ruta.

Una sola toma se corta en escenas con las palabras de script.md. Cada corte
conserva unos 0,15 segundos alrededor del habla. Las pausas dentro de una
escena quedan como se grabaron. Los `lead` y `hold` de la escena añaden los
huecos entre escenas. Las grabaciones pasan a mono y su volumen se acerca al
de Kokoro. Conservan hasta 48 kHz de frecuencia de muestreo. Cambiar `pace` o
un `speed` explícito cambia su tempo sin cambiar el tono.

`[pause]`, `sentenceGap` y `paragraphGap` no añaden silencio a las grabaciones.
Los marcadores `[#name]`, los subtítulos, las señales y `{shown|spoken}`
siguen funcionando. Si la revisión de habla reporta diferencia, haz que
script.md diga lo que realmente se dijo. Reemplazar la grabación de una escena
rehace esa escena. Reemplazar la toma completa rehace todas sus escenas.

La narración de ElevenLabs y las grabaciones funcionan en todos los idiomas.
Ejecuta `voice`, `check` y `render` igual con cualquiera de las tres fuentes.

## Videos en otros idiomas

Pon `language` en `video.json`: `en`, `es`, `fr`, `it`, `pt-br`, `hi`, `ja` o
`zh`. El inglés es el default. `pt-br` es portugués de Brasil y `zh` chino
mandarín. También puedes empezar con
`explainroo init videos/mi-video --language es`.

Si omites `voice`, el idioma elige su voz de Kokoro:

| Idioma | Voz por defecto |
|---|---|
| Inglés (`en`) | `af_heart` |
| Español (`es`) | `ef_dora` |
| Francés (`fr`) | `ff_siwis` |
| Italiano (`it`) | `if_sara` |
| Portugués de Brasil (`pt-br`) | `pf_dora` |
| Hindi (`hi`) | `hf_alpha` |
| Japonés (`ja`) | `jf_alpha` |
| Chino mandarín (`zh`) | `zf_xiaobei` |

Ejecuta `explainroo voices --language es` para ver las voces de un idioma. Una
voz de Kokoro debe coincidir con el idioma del video. Si el proyecto ya tiene
`voice` configurada, cámbiala también, o quítala para usar la del idioma.

Escribe la narración en ese idioma como la diría una persona. No traduzcas del
inglés palabra por palabra. Las reglas de escritura de arriba aplican en
espíritu. Las señales de palabra y los `[#marcadores]` funcionan igual:
`at: 'qué'` coincide con «Qué». Las frases en hindi pueden terminar en `।`.
Los subtítulos conservan el texto escrito. Los looks incluyen fuente para
hindi, así que no hace falta ninguna fuente del sistema.

Español, francés, italiano, portugués e hindi necesitan el programa espeak-ng.
En Linux: `sudo apt install espeak-ng`; en macOS: `brew install espeak-ng`.
En Windows usa el instalador de la
[página de releases de espeak-ng](https://github.com/espeak-ng/espeak-ng/releases).
Si el programa está en otro sitio, apunta `EXPLAINROO_ESPEAK` a su binario.
Inglés, japonés, chino, ElevenLabs y grabaciones no lo necesitan.

### Japonés y chino

Japonés y chino necesitan Python 3 con misaki, la biblioteca de pronunciación
con la que se entrenaron las voces de Kokoro. Instala lo que pida el idioma:

```bash
python3 -m pip install "misaki[ja]"   # japonés
python3 -m unidic download            # diccionario de japonés, unos 526 MB
python3 -m pip install "misaki[zh]"   # chino
```

En Windows escribe `python` en vez de `python3`. Si misaki está en un entorno
virtual, pon en `EXPLAINROO_PYTHON` el Python de ese entorno. ElevenLabs y las
grabaciones no necesitan nada de esto.

Escribe la narración como siempre, sin espacios entre palabras. explainroo
encuentra las palabras solo, así que las señales y los marcadores funcionan:
`at: '解析'` coincide con la palabra 解析, y una frase como
`at: '名前の解析'` también. Una señal debe coincidir con palabras completas.
Pon un `[#marcador]` donde necesites un momento dentro de una palabra. Las
frases terminan en `。`, `！` o `？`.

Las palabras latinas como API o JavaScript se leen en inglés. Para lectura
japonesa, escríbela: `{API|エーピーアイ}`. Los números pueden quedar en
dígitos, incluidos decimales como 365.2422. El lector japonés a veces elige la
lectura equivocada: ついたち para 一日 (escribe `1日` para いちにち) o こよみ
para 暦 en グレゴリオ暦 (escribe `{グレゴリオ暦|グレゴリオれき}`). Cuando la
revisión de habla marque una palabra, compara lo que oyó con el guion antes de
cambiar nada.

Whisper suele escribir una palabra con otros caracteres que suenan igual, así
que la revisión de habla compara sonidos. El japonés se compara por su lectura
en kana: 世紀 oído como 正規 cuenta igual. El chino se compara por pinyin sin
tonos, y los caracteres tradicionales y simplificados cuentan como el mismo.
No reformules una frase solo porque Whisper eligió otros caracteres. Los
subtítulos unen palabras sin espacios, con hasta 18 caracteres por línea, y
nunca cortan dentro de una palabra. Mantén corto el texto visible de un
override.

Las fuentes de los looks no tienen caracteres japoneses ni chinos. El primer
`voice`, `still` o `render` descarga Noto Sans JP o Noto Sans SC, regular y
bold, unos 33 MB, y revisa los archivos. Quedan en `~/.cache/explainroo/fonts/`
(o `$EXPLAINROO_CACHE/fonts/`) y se usan en todos los looks, en los subtítulos
y en las pantallas de apps. Tras esa primera descarga, `EXPLAINROO_OFFLINE=1`
funciona. Un reproductor web hecho con `export` conserva solo los caracteres
que el video muestra, así que sus fuentes quedan pequeñas.

La primera revisión de habla en otro idioma descarga Whisper multilingual
small. `doctor --fetch` sigue trayendo solo los modelos de inglés. `verify`
usa el idioma del video para revisar también el sonido terminado.

Si un símbolo, abreviatura o palabra suena mal, usa `{shown|spoken}` en
`script.md` y vuelve a ejecutar `voice`. Pon la pronunciación en el mismo
idioma. La revisión de habla acepta dígitos para números. Fuera del inglés no
intenta emparejar números escritos con letras contra dígitos: escribe los
dígitos, o usa un override cuyo texto hablado tenga dígitos cuando eso ayude.

En hindi la revisión de habla confirma menos palabras que en los otros
idiomas, porque el modelo de habla conoce menos el hindi. Unas pocas palabras
sin confirmar son normales ahí. Corrige una palabra cuando queda sin confirmar
en varias escenas, o cuando el usuario la oye mal.

## Imágenes

explainroo puede hacer ilustraciones con modelos de imágenes de IA vía
OpenRouter. Es opcional. Cuesta dinero en la cuenta OpenRouter del usuario,
más o menos entre 7 y 13 centavos por imagen al momento de escribir esto.

Si el usuario quiere imágenes y no hay clave, pídele una clave de API de
OpenRouter (en openrouter.ai/keys). Guárdala en un `.env` en la carpeta de
explainroo como `OPENROUTER_API_KEY=...`, o déjala en el entorno. Git ignora
`.env`. Nunca imprimas la clave ni la pongas en un guion, un commit o un log.

```bash
node bin/explainroo.js image videos/<nombre> cables "Two cars parked nose to nose with their hoods open, jumper cables between the batteries"
node bin/explainroo.js images videos/<nombre>    # qué se hizo y cuánto costó
```

Esto guarda `assets/cables.png`. Úsala en una escena con
`s.image('assets/cables.png', { w: 1100, frame: 'card', at: 'cables' })`.

- `--model best` (default) usa OpenAI GPT Image 2. Hace lo que pides y vale el
  precio para la mayoría de las imágenes.
- `--model cheap` usa Google Gemini 3.1 Flash Image. Cuesta como la mitad,
  pero a menudo ignora partes del prompt.
- `--aspect` fija la forma: `16:9` (default para videos horizontales), `9:16`,
  `1:1`, `4:3`, `3:2` y sus formas verticales.
- `--ref assets/a.png` envía una imagen anterior, para que una persona u objeto
  conserve el mismo aspecto. Separa varios archivos con comas.
- Cada imagen recibe un estilo por defecto (plano, colores suaves, sin texto).
  Define el tuyo en `video.json` con
  `"images": { "style": "...", "model": "best" }`, o apaga el estilo con
  `--no-style`.

**Abre siempre cada imagen y revísala.** Los modelos de imagen se equivocan en
detalles: dedos de más, cables en el borne equivocado, texto que parece
escritura pero no lo es. Si algo está mal, cambia el prompt y rehaz la imagen.
Mantén el texto fuera de las imágenes: las palabras en pantalla van con
`s.text`. Usa imágenes para lo que los íconos no pueden mostrar, y conserva un
solo estilo en todo el video.

## Demos de producto

Una demo de producto es el tipo de video que hacen las empresas de software
para mostrar su app. Reconstruyes las pantallas de la app con `s.ui`, que
tiene tarjetas, campos, botones, desplegables, interruptores y etiquetas de
estado con los colores y fuentes de la app. Un puntero de mouse hace clic por
las pantallas y escribe en los campos, y la cámara se acerca a lo que la voz
comenta. `examples/unspar-demo` es una completa.

**Captura primero el sitio en vivo.**

```bash
node bin/explainroo.js capture videos/<nombre> https://example.com --mobile
```

`capture` abre la página en un navegador limpio, sin cookies ni sesiones, y
guarda lo que una demo necesita en `assets/capture/<hostname>/`:

- `page.png` (la primera pantalla) y `full.png` (toda la página, hasta 8000
  píxeles de alto), al doble de densidad, para que se mantengan nítidas cuando
  la cámara se acerca. `--mobile` añade `mobile.png` y `mobile-full.png`.
- `capture.json` con los colores, fuentes, logos candidatos y los textos de la
  página: encabezados, navegación, botones y etiquetas de formularios. Copia
  los textos exactamente. El sitio en vivo es la fuente de verdad de afirmaciones
  y textos.
- Hasta tres archivos de logo, y los archivos de fuente que vienen de Google
  Fonts, en los pesos que usa la página.

Imprime un bloque `brand` y `fonts` para pegar en `video.json`. Contrástalo con
las capturas. Las fuentes integradas en explainroo no necesitan archivos. Para
otras fuentes, consigue los archivos, revisa la licencia y copia su archivo de
licencia al lado. Los banners de cookies y los chats pueden aparecer en las
capturas, como a cualquier visitante: usa una captura, o parte de una, sin
ellos. Capturar el mismo sitio otra vez reemplaza su carpeta.

También puedes mostrar una grabación real de pantalla con `s.clip` en un marco
`browser`. Usa `s.camera` para acercarte al detalle que la voz menciona.

**Mantén la verdad.** Una demo es publicidad, así que todo lo que muestre debe
ser correcto.

- Toma los textos de la propia app: sus plantillas y archivos de idioma (por
  ejemplo `lang/en/*.php`, `locales/` o los componentes). Copia etiquetas,
  botones y nombres de estado exactamente.
- Muestra solo funciones que existen y que los clientes pueden usar. Fuera las
  pantallas de admin, las vistas de debug y los planes sin construir.
- Los datos de ejemplo deben parecer datos de ejemplo: `example.com`, un
  proyecto inventado, un titular inventado. Nunca inventes clientes, números
  ni resultados.
- Las afirmaciones de la narración salen del sitio web en vivo del producto.
  Muestra precios solo si el sitio los muestra.
- Pregunta al usuario si el sitio y la app dicen cosas distintas.

**Configura la marca** en `video.json`. Usa el look `clean`.

```json
{
  "theme": "clean",
  "brand": {
    "accent": "#245cff",
    "background": "#f8f6f1",
    "font": "Figtree",
    "headline": "Instrument Serif",
    "logo": "assets/logo.svg"
  },
  "fonts": [
    { "family": "Figtree", "src": "assets/fonts/Figtree-600.woff2", "weight": 600 }
  ]
}
```

- `accent` es el color del botón principal. Búscalo en el Tailwind o el CSS de
  la app. `background` es el color detrás de las pantallas; `ink`, el del texto
  dibujado directo sobre él.
- `font` es la fuente de la app. Inter viene integrada; otras fuentes van en
  `assets/fonts/` y en `fonts` (`.woff2`, `.woff`, `.ttf` u `.otf`, una entrada
  por peso, o `"weight": "100 900"` para una variable, y `"style": "italic"`).
  Copia la licencia de la fuente al lado.
- `headline` es la fuente de los titulares grandes. Instrument Serif viene
  integrada. Si la marca no tiene serif, usa su propia fuente y pasa
  `{ weight: 700, italic: false }` a `u.headline()`.
- `logo` es el logo del producto, de la app o del sitio, mejor en SVG.

**Construye una escena** en este orden: fondo, cámara, titular, pantallas, y
el cursor al final para que quede encima.

```js
hook(s) {
  const u = s.ui;
  u.backdrop();
  u.floaters();
  s.camera([{ at: '#site', x: 900, y: 600, zoom: 1.3 }]);
  u.headline('Tell it what to *write about*', s.W / 2, 178, { size: 84, at: 0.15 });
  u.panel(410, 270, 1100, 600, { at: 0.3 }, (x, y, w, h) => {
    u.input(x + 56, y + 296, 560, 62, { label: 'Website URL', value: u.typed('https://example.com', '#site', 24), focus: 1, caret: true });
    u.button('Get ideas', x + 760, y + 516, 280, 60, { press: u.press('#go') });
  });
  u.cursor([
    { at: 0.5, x: 1500, y: 900 },
    { at: s.time('#site') - 0.7, x: 740, y: 596 },
    { at: '#site', click: true },
  ]);
}
```

Dibuja el titular después de `s.camera()`, o las pantallas con zoom se le
deslizan por debajo. Cuando la cámara se acerca, o mantén el titular entero a
la vista (zoom hasta ~1,1) o acércate lo bastante para que salga del cuadro
(~1,3 o más). Entre medias queda cortado a la mitad.

Marca cada clic con un `[#marcador]` del guion, para que pase cuando la voz lo
dice. Un movimiento del cursor empieza en su `at` y llega `dur` segundos
después (0,7 por defecto): empieza el movimiento un poco más de `dur` antes
del clic. Los primeros 0,7 segundos de una escena quedan cubiertos por la
transición de la escena anterior: no pongas clics ahí.

La marca de agua va abajo a la derecha. Cuando la cámara acerca, puede tapar
lo que haya ahí: mantén el texto importante lejos de esa esquina.

Usa el nombre del producto como texto plano en el primer fotograma. El primer
fotograma es también la portada del video.

**Referencia de `s.ui`.** Las posiciones van en el marco (1920 de ancho para
16:9). Los tiempos aceptan segundos, palabras dichas o `"#marcadores"`, como
en todo lo demás.

| Llamada | Qué dibuja |
|---|---|
| `u.backdrop(color?)`, `u.floaters({ alpha, tint })` | el fondo de la marca, y tarjetas tenues flotando por los bordes (`tint: 'white'` sobre fondo de color) |
| `u.panel(x, y, w, h, { at, out, from, rise, sfx, fill, border, lift }, fn)` | una tarjeta que entra con pop en `at`; `fn(x, y, w, h)` dibuja dentro |
| `u.card(x, y, w, h, o)` | una tarjeta sin entrada |
| `u.browser(x, y, w, h, { url, at }, fn)` | un panel con barra de navegador; `fn` recibe el área de página |
| `u.modal(x, y, w, h, { at, out }, fn)`, `u.over(fn)` | un diálogo sobre el marco atenuado, y una capa para tus propios menús o popups; `check` no reporta como solapado el texto de una capa contra el de otra |
| `u.toast(text, { at, out, icon, tone })` | un mensaje que sube, con campanita |
| `u.headline(text, x, y, { size, at, out, align, weight, italic, color, accent, tracking })` | texto grande que entra desenfocándose palabra por palabra; `*estrellas*` marcan palabras en el color `accent` |
| `u.text(text, x, y, { size, weight, color, align, base, font, italic, tracking, alpha, maxW, check })`, `u.para(text, x, y, maxW, o)`, `u.eyebrow(text, x, y)` | texto, texto con envoltura (`\n` abre línea) y una etiqueta pequeña en mayúsculas; `font` es `'ui'`, `'headline'` o una familia; `check: false` oculta el texto de `check`; `u.measure(text, size, weight)` da el ancho |
| `u.button(label, x, y, w, h, { variant, press, icon, loading, color, caps })` | `primary`, `secondary` o `ghost` |
| `u.input(x, y, w, h, { label, value, placeholder, focus, caret, icon })`, `u.textarea(x, y, w, h, o)` | un campo de texto, y uno más alto con envoltura |
| `u.select(x, y, w, h, { label, value, open, options, hover, selected })` | un desplegable; devuelve la y de cada fila de opción |
| `u.toggle(x, y, on)`, `u.checkbox(x, y, on)`, `u.radio(x, y, on)` | `on` va de 0 a 1, así puede animarse |
| `u.chip(label, x, y, { selected })`, `u.chipWidth(label, o, selected)` | chips de opción; un chip seleccionado crece por su check, deja sitio |
| `u.pill(label, x, y, tone, { align, dot, pulse })` | una insignia de estado: `gray`, `blue`, `yellow`, `green`, `red`, `purple` o `accent` |
| `u.spinner(x, y, r)`, `u.progress(x, y, w, p)`, `u.avatar(x, y, r, initials, { image })`, `u.icon(name, x, y, size, color)`, `u.lines(x, y, w, n)`, `u.logo(x, y, w)` | piezas pequeñas; `lines` dibuja barras grises en vez de texto corrido |
| `u.pop(at, cx, cy, fn, { sfx })` | hace entrar con pop lo que sea, alrededor de un punto |
| `u.wipe(at, { color })` | el color de acento se extiende hasta llenar el marco |
| `u.cursor(keys, { out })` | el mouse; una clave `{ at, x, y, dur, arc }` lo mueve (`arc` curva el trayecto, 0 es recto), `{ at, click: true }` hace clic con sonido |
| `u.press(at)`, `u.typed(text, at, cps, { gain, sfx })`, `u.stream(text, at, wps)`, `u.count(to, at, dur)` | una pulsación de botón (0 a 1 y de vuelta), texto tecleado hasta ahora con sonidos de tipeo, texto que aparece palabra por palabra como respuesta de IA, un número que cuenta hacia arriba |
| `u.colors` | `accent`, `accentDark`, `accentTint`, `background`, `ink`, `text`, `soft`, `muted`, `faint`, `line`, `field`, `surface`, `panel`; `brand.colors` en `video.json` reemplaza los grises, por ejemplo `{ "text": "#141413", "line": "#e8e6dc" }` para una marca cálida |

`check` también ve el texto de `s.ui`. Reporta texto que se sale del marco
(no mientras la cámara acerca), texto demasiado pequeño y texto superpuesto.
Un desplegable o diálogo puede tapar lo de debajo. Mira stills en los momentos
de zoom y comprueba que el cursor no tape la palabra que señala.

Los paneles y titulares de `s.ui` no suenan salvo que pases `sfx`. `check` no
ve los recortes (clipping): el texto que ocultes recortando sigue contando,
así que no dibujes texto que no deba verse. Prueba primero el nombre del
producto con su ortografía normal; recurre a otra escritura solo cuando la
revisión de habla lo oiga mal.

Muchos sonidos bajo la voz la hacen difícil de seguir, y `verify` entonces
entiende menos. Mantén silenciosos los tipeos largos
(`u.typed(text, at, cps, { gain: 0.25 })`) y da a cada momento un sonido, no
tres.

Un filtro de desenfoque en cada fotograma hace el render lento. El kit
desenfoca una vez y reutiliza. Haz lo mismo si añades tus propios desenfoques.

## Tamaños para cada plataforma

Pon en `size` el lugar a donde va el video. `explainroo formats` lista los
tamaños.

| Tamaño | Píxeles | Para |
|---|---|---|
| `youtube` (o `16:9`) | 1920 × 1080 | YouTube y otros reproductores anchos |
| `shorts` | 1080 × 1920 | YouTube Shorts |
| `tiktok` | 1080 × 1920 | TikTok |
| `reels` | 1080 × 1920 | Reels de Instagram y Facebook |
| `vertical` | 1080 × 1920 | un solo archivo para Shorts, TikTok y Reels |
| `instagram` | 1080 × 1350 | publicaciones del feed de Instagram y Facebook |
| `linkedin` | 1080 × 1350 | el feed de LinkedIn |
| `square` (o `1:1`) | 1080 × 1080 | publicaciones cuadradas en X, LinkedIn y Facebook |

`9:16`, `4:5` y `ANCHORxALTO` también funcionan.

YouTube y LinkedIn aceptan el archivo `.srt` como subtítulos al subir el video.

Shorts, TikTok y Reels ponen sus propios botones, el nombre de la cuenta y el
texto de la publicación encima del video. Con `shorts`, `tiktok`, `reels` y
`vertical`, explainroo mantiene tu contenido lejos de esas zonas. `s.safe` es
la parte que la app deja libre, y `s.cx` y `s.cy` son su centro. Los subtítulos
se sientan justo encima de la banda inferior de la app, y la marca de agua se
mueve a la esquina superior derecha. `check` avisa de cualquier texto fuera de
esa área. Un `9:16` plano no tiene esos márgenes: úsalo solo cuando el video no
va a esas apps.

El video vertical tiene poco espacio. Apila en vez de poner lado a lado, usa
menos palabras en pantalla y coloca todo desde `s.safe`. `explainroo formats`
imprime el área de contenido de cada tamaño en píxeles, por ejemplo 745 × 746
en TikTok.

### Dónde van los subtítulos

Los subtítulos vienen encendidos por defecto en los videos verticales, 4:5 y
cuadrados. En Shorts, TikTok y Reels se sientan justo encima de la banda
inferior de la app. En 4:5, cuadrado y ancho van abajo, sobre la marca de
agua. En un video `9:16` plano van a un cuarto de altura. En todos los casos
`s.safe` termina por encima de ellos. Todo lo que pongas dentro de `s.safe`
queda libre de ellos, y `check` avisa del texto en la banda de subtítulos. No
pong as en pantalla la misma frase que los subtítulos están mostrando.

El primer fotograma suele ser la imagen de portada en las apps sociales.
Cuando los primeros elementos se dibujan solos, el fotograma uno queda vacío.
Dale al título `enter: 'none'` para que esté desde el primer fotograma, o
elige otro fotograma de portada en la app.

## Un proyecto, varios tamaños

Usa `--size <tamaño>` en `preview`, `still`, `sheet`, `check` y `render` para
usar otro tamaño en una sola pasada. No toca `video.json`. La narración y los
tiempos de palabra se comparten entre tamaños. Los subtítulos en `"auto"`
siguen el tamaño que elijas.

Coloca las cosas desde `s.safe`, `s.cx`, `s.cy`, `s.row`, `s.col` y `s.grid`
en vez de posiciones fijas de píxel. Usa `s.portrait` para apilar en marcos
verticales. Mantén los tamaños de texto relativos al marco, por ejemplo
`s.W * 0.05`. `examples/merge-vs-rebase` funciona en `9:16` y en `youtube`; su
scenes.js muestra una forma de hacerlo.

```js
intro(s) {
  const cells = s.grid(s.portrait ? 1 : 2, s.portrait ? 2 : 1);
  ['Question', 'Answer'].forEach((label, i) => {
    const { x, y, w, h } = cells[i];
    s.box(label, { x, y, w: w * 0.8, h: h * 0.6,
      size: s.W * 0.05, at: i ? '#answer' : 0 });
  });
}
```

Para cada tamaño, corre `check --size <tamaño>` y mira
`sheet --size <tamaño>`. Corrige texto cortado y solapamientos. Luego corre
`render --size <tamaño>` por cada uno.

`render --size tiktok` escribe `out/video-tiktok.mp4` y sus archivos de
subtítulos, portada y capítulos correspondientes. Con `--draft` escribe
`draft-tiktok.mp4`. Los stills van en `out/stills-tiktok/`. Una hoja es
`out/sheet-tiktok.jpg`, o `out/sheet-intro-tiktok.jpg` con `--scene intro`.
Los ratios usan guion en los nombres, por ejemplo `video-9-16.mp4`. Sin
`--size`, los nombres no cambian. `render --out` sigue fijando el nombre que
elijas.

## Ritmo (pace)

`pace` acelera o frena el video entero. A 1,3 la voz habla un 30% más rápido.
El modelo de voz no acelera exactamente, así que revisa la duración que
reporta `voice`. Las pausas, el tiempo antes y después de cada escena, las
transiciones y todas las animaciones también se acortan un 30%. Las señales de
palabra y marcador siguen a la voz. Si anclas las imágenes a palabras, el ritmo
se mantiene correcto a cualquier pace. Los tiempos en segundos son segundos
reales de la escena, como `s.t` y `s.cue()`. Así que
`at: s.cue('palabra') + 0.3` significa 0,3 segundos después de esa palabra a
cualquier pace. Un tiempo fijo como `at: 4` no se mueve con el pace. Es una
razón más para usar señales. 1 es el pace normal. Entre 1,15 y 1,3 va bien
para redes y audiencias que conocen el tema. Por encima de 1,4 el video se
vuelve difícil de seguir. `speed` cambia solo la voz. Su default es 0,9 para
Kokoro y 1 para las demás fuentes.

## La marca de agua

Cada video lleva un pequeño «explainroo.com» abajo a la derecha. En Shorts,
TikTok y Reels va arriba a la derecha, porque la app tapa la de abajo. El
usuario puede apagarla con `"watermark": false` en `video.json`, o cambiarla
por su propio texto. Si el usuario pregunta, dile que es su decisión, y que
mantenerla ayuda a que más gente encuentre este proyecto gratis.

## Archivos y ajustes del proyecto

```
videos/<nombre>/
  video.json    look, tamaño, idioma, voz, música, subtítulos, marca de agua
  script.md     la narración, un "## id-escena" por escena
  scenes.js     una función de dibujo por escena
  assets/       imágenes: capturas, logos, ilustraciones generadas
  build/        voz, timing y audio hechos por explainroo (se puede borrar)
  out/          video.mp4, draft.mp4, stills/, sheets, report.json
```

Ajustes de `video.json`, todos opcionales:

| Ajuste | Default | Qué hace |
|---|---|---|
| `title` | del guion | se muestra en la vista previa |
| `theme` | `paper` | un look integrado, o una ruta relativa a un archivo de look `.json` (ver Looks propios) |
| `size` | `16:9` | una plataforma (`youtube`, `shorts`, `tiktok`, `reels`, `vertical`, `instagram`, `linkedin`, `square`), `16:9`, `9:16`, `1:1`, `4:5` o `ANCHORxALTO` |
| `fps` | 30 | 24, 25, 30, 50 o 60 |
| `language` | `en` | idioma de la narración: `en`, `es`, `fr`, `it`, `pt-br`, `hi`, `ja` o `zh`; ver Videos en otros idiomas |
| `voice` | la del idioma | un id de Kokoro o un objeto de proveedor para Kokoro, ElevenLabs o una grabación; el inglés usa `af_heart`; ver Voces |
| `speed` | 0,9 en Kokoro, 1 en el resto | solo la velocidad de la voz, 0,6 a 1,6; ElevenLabs limita speed por pace a 0,7–1,2 |
| `pace` | 1 | velocidad de todo el video (voz, pausas, animaciones), 0,7 a 1,6 |
| `music` | `true` | `true` (el estilo del look), `warm`, `upbeat`, `calm`, `tech`, `playful`, `{ "style", "volume" }` o `false` |
| `sfx` | `true` | efectos de sonido: `true`, `"minimal"` o `false` |
| `captions` | `"auto"` | texto de la narración abajo; auto los enciende en videos verticales y cuadrados |
| `cover` | `"auto"` | JPEG a tamaño completo, sin subtítulos, al final de la primera escena, o una especificación de still: `12.5`, `"intro"`, `"intro@2.4"`, `"intro@end"` |
| `transition` | `"auto"` | la del look, o `fade`, `slide`, `wipe`, `zoom`, `brush`, `cut` |
| `camera` | `"auto"` | `"auto"` filma cada escena con cámara que sigue la narración; `"still"` deja cada fotograma como está escrito |
| `motionBlur` | `true` | desenfoque de movimiento en fotogramas con movimiento, en el render final |
| `lead`, `hold`, `end` | 0,35 / 0,7 / 1,4 | segundos antes de la voz, tras ella, y extra al final del todo |
| `sentenceGap`, `paragraphGap` | 0,3 / 0,55 | pausas en la narración generada; las grabaciones conservan sus pausas |
| `loudness` | −14 | volumen objetivo en LUFS |
| `boil` | 0 | redibujos por segundo de las líneas a mano; 0 las deja quietas |
| `watermark` | `"explainroo.com"` | texto pequeño en una esquina, o `false` |
| `images` | nada | `{ "model": "best" o "cheap", "style": "..." }` |
| `brand` | nada | colores, fuentes y logo para `s.ui`; ver Demos de producto |
| `fonts` | nada | archivos de fuente propios del video; ver Demos de producto |

Los looks:

| Look | Cómo se ve | Transición | Música |
|---|---|---|---|
| `paper` | dibujos de rotulador sobre papel cálido | brush | warm |
| `clean` | tarjetas planas con sombras suaves | slide | upbeat |
| `chalk` | tiza sobre pizarra verde | brush | calm |
| `blueprint` | dibujos blancos sobre azul de plano | wipe | tech |
| `midnight` | fondo oscuro con colores brillantes | zoom | tech |
| `editorial` | titulares serif y líneas finas sobre papel cálido, tipo revista | fade | calm |

### Looks propios

Un archivo de look le da a un proyecto sus propios colores, fuentes y textura
sin tocar explainroo. Pon `"theme": "../brand/acme-look.json"` en `video.json`.
La ruta es relativa a la carpeta del video, así que un archivo fuera de ella
puede darle el mismo look a varios videos.

```json
{
  "extends": "clean",
  "name": "acme",
  "bg": "#fbfaf7",
  "ink": "#1d1b16",
  "accent": "orange",
  "colors": { "orange": "#e8590c" },
  "background": "dots",
  "transition": "fade",
  "music": "calm"
}
```

`extends` nombra el look integrado del que partes. Todas las demás claves son
opcionales y cambian solo lo que listan: `name`, `dark`, `bg`, `ink`, `muted`,
`surface`, `accent`, `colors`, `fonts`, `background`, `stroke`, `radius`,
`transition`, `music`, `code`, `terminal` y `caption`. En las anidadas, como
`colors` o `caption`, lista solo los valores que cambias. `name` por defecto es
el nombre del archivo y no puede ser un nombre integrado. Pon `"dark": true`
cuando le des un `bg` oscuro a un look claro, para que rellenos y sombras
encajen.

Usa colores como `"#e8590c"`. `caption.bg` y `code.highlight` también aceptan
`rgba(...)`. `accent` nombra uno de los diez colores: red, orange, yellow,
green, teal, blue, purple, pink, gray o ink.

`fonts` fija los roles `display`, `body`, `hand` y `mono`. Cada uno lleva
`family` y un `weight` numérico, por ejemplo
`"body": { "family": "Inter", "weight": 500 }`. Las familias deben venir
integradas o estar listadas en `fonts` de `video.json`. El archivo de look no
carga fuentes.

`background` elige una textura: `paper` (grano de papel), `dots` (cuadrícula de
puntos), `chalk` (manchas de pizarra), `grid` (líneas de plano), `glow` (dos
brillos) o `plain` (un color plano). Cada una usa tu `bg`. Omítelo para
conservar la textura base. `transition` y `music` fijan los defaults del look.
Los ajustes de `video.json` siguen mandando. `preview` recoge ediciones del
look, y `check` avisa cuando `ink` o `muted` tienen poco contraste contra
`bg`.

## Comandos

| Comando | Qué hace |
|---|---|
| `init <dir>` | crea un proyecto (`--theme`, `--size`, `--pace`, `--language`, `--voice`, `--title`) |
| `voice [proyecto]` | genera la narración y los tiempos de palabra, guardados por escena para rehacer solo las escenas cambiadas |
| `preview [proyecto]` | vista previa en vivo en el navegador que se recarga al guardar (`--size`) |
| `still [proyecto] [tiempos]` | imágenes PNG en `12.5`, `escena`, `escena@2.4` o `escena@end` (`--size`, `--transparent` conserva el alfa) |
| `sheet [proyecto]` | una imagen con muchos fotogramas del video o de una escena (`--scene`, `--every`, `--size`) |
| `check [proyecto]` | encuentra problemas de layout, timing y pronunciación (`--size`) |
| `render [proyecto]` | el video más subtítulos, capítulos y portada (`--format mp4`, `gif`, `webm` o `mov`, `--transparent`, `--size`, `--draft`, `--from`, `--to`, `--workers`, `--out`) |
| `verify [proyecto]` | revisa el MP4, WebM o MOV terminado: volumen, fotogramas negros, silencios, voz clara (`--file` elige otro archivo) |
| `export [proyecto]` | escribe una carpeta de reproductor web (`--out dir`, `--json`), por defecto `out/player/` |
| `capture [proyecto] <url>` | guarda capturas, textos, colores, fuentes y logos de un sitio en vivo (`--mobile`, `--json`) |
| `image [proyecto] <nombre> "<prompt>"` | hace una ilustración con OpenRouter |
| `images [proyecto]` | lista las imágenes y su costo |
| `voices`, `say "texto"` | lista las voces de Kokoro con sus idiomas (`--language es`, `ja` o `zh` filtra), o hace una muestra en el idioma de la voz elegida |
| `voices [proyecto] --elevenlabs` | lista los nombres, ids y etiquetas disponibles para la clave (`--json` también vale) |
| `themes`, `formats`, `icons <palabra>` | lista los looks y los tamaños, busca entre los 1.854 íconos |
| `doctor` | revisa Node, ffmpeg, Chrome, los modelos, y espeak-ng y Python con misaki para otros idiomas (`--fetch` descarga solo los modelos de inglés) |

Los archivos extra comparten el nombre del video, también con `--out`:
`video.srt`, `video.vtt`, `video.cover.jpg` y `video.chapters.txt`. Un GIF no
tiene sonido, corre a 15 fotogramas por segundo y mide como máximo 960 píxeles
por su lado largo. Con `--out`, la extensión debe coincidir con el formato. Un
render de parte del video (`--from`, `--to`) omite capítulos y portada. Un
video sin narración no recibe subtítulos.

### Video transparente para editores

Para poner un diagrama o un rótulo sobre material filmado, renderiza con canal
alfa: `render --transparent --format mov` para editores de video (ProRes 4444)
o `--format webm` para la web (VP9). La textura de fondo del look queda fuera.
Todo lo que la escena pinta se conserva, incluidos `s.bg()` y
`u.backdrop()` de `s.ui`, y las tarjetas, subtítulos y la marca de agua
conservan sus propios fondos. Mantén los elementos legibles sobre el video:
usa tarjetas o la opción `bg` del texto.

Los archivos son `out/video.mov` o `out/video.webm` (`draft.*` con `--draft`),
y la portada sigue siendo un JPEG opaco. Las transiciones `slide`, `wipe` y
`brush` se vuelven `fade` en un video transparente. Revisa fotogramas con
`still --transparent`, que conserva el alfa, y el archivo con
`verify --file out/video.mov`, que omite la revisión de fotogramas negros para
video transparente. Sin `--transparent`, WebM y MOV son videos opacos
corrientes.

## Reproductor web

Usa `export` para un video en un sitio de documentación o en un iframe. El
canvas dibuja a la resolución de la pantalla, así que el texto se mantiene
nítido cuando el reproductor crece. La carpeta trae su propio motor, fuentes,
assets, banda sonora, portada y subtítulos. No necesita servidor de explainroo.
La voz se genera primero si falta.

```bash
node bin/explainroo.js export videos/mi-video
```

Sirve `out/player/` con cualquier servidor web estático. Abrir `index.html`
como archivo local no funciona. Copia la carpeta a tu sitio conservando sus
archivos juntos. También funciona en una subcarpeta.

Para un video de 1920 × 1080, incrustalo así. Cambia el aspect ratio al ancho
y alto de tu video.

```html
<div style="aspect-ratio: 1920 / 1080; width: 100%">
  <iframe src="/videos/mi-video/index.html" title="Mi video"
    style="width: 100%; height: 100%; border: 0"
    allow="autoplay; fullscreen" allowfullscreen></iframe>
</div>
```

`index.html?autoplay=1&muted=1` arranca silenciado, sujeto a las reglas de
autoplay del navegador. `index.html?t=12.5` empieza en el segundo 12,5. Haz
clic en la imagen para reproducir o pausar. Espacio o K hacen lo mismo. Las
flechas adelantan cinco segundos. F abre pantalla completa y M silencia.
CC muestra subtítulos de texto sobre los controles. Empieza apagado y recuerda
tu elección en el navegador. Los subtítulos dibujados en el canvas quedan como
están.

Los clips usan el decodificador de video del navegador. Usa un formato que el
navegador pueda reproducir. Su timing puede diferir un poco del MP4. Las
fórmulas se incluyen como trazos ya compuestos. Los módulos del proyecto deben
usar importaciones locales relativas. Los dotfiles, JSON y archivos de texto
del proyecto quedan fuera de la exportación.

El MP4 sigue siendo el archivo para subir a plataformas de video.

## API de escenas

Cada función de escena dibuja un fotograma. explainroo la llama por cada
fotograma con un `s` nuevo, así que todo en la escena depende solo del tiempo.
No conserves valores entre llamadas ni uses temporizadores. Dale a cada
elemento un tiempo `at`, y el look lo anima al entrar. Dale un `out`, y el
look lo anima al salir.

```js
export default {
  intro(s) {
    s.title('Cómo funciona el DNS', { at: 0 });
    s.icon('globe', { y: 700, at: 'navegador' });
  },
};
```

El canvas es 1920 × 1080 para 16:9. Es 1080 × 1920 para los tamaños
verticales, 1080 × 1080 para el cuadrado y 1080 × 1350 para `instagram`,
`linkedin` y 4:5. Las posiciones van en píxeles, contadas desde la esquina
superior izquierda. `x` y `y` son el centro del elemento salvo que el método
diga otra cosa.

### Tiempo

| Miembro | Significado |
|---|---|
| `s.t` | segundos desde el inicio de la escena |
| `s.T` | segundos desde el inicio del video |
| `s.dur` | duración de la escena en segundos |
| `s.voice` | `{ start, end }` de la narración en la escena |
| `s.words` | las palabras dichas: `{ text, start, end }` en segundos de escena |
| `s.cue(palabra, n = 1)` | cuándo empieza la n-ésima vez que se dice una palabra o frase |
| `s.cueEnd(palabra, n = 1)` | cuándo termina |
| `s.mark(nombre)` | el tiempo de un marcador `[#nombre]` |
| `s.time(v)` | convierte un número, una palabra o `"#marcador"` en segundos |
| `s.pace` | el pace del video (1 es normal) |
| `s.p(at, dur = 0.6, ease = 'inOut')` | progreso de 0 a 1 para tus propias animaciones |
| `s.since(at)`, `s.between(a, b)` | segundos desde un tiempo, o si ahora está entre dos tiempos |
| `s.video` | `{ duration, frames, fps, width, height, scenes }` de todo el video |

Cada `at` y `out` acepta segundos (`2.4`), una palabra dicha (`'resolutor'`) o
un marcador (`'#pregunta'`). Las señales de palabra ignoran mayúsculas y
puntuación. Una frase también sirve. Una palabra o marcador equivocado corta
con un error que lista las palabras más parecidas.

Un easing define cómo un movimiento acelera y frena. Los nombres son `linear`,
`in`, `out`, `inOut`, `outBack`, `outElastic`, `outQuart` e `inOutSine`.
`s.ease.out(p)`, `s.lerp(a, b, p)` y `s.clamp(v, lo, hi)` están para tus
propias matemáticas.

### Layout

| Miembro | Significado |
|---|---|
| `s.W`, `s.H`, `s.cx`, `s.cy` | tamaño del canvas y su centro (en Shorts, TikTok y Reels, el centro de `s.safe`) |
| `s.portrait` | true cuando el marco es más alto que ancho |
| `s.safe` | `{ x, y, w, h, left, top, right, bottom }`: el área para contenido (un margen del 7%, o la parte que la plataforma deja libre) |
| `s.row(n, { width, x })` | n posiciones x repartidas sobre un ancho |
| `s.col(n, { height, y })` | n posiciones y repartidas sobre una altura, centradas en `s.safe` |
| `s.grid(cols, rows, { x, y, w, h, gap })` | celdas `{ x, y, w, h }`, fila por fila, llenando `s.safe` |
| `s.get(id)` | tamaño y posición de un elemento dibujado antes con ese `id` |

La mayoría de los elementos devuelven `{ x, y, w, h, left, right, top, bottom }`,
para que coloques lo siguiente debajo o al lado.

### Opciones que aceptan casi todos los elementos

| Opción | Significado |
|---|---|
| `at`, `out` | cuándo aparece y cuándo se va |
| `enter` | `draw`, `write`, `type`, `words`, `sync`, `pop`, `rise`, `fade`, `zoom`, `drop`, `slide-left`, `slide-right`, `slide-up`, `slide-down`, `none` |
| `exit` | `fade`, `pop`, `rise`, `drop`, `slide-left`, `slide-right`, `none` |
| `dur` | duración de la entrada en segundos (acortada por el pace) |
| `outDur` | duración de la salida en segundos (0,45) |
| `id` | un nombre para flechas, `annotate` y `s.get` |
| `color` | un nombre de color (`blue`, `accent`, `ink`, `muted`, …) o cualquier color CSS |
| `opacity`, `scale`, `rotate` | cambios extra, `rotate` en grados |
| `float` | píxeles de deriva lenta que mantienen vivo un elemento quieto |
| `sfx` | el sonido de entrada, o `false` |

`out` es cuándo empieza la salida, así que un elemento todavía se está
desvaneciendo mientras entra el siguiente. Para cambiar una etiqueta por otra
en el mismo sitio, dale a la vieja `exit: 'none'` y a la nueva el mismo tiempo
que su `at`.

En `paper`, `chalk` y `blueprint`, las formas se dibujan línea a línea y el
texto se escribe. En `clean` y `midnight`, las formas hacen pop y el texto
sube. En `editorial`, las formas aparecen con fade y el texto sube. Usa
`at: -1` para lo que ya estaba en pantalla en la escena anterior: está desde
el inicio y no suena.

### Texto

```js
s.title('Cómo funciona el DNS', { at: 0 });                     // fuente display, 104 px, al 44% de altura
s.subtitle('la guía telefónica de internet', { at: 1 });        // 46 px, muted, al 60% de altura
s.text('Cada sitio tiene una *dirección*', { y: 300, size: 64, at: 'dirección' });
s.note('unos 20 ms', { x: 1400, y: 820, at: 3 });               // 32 px, muted
```

`s.text(str, options)` acepta: `x`, `y`, `size` (48), `font` (`display`,
`body`, `hand`, `mono`), `weight` o `bold: true`, `align` (`left` significa
que x es el borde izquierdo), `valign` (`top` significa que y es el borde
superior), `maxWidth`, `lineHeight`, `color`, `mark` (color de las palabras
`*entre estrellas*`), `bg` (una tarjeta detrás del texto), `padding`, `radius`,
`border`. El texto también puede entrar con `write`, `type` (con `cps`),
`words` y `sync`. `sync` muestra cada palabra cuando la voz la dice. Las
palabras `*entre estrellas*` toman el color de acento. `\n` abre una línea.

### Matemáticas

```js
s.math('E = mc^2', { y: 420, size: 96, at: 'energía' });
s.math(String.raw`\int_0^1 x^2\,dx = \tfrac{1}{3}`, { x: 960, y: 700, size: 72, color: 'accent', at: '#integral', id: 'area' });
```

`s.math(tex, options)` dibuja una fórmula TeX. Opciones: `x`, `y` (el centro),
`size` (72), `color` (ink), `align` (`center` o `left`, donde x es el borde
izquierdo), `display` (true para estilo display) y las opciones comunes.
Devuelve una caja como el texto. Su `id` sirve con flechas y `s.annotate`. En
`paper`, `chalk` y `blueprint`, los contornos se dibujan primero y luego se
rellenan. Los otros looks usan su entrada de texto. También puedes usar
`fade`, `pop` o `rise`.

Duplica cada barra invertida en un string JS normal, por ejemplo
`'\\frac{1}{2}'`. `String.raw` conserva las barras tal cual, como en el segundo
ejemplo. Solo funcionan strings TeX fijas. Llama siempre `s.math` y usa `at` y
`out` para el timing. `check` reporta fórmulas que cambian con `s.t` o que
aparecen tarde. Las fórmulas se componen en esta computadora y quedan en cache
en `build/math/`.

### Formas y flechas

```js
s.box('Resolutor', { id: 'res', x: 960, y: 540, icon: 'server', color: 'blue', at: 'resolutor' });
s.circle({ id: 'tu', x: 400, y: 540, r: 90, label: 'Tú', at: 0.5 });
s.arrow('tu', 'res', { label: 'pregunta', at: 'pregunta' });
s.arrow([300, 900], [1600, 900], { bend: 0.3, dashed: true, at: 5 });
s.line([[200, 800], [900, 700]], { color: 'accent', at: 2 });
s.path('M0 0 C 200 -150 400 150 600 0', { x: 660, y: 540, at: 3 });
```

`s.box(label, options)` es una tarjeta que se ajusta a su etiqueta. Opciones:
`w`, `h`, `minW`, `minH`, `size`, `font`, `icon`, `iconSize`, `iconColor`,
`color` (contorno y relleno claro), `fill`, `stroke`, `width`, `dashed`,
`border: false`, `radius`, `shape: 'ellipse'`, `textColor`, `fillStyle`
(looks a mano: `solid`, `hachure`, `cross-hatch`, `zigzag`, `dots`).
`s.circle({ r, label })` toma las mismas opciones.

`s.line(points, options)` y `s.path(d, options)` aceptan `color`, `width`,
`dashed`, `fill` y `glow`. `s.path` también `fillStyle`, y `single: true`
dibuja un trazo a mano con una sola pasada en vez de dos.

`s.arrow(from, to, options)` dibuja una flecha. `from` y `to` son `[x, y]`,
`{ x, y }` o el `id` de un elemento dibujado antes. Con un `id`, la flecha se
detiene en el borde de ese elemento. Opciones: `bend` (entre −1 y 1), `head`
(`end`, `start`, `both`, `none`), `label`, `labelSize`, `labelColor`,
`labelFont` (la fuente manuscrita por defecto; `'body'` va bien con `clean`),
`labelOffset`, `gap`, `dashed`, `width`, `headSize`. `s.connect` hace lo
mismo.

### Íconos, imágenes y clips de video

```js
s.icon('database', { x: 1500, y: 540, size: 140, color: 'purple', at: 'base' });
s.icon('lock', { bg: 'circle', color: 'green', label: 'Cifrado', at: 4 });
s.image('assets/app.png', { w: 1100, frame: 'browser', url: 'app.example.com', at: 0.5 });
s.image('assets/cables.png', { w: 1000, frame: 'card', at: 'cables', kenburns: true });
```

Los 1.854 íconos vienen de Lucide. Búscalos con `explainroo icons <palabra>`.
Los nombres viejos de Lucide también valen. Opciones de ícono: `size` (120),
`color`, `weight` (2), `bg` (`true`, `'circle'`, `'square'` o un color),
`bgScale`, `label`, `labelSize`, `labelColor`, `labelFont`.

`s.image(src, options)` dibuja un archivo de `assets/`. Opciones: `w` y/o `h`
(la imagen conserva su forma), `fit` (`cover` o `contain`), `radius`, `frame`
(`none`, `card`, `browser`, `window`, `phone`), `url` (para el marco de
navegador), `border`, `shadow: false`, `kenburns: true` para un zoom lento.

`s.clip(src, options)` dibuja un video de `assets/`. Toma las mismas opciones
de layout, marco y timing que `s.image` y devuelve la misma caja. Usa
archivos `.mp4`, `.mov`, `.webm` o `.m4v`.

```js
s.clip('assets/signup.mp4', { w: 1200, frame: 'browser', url: 'app.example.com', at: 'registro' });
s.clip('assets/demo.mov', { x: 1400, y: 540, h: 600, from: 12.5, speed: 1.5, at: '#demo', out: 9 });
```

- `from` (0) es el segundo del clip donde empieza la reproducción.
- `speed` (1) va de 0,25 a 4. La reproducción arranca en `at`.
- `loop` (false) repite el clip entero. Si no, congela el último fotograma.
  `check` da un hint cuando esa congelación dura más de un segundo.
- `volume` (0) va de 0 a 1. El sonido solo suena con `speed: 1`. Se detiene en
  `out`, al fin del clip o al fin de la escena. Los bucles repiten también el
  sonido. La música baja bajo el sonido del clip como bajo la voz.

Los fotogramas se extraen una vez al fps del proyecto y se guardan en
`build/clips/`. Miden como máximo 1920 píxeles de ancho. Renders, stills y
sheets usan esos fotogramas. La vista previa puede mostrar un fotograma cercano
mientras carga el correcto. `s.video` sigue teniendo la duración, fotogramas,
fps y tamaño de todo el video. La reproducción empieza en `at`, así que
`at: -1` arranca el clip un segundo adentro. Para mostrar un clip desde su
primer fotograma al iniciar la escena, usa `at: 0, enter: 'none'`. `check` no
puede leer texto dentro de un clip: mira stills de esos momentos.

### Señalar cosas

```js
s.text('*No* es magia', { id: 'afirmacion', y: 400, at: 0 });
s.annotate('afirmacion', { type: 'underline', at: 'magia' });
s.annotate({ x: 960, y: 700, w: 400, h: 90 }, { type: 'circle', color: 'red', at: 3 });
```

`s.annotate(target, options)` marca un elemento o una caja. `type` es
`underline`, `circle`, `box`, `highlight`, `strike`, `cross` o `bracket`.
Opciones: `color`, `padding`, `width`, `dur`.

### Listas, números y gráficos

```js
s.list(['Caché del navegador', 'Resolutor', 'Servidor raíz'], { x: 360, y: 280, at: 'primero', stagger: 1.1 });
s.number(1500000, { suffix: ' requests', at: 'millon', y: 480 });
s.bars([{ label: '2023', value: 19 }, { label: '2024', value: 31 }], { at: 1, suffix: 'k' });
s.lineChart([3, 5, 4, 8, 13, 21], { labels: ['L', 'M', 'X', 'J', 'V', 'S'], at: 1 });
s.pie([{ label: 'Imágenes', value: 55 }, { label: 'Otros', value: 45 }], { donut: 0.55, at: 1 });
```

- `s.list(items, options)`: los ítems son texto o `{ text, at, icon, color, out }`.
  `x` es el borde izquierdo y `y` el superior. Opciones: `size` (50), `width`,
  `gap`, `bullet` (`dot`, `dash`, `number`, `check`, `arrow` o un nombre de
  ícono), `bulletColor`, `at` (un tiempo de inicio o una lista de tiempos),
  `stagger` (0,7), `enter`.
- `s.number(value, options)` cuenta hacia arriba con tics. Opciones: `from`,
  `dur` (1,4), `prefix`, `suffix`, `decimals`, `separator`, `group: false`, y
  las opciones de texto.
- `s.bars(data, options)`: los ítems son `{ label, value, color, at }`. Una
  barra con su propio `at` crece cuando se dice esa palabra. Opciones: `x`,
  `y`, `w`, `h`, `max`, `stagger`, `growDur`, `values: false`, `prefix`,
  `suffix`, `format(v)`, `labelSize`, `valueSize`, `fillStyle`.
- `s.lineChart(values, options)`: `x`, `y`, `w`, `h`, `min`, `max`, `labels`,
  `dots: false`, `area: false`, `color`, `dur`.
- `s.pie(data, options)`: `x`, `y`, `r`, `donut` (0 a 0,8), `labels: false`,
  `labelOffset`, `dur`.

### Código y terminal

```js
s.code("const res = await fetch(url);", { lang: 'js', title: 'app.js', at: 0.5 });
s.terminal(['$ npm install', 'added 42 packages in 3s'], { at: 1 });
```

`s.code(source, options)` muestra código. Opciones: `x` e `y` (el centro de la
ventana), `lang` (`js`, `ts`, `py`, `go`, `rust`, `php`, `sh`, `sql`, `json`,
`md`), `size` (32), `w`, `title` (o `false`), `lineNumbers: false`, `reveal`
(`type`, `lines`, `none`), `cps`, `lineDelay`, `highlight` (números de línea) y
`highlightAt`. `check` reporta líneas más anchas que la ventana.

Usa pasos para mostrar un cambio, un refactor o un arreglo:

```js
s.code([
  { code: 'const total = items.length;', at: 0.5 },
  { code: 'const total = items\n  .filter((i) => i.active)\n  .length;', at: 'filter', highlight: [2] },
  { code: 'const activeCount = items\n  .filter((i) => i.active)\n  .length;', at: '#rename' },
], { lang: 'js', title: 'stats.js' });
```

Lo que se conserva se desliza a su nuevo sitio, lo que se quita se desvanece y
lo nuevo aparece. Cada paso posterior empieza en su propio `at`, y el cambio
toma `morphDur` segundos (0,8, acortado por `pace`). El `at` del elemento por
defecto es el del primer paso. `reveal` aplica solo al primer paso. El
`highlight` de un paso reemplaza el anterior. La ventana es tan ancha como el
paso más ancho, hasta el 86% del marco, salvo que fijes `w`, y su altura sigue
la cantidad de líneas. `check` revisa las líneas de todos los pasos.

`s.terminal(lines, options)` muestra una terminal. Las líneas que empiezan con
`$ ` se teclean como comandos. Las demás son salida. Una línea también puede
ser `{ cmd, at }` o `{ out, at, color }`. Opciones: `w`, `size`, `rows`,
`title`, `prompt`, `cps` (22), `outputDelay`, `lineGap`.

### Cámara, grupos y dibujo propio

- `s.camera([{ at, x, y, zoom, dur, rotate }])` mueve la vista a mano en vez
  de la cámara automática (ver La cámara). Llámala primero en la función de
  escena. `s.camera([])` deja la escena quieta.
- `s.focus(target, { at, out })` apunta la cámara automática a un elemento o
  región con una señal, por ejemplo una fila de una tabla. `target` es un `id`
  dibujado antes, `{ x, y, w, h }` (centro y tamaño) o `[x, y, w, h]`. No
  dibuja nada. Las líneas de código resaltadas y los comandos de terminal
  reciben primer plano propio cuando quedan pequeños en el plano.
- `s.group({ x, y, scale, rotate, at, out, enter }, () => { ... })` mueve un
  conjunto de elementos junto. Dentro del grupo, las posiciones cuentan desde
  `x`, `y`.
- `s.draw({ x, y, at, out }, (ctx, life) => { ... })` te da el contexto 2D del
  canvas para dibujar lo que los demás métodos no puedan. `life.p` es el
  progreso de entrada de 0 a 1, y `life.local` los segundos desde `at`, para
  movimiento continuo. `s.ctx` también está disponible.
- `s.burst({ x, y, at, count, colors })` lanza confeti.
- `s.bg(color)` pinta sobre el fondo.
- `s.rand(i)`, `s.noise(x)` y `s.wiggle(amount, speed)` dan valores
  aleatorios que salen iguales en cada render.

### Sonido

Los elementos suenan al entrar. El look elige el sonido. Las líneas dibujadas
garabatean, las tarjetas hacen pop, las flechas silban, los ítems de lista
suben notas, los números tican, el tipeo cliquea y las escenas cambian con un
swipe. `sfx: false` silencia un elemento. `"sfx": "minimal"` en `video.json`
conserva solo las transiciones y los sonidos que añadas tú.

`s.sfx(name, at, { gain, dur, pitch })` añade un sonido: `pop`, `click`,
`whoosh`, `swipe`, `tick`, `type`, `ding`, `chime`, `thud`, `scribble`,
`chalk`, `rise`, `sparkle`, `blip`, `error`. `dur` fija la duración de `type`,
`scribble`, `chalk` y `rise` (`rise` termina en `at + dur`). La música se
compone para el video y baja cuando la voz habla.

### Colores y fuentes

Para demos de producto con colores y fuentes de la marca, ver
Demos de producto.

Nombres de color: `accent`, `ink`, `muted`, `bg`, `surface`, `red`, `orange`,
`yellow`, `green`, `teal`, `blue`, `purple`, `pink`, `gray`. Cada look tiene su
propia versión de cada color, así las escenas siguen funcionando al cambiar el
look. `s.color(name)` devuelve el color CSS y `s.tint(name)` el relleno claro.
Los roles de fuente son `display`, `body`, `hand` y `mono`.

## Cosas que se rompen

- Llamar a un elemento solo a veces, como `if (s.t > 3) s.box(...)`. Llámalo
  siempre y usa `at` y `out` para el timing. Los efectos de sonido y las
  revisiones dependen de esto.
- Cambiar el TeX de `s.math` con el tiempo. Usa strings fijas por fórmula, cada
  una con su `at` y `out`.
- Una flecha o anotación que apunta a un `id` dibujado más adelante en la
  función.
- `s.camera()` después de otros elementos. Tiene que ir primero.
- Un `at` posterior al fin de la escena. Alarga la escena con `{hold=2}` o
  `{min=6}` en el guion.
- Valores aleatorios de otra cosa que `s.rand()`, `s.noise()` o `Math.random()`
  dentro de la función de escena. Solo esos tres salen iguales en cada render.
- Texto en imágenes de IA. Las palabras en pantalla van con `s.text`.
- Una palabra de señal que se dice dos veces. `at: 'escribe'` significa la
  primera vez. Usa `s.cue('escribe', 2)` o un `[#marcador]` para una posterior.
  `check` lista esas palabras como hints.
- Apóstrofes en palabras de señal. Las señales ignoran puntuación, así que
  «visitor's» se oye como «visitors»; `at: 'visitor'` esperaría al siguiente
  «visitor» plano. Usa ahí un `[#marcador]`.
- Elementos dentro de `s.group`. Cada uno suena en su propio `at`, aunque el
  grupo siga oculto. Dales el `at` del grupo, o `sfx: false`.
- Palabras que suenan como otras. La revisión de habla oye «won» como «one» y
  «plain» como «plane», y `{shown|spoken}` no puede arreglarlo. Reformula la
  frase. Para siglas deletreadas letra por letra, escribe `{API|A, P, I}`. No
  escribas `A.P.I.`: la voz lee los puntos como dirección web.
- Crecer una forma cambiando `w` o `h` con el tiempo en los looks a mano. El
  contorno se redibuja cada fotograma y tiembla. Anima `scale`.
- Un cambio de escena en medio de un diagrama. La transición por defecto de
  `clean` desliza el marco entero. Dale a las escenas que comparten diagrama
  `{transition=fade}` o `{transition=cut}`.
- Flechas desde un ícono con etiqueta. El `id` de un ícono cubre solo el ícono,
  no su etiqueta: una flecha que sale hacia abajo la cruza.
- Texto de color en `paper` y `clean`. Verde, naranja y rojo son bastante
  claros para formas pero a menudo demasiado para texto. `check` avisa del bajo
  contraste, sugiere un color legible y muestra su ratio.
- Clips largos llenan `build/clips/` de fotogramas. Recorta la grabación a la
  parte que muestras antes de añadirla. Borrar `build/clips/` es seguro.
- Las grabaciones de pantalla suelen tener fps variable. explainroo las
  convierte al fps del proyecto, así que un fotograma puede repetirse o
  saltarse. Graba a fps fijo cuando el movimiento importa.
- Geometría exacta en `paper`, `chalk` y `blueprint`. Sus contornos van a
  mano, así que el borde de un círculo se aparta un poco de su radio. Cuando
  una línea debe encontrarse exactamente con un contorno —como un radio que
  termina en el círculo— dibuja ambos con `s.draw`.
- Un render que se corta con el navegador cerrado o `EPIPE` en una computadora
  cargada. Córrelo de nuevo con menos páginas, por ejemplo `render --workers 2`.

`check` mira el texto y las fórmulas. Encuentra texto fuera del marco, demasiado
cerca del borde (3,5%), demasiado pequeño, de bajo contraste (contra la página o
contra su propio `bg`), encima de otro texto, o bajo los subtítulos. No ve
formas, flechas ni íconos, ni dibujos hechos con `s.draw`. Mira los stills para
eso.

## Trabajar en el propio explainroo

- `src/` es la parte que corre en Node: guion, voz, timing de palabras, línea
  de tiempo, servidor, render, revisiones e imágenes. `engine/` es la parte que
  corre en la página del navegador: la API de escenas (`stage.js`), el dibujo
  (`pen.js`), los looks, las transiciones, los subtítulos y el audio
  (`engine/audio/`).
- Corre `npm test` tras cada cambio. Tras cambios en el motor, renderiza
  también los videos de `examples/` y mira sus stills y sheets.
- `dev/audio-lab.mjs` renderiza cada estilo de música y sonido y los mide.
- `npm run build:icons` reconstruye los íconos desde `lucide-static`, y
  `npm run build:fonts` vuelve a descargar las fuentes.

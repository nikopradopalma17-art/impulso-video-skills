#!/usr/bin/env node
/*
  Pipeline: script + custom HTML → voiceover → recorded animation → merged MP4

  Usage:
    node pipeline.js --html <page.html> --script <script.txt|.md> --voice brian --out output.mp4

  Or with a single config JSON:
    node pipeline.js --config <config.json> --out output.mp4

  Config schema:
    {
      "title": "My Explainer",
      "voice": "brian",
      "script": "Full narration text...",
      "html": "/abs/path/to/page.html"     // OR
      "htmlInline": "<!DOCTYPE html>..."
    }

  Contract for the HTML page:
    - 1280x720 viewport (set html/body to that size)
    - Load GSAP: <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
    - Read window.__AUDIO_DURATION (seconds, float) to scale animation timing
    - When animation finishes, set window.__done = true
*/
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { generateVoice } = require('./edge-tts');
const { renderVideo } = require('./render');

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return (i >= 0 && process.argv[i + 1]) ? process.argv[i + 1] : def;
}

function ffprobeDuration(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]);
  return parseFloat(r.stdout.toString().trim());
}

function audioCacheDir() {
  const dir = path.join(os.homedir(), '.cache', 'explainer-video', 'voice');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function audioCacheKey(text, voice) {
  return crypto.createHash('sha256').update(voice + '\0' + text).digest('hex').slice(0, 16);
}

async function main() {
  const configPath = arg('config');
  let cfg = {};
  if (configPath) cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const htmlPath = arg('html', cfg.html);
  const scriptArg = arg('script');
  const scriptText = scriptArg
    ? fs.readFileSync(scriptArg, 'utf8')
    : (cfg.script || '');
  const voice = arg('voice', cfg.voice || 'brian');
  const outPath = path.resolve(arg('out', 'explainer.mp4'));

  const hasSegments = Array.isArray(cfg.scriptSegments) && cfg.scriptSegments.length;
  if (!scriptText && !hasSegments) throw new Error('Missing --script (or config.script / config.scriptSegments).');
  if (!htmlPath && !cfg.htmlInline) throw new Error('Missing --html (or config.html / config.htmlInline).');

  const workDir = path.resolve(path.dirname(outPath), '.work-' + path.basename(outPath, '.mp4'));
  if (!fs.existsSync(workDir)) fs.mkdirSync(workDir, { recursive: true });

  // 1. Voiceover.
  //    Supports three modes:
  //      a) --audio path.mp3        → reuse external audio (no segment info)
  //      b) cfg.scriptSegments[]    → one TTS call per segment, concat, expose per-segment durations
  //      c) plain script (default)  → single TTS call (no per-scene alignment guarantee)
  const audioOverride = arg('audio', cfg.audio);
  let audioPath;
  let segmentDurations = null;
  if (audioOverride) {
    audioPath = path.resolve(audioOverride);
    if (!fs.existsSync(audioPath)) throw new Error('--audio file not found: ' + audioPath);
    console.log('[1/3] Using provided audio: ' + audioPath);
  } else if (Array.isArray(cfg.scriptSegments) && cfg.scriptSegments.length) {
    console.log('[1/3] Generating ' + cfg.scriptSegments.length + ' audio segments (voice=' + voice + ')...');
    const segPaths = [];
    segmentDurations = [];
    for (let i = 0; i < cfg.scriptSegments.length; i++) {
      const segText = cfg.scriptSegments[i];
      const key = audioCacheKey(segText, voice);
      const cached = path.join(audioCacheDir(), key + '.mp3');
      if (!fs.existsSync(cached)) {
        process.stdout.write('     segment ' + (i + 1) + '/' + cfg.scriptSegments.length + '... ');
        await generateVoice({ text: segText, voice, outputPath: cached });
        console.log('done');
      } else {
        console.log('     segment ' + (i + 1) + '/' + cfg.scriptSegments.length + ' (cached)');
      }
      segPaths.push(cached);
      segmentDurations.push(ffprobeDuration(cached));
    }
    const concatList = path.join(workDir, 'concat.txt');
    fs.writeFileSync(concatList, segPaths.map(p => "file '" + p.replace(/'/g, "'\\''") + "'").join('\n') + '\n');
    audioPath = path.join(workDir, 'voice.mp3');
    const cat = spawnSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', concatList, '-c:a', 'libmp3lame', '-q:a', '4', audioPath], { stdio: 'pipe' });
    if (cat.status !== 0) throw new Error('ffmpeg concat failed: ' + cat.stderr.toString());
  } else {
    const key = audioCacheKey(scriptText, voice);
    const cached = path.join(audioCacheDir(), key + '.mp3');
    if (fs.existsSync(cached)) {
      console.log('[1/3] Cache hit — reusing voiceover (key=' + key + ').');
      audioPath = cached;
    } else {
      console.log('[1/3] Generating voiceover (' + scriptText.length + ' chars, voice=' + voice + ')...');
      await generateVoice({ text: scriptText, voice, outputPath: cached });
      audioPath = cached;
    }
  }
  const audioDur = ffprobeDuration(audioPath);
  console.log('     Voice duration: ' + audioDur.toFixed(2) + 's' + (segmentDurations ? ' (' + segmentDurations.length + ' segments)' : ''));

  // 2. Inject AUDIO_DURATION + TITLE into the HTML
  let html = htmlPath
    ? fs.readFileSync(path.resolve(htmlPath), 'utf8')
    : cfg.htmlInline;
  const injection =
    `<script>window.__AUDIO_DURATION = ${audioDur};` +
    ` window.__TITLE = ${JSON.stringify(cfg.title || 'Explainer')};` +
    (segmentDurations ? ` window.__SEGMENT_DURATIONS = ${JSON.stringify(segmentDurations)};` : '') +
    `</script>`;
  html = html.includes('</head>')
    ? html.replace('</head>', injection + '</head>')
    : injection + html;
  const pageHtml = path.join(workDir, 'page.html');
  fs.writeFileSync(pageHtml, html);

  // 3. Record
  console.log('[2/3] Recording animation...');
  const rawDir = path.join(workDir, 'raw');
  if (fs.existsSync(rawDir)) fs.rmSync(rawDir, { recursive: true });
  const rawVideo = await renderVideo({ htmlPath: pageHtml, outputDir: rawDir, maxDurationSec: audioDur + 30 });

  // 4. Merge
  console.log('[3/3] Merging video + audio...');
  const merge = spawnSync('ffmpeg', [
    '-y', '-i', rawVideo, '-i', audioPath,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'fast', '-crf', '20',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest',
    outPath,
  ], { stdio: 'inherit' });
  if (merge.status !== 0) throw new Error('ffmpeg merge failed');
  console.log('✅ Done: ' + outPath);
}

main().catch(e => { console.error(e); process.exit(1); });

#!/usr/bin/env node
/**
 * One entry point for turning a storyboard into a video.
 *
 * This exists because every step it wraps was, at some point, a manual step that
 * went wrong. Most memorably: Remotion MERGES `--props` with `defaultProps`, and
 * the composition's props are shaped `{ storyboard: … }`. Passing storyboard.json
 * directly therefore renders the DEMO board with the real board's keys ignored —
 * silently, and with a plausible-looking result. Wrapping props is now automatic.
 *
 * Steps: stage assets → wrap props → subset fonts → validate → render.
 *
 * Usage:
 *   node render.mjs --storyboard DIR_OR_FILE [--out out.mp4] [--slug name]
 *                   [--still FRAME] [--studio] [--concurrency N]
 */

import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILL = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const STUDIO = process.env.H2V_STUDIO || path.join(homedir(), ".cache/html2video/studio");

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : dflt;
};
const has = (name) => args.includes(name);

const sbArg = flag("--storyboard");
if (!sbArg) {
  console.error("--storyboard <dir|file> is required");
  process.exit(2);
}

// Accept either the storyboard file or the harvest directory containing it.
const sbPath = existsSync(sbArg) && sbArg.endsWith(".json")
  ? path.resolve(sbArg)
  : path.resolve(sbArg, "storyboard.json");
if (!existsSync(sbPath)) {
  console.error(`storyboard not found: ${sbPath}`);
  process.exit(2);
}
const workDir = path.dirname(sbPath);
const slug = flag("--slug", path.basename(workDir).replace(/[^a-z0-9-]/gi, "-").toLowerCase());

const run = (cmd, cmdArgs, opts = {}) => {
  const r = spawnSync(cmd, cmdArgs, { stdio: "inherit", ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

// 0. Keep the studio's copy of the engine current.
run("bash", [path.join(SKILL, "scripts/sync.sh")], { stdio: "ignore" });
if (!existsSync(path.join(STUDIO, "node_modules"))) {
  console.log("installing engine dependencies (first run only)…");
  run("npm", ["install", "--no-audit", "--no-fund"], { cwd: STUDIO });
}

// 1. Stage assets under public/runs/<slug>/ and rewrite src to match, so a
//    storyboard authored against harvest paths needs no hand editing.
const sb = JSON.parse(readFileSync(sbPath, "utf8"));
const runDir = path.join(STUDIO, "public/runs", slug);
mkdirSync(runDir, { recursive: true });

let staged = 0;
for (const asset of sb.assets ?? []) {
  const base = path.basename(asset.src);
  const candidates = [
    path.resolve(workDir, asset.src),
    path.resolve(workDir, "media", base),
    path.resolve(workDir, base),
  ];
  const found = candidates.find((c) => existsSync(c));
  if (!found) {
    console.error(`asset "${asset.id}" not found. Looked in:\n  ${candidates.join("\n  ")}`);
    process.exit(1);
  }
  copyFileSync(found, path.join(runDir, base));
  asset.src = `runs/${slug}/${base}`;
  staged++;
}
if (sb.audio?.bed) {
  const bedSrc = path.resolve(workDir, sb.audio.bed);
  if (existsSync(bedSrc)) {
    const base = path.basename(sb.audio.bed);
    copyFileSync(bedSrc, path.join(runDir, base));
    sb.audio.bed = `runs/${slug}/${base}`;
  } else if (!existsSync(path.join(STUDIO, "public", sb.audio.bed))) {
    console.log(`  note: audio.bed "${sb.audio.bed}" not found — rendering silent`);
    delete sb.audio.bed;
  }
}
console.log(`staged ${staged} asset(s) into public/runs/${slug}/`);

// The staged storyboard is what gets validated and rendered, so paths agree.
const stagedSb = path.join(workDir, ".staged-storyboard.json");
writeFileSync(stagedSb, JSON.stringify(sb, null, 2), "utf8");

// 2. Wrap props. The composition takes { storyboard }, not the board itself.
const propsPath = path.join(workDir, ".props.json");
writeFileSync(propsPath, JSON.stringify({ storyboard: sb }), "utf8");

// 3. Subset fonts to exactly this board's characters.
run("node", [
  path.join(SKILL, "scripts/build_fonts.mjs"),
  "--storyboard", stagedSb,
  "--out", path.join(STUDIO, "public/fonts"),
]);

// 4. Validate — schema, timing floors, resolution guard, shimmer cap.
const esbuild = path.join(STUDIO, "node_modules/.bin/esbuild");
const bundled = path.join(workDir, ".validate.mjs");
execFileSync(esbuild, [
  path.join(STUDIO, "scripts/validate-storyboard.ts"),
  "--bundle", "--platform=node", "--format=esm",
  `--outfile=${bundled}`, "--log-level=error",
], { cwd: STUDIO });
run("node", [bundled, stagedSb, "--public", path.join(STUDIO, "public")]);

// 5. 口播 script. Generated automatically in voice mode, because in that mode it
// IS the deliverable — the video is cut to the narration's pacing, so shipping the
// cut without the script leaves something unrecordable.
if (sb.audio?.mode === "voice") {
  const scriptBundle = path.join(workDir, ".make-script.mjs");
  execFileSync(esbuild, [
    path.join(STUDIO, "scripts/make-script.ts"),
    "--bundle", "--platform=node", "--format=esm",
    `--outfile=${scriptBundle}`, "--log-level=error",
  ], { cwd: STUDIO });
  const scriptArgs = [scriptBundle, stagedSb, "--out", path.join(workDir, "narration.md")];
  const sps = flag("--sps");
  if (sps) scriptArgs.push("--sps", sps);
  run("node", scriptArgs);
} else if (has("--script")) {
  console.error(
    `--script needs audio.mode "voice" and a \`narration\` line on every scene. ` +
      `In "music" mode the cut is timed for reading, so a script would not match it.`,
  );
  process.exit(1);
}
if (has("--script")) process.exit(0);

// 6. Render, or open the studio, or pull a single still.
if (has("--studio")) {
  run("npx", ["remotion", "studio", "src/index.ts", "--props", propsPath], { cwd: STUDIO });
  process.exit(0);
}

const still = flag("--still");
if (still) {
  const outPng = flag("--out", path.join(workDir, `still-${still}.png`));
  run("npx", [
    "remotion", "still", "src/index.ts", "Html2Video", path.resolve(outPng),
    `--frame=${still}`, "--props", propsPath,
  ], { cwd: STUDIO });
  console.log(`\n${path.resolve(outPng)}`);
  process.exit(0);
}

const out = path.resolve(flag("--out", path.join(workDir, `${slug}.mp4`)));
run("npx", [
  "remotion", "render", "src/index.ts", "Html2Video", out,
  "--props", propsPath,
  "--codec=h264",
  // VideoToolbox on Apple Silicon. NOTE: --crf is incompatible with hardware
  // encoders, so bitrate is set explicitly; 8M ≈ software-encode size at 1080p.
  "--hardware-acceleration=if-possible",
  "--video-bitrate=8M",
  `--concurrency=${flag("--concurrency", "8")}`,
  "--log=info",
], { cwd: STUDIO });

console.log(`\n${out}`);

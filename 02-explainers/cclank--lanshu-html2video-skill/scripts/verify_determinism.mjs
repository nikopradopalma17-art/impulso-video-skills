#!/usr/bin/env node
/**
 * The only actual proof of determinism.
 *
 * lint_render_safety.mjs and sandbox.ts are heuristics: they catch the mistakes
 * people make, but they cannot prove a render is reproducible. This can. It
 * renders the same probe frames in SEPARATE PROCESSES and compares SHA-256 of the
 * output.
 *
 * Separate processes matter. Remotion renders a video's frames across parallel
 * tabs that share no state, so the failure being tested for is not "does the same
 * process agree with itself" but "do two independent browser contexts agree".
 * Two `remotion still` invocations reproduce that condition.
 *
 * A mismatch means the video is not reproducible and should not ship: the usual
 * causes are unseeded randomness, a clock read, a font that raced, or effect
 * timing that differs per tab.
 *
 * Usage:
 *   node verify_determinism.mjs --storyboard DIR [--frames 0,300,900] [--probes 6]
 */

import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILL = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const STUDIO = process.env.H2V_STUDIO || path.join(homedir(), ".cache/html2video/studio");

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};

const sbArg = flag("--storyboard");
if (!sbArg) {
  console.error("--storyboard <dir|file> is required");
  process.exit(2);
}
const sbPath = sbArg.endsWith(".json") ? path.resolve(sbArg) : path.resolve(sbArg, "storyboard.json");
const workDir = path.dirname(sbPath);

// render.mjs writes these; reuse them so we probe exactly what would ship.
const propsPath = path.join(workDir, ".props.json");
const stagedPath = path.join(workDir, ".staged-storyboard.json");
if (!existsSync(propsPath) || !existsSync(stagedPath)) {
  console.error(
    `run render.mjs first (even with --still 0) so assets are staged and props written:\n` +
      `  node ${path.join(SKILL, "scripts/render.mjs")} --storyboard ${sbArg} --still 0`,
  );
  process.exit(2);
}

const sb = JSON.parse(readFileSync(stagedPath, "utf8"));

/**
 * Probe frames. Default: the middle of each scene, because a scene's midpoint is
 * where its animation is in flight — start and end frames are often clamped and
 * would agree even in a broken render.
 */
let frames;
const framesFlag = flag("--frames");
if (framesFlag) {
  frames = framesFlag.split(",").map((s) => Number(s.trim()));
} else {
  // Recompute the timeline the same way the composition does.
  const bundled = path.join(tmpdir(), `h2v-tl-${process.pid}.mjs`);
  const probe = path.join(tmpdir(), `h2v-tl-${process.pid}.ts`);
  // parseStoryboard first, exactly as calculateMetadata does. The staged board is
  // raw JSON with zod defaults NOT yet applied, so a scene that omitted `callouts`
  // has it undefined and resolveTimeline would throw. Going through the same parse
  // keeps the probe faithful to what actually renders.
  writeFileSync(
    probe,
    `import { resolveTimeline } from ${JSON.stringify(path.join(STUDIO, "src/lib/timeline"))};
     import { parseStoryboard } from ${JSON.stringify(path.join(STUDIO, "src/schema/storyboard"))};
     const sb = parseStoryboard(${JSON.stringify(sb)});
     const tl = resolveTimeline(sb);
     console.log(JSON.stringify(tl.scenes.map((s) => s.from + Math.floor(s.frames / 2))));`,
    "utf8",
  );
  execFileSync(path.join(STUDIO, "node_modules/.bin/esbuild"), [
    probe, "--bundle", "--platform=node", "--format=esm", `--outfile=${bundled}`, "--log-level=error",
  ], { cwd: STUDIO });
  const out = execFileSync("node", [bundled], { encoding: "utf8" });
  frames = JSON.parse(out.trim());
  rmSync(probe, { force: true });
  rmSync(bundled, { force: true });

  const limit = Number(flag("--probes", "6"));
  if (frames.length > limit) {
    // Spread the probes evenly rather than taking the first N, so late scenes are
    // covered too — a font race tends to show up early, a leak late.
    const step = (frames.length - 1) / (limit - 1);
    frames = Array.from({ length: limit }, (_, i) => frames[Math.round(i * step)]);
  }
}

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const still = (frame, tag) => {
  const out = path.join(tmpdir(), `h2v-det-${frame}-${tag}.png`);
  const r = spawnSync("npx", [
    "remotion", "still", "src/index.ts", "Html2Video", out,
    `--frame=${frame}`, "--props", propsPath,
  ], { cwd: STUDIO, encoding: "utf8" });
  if (r.status !== 0) {
    console.error(`  render of frame ${frame} (${tag}) failed:\n${(r.stderr || "").slice(-800)}`);
    process.exit(1);
  }
  return out;
};

console.log(`\nprobing ${frames.length} frame(s) twice, in separate processes: ${frames.join(", ")}\n`);

let mismatches = 0;
for (const frame of frames) {
  const a = still(frame, "a");
  const b = still(frame, "b");
  const ha = sha(a);
  const hb = sha(b);
  const ok = ha === hb;
  if (!ok) mismatches++;
  console.log(`  frame ${String(frame).padStart(5)}  ${ok ? "match" : "MISMATCH"}  ${ha.slice(0, 16)}${ok ? "" : ` vs ${hb.slice(0, 16)}`}`);
  if (ok) {
    rmSync(a, { force: true });
    rmSync(b, { force: true });
  } else {
    console.log(`    kept for inspection: ${a}\n                         ${b}`);
  }
}

if (mismatches) {
  console.log(
    `\n${mismatches} frame(s) differ between processes — this render is NOT reproducible.\n` +
      `Look for: Math.random or a clock read outside lib/sandbox.ts, a font loaded without\n` +
      `going through waitForFonts, useState/useEffect driving something visual, or\n` +
      `Intl.Segmenter enabled for layout.\n`,
  );
  process.exit(1);
}
console.log(`\ndeterminism: PASS — all ${frames.length} probes byte-identical across processes\n`);

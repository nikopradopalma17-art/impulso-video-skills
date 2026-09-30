/**
 * Validate a storyboard before spending minutes on a render.
 *
 * Runs the same code the composition runs — parseStoryboard, resolveTimeline, the
 * resolution guard and the shimmer cap — so a pass here means calculateMetadata
 * will pass too. What it CANNOT check is anything requiring a browser: text
 * fitting needs measureText, so line-count overflow only surfaces at render time.
 *
 * Usage: validate-storyboard.ts <storyboard.json> [--public DIR]
 */

import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  SIDE_SLOT_TEXT_WIDTH,
  SLOT_PX,
  TEXT_BOX,
  TYPE,
  maxZoomRatio,
} from "../src/lib/design";
import {
  containSize,
  requiredSourcePx,
  resolveMove,
  zoomRatio,
  type Move,
} from "../src/lib/move";
import { LADDER } from "../src/lib/type/fit-cjk";
import { parseStoryboard } from "../src/schema/storyboard";
import { resolveTimeline, TimelineOverflowError, readingUnits } from "../src/lib/timeline";

const argv = process.argv.slice(2);
const file = argv[0];
if (!file) {
  console.error("usage: validate-storyboard.ts <storyboard.json> [--public DIR]");
  process.exit(2);
}
const pubIdx = argv.indexOf("--public");
const publicDir = pubIdx >= 0 ? argv[pubIdx + 1] : undefined;

let problems = 0;
let warnings = 0;
const fail = (m: string) => {
  problems++;
  console.log(`  FAIL  ${m}`);
};
const warn = (m: string) => {
  warnings++;
  console.log(`  warn  ${m}`);
};

const raw = JSON.parse(readFileSync(file, "utf8"));

let sb;
try {
  sb = parseStoryboard(raw);
} catch (e) {
  console.log(`\nschema:\n${(e as Error).message}\n`);
  process.exit(1);
}
console.log(`\n✓ schema valid — ${sb.scenes.length} scenes, ${sb.assets.length} assets`);

// Assets must exist on disk. A missing file becomes a delayRender timeout deep in
// the render, which is a much worse way to find out.
if (publicDir) {
  for (const a of sb.assets) {
    const p = path.resolve(publicDir, a.src);
    if (!existsSync(p)) fail(`asset "${a.id}" not found at ${p}`);
  }
  if (sb.audio.bed && !existsSync(path.resolve(publicDir, sb.audio.bed))) {
    fail(`audio.bed not found at ${path.resolve(publicDir, sb.audio.bed)}`);
  }
}

// Timeline.
let tl;
try {
  tl = resolveTimeline(sb);
} catch (e) {
  if (e instanceof TimelineOverflowError) {
    console.log(`\ntiming:\n  ${e.message}`);
    e.suggestions.forEach((s) => console.log(`  - ${s}`));
    process.exit(1);
  }
  throw e;
}

console.log(
  `\ntiming — ${(tl.durationInFrames / sb.target.fps).toFixed(2)}s ` +
    `(target ${sb.target.seconds}s, transitions ${tl.transitionFrames}f, unit ${tl.unit.toFixed(1)})`,
);
for (const w of tl.warnings) warn(w);

const off = Math.abs(tl.durationInFrames - tl.targetFrames);
if (off > sb.target.toleranceFrames) {
  warn(`runtime is ${(off / sb.target.fps).toFixed(1)}s off target`);
}

for (const [i, s] of tl.scenes.entries()) {
  const sc = sb.scenes[i]!;
  const tag = s.clampedAtCap ? "cap" : s.clampedAtFloor ? "floor" : "";
  console.log(
    `  ${s.id.padEnd(4)} ${sc.shot.padEnd(10)} ${(s.frames / sb.target.fps).toFixed(1)}s`.padEnd(28) +
      `${tag.padEnd(6)} from ${String(s.from).padStart(4)}f`,
  );
}

// Resolution + shimmer, per bound asset. Both depend on the SOLVED duration, so
// they can only be checked once timing is known.
console.log("\nassets");
const byId = new Map(sb.assets.map((a) => [a.id, a]));
for (const [i, sc] of sb.scenes.entries()) {
  const frames = tl.scenes[i]!.frames;
  for (const binding of sc.assets) {
    const asset = byId.get(binding.ref)!;
    const dest = SLOT_PX[binding.slot];
    const isContain = binding.fit === "contain";
    const need = isContain
      ? containSize(asset.intrinsic, dest)
      : requiredSourcePx(binding.move as Move, asset.intrinsic, dest);
    const resolved = resolveMove(binding.move as Move, asset.intrinsic, dest);
    // A contained figure is letterboxed, so there is no crop and no zoom to cap.
    const ratio = isContain ? 1 : zoomRatio(resolved);
    const limit = maxZoomRatio(frames, sb.target.fps);
    const headroom = asset.intrinsic.w / need.w;

    console.log(
      `  ${sc.id.padEnd(4)} ${binding.ref.padEnd(14)} ${binding.fit === "contain" ? "contain" : "cover  "} slot=${binding.slot.padEnd(6)} ` +
        `needs ${Math.ceil(need.w)}px of ${asset.intrinsic.w}px ` +
        `(${headroom.toFixed(2)}x headroom)  zoom ${ratio.toFixed(2)}x / cap ${limit}x`,
    );
    if (need.w > asset.intrinsic.w * 1.02) {
      fail(
        `${sc.id}/${binding.ref} upscales: needs ${Math.ceil(need.w)}px, source is ${asset.intrinsic.w}px`,
      );
    } else if (headroom < 1.1) {
      // Anything at or above 1.0x is still downsampling, so it is not soft — but
      // this close to parity there is no margin for a later crop tweak, and
      // rounding at the edges can tip it into upscaling.
      warn(
        `${sc.id}/${binding.ref} has only ${headroom.toFixed(2)}x pixel margin — fine now, but any tighter crop upscales`,
      );
    }
    if (ratio > limit + 1e-6) {
      fail(
        `${sc.id}/${binding.ref} zoom ${ratio.toFixed(2)}x over ${(frames / sb.target.fps).toFixed(1)}s ` +
          `exceeds the ${limit}x shimmer cap`,
      );
    }
  }
}

/**
 * Character budgets. These are geometry, not estimates: every CJK ideograph and
 * full-width mark in the Source Han lineage has a 1.000em advance, so
 * hardMax = floor(boxWidth / (px * (1 + tracking))). Checked against a
 * conservative box so this catches the egregious cases without a browser; the
 * real per-shot fit happens at render time.
 */
console.log("\ntext");
for (const sc of sb.scenes) {
  // Per-shot boxes, from the same table the shots lay out with. Assuming
  // "headline at 96px on 2 lines" for every shot was wrong both ways: it rejected
  // legal copy on `statement`/`outro` (which set the headline at 72px on 3 lines)
  // and waved through text far too long for a `figure` in a left/right slot,
  // whose real box is 800px wide rather than the full content width.
  const boxes = TEXT_BOX[sc.shot] ?? {};
  const sideSlot = sc.assets.some((a) => a.slot === "left" || a.slot === "right");

  for (const field of ["headline", "sub", "caption"] as const) {
    const text = sc.text[field];
    const box = boxes[field];
    if (!text || !box) continue;

    const spec = TYPE[box.role];
    const width = sideSlot && sc.shot === "figure" ? SIDE_SLOT_TEXT_WIDTH : box.width;

    // fitCJK walks a ladder DOWN from the nominal size, so the hard limit is set
    // by the SMALLEST rung, not the first. Judging against the top rung rejected
    // copy the renderer fits comfortably one step down.
    const ladder = LADDER[box.role as keyof typeof LADDER] ?? [spec.px];
    const smallestPx = ladder[ladder.length - 1]!;

    // Advance width, not reading effort: a CJK glyph is exactly 1.000em, Latin and
    // digits are roughly half. (readingUnits' 1/3 is a SPEED model and does not
    // apply here.)
    const emUnits = (line: string) => {
      let u = 0;
      for (const ch of line) u += /[0-9A-Za-zÀ-ɏ .,'’()\-]/.test(ch) ? 0.5 : 1;
      return u;
    };
    const perLineAt = (px: number) => Math.floor(width / (px * (1 + spec.tracking)));

    for (const [li, line] of text.split("\n").entries()) {
      const u = emUnits(line);
      const hardBudget = perLineAt(smallestPx) * box.maxLines;
      const nominalBudget = perLineAt(spec.px) * box.maxLines;
      if (u > hardBudget) {
        fail(
          `${sc.id}.${field} line ${li + 1} needs ${u.toFixed(0)} em of width; even at the ` +
            `smallest rung (${smallestPx}px) a ${width}px box holds only ` +
            `~${perLineAt(smallestPx)}/line x ${box.maxLines} lines = ${hardBudget}`,
        );
      } else if (u > nominalBudget) {
        warn(
          `${sc.id}.${field} line ${li + 1} (${u.toFixed(0)} em) will not fit at ${spec.px}px ` +
            `and will drop to a smaller rung`,
        );
      }
    }
  }
  const units = readingUnits(
    [sc.text.headline, sc.text.sub, sc.text.caption].filter(Boolean).join(""),
  );
  if (units > 0 && units < 4 && sc.shot !== "stat") {
    warn(`${sc.id} has almost no text (${units} units) — is the shot carrying its runtime?`);
  }
}

console.log(
  `\n${problems === 0 ? "PASS" : `${problems} PROBLEM(S)`}${warnings ? `, ${warnings} warning(s)` : ""}\n`,
);
process.exit(problems === 0 ? 0 : 1);

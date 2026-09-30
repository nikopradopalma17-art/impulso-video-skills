/**
 * Self-test for the two pieces of maths that are easy to get subtly wrong and
 * whose failures are hard to see in a rendered frame:
 *
 *   1. Move resolution — aspect exactness and containment, which together are
 *      what guarantee no exposed frame edge and no vertical mis-mapping.
 *   2. The duration solver — hitting the target runtime while never dropping a
 *      scene below its reading floor.
 *
 * Run: node --experimental-strip-types scripts/selftest-math.ts   (or via esbuild)
 */

import {
  aspectK,
  lerpRect,
  normalizeRectToAspect,
  requiredSourcePx,
  resolveMove,
  tightestRect,
  zoomRatio,
  type Move,
  type Rect,
} from "../src/lib/move";
import { readingUnits, resolveTimeline, TimelineOverflowError } from "../src/lib/timeline";
import type { Storyboard } from "../src/schema/storyboard";

let failures = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (ok) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
};
const approx = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;
const contained = (r: Rect) =>
  r.x >= -1e-9 &&
  r.y >= -1e-9 &&
  r.w > 0 &&
  r.h > 0 &&
  r.x + r.w <= 1 + 1e-9 &&
  r.y + r.h <= 1 + 1e-9;

console.log("\n1. move resolution");

// The real assets from the reference article, so the test exercises real ratios.
const wide = { w: 4620, h: 1410 }; // architecture diagram
const tall = { w: 2688, h: 1709 };
const small = { w: 1590, h: 1170 }; // the couplet figure
const fullSlot = { w: 1920, h: 1080 };
const insetSlot = { w: 1240, h: 698 };

const cases: { name: string; move: Move; intrinsic: { w: number; h: number }; dest: { w: number; h: number } }[] = [
  {
    name: "push-in on a tall figure",
    move: { kind: "push-in", target: { x: 0.14, y: 0.2, w: 0.62, h: 0.58 }, amount: 1.14 },
    intrinsic: tall,
    dest: fullSlot,
  },
  {
    name: "pan across an ultra-wide diagram",
    move: { kind: "pan", from: { x: 0, y: 0, w: 0.46, h: 1 }, to: { x: 0.54, y: 0, w: 0.46, h: 1 } },
    intrinsic: wide,
    dest: fullSlot,
  },
  {
    name: "pull-out from a corner (clamping matters here)",
    move: { kind: "pull-out", target: { x: 0.0, y: 0.0, w: 0.3, h: 0.3 }, amount: 1.5 },
    intrinsic: tall,
    dest: fullSlot,
  },
  {
    name: "hold on a small figure into an inset slot",
    move: { kind: "hold", target: { x: 0.05, y: 0.1, w: 0.9, h: 0.62 } },
    intrinsic: small,
    dest: insetSlot,
  },
  {
    name: "degenerate: target already wider than the unit square allows",
    move: { kind: "push-in", target: { x: 0, y: 0, w: 1, h: 1 }, amount: 1.4 },
    intrinsic: wide,
    dest: fullSlot,
  },
];

for (const c of cases) {
  const k = aspectK(c.intrinsic, c.dest);
  const r = resolveMove(c.move, c.intrinsic, c.dest);
  check(`${c.name}: endpoints contained`, contained(r.from) && contained(r.to),
    `from=${JSON.stringify(r.from)} to=${JSON.stringify(r.to)}`);
  check(`${c.name}: endpoints aspect-exact`,
    approx(r.from.w / r.from.h, k, 1e-6) && approx(r.to.w / r.to.h, k, 1e-6),
    `k=${k} fromRatio=${r.from.w / r.from.h} toRatio=${r.to.w / r.to.h}`);

  // The property the whole design rests on: containment and aspect hold for
  // EVERY interpolated frame, not just the endpoints.
  let allContained = true;
  let allAspect = true;
  for (let i = 0; i <= 40; i++) {
    const V = lerpRect(r.from, r.to, i / 40);
    if (!contained(V)) allContained = false;
    if (!approx(V.w / V.h, k, 1e-6)) allAspect = false;
  }
  check(`${c.name}: contained ∀t`, allContained);
  check(`${c.name}: aspect-exact ∀t`, allAspect);

  // scale must never exceed 1, i.e. we only ever downsample.
  const tight = tightestRect(r);
  let maxScale = 0;
  for (let i = 0; i <= 40; i++) {
    const V = lerpRect(r.from, r.to, i / 40);
    maxScale = Math.max(maxScale, tight.w / V.w);
  }
  check(`${c.name}: scale <= 1 (never upscales)`, maxScale <= 1 + 1e-9, `maxScale=${maxScale}`);
}

// The resolution guard must actually fire on the known-bad real case: the
// 1590x1170 couplet figure cannot fill a 1920-wide slot at a 0.55 crop.
{
  const move: Move = { kind: "push-in", target: { x: 0.36, y: 0.3, w: 0.55, h: 0.5 }, amount: 1.16 };
  const need = requiredSourcePx(move, small, fullSlot);
  check("resolution guard catches the real 1590px couplet figure at slot:full",
    need.w > small.w, `needs ${Math.ceil(need.w)}px, source ${small.w}px`);
  const needInset = requiredSourcePx(move, small, insetSlot);
  check("…and still catches it at slot:inset",
    needInset.w > small.w, `needs ${Math.ceil(needInset.w)}px, source ${small.w}px`);
}

// normalizeRectToAspect must grow, not shrink, the author's region of interest.
{
  const k = aspectK(tall, fullSlot);
  const r: Rect = { x: 0.3, y: 0.3, w: 0.2, h: 0.4 };
  const n = normalizeRectToAspect(r, k);
  check("normalise grows the deficient axis", n.w >= r.w - 1e-9 || n.h >= r.h - 1e-9);
  check("normalise stays contained", contained(n));
}

// zoomRatio should report the real range so the shimmer cap can act on it.
{
  const r = resolveMove(
    { kind: "push-in", target: { x: 0.25, y: 0.25, w: 0.5, h: 0.5 }, amount: 1.5 },
    tall, fullSlot,
  );
  check("zoomRatio > 1 for a push-in", zoomRatio(r) > 1.0001, `ratio=${zoomRatio(r)}`);
}

console.log("\n2. reading units");
check("CJK counted per character", readingUnits("我们能读出模型的每一个数字") === 13,
  `got ${readingUnits("我们能读出模型的每一个数字")}`);
check("Latin run discounted to a third", readingUnits("rabbit") === 2,
  `got ${readingUnits("rabbit")}`);
check("newlines are free", readingUnits("上下文里\n没有这句话") === 9,
  `got ${readingUnits("上下文里\n没有这句话")}`);

console.log("\n3. duration solver");

const scene = (
  id: string,
  shot: string,
  weight: number,
  text: Record<string, unknown>,
  transitionOut: Record<string, unknown> = { kind: "fade", frames: 12, timing: "linear" },
  callouts: unknown[] = [],
) => ({
  id, shot, weight, text, assets: [], callouts, emphasis: [], transitionOut,
}) as unknown as Storyboard["scenes"][number];

const baseSb = (scenes: Storyboard["scenes"], seconds: number): Storyboard =>
  ({
    version: 1,
    meta: {
      sourceUrl: "https://example.com/a", sourceTitle: "t", author: "", publishedAt: "",
      lang: "zh-Hans", coreMessage: "核心", arc: "claim-evidence-implication",
    },
    target: { fps: 30, width: 1920, height: 1080, seconds, toleranceFrames: 30 },
    art: {
      ground: "paper", groundColor: "#F0EEE6", ink: "#141413", inkMuted: "#6B6862",
      accent: "#CC785C", radius: 2, ruleWidth: 1, texture: "paper",
      displayFace: "serif", sourceLabel: "example.com",
    },
    motion: {
      seed: "https://example.com/a", pace: "measured", easeFamily: "editorial",
      panBias: "ltr", revealStyle: "mask-up", transitionVocab: ["cut", "fade"], gridEnergy: 0.22,
    },
    audio: { mode: "music", bed: "audio/bed.m4a", bedGain: 0.32, duckTo: 0.12 },
    assets: [],
    scenes,
  }) as unknown as Storyboard;

// A nine-scene board shaped like the reference article.
const scenes9 = [
  scene("s1", "title", 1.0, { eyebrow: "可解释性", headline: "把思维翻译成人话", sub: "Natural Language Autoencoders" }),
  scene("s2", "statement", 1.1, { eyebrow: "问题", headline: "我们能读出模型的每一个数字，\n却读不懂它在想什么。" }, { kind: "wipe", frames: 14, timing: "linear" }),
  scene("s3", "figure", 1.8, { headline: "写第一句时，它已经想好了第二句押什么韵", caption: "NLA 的解释显示，Opus 4.6 提前规划了用 rabbit 收尾。" }, { kind: "cut", frames: 0, timing: "linear" }),
  scene("s4", "diagram", 3.0, { eyebrow: "机制", headline: "两个模型，一个说，一个猜" }, { kind: "slide", frames: 14, timing: "linear" },
    [{ at: 0.14, text: "AV：把激活翻译成一段文字", anchor: { x: 0.16, y: 0.42 } },
     { at: 0.46, text: "AR：只看文字，反推原始激活", anchor: { x: 0.52, y: 0.42 } },
     { at: 0.76, text: "对得上，说明这句人话是真的", anchor: { x: 0.86, y: 0.42 } }]),
  scene("s5", "compare", 2.0, { headline: "重建出来的激活，对得上原始激活", items: [{ label: "原始", text: "目标激活" }, { label: "重建", text: "AR 反推结果" }] }, { kind: "cut", frames: 0, timing: "linear" }),
  scene("s6", "caveat", 1.6, { eyebrow: "但是", headline: "NLA 也会编造", sub: "解释可以完全通顺，\n却和真实上下文毫无关系。" }, { kind: "fade", frames: 10, timing: "linear" }),
  scene("s7", "figure", 1.7, { headline: "上下文里从来没有这句话", caption: "NLA 声称上下文包含「Wearing my white jacket」——实际并没有。" }, { kind: "fade", frames: 14, timing: "linear" }),
  scene("s8", "ladder", 2.0, { eyebrow: "所以", headline: "这条路给了我们三样东西", items: [{ label: "01", text: "解释是人话，不用再训探针" }, { label: "02", text: "重建能当作真伪的检验" }, { label: "03", text: "但通顺不等于可信" }] }, { kind: "fade", frames: 16, timing: "linear" }),
  scene("s9", "outro", 1.2, { headline: "让模型说出自己在想什么，\n再检验它有没有编造。", credit: "anthropic.com/research/natural-language-autoencoders" }, { kind: "cut", frames: 0, timing: "linear" }),
] as Storyboard["scenes"];

{
  const sb = baseSb(scenes9, 85);
  const tl = resolveTimeline(sb);
  const targetFrames = 85 * 30;
  check("lands on the target runtime",
    Math.abs(tl.durationInFrames - targetFrames) <= sb.target.toleranceFrames,
    `got ${tl.durationInFrames}f (${(tl.durationInFrames / 30).toFixed(2)}s), target ${targetFrames}f`);
  check("every scene is at or above its reading floor",
    tl.scenes.every((s) => s.frames >= s.floor),
    tl.scenes.filter((s) => s.frames < s.floor).map((s) => s.id).join(","));
  check("no scene exceeds its cap", tl.scenes.every((s) => s.frames <= s.cap));
  check("Σframes − Σtransitions === durationInFrames",
    tl.scenes.reduce((a, s) => a + s.frames, 0) - tl.transitionFrames === tl.durationInFrames);
  check("scene starts are monotonic and non-overlapping beyond the transition",
    tl.scenes.every((s, i) => i === 0 || s.from >= tl.scenes[i - 1]!.from));
  check("the diagram scene got the most time (3 callouts)",
    tl.scenes.find((s) => s.id === "s4")!.frames === Math.max(...tl.scenes.map((s) => s.frames)));
  console.log(`     runtime ${(tl.durationInFrames / 30).toFixed(2)}s, unit=${tl.unit.toFixed(1)}, transitions=${tl.transitionFrames}f`);
  console.log("     " + tl.scenes.map((s) => `${s.id}:${(s.frames / 30).toFixed(1)}s${s.clampedAtCap ? "(cap)" : s.clampedAtFloor ? "(floor)" : ""}`).join("  "));
}

// The important negative case: floors that cannot fit must FAIL, not squeeze.
{
  const sb = baseSb(scenes9, 45);
  let threw: TimelineOverflowError | null = null;
  try {
    resolveTimeline(sb);
  } catch (e) {
    if (e instanceof TimelineOverflowError) threw = e;
  }
  check("refuses to squeeze below the floor when the target is too short", threw !== null);
  if (threw) {
    check("…and the failure carries actionable editorial advice", threw.suggestions.length > 0);
    console.log(`     ${threw.message.split("\n")[0]}`);
    threw.suggestions.forEach((s) => console.log(`     - ${s}`));
  }
}

// A target beyond what the per-shot caps can carry must degrade gracefully and
// SAY SO, rather than silently stretching shots until they drag.
{
  const sb = baseSb(scenes9, 130);
  const tl = resolveTimeline(sb);
  check("an unreachable target reports a shortfall instead of dragging",
    tl.shortfallFrames > 0 && tl.warnings.length > 0,
    `shortfall=${tl.shortfallFrames}f warnings=${tl.warnings.length}`);
  check("…and still respects every cap", tl.scenes.every((s) => s.frames <= s.cap));
  console.log(`     ${tl.warnings[0]}`);
}

// A moderately generous target should be met by the solver.
{
  const sb = baseSb(scenes9, 95);
  const tl = resolveTimeline(sb);
  check("a moderately generous target is met",
    Math.abs(tl.durationInFrames - 95 * 30) <= sb.target.toleranceFrames,
    `got ${(tl.durationInFrames / 30).toFixed(2)}s`);
}

console.log(`\n${failures === 0 ? "ALL PASSED" : `${failures} FAILURE(S)`}\n`);
process.exit(failures === 0 ? 0 : 1);

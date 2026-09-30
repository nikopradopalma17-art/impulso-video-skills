/**
 * Generate the 口播稿 — a narration script a person can actually record against.
 *
 * The script is only useful if its timings ARE the video's timings, so this calls
 * the same resolveTimeline the composition calls, with the same speech estimator.
 * A script whose pacing does not match the cut is worse than no script: the
 * speaker only discovers the mismatch after recording.
 *
 * Usage: make-script.ts <storyboard.json> [--out FILE] [--sps 4.3]
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseStoryboard } from "../src/schema/storyboard";
import { resolveTimeline } from "../src/lib/timeline";
import {
  DEFAULT_SPEECH_SPS,
  charsPerMinute,
  estimateSpeechSeconds,
  syllables,
} from "../src/lib/speech";

const argv = process.argv.slice(2);
const file = argv[0];
if (!file) {
  console.error("usage: make-script.ts <storyboard.json> [--out FILE] [--sps 4.3]");
  process.exit(2);
}
const flag = (n: string, d?: string) => {
  const i = argv.indexOf(n);
  return i >= 0 ? argv[i + 1] : d;
};
const sps = Number(flag("--sps", String(DEFAULT_SPEECH_SPS)));
const outPath = path.resolve(
  flag("--out", path.join(path.dirname(path.resolve(file)), "narration.md"))!,
);

const sb = parseStoryboard(JSON.parse(readFileSync(file, "utf8")));
if (sb.audio.mode !== "voice") {
  console.error(
    `this storyboard has audio.mode "${sb.audio.mode}". Set it to "voice" and give every ` +
      `scene a \`narration\` line — otherwise the cut is timed for reading rather than for ` +
      `speech, and the script will not match the video.`,
  );
  process.exit(1);
}

const tl = resolveTimeline(sb);
const fps = sb.target.fps;

const mmss = (frames: number) => {
  const t = frames / fps;
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
};

/** What the viewer is looking at, so the speaker knows what they are describing. */
const onScreen = (scene: (typeof sb.scenes)[number]): string[] => {
  const t = scene.text;
  const bits: string[] = [];
  if (t.eyebrow) bits.push(`眉标「${t.eyebrow}」`);
  if (t.stat) bits.push(`大数字「${t.stat.value}${t.stat.unit ?? ""}」／${t.stat.of}`);
  if (t.headline) bits.push(`标题「${t.headline.replace(/\n/g, " / ")}」`);
  if (t.sub) bits.push(`副文「${t.sub.replace(/\n/g, " / ")}」`);
  if (t.caption) bits.push(`图注「${t.caption}」`);
  for (const it of t.items ?? []) bits.push(`条目 ${it.label} ${it.text}`);
  for (const c of scene.callouts) bits.push(`标注「${c.text}」`);
  if (t.credit) bits.push(`出处 ${t.credit}`);
  for (const a of scene.assets) {
    bits.push(`图 ${a.ref}（${a.slot}${a.fit === "contain" ? "，整图" : ""}）`);
  }
  return bits;
};

const cjkCount = (s: string) => Array.from(s.replace(/\s/g, "")).length;
const totalChars = sb.scenes.reduce((a, s) => a + cjkCount(s.narration ?? ""), 0);
const totalSyl = sb.scenes.reduce((a, s) => a + syllables(s.narration ?? ""), 0);

const lines: string[] = [];
const P = (s = "") => lines.push(s);

P(`# 口播稿 · ${sb.meta.sourceTitle}`);
P();
P(`- 来源 ${sb.meta.sourceUrl}`);
P(
  `- 成片 **${(tl.durationInFrames / fps).toFixed(1)}s** · ${sb.scenes.length} 个镜头 · ` +
    `${sb.target.width}x${sb.target.height}`,
);
P(`- 全文 **${totalChars} 字**（${totalSyl} 音节）`);
P(`- 语速假设 **${sps} 音节/秒**（约 ${charsPerMinute(sps)} 字/分钟）`);
P();
P(`## 录制须知`);
P();
P(`1. 画面已按上面的语速排好，**每一场的时长就是这一场旁白的预算**。念快了留白，念慢了会压到下一场。`);
P(`2. 时间码是给你分段重录用的，不必一条过。`);
P(`3. 「画面」一栏是那一刻屏幕上的东西 —— **不要把它念出来**。观众已经在读标题了，`);
P(`   再念一遍是双重呈现，两边都记不住。旁白负责讲字面之外的：为什么、所以呢、怎么来的。`);
P(`4. 估算误差约 ±15%。若你的语速明显不同，用 \`--sps\` 重新生成，画面会跟着重排。`);
P();
P(`---`);
P();

const overruns: string[] = [];

sb.scenes.forEach((scene, i) => {
  const timing = tl.scenes[i]!;
  const spoken = estimateSpeechSeconds(scene.narration ?? "", sps);
  const slack = timing.frames / fps - spoken;

  // End the displayed window at the NEXT scene's start, not at this scene's own
  // end. Those differ by the transition length, because a cross-dissolve overlaps
  // the two scenes — and printing the raw end makes consecutive ranges overlap,
  // which is confusing to read off while recording. The speaker wants contiguous,
  // exclusive windows.
  const next = tl.scenes[i + 1];
  const windowEnd = next ? next.from : timing.from + timing.frames;

  P(
    `## ${String(i + 1).padStart(2, "0")} · ${mmss(timing.from)}–` +
      `${mmss(windowEnd)} · ${scene.shot}`,
  );
  P();
  P(`**画面** ${onScreen(scene).join("；") || "（纯文字）"}`);
  P();
  P(
    `**时长** ${(timing.frames / fps).toFixed(1)}s = 旁白约 ${spoken.toFixed(1)}s ` +
      `+ 余量 ${slack.toFixed(1)}s · ${syllables(scene.narration ?? "")} 音节`,
  );
  P();
  // Blockquote so the line to read is visually separable from its metadata, and a
  // hard newline in the narration is preserved as a breath break.
  for (const part of (scene.narration ?? "").split("\n")) {
    P(`> ${part.trim()}`);
  }
  P();
  if (slack < 0.2) {
    overruns.push(`${scene.id}（余量 ${slack.toFixed(1)}s）`);
    P(`> ⚠️ 这一场几乎没有余量：念的时候别停顿，或者把旁白砍掉几个字。`);
    P();
  }
  P(`---`);
  P();
});

// A continuous version, because nobody records off a table with metadata between
// every line.
P(`## 连读版（提词器用）`);
P();
P(`> 去掉一切标注的纯旁白，顺序与画面一致。每个空行是一次换场停顿。`);
P();
for (const scene of sb.scenes) {
  for (const part of (scene.narration ?? "").split("\n")) P(part.trim());
  P();
}

if (tl.warnings.length) {
  P(`---`);
  P();
  P(`## 时间轴提示`);
  P();
  for (const w of tl.warnings) P(`- ${w}`);
  P();
}

writeFileSync(outPath, lines.join("\n"), "utf8");

console.log(`\n${outPath}`);
console.log(
  `  ${(tl.durationInFrames / fps).toFixed(1)}s · ${sb.scenes.length} 镜头 · ` +
    `${totalChars} 字 · ${sps} 音节/秒（约 ${charsPerMinute(sps)} 字/分钟）`,
);
if (overruns.length) console.log(`  ⚠️ 余量不足：${overruns.join("、")}`);
for (const w of tl.warnings) console.log(`  warn  ${w}`);
console.log();

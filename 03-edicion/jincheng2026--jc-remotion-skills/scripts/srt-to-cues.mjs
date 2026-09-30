// SRT → subtitles-<片名>.ts 草稿生成器（素材接入第 0 步的机械转换）。
// 用法：node scripts/srt-to-cues.mjs <输入.srt> <片名>  [输出路径]
//   默认输出 src/koubo/subtitles-<片名>.ts；目标已存在则拒绝覆盖（防误清已精修数据）。
// 只做机械转换：SRT cue 原文照搬进 zh、en 留空、时间戳转秒。
// 产出是「草稿」：语义重排（≤16 全角字、字符占比内插）、错字校对、英文翻译
// 由装配会话按 references/subtitle.md 规则 2/3 完成，最后 node scripts/check-subs.mjs 校验。
import fs from 'node:fs';
import path from 'node:path';

const [, , srtPath, name, outArg] = process.argv;
if (!srtPath || !name) {
  console.error('用法: node scripts/srt-to-cues.mjs <输入.srt> <片名> [输出路径]');
  process.exit(1);
}
const outPath = outArg ?? path.join('src/koubo', `subtitles-${name}.ts`);
if (fs.existsSync(outPath)) {
  console.error(`拒绝覆盖已存在的 ${outPath}（如确要重生成，先手动移走旧文件）`);
  process.exit(1);
}

const raw = fs.readFileSync(srtPath, 'utf8').replace(/^﻿/, '').replace(/\r/g, '');
const toSec = (t) => {
  const m = t.match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
};
const cues = [];
for (const block of raw.split(/\n\n+/)) {
  const lines = block.trim().split('\n');
  const ti = lines.findIndex((l) => l.includes('-->'));
  if (ti < 0) continue;
  const [a, b] = lines[ti].split('-->');
  const text = lines.slice(ti + 1).join(' ').trim();
  if (!text) continue;
  cues.push({ start: toSec(a), end: toSec(b), zh: text });
}
if (!cues.length) {
  console.error(`ERROR: ${srtPath} 未解析出任何 cue`);
  process.exit(1);
}
// 时间轴健全性：单调、start<end
for (let i = 0; i < cues.length; i++) {
  const c = cues[i];
  if (c.end <= c.start) console.warn(`WARN: cue#${i + 1} end<=start (${c.start}→${c.end})`);
  if (i && c.start < cues[i - 1].start) console.warn(`WARN: cue#${i + 1} 时间倒序`);
}
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const body = cues
  .map((c) => `  { start: ${+c.start.toFixed(3)}, end: ${+c.end.toFixed(3)}, zh: '${esc(c.zh)}', en: '' },`)
  .join('\n');
const header = `// 草稿（scripts/srt-to-cues.mjs 机械转换自 SRT，未精修）：zh 为 SRT 原文、en 为空。
// 装配前必须完成：① 语义重排 ≤16 全角字 + 时间按字符占比内插 ② 错字校对（以口播为准）
// ③ 英文逐条独立成句 —— 规范见 remotion-assembly references/subtitle.md 规则 2/3；
// 完成后 node scripts/check-subs.mjs ${outPath} 零报错才装配。
export type Cue = { start: number; end: number; zh: string; en: string };
export const CUES: Cue[] = [
`;
fs.writeFileSync(outPath, header + body + '\n];\n');
const last = cues[cues.length - 1];
console.log(`OK: ${cues.length} cues → ${outPath}（末条 ${last.end.toFixed(1)}s；与 ffprobe 视频时长核对）`);

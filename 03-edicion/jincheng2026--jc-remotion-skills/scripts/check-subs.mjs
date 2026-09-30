// 校验 src/koubo/subtitles-0715-01.ts 的字幕断句质量。
// 用法：node scripts/check-subs.mjs [文件路径] [--mono]
// 检查项：
//   1. 中文行宽 >16 全角字（CJK/全角标点计 1，半角字符计 0.5，空格不计）
//   2. 行首悬挂单字（以助词/后缀开头，或整行只有 1 个字）
//   3. 英文行小写开头碎片
//   4. 词内断开残留：中文行内出现孤立单个拉丁字母（如 "g 去创造"）
//   5. 时间轴：顺序、无重叠、start<end
//   6. 英文行缺失（2026-07-27 立案）：双语是默认交付形态，en 全空/大面积空 = 精修第③步没做
//
// 关于 --mono：默认拦住「英文行全空」。0727-01 就是 77/78 条 en 为空却一路通过
// check-subs 和 qc-master，成片只剩单行中文——两道闸都不查 en 是否存在。真要做
// 单语片就显式传 --mono，把「这是决定」和「这是漏做」区分开，别让沉默通过。
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const MONO = argv.includes('--mono');
const file = argv.find((a) => !a.startsWith('--')) ?? path.join(process.cwd(), 'src/koubo/subtitles-0715-01.ts');
const src = fs.readFileSync(file, 'utf8');

const re = /\{ start: ([\d.]+), end: ([\d.]+), zh: '((?:\\.|[^'\\])*)', en: '((?:\\.|[^'\\])*)' \}/g;
const cues = [];
let m;
while ((m = re.exec(src))) {
  cues.push({
    start: +m[1],
    end: +m[2],
    zh: m[3].replace(/\\'/g, "'").replace(/\\\\/g, '\\'),
    en: m[4].replace(/\\'/g, "'").replace(/\\\\/g, '\\'),
  });
}
if (cues.length === 0) {
  console.error(`ERROR: no cues parsed from ${file}`);
  process.exit(1);
}

const isFullWidth = (ch) => /[⺀-鿿豈-﫿＀-￯　-〿]/.test(ch);
const width = (s) =>
  [...s].reduce((w, ch) => (ch === ' ' ? w : w + (isFullWidth(ch) ? 1 : 0.5)), 0);

const HANGING = new Set([...'的地得了着过呢吧吗啊嘛呀哦哟们']);
const MAX_WIDTH = 16;

const problems = [];
let maxW = 0;
for (let i = 0; i < cues.length; i++) {
  const c = cues[i];
  const w = width(c.zh);
  maxW = Math.max(maxW, w);
  const tag = `#${i + 1} [${c.start}-${c.end}]`;

  if (w > MAX_WIDTH) problems.push(`${tag} 超宽 ${w} 字: "${c.zh}"`);
  const zhTrim = c.zh.trim();
  if (HANGING.has(zhTrim[0])) problems.push(`${tag} 行首悬挂单字 "${zhTrim[0]}": "${c.zh}"`);
  if ([...zhTrim].length === 1) problems.push(`${tag} 整行仅 1 字: "${c.zh}"`);
  if (/^[a-z]/.test(c.en.trim())) problems.push(`${tag} 英文小写开头碎片: "${c.en}"`);
  if (/(?:^|[^A-Za-z])[A-Za-z](?:[^A-Za-z]|$)/.test(zhTrim))
    problems.push(`${tag} 中文行含孤立拉丁字母（疑似词内断开）: "${c.zh}"`);

  if (!(c.end > c.start)) problems.push(`${tag} 时间非法 start>=end`);
  if (i > 0 && c.start < cues[i - 1].end - 1e-9)
    problems.push(`${tag} 与上一条重叠 (prev end ${cues[i - 1].end})`);
}

// 英文行覆盖率（检查项 6）。历史片实测：0715-01/0721-0x/0722-01/0724-01 六片 en 全填，
// 双语是常态；空的只有早期 0715-02 和漏做第③步的 0727-01。
// ⚠️ 阈值修订（2026-07-27 对抗式审查）：初版是「覆盖率 <90% 才拦」，方向反了——
//    91% 放行意味着 78 条里 7 条空，成片上字幕一会儿两行一会儿一行地跳，
//    **比统一的单语更难看**。全空至少是一致的，零星缺失是失误感。
//    故非 --mono 一律要求全填；真要单语传 --mono，把「决定」和「漏做」分开。
const enFilled = cues.filter((c) => c.en.trim()).length;
if (!MONO) {
  if (enFilled === 0) {
    problems.push(
      `英文行全空（0/${cues.length}）：字幕精修第③步「英文逐条独立成句」未做，成片会退化成单行中文。` +
        `确属单语片请显式加 --mono`,
    );
  } else if (enFilled < cues.length) {
    const missing = cues
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => !c.en.trim())
      .slice(0, 5)
      .map(({ c, i }) => `#${i + 1} "${c.zh}"`);
    const rest = cues.length - enFilled - missing.length;
    problems.push(
      `英文行缺 ${cues.length - enFilled} 条（${enFilled}/${cues.length} 已填）：` +
        `${missing.join('、')}${rest > 0 ? ` 等 ${rest} 条` : ''}。` +
        `零星缺失比全空更糟——成片上字幕会在双行/单行之间跳动，读作失误`,
    );
  }
}

console.log(`文件: ${file}`);
console.log(`cue 总数: ${cues.length}`);
console.log(`英文行: ${enFilled}/${cues.length} 已填${MONO ? '（--mono 单语模式，不校验）' : ''}`);
console.log(`时间范围: ${cues[0].start}s - ${cues[cues.length - 1].end}s`);
console.log(`最大行宽: ${maxW} 全角字（上限 ${MAX_WIDTH}）`);
console.log(`平均行宽: ${(cues.reduce((s, c) => s + width(c.zh), 0) / cues.length).toFixed(1)} 全角字`);
console.log(`问题数: ${problems.length}`);
for (const p of problems) console.log('  - ' + p);
process.exit(problems.length ? 1 : 0);

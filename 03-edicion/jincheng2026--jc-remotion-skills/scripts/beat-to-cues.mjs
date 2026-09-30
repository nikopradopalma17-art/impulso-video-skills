// 装配方案 beat 表 → 音效 cue 表草稿生成器（提速纪律⑧a「音效支线前置」的脚本化落地）。
// 用法：node scripts/beat-to-cues.mjs <片名> [--in <方案.md>] [--out <输出.ts>]
//   默认输入 assembly/<片名>/装配方案.md（也接受分段工坊 segments.md 类表格）；
//   默认输出 src/koubo/sfx-<片名>.ts；目标已存在则拒绝覆盖（防误清已定稿 cue 表）。
// 只做机械映射：解析方案表（时间段｜口播要点｜侧标｜主 MG｜素材缺口），按「组件类型→事件
// 类型→A-G 查表」派 cue（真源 remotion-sfx SKILL §4.5），cue at 为段内均布估位——落码时
// 音效员以元素实际 enterAt 校正。产出是「草稿」：须经音效员按 sfx SKILL §4.4 审计闸校对
// 后定稿；本脚本内置 §4.4 预检报告，超线项标红但不自动删（留给音效员裁量）。
import fs from 'node:fs';
import path from 'node:path';

// ---------- 参数 ----------
const argv = process.argv.slice(2);
const name = argv.find((a) => !a.startsWith('--'));
const flag = (k) => {
  const i = argv.indexOf(k);
  return i >= 0 ? argv[i + 1] : undefined;
};
if (!name) {
  console.error('用法: node scripts/beat-to-cues.mjs <片名> [--in <方案.md>] [--out <输出.ts>]');
  process.exit(1);
}
const inPath = flag('--in') ?? path.join('assembly', name, '装配方案.md');
const outPath = flag('--out') ?? path.join('src/koubo', `sfx-${name}.ts`);
if (!fs.existsSync(inPath)) {
  console.error(`ERROR: 找不到输入 ${inPath}`);
  process.exit(1);
}
if (fs.existsSync(outPath)) {
  console.error(`拒绝覆盖已存在的 ${outPath}（防误清已定稿 cue 表；确要重生成先手动移走旧文件，或 --out 指到别处）`);
  process.exit(1);
}

// ---------- 映射表（脚本化抄录，非真源）----------
// 真源：remotion-sfx SKILL §4「A-G 配声语法」+ 扩展事件位 + §4.4 软音色裁定 + §4.5 组件映射。
// 规则变更以 sfx SKILL 为准——改语义先改 SKILL 再同步此表，勿在此单方面改。
// 命中优先级 = 数组顺序（专名在前、宽泛在后）；每个子拍只取首个命中（一事一声）。
const RULES = [
  // §4.4：咔嚓类全片 ≤1，「全片级判词」是唯一重锤候选位——专名置顶，防同拍「清场」等宽词
  // 抢中丢掉唯一 stamp 位（0731-01 S18「全片级判词升格：清场」案）
  { pos: 'D·重锤', sfx: 'stamp', vol: 0.52, re: /全片级判词/ },
  // §4.5：接管进入=whoosh（E 位默认留白，whoosh 轻档顶位，sfx §4 E 行）
  { pos: 'E·接管进入', sfx: 'whoosh', pin: 'start', re: /Takeover|接管|章首/i },
  // §4 F 行：清场/退场 = 衰减软扫，贴段尾
  { pos: 'F·清场退场', sfx: 'whoosh', pin: 'end', re: /清场|退场|蓄势|Exit/i },
  // §4.4：其余判词/章级强调/结论落定一律改软音色 pop2（软噗=份量感语义家族，§4「选声先问语义家族」）
  { pos: 'G·判词软噗', sfx: 'pop2', re: /Stamp|判词|判定行|章级强调|结论落定/ },
  // §4.5：BigNumber 滚动=C rise
  { pos: 'C·滚动', sfx: 'rise', re: /BigNumber|数字滚动|滚动/ },
  // §4 扩展位：高亮划线/划重点/判死换色 → bright（全谱唯一亮族专职声）；排 C·生长前，
  // 防「金下划线生长」类亮族拍被生长词抢派 rise（0731-01 S18 案，定稿为 bright）
  { pos: '亮·高亮', sfx: 'bright', re: /高亮|划线|划重点|划除|变色|换色|转金|转红/ },
  // §4.4 rise 条：生长/渐变类可配 rise，但「相邻生长只挑最标志 1 拍，其余留白或改 pop」——超发由审计闸标红
  { pos: 'C·生长', sfx: 'rise', re: /生长|收拢|draw-on|渐变|压底|压到底|压低/ },
  // §4 扩展位：物理撞入/坠落/挤出 → lowthud（轻档，易过重待段终审校）
  { pos: '低·物理', sfx: 'lowthud', re: /物理|撞入|坠落|砍断|挤出|砸落/ },
  // §4.5：QuoteDoc/ShotCard 显影=A glass；§4 扩展位：时间线卡/图表载体/卡组·机制装置进场 → A
  { pos: 'A·显影', sfx: 'glass', re: /显影|证据卡|截图|录屏|QuoteDoc|ShotCard|WindowCard|素材卡|成品卡|时间线卡|图表载体|表格卡|演示卡|卡组|双卡|rig|装置/ },
  // §4.5：名牌/徽章=G pop2；lockup/导航牌/标签落定归软噗族（§4.4 判词软音色裁定延伸）
  { pos: 'G·落位', sfx: 'pop2', re: /名牌|导航牌|徽章|标签|lockup|落位|落锚|HeroText|hero|大字/i },
  // §4.5：Chip/点阵格=B pop；§4 扩展位：节点点亮/数据条/判词小标注/ZeroTag → B
  { pos: 'B·点亮', sfx: 'pop', re: /chip|点阵|逐格|逐条|逐块|点亮|StepList|步骤|打字|TypeHero|逐字|逐行|标注|ZeroTag|节点|图标/i },
];

// ---------- 解析方案表 ----------
const raw = fs.readFileSync(inPath, 'utf8');
const lines = raw.replace(/\r/g, '').split('\n').filter((l) => l.trim().startsWith('|'));
const cells = (l) =>
  l
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((c) => c.trim());
let header = null;
const rows = [];
// 方案表判别 = 表头同行含「时间」列 + 「主 MG/主包装点/视觉」列。只认「时间」会被前置的
// 章节骨架表（章|时间|侧标|色）抢占 header 而报缺列退出（0731-01 覆盖率退化案根因）。
const isPlanHeader = (c) => c.some((x) => /时间/.test(x)) && c.some((x) => /主 ?MG|主包装点|视觉/.test(x));
for (const l of lines) {
  const c = cells(l);
  if (c.every((x) => /^:?-+:?$/.test(x))) continue; // 分隔行
  if (!header) {
    if (isPlanHeader(c)) header = c;
    continue;
  }
  rows.push(c);
}
if (!header) {
  console.error(`ERROR: ${inPath} 未找到同时含「时间」与「主 MG」（或 主包装点/视觉）列的方案表`);
  process.exit(1);
}
const col = (re) => header.findIndex((h) => re.test(h));
const cTime = col(/时间/);
const cId = col(/^#$|段/) >= 0 ? col(/^#$|段/) : 0;
const cMg = col(/主 ?MG|主包装点|视觉/);
const cGap = col(/素材/);
if (cMg < 0) {
  console.error(`ERROR: 方案表缺「主 MG」（或 主包装点/视觉）列，表头：${header.join(' | ')}`);
  process.exit(1);
}

const segs = [];
for (const r of rows) {
  const t = r[cTime] ?? '';
  const m = t.match(/(\d+(?:\.\d+)?)\s*[–—\-~]+\s*(\d+(?:\.\d+)?)/);
  if (!m) continue; // 无时间范围的行（beat 级单时间行也要求带范围，缺则跳过）
  segs.push({
    id: r[cId] || `S${segs.length + 1}`,
    start: +m[1],
    end: +m[2],
    mg: r[cMg] ?? '',
    gap: cGap >= 0 ? r[cGap] ?? '' : '',
  });
}
if (!segs.length) {
  console.error(`ERROR: ${inPath} 方案表未解析出任何带时间段的行`);
  process.exit(1);
}

// ---------- 逐段派 cue ----------
const cues = []; // { at, sfx, vol?, note }
for (const s of segs) {
  const events = [];
  // ★素材段：接管进入 whoosh + 素材卡显影 glass（§4.5 接管=whoosh；截图/录屏上片即 A 位显影）
  if (/★/.test(s.gap)) {
    events.push({ pos: 'E·接管进入', sfx: 'whoosh', pin: 'start', snip: '素材段接管进入' });
    events.push({ pos: 'A·显影', sfx: 'glass', pin: 'afterStart', snip: '接管素材卡显影' });
  }
  // 主 MG 拆子拍（；; → ＋ 及「+ 空格」形式的半角 + 为拍界——0731-01 方案表主用 ` + ` 或
  // `」+ ` 连拍；紧贴的 + 如「100亿+」「star+数字」后无空格、不拆），每拍首个命中规则 = 一事一声
  const beats = s.mg.split(/[；;]|→|＋|\+\s/).map((b) => b.trim()).filter(Boolean);
  for (const b of beats) {
    for (const rule of RULES) {
      if (rule.re.test(b)) {
        // ★素材段已派接管/显影的，同类不重复（批量点亮整组首记一发的同型延伸）
        if (events.some((e) => e.pin === rule.pin && rule.pin && e.sfx === rule.sfx)) break;
        events.push({ ...rule, snip: b.replace(/\s+/g, ' ').slice(0, 18) });
        break;
      }
    }
  }
  if (!events.length) {
    cues.push({ segComment: `${s.id} [${s.start}–${s.end}] 无命中——留白（留白也是语法，§4.4）` });
    continue;
  }
  // 估位：接管钉段首、清场钉段尾-1s，其余在段内均布（落码时以实际 enterAt 校正）
  const mid = events.filter((e) => !e.pin || e.pin === 'afterStart');
  const len = s.end - s.start;
  let i = 0;
  const step = mid.length > 1 ? Math.max((len - 1.4) / mid.length, 0.4) : 0;
  const segCues = [];
  for (const e of events) {
    let at;
    if (e.pin === 'start') at = s.start;
    else if (e.pin === 'end') at = Math.max(s.end - 1.0, s.start + 0.2);
    else {
      at = s.start + 0.4 + i * step;
      i++;
    }
    segCues.push({ at: +at.toFixed(2), sfx: e.sfx, vol: e.vol, note: `${s.id} ${e.snip}（${e.pos}）` });
  }
  segCues.sort((a, b) => a.at - b.at);
  segCues[0].segComment = `${s.id} [${s.start}–${s.end}]`;
  cues.push(...segCues);
}

// 相邻同音色 <2s 机械去重（如 清场 whoosh 紧接下段接管 whoosh 顶接，sfx-0721-01 定稿同款处理）
const kept = [];
let dropped = 0;
for (const c of cues) {
  if (!c.sfx) {
    kept.push(c);
    continue;
  }
  const prev = [...kept].reverse().find((k) => k.sfx);
  if (prev && prev.sfx === c.sfx && c.at - prev.at < 2.0) {
    dropped++;
    if (c.segComment) {
      // 段首注释别丢，挂到下一条
      const next = { segComment: c.segComment + `（该段 ${c.sfx} 与前 cue <2s 同音色，已去重顶接）` };
      kept.push(next);
    }
    continue;
  }
  kept.push(c);
}
const finalCues = kept;

// ---------- 写出 TS 草稿 ----------
const dur = segs[segs.length - 1].end;
const audible = finalCues.filter((c) => c.sfx);
const dist = {};
for (const c of audible) dist[c.sfx] = (dist[c.sfx] ?? 0) + 1;
const distStr = Object.entries(dist)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `${k} ${v}(${((v / audible.length) * 100).toFixed(1)}%)`)
  .join(' / ');

let ts = `// ${name} 音效 cue 表草稿 —— scripts/beat-to-cues.mjs 机械生成自 ${inPath}。
// ⚠️ 脚本生成草稿，须经音效员按 remotion-sfx SKILL §4.4 审计闸校对后定稿（超线项见生成时终端报告）。
// 映射真源：sfx SKILL §4 A-G 表 + §4.5 组件映射（脚本内 RULES 仅为抄录，规则变更以 SKILL 为准）。
// at 为段内均布估位（接管钉段首/清场钉段尾），落码时以元素实际 enterAt 校正（§4.5）。
// 音色分布：${distStr}。共 ${audible.length} 发 / ${dur.toFixed(1)}s ≈ ${(dur / audible.length).toFixed(2)}s/发。
export type SfxName = 'whoosh' | 'glass' | 'shutter' | 'pop' | 'pop2' | 'stamp' | 'rise' | 'tick2' | 'bright' | 'lowthud';
export type SfxCue = { at: number; sfx: SfxName; vol?: number };
export const SFX_CUES: SfxCue[] = [
`;
for (const c of finalCues) {
  if (c.segComment) ts += `  // ${c.segComment}\n`;
  if (!c.sfx) continue;
  const vol = c.vol != null ? `, vol: ${c.vol}` : '';
  ts += `  { at: ${c.at}, sfx: '${c.sfx}'${vol} }, // ${c.note}\n`;
}
ts += '];\n';
fs.writeFileSync(outPath, ts);
console.log(`OK: ${audible.length} cues（去重 ${dropped}）→ ${outPath}`);

// ---------- §4.4 审计闸预检（只报不删，超线留给音效员裁量）----------
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const ok = (s) => `\x1b[32m${s}\x1b[0m`;
console.log(`\n===== §4.4 审计闸预检（真源 remotion-sfx SKILL §4.4，超线项标红、不自动删）=====`);
// 密度硬下限 ≥2.5s/发
const density = dur / audible.length;
console.log(
  (density >= 2.5 ? ok('✓') : red('✗')) +
    ` 密度 ${density.toFixed(2)}s/发（硬下限 ≥2.5；目标带 3.5-5 为防吵参考线，覆盖优先）` +
    (density < 2.5 ? red(' ← 超线：先砍批量位') : '')
);
// 单音色占比 ≤35%
for (const [k, v] of Object.entries(dist)) {
  const pct = (v / audible.length) * 100;
  if (pct > 35) console.log(red(`✗ 单音色超线：${k} ${v}/${audible.length} = ${pct.toFixed(1)}% > 35%`));
}
if (!Object.entries(dist).some(([, v]) => (v / audible.length) * 100 > 35)) console.log(ok('✓') + ' 单音色占比全部 ≤35%');
// stamp ≤1（咔嚓类全片 ≤1）
const nStamp = (dist.stamp ?? 0) + (dist.shutter ?? 0);
console.log(nStamp <= 1 ? ok('✓') + ` 咔嚓类（stamp/shutter）${nStamp} 发 ≤1` : red(`✗ 咔嚓类 ${nStamp} 发 > 1：只留最高潮 1 处，其余改软音色`));
// rise ≤4-5 且禁 30s 窗 ≥2
const rises = audible.filter((c) => c.sfx === 'rise').map((c) => c.at);
console.log(rises.length <= 5 ? ok('✓') + ` rise ${rises.length} 发 ≤4-5` : red(`✗ rise ${rises.length} 发 > 5：相邻生长只挑最标志 1 拍`));
const clumps = [];
for (let i = 0; i + 1 < rises.length; i++) if (rises[i + 1] - rises[i] < 30) clumps.push(`${rises[i]}s/${rises[i + 1]}s`);
if (clumps.length) console.log(red(`✗ rise 30s 窗内 ≥2 发（局部扎堆比全片占比更致命）：${clumps.join('、')}`));
else if (rises.length > 1) console.log(ok('✓') + ' rise 无 30s 窗扎堆');
// 一事一声：同拍两 cue 错开 ≥0.1s
const tight = [];
for (let i = 0; i + 1 < audible.length; i++)
  if (audible[i + 1].at - audible[i].at < 0.1) tight.push(`${audible[i].at}s(${audible[i].sfx}/${audible[i + 1].sfx})`);
console.log(tight.length ? red(`✗ 一事一声违规（间隔 <0.1s）：${tight.join('、')}`) : ok('✓') + ' 一事一声：相邻 cue 全部 ≥0.1s');
console.log(`音色分布：${distStr}`);
console.log(`===== 预检完（草稿 ≠ 定稿：MG 覆盖判据、留白理由、音色听感由音效员按 §4.4 全项复核）=====`);

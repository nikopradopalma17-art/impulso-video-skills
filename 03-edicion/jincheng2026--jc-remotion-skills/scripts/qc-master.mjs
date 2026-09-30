// 成片自动验收（最佳实践采纳清单 A3，2026-07-16；2026-07-21 扩容 7/8/9：提速方案 v2 排队项 2，错题 #33/#34，broll 规则 12）
// 2026-08 起为唯一真源（原 qc-master.sh 已改为转发到本文件）：Node 实现跨 macOS/Windows/Linux，
// 不再依赖 dd/od/awk/stat 等 coreutils，Windows 的 PowerShell 里也能直接跑。
// 用法: node scripts/qc-master.mjs <mp4> [期望时长秒] [硬切白名单文件(每行一个秒数)] [素材段时间表]
//   素材段时间表三种写法（秒）：
//     a) 分段工坊 segments.md（自动提取含「素材段」行的时间范围列）
//     b) 区间文件：每行 起-止
//     c) 命令行列表：起-止,起-止,...
//   传入后：人物在场段冻帧=FAIL、素材接管段冻帧=WARN（素材卡本身静止属正常）；
//   并对每个素材段中点抽 1 帧到 <片名>.qc-frames/，供 LLM/人目视三查（脚本不做图像判断）。
// 输出: 同名 .qc.txt 报告；exit 0=无 FAIL / 1=有 FAIL
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const [, , IN, EXPECT_DUR, CUT_WHITELIST, BROLL_ARG] = process.argv;
if (!IN) {
  console.error('用法: node scripts/qc-master.mjs <mp4> [期望时长] [硬切白名单] [素材段时间表]');
  process.exit(2);
}
const REPORT = IN.replace(/\.mp4$/, '') + '.qc.txt';
let FAIL = 0;
let WARN = 0;
fs.writeFileSync(REPORT, '');
const log = (s) => { console.log(s); fs.appendFileSync(REPORT, s + '\n'); };
const fail = (s) => { log(`[FAIL] ${s}`); FAIL++; };
const pass = (s) => { log(`[PASS] ${s}`); };
const warn = (s) => { log(`[WARN] ${s}`); WARN++; };

// ffmpeg 的检测输出走 stderr，ffprobe 的数据走 stdout——分开取
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) { console.error(`无法执行 ${cmd}：${r.error.message}（未安装或不在 PATH）`); process.exit(2); }
  return { out: r.stdout || '', err: r.stderr || '' };
};
const ffprobe = (args) => run('ffprobe', ['-v', 'error', ...args]).out.trim();
const ffmpegErr = (args) => run('ffmpeg', args).err;

// 顶层 box 顺序探测：moov 先于 mdat = faststart（原 bash 用 dd/od 逐字节读，这里直接读 Buffer）
function firstMoovOrMdat(file) {
  let fd;
  try { fd = fs.openSync(file, 'r'); } catch { return 'unknown'; }
  try {
    const fsize = fs.fstatSync(fd).size;
    let off = 0;
    const buf = Buffer.alloc(16);
    while (off < fsize) {
      const n = fs.readSync(fd, buf, 0, 16, off);
      if (n < 8) break;
      let size = buf.readUInt32BE(0);
      const type = buf.toString('latin1', 4, 8);
      if (type === 'moov' || type === 'mdat') return type;
      if (size === 1) {
        if (n < 16) break;
        size = Number(buf.readBigUInt64BE(8));
      } else if (size === 0) {
        break;
      }
      if (size < 8) break;
      off += size;
    }
    return 'unknown';
  } finally {
    fs.closeSync(fd);
  }
}

// 素材段时间表解析 → brollIvs = [[起,止], ...]（供 8/9 使用）
let brollIvs = [];
if (BROLL_ARG) {
  let raw;
  if (fs.existsSync(BROLL_ARG)) {
    const txt = fs.readFileSync(BROLL_ARG, 'utf8');
    raw = BROLL_ARG.endsWith('.md')
      ? txt.split('\n').filter((l) => l.includes('素材段')).map((l) => l.split('|')[2] || '').join('\n')
      : txt;
  } else {
    raw = BROLL_ARG.split(',').join('\n');
  }
  brollIvs = raw.split('\n')
    .map((l) => l.replace(/[–—]/g, '-').replace(/\s/g, ''))
    .filter((l) => /^[0-9.]+-[0-9.]+$/.test(l))
    .map((l) => l.split('-').map(Number));
  if (brollIvs.length === 0) warn(`素材段时间表解析为空: ${BROLL_ARG}（8/9 将按未传处理）`);
}

log(`=== 成片验收 ${path.basename(IN)} ===`);

// 1. 解码完整性
const decodeErr = ffmpegErr(['-v', 'error', '-i', IN, '-f', 'null', '-']).split('\n').filter(Boolean).slice(0, 5).join('\n');
if (decodeErr) fail(`解码有错: ${decodeErr}`); else pass('解码完整');

// 2. 元数据断言
const META = ffprobe(['-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'csv=p=0', IN]);
const VDUR = parseFloat(ffprobe(['-select_streams', 'v:0', '-show_entries', 'stream=duration', '-of', 'csv=p=0', IN]));
const ADUR_RAW = ffprobe(['-select_streams', 'a:0', '-show_entries', 'stream=duration', '-of', 'csv=p=0', IN]);
const ADUR = ADUR_RAW ? parseFloat(ADUR_RAW) : NaN;
if (META.startsWith('1920,1080,30/1')) pass('元数据 1920x1080@30 ✓'); else fail(`元数据异常: ${META}`);
if (Number.isNaN(ADUR)) {
  warn('无音轨（片段渲染可接受，交付母带必须有）');
} else {
  const diff = Math.abs(VDUR - ADUR);
  if (diff < 0.15) pass('音画等长 ✓'); else fail(`音画时长差 ${diff.toFixed(3)}s`);
}
if (EXPECT_DUR) {
  const dd = Math.abs(VDUR - parseFloat(EXPECT_DUR));
  if (dd < 0.15) pass(`时长符合 ${EXPECT_DUR}s ✓`); else fail(`时长 ${VDUR}s ≠ 期望 ${EXPECT_DUR}s`);
}

// 3. 黑帧
const black = (ffmpegErr(['-i', IN, '-vf', 'blackdetect=d=0.1:pix_th=0.10', '-an', '-f', 'null', '-'])
  .match(/black_start:[0-9.]*/g) || []).slice(0, 10);
if (black.length) fail(`检出黑帧段: ${black.join(' ')}`); else pass('无黑帧');

// 4. 静帧（>2.5s 完全静止；MG hold 若在白名单时段可人工豁免）
const freeze25 = (ffmpegErr(['-i', IN, '-vf', 'freezedetect=n=0.0005:d=2.5', '-an', '-f', 'null', '-'])
  .match(/freeze_start: [0-9.]*/g) || []).slice(0, 10);
if (freeze25.length) warn(`静帧段（确认是否合法 hold）: ${freeze25.join(' ')}`); else pass('无长静帧');

// 5. 意外硬切（scdet 高分 = 突变；对照白名单）
const cuts = (ffmpegErr(['-i', IN, '-vf', 'scdet=t=10', '-an', '-f', 'null', '-'])
  .match(/lavfi\.scd\.time: [0-9.]+/g) || []).map((m) => parseFloat(m.split(': ')[1]));
let whitelist = [];
if (CUT_WHITELIST && fs.existsSync(CUT_WHITELIST)) {
  whitelist = fs.readFileSync(CUT_WHITELIST, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean).map(Number);
}
const unexpected = cuts.filter((t) => !whitelist.some((w) => Math.abs(t - w) < 0.3));
if (unexpected.length) {
  if (CUT_WHITELIST) fail(`白名单外硬切 @ ${unexpected.join(' ')}s`);
  else warn(`检出画面突变点（无白名单，人工确认是否预期转场）: ${unexpected.join(' ')}`);
} else {
  pass('无意外硬切');
}

// 6. 音频（有音轨时）：死寂 + 响度
if (!Number.isNaN(ADUR)) {
  const sil = (ffmpegErr(['-i', IN, '-af', 'silencedetect=noise=-40dB:d=0.6', '-vn', '-f', 'null', '-'])
    .match(/silence_start/g) || []).length;
  if (sil > 0) warn(`-40dB 以下静音段 ${sil} 处（母带不允许，片段可接受）`); else pass('无死寂段');
  const ebur = ffmpegErr(['-i', IN, '-af', 'ebur128', '-vn', '-f', 'null', '-']);
  const iLines = ebur.split('\n').filter((l) => l.includes('I:'));
  const lufs = iLines.length ? (iLines[iLines.length - 1].match(/-?[0-9.]+ LUFS/) || [])[0] : undefined;
  log(`[INFO] 综合响度: ${lufs || '未测出'}（母带目标 -16，验收 ≥-17）`);
}

// 7. 交付编码兼容（错题 #33 附注：交付版建议 -bf 0 -g 30 -movflags +faststart）
const bf = parseInt(ffprobe(['-select_streams', 'v:0', '-show_entries', 'stream=has_b_frames',
  '-of', 'default=noprint_wrappers=1:nokey=1', IN]).replace(/[^0-9]/g, ''), 10) || 0;
if (bf > 0) fail(`含 B 帧（has_b_frames=${bf}）——部分播放器 seek 解码卡顿，交付版按 -bf 0 -g 30 重编码`);
else pass('无 B 帧 ✓');
const firstBox = firstMoovOrMdat(IN);
if (firstBox === 'moov') pass('faststart（moov 在前）✓');
else if (firstBox === 'mdat') fail('非 faststart（moov 在 mdat 后）——交付版加 -movflags +faststart');
else warn('faststart 检测未果（未识别顶层 box 结构）');

// 8. 冻帧断言（错题 #33：只有 freezedetect -50dB 有噪声容差才准；md5/mpdecimate 会被压缩噪声骗）
//    人物在场段冻帧=FAIL（铺底人物应始终在动）；素材接管段冻帧=WARN（素材卡静止属正常）
const frzRaw = ffmpegErr(['-i', IN, '-vf', 'freezedetect=n=-50dB:d=0.3', '-an', '-f', 'null', '-'])
  .match(/freeze_(start|end): [0-9.]+/g) || [];
const frzPairs = [];
let pendingStart = null;
for (const m of frzRaw) {
  const v = parseFloat(m.split(': ')[1]);
  if (m.startsWith('freeze_start')) pendingStart = v;
  else if (pendingStart !== null) { frzPairs.push([pendingStart, v]); pendingStart = null; }
}
if (pendingStart !== null) frzPairs.push([pendingStart, VDUR]);
// 相邻素材段并成连续区间，跨段边界的 freeze 不误判
let merged = [];
if (brollIvs.length) {
  const sorted = [...brollIvs].sort((x, y) => x[0] - y[0]);
  for (const [a, b] of sorted) {
    const last = merged[merged.length - 1];
    if (last && a <= last[1] + 0.2) { if (b > last[1]) last[1] = b; }
    else merged.push([a, b]);
  }
}
if (frzPairs.length === 0) {
  pass('无冻帧（freezedetect -50dB/0.3s 全片零检出）');
} else {
  for (const [fs_, fe] of frzPairs) {
    const span = `${fs_.toFixed(1)}-${fe.toFixed(1)}`;
    if (merged.length === 0) {
      warn(`冻帧段 ${span}s（未传素材段时间表，人工确认是否素材接管段）`);
    } else if (merged.some(([a, b]) => fs_ >= a - 0.5 && fe <= b + 0.5)) {
      warn(`素材接管段冻帧 ${span}s（素材卡静止，属正常）`);
    } else {
      fail(`人物在场段冻帧 ${span}s（错题 #33：查铺底源是否 4K/解码卡顿，转 1080p 源重渲）`);
    }
  }
}

// 9. 素材段卡内抽帧（broll 规则 12 渲后验收闸脚本化：只抽帧落盘列清单，图像判断交给 LLM/人）
if (brollIvs.length) {
  const framesDir = IN.replace(/\.mp4$/, '') + '.qc-frames';
  fs.mkdirSync(framesDir, { recursive: true });
  for (const f of fs.readdirSync(framesDir)) {
    if (f.startsWith('broll-') && f.endsWith('.jpg')) fs.rmSync(path.join(framesDir, f));
  }
  let n = 0, miss = 0;
  for (const [a, b] of brollIvs) {
    const mid = ((a + b) / 2).toFixed(2);
    const out = path.join(framesDir, `broll-${a}-${b}s-mid${mid}.jpg`);
    run('ffmpeg', ['-v', 'error', '-ss', String(mid), '-i', IN, '-frames:v', '1', '-q:v', '2', '-y', out]);
    if (fs.existsSync(out) && fs.statSync(out).size > 0) { n++; log(`[INFO] 抽帧 ${mid}s → ${out}`); }
    else { miss++; fail(`素材段 ${a}-${b}s 抽帧失败（${mid}s 无输出）`); }
  }
  if (miss === 0) pass(`素材段抽帧 ${n} 张落盘 ${framesDir}/（目视三查：①四边铺满死区≤5% ②原片字幕/窗口chrome零残留 ③稳态不透明度=1）`);
}

log(`=== 结果: ${FAIL === 0 ? '全部通过' : '存在 FAIL'} | FAIL ${FAIL} 项 / WARN ${WARN} 项 ===`);
process.exit(FAIL > 0 ? 1 : 0);

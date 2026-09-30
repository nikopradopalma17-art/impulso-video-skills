// 常驻渲染服务（最佳实践采纳清单 C1，2026-07-16）——CJS 版
// 原 .mjs 在 Node 24 下触发 @remotion/renderer ESM 构建的 react/jsx-runtime 互操作报错，
// CJS require 走 CommonJS 构建绕开（错题候补：ESM 入口加载 renderer 报「does not provide an export named 'Fragment'」→ 换 .cjs）。
// 用法:
//   node scripts/render-service.cjs stills 150,450,810 --out previews/checkup --prefix s
//   node scripts/render-service.cjs segment 242 618 --out previews/seg/seg02.mp4
//   node scripts/render-service.cjs qc 242 618   # QC 探针跑段：只收集断言日志不出片
//   node scripts/render-service.cjs audio previews/xx/full.mp4 --out previews/xx/full-v2.mp4
//     # 音频增量出片（提速纪律⑤）：纯音效改动时只渲音频轨（wav），mux 到已渲视频上（-c:v copy 不重编视频）
//   node scripts/render-service.cjs splice 1000 1120 previews/xx/master.mp4 --out previews/xx/master-v2.mp4
//     # 段渲拼回（提速纪律⑦）：单段画面修复只渲该段帧区间，前后段从已渲全片 copy 切出后 concat 拼回。
//     # 切点纪律：尾切点自动吸附到下一关键帧（-c copy 起切必须落关键帧，官方雷区②），止帧会向外扩至「关键帧-1」；
//     # 三段走 MPEG-TS annexb 中转（SPS/PPS 带内，规避 mp4 concat 参数集失配花屏）；
//     # 音轨不参与拼接，终 mux 整条从原全片 copy 覆盖；新渲段归一化到交付参数（-bf 0 -g 30，错题 #33）。
const { bundle } = require('@remotion/bundler');
const { renderStill, renderMedia, selectComposition, openBrowser } = require('@remotion/renderer');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

// 换片可不改代码：COMP_ID=Koubo-<片名> node scripts/render-service.cjs …（默认值仍为当前片）
const COMP_ID = process.env.COMP_ID || 'Koubo-0715-01';
const ENTRY = path.resolve(process.env.RS_ENTRY || 'src/index.ts');

const [, , mode, ...rest] = process.argv;
const getFlag = (name, def) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : def;
};

// RS_HW=1 硬件编码按平台分流：macOS=VideoToolbox（required，约 3-5x 提速）；
// Windows/Linux 只有 NVIDIA+NVENC ffmpeg 才可能有（Remotion ≥4.0.484），用 if-possible
// 让 Remotion 自己探测、没有就静默回退软编——同一个开关三平台都能安全传。
const hwOpts = () => {
  if (process.platform !== 'darwin') {
    console.log('[RS_HW] 非 macOS：硬件编码按 if-possible 尝试（需 NVIDIA+NVENC ffmpeg），不可用则自动回退软编');
    return { hardwareAcceleration: 'if-possible', videoBitrate: '10M' };
  }
  return { hardwareAcceleration: 'required', videoBitrate: '10M' };
};

// 系统 Chrome 兜底路径按平台查表（内置 chrome-headless-shell 卡死时的逃生口）
const SYS_CHROME = {
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ],
  linux: ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'],
}[process.platform] || [];

// 目录体积（KB）：替代 `du -sk`（Windows 无 du）
const dirSizeKb = (dir) => {
  let bytes = 0;
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) bytes += fs.statSync(p).size;
    }
  };
  walk(dir);
  return Math.round(bytes / 1024);
};

// Studio 并发自检（2026-08-01 立，0731-01 复盘）。
// 事故：Studio 开着起全片渲 → 第 1 帧 delayRender 抓铺底视频超时 28s 直接失败；
// 关掉 Studio 仅等 2 秒就重渲 → 再次失败（资源未释放）；6 分钟后同一合成渲 50 帧正常，
// 无 Studio 时同一帧 5.9s 渲出。两次全片渲各压 8 分钟才暴露，白亏 ~16min。
// 规则本身早已存在（§0.2 末句「开着 Studio 时起渲，串行纪律不变」+ 错题 #23 并发死锁
// + 预警雷区「Studio+still 并发崩」），但写在文档括号里，读过也会漏——故改为脚本硬拦。
// 逃生门：RS_ALLOW_STUDIO=1（明知在干什么时用，例如 Studio 跑在另一台机器/另一端口）。
const assertNoStudio = () => {
  if (process.env.RS_ALLOW_STUDIO === '1') return;
  const port = process.env.RS_STUDIO_PORT || '3000';
  let busy = '';
  try {
    busy = execFileSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch { return; } // lsof 没装或无监听 → 放行，不因自检本身阻断出片
  if (!busy) return;
  const pid = (busy.split('\n')[1] || '').split(/\s+/)[1] || '?';
  console.error(
    `\n⛔ 检测到 Remotion Studio 正在 :${port} 运行（PID ${pid}），拒绝起渲。\n` +
    `   原因：Studio 与渲染争用 OffthreadVideo 解码资源，会让第 1 帧 delayRender 超时，\n` +
    `   而失败要等 28s 超时 ×N 帧才暴露——0731-01 因此白亏约 16 分钟（错题 #23 / 预警雷区）。\n` +
    `   处理：kill ${pid} 关掉 Studio，**等 ≥30 秒**让解码资源释放，再重跑本命令。\n` +
    `   （关掉后立刻重渲同样会失败，这是当时踩的第二个坑。）\n` +
    `   确知无冲突时用 RS_ALLOW_STUDIO=1 跳过本检查。\n`
  );
  process.exit(1);
};

(async () => {
  if (!mode) {
    console.log('用法: stills <帧号,帧号,…> | segment <起帧> <止帧> | qc <起帧> <止帧> | audio <已渲视频.mp4> [--out 输出.mp4] | splice <起帧> <止帧> <已渲全片.mp4> [--out 输出.mp4]');
    process.exit(1);
  }
  // audio 模式只做音频轨渲染 + mux，不起 headless 取视频帧，不受 Studio 影响 → 豁免
  if (mode !== 'audio') assertNoStudio();
  if (mode === 'audio' && !(rest[0] && fs.existsSync(path.resolve(rest[0])))) {
    console.error(`audio 模式需要已渲视频路径：找不到 ${rest[0] || '(未提供)'}`);
    process.exit(1);
  }
  if (mode === 'splice' && !(rest[2] && fs.existsSync(path.resolve(rest[2])))) {
    console.error(`splice 模式需要已渲全片路径：找不到 ${rest[2] || '(未提供)'}`);
    process.exit(1);
  }

  // ── 起跑前自检（0722-01 复盘：三类「卡死半天/代码丢失」渲前 10 秒内拦截；RS_NO_PREFLIGHT=1 跳过）──
  if (process.env.RS_NO_PREFLIGHT !== '1') {
    // ① 签名校验守护进程挂死探测（错题 #38）：compositor ffprobe 8s 无响应＝amfid/syspolicyd
    //    卡死，任何渲染都会永久挂起且 kill -9 无效，只能重启机器——别再空等半天。
    const probeBin = path.resolve('node_modules/@remotion/compositor-darwin-arm64/ffprobe');
    if (fs.existsSync(probeBin)) {
      try {
        // cwd 必须是 compositor 目录：dylib 按相对路径加载，别处执行会 dyld 报错（非挂死）
        execFileSync(probeBin, ['-version'], { timeout: 8000, stdio: 'ignore', cwd: path.dirname(probeBin) });
      } catch (e) {
        if (e.signal || e.killed) { // 只有「超时被杀」＝挂死；非零退出等其他错误交给 Remotion 自己报
          console.error('[preflight FAIL] compositor ffprobe 8s 无响应：macOS 签名校验守护进程挂死（错题 #38），渲染必永久卡住。修法＝重启机器。');
          process.exit(1);
        }
      }
    }
    // ② public/ 体积检查（错题 #37）：bundle 每次整目录复制 public/，超限必卡死在 bundling。
    try {
      const kb = dirSizeKb('public');
      if (kb > 800 * 1024) {
        console.error(`[preflight FAIL] public/ 已 ${(kb / 1024 / 1024).toFixed(1)}GB（>800MB），bundle 会卡死（错题 #37）。把非本片素材移到 ../footage-hold/ 再渲。`);
        process.exit(1);
      }
    } catch { /* du 不可用则跳过 */ }
    // ③ 渲前 git 快照（D3 代码丢失护栏的机械版）：segment/splice 产出交付物，此刻的代码状态
    //    必须可找回——工作区有改动就自动提交快照，防「改版覆盖后无备份」再发生（v5 事故）。
    if (mode === 'segment' || mode === 'splice') {
      try {
        if (execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()) {
          execFileSync('git', ['add', '-A'], { stdio: 'ignore' });
          execFileSync('git', ['commit', '--no-verify', '-m', `auto-snapshot：${mode} ${rest.slice(0, 2).join('-')} 渲前自动快照`], { stdio: 'ignore' });
          console.log('[preflight] 工作区有未提交改动 → 已自动快照提交（git log 可查、可回滚）');
        }
      } catch { console.log('[preflight] git 快照失败（git 异常），继续渲染——注意当前改动无备份'); }
    }
  }

  const t0 = Date.now();
  console.log('bundling…');
  const serveUrl = await bundle({ entryPoint: ENTRY, onProgress: () => {} });
  // RS_CHROME=<路径> 可指定 chrome 二进制：内置 chrome-headless-shell 卡死在不可 kill 的 UE
  // 状态时（openBrowser 25s 超时），用系统 Chrome 绕开，无需重启机器。打不开时自动兜底。
  let browser;
  try {
    browser = await openBrowser('chrome', {
      browserExecutable: process.env.RS_CHROME || undefined,
    });
  } catch (e) {
    const sysChrome = SYS_CHROME.find((p) => fs.existsSync(p));
    if (!process.env.RS_CHROME && sysChrome) {
      console.log('[preflight] 内置 chrome 打不开（多半 UE 卡死，错题 #38 同族）→ 自动改用系统 Chrome 重试…');
      browser = await openBrowser('chrome', { browserExecutable: sysChrome });
    } else {
      throw e;
    }
  }
  console.log(`bundle 完成 ${(Date.now() - t0) / 1000}s`);

  const qcMode = mode === 'qc';
  const inputProps = qcMode ? { qc: true } : {};
  const composition = await selectComposition({ serveUrl, id: COMP_ID, inputProps, puppeteerInstance: browser });

  const qcLines = [];
  const onBrowserLog = (log) => {
    if (log.text.startsWith('QC{')) qcLines.push(log.text.slice(2));
  };

  if (mode === 'stills') {
    const frames = rest[0].split(',').map(Number);
    const outDir = getFlag('out', 'previews/service');
    const prefix = getFlag('prefix', 'f');
    fs.mkdirSync(outDir, { recursive: true });
    for (const frame of frames) {
      const out = path.join(outDir, `${prefix}${frame}.jpg`);
      fs.rmSync(out, { force: true }); // 防 ○ 缓存幻觉
      await renderStill({
        composition, serveUrl, output: out, frame,
        imageFormat: 'jpeg', jpegQuality: 90, puppeteerInstance: browser, inputProps,
      });
      console.log(`+ ${out}`);
    }
  } else if (mode === 'segment' || qcMode) {
    const start = Number(rest[0]);
    const end = Number(rest[1]);
    const out = qcMode ? path.resolve('previews/service/_qc-tmp.mp4') : path.resolve(getFlag('out', 'previews/service/segment.mp4'));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.rmSync(out, { force: true });
    // RS_HW=1 → 硬件编码（平台分流见 hwOpts）：预览/审核版专用；交付 master 仍走默认 libx264 crf15
    const hw = process.env.RS_HW === '1' && !qcMode;
    await renderMedia({
      composition, serveUrl, codec: 'h264', outputLocation: out,
      frameRange: [start, end], puppeteerInstance: browser, inputProps,
      jpegQuality: qcMode ? 60 : 100,
      ...(hw ? hwOpts() : { crf: qcMode ? 28 : 15 }),
      scale: qcMode ? 0.5 : 1, // QC 跑降清提速：断言在 DOM 层，与画质无关
      onBrowserLog,
      onProgress: ({ progress }) => {
        if (Math.round(progress * 100) % 25 === 0) process.stdout.write(`\r${Math.round(progress * 100)}%`);
      },
    });
    console.log(`\n+ ${out}`);
    if (qcMode) {
      fs.rmSync(out, { force: true });
      const parsed = qcLines.map((l) => JSON.parse(l));
      const heartbeats = parsed.filter((r) => r.hb); // 每帧一次覆盖心跳
      const violations = parsed.filter((r) => r.type);

      // 覆盖核验（防假过闸，错题 #35）：探针每帧发一次心跳；覆盖不足＝多半有 Scene 漏挂 QcProbe，
      // 此时「零违规」不可信，判 FAIL 而非 PASS。（0722-01 血案：20 段仅 1 段挂探针，假报零违规）
      // 心跳帧号只认落在 [start,end] 内的——Scene 内挂载的探针经 Sequence 报的是局部帧（0 起算），
      // 不过滤会在跨段/全片 QC 时把覆盖率算错（假 FAIL 或假 PASS）。全局覆盖靠装配根挂载的 QcProbe 保证。
      const total = end - start + 1;
      const covered = new Set(heartbeats.map((h) => h.frame).filter((f) => f >= start && f <= end)).size;
      const maxN = heartbeats.reduce((m, h) => Math.max(m, h.n || 0), 0);
      const coverPct = total > 0 ? covered / total : 0;
      const coverBad = coverPct < 0.9 || maxN === 0;

      const byKey = new Map();
      for (const r of violations) {
        const key = `${r.type}|${r.a || ''}|${r.b || ''}`;
        if (!byKey.has(key)) byKey.set(key, { ...r, frames: [] });
        byKey.get(key).frames.push(r.frame);
      }
      const summary = [...byKey.values()].map((v) => ({
        type: v.type, a: v.a, b: v.b, detail: v.detail,
        frameFrom: Math.min(...v.frames), frameTo: Math.max(...v.frames), count: v.frames.length,
      }));
      const outJson = path.resolve('previews/service/qc-report.json');
      fs.writeFileSync(outJson, JSON.stringify(summary, null, 2));

      if (coverBad) {
        console.log(
          `QC 覆盖不足 [FAIL]：探针仅覆盖 ${covered}/${total} 帧` +
          (maxN === 0 ? '、全程 0 个 data-qc 元素' : `（${(coverPct * 100).toFixed(0)}%）`) +
          ' → 多半有 Scene 未挂 QcProbe，本次「零违规」不可信。修法见错题 #35。'
        );
      } else {
        console.log(summary.length === 0 ? `QC 全过：无违规（探针覆盖 ${covered}/${total} 帧）` : `QC 违规 ${summary.length} 类 → ${outJson}`);
      }
      for (const s of summary) console.log(`  [${s.type}] ${s.a}${s.b ? ' × ' + s.b : ''} 帧 ${s.frameFrom}-${s.frameTo} (${s.count} 帧) ${s.detail || ''}`);
    }
  } else if (mode === 'audio') {
    const video = path.resolve(rest[0]);
    const out = path.resolve(getFlag('out', video.replace(/\.mp4$/, '') + '.remux.mp4'));
    const wav = out.replace(/\.mp4$/, '') + '.tmp.wav';
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.rmSync(out, { force: true });
    fs.rmSync(wav, { force: true });
    await renderMedia({
      composition, serveUrl, codec: 'wav', outputLocation: wav,
      puppeteerInstance: browser, inputProps,
      onProgress: ({ progress }) => {
        if (Math.round(progress * 100) % 25 === 0) process.stdout.write(`\r音频 ${Math.round(progress * 100)}%`);
      },
    });
    console.log(`\n+ ${wav}（临时音轨）`);
    // aac 256k 对齐交付 master 音轨规格；faststart 提升播放器兼容（错题 #33 附注）
    execFileSync('ffmpeg', ['-v', 'error', '-stats', '-y', '-i', video, '-i', wav,
      '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
      '-movflags', '+faststart', out], { stdio: 'inherit' });
    fs.rmSync(wav, { force: true });
    console.log(`+ ${out}`);
  } else if (mode === 'splice') {
    const start = Number(rest[0]);
    const reqEnd = Number(rest[1]);
    const full = path.resolve(rest[2]);
    const out = path.resolve(getFlag('out', full.replace(/\.mp4$/, '') + '.splice.mp4'));
    const ffprobe = (args) => execFileSync('ffprobe', ['-v', 'error', ...args], { encoding: 'utf8' }).trim();
    const ffmpeg = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });

    // 源参数探测（拼接三段必须同参：分辨率/fps/pix_fmt/色彩，归一化编码照此对齐）
    const sp = Object.fromEntries(ffprobe(['-select_streams', 'v:0', '-show_entries',
      'stream=width,height,pix_fmt,r_frame_rate,nb_frames,time_base,has_b_frames,color_space,color_range',
      '-of', 'default=nw=1', full]).split('\n').map((l) => l.split('=')));
    const [fn, fd] = sp.r_frame_rate.split('/').map(Number);
    const fps = fn / fd;
    const nbFrames = Number(sp.nb_frames);
    const tbDen = Number(sp.time_base.split('/')[1]);
    if (composition.fps !== fps || composition.width !== Number(sp.width) || composition.height !== Number(sp.height)) {
      throw new Error(`合成与全片规格不符：comp ${composition.width}x${composition.height}@${composition.fps} vs 源 ${sp.width}x${sp.height}@${fps}——查 COMP_ID 是否本片`);
    }
    if (composition.durationInFrames !== nbFrames) {
      throw new Error(`合成帧数 ${composition.durationInFrames} ≠ 全片帧数 ${nbFrames}——COMP_ID 与全片不匹配，拼回会错位`);
    }
    if (!Number.isInteger(start) || !Number.isInteger(reqEnd) || start < 0 || reqEnd <= start || reqEnd > nbFrames - 1) {
      throw new Error(`帧区间非法：[${start}, ${reqEnd}]，全片 0-${nbFrames - 1}`);
    }
    if (Number(sp.has_b_frames) > 0) {
      console.warn(`警告：全片含 B 帧（has_b_frames=${sp.has_b_frames}），非交付标准源（错题 #33）——预览可用，交付级请先过 -bf 0 重编码`);
    }

    // 尾切点吸附到关键帧：-c copy 起切必须落关键帧（官方雷区②），止帧向外扩至「下一关键帧-1」，多渲帧数交付 g=30 下 ≤29
    const keyFrames = ffprobe(['-select_streams', 'v:0', '-show_entries', 'packet=pts_time,flags', '-of', 'csv=p=0', full])
      .split('\n').filter((l) => l.split(',')[1] && l.split(',')[1].includes('K'))
      .map((l) => Math.round(parseFloat(l) * fps)).sort((a, b) => a - b);
    const tailStart = keyFrames.find((k) => k >= reqEnd + 1); // undefined = 渲到片尾，无尾段
    const renderEnd = tailStart !== undefined ? tailStart - 1 : nbFrames - 1;
    if (renderEnd !== reqEnd) console.log(`止帧 ${reqEnd} → ${renderEnd}（尾切点吸附到关键帧 ${tailStart !== undefined ? tailStart : '片尾'}）`);

    const tmpDir = path.join(path.dirname(out), '.splice-tmp');
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.rmSync(out, { force: true });

    // ① 渲修复段（中间产物 crf10 留归一化二压余量；RS_HW=1 仅预览级 splice 用）
    const rawSeg = path.join(tmpDir, 'seg-raw.mp4');
    const hw = process.env.RS_HW === '1';
    await renderMedia({
      composition, serveUrl, codec: 'h264', outputLocation: rawSeg,
      frameRange: [start, renderEnd], puppeteerInstance: browser, inputProps,
      jpegQuality: 100,
      ...(hw ? hwOpts() : { crf: 10 }),
      onProgress: ({ progress }) => {
        if (Math.round(progress * 100) % 25 === 0) process.stdout.write(`\r渲段 ${Math.round(progress * 100)}%`);
      },
    });
    console.log(`\n+ 段渲完成 [${start}, ${renderEnd}]`);

    // ② 三段出 MPEG-TS（annexb SPS/PPS 带内，规避 mp4 concat 参数集失配花屏）
    // 新渲段归一化到交付参数（错题 #33：-bf 0 -g 30），pix_fmt/色彩对齐源防拼接点色偏
    const colorArgs = [];
    if (sp.color_space && sp.color_space !== 'unknown') colorArgs.push('-colorspace', sp.color_space);
    if (sp.color_range && sp.color_range !== 'unknown') colorArgs.push('-color_range', sp.color_range);
    const tsCommon = ['-muxdelay', '0', '-muxpreload', '0', '-f', 'mpegts'];
    const segTs = path.join(tmpDir, 'seg.ts');
    ffmpeg(['-i', rawSeg, '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-bf', '0', '-g', '30',
      '-pix_fmt', sp.pix_fmt, '-r', String(fps), ...colorArgs, ...tsCommon, segTs]);
    const parts = [];
    if (start > 0) {
      const frontTs = path.join(tmpDir, 'front.ts');
      // 前段从 0 帧（必为关键帧）copy 起切，-t 半帧偏移取精确帧数，尾在 GOP 中间可解（解码自关键帧顺序推进）
      ffmpeg(['-i', full, '-map', '0:v:0', '-c', 'copy', '-t', String((start - 0.5) / fps), ...tsCommon, frontTs]);
      parts.push({ f: frontTs, want: start, name: '前段' });
    }
    parts.push({ f: segTs, want: renderEnd - start + 1, name: '新渲段' });
    if (tailStart !== undefined) {
      const tailTs = path.join(tmpDir, 'tail.ts');
      // -ss 落在 tailStart 关键帧与下一关键帧之间 → 向后吸附精确从 tailStart 起 copy
      ffmpeg(['-ss', String((tailStart + 0.4) / fps), '-i', full, '-map', '0:v:0', '-c', 'copy',
        '-avoid_negative_ts', 'make_zero', ...tsCommon, tailTs]);
      parts.push({ f: tailTs, want: nbFrames - tailStart, name: '尾段' });
    }
    for (const p of parts) {
      // mpegts 的流在 program 与全局节各报一次 → 输出两行同值，取首个非空行
      const got = Number(ffprobe(['-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', p.f]).split('\n').find(Boolean));
      if (got !== p.want) throw new Error(`${p.name}帧数不符：期望 ${p.want} 实得 ${got}（切点未按预期落帧）——中间产物留在 ${tmpDir}`);
      console.log(`  ${p.name} ${got} 帧 ✓`);
    }

    // ③ concat 拼视频 + 原全片音轨整条 copy 覆盖（视频拼接不碰音频流，无接缝爆音）
    const listPath = path.join(tmpDir, 'concat.txt');
    fs.writeFileSync(listPath, parts.map((p) => `file '${p.f}'`).join('\n') + '\n');
    ffmpeg(['-f', 'concat', '-safe', '0', '-i', listPath, '-i', full, '-map', '0:v:0', '-map', '1:a:0',
      '-c', 'copy', '-movflags', '+faststart', '-video_track_timescale', String(tbDen), out]);

    // ④ 自动断言：帧数一致、时长差 ≤1 帧、无 B 帧、音轨逐字节同源
    const op = Object.fromEntries(ffprobe(['-select_streams', 'v:0', '-show_entries', 'stream=nb_frames,has_b_frames', '-of', 'default=nw=1', out]).split('\n').map((l) => l.split('=')));
    const durOf = (f) => Number(ffprobe(['-show_entries', 'format=duration', '-of', 'csv=p=0', f]));
    const durDiff = Math.abs(durOf(out) - durOf(full));
    const audioMd5 = (f) => execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-map', '0:a:0', '-c', 'copy', '-f', 'md5', '-'], { encoding: 'utf8' }).trim();
    const errs = [];
    if (Number(op.nb_frames) !== nbFrames) errs.push(`帧数 ${op.nb_frames} ≠ 源 ${nbFrames}`);
    if (durDiff > 1 / fps + 0.001) errs.push(`时长差 ${durDiff.toFixed(3)}s > 1 帧`);
    if (Number(op.has_b_frames) > 0 && Number(sp.has_b_frames) === 0) errs.push(`输出含 B 帧（源无）`);
    if (audioMd5(out) !== audioMd5(full)) errs.push(`音轨 md5 与源不符`);
    if (errs.length) throw new Error(`splice 断言失败：${errs.join('；')}——中间产物留在 ${tmpDir}`);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    console.log(`断言全过：帧数 ${op.nb_frames}、时长差 ${(durDiff * 1000).toFixed(1)}ms、无 B 帧、音轨同源`);
    console.log(`+ ${out}`);
  }

  await browser.close({ silent: true });
  console.log(`总耗时 ${(Date.now() - t0) / 1000}s`);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

// 环境体检：检查剪辑 skill 运行所需的一切（跨 macOS/Windows/Linux，doctor.sh 已改为转发到本文件）
// 用法: node doctor.mjs [你的Remotion项目目录，默认当前目录] [--ci]
//   --ci  CI 冒烟专用：codex/claude CLI 缺失降级为提醒（跑管线不需要，剪辑时需要）
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const CI = argv.includes('--ci');
const TARGET = path.resolve(argv.find((a) => !a.startsWith('--')) || '.');
if (!fs.existsSync(TARGET) || !fs.statSync(TARGET).isDirectory()) {
  console.error('目录不存在');
  process.exit(1);
}
let PASS = 0, FAIL = 0, WARN = 0;
const ok = (s) => { console.log(`  ✓ ${s}`); PASS++; };
const bad = (s) => { console.log(`  ✗ ${s}`); FAIL++; };
const warn = (s) => { console.log(`  ⚠ ${s}`); WARN++; };

const win = process.platform === 'win32';
const has = (cmd) => spawnSync(win ? 'where' : 'which', [cmd], { stdio: 'ignore' }).status === 0;
const installHint = win ? 'winget install Gyan.FFmpeg OpenJS.NodeJS.LTS' : 'brew install ffmpeg node';

console.log('== 系统工具 ==');
for (const c of ['node', 'npm', 'npx', 'ffmpeg', 'ffprobe']) {
  has(c) ? ok(c) : bad(`${c} 未安装（Agent 检测到包管理器会自动装；手动: ${installHint}）`);
}
if (!win) {
  // pgrep 只用于渲染查场（assembly SKILL「渲染串行」纪律）；Windows 用 tasklist 替代，不检查
  has('pgrep') ? ok('pgrep') : warn('pgrep 缺失（渲染查场用；多数系统自带）');
}
if (has('codex')) ok('codex CLI（主推）');
else if (has('claude')) ok('claude CLI');
else (CI ? warn : bad)('未检测到 codex 或 claude CLI——需装其一来驱动剪辑（Codex: npm i -g @openai/codex）');

console.log(`== 项目: ${TARGET} ==`);
const pkgPath = path.join(TARGET, 'package.json');
if (fs.existsSync(pkgPath)) {
  ok('package.json');
  const pkg = fs.readFileSync(pkgPath, 'utf8');
  for (const dep of ['remotion', 'lucide-react', '@fontsource/noto-sans-sc', '@fontsource/inter', '@fontsource/archivo-black']) {
    pkg.includes(`"${dep}"`) ? ok(`依赖 ${dep}`) : bad(`缺依赖 ${dep}（npm i ${dep}）`);
  }
} else {
  bad('无 package.json——先 npx create-video@latest 建 Remotion 项目');
}

console.log('== skill 与脚本 ==');
const f = (p) => fs.existsSync(path.join(TARGET, p));
f('.claude/skills/remotion-assembly/SKILL.md') ? ok('六 skill 在位') : bad(`skill 未安装（node install.mjs --target "${TARGET}"）`);
f('scripts/render-service.cjs') ? ok('管线脚本在位') : bad('scripts/ 缺失（重跑 install.mjs）');
f('src/design/fonts.ts') ? ok('工程底座在位') : bad('src/design/ 底座缺失（重跑 install.mjs）');
f('AGENTS.md') ? ok('Codex 桥在位') : warn('无 AGENTS.md（只用 Claude Code 可忽略）');

console.log('== 可选项 ==');
const sfxDir = path.join(TARGET, 'public/sfx');
const wavs = fs.existsSync(sfxDir) ? fs.readdirSync(sfxDir).filter((x) => x.endsWith('.wav')) : [];
if (wavs.length) ok(`音效库在位（${wavs.length} 件）`);
else warn('音效库为空——首片可跳过配声，或按 remotion-sfx SKILL §1-2 建库（选源→试听板→用户认领，音效质感必须人耳挑）');
f('public/footage') ? ok('public/footage/ 在位') : warn('public/footage/ 不存在（首次装配会自动创建）');

console.log();
console.log(`结果: ${PASS} 项通过, ${FAIL} 项失败, ${WARN} 项提醒`);
console.log(FAIL === 0 ? '✅ 可以开工：在项目里对 Claude Code 说「装配这条口播：<视频> <SRT>」' : '❌ 先修复上面的失败项');
process.exit(FAIL);

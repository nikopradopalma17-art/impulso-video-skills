// 安装 Remotion 口播 MG 剪辑 skill 体系到你的 Remotion 项目（跨平台，install.sh 已改为转发到本文件）
// 用法: node install.mjs --target <你的Remotion项目目录> [--force]
//   --target  目标项目根目录（含 package.json）
//   --force   允许覆盖目标里已存在的 AGENTS.md；skill 与 scripts 总是更新到最新
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const REPO_DIR = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const getFlag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const FORCE = argv.includes('--force');
const targetArg = getFlag('target');
if (!targetArg) {
  console.error('用法: node install.mjs --target <你的Remotion项目目录> [--force]');
  process.exit(1);
}
const TARGET = path.resolve(targetArg);
if (!fs.existsSync(TARGET) || !fs.statSync(TARGET).isDirectory()) {
  console.error(`目标目录不存在: ${TARGET}`);
  process.exit(1);
}
if (!fs.existsSync(path.join(TARGET, 'package.json'))) {
  console.error(`⚠️  ${TARGET} 没有 package.json——请先建一个 Remotion 项目（npx create-video@latest）再安装。`);
  process.exit(1);
}

// 递归复制，skipExisting=true 时只补缺失文件（对应原 rsync --ignore-existing），返回新增文件数
function copyDir(src, dst, { skipExisting = false } = {}) {
  let added = 0;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      added += copyDir(s, d, { skipExisting });
    } else {
      if (skipExisting && fs.existsSync(d)) continue;
      fs.copyFileSync(s, d);
      added++;
    }
  }
  return added;
}

console.log(`== 1/4 安装六个 skill → ${path.join(TARGET, '.claude/skills')}`);
copyDir(path.join(REPO_DIR, 'skills'), path.join(TARGET, '.claude', 'skills'));

console.log(`== 2/4 安装管线脚本 → ${path.join(TARGET, 'scripts')}`);
copyDir(path.join(REPO_DIR, 'scripts'), path.join(TARGET, 'scripts'));

console.log(`== 3/4 安装工程底座（只补缺失文件，不覆盖你已有的代码）→ ${path.join(TARGET, 'src')}`);
const added = copyDir(path.join(REPO_DIR, 'substrate', 'src'), path.join(TARGET, 'src'), { skipExisting: true });
console.log(`   新增 ${added} 个文件（已存在的一律跳过）`);

console.log('== 4/4 生成 Codex 桥 AGENTS.md（路径已替换为你的项目）');
const agentsDst = path.join(TARGET, 'AGENTS.md');
if (fs.existsSync(agentsDst) && !FORCE) {
  console.log(`   已存在 ${agentsDst}，跳过（用 --force 覆盖）`);
} else {
  const tpl = fs.readFileSync(path.join(REPO_DIR, 'codex-bridge', 'AGENTS.md'), 'utf8');
  fs.writeFileSync(agentsDst, tpl.replaceAll('{{PROJECT_ROOT}}', TARGET));
  console.log(`   已写入 ${agentsDst}`);
}

console.log('== 4.5/5 独立质检员 mg-judge');
const judgeSrc = path.join(REPO_DIR, 'agents', 'mg-judge.md');
if (fs.existsSync(judgeSrc)) {
  fs.mkdirSync(path.join(TARGET, '.claude', 'agents'), { recursive: true });
  fs.copyFileSync(judgeSrc, path.join(TARGET, '.claude', 'agents', 'mg-judge.md'));
  console.log('   已装 .claude/agents/mg-judge.md（Claude 端读帧质检员；Codex 端用 codex exec 等价）');
} else {
  console.log('   （仓库缺 agents/mg-judge.md，跳过）');
}

console.log('== 5/5 Codex 斜杠命令 /remotion-assembly（可选）');
const codexDir = path.join(os.homedir(), '.codex');
if (fs.existsSync(codexDir)) {
  const promptDst = path.join(codexDir, 'prompts', 'remotion-assembly.md');
  if (fs.existsSync(promptDst) && !FORCE) {
    console.log(`   已存在 ${promptDst}，跳过（--force 覆盖）`);
  } else {
    fs.mkdirSync(path.dirname(promptDst), { recursive: true });
    fs.copyFileSync(path.join(REPO_DIR, 'codex-bridge', 'prompts', 'remotion-assembly.md'), promptDst);
    console.log('   已安装（Codex 里输入 /remotion-assembly 触发；prompt 按当前项目根自寻规则，多项目通用）');
  }
} else {
  console.log('   未检测到 ~/.codex（未装 Codex CLI），跳过——直接说「装配这条口播：…」也一样能触发');
}

console.log();
console.log('✅ 安装完成。接下来：');
console.log(`   1. 补依赖：cd "${TARGET}" && npm i remotion react lucide-react @fontsource/noto-sans-sc @fontsource/inter @fontsource/archivo-black`);
console.log(`   2. 体检：node "${path.join(REPO_DIR, 'doctor.mjs')}" "${TARGET}"`);
console.log(`   3. 在 ${TARGET} 打开 Codex（或 Claude Code），说：装配这条口播：<视频.mp4> <字幕.srt>`);

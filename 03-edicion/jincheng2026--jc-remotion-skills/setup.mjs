// 一条命令从零到能剪：建工程 + 装依赖 + 装 skill/脚本/底座/Codex 桥 + 体检（跨平台）
// 能跑到这里说明 node 已在；缺 ffmpeg 时按平台自动装（brew/winget/apt），装不了才把命令给用户。
// 用法:
//   node setup.mjs                    # 在当前目录下新建 ./remotion-koubo-studio
//   node setup.mjs /path/to/dir       # 指定工程目录（不存在则新建；已是 Remotion 项目则只装 skill）
// macOS/Linux 一行引导（会自动转到本文件）: bash <(curl -fsSL https://raw.githubusercontent.com/jincheng2026/jc-remotion-skills/master/setup.sh)
// Windows PowerShell 一行引导: irm https://raw.githubusercontent.com/jincheng2026/jc-remotion-skills/master/setup.ps1 | iex
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO_DIR = path.dirname(fileURLToPath(import.meta.url));
const win = process.platform === 'win32';
const has = (cmd) => spawnSync(win ? 'where' : 'which', [cmd], { stdio: 'ignore' }).status === 0;
// npm/winget 在 Windows 是 .cmd/别名，走 shell 才找得到
const sh = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { stdio: 'inherit', shell: win, ...opts });

const TARGET = path.resolve(process.argv[2] || path.join(process.cwd(), 'remotion-koubo-studio'));

// 0/3 基础运行时：缺 ffmpeg 时按平台自动装（这一步一般不需要管理员权限）
if (!has('ffmpeg')) {
  let done = false;
  if (process.platform === 'darwin' && has('brew')) {
    console.log('== 0/3 缺 ffmpeg，用 Homebrew 自动安装（约几分钟）==');
    done = sh('brew', ['install', 'ffmpeg']).status === 0;
  } else if (win && has('winget')) {
    console.log('== 0/3 缺 ffmpeg，用 winget 自动安装（约几分钟）==');
    done = sh('winget', ['install', '-e', '--id', 'Gyan.FFmpeg',
      '--accept-source-agreements', '--accept-package-agreements']).status === 0;
    if (done && !has('ffmpeg')) {
      console.log('✅ ffmpeg 已装好，但当前终端的 PATH 还没刷新——重开一个终端，再跑一次本命令即可。');
      process.exit(0);
    }
  } else if (process.platform === 'linux' && has('apt-get')) {
    if (spawnSync('sudo', ['-n', 'true'], { stdio: 'ignore' }).status === 0) {
      console.log('== 0/3 缺 ffmpeg，用 apt 自动安装 ==');
      done = sh('sudo', ['apt-get', 'install', '-y', 'ffmpeg']).status === 0;
    }
  }
  if (!done || !has('ffmpeg')) {
    console.error('❌ 缺 ffmpeg 且自动安装未成功。手动装一个再重跑本命令：');
    console.error('   macOS: brew install ffmpeg ｜ Windows: winget install Gyan.FFmpeg ｜ Ubuntu: sudo apt install -y ffmpeg');
    process.exit(1);
  }
}

if (fs.existsSync(path.join(TARGET, 'package.json'))) {
  console.log(`== 检测到现有项目：${TARGET}，跳过建工程 ==`);
} else {
  console.log(`== 1/3 新建 Remotion 工程：${TARGET} ==`);
  fs.mkdirSync(TARGET, { recursive: true });
  fs.cpSync(path.join(REPO_DIR, 'template'), TARGET, { recursive: true, force: false, errorOnExist: false });
}

console.log('== 2/3 安装 skill + 脚本 + 工程底座 + Codex 桥 ==');
const inst = spawnSync(process.execPath, [path.join(REPO_DIR, 'install.mjs'), '--target', TARGET], { stdio: 'inherit' });
if (inst.status !== 0) process.exit(inst.status ?? 1);

console.log('== 3/3 安装 npm 依赖（首次几分钟，包含 Remotion 与字体包）==');
const npmR = sh('npm', ['install', '--no-fund', '--no-audit'], { cwd: TARGET });
if (npmR.status !== 0) {
  console.error('❌ npm install 失败，修复网络/权限后在工程目录重跑 npm install');
  process.exit(npmR.status ?? 1);
}

console.log();
spawnSync(process.execPath, [path.join(REPO_DIR, 'doctor.mjs'), TARGET], { stdio: 'inherit' });

console.log();
console.log('🎬 就绪。开始剪辑：');
console.log('   1. 把你的 口播视频.mp4 和 字幕.srt 放到任意位置');
console.log(`   2. 在 ${TARGET} 目录打开 Codex（或 Claude Code）`);
console.log('   3. 说：装配这条口播：<视频路径> <SRT路径>');

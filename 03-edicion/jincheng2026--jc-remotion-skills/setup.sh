#!/usr/bin/env bash
# macOS/Linux 一条命令从零到能剪（bash 引导层，只管装 node + 克隆，业务逻辑全在跨平台的 setup.mjs）
# Windows 用 setup.ps1（PowerShell: irm https://raw.githubusercontent.com/jincheng2026/jc-remotion-skills/master/setup.ps1 | iex）
# 用法:
#   bash setup.sh                    # 在当前目录下新建 ./remotion-koubo-studio
#   bash setup.sh /path/to/dir       # 指定工程目录（不存在则新建；已是 Remotion 项目则只装 skill）
# 也可远程一行:
#   bash <(curl -fsSL https://raw.githubusercontent.com/jincheng2026/jc-remotion-skills/master/setup.sh)
set -euo pipefail

REPO_URL="https://github.com/jincheng2026/jc-remotion-skills.git"
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-.}")" 2>/dev/null && pwd || pwd)"

# 0. node 是后续一切的前提：缺了先装（ffmpeg 由 setup.mjs 按平台自动装）
if ! command -v node >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "== 缺 node，用 Homebrew 自动安装 =="
    brew install node
  elif command -v apt-get >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    echo "== 缺 node，用 apt 自动安装 =="
    sudo apt-get install -y nodejs npm
  else
    echo "❌ 缺 node，且未检测到可用包管理器。先装一个再重跑本命令："
    echo '   macOS 装 Homebrew（需输一次密码）: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    echo "   Ubuntu: sudo apt install -y nodejs npm"
    exit 1
  fi
fi

# 1. curl 管道运行时本地没有仓库文件 → 先克隆再转交
if [ ! -f "$SELF_DIR/setup.mjs" ]; then
  echo "== 未在仓库目录内运行，先克隆仓库 =="
  git clone --depth 1 "$REPO_URL" ./jc-remotion-skills
  SELF_DIR="$PWD/jc-remotion-skills"
fi

# 2. 其余交给跨平台的 setup.mjs
exec node "$SELF_DIR/setup.mjs" "$@"

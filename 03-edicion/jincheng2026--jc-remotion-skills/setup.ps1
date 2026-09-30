# Windows 一条命令从零到能剪（PowerShell 引导层，只管装 git/node，业务逻辑全在跨平台的 setup.mjs）
# 用法:
#   .\setup.ps1                  # 在当前目录下新建 .\remotion-koubo-studio
#   .\setup.ps1 C:\path\to\dir   # 指定工程目录
# 远程一行:
#   irm https://raw.githubusercontent.com/jincheng2026/jc-remotion-skills/master/setup.ps1 | iex
param([string]$Target = "")

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/jincheng2026/jc-remotion-skills.git"

function Has($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

# 0. 基础工具：git 与 node 缺哪个装哪个（winget 装完 PATH 要重开终端才生效）
$installed = @()
if (-not (Has "git"))  { winget install -e --id Git.Git --accept-source-agreements --accept-package-agreements; $installed += "git" }
if (-not (Has "node")) { winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements; $installed += "node" }
if ($installed.Count -gt 0) {
    Write-Host "✅ 已安装: $($installed -join ', ')。请重开一个终端，再跑一次本命令（新装工具的 PATH 需要新终端才生效）。"
    exit 0
}

# 1. 不在仓库目录内运行（如 irm 管道）→ 先克隆再转交
$SelfDir = if ($PSScriptRoot) { $PSScriptRoot } else { $PWD.Path }
if (-not (Test-Path (Join-Path $SelfDir "setup.mjs"))) {
    Write-Host "== 未在仓库目录内运行，先克隆仓库 =="
    if (-not (Test-Path ".\jc-remotion-skills")) { git clone --depth 1 $RepoUrl .\jc-remotion-skills }
    $SelfDir = (Resolve-Path ".\jc-remotion-skills").Path
}

# 2. 其余交给跨平台的 setup.mjs（ffmpeg 自动安装、建工程、装 skill、npm install、体检）
if ($Target) { node (Join-Path $SelfDir "setup.mjs") $Target } else { node (Join-Path $SelfDir "setup.mjs") }
exit $LASTEXITCODE

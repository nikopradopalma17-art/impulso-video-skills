# html2video

[![Version](https://img.shields.io/badge/version-1.0.0-2563eb.svg)](./SKILL.md)
[![Codex Skill](https://img.shields.io/badge/Codex-Skill-111827.svg?logo=openai&logoColor=white)](./SKILL.md)
[![Remotion](https://img.shields.io/badge/Remotion-4.0.409-0b84f3.svg)](https://www.remotion.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A520-339933.svg?logo=nodedotjs&logoColor=white)](#requirements)
[![Platform](https://img.shields.io/badge/platform-macOS-111111.svg?logo=apple&logoColor=white)](#requirements)
[![License](https://img.shields.io/github/license/cclank/lanshu-html2video-skill)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/cclank/lanshu-html2video-skill?style=flat)](https://github.com/cclank/lanshu-html2video-skill/stargazers)

把网页文章、研究页面或产品更新做成可审阅、可复现的 1920×1080 H.264 视频。Skill 负责内容提炼、分镜规则和质量门禁，内置的 Remotion 工程负责预览与渲染。

> Turn a web article into a polished, reviewable 1080p video with a deterministic Remotion render pipeline. Chinese output is the default; English sources can be translated during the editorial stage.

## 工作流

```text
HARVEST  →  READ  →  STORYBOARD  →  RENDER
  抓取       提炼      storyboard.json      预览 / 成片
```

- **HARVEST**：抽取正文结构、图注、原始分辨率图片和网页设计 token。
- **READ**：提炼核心结论、证据、限制条件和叙事顺序。
- **STORYBOARD**：生成可审阅的 `storyboard.json`，统一管理镜头、文案、节奏、裁切和视觉样式。
- **RENDER**：校验图片像素余量、文字预算、时间线和字体覆盖后，通过 Remotion 输出视频。

HARVEST 与 RENDER 由脚本确定性执行；READ 与 STORYBOARD 由 Codex 完成内容判断。

## 亮点

- 以网页里的真实图表、图片和图注为主要视觉素材。
- 自动绕过常见图片代理，优先下载原始分辨率资源。
- 分镜使用权重和归一化时间，无需手写 frame 数。
- 裁切前检查源图像素，避免导出后才发现画面糊掉。
- 中文排版内置安全区、行长预算和 CJK 换行规则。
- 按当前分镜字符子集化 Noto CJK 字体，减少渲染负担并稳定排版。
- 支持 Studio 交互预览、单帧检查、完整 MP4 渲染。
- 支持“口播”模式：按语速重排节奏并生成带时间码的 `narration.md`。
- 所有视频动效由当前帧驱动，方便重复渲染和关键帧核验。

## 安装

```bash
git clone https://github.com/cclank/lanshu-html2video-skill.git ~/.codex/skills/html2video
```

重新打开一个 Codex 任务后，可以直接提出类似请求：

```text
用 html2video 把 https://example.com/article 做成一个 60 秒中文视频。
先给我 Studio 预览，确认后再导出。
```

口播版本：

```text
用 html2video 把这个网页做成 90 秒口播视频，生成配音稿和预览。
```

网页抓取依赖 [baoyu-url-to-markdown](https://github.com/JimLiu/baoyu-skills#baoyu-url-to-markdown)。请先按该项目说明安装对应 Skill，并确保 `bun` 可用。

## Requirements

| 依赖 | 用途 | 要求 |
|---|---|---|
| macOS | `sips` 读取图片尺寸；当前已验证平台 | 推荐 |
| Node.js | Remotion 渲染 | 20+ |
| Python | 网页抓取与素材整理 | 3.10+ |
| Chrome / Chromium | 页面访问与 Remotion 渲染 | 必需 |
| Bun | 运行 `baoyu-fetch` | 必需 |
| `pyftsubset` + Brotli | CJK 字体子集化 | 必需 |
| `agent-browser` | 提取网页设计 token | 可选 |

首次渲染会安装固定版本的 npm 依赖，并下载 Noto Sans SC / Noto Serif SC 可变字体到 `~/.cache/html2video/`。缓存和生成文件不会写进 Skill 仓库。

## 手动运行

Skill 的完整执行说明在 [SKILL.md](./SKILL.md)。下面是最短路径：

```bash
cd ~/.codex/skills/html2video

# 1. 抓取网页
python3 scripts/harvest.py \
  --url "https://example.com/article" \
  --out ./work/article

# 2. 让 Codex 读取 harvest.json 并编写 work/article/storyboard.json

# 3. 启动 Remotion Studio
node scripts/render.mjs --storyboard ./work/article --studio

# 4. 输出 H.264 MP4
node scripts/render.mjs \
  --storyboard ./work/article \
  --out ./article.mp4 \
  --concurrency 3
```

其他常用命令：

```bash
# 只检查布局和指定帧
node scripts/render.mjs --storyboard ./work/article --still 950

# 口播模式：生成 narration.md，不渲染视频
node scripts/render.mjs --storyboard ./work/article --script
```

## 目录结构

```text
html2video/
├── SKILL.md                  # Agent 工作流入口
├── scripts/                  # 抓取、字体、校验和渲染脚本
├── references/               # 编辑、分镜、镜头、中文排版与口播规范
└── assets/template/          # 可同步到本地缓存的 Remotion 引擎
```

一次任务通常会产生：

```text
work/<slug>/
├── harvest.json
├── article.json
├── media/
├── storyboard.json
└── narration.md              # 仅口播模式
```

## 设计边界

- 视频素材来自目标网页、用户提供的本地文件和确定性 HTML/CSS/SVG 动效。
- 口播模式输出静音画面和可录制脚本，当前不包含 TTS。
- 音乐需要由使用者自行提供，并确认网页图片、音频及其他素材的使用权。
- 当前在 macOS 上完成完整验证；其他系统可能需要替换 `sips` 图像尺寸探测。

## 许可证与第三方组件

本仓库自身代码以 [MIT License](./LICENSE) 发布。

- [Remotion](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) 使用独立许可证，部分组织需要购买 Company License；使用前请核对其最新条款。
- 首次运行下载的 [Noto CJK](https://github.com/notofonts/noto-cjk) 字体使用 SIL Open Font License 1.1，字体文件未包含在本仓库中。
- React、Zod 等 npm 依赖保留各自许可证。

## Contributing

欢迎提交 Issue 或 Pull Request。涉及镜头库、时间线或字体逻辑的改动，请同时运行结构校验、TypeScript 检查和关键帧确定性测试。

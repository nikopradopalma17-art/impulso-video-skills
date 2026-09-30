# Book Video Production Skill

[中文](#中文说明) · [English](#english)

一个面向 Codex 的开源工作流 Skill，用于把一本书制作成适合抖音、小红书、TikTok 等平台的竖屏短视频。

它覆盖事实研究、去 AI 味旁白、参考视频拆解、分镜、原创画面、封面、中文配音、字幕同步、轻配乐、HyperFrames/Remotion 编排、质量检查和 MP4 渲染。

## 中文说明

### 能做什么

- 根据一本书生成 30–60 秒中文介绍或书评视频
- 拆解参考视频的节奏、字幕区、画面语言与声音关系
- 基于出版社、作者、图书馆和可靠访谈建立事实底稿
- 生成自然、克制、避免套路句式的旁白
- 规划复古风景、时代环境、象征性静物或统一卡通插画
- 制作独立 9:16 发布封面
- 让字幕以最终旁白音频为时间基准
- 添加不抢旁白的轻缓背景音乐
- 使用 HyperFrames 或 Remotion 生成可复用工程
- 在交付前检查事实、音频、字幕、布局、动效与输出规格

### 安装

复制技能目录到 Codex 的 skills 目录：

```powershell
Copy-Item -Recurse `
  .\skills\book-video-production `
  "$env:USERPROFILE\.codex\skills\book-video-production"
```

macOS / Linux：

```bash
cp -R skills/book-video-production \
  "${CODEX_HOME:-$HOME/.codex}/skills/book-video-production"
```

重新打开 Codex 后，可以直接说：

```text
使用图书短视频生产，为《活着》制作一条 30 秒、9:16、发布到抖音的中文图书介绍视频。
```

或显式调用：

```text
使用 $book-video-production，参考我提供的视频，为《百年孤独》制作高级文学风格短视频。
```

### 可选依赖

Skill 本身不绑定供应商。根据制作路线选择：

- HyperFrames：HTML/CSS/GSAP 视频编排、预览与渲染
- Remotion：React/TypeScript 模板化与批量视频
- FFmpeg / FFprobe：媒体分析、抽帧、混音和验证
- 任意中文 TTS：Edge TTS、火山引擎、ElevenLabs 或人工配音
- 任意转写工具：用于从最终旁白获得字幕时间
- 图片生成器或合法授权素材库

缺少渲染工具时，Skill 仍可交付研究、旁白、分镜、素材计划和制作清单。

### 默认成片规格

- 30 秒
- 1080×1920
- 30 fps
- 中文
- 4–6 个语义场景
- 独立发布封面
- 旁白优先、轻缓配乐

### 仓库结构

```text
skills/book-video-production/
├── SKILL.md
├── agents/openai.yaml
└── references/
    ├── editorial-style.md
    ├── music-mix.md
    ├── premium-literary-style.md
    ├── production-schema.md
    ├── quality-gates.md
    └── visual-assets-and-cover.md
```

### 设计原则

1. 先写事实与旁白，再制作画面。
2. 字幕时间来自最终音频，不靠人工猜测。
3. 学习参考视频的结构，不复制其文案、品牌、画面或具体声音身份。
4. 不擅自使用商业书封、影视剧照、角色形象或在世艺术家的可识别风格。
5. 音乐服务旁白，通常先从比旁白低 12–20 dB 的范围开始试听。
6. 通过质量门后才渲染最终 MP4。

## English

`book-video-production` is a Codex skill for producing fact-based vertical book videos for Douyin, Xiaohongshu, TikTok, and similar platforms.

It coordinates research, natural Chinese narration, reference analysis, storyboarding, original visual planning, cover design, TTS, caption timing, restrained music, HyperFrames or Remotion authoring, inspection, and rendering.

Install the folder under `skills/book-video-production` into your Codex skills directory, restart Codex, then invoke `$book-video-production`.

The workflow is provider-neutral. Rendering, image generation, speech generation, and transcription tools are optional capabilities selected at runtime.

## Validation

```bash
python scripts/validate_skill.py
```

## License

MIT. Generated media and third-party assets retain their own licenses; users are responsible for verifying publishing rights.

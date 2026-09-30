<div align="center">

<img src="brand/logo-horizontal.png" alt="IMPULSO IA" width="420">

# IMPULSO IA · Video Skills

*Crecimiento ágil · IA nativa*

![Repos clonados](https://img.shields.io/badge/repos_clonados-101-blue)
![Categorías](https://img.shields.io/badge/categorías-5-green)
![Catálogo fuente](https://img.shields.io/badge/catálogo_fuente-204-orange)
![Tamaño](https://img.shields.io/badge/tamaño-~2.4_GB-informational)

**🌐 Landing navegable:** [online en GitHub Pages](https://nikopradopalma17-art.github.io/impulso-video-skills/) · o abre [`index.html`](index.html) en local

</div>

---

Los mejores repos open-source de skills de video para agentes de código, consolidados en un solo lugar. Este repo parte del catálogo [awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) de **zhuyansen** (204 repos indexados), lo filtra a las **5 categorías clave** con **stars ≥ 10**, y clona cada repositorio en carpetas numeradas y listas para usar.

Son **101 repos (~2.4 GB)** de frameworks, explainers, edición, shorts y motion graphics. Cada skill viene con sus ejemplos, docs y scripts propios: cópiala al directorio de skills de tu agente (Claude Code, Codex, ZCode, Cursor…) y a producir. Clones superficiales (`--depth 1`), sin historial git: solo el contenido útil.

Sin humo: no vendemos diapositivas, construimos resultados. Este catálogo existe para que cualquier equipo monte su pipeline de video con agentes en una tarde, no en un trimestre.

**¿No sabes qué estilo usar?** Abre el landing: la **Galería de estilos** (sección 00) muestra cada lenguaje visual de IMPULSO IA animado en un GIF — *pizarra blanca, pizarra negra, ciencia animada, gráfico de datos, isométrico, Bauhaus y linograbado* — con la explicación de qué hace a cada uno y cuándo usarlo. Pídelos por su nombre en tu brief y el motor de estilos los reproduce. Además, las descripciones del catálogo están traducidas al español.

---

## 01 · Estructura del repo

```text
impulso-video-skills/
├── 01-frameworks/   🧱  20 repos · 1077 MB   Frameworks y toolkits
├── 02-explainers/   🎓  26 repos ·  440 MB   Explainers y divulgación
├── 03-edicion/      ✂️  34 repos ·  497 MB   Edición de video
├── 04-shorts/       📱  11 repos ·  285 MB   Shorts y social
├── 05-motion/       🎞  10 repos ·  185 MB   Motion graphics
├── brand/                        Logos IMPULSO IA + GIFs de la galería de estilos
├── datos/                        traducciones.json (ES) + estilos.json (metadatos de la galería)
├── docs/                         Sitio para GitHub Pages (/docs) + fuente/ con el catálogo original
├── scripts/                      clonar_repos.py · generar_indice.py · preparar_pages.py
├── index.html                    Landing navegable del catálogo
├── indice.js                     Datos del índice para el landing
└── indice.json                   Índice maestro: 204 repos (101 clonados + 103 externos)
```

Total: **101 repos · ~2.4 GB**. Cada subcarpeta sigue el patrón `owner--repo` (p. ej. `02-explainers/adithya-s-k--manim_skill`) y conserva el `LICENSE` original del proyecto.

---

## 02 · Índice maestro

Cada tabla lista **todos los repos clonados** de la categoría, ordenados por estrellas (desc).

Leyenda: ✓ = seguridad `safe` · ⚠ = `caution` (revisar antes de ejecutar sus scripts) · `—` = sin licencia declarada en GitHub · `NOASSERTION` = licencia personalizada no estándar.

### 🧱 Frameworks y toolkits (`01-frameworks`)

| Repositorio | ⭐ | Licencia | Seguridad | Qué hace |
|---|---:|---|:---:|---|
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | 61947 | AGPL-3.0 | ✓ | World's first open-source, agentic video production system. 12 production pipelines, 100+… |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 54384 | Apache-2.0 | ✓ | Write HTML. Render video. Built for agents. |
| [hypit-ai/hypit](https://github.com/hypit-ai/hypit) | 17871 | NOASSERTION | ✓ | Clone any viral video with AI agents. Not just a script, the whole workflow: swap the face… |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | 4777 | — | ✓ | Agent Skills |
| [NarratorAI-Studio/narrator-ai-cli-skill](https://github.com/NarratorAI-Studio/narrator-ai-cli-skill) | 2979 | MIT | ✓ | AI 解说大师 — Agent skill；封装 narrator-ai-cli 供 Claude/Codex 等工具调用 |
| [digitalsamba/claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit) | 2151 | MIT | ✓ | AI-native video production toolkit for Claude Code |
| [vibe-motion/skills](https://github.com/vibe-motion/skills) | 1294 | — | ✓ | agent skills for vibe motion |
| [iart-ai/motion-skills](https://github.com/iart-ai/motion-skills) | 598 | MIT | ✓ | 50 open-source skills that teach your AI coding agent to make motion graphics, animation &… |
| [bangtutorial/bang-motion](https://github.com/bangtutorial/bang-motion) | 548 | MIT | ✓ | Agent skill for browser motion graphics — openers, promos, bumpers, kinetic typography, an… |
| [kangarooking/director-skills](https://github.com/kangarooking/director-skills) | 156 | MIT | ✓ | 导演Skill：面向 AI 视频创作的开源 Agent Skills \| Director Skills: Open-source Agent Skills for AI vid… |
| [video-db/skills](https://github.com/video-db/skills) | 122 | MIT | ✓ | Server-side video workflows for agents: ingest, understand, search, edit, stream. |
| [jhartquist/claude-remotion-kickstart](https://github.com/jhartquist/claude-remotion-kickstart) | 120 | MIT | ✓ | Create videos programmatically with Claude Code and Remotion |
| [Johnson-Jia/video-clipforge](https://github.com/Johnson-Jia/video-clipforge) | 39 | Apache-2.0 | ✓ | AI 驱动的短视频制作系统。给它一个想法，它帮你写稿、配音、做画面、出成片。9 阶段 DAG 管线 + 自进化评分，支持每日自动执行。基于 Claude Code + HyperF… |
| [iart-ai/motion-design-skills](https://github.com/iart-ai/motion-design-skills) | 39 | MIT | ✓ | Motion design fundamentals, engines, and brand elements as installable Claude Code skills… |
| [zhouyuechuan2025-ui/ai-self-media-video-packaging-skill](https://github.com/zhouyuechuan2025-ui/ai-self-media-video-packaging-skill) | 36 | MIT | ✓ | Open Agent Skill for packaging talking-head videos with Remotion, optional HyperFrames, se… |
| [GordenSun/react-bits-video](https://github.com/GordenSun/react-bits-video) | 28 | NOASSERTION | ✓ | 结合react-bits、remotion、hyperframe整合的Skill，可以生成华丽的视频。 |
| [bbylw/hyperframes-cn](https://github.com/bbylw/hyperframes-cn) | 28 | MIT | ✓ | HyperFrames 是一个开源框架，可将 HTML、CSS、媒体与可定位（seekable）动画转化为确定性的 MP4 视频。你可以在本地通过 CLI 使用它，让 AI 编程智… |
| [smwbev/framewright](https://github.com/smwbev/framewright) | 21 | MIT | ✓ | Agent skill + template: short videos made entirely from code. One HTML file, every frame a… |
| [doublesq97-ui/su-card-to-video](https://github.com/doublesq97-ui/su-card-to-video) | 18 | MIT | ✓ | Minimal HTML/CSS card-to-video starter skill using HyperFrames, GSAP, and FFmpeg. |
| [gloweaseco-leo/hyperdirector](https://github.com/gloweaseco-leo/hyperdirector) | 17 | Apache-2.0 | ✓ | Hermes Skill Pack for structured AI video production on HyperFrames — brief → storyboard →… |

### 🎓 Explainers y divulgación (`02-explainers`)

| Repositorio | ⭐ | Licencia | Seguridad | Qué hace |
|---|---:|---|:---:|---|
| [EverMind-AI/Raven](https://github.com/EverMind-AI/Raven) | 4894 | Apache-2.0 | ✓ | Direct a two-minute hand-drawn animated film from a repository's Git history: story, chara… |
| [Alisa0808/vox-director](https://github.com/Alisa0808/vox-director) | 2092 | MIT | ✓ | Turn one topic into a finished Vox-style paper-collage explainer/ad video — automated end… |
| [Vincentwei1021/video-talkcraft](https://github.com/Vincentwei1021/video-talkcraft) | 1309 | NOASSERTION | ✓ | Agent skill that turns Claude Code / Codex into a motion-design studio for voiceover-drive… |
| [adithya-s-k/manim_skill](https://github.com/adithya-s-k/manim_skill) | 1130 | MIT | ✓ | Agent skills for Manim to create 3Blue1Brown style animations. |
| [wshuyi/remotion-video-skill](https://github.com/wshuyi/remotion-video-skill) | 385 | — | ⚠ | A Claude Code Skill for creating programmatic videos with Remotion framework |
| [shuyicc/MathLens](https://github.com/shuyicc/MathLens) | 360 | — | ✓ | MathLens 是一个专注于数学题目视频讲解的 Agent Skill。你只需粘贴一道数学题（图片或文字），它就能自动完成从题目分析、可视化讲解、配音脚本到 Manim 动画视频… |
| [hi-nikola/hand-drawn-explainer-video-nikola](https://github.com/hi-nikola/hand-drawn-explainer-video-nikola) | 355 | Apache-2.0 | ✓ | 中文手绘知识讲解视频 Codex Skill：逐笔故事、双语义岛、让怪诞小黑动起来与程序动画 |
| [Anil-matcha/vox-ai-motion-graphics-generator](https://github.com/Anil-matcha/vox-ai-motion-graphics-generator) | 227 | — | ✓ | 🎬 Turn any topic into a finished Vox-style paper-collage explainer / motion graphics video… |
| [runesleo/claude-video-kit](https://github.com/runesleo/claude-video-kit) | 120 | MIT | ✓ | Agent Skill + Remotion pipeline: brief/script → review receipt → narrated 9:16 explainer.… |
| [sunxiayi/make-blender-education-video-skill](https://github.com/sunxiayi/make-blender-education-video-skill) | 47 | MIT | ✓ | A Codex and Claude Code skill for creating fact-checked cinematic educational videos with… |
| [znyupup/knowledge-explainer-skill](https://github.com/znyupup/knowledge-explainer-skill) | 45 | MIT | ✓ | 把一份 markdown 文稿，自动生成讲解动画视频 — Powered by Remotion + AI Agent |
| [Anil-matcha/zack-d-films-ai-video-generator](https://github.com/Anil-matcha/zack-d-films-ai-video-generator) | 41 | — | ✓ | 🎬 Turn any topic into a finished Zack D Films-style 3D animated short — curiosity-loop scr… |
| [AmitSubhash/3brown1blue](https://github.com/AmitSubhash/3brown1blue) | 36 | MIT | ✓ | First-principles Manim skill for Claude Code — mathematical animation from scratch, paper-… |
| [santmun/video-vox](https://github.com/santmun/video-vox) | 32 | — | ✓ | Crea shorts verticales animados estilo Vox sobre cualquier tema con Claude Code + Remotion… |
| [Mr-funny/hbg-douyin-code-explainer-video](https://github.com/Mr-funny/hbg-douyin-code-explainer-video) | 31 | — | ✓ | HBG Codex skill for deterministic Chinese 9:16 HyperFrames explainer videos with dialogue… |
| [vibe-motion/remotion-code-motion-explainer](https://github.com/vibe-motion/remotion-code-motion-explainer) | 31 | MIT | ✓ | AI Agent skill for continuous, editable Remotion explainers — created by Bingo |
| [iart-ai/explainer-video-skills](https://github.com/iart-ai/explainer-video-skills) | 28 | MIT | ✓ | Explainer video skills for Claude Code: script, storyboard, and render narrated explainers… |
| [Phantomlau3674/voxstylehub-steven](https://github.com/Phantomlau3674/voxstylehub-steven) | 24 | MIT | ✓ | Standalone Codex skill for Vox-inspired editorial collage knowledge videos with determinis… |
| [Mng-dev-ai/explainer-video](https://github.com/Mng-dev-ai/explainer-video) | 19 | MIT | ✓ | AI skill that turns any topic into an animated narrated explainer video. Runs locally, fre… |
| [holy-templar/vox-animated-ad-mcp](https://github.com/holy-templar/vox-animated-ad-mcp) | 19 | AGPL-3.0 | ✓ | Vox-style paper-collage animated video skill for AI agents — Claude + MaxFusion AI MCP (Go… |
| [aijiduonadegou/Paper-Cut](https://github.com/aijiduonadegou/Paper-Cut) | 17 | MIT | ✓ | 无需视频模型，即可制作拼贴动画的skill。用图像模型定稿、原图拆层与 HyperFrames 代码动画制作可编辑 Paper Cut / Vox 风格纸拼贴科普视频；支持三阶段审… |
| [chenyuxiaojin/cyxj-hyperframes](https://github.com/chenyuxiaojin/cyxj-hyperframes) | 16 | MIT | ✓ | Open-source HTML+GSAP video projects & reusable toolkit for Claude Code tutorial videos, p… |
| [cclank/lanshu-html2video-skill](https://github.com/cclank/lanshu-html2video-skill) | 15 | MIT | ✓ | Turn web articles into polished 1080p videos with Codex and Remotion |
| [vakovalskii/nd-video-studio](https://github.com/vakovalskii/nd-video-studio) | 15 | MIT | ✓ | Explainer videos from HTML (HyperFrames → MP4) with AI narrator, music and mixing — Claude… |
| [Science-Prof-Robot/recursive-math-animator](https://github.com/Science-Prof-Robot/recursive-math-animator) | 13 | MIT | ✓ | Cursor and Claude Code skill: Manim animations, manim-voiceover, git-based scene versionin… |
| [kakaxi12/vox-director-codex](https://github.com/kakaxi12/vox-director-codex) | 12 | — | ✓ | Codex skill for creating Vox-style editorial paper-collage videos with ImageGen, HyperFram… |

### ✂️ Edición de video (`03-edicion`)

| Repositorio | ⭐ | Licencia | Seguridad | Qué hace |
|---|---:|---|:---:|---|
| [FireRedTeam/FireRed-OpenStoryline](https://github.com/FireRedTeam/FireRed-OpenStoryline) | 3456 | Apache-2.0 | ✓ | FireRed-OpenStoryline is an AI video editing agent that transforms manual editing into int… |
| [Agentchengfeng/chengfeng-videocut-skills](https://github.com/Agentchengfeng/chengfeng-videocut-skills) | 3025 | Apache-2.0 | ✓ | 用 Claude Code Skills 做的视频剪辑 Agent |
| [0xsline/OpenChatCut](https://github.com/0xsline/OpenChatCut) | 2061 | AGPL-3.0 | ✓ | Open-source, local-first conversational AI video editor with a professional multi-track ti… |
| [cartesiancs/cartcut](https://github.com/cartesiancs/cartcut) | 759 | MIT | ✓ | Video Editor for AI agents, built on the belief that open source can beat commercial tools |
| [hetpatel-11/Adobe_Premiere_Pro_MCP](https://github.com/hetpatel-11/Adobe_Premiere_Pro_MCP) | 630 | MIT | ✓ | Adobe Premiere Pro MCP. Tools for AI-driven video editing via MCP, for Codex, Claude, and… |
| [zenstory-ai/video-recap-skills](https://github.com/zenstory-ai/video-recap-skills) | 541 | MIT | ✓ | Claude Code / Codex skills that turn a video into a Chinese narration recap (视频解说)： scene… |
| [JimLiu/baocut](https://github.com/JimLiu/baocut) | 522 | MIT | ✓ | Open-source Agent Skill that drives the BaoCut macOS app CLI (transcribe · subtitle · tran… |
| [hassancs91/claude-youtube-editor](https://github.com/hassancs91/claude-youtube-editor) | 316 | MIT | ✓ | Record the talking head, Claude Code does the rest: the cut, the visuals, the voice, the s… |
| [leancoderkavy/premiere-pro-mcp](https://github.com/leancoderkavy/premiere-pro-mcp) | 307 | MIT | ✓ | Adobe Premiere Pro MCP — independent, local-first server for supported workflows. Connect… |
| [AgriciDaniel/claude-shorts](https://github.com/AgriciDaniel/claude-shorts) | 218 | MIT | ✓ | Interactive longform-to-shortform video creator — Claude Code skill with Remotion-rendered… |
| [erduo1998-cell/erduo-broll-loop-engineering](https://github.com/erduo1998-cell/erduo-broll-loop-engineering) | 205 | MIT | ✓ | SRT 驱动的双后端 B-roll Agent Skill：自动路由 HyperFrames / Remotion，集成 152 张 Shotcraft 镜头卡 |
| [Cassette-Editor/oh-my-cassette](https://github.com/Cassette-Editor/oh-my-cassette) | 158 | MIT | ✓ | 你的随身 AI 剪辑搭档 \| Pocket AI co-editor for video montage — AI video editing plugin & MCP serv… |
| [YeJe-cpu/SeeCut](https://github.com/YeJe-cpu/SeeCut) | 152 | NOASSERTION | ✓ | An AI editor that watches its own cut: talking-head / AI-avatar video → auto-edited short… |
| [znyupup/ai-video-editing-skill](https://github.com/znyupup/ai-video-editing-skill) | 138 | MIT | ✓ | AI Agent Skill for automated vlog editing. Feed raw footage, get a finished video. Powered… |
| [blixvip/easyedit](https://github.com/blixvip/easyedit) | 135 | MIT | ✓ | Type a movie, get a captioned speech + beat-cut fan edit. Local-first, no API keys, works… |
| [naive-kun/naive-video-skill](https://github.com/naive-kun/naive-video-skill) | 130 | MIT | ✓ | A Codex skill for turning talking-head videos into captioned, animated final videos. |
| [Monet-AI-Editor/Monet](https://github.com/Monet-AI-Editor/Monet) | 116 | MIT | ✓ | Edit Videos and Design Images with Claude code or Codex |
| [ayushozha/AdobePremiereProMCP](https://github.com/ayushozha/AdobePremiereProMCP) | 111 | MIT | ✓ | 🎬 AI-powered MCP server for Adobe Premiere Pro — 1,027 tools for timeline editing, color g… |
| [louisedesadeleer/cut-video](https://github.com/louisedesadeleer/cut-video) | 104 | MIT | ✓ | Claude Code skill: tighten long recordings — remove silences, ums, dead air. Preserves lau… |
| [AKMessi/vex](https://github.com/AKMessi/vex) | 85 | NOASSERTION | ✓ | claude code for video editing |
| [JUNKDOGE-JOE/after-effects-mcp](https://github.com/JUNKDOGE-JOE/after-effects-mcp) | 75 | MIT | ✓ | Agent-driven Adobe After Effects automation. MCP server + CEP plugin enabling Codex/Cursor… |
| [kurbaitaev/ghost-editor](https://github.com/kurbaitaev/ghost-editor) | 63 | MIT | ✓ | AI video editor for talking-head reels: 7 styles, face-safe captions, motion scenes, rever… |
| [hahadu4520/vlog-cut](https://github.com/hahadu4520/vlog-cut) | 49 | NOASSERTION | ✓ | Narration-driven video editing pipeline for Claude Code · 给 Claude Code 用的「按文案剪辑」流水线 |
| [ops120/video-recap-skills-plus](https://github.com/ops120/video-recap-skills-plus) | 40 | MIT | ⚠ | Clip any video into a narration recap with claude code skill｜用claude code skill把任何视频剪辑成中文解… |
| [Kappaemme-git/codex-video-short-maker-skill](https://github.com/Kappaemme-git/codex-video-short-maker-skill) | 35 | MIT | ✓ | — |
| [darrenli6/JJKoubo](https://github.com/darrenli6/JJKoubo) | 33 | NOASSERTION | ✓ | JJ Koubo (JJ口播) is a local-first collection of video editing Skills for talking-head, inte… |
| [krusemediallc/video-editor-agent](https://github.com/krusemediallc/video-editor-agent) | 21 | — | ✓ | Claude Code skill pack: edit short-form videos end to end — style-clone a reference reel,… |
| [manthanpatelll/leadgenman-video-skills](https://github.com/manthanpatelll/leadgenman-video-skills) | 18 | MIT | ✓ | Six Claude Code skills for an automated video content pipeline: produce, srt, ytdescriptio… |
| [jincheng2026/jc-remotion-skills](https://github.com/jincheng2026/jc-remotion-skills) | 14 | NOASSERTION | ✓ | Remotion Koubo Skill — 口播视频的 AI 成片工作流（Codex / Claude Code 双端）：粗剪+SRT 进，带 MG 包装、音效、母带的成片出 |
| [cocolayuan/videoclip-AI-skill](https://github.com/cocolayuan/videoclip-AI-skill) | 13 | MIT | ✓ | Claude Skill-powered video editing toolkit - 视频全自动剪辑 |
| [PoetCoderJun/MotionTalk](https://github.com/PoetCoderJun/MotionTalk) | 12 | NOASSERTION | ✓ | Turn an edited talking video into a polished motion-graphics video with one Agent Skill. |
| [ZiadAbdelkarim/beat-synced-edit](https://github.com/ZiadAbdelkarim/beat-synced-edit) | 11 | MIT | ✓ | Automatic beat-synced video editing: feed it a song and raw footage, it analyzes beats, en… |
| [misbahsy/tiktok-ig-shorts](https://github.com/misbahsy/tiktok-ig-shorts) | 11 | — | ✓ | Generate Viral Tiktok and Instagram Shorts using Hyperframes with Claude and Codex |
| [qingyunAGI/qingyun-cine-skill](https://github.com/qingyunAGI/qingyun-cine-skill) | 10 | — | ✓ | qingyun-cine-skill: PLAN-FIRST cinematic video editing Codex skill for trailers, beat-sync… |

### 📱 Shorts y social (`04-shorts`)

| Repositorio | ⭐ | Licencia | Seguridad | Qué hace |
|---|---:|---|:---:|---|
| [Yuuhann1999/codex-storyboard](https://github.com/Yuuhann1999/codex-storyboard) | 348 | MIT | ✓ | 本地多项目 Codex 视频分镜工作台，支持图片/视频生成任务、HyperFrames 与 Remotion 自动回填。Local multi-project storyboard… |
| [hassancs91/claude-faceless-shorts-creator](https://github.com/hassancs91/claude-faceless-shorts-creator) | 271 | MIT | ✓ | A faceless YouTube-Shorts factory driven by Claude Code: pure-TSX Remotion visuals, Eleven… |
| [jaxxchen003/book-video-factory](https://github.com/jaxxchen003/book-video-factory) | 105 | MIT | ✓ | Portable Codex skill for auditable, rights-aware Chinese book-review short-video workflows… |
| [Maartenlouis/remotion-ads](https://github.com/Maartenlouis/remotion-ads) | 60 | MIT | ✓ | Claude Code skill for creating Instagram Reels & Carousel ads with Remotion |
| [pyang5166/gbro-collage-info](https://github.com/pyang5166/gbro-collage-info) | 51 | MIT | ✓ | 半调纸拼贴风信息动画 Agent Skill · Halftone paper-collage info-graphic animations from voiceover scr… |
| [liangdabiao/story-handdrawn-video](https://github.com/liangdabiao/story-handdrawn-video) | 48 | — | ✓ | 把一段 中文/英文 故事文本变成 9:16 竖屏（720×1280）手绘蜡笔风短视频。Remotion 技术的视频 Skill。基于 Agnes Video V2.0（纯文生视频，… |
| [yuwenbin121/book-video-production-skill](https://github.com/yuwenbin121/book-video-production-skill) | 17 | MIT | ✓ | A Codex skill for producing fact-based vertical book videos |
| [klsoen/opus-js-animations](https://github.com/klsoen/opus-js-animations) | 15 | MIT | ✓ | Claude Opus 5.5 directs and renders films in JavaScript: brief → sound (file, YouTube, gen… |
| [intelligent-iterations/ii-content-engine](https://github.com/intelligent-iterations/ii-content-engine) | 14 | MIT | ✓ | AI-powered content generation and auto-posting engine built for Claude Code and Codex. Gen… |
| [iart-ai/tiktok-video-skills](https://github.com/iart-ai/tiktok-video-skills) | 12 | MIT | ✓ | Short-form video skills for Claude Code — engineer Reels, TikToks, and YouTube Shorts that… |
| [adriiita/vertical-video-editing-skill](https://github.com/adriiita/vertical-video-editing-skill) | 10 | MIT | ✓ | Claude skill: turn a script + talking-head media into a polished, creator-grade vertical 9… |

### 🎞 Motion graphics (`05-motion`)

| Repositorio | ⭐ | Licencia | Seguridad | Qué hace |
|---|---:|---|:---:|---|
| [diffusionstudio/lottie](https://github.com/diffusionstudio/lottie) | 5526 | MIT | ✓ | Generate production-ready Lottie animations with Claude Code or Codex |
| [nolangz/pixel2motion](https://github.com/nolangz/pixel2motion) | 2359 | MIT | ✓ | AI logo animation skill: turn raster logos into smooth SVG animation, animated HTML demos,… |
| [pyang5166/gbro-collage-broll](https://github.com/pyang5166/gbro-collage-broll) | 1315 | MIT | ✓ | 半调纸拼贴 B-roll 生成 skill：三闸门审批，Gemini Omni Flash 首尾帧组装动画 \| Editorial halftone paper-collage… |
| [alexgreensh/anidoodle](https://github.com/alexgreensh/anidoodle) | 708 | Apache-2.0 | ✓ | Art and animation, written as code. Illustrations, loops, interactive web art, launch-vide… |
| [MegaTroll222/VOX-COLLAGE-BROLL](https://github.com/MegaTroll222/VOX-COLLAGE-BROLL) | 213 | NOASSERTION | ✓ | Turn one spoken line into a paper-collage explainer video — Claude Code skill + MaxFusion… |
| [Liamrjohnston/remotion-motion-graphics-skill](https://github.com/Liamrjohnston/remotion-motion-graphics-skill) | 76 | MIT | ✓ | Production-ready Remotion motion graphics skills for AI video workflows |
| [AgriciDaniel/claude-gif](https://github.com/AgriciDaniel/claude-gif) | 28 | MIT | ✓ | Ultimate GIF creator skill for Claude Code. 6 generation pipelines: Remotion, Veo 3.1, SVG… |
| [HRuiCcc/RuiC-motion-reel](https://github.com/HRuiCcc/RuiC-motion-reel) | 24 | NOASSERTION | ✓ | 用代码生成 15 秒动态图形成片 · Agent Skill。交付 1920×1080 / 30fps。自研渲染引擎：2× 超采样矢量/文字 + 真 3D 点云 + 丝网印四色分色… |
| [toufuim/personal-ip-brand-intro-skill](https://github.com/toufuim/personal-ip-brand-intro-skill) | 20 | MIT | ✓ | 開源 Codex Skill：用文字、原創插圖或使用者圖片製作個人 IP 品牌開場，支援上傳音樂對拍與無音樂自主節拍。 |
| [fernandokaraka/remotion-motion-graphics-skill](https://github.com/fernandokaraka/remotion-motion-graphics-skill) | 11 | MIT | ✓ | Claude Code skill: build animated motion graphics as real video with Remotion — title card… |

---

## 03 · Cómo usar una skill con tu agente

1. **Busca.** Abre el landing `index.html` en tu navegador o busca en este índice (`indice.json` o las tablas de arriba). Cada entrada indica categoría, estrellas, licencia y qué hace.
2. **Copia la carpeta.** Lleva la carpeta de la skill al directorio de skills de tu agente:
   - Claude Code: `~/.claude/skills/`
   - Otros agentes (Codex, ZCode, Cursor…): su directorio de skills equivalente.
3. **Invócala.** Pídele al agente que lea el `SKILL.md` de la carpeta o refiérete a la skill por su nombre en tu prompt.
4. **Profundiza.** Cada repo incluye sus propios docs, ejemplos y scripts dentro de la carpeta: revisa su README interno antes de escalar el uso.

Ejemplo:

```bash
cp -r 02-explainers/adithya-s-k--manim_skill ~/.claude/skills/manim_skill
```

---

## 04 · Seguridad y licencias

- **Licencias.** Cada repo mantiene su `LICENSE` dentro de su carpeta; este consolidado no modifica el contenido de terceros. La columna Licencia refleja lo que reporta GitHub: `—` = sin licencia declarada (13 repos), `NOASSERTION` = licencia personalizada. Revisa ambas antes de cualquier uso comercial.
- **Seguridad.** El catálogo marca con ⚠ los repos con estado `caution` (revisar sus scripts antes de ejecutarlos). En este consolidado son dos: `wshuyi/remotion-video-skill` y `ops120/video-recap-skills-plus`. El resto está marcado ✓ (`safe`).
- **Créditos completos.** Autor, licencia y URL original de cada repo clonado: ver [ATTRIBUTION.md](ATTRIBUTION.md).
- **Fuente.** README original y `skills.json` del catálogo fuente en [`docs/fuente/`](docs/fuente/).

---

## 05 · Actualizar el consolidado

El clonador es **reanudable**: salta los repos ya clonados, así que puedes re-ejecutarlo sin miedo a repetir trabajo.

```bash
# Re-clonar una categoría (reanudable)
python scripts/clonar_repos.py --categoria editing

# Todas las categorías, con umbral de estrellas y workers en paralelo
python scripts/clonar_repos.py --categoria todas --min-stars 10 --workers 3

# Regenerar el índice (indice.json / indice.js) con el mismo umbral
python scripts/generar_indice.py --min-stars 10
```

- `--categoria` acepta `general`, `explainer`, `editing`, `shorts`, `motion` o `todas`.
- `--min-stars` cambia el umbral de selección (por defecto `10`): súbelo para un catálogo más estrecho, bájalo para ampliarlo.
- Cada ejecución deja un reporte CSV en `scripts/reporte-clones-<categoria>.csv` con estado, tamaño y licencia por repo.
- Tras clonar, regenera el índice con `generar_indice.py` para que el landing y este README reflejen el estado real.

---

<div align="center">

Catálogo fuente: [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills)

**Consolidado por IMPULSO IA** · *Crecimiento ágil · IA nativa* · [impulso.soynikolas.com](https://impulso.soynikolas.com)

</div>

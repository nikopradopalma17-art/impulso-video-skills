# Vox-Inspired Editorial Video Skill

> 把一段知识口播，变成具有视觉野心、编辑拼贴质感和可精确修改结构的 Vox-inspired 视频。

**仓库名**：`voxstylehub-steven` ｜ **内部 Skill 目录名**：`xingchen-vox-collage`

[English README](README.en.md)

---

## 15 秒说清能做什么

这是一个给知识 / 历史 / 科学 / 人文 / 传记类短视频创作者用的 Codex Skill。你给它一段口播稿，它用 **Codex + Remotion + 可选生图/生视频工具** 产出一支原创的「编辑拼贴（editorial paper-collage）」风格解说视频：

- 精确的文字、数字、图表、时间全部由 Remotion 代码控制——改一个字不用重新生图；
- 背景 / 主体 / 道具 / 前景是独立分层资产，可以单独修改、单独替换；
- 开工前先做一段轻量创意展开，主动寻找素材机会、空间机制和有叙事作用的动效；
- 生视频积分只花在真正需要连续材质运动的关键镜头上，其余画面全部确定性渲染。

## 流程图（文字版）

```
口播 → 创意展开 → 视觉命题 → Hero/代表帧 → 独立素材 → 叙事动效 → 成片
```

1. **口播**：你提供口播稿或真实录音时间轴；
2. **创意展开**：用一小段自由文字比较可能的视觉路线、素材机会、稀疏风险和动效叙事方式，不填表、不打分；
3. **视觉命题**：每场写一句视觉命题（不是名词清单），确定这一场要在画面上证明什么；
4. **Hero / 代表帧**：默认先审定格关键帧；如果意义只存在于运动中，则审运动代表帧并说明理由；
5. **独立素材与动效**：背景 / 主体 / 道具 / 前景按实际创意拆分，动效承担建立层级、因果或转折，不为热闹而动；
6. **成片**：严格技术验证 + 人工看片。验证器证明工件存在与输入一致，人判断手机尺寸下是否真的好看、可读。

## 最短安装

把 `xingchen-vox-collage/` 复制到 Codex 的 skills 目录（`~/.codex/skills/` 或 `~/.agents/skills/`）即可。

Windows（PowerShell）：

```powershell
Copy-Item -Recurse .\xingchen-vox-collage "$env:USERPROFILE\.codex\skills\"
```

macOS / Linux（bash）：

```bash
cp -r xingchen-vox-collage ~/.codex/skills/
```

依赖：

- **FFmpeg**：必装（严格验证与证据生成需要解码视频）；
- **Python 3.10+**：必装（Skill 自带的初始化 / 验证 / 证据脚本）；
- **Node 18+ + Remotion**：可选，仅当你的项目用 Remotion 渲染时才需要。

## 最短使用 Prompt

```
用 xingchen-vox-collage 把下面口播制作成 Vox-inspired 编辑拼贴视频。开工前先用一小段文字比较几种视觉路线，主动寻找素材机会并指出最可能变空或重复的段落；再提炼视觉命题、审 Hero Frame 或运动代表帧，按创意需要拆分独立素材。精确文字和时间由 Remotion 控制，动效必须帮助叙事。输出导演板、scene-spec、完整预览和严格验证证据。口播如下：……
```

## 三个失败与修复案例

这套工作流来自三类真实失败：能由脚本证明的部分自动检查，需要审美判断的部分明确留给人看。

### 1. `caption-only-static` —— 只有字幕在动的「假动画」

- **Before**：一整段解说区间里，画面上唯一变化的图层是字幕和标签；背景是一张静态图，本质上是一个会出字的 PPT。
- **After**：把画面拆成承担独立语义角色的分层（背景 / 主体 / 道具 / 前景），为每个独立 actor 分配 motion tier，错峰入场；验证器在发现「解说区间内只有字幕层在变化」时直接阻断分支。

### 2. `semantic-subject-too-small` —— 手机尺寸下主体变成邮票

- **Before**：在 27 寸显示器上看构图漂亮，但把手机下采样后发现核心语义主体缩成一枚邮票，大量面积被装饰性留白占据，观众根本不知道看哪里。
- **After**：在 Hero Frame 阶段生成手机下采样审查工件并真正看片。验证器只确认 `phone_review_ref` 等工件存在；主体比例、焦点层级和负空间是否通过，始终是人工判断。文件存在不等于看过，更不等于通过。

### 3. `transition-anchor-break` —— 相邻场切换丢弃连续性

- **Before**：相邻两场硬切之后，材质、物件、轨道、色场或运动的连续性全部断裂，观众的视觉锚点被抽走，却没有任何地方说明这是有意为之。
- **After**：转场必须声明继承锚点（material / object / rail / aperture / color-field / motion 至少其一），或者显式记录一次 intentional reset；验证器逐对检查相邻场的 transition contract。

## 高保真优先，低成本是降级能力

- **精确文字 / 图表 / 时间全由 Remotion 代码控制**：标题、中文文字、日期、数字、图表、地图、标注、字幕、证据高亮全部是代码渲染——免费、确定性、改一个字不用重新生图；
- **生视频积分只花在刀刃上**：只有真正需要连续材质运动（纸张飘动、烟雾、流体）的关键镜头才消耗生图 / 生视频模型的积分，其余全部确定性渲染；
- **零模型仍可验证流程**：完全没有生图模型时，可以用 code-native 的 SVG / 纯色纸张 / 半调圆点 / 剪纸边缘 / 几何道具完成画面。`examples/minimal-8s` 用来验证合同、渲染链和证据链，不代表这个视觉类型的质量上限。

一次效果良好的 86 秒制作实际用了 8 场、103 层、78 个已批准素材。这些只是单次制作事实，不是推荐区间或配额。Skill 驱动模型主动寻找足够的素材与画面机制，但最终密度由题材、节奏和看片结果决定。

## 示例边界

- `examples/minimal-8s`：可重复生成的技术 smoke fixture；证明安装、渲染、证据和严格验证可工作，不是黄金样片。
- `examples/creative-exploration-packet`：原创、可公开的创意任务包；展示怎样在不规定图层数和素材数的前提下提高视觉野心。它是设计包，不冒充已渲染成片。

## 高级

### 严格验证（validate_vox_branch.py）

```powershell
# 制作中：允许证据待补（缺失证据降级为警告）
python <skills-dir>\xingchen-vox-collage\scripts\validate_vox_branch.py <project-root> --allow-pending

# 交付前：严格模式（hero frame 分辨率、可播放片段、检查点、手机审查、相邻场转场契约全查）
python <skills-dir>\xingchen-vox-collage\scripts\validate_vox_branch.py <project-root>
```

带警告的 `PASS` 只代表结构可用，不代表视觉通过。

### 证据生成（make_visual_evidence.py / build_scene_evidence.py）

```powershell
# 渲染完单个片段后生成可视化证据（contact sheet、抽帧等）
python <skills-dir>\xingchen-vox-collage\scripts\make_visual_evidence.py <clip.mp4> <evidence-dir>

# 完整 master 合成后，按 Lean 场时间轴切出每场片段与 entry/settled/exit 帧
python <skills-dir>\xingchen-vox-collage\scripts\lock_vox_inputs.py <project-root> --write
python <skills-dir>\xingchen-vox-collage\scripts\build_scene_evidence.py <project-root> <evidence-dir>
```

`lock_vox_inputs.py` 会锁定实际音频字节、规范化场景时间数组和母版字节；任一输入变化后，旧 hero/playable 证据会在严格验证中失效。`build_scene_evidence.py` 需要 `project-state.json` 的最小 Lean-state 合同（`metadata.format`、`metadata.project_id`、`scenes` 时间轴等），并把相同指纹写入证据索引。仓库 `examples/minimal-8s` 附了可直接参考的最小夹具。**没有 project-state.json 时 `validate_vox_branch.py` 仍完全可用**——同步校验会自动跳过。证据目录非空时提取器拒绝覆盖。

### 与 Xingchen 家族的关系（可选集成，非依赖）

`xingchen-vox-collage` 的核心工作流**完全独立可用**：SKILL.md 中提到的 `xingchen-next`、`xingchen-lookdev`、`remotion-render-adapter` 都是可选集成点，没有这些 sibling skill 时，从视觉命题、Hero Frame、分层、Remotion 动画到严格验证的完整流程照常工作。

如果你的项目运行在 `xingchen-next` 体系下，`project-state.json` 同步是可选增强：存在 Lean state 时，严格验证会额外核对 `scene-spec.json` 与 `project-state.json` 的场顺序、beat_id、时间轴和 timeline revision 是否一致；不存在时自动跳过，不产生任何警告。

### 上游漂移检查（check-upstream-drift.ps1）

本仓库的 `xingchen-vox-collage/` 是从上游仓库确定性导出的字节级副本（见 [UPSTREAM.md](UPSTREAM.md)）。任何时候怀疑本地被改动：

```powershell
powershell -File .\scripts\check-upstream-drift.ps1
```

不传 `-UpstreamClone` 时会自动浅克隆上游 tag 到临时目录比对；任何核心文件差异都会红字报错并非零退出。

## 无生图 / 无生视频模型的降级路径

没有生图或生视频模型时，这个 Skill 不会瘫痪，降级路径是：

1. **画面资产全部 code-native**：SVG 插画、纯色纸张底板、半调圆点纹理、剪纸边缘、几何道具全部由代码生成，零模型调用；
2. **运动全部由 Remotion 承担**：slide / reveal / peel / pivot / stamp / drop / trace / wipe 等纸面原生动词 + 浅景深视差，完全确定性；
3. **真实素材裁切**：自有或授权的档案图、截图可以按 source-collage 路线裁成编辑拼贴纸片使用；
4. **验证不受影响**：严格验证、证据生成、手机下采样审查照常运行。

`examples/minimal-8s` 演示这条降级路径的技术可行性，不代表高保真视觉样片。

## 常见错误

- **FFmpeg 缺失**：依赖解码的检查（可播放片段、全片解码、证据生成）会明确报错 `ffmpeg is unavailable` 或 `ffmpeg is required`，绝不伪装成功；请先安装 FFmpeg 并确认其在 PATH 中。
- **证据目录非空**：`make_visual_evidence.py` / `build_scene_evidence.py` 拒绝覆盖非空证据目录，报 `refusing to overwrite`；换一个空目录或先归档旧证据。
- **scene-spec 与 project-state 不同步**：严格验证报 `scene-spec ... must match project-state ...`（场顺序 / beat_id / 时间轴偏差超过一帧 / timeline revision 不一致）。说明两个事实源有一个过期了——以 project-state 为准更新 scene-spec，或重新提取证据。
- **Hero frame 分辨率不符**：`hero_frame` 图像的分辨率必须与 `scene-spec.json` 声明的 width/height 一致，否则严格验证报错；请按目标分辨率重新出 Hero Frame，不要缩放凑数。
- **输入指纹过期**：替换口播、调整场景时间或覆盖母版后，严格验证会报告 fingerprint stale。重新运行 `lock_vox_inputs.py --write`，重建证据，并把新的 `evidence_input_fingerprint` 记录到已审查的 hero/playable 合同中；不要给旧证据手工贴新指纹。

## 许可证与声明

- 本仓库代码与原创文档采用 [MIT 许可证](LICENSE)（Copyright (c) 2026 Phantomlau3674），MIT 只覆盖代码与原创文档；
- 第三方模型（生图 / 生视频 / TTS 等）的输出遵循对应服务的条款；
- 用户输入素材（口播、图片、档案素材）的权利由用户自证；
- "Vox" 名称仅用于描述一种视觉类型。本项目 **not affiliated with Vox, nor does it copy Vox trademarks, layouts, or specific works**（与 Vox 无任何隶属关系，也不复制其商标、版式或具体作品）；复用的是因果语法，不是包装；
- 仓库示例不包含任何第三方受限素材。

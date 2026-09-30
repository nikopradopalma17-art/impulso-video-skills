# Remotion Koubo Skill

口播视频的 AI 成片工作流，Codex 与 Claude Code 双端通用。你给一条口播粗剪和一份 SRT 字幕，它交回一条带 MG 信息包装、音效和母带的成片。

它不只是一份提示词。从对标杆风格基准片的逐帧拆解和多条片实战返工中，沉淀出 **6 个 Skill、近 2000 行规则、34 条错题集、45 个文件的工程底座和 6 个管线脚本**——覆盖端到端流程、设计系统硬约束、B-roll 素材工程、配声语法、自动质检和增量渲染，目标是让第一次剪视频的人也知道下一步该做什么。

[快速开始](#快速开始) · [安装](#安装) · [能力一览](#能力一览) · [它怎样工作](#它怎样工作) · [更新日志](https://github.com/jincheng2026/jc-remotion-skills/releases)

本次更新（v1.2.0）：① 全面支持 Windows：管线脚本全部改为 Node 实现（无需 WSL），新增 `setup.ps1` 一键安装，硬件编码与字幕字体按平台自动适配；② 代码完整性修复，建议更新到本版本；③ 新增 GitHub Actions 冒烟（macOS + Windows 双平台真渲验证）。

## 它解决什么问题

你不需要会剪辑，也不需要懂 Remotion。装好之后，把视频和字幕交给它。

| 真实处境 | 你会得到 |
| --- | --- |
| 录了口播，但画面从头到尾只有一张脸 | 逐句匹配口播的 MG 信息包装：侧标、图表、判词、比喻图形 |
| 想要专业 MG 风格，但不会 AE 也请不起后期 | 设计系统硬约束下的成片：字体、配色、版式、动效全部有规格 |
| AI 剪的东西质量忽高忽低 | 三道质检闸：几何断言脚本 → 独立质检员读帧评分 → 你终审 |
| 每改一个音效就要重渲整条片 | 增量渲染：改音效约 5 分钟、修一段约 2 分钟，不动整片 |
| 不知道该配哪个音效、配多少 | 配声语法查表派发 + 密度与音色审计闸，吵不了也秃不了 |
| 用 Codex 还是 Claude Code 拿不定 | 同一份规则真源，两端并行拓扑与质量闸完全同标 |

## 快速开始

最省事的用法：打开你的 Agent（Codex / Claude Code / 豆包 / WorkBuddy），把下面这句话整个丢进去，路径换成你自己的文件：

```text
安装并使用这个剪辑 skill：https://github.com/jincheng2026/jc-remotion-skills
然后装配这条口播：~/Desktop/我的口播.mp4 ~/Desktop/我的口播.srt
```

Agent 会照本仓库的说明自己装 skill、检查并补齐环境（含 node/ffmpeg）、建好工程，然后开始剪。装过之后，以后每条片只需要说：

```text
装配这条口播：~/Desktop/我的口播.mp4 ~/Desktop/我的口播.srt
```

它会自己走完素材接入、装配方案（给你过目，唯一要确认的点）、并行实现、自动质检、带音效全片预览。你只在两个时刻出现：确认方案时，和终审时用大白话报问题：

```text
继续                                # 回到没剪完的片，自动装载未清账任务
素材放好了，继续                      # 补完 B-roll 后
1 分 51 秒到 2 分同一个音效重复太多了     # 报时间点即可，修复走增量渲染
第 3 段的构图不舒服
这个音效音量压到 0.1 我觉得 OK
```

整个过程你只提供三样东西：视频+SRT、被点名要的 B-roll 素材、自然语言反馈。它不会让你搬运任何返工单、方案表或过程文件——这条交互契约写死在规则里。

## 安装

### 豆包、Codex、WorkBuddy 与其他支持 Skills 的 Agent

```bash
npx -y skills add jincheng2026/jc-remotion-skills -g --all
```

### Claude Code 插件市场

```bash
claude plugin marketplace add jincheng2026/jc-remotion-skills
claude plugin install remotion-koubo@jincheng-skills
```

装完回到 Agent，**直接把粗剪 mp4 和 SRT 丢进去**，或输入 `/remotion-assembly` 开始。

### 关于运行环境

这套 skill 的规则要落地需要一个 Remotion 工程。**你不用自己准备**——第一次使用时 skill 会自己检查环境：

- 已有工程且底座齐全 → 直接开工，不打扰你
- 有工程缺文件 → 自动补齐（只加不覆盖）
- 没有工程 → 问你建在哪，然后一键建好（装依赖约 3-5 分钟）
- 缺 `node` / `ffmpeg` → 检测到系统包管理器（macOS 的 Homebrew、Windows 的 winget 等）就直接自动装好，这一步不需要管理员权限

唯一需要你动手的情况：电脑连包管理器都没有（比如 Mac 没装过 Homebrew）。这时 Agent 会给你一条命令，粘贴到终端、输一次密码，之后就再也不用管环境了。

### 手动安装 / 单独体检

macOS / Linux：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/jincheng2026/jc-remotion-skills/master/setup.sh)   # 从零建工程
bash <(curl -fsSL https://raw.githubusercontent.com/jincheng2026/jc-remotion-skills/master/setup.sh) /path/to/existing-project   # 已有工程，只补缺失文件
node doctor.mjs /path/to/your-remotion-project            # 逐项体检
```

Windows（PowerShell）：

```powershell
irm https://raw.githubusercontent.com/jincheng2026/jc-remotion-skills/master/setup.ps1 | iex   # 从零建工程（缺 git/node 会先自动装，装完重开终端再跑一次）
node doctor.mjs C:\path\to\your-remotion-project          # 逐项体检
```

### Windows 说明

- 管线脚本全部是 Node 实现（`node xxx.mjs`），PowerShell、CMD、Git Bash 里都能原样跑，不需要 WSL。
- 硬件编码：macOS 用 VideoToolbox；Windows 只有 NVIDIA 显卡加带 NVENC 的 FFmpeg 才可能启用（`RS_HW=1` 时自动探测，不可用就回退软件编码，只是预览渲染慢一些，成片质量不受影响）。
- 底部字幕字体：macOS 用系统的 PingFang SC 细体；Windows 自动回退到打包的 Noto Sans SC 400，观感相近但非同款。

## 能力一览

| Skill | 管什么 |
| --- | --- |
| remotion-assembly | 装配流水线：端到端流程、生产/研发双模式、提速纪律、交互契约 |
| remotion-design-system | 设计系统硬约束：token 语义、组件规格、版式/排印/动效/图表 |
| remotion-broll | B-roll 素材工程：采集、验真、选段、嵌入、调色 |
| remotion-sfx | 配音效：查表派发语法、密度与音色审计闸、试听板管线 |
| remotion-gotchas-index | 错题集：34 条症状→修法，渲染翻车先查这里 |
| remotion-reference-fidelity | 参考片保真方法层：逐帧分析、复刻、语法泛化 |

配套：`scripts/` 6 个管线脚本（渲染服务含音频增量与段渲拼回、成片质检断言、音效 cue 草稿生成、工程骨架生成、字幕转换校验）；`substrate/` 45 个文件的组件底座与 QC 探针；`agents/` 独立质检员；`template/` 依赖锁版的最小工程模板。

## 它怎样工作

```text
素材接入（环境/字幕/烧录自动检查）
  -> 装配方案表（约 19 段的 beat 规划，交你过目）
  -> 并行实现 + 自动质检（重叠/字号/冻帧/编码全是脚本断言）
  -> 独立质检员读帧评分（干活的不给自己打分）
  -> 带音效全片预览交你终审
  -> 修复走增量渲染，不动整片
  -> 母带成片
```

Codex 和 Claude Code 读的是同一份规则（纯 markdown），执行标准也完全一致：一样的并行实现、一样的独立质检、一样的质量闸。Codex 打开项目会自动读到根目录的 AGENTS.md，里面写清了每个环节它该怎么做（比如质检就是起一个独立的 codex exec 进程读帧打分）；Claude Code 则原生识别 `.claude/skills/`。哪一端都不会偷工减料。

## 项目结构

```text
skills/        六个 Skill（规则本体，纯 markdown）
scripts/       管线脚本：渲染服务（含音频增量、段渲拼回）、质检断言、音效 cue 生成、工程骨架、字幕校验
substrate/     工程底座：src/design 组件库 + QC 探针 + 共享 Scene 底座
template/      最小可跑的 Remotion 工程模板（setup 建站用，依赖已锁版）
agents/        独立质检员定义
codex-bridge/  Codex 路由与执行说明（安装时自动写入你的项目根）
setup.mjs      一条命令从零装好一切（跨平台真源）
setup.sh       macOS/Linux 引导（装 node + 克隆后转交 setup.mjs）
setup.ps1      Windows 引导（装 git/node 后转交 setup.mjs）
install.mjs    装到已有 Remotion 项目（install.sh 为兼容入口）
doctor.mjs     环境体检（doctor.sh 为兼容入口）
```

## 明确不包含的

- **音效库**：音效的质感必须你亲耳挑，套用别人的库出不了效果。remotion-sfx Skill 里有完整的建库流程（找候选 → 出试听板 → 你报编号认领）；第一条片也可以先跳过配音效。
- 视频素材与字体文件（字体走 npm 包，安装时自动装好）。

## 许可证

本项目采用 [CC BY-NC 4.0](LICENSE) 许可证。

- 个人使用、学习、研究与非商业项目可以直接使用。
- 公开发布衍生作品时，请注明来源。
- 商业用途需要单独授权，请联系作者。

## 作者

何锦成 · [抖音](https://www.douyin.com/user/MS4wLjABAAAABESEqXIiQQyuKbVjSePQft8QAwWx3Lxh1ooU71bMKrVWPicmTpHdyrddhDwbURyD)

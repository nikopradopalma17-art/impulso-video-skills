# my-video 剪辑项目路由（Codex 等非 Claude Code agent 的入口）

剪辑规则真源在 `{{PROJECT_ROOT}}/.claude/skills/`（六个 remotion-* skill，纯 markdown，任何 agent 可读）。此文件只做路由与执行口径翻译，**不复制规则**；**接手任何工作前先读项目状态档 `STATUS.md`**（跨会话/跨 agent 的状态真源：进行到哪、待办账目、真源地图）；与 Claude Code 读的是同一份真源，两边永远同步。路径一律用绝对路径（防 cwd 漂移）。

## 剪辑横屏口播视频（装配主流程）

1. 先读 `{{PROJECT_ROOT}}/.claude/skills/remotion-assembly/SKILL.md`，按其「新片端到端流程」执行；按其板块路由表读同目录 `references/` 各文件与其余 skill（remotion-design-system / remotion-broll / remotion-sfx / remotion-gotchas-index）。
2. 硬闸不许跳：素材接入第 0 步环境自检、装配方案表给用户过目后才写码、段成片三道闸（QC 探针 → 独立质检 → 用户终审）、渲后 `node scripts/qc-master.mjs` 自动断言。
3. 交互契约照守（assembly SKILL §0）：用户只供粗剪+SRT、被点名的素材、自然语言反馈；过程文件自建自读，返工按 §0.5「同片再入」自动装载。

## Codex 执行口径（skill 里 Claude Code 专有概念的对应翻译）

- **环境自检（§0.5 第 0 步）**：skill 说「用 Read 工具验证」＝用你自己的读文件手段验证刚写的测试文件持久存在。写入不持久＝你的 sandbox/approval 模式没放开工作区写权限——停下让用户放开（如 workspace-write），**禁止**绕路到 /tmp 或复制项目；skill 里的 `dangerouslyDisableSandbox` 是 Claude Code 专有旗标，对你无意义，忽略字面、取其义（禁自行解除沙箱）。
- **「派实现员/执行包子代理」＝起独立执行单元，两端等价**：Claude＝Task 子代理；**Codex＝后台 `codex exec` 子进程**（`codex exec "<任务书>" --skip-git-repo-check &` 后台并发，每路各锁一个 Scene 文件，文件锁与 Claude 端同一套）。生产模式 N 路并行两端同样执行，不因宿主改拓扑。
- **纪律⑥轮次预算 ≤50 / 纪律⑦渲染预算 ≤2 / 纪律⑧并行拓扑：两端同标**——主会话都只当项目经理（发包/收包/批量审），执行体都是独立子单元（见上条），预算数值不因宿主打折。
- **独立质检（一等闸，2026-07-22 起两端同权、禁降级）**：干活的不给自己打分。Claude＝派 mg-judge 子代理；**Codex＝shell 起独立子进程：`codex exec "<按 references/rubric.md 四维评分卡质检，列违规>" --skip-git-repo-check -s read-only -i <自核帧…>`**——同一份 rubric、同样读图打分（2026-07-22 实测：四维分+违规清单与人工审查吻合）。任一维 <7 或铁律违规即打回定点修。codex CLI 自嵌不可用属环境故障——先修环境，或把自核帧交另一端跑质检；**禁以自查代替独立质检放行交付**。用户终审任何情况不省。
- **渲后读图自查清单（2026-07-22 A/B 实测校准；judge 前的快查步骤，两端通用）**：0721-03 实剪证明脚本断言全过时仍会栽在读图类铁律上。每段渲后抽帧逐项过：① 文字全部落在暗底板/干净墙面上，禁压植物杂背景（含 EN 副行）；② 语义色对 token 表（判词=黄、正向=绿、警示=黄、中性=蓝，禁低对比同色系叠压）；③ 当拍画面与口播词级对齐，上一拍元素不滞留（说到哪出到哪）；④ 一屏一个主重心；⑤ 判词拍有升格差（字号提级/清场），与普通拍拉开。逐段核完在交付汇报里带上清单结果。
- **后台渲染**：先试 skill 标准做法（nohup 脱离+认日志 `+` 行，错题 #09/#26）。**若发现命令结束后渲染进程消失**（沙箱回收子进程树），fallback：渲染改前台长命令跑（渲染本就全项目串行，前台不损吞吐），或把渲染命令交用户在系统终端执行；判完成永远认日志尾行，不认进程存活。
- **文件产物**：skill 说「优先用 Write 工具」＝用你的标准文件写入手段（apply_patch/重定向均可），关键产物写后必须回读验证存在。

## 并发与渲染纪律（双端共用，防撞车）

- 渲染全项目串行：起渲前 `pgrep -f "remotion|render-service"` 查场，有渲染在跑必须等它结束。
- 动段先在 `assembly/<片名>/分段工坊/segments.md` 写占位行（会话标识+作用域）；别的会话（含 Claude Code 端）占位的段不碰。
- 同项目同时只允许一个会话动 npm（错题 #24）。
- 与 Claude Code 端同时开工时（A/B 对比）：必须不同片名、渲染错峰。

## 其他剪辑相关任务

素材采集 → remotion-broll；配音效 → remotion-sfx；设计规格/组件 → remotion-design-system；渲染异常排查 → remotion-gotchas-index。入口都从 remotion-assembly SKILL.md 的路由表走。

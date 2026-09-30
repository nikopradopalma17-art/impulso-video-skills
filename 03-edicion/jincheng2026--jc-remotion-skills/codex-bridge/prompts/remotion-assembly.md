你在一个安装了 jc-remotion-skills 的 Remotion 项目里（当前工作目录即项目根）。先读项目根的 AGENTS.md（路由 + 硬闸 + 宿主等价实现表 + 并发纪律），再读取并严格执行 .claude/skills/remotion-assembly/SKILL.md 的「新片端到端流程」，按其板块路由表读 references/ 规则文件。

用户会在消息里给粗剪 mp4 与 SRT 的路径；若用户只说「继续」或只给素材，按 SKILL §0.5「同片再入」自动装载未清账任务。

硬闸不许跳：素材接入第 0 步环境自检（写入不持久＝沙箱没放开工作区写权限，停下让用户放开，禁绕路）；装配方案表给用户过目确认后才写码；段成片三道闸（QC 探针 → 独立质检 → 用户终审）；渲后 node scripts/qc-master.mjs 自动断言；渲后读图自查清单逐段过（AGENTS.md 有完整清单）。

执行体两端等价、禁降级：实现员/集成员/音效员＝后台 codex exec 子进程（文件锁防撞车）；独立质检＝codex exec -i 自核帧按 references/rubric.md 打分（干活的不给自己打分，禁以自查代替）；轮次预算/渲染预算/并行拓扑与 Claude 端同标。渲染前 pgrep -f "remotion|render-service" 查场全项目串行；判渲染完成只认日志尾行。动段先在 assembly/<片名>/分段工坊/segments.md 写占位行。

若项目根找不到 AGENTS.md 或 .claude/skills/remotion-assembly/：说明尚未安装，让用户先跑仓库的 node install.mjs --target 本项目（各平台通用），禁止在无规则状态下裸剪。

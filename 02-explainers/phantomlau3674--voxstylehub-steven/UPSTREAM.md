# UPSTREAM.md — 单一源码与导出 / 防漂移政策

## 唯一源码

本仓库发行的核心 Skill `xingchen-vox-collage/` 的**唯一源码**是上游仓库：

- 仓库：https://github.com/Phantomlau3674/xingchen-skill-family
- 路径：`skills/xingchen-vox-collage`
- 许可证：MIT（Copyright (c) 2026 Phantomlau3674）

本仓库（`voxstylehub-steven`）只是一个**发行层（distribution layer）**，不是 fork，不接受对核心 Skill 的直接修改。

## 确定性导出

当前 `xingchen-vox-collage/` 是从上游 tag **`v2026.07.22`** 的确定性、字节级导出：

- upstream commit：`5bebe30f8e4ac1cd4d763ac013b9d3f513a8a4f1`
- upstream tree：`44c7c6def2bb44b67da2a297916ff56530eced5e`

导出时唯一允许的过滤是排除 `__pycache__/` 目录与 `*.pyc` 文件（Python 字节码缓存，不属于源码）。其余每一个字节与上游一致，包括行尾（CRLF/LF 原样保留）。导出事实记录在 [UPSTREAM_MANIFEST.json](UPSTREAM_MANIFEST.json)。

## 导出流程

```
上游 skills/xingchen-vox-collage  →  本仓库 xingchen-vox-collage/  →  发布 ZIP
```

1. 从上游 clone/checkout 指定 tag；
2. 用 `scripts/build-release.ps1 -UpstreamClone <path>` 把 `skills/xingchen-vox-collage` 镜像到本仓库 `xingchen-vox-collage/`（robocopy /MIR，排除 `__pycache__`、`*.pyc`）；
3. 逐文件 SHA-256 比对确认字节一致；
4. 刷新 `UPSTREAM_MANIFEST.json`（commit / tree / 时间戳）；
5. 生成 `releases/xingchen-vox-collage-<Version>.zip` 并把最终 ZIP 的 SHA-256 写回 manifest（ZIP 内嵌的 manifest 副本中该字段保留 `PENDING-BUILD`，见 build 脚本注释）。

## 防漂移政策

- 核心 Skill 文件（`xingchen-vox-collage/` 下的一切）出现**任何**与上游的差异都视为事故，必须立即修复或重新导出；
- `scripts/check-upstream-drift.ps1` 会比对上游 commit/tree、文件清单和逐文件 SHA-256，任何差异红字报错并以非零码退出；
- 发现需要修改核心 Skill 时，正确路径是：**先在上游仓库修改并发 tag，再重新导出**，绝不在本仓库直接改。

## 发行层特有文件

以下文件属于本发行层，不在上游、不受防漂移约束：

- `README.md`、`README.en.md`、`CHANGELOG.md`、`UPSTREAM.md`、`UPSTREAM_MANIFEST.json`、`LICENSE`（与上游内容一致）
- `scripts/`（build-release / verify-standalone / check-upstream-drift）
- `examples/`（独立安装演示）
- `releases/`（构建产物）

## 如何重新导出

```powershell
# 在上游 clone 上 checkout 目标 tag 后：
powershell -File .\scripts\build-release.ps1 -UpstreamClone C:\path\to\xingchen-skill-family -Version 0.2.0
```

脚本会完成镜像、SHA-256 校验、manifest 刷新与 ZIP 打包；任何一步失败都会以非零码退出并停止。

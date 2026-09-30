# minimal-8s — xingchen-vox-collage 技术 smoke fixture

主题：「为什么冰山大部分在水下」。2 个场景、10 秒、1920x1080@30fps。
零收费生成服务、零外部素材：全部画面由 PIL 程序化绘制（纯色纸面、半调圆点、
撕裂边、几何道具、确定性中文文字），音频为 Python 合成的提示音序列，
仅调用本机 ffmpeg 做封装与剪切。

它验证合同、渲染链、输入指纹和证据链，不是高保真黄金样片，也不代表素材或动效密度的推荐下限。

## 这个示例证明了什么

- `validate_vox_branch.py` 严格模式（无 `--allow-pending`）PASS，零 error 零 warning：
  hero frame、含音频流的 playable clip、entry/settled/exit 检查点、phone review
  产物、code-native 资产 fragment、project-state 同步全部真实存在且被 ffprobe 检查。
- 反 PPT：两场构图均有明确负空间与视觉动线（s01 左冰山→中水线→右比例条；
  s02 左题字→中天平→右下沉箭头），无居中卡片。
- 两场都使用独立语义角色和错峰入场；这些角色与帧位只是本夹具的构造事实，不是创作配额。
- before → transform → settled：s01 完整冰山从空中落下、弹跳、衰减浮动后
  稳定为「十分之一露出水面」；s02 天平水平 → 两方块落下 → 横梁向右下倾斜定格。
- 隐藏文字仍可读：冰山-水线-长短比例条、天平-倾斜-蓝块下沉，视觉命题独立成立。
- 手机抽查：`visual/vox/evidence/*/s0X-phone-360.png`（360x202 下采样）+
  同目录 `phone-review.md`。验证器只确认工件存在；其中的可读性结论是示例人工审查记录。
- 转场继承锚点：s01 结尾水蓝色场下沉压缩为 s02 底部蓝色轨道纸带（同 #2E6FA8、
  同一纸面 substrate），在 scene-spec 的 `transitions.out/in` 中声明。

## 重建全部媒体

```bash
python tools/build_example_media.py
```

脚本先删除 `visual/vox/renders/`、`visual/vox/evidence/`、`visual/vox/media/audio/`
再全部重生成（含调 skill 的 `make_visual_evidence.py` 出检查点与 contact sheet），
随后运行 `lock_vox_inputs.py --write` 并把当前输入指纹写回场景证据合同。
种子全部固定，重建产物逐字节一致（master.mp4 的 md5 可复现）。
中文字体首选 `C:\Windows\Fonts\msyh.ttc`，缺失时自动回退。

## 跑验证

```bash
# SKILL 指向你本机安装的 xingchen-vox-collage/scripts，例如：
#   SKILL=~/.codex/skills/xingchen-vox-collage/scripts
# 也可用仓库内副本：SKILL=../../xingchen-vox-collage/scripts
SKILL=<skills-dir>/xingchen-vox-collage/scripts
python $SKILL/validate_vox_branch.py .                       # 严格模式 → PASS
python $SKILL/lock_vox_inputs.py . --check                   # 输入身份 → locked
python $SKILL/build_scene_evidence.py . visual/vox/tmp-ev --plan-only   # 提取计划
```

## 目录说明

- `visual/vox/DESIGN.md` — 风格 DNA 与连续性锚点约定
- `visual/vox/scene-spec.json` — 2 场景完整合同（layers/transitions/playable_clip）
- `visual/vox/assets.json` — 11 个 code-native 资产，fragment 指向 builder 脚本内的资产注册表
- `project-state.json` — 最小 Lean state（metadata.format / project_id / timeline_revision / scenes）
- `tools/build_example_media.py` — 一键重建脚本（PIL 绘图 + 音频合成 + ffmpeg）
- `visual/vox/renders/` — master.mp4（含音频）、每场景 hero PNG 与 playable MP4
- `visual/vox/evidence/` — 每场景 entry/build/settled/exit PNG、contact-sheet、
  phone-360 下采样图、phone-review.md、evidence.json
- `visual/vox/media/audio/` — 合成提示音 master WAV 与每场景 m4a

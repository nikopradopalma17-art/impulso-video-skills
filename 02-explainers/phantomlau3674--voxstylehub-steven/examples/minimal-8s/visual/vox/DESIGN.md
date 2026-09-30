# iceberg-vox-minimal Vox Collage Design

最小示例：8–12 秒、2 个场景，证明 xingchen-vox-collage 的核心合同可以在
零收费服务、零外部素材的条件下，用 PIL 程序化画面 + ffmpeg 组装全部满足。

## Visual thesis

知识点「为什么冰山大部分在水下」被翻译成一个剪纸工作台：暖白纸面是桌面，
蓝色纸带是水面，白色剪纸冰山先整个出现在水面之上，再落进水里、弹跳、
稳定成「只有十分之一露出水面」的剖面；第二场沿用同一张纸和同一条蓝色
纸带，把原因拆成一台纸天平：同样大小的冰块比水块轻，所以冰浮着。

## Style DNA

- substrate: 暖白牛皮纸 #F2EBDC，整帧铺满，带微弱纸纹噪点（种子固定）
- edge language: 所有纸件边缘为确定性锯齿撕裂边（seeded jagged polygon）
- image treatment: 无外部图片；全部几何道具由 PIL 多边形/圆点绘制
- palette: substrate #F2EBDC / paper white #FBF7EE / ink #26221C /
  primary accent 水蓝 #2E6FA8 / supporting accent 信号红 #C8442C
- shadow logic: 单层 45° 偏移软阴影（半透明墨色），纸件浮起感
- depth system: plate 纸面 → 水带 → 道具（冰山/方块/天平）→ 标注箭头 → 文字
- grain: 全帧 1.5% 强度单色噪点，种子固定，逐帧一致
- type roles: display=场景命题印章（msyh 72pt）/ information=标注小字（40pt）/
  data=数字与比例（56pt）/ subtitles=本示例不含字幕，安全区仍预留
- annotation: 手绘感虚线 + 三角箭头（水面线、天平倾斜方向）
- motion character: 材料原生动作——slide（纸带滑入）、drop（纸件落下带一次
  弹跳）、trace（虚线描画）、pivot（天平倾斜）、stamp（命题盖章）

## Anti-reference

- no repeated generic paper cards
- no generated essential text or numbers
- no decorative evidence graphics
- no Vox logos or copied title packaging
- no caption-only motion through an explanatory interval
- no phone-size semantic subject reduced to a decorative postage stamp
- no unmotivated material-world reset between adjacent scenes

## Mobile and safe regions

- master: 1920x1080 at 30 fps
- subtitles: 底部 173px 为字幕安全区，所有语义道具与数字均避开；
  每场景输出 360px 宽手机下采样图 + phone-review.md 作为抽查证据

## Continuity anchors

- s01 → s02 共享：暖白纸面 substrate、#2E6FA8 水蓝色场（s01 的水带在转场中
  下沉并压缩为 s02 底部的蓝色轨道纸带），冰山向左滑出、天平从右侧滑入，
  蓝带位置不变作为视觉轨道。

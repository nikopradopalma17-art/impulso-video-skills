// 新片工程骨架一键生成（素材接入清单第 6 步的机械部分，省主会话十几轮手工搭建）
// 用法：node scripts/scaffold-koubo.mjs <片名> <时长秒> [fps=30]
//   例：node scripts/scaffold-koubo.mjs 0721-01 127.3
// 生成：SubtitleTrack/SfxTrack/sfx表/主组件/scenes 目录+Scene01 占位/工坊目录+segments.md
// 不生成：subtitles-<片名>.ts（由 srt-to-cues.mjs 从 SRT 生成）、Root.tsx 注册（打印片段手动粘贴，防误改）
// 全部文件已存在则拒绝覆盖。
import fs from 'node:fs';
import path from 'node:path';

const [, , name, durArg, fpsArg] = process.argv;
if (!name || !durArg) {
  console.error('用法: node scripts/scaffold-koubo.mjs <片名> <时长秒> [fps=30]');
  process.exit(1);
}
const dur = Number(durArg);
const fps = Number(fpsArg || 30);
const N = name.replace(/-/g, '_');            // 0721_01（标识符用）
const C = 'Koubo' + name.replace(/-/g, '');   // Koubo072101（组件名）
const ID = `Koubo-${name}`;                   // composition id
const SCH = 'koubo' + name.replace(/-/g, '') + 'Schema'; // Studio 调参面板 schema 导出名

const files = {
  [`src/koubo/SubtitleTrack${N}.tsx`]: `import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import '../design/fonts';
import { BilingualSub } from '../design/BilingualSub';
import { CUES } from './subtitles-${name}';

// ${name} 专用字幕轨（按片独立）。en 全空 → BilingualSub 只渲中文行。
// zhSize/bottom 透传 Studio 调参面板值，不传时走 token 默认（assembly SKILL §0.2）。
export const SubtitleTrack${N}: React.FC<{ zhSize?: number; bottom?: number }> = ({ zhSize, bottom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const cue = CUES.find(({ start, end }) => time >= start && time < end);
  return cue ? <BilingualSub zh={cue.zh} en={cue.en} zhSize={zhSize} bottom={bottom} /> : null;
};
`,
  [`src/koubo/sfx-${name}.ts`]: `// SFX cue 表（${name}）：at=全局秒，与元素 enterAt 同步换算。
// 音源=public/sfx/ 在役十音色（trans/ding 已弃用；2026-07-21 认可池转正后清单见 sfx SKILL §0）；A-G 查表见 remotion-sfx skill §4 / audio.md 规则 8。
// 挂完必跑 sfx §4.4 审计闸：密度目标带 3.5-5s/发、单音色 ≤35%、stamp ≤个位数、重锤 ≤2。
export type SfxName = 'glass' | 'pop' | 'tick2' | 'pop2' | 'stamp' | 'rise' | 'whoosh' | 'shutter' | 'bright' | 'lowthud';
export type SfxCue = { at: number; sfx: SfxName; vol?: number };
export const SFX_CUES: SfxCue[] = [];
`,
  [`src/koubo/SfxTrack${N}.tsx`]: `import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { SFX_CUES, type SfxName } from './sfx-${name}';

const FPS = ${fps};

// 基础音量：2026-07-21 用户裁定「基本音量 -15dB 左右」→ 基准 0.25（入库 -3dBFS × 0.25 ≈ -15dBFS 有效峰值）。
// 重锤 stamp 上限 0.55。真源 remotion-sfx SKILL §4.4，勿调回旧档。
const BASE_VOL: Record<SfxName, number> = {
  glass: 0.25, pop: 0.25, tick2: 0.25, pop2: 0.25, stamp: 0.55, rise: 0.1, whoosh: 0.25, shutter: 0.25, bright: 0.25, lowthud: 0.2,
};

// gain 是 Studio 试听调参用整体倍率，默认 1 = 现行档位；定稿改档走 remotion-sfx 流程回写，
// 不得把非 1 的 gain 写进 defaultProps（assembly SKILL §0.2）。
export const SfxTrack${N}: React.FC<{ gain?: number }> = ({ gain = 1 }) => (
  <>
    {SFX_CUES.map((c, i) => (
      <Sequence key={i} name={\`sfx-\${c.sfx}@\${c.at}\`} from={Math.round(c.at * FPS)} durationInFrames={Math.ceil(2.0 * FPS)}>
        <Audio src={staticFile(\`sfx/\${c.sfx}.wav\`)} volume={(c.vol ?? BASE_VOL[c.sfx]) * gain} />
      </Sequence>
    ))}
  </>
);
`,
  [`src/koubo/${C}.tsx`]: `import React from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from 'remotion';
import { z } from 'zod';
import { FontGuard } from '../design/FontGuard';
import { QcProbe } from '../design/qc';
import { SAFE, SIZE } from '../design/tokens';
import { SfxTrack${N} } from './SfxTrack${N}';
import { SubtitleTrack${N} } from './SubtitleTrack${N}';
import { F } from './scenes/shared';
import { Scene01 } from './scenes-${name}/Scene01';

// ${name} 全片主组件（scaffold 生成）。层级：铺底视频 → 各 Scene → 音轨 → 字幕轨。
// scrim 非默认（用户裁定 2026-07-24）：背景够暗保持原片亮度；信息区背景亮到白字不可读才挂
// InfoScrim，且 side 必须跟信息区侧（texture.md scrim 条 / 错题 #36）；挂了 scrim 就把
// strength 一并接进下方 schema（照 Koubo072701.tsx）。
// 段边界按装配方案填 S/SC/NAMES 三个数组（模式照 Koubo071502.tsx）。
const S = [[0, ${dur}]] as const;           // TODO: 按装配方案填段边界
const SC = [Scene01];                        // TODO: 逐段 import 并加入
const NAMES = ['S01 占位'];                  // TODO: 段名

// Studio 调参面板 schema（assembly SKILL §0.2）：探索层不是真源。默认值恒等 tokens/现行
// 裁定值，出片走默认；定稿值回写对应真源（字号/底距→tokens.ts，音量档→sfx §4.4 流程），
// 禁把非默认值留在 Root defaultProps。
export const ${SCH} = z.object({
  qc: z.boolean(),
  subZhSize: z.number().min(32).max(84),
  subBottom: z.number().min(0).max(200),
  sfxGain: z.number().min(0).max(2),
});

export const ${C}: React.FC<Partial<z.infer<typeof ${SCH}>>> = ({
  qc = false,
  subZhSize = SIZE.subZh,
  subBottom = SAFE.subtitleBottom,
  sfxGain = 1,
}) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <OffthreadVideo src={staticFile('footage/${name}.mp4')} />
    <FontGuard />
    {S.map(([start, end], i) => {
      const Scene = SC[i];
      return (
        <Sequence key={i} from={F(start)} durationInFrames={F(end) - F(start)} name={NAMES[i]}>
          <Scene qc={qc} />
        </Sequence>
      );
    })}
    <SfxTrack${N} gain={sfxGain} />
    <SubtitleTrack${N} zhSize={subZhSize} bottom={subBottom} />
    {/* QC 探针必须根挂载（错题 #35：Scene 内挂载帧号错位、漏挂即假过闸；0727-01 曾因脚手架缺这行翻车） */}
    {qc ? <QcProbe /> : null}
  </AbsoluteFill>
);
`,
  [`src/koubo/scenes-${name}/Scene01.tsx`]: `import React from 'react';
// S01 占位（scaffold 生成）：实装时按装配方案填充；共享底座从 ../scenes/shared 引。
export const Scene01: React.FC<{ qc?: boolean }> = () => null;
`,
  [`assembly/${name}/分段工坊/segments.md`]: `# ${name} 分段工坊段表

> 并行纪律：认领段先写占位行（会话标识+作用域文件）；渲染/npm 全项目串行，起渲前 pgrep 查场。

| 段号 | 时间范围 | 主包装点 | 作用域文件 | 占位/状态 |
|---|---|---|---|---|
| 01 | 0-${dur} | 待方案 | scenes-${name}/Scene01.tsx | 待做 |
`,
};

const existing = Object.keys(files).filter((f) => fs.existsSync(f));
if (existing.length) {
  console.error('拒绝覆盖已存在文件：\n  ' + existing.join('\n  '));
  process.exit(1);
}
for (const [f, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
  console.log('生成', f);
}
fs.mkdirSync(`assembly/${name}/input`, { recursive: true });
console.log(`
── 剩余手动步骤 ──
1. 粗剪拷入:  cp <粗剪.mp4> public/footage/${name}.mp4
2. SRT 存档+字幕草稿:  cp <字幕.srt> assembly/${name}/input/ && node scripts/srt-to-cues.mjs assembly/${name}/input/<字幕.srt> ${name}
3. Root.tsx 注册（src/Root.tsx 粘贴；import 区加 import { ${C}, ${SCH} } from "./koubo/${C}"; 及 tokens：import { SAFE, SIZE } from "./design/tokens"; 已引则跳过）：
      <Composition
        id="${ID}"
        component={${C}}
        durationInFrames={${Math.round(dur * fps)}}
        fps={${fps}}
        width={1920}
        height={1080}
        schema={${SCH}}
        defaultProps={{ qc: false, subZhSize: SIZE.subZh, subBottom: SAFE.subtitleBottom, sfxGain: 1 }}
      />
4. 开工即起实时预览（assembly SKILL §0.2）:  npm run dev → http://localhost:3000/${ID}（调参面板在右侧 Inspector）
5. 渲染用:  COMP_ID=${ID} node scripts/render-service.cjs …（预览/审核加 RS_HW=1 硬件编码提速 ~3x）
`);

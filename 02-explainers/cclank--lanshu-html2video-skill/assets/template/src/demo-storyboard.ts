/**
 * Default props so `remotion studio` opens to something real without needing a
 * harvest run first. Deliberately text-only: a demo board that referenced images
 * would 404 in a fresh checkout and blow a delayRender, which is a confusing
 * first experience.
 *
 * Real boards are produced by the pipeline and passed with --props.
 */

import type { Storyboard } from "./schema/storyboard";

export const DEMO_STORYBOARD: Storyboard = {
  version: 1,
  meta: {
    sourceUrl: "https://example.com/demo",
    sourceTitle: "html2video demo board",
    author: "",
    publishedAt: "",
    lang: "zh-Hans",
    coreMessage: "先看清内容，再决定怎么剪。",
    arc: "claim-evidence-implication",
  },
  target: {
    fps: 30,
    width: 1920,
    height: 1080,
    // Four scenes at their per-shot caps carry about this much; asking for more
    // makes resolveTimeline report a shortfall rather than stretch them.
    seconds: 35,
    toleranceFrames: 30,
  },
  art: {
    ground: "paper",
    groundColor: "#F0EEE6",
    ink: "#141413",
    inkMuted: "#6B6862",
    accent: "#CC785C",
    radius: 2,
    ruleWidth: 1,
    texture: "paper",
    displayFace: "serif",
    bodyFace: "sans",
    sourceLabel: "example.com",
  },
  motion: {
    seed: "https://example.com/demo",
    pace: "measured",
    easeFamily: "editorial",
    panBias: "ltr",
    revealStyle: "mask-up",
    transitionVocab: ["cut", "fade", "wipe"],
    gridEnergy: 0.22,
  },
  // No bed: the demo must render in a fresh checkout, and shipping a music file
  // would mean shipping a licence. Drop your own into public/audio/ and set `bed`.
  audio: { mode: "music", bedGain: 0.32, duckTo: 0.12 },
  assets: [],
  scenes: [
    {
      id: "d1",
      shot: "title",
      weight: 1,
      text: {
        eyebrow: "HTML2VIDEO",
        headline: "把一篇文章剪成一条片子",
        sub: "Storyboard-driven, rendered with Remotion",
      },
      assets: [],
      callouts: [],
      emphasis: [{ at: 0.62, kind: "rule-sweep", target: "headline" }],
      transitionOut: { kind: "fade", frames: 12, timing: "linear" },
    },
    {
      id: "d2",
      shot: "statement",
      weight: 1.1,
      text: {
        eyebrow: "前提",
        headline: "最难的不是渲染，\n是决定什么值得放进画面。",
      },
      assets: [],
      callouts: [],
      emphasis: [{ at: 0.55, kind: "punch", target: "line:2" }],
      transitionOut: { kind: "wipe", frames: 14, timing: "linear" },
    },
    {
      id: "d3",
      shot: "caveat",
      weight: 1.3,
      text: {
        eyebrow: "但是",
        headline: "排版不会替你思考",
        sub: "字号和转场可以自动，\n取舍不行。",
      },
      assets: [],
      callouts: [],
      emphasis: [
        { at: 0.3, kind: "flash", target: "headline" },
        { at: 0.66, kind: "strike", target: "sub" },
      ],
      transitionOut: { kind: "fade", frames: 12, timing: "linear" },
    },
    {
      id: "d4",
      shot: "outro",
      weight: 1.1,
      text: {
        headline: "先看清内容，\n再决定怎么剪。",
        credit: "example.com/demo",
      },
      assets: [],
      callouts: [],
      emphasis: [],
      transitionOut: { kind: "cut", frames: 0, timing: "linear" },
    },
  ],
};

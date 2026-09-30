/**
 * Deterministic Chinese text fitting.
 *
 * Why not @remotion/layout-utils:
 *   - `fitText` is width-only (`withinWidth`); it cannot express a line count
 *     or a height budget, which is what a fixed layout slot actually needs.
 *   - `fitTextOnNLines` splits on `" "`, so a Chinese sentence is a single
 *     token and it shrinks the type until the whole sentence fits one line.
 *
 * Three deliberate departures:
 *
 * 1. Cluster on CJK line-break rules (禁则), not spaces.
 * 2. A discrete size ladder instead of a binary search. A search to 0.01px can
 *    land on a different value if measureText differs by a hair between Chrome
 *    builds — and a different size changes the LINE BREAKS, which is a visible
 *    jump between two renders of the same storyboard. A fixed ladder is stable
 *    under metric noise and keeps the type scale honest.
 * 3. Line count and block height are first-class, not derived afterwards.
 */

import { measureText } from "@remotion/layout-utils";

/** Characters that may not begin a line (行头禁则). */
const NO_START = new Set(
  "，。、；：？！）｝」』】》〉”’…·ー々％‰℃〕〗〙〛,.;:?!)]}>",
);
/** Characters that may not end a line (行尾禁则). */
const NO_END = new Set("（｛「『【《〈“‘〔〖〘〚([{<");
/** Latin, digit and technical runs stay atomic: "Opus 4.6", "4620×1410". */
const LATIN = /[0-9A-Za-zÀ-ɏ.\-_+#@/&'’]/;

/**
 * Split into paragraphs on hard newlines, then each paragraph into unbreakable
 * clusters. A cluster is either one CJK character or one Latin/technical run.
 */
export const clusterize = (text: string): string[][] =>
  text.split("\n").map((para) => {
    const out: string[] = [];
    let buf = "";
    for (const ch of Array.from(para)) {
      if (LATIN.test(ch)) {
        buf += ch;
        continue;
      }
      if (buf) {
        out.push(buf);
        buf = "";
      }
      if (ch === " " || ch === "　") {
        // Attach spaces to the previous cluster so no line can start with one.
        if (out.length) out[out.length - 1] += ch;
        continue;
      }
      out.push(ch);
    }
    if (buf) out.push(buf);
    return out;
  });

export type FitStyle = {
  fontFamily: string;
  fontWeight: number | string;
  fontSize: number;
  letterSpacing?: string;
};

const widthOf = (text: string, s: FitStyle): number =>
  measureText({
    text,
    fontFamily: s.fontFamily,
    fontWeight: s.fontWeight,
    fontSize: s.fontSize,
    letterSpacing: s.letterSpacing,
    // Throws instead of silently returning Latin-fallback metrics. Without this
    // the wrong line breaks get baked in and nobody notices until the MP4.
    validateFontIsLoaded: true,
  }).width;

const firstChar = (s: string): string | undefined => Array.from(s)[0];
const lastChar = (s: string): string | undefined => Array.from(s).pop();

/**
 * Greedy wrap with 追い込み kinsoku: a character that may not begin a line gets
 * pulled up onto the previous line even if that line then overflows slightly.
 */
export const wrapClusters = (
  clusters: readonly string[],
  maxWidth: number,
  s: FitStyle,
): string[] => {
  const lines: string[] = [];
  let cur = "";
  for (const c of clusters) {
    const cand = cur + c;
    if (cur !== "" && Math.ceil(widthOf(cand, s)) > maxWidth) {
      const head = firstChar(c);
      // Cannot start a line: pull it up, tolerating one cluster of overflow.
      if (head && NO_START.has(head)) {
        cur = cand;
        continue;
      }
      // Current line ends on an opening bracket: push that down with c.
      const last = lastChar(cur);
      if (last && NO_END.has(last)) {
        lines.push(cur.slice(0, cur.length - last.length).trimEnd());
        cur = last + c;
        continue;
      }
      lines.push(cur.trimEnd());
      cur = c;
    } else {
      cur = cand;
    }
  }
  if (cur.trimEnd()) lines.push(cur.trimEnd());
  return lines;
};

/**
 * Re-cut into exactly `count` lines so no line is a widow. Ragged-right looks
 * accidental at display sizes; balanced lines look set. Only worth it for 2-3
 * lines, which is all a headline should ever be.
 *
 * Ties break toward the earliest cut, so the result is deterministic.
 */
const balanceLines = (
  clusters: readonly string[],
  count: number,
  maxWidth: number,
  s: FitStyle,
): string[] | null => {
  const n = clusters.length;
  if (count < 2 || count > 3 || n < count) return null;

  const cutSets: number[][] = [];
  if (count === 2) {
    for (let i = 1; i < n; i++) cutSets.push([i]);
  } else {
    for (let i = 1; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) cutSets.push([i, j]);
    }
  }

  let best: { lines: string[]; score: number } | null = null;
  for (const cut of cutSets) {
    const bounds = [0, ...cut, n];
    const lines: string[] = [];
    let ok = true;
    for (let k = 0; k < count; k++) {
      const seg = clusters.slice(bounds[k]!, bounds[k + 1]!);
      if (seg.length === 0) {
        ok = false;
        break;
      }
      const head = firstChar(seg[0]!);
      const tail = lastChar(seg[seg.length - 1]!);
      if (head && NO_START.has(head)) {
        ok = false;
        break;
      }
      if (tail && NO_END.has(tail)) {
        ok = false;
        break;
      }
      const line = seg.join("").trimEnd();
      if (Math.ceil(widthOf(line, s)) > maxWidth) {
        ok = false;
        break;
      }
      lines.push(line);
    }
    if (!ok) continue;
    const widths = lines.map((l) => widthOf(l, s));
    const score = Math.max(...widths) - Math.min(...widths);
    if (!best || score < best.score) best = { lines, score };
  }
  return best?.lines ?? null;
};

/** Discrete size ladders, descending. See the header for why these are steps. */
export const LADDER = {
  display: [128, 116, 104, 96, 88],
  headline: [96, 88, 80, 72, 64],
  statement: [72, 64, 58, 52, 46],
  sub: [52, 48, 44, 40, 36],
  caption: [44, 40, 36, 32],
  label: [30, 28, 26],
  credit: [26, 24, 22],
  burnedCaption: [56, 52, 48],
} as const;

export type LadderRole = keyof typeof LADDER;

export const LINE_HEIGHT: Record<LadderRole, number> = {
  display: 1.18,
  headline: 1.22,
  statement: 1.3,
  sub: 1.45,
  caption: 1.55,
  label: 1.4,
  credit: 1.5,
  burnedCaption: 1.4,
};

export type FittedText = {
  fontSize: number;
  /** Absolute px, not a ratio — so callers cannot re-derive it differently. */
  lineHeight: number;
  lines: string[];
  blockHeight: number;
  /** True when even the smallest rung overflows; the build should fail. */
  overflow: boolean;
};

export const fitCJK = ({
  text,
  role,
  box,
  fontFamily,
  fontWeight,
  letterSpacing = "0em",
  maxLines,
  balance = true,
}: {
  text: string;
  role: LadderRole;
  box: { width: number; height: number };
  fontFamily: string;
  fontWeight: number | string;
  letterSpacing?: string;
  maxLines: number;
  balance?: boolean;
}): FittedText => {
  const lhRatio = LINE_HEIGHT[role];
  const paras = clusterize(text);
  let last: FittedText | null = null;

  for (const fontSize of LADDER[role]) {
    const s: FitStyle = { fontFamily, fontWeight, fontSize, letterSpacing };
    let lines: string[] = [];
    for (const clusters of paras) {
      lines.push(...wrapClusters(clusters, box.width, s));
    }

    // Only balance single-paragraph text; hard newlines are an authorial choice.
    if (balance && paras.length === 1 && lines.length >= 2 && lines.length <= 3) {
      const b = balanceLines(paras[0]!, lines.length, box.width, s);
      if (b) lines = b;
    }

    const blockHeight = lines.length * fontSize * lhRatio;
    const widest = lines.length
      ? Math.max(...lines.map((l) => widthOf(l, s)))
      : 0;
    const overflow =
      lines.length > maxLines ||
      blockHeight > box.height ||
      widest > box.width * 1.02;

    last = {
      fontSize,
      lineHeight: fontSize * lhRatio,
      lines,
      blockHeight,
      overflow,
    };
    if (!overflow) return last;
  }

  // Every rung overflowed. Return the smallest with the flag set; the caller
  // (calculateMetadata) turns this into a build failure with the offending text.
  return { ...last!, overflow: true };
};

/**
 * Layout and entrance primitives.
 *
 * Everything animated here is driven by useCurrentFrame(). CSS transitions,
 * CSS animations and Tailwind animate-* classes are forbidden in Remotion — they
 * either don't render or, worse, flicker, because frames are rendered across
 * parallel browser tabs that share no animation state.
 *
 * Note the transform convention throughout: individual `scale` / `translate` /
 * `rotate` properties, inline in `style`, never a composed `transform` string.
 * And `translate` always takes the TWO-VALUE form — a bare number is translateX,
 * which is a silent, easy-to-miss bug.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CANVAS, RHYTHM, SAFE, SAFE_WITH_CAPTIONS } from "../design";
import { EASE } from "../easing";
import type { FittedText } from "../type/fit-cjk";
import type { MotionKit } from "../art";
import { rgba } from "../art";

/** The content box. Readable content lives in here, decoration may leave it. */
export const SafeArea: React.FC<{
  readonly children: React.ReactNode;
  readonly captions?: boolean;
  readonly style?: React.CSSProperties;
}> = ({ children, captions = false, style }) => {
  const s = captions ? SAFE_WITH_CAPTIONS : SAFE;
  return (
    <AbsoluteFill
      style={{
        paddingTop: s.top,
        paddingRight: s.right,
        paddingBottom: s.bottom,
        paddingLeft: s.left,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Background. The texture is a static SVG; the only motion is a slow drift
 * scaled by gridEnergy, so there is exactly one moving background element per
 * frame and it is frame-driven.
 */
export const Ground: React.FC<{
  readonly bg: string;
  readonly fg: string;
  readonly texture: "none" | "grain" | "grid" | "paper";
  readonly kit: MotionKit;
  readonly durationInFrames: number;
}> = ({ bg, fg, texture, kit, durationInFrames }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(
    frame,
    [0, Math.max(1, durationInFrames)],
    [0, 26 * kit.gridEnergy * kit.dir],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      {texture === "grid" ? (
        <AbsoluteFill
          style={{
            translate: `${drift}px 0`,
            backgroundImage: `linear-gradient(to right, ${rgba(fg, 0.05)} 1px, transparent 1px)`,
            backgroundSize: `${140}px 100%`,
          }}
        />
      ) : null}
      {texture === "paper" || texture === "grain" ? (
        <AbsoluteFill style={{ translate: `${drift * 0.35}px 0`, opacity: texture === "paper" ? 0.5 : 0.75 }}>
          <svg width={CANVAS.width} height={CANVAS.height}>
            <filter id="h2v-grain">
              {/* Fixed seed: deterministic across tabs and across runs. */}
              <feTurbulence
                type="fractalNoise"
                baseFrequency={texture === "paper" ? 0.72 : 0.95}
                numOctaves={3}
                seed={7}
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect
              width={CANVAS.width}
              height={CANVAS.height}
              filter="url(#h2v-grain)"
              opacity={texture === "paper" ? 0.055 : 0.085}
            />
          </svg>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** Fade + rise. The default entrance for anything that isn't a line of type. */
export const Rise: React.FC<{
  readonly at: number;
  readonly dur?: number;
  readonly y?: number;
  readonly blur?: number;
  readonly ease?: (n: number) => number;
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
}> = ({ at, dur = 16, y = 28, blur = 0, ease = EASE.crisp, style, children }) => {
  const frame = useCurrentFrame();
  const o = {
    easing: ease,
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
  };
  const p = interpolate(frame, [at, at + dur], [0, 1], o);
  return (
    <div
      style={{
        ...style,
        opacity: p,
        translate: `0 ${interpolate(frame, [at, at + dur], [y, 0], o)}px`,
        filter: blur
          ? `blur(${interpolate(frame, [at, at + dur], [blur, 0], o)}px)`
          : undefined,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Reveal from behind a hard edge. Reads as typeset rather than animated, which
 * is why it's the default for headlines.
 */
export const MaskUp: React.FC<{
  readonly at: number;
  readonly dur?: number;
  readonly lineHeight: number;
  readonly ease?: (n: number) => number;
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
}> = ({ at, dur = 18, lineHeight, ease = EASE.crisp, style, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [1, 0], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ overflow: "hidden", height: lineHeight, ...style }}>
      <div style={{ translate: `0 ${p * 100}%` }}>{children}</div>
    </div>
  );
};

/** A hairline that draws itself. `scaleX` with origin left, never a transform string. */
export const Rule: React.FC<{
  readonly at: number;
  readonly dur?: number;
  readonly width: number | string;
  readonly thickness: number;
  readonly color: string;
  readonly ease?: (n: number) => number;
  readonly origin?: "left" | "right";
  readonly style?: React.CSSProperties;
}> = ({
  at,
  dur = 20,
  width,
  thickness,
  color,
  ease = EASE.crisp,
  origin = "left",
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        width,
        height: thickness,
        backgroundColor: color,
        transformOrigin: `${origin} center`,
        scale: `${p} 1`,
        ...style,
      }}
    />
  );
};

export type LineEmphasis = {
  /** 0-based line index this emphasis applies to. */
  line: number;
  kind: "punch" | "desaturate" | "none";
  /** Frame at which it fires. */
  at: number;
  accent: string;
};

/**
 * Renders pre-fitted lines with a staggered reveal. Takes FittedText rather than
 * a raw string, because fitting must already have happened against loaded fonts —
 * measuring here would risk Latin-fallback metrics and wrong line breaks.
 */
export const TextBlock: React.FC<{
  readonly fitted: FittedText;
  readonly at: number;
  readonly kit: MotionKit;
  readonly color: string;
  readonly fontFamily: string;
  readonly fontWeight: number | string;
  readonly letterSpacing?: string;
  readonly align?: "left" | "center" | "right";
  readonly emphasis?: readonly LineEmphasis[];
  readonly style?: React.CSSProperties;
}> = ({
  fitted,
  at,
  kit,
  color,
  fontFamily,
  fontWeight,
  letterSpacing,
  align = "left",
  emphasis = [],
  style,
}) => {
  const frame = useCurrentFrame();
  const useMask =
    kit.revealStyle === "mask-up" || kit.revealStyle === "clause-cascade";

  return (
    <div style={{ textAlign: align, ...style }}>
      {fitted.lines.map((line, i) => {
        const lineAt = at + i * kit.stagger;
        const em = emphasis.find((e) => e.line === i);

        // Punch: a brief scale-and-tint at the emphasis beat. Because it returns
        // to 1, it reads as stress rather than as a layout change.
        let scale = 1;
        let lineColor = color;
        if (em && em.kind === "punch") {
          scale = interpolate(
            frame,
            [em.at, em.at + 5, em.at + 10],
            [1, 1.035, 1],
            {
              easing: EASE.overshoot,
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );
          const tint = interpolate(frame, [em.at, em.at + 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          lineColor = tint > 0.5 ? em.accent : color;
        }
        if (em && em.kind === "desaturate") {
          const d = interpolate(frame, [em.at, em.at + 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          lineColor = d > 0.5 ? em.accent : color;
        }

        const inner = (
          <span
            style={{
              display: "inline-block",
              fontFamily,
              fontWeight,
              fontSize: fitted.fontSize,
              lineHeight: `${fitted.lineHeight}px`,
              letterSpacing,
              color: lineColor,
              // whiteSpace pre keeps the trailing spaces that kinsoku attached
              // to clusters from collapsing and shifting the line.
              whiteSpace: "pre",
              transformOrigin: align === "center" ? "center" : `${align} center`,
              scale,
            }}
          >
            {line}
          </span>
        );

        return useMask ? (
          <MaskUp
            key={i}
            at={lineAt}
            dur={kit.enter}
            lineHeight={fitted.lineHeight}
            ease={kit.ease}
          >
            {inner}
          </MaskUp>
        ) : (
          <Rise
            key={i}
            at={lineAt}
            dur={kit.enter}
            y={Math.round(fitted.fontSize * 0.3)}
            ease={kit.ease}
            style={{ height: fitted.lineHeight }}
          >
            {inner}
          </Rise>
        );
      })}
    </div>
  );
};

/** Small tracked-out label. Sets the register for the whole frame. */
export const Eyebrow: React.FC<{
  readonly text: string;
  readonly at: number;
  readonly kit: MotionKit;
  readonly color: string;
  readonly fontFamily: string;
}> = ({ text, at, kit, color, fontFamily }) => (
  <Rise at={at} dur={kit.enter} y={12} ease={kit.ease}>
    <span
      style={{
        fontFamily,
        fontWeight: 600,
        fontSize: 30,
        letterSpacing: "0.16em",
        lineHeight: 1.4,
        color,
        marginBottom: RHYTHM * 2,
        display: "inline-block",
      }}
    >
      {text}
    </span>
  </Rise>
);

/**
 * Text-led shots.
 *
 * Composition rules followed throughout, and worth stating because they are what
 * keeps these from looking like slides:
 *   - readable content sits in flow layout inside the safe area; absolute
 *     positioning is for decoration only
 *   - one idea per frame; when there is more to say it becomes another scene
 *   - no cards, badges, pills or tiny labels — those are web UI patterns and they
 *     make video feel cluttered
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CONTENT, RHYTHM, TYPE, cols } from "../lib/design";
import { EASE, EASE_OUT_CUBIC } from "../lib/easing";
import { palette, rgba } from "../lib/art";
import {
  Eyebrow,
  Ground,
  Rise,
  Rule,
  SafeArea,
  TextBlock,
} from "../lib/shots/primitives";
import {
  assertNoOverflow,
  bodyFont,
  emphasisOf,
  fontFor,
  lineEmphasisFor,
  resolveEmphasis,
  useFits,
  type ShotProps,
} from "../lib/scene-context";

/** Opening. Sets register, source and subject in one frame. */
export const TitleCard: React.FC<ShotProps> = ({ scene, timing, art, kit }) => {
  const pal = palette(art);
  const em = resolveEmphasis(scene, timing.frames);
  const sweep = emphasisOf(em, "rule-sweep");

  const fits = useFits(
    {
      headline: {
        text: scene.text.headline,
        role: "display",
        box: { width: cols(8), height: CONTENT.height * 0.6 },
        maxLines: 2,
        weight: art.displayFace === "serif" ? 600 : 700,
      },
      sub: {
        text: scene.text.sub,
        role: "sub",
        box: { width: cols(7), height: 200 },
        maxLines: 2,
      },
    },
    art,
  );
  assertNoOverflow(fits, scene.id);

  const headlineAt = scene.text.eyebrow ? kit.stagger * 2 : 0;

  return (
    <AbsoluteFill>
      <Ground
        bg={pal.bg}
        fg={pal.fg}
        texture={art.texture}
        kit={kit}
        durationInFrames={timing.frames}
      />
      <SafeArea style={{ justifyContent: "center" }}>
        {scene.text.eyebrow ? (
          <Eyebrow
            text={scene.text.eyebrow}
            at={0}
            kit={kit}
            color={pal.accent}
            fontFamily={bodyFont(art)}
          />
        ) : null}

        {fits.headline ? (
          <TextBlock
            fitted={fits.headline}
            at={headlineAt}
            kit={kit}
            color={pal.fg}
            fontFamily={fontFor("display", art)}
            fontWeight={art.displayFace === "serif" ? 600 : 700}
            letterSpacing={`${TYPE.display.tracking}em`}
            style={{ marginTop: RHYTHM * 3 }}
          />
        ) : null}

        <Rule
          at={sweep ? sweep.at : headlineAt + kit.enter + kit.stagger}
          dur={24}
          width={cols(4)}
          thickness={pal.ruleAccent}
          color={pal.accent}
          ease={kit.ease}
          style={{ marginTop: RHYTHM * 5, marginBottom: RHYTHM * 4 }}
        />

        {fits.sub ? (
          <TextBlock
            fitted={fits.sub}
            at={headlineAt + kit.enter + kit.stagger * 2}
            kit={kit}
            color={pal.muted}
            fontFamily={bodyFont(art)}
            fontWeight={TYPE.sub.weight}
            letterSpacing={`${TYPE.sub.tracking}em`}
          />
        ) : null}
      </SafeArea>
    </AbsoluteFill>
  );
};

/** A single claim, centred, with nothing to compete against it. */
export const StatementCard: React.FC<ShotProps> = ({
  scene,
  timing,
  art,
  kit,
}) => {
  const pal = palette(art);
  const em = resolveEmphasis(scene, timing.frames);

  const fits = useFits(
    {
      headline: {
        text: scene.text.headline,
        role: "statement",
        box: { width: cols(10), height: CONTENT.height * 0.7 },
        maxLines: 3,
      },
    },
    art,
  );
  assertNoOverflow(fits, scene.id);

  const lineEm = fits.headline
    ? lineEmphasisFor(em, "headline", fits.headline.lines.length, pal.accent)
    : [];

  return (
    <AbsoluteFill>
      <Ground
        bg={pal.bg}
        fg={pal.fg}
        texture={art.texture}
        kit={kit}
        durationInFrames={timing.frames}
      />
      <SafeArea style={{ justifyContent: "center", alignItems: "center" }}>
        {scene.text.eyebrow ? (
          <Eyebrow
            text={scene.text.eyebrow}
            at={0}
            kit={kit}
            color={pal.accent}
            fontFamily={bodyFont(art)}
          />
        ) : null}
        {fits.headline ? (
          <TextBlock
            fitted={fits.headline}
            at={scene.text.eyebrow ? kit.stagger * 2 : 0}
            kit={kit}
            color={pal.fg}
            fontFamily={fontFor("statement", art)}
            fontWeight={TYPE.statement.weight}
            align="center"
            emphasis={lineEm}
            style={{ marginTop: RHYTHM * 3 }}
          />
        ) : null}
      </SafeArea>
    </AbsoluteFill>
  );
};

/** One number, made the subject of the frame. */
export const StatCard: React.FC<ShotProps> = ({ scene, timing, art, kit }) => {
  const frame = useCurrentFrame();
  const pal = palette(art);
  const em = resolveEmphasis(scene, timing.frames);
  const sweep = emphasisOf(em, "rule-sweep") ?? emphasisOf(em, "underline");
  const stat = scene.text.stat;

  const fits = useFits(
    {
      of: {
        text: stat?.of,
        role: "caption",
        box: { width: cols(9), height: 160 },
        maxLines: 2,
      },
      headline: {
        text: scene.text.headline,
        role: "sub",
        box: { width: cols(8), height: 200 },
        maxLines: 2,
      },
    },
    art,
  );
  assertNoOverflow(fits, scene.id);

  const digits = Array.from(stat?.value ?? "");
  // Each glyph rises on its own beat. Character-by-character rather than a
  // count-up, because a count-up on a non-numeric value (like "3×") breaks.
  const digitStagger = 3;

  return (
    <AbsoluteFill>
      <Ground
        bg={pal.bg}
        fg={pal.fg}
        texture={art.texture}
        kit={kit}
        durationInFrames={timing.frames}
      />
      <SafeArea style={{ justifyContent: "center" }}>
        {scene.text.eyebrow ? (
          <Eyebrow
            text={scene.text.eyebrow}
            at={0}
            kit={kit}
            color={pal.accent}
            fontFamily={bodyFont(art)}
          />
        ) : null}

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: RHYTHM * 2,
            marginTop: RHYTHM * 2,
          }}
        >
          {digits.map((d, i) => {
            const at = kit.stagger + i * digitStagger;
            const o = {
              easing: kit.ease,
              extrapolateLeft: "clamp" as const,
              extrapolateRight: "clamp" as const,
            };
            return (
              <span
                key={i}
                style={{
                  fontFamily: fontFor("display", art),
                  fontWeight: TYPE.statValue.weight,
                  fontSize: TYPE.statValue.px,
                  lineHeight: 1,
                  letterSpacing: `${TYPE.statValue.tracking}em`,
                  fontVariantNumeric: "tabular-nums",
                  color: pal.fg,
                  display: "inline-block",
                  opacity: interpolate(frame, [at, at + kit.enter], [0, 1], o),
                  translate: `0 ${interpolate(frame, [at, at + kit.enter], [36, 0], o)}px`,
                }}
              >
                {d}
              </span>
            );
          })}
          {stat?.unit ? (
            <Rise
              at={kit.stagger + digits.length * digitStagger}
              dur={kit.enter}
              y={16}
              ease={kit.ease}
            >
              <span
                style={{
                  fontFamily: bodyFont(art),
                  fontWeight: 500,
                  fontSize: 52,
                  color: pal.accent,
                }}
              >
                {stat.unit}
              </span>
            </Rise>
          ) : null}
        </div>

        <Rule
          at={sweep ? sweep.at : kit.stagger + digits.length * digitStagger + 4}
          dur={20}
          width={cols(5)}
          thickness={pal.ruleAccent}
          color={pal.accent}
          ease={kit.ease}
          style={{ marginTop: RHYTHM * 3, marginBottom: RHYTHM * 3 }}
        />

        {fits.of ? (
          <TextBlock
            fitted={fits.of}
            at={kit.stagger + digits.length * digitStagger + 8}
            kit={kit}
            color={pal.muted}
            fontFamily={bodyFont(art)}
            fontWeight={TYPE.caption.weight}
            letterSpacing={`${TYPE.caption.tracking}em`}
          />
        ) : null}
        {fits.headline ? (
          <TextBlock
            fitted={fits.headline}
            at={kit.stagger + digits.length * digitStagger + 12}
            kit={kit}
            color={pal.fg}
            fontFamily={bodyFont(art)}
            fontWeight={TYPE.sub.weight}
            style={{ marginTop: RHYTHM * 2 }}
          />
        ) : null}
      </SafeArea>
    </AbsoluteFill>
  );
};

/**
 * A sentence worth quoting verbatim.
 *
 * The opening 「 hangs outside the text box via a negative margin. CJK quotation
 * marks occupy a full 1em box, so without hanging it the quote looks visibly
 * indented relative to everything else in the frame. This is the difference
 * between "generated" and "set".
 */
export const PullQuote: React.FC<ShotProps> = ({ scene, timing, art, kit }) => {
  const pal = palette(art);

  const fits = useFits(
    {
      headline: {
        text: scene.text.headline,
        role: "statement",
        box: { width: cols(9), height: CONTENT.height * 0.62 },
        maxLines: 3,
      },
      credit: {
        text: scene.text.credit,
        role: "credit",
        box: { width: cols(6), height: 100 },
        maxLines: 1,
      },
    },
    art,
  );
  assertNoOverflow(fits, scene.id);

  const quoteSize = (fits.headline?.fontSize ?? TYPE.statement.px) * 1.6;

  return (
    <AbsoluteFill>
      <Ground
        bg={pal.bg}
        fg={pal.fg}
        texture={art.texture}
        kit={kit}
        durationInFrames={timing.frames}
      />
      <SafeArea style={{ justifyContent: "center" }}>
        <div style={{ marginLeft: cols(1) + 40 }}>
          <Rise at={0} dur={kit.enter} y={10} blur={8} ease={kit.ease}>
            <span
              style={{
                fontFamily: fontFor("display", art),
                fontSize: quoteSize,
                lineHeight: 0.9,
                color: pal.accent,
                display: "inline-block",
                marginLeft: "-1em",
                marginBottom: -quoteSize * 0.25,
              }}
            >
              「
            </span>
          </Rise>

          {fits.headline ? (
            <TextBlock
              fitted={fits.headline}
              at={kit.stagger}
              kit={kit}
              color={pal.fg}
              fontFamily={fontFor("statement", art)}
              fontWeight={TYPE.statement.weight}
            />
          ) : null}

          {fits.credit ? (
            <TextBlock
              fitted={fits.credit}
              at={kit.stagger + kit.enter + kit.stagger * 2}
              kit={kit}
              color={pal.muted}
              fontFamily={bodyFont(art)}
              fontWeight={TYPE.credit.weight}
              letterSpacing={`${TYPE.credit.tracking}em`}
              align="right"
              style={{ width: cols(9), marginTop: RHYTHM * 4 }}
            />
          ) : null}
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};

/**
 * The limitation. The one inverted shot in the system.
 *
 * Inverting the ground makes the caveat land structurally rather than only
 * verbally — the viewer feels the turn before reading it. This is also the shot
 * most tools skip entirely, and skipping it is why their output reads as
 * marketing rather than as an account of the work.
 */
export const CaveatBeat: React.FC<ShotProps> = ({ scene, timing, art, kit }) => {
  const frame = useCurrentFrame();
  const pal = palette(art, true);
  const em = resolveEmphasis(scene, timing.frames);
  const flash = emphasisOf(em, "flash");
  const strike = emphasisOf(em, "strike");

  const fits = useFits(
    {
      headline: {
        text: scene.text.headline,
        role: "headline",
        box: { width: cols(7), height: CONTENT.height * 0.4 },
        maxLines: 2,
      },
      sub: {
        text: scene.text.sub,
        role: "sub",
        box: { width: cols(7), height: 300 },
        maxLines: 3,
      },
    },
    art,
  );
  assertNoOverflow(fits, scene.id);

  // A brief dip in the ground, not the text: the frame flinches.
  const groundOpacity = flash
    ? interpolate(
        frame,
        [flash.at, flash.at + 3, flash.at + 6],
        [1, 0.82, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 1;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: groundOpacity }}>
        <Ground
          bg={pal.bg}
          fg={pal.fg}
          texture={art.texture === "none" ? "none" : "grain"}
          kit={kit}
          durationInFrames={timing.frames}
        />
      </AbsoluteFill>

      <SafeArea style={{ justifyContent: "center" }}>
        <div style={{ marginLeft: cols(1) + 40 }}>
          {scene.text.eyebrow ? (
            <Eyebrow
              text={scene.text.eyebrow}
              at={0}
              kit={kit}
              color={pal.accent}
              fontFamily={bodyFont(art)}
            />
          ) : null}

          {fits.headline ? (
            <TextBlock
              fitted={fits.headline}
              at={kit.stagger}
              kit={kit}
              color={pal.fg}
              fontFamily={fontFor("headline", art)}
              fontWeight={TYPE.headline.weight}
              style={{ marginTop: RHYTHM * 3 }}
            />
          ) : null}

          <div style={{ position: "relative", marginTop: RHYTHM * 4 }}>
            {fits.sub ? (
              <TextBlock
                fitted={fits.sub}
                at={kit.stagger + kit.enter}
                kit={kit}
                color={pal.muted}
                fontFamily={bodyFont(art)}
                fontWeight={TYPE.sub.weight}
                letterSpacing={`${TYPE.sub.tracking}em`}
              />
            ) : null}

            {strike && fits.sub ? (
              <Rule
                at={strike.at}
                dur={12}
                width={cols(7)}
                thickness={pal.ruleAccent}
                color={pal.accent}
                ease={EASE_OUT_CUBIC}
                style={{
                  position: "absolute",
                  top: fits.sub.lineHeight * 0.5,
                  left: 0,
                  // A hair off level, so it reads as struck through by hand
                  // rather than as a border.
                  rotate: "-0.6deg",
                }}
              />
            ) : null}
          </div>
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};

/** Three or four points, arriving one at a time. The rule draws, then the text. */
export const BulletLadder: React.FC<ShotProps> = ({
  scene,
  timing,
  art,
  kit,
}) => {
  const pal = palette(art);
  const items = scene.text.items ?? [];

  const fits = useFits(
    {
      headline: {
        text: scene.text.headline,
        role: "headline",
        box: { width: cols(8), height: 240 },
        maxLines: 2,
      },
    },
    art,
  );
  assertNoOverflow(fits, scene.id);

  const rowsAt = (fits.headline?.lines.length ?? 0) * kit.stagger + kit.enter;

  return (
    <AbsoluteFill>
      <Ground
        bg={pal.bg}
        fg={pal.fg}
        texture={art.texture}
        kit={kit}
        durationInFrames={timing.frames}
      />
      <SafeArea style={{ justifyContent: "center" }}>
        {scene.text.eyebrow ? (
          <Eyebrow
            text={scene.text.eyebrow}
            at={0}
            kit={kit}
            color={pal.accent}
            fontFamily={bodyFont(art)}
          />
        ) : null}

        {fits.headline ? (
          <TextBlock
            fitted={fits.headline}
            at={kit.stagger}
            kit={kit}
            color={pal.fg}
            fontFamily={fontFor("headline", art)}
            fontWeight={TYPE.headline.weight}
            style={{ marginTop: RHYTHM * 2, marginBottom: RHYTHM * 5 }}
          />
        ) : null}

        <div style={{ display: "flex", flexDirection: "column" }}>
          {items.map((item, i) => {
            const at = rowsAt + i * (kit.stagger + 4);
            return (
              <div key={i}>
                <Rule
                  at={at}
                  dur={16}
                  width={cols(9)}
                  thickness={pal.hairline}
                  color={rgba(pal.fg, 0.22)}
                  ease={kit.ease}
                />
                <Rise
                  at={at + 4}
                  dur={kit.enter}
                  y={18}
                  ease={kit.ease}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: RHYTHM * 5,
                    paddingTop: RHYTHM * 2,
                    paddingBottom: RHYTHM * 3,
                  }}
                >
                  <span
                    style={{
                      fontFamily: bodyFont(art),
                      fontWeight: 600,
                      fontSize: TYPE.label.px,
                      letterSpacing: `${TYPE.label.tracking}em`,
                      color: pal.accent,
                      fontVariantNumeric: "tabular-nums",
                      minWidth: 72,
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontFamily: bodyFont(art),
                      fontWeight: TYPE.sub.weight,
                      fontSize: TYPE.sub.px,
                      lineHeight: TYPE.sub.lh,
                      color: pal.fg,
                    }}
                  >
                    {item.text}
                  </span>
                </Rise>
              </div>
            );
          })}
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};

/** Close on the core message, credit the source, settle out. */
export const OutroCredit: React.FC<ShotProps> = ({
  scene,
  timing,
  art,
  kit,
}) => {
  const frame = useCurrentFrame();
  const pal = palette(art);

  const fits = useFits(
    {
      headline: {
        text: scene.text.headline,
        role: "statement",
        box: { width: cols(9), height: CONTENT.height * 0.6 },
        maxLines: 3,
      },
      credit: {
        text: scene.text.credit,
        role: "credit",
        box: { width: cols(10), height: 100 },
        maxLines: 2,
      },
    },
    art,
  );
  assertNoOverflow(fits, scene.id);

  // A very slow push on the whole frame. Reads as the film settling rather than
  // as a move; 1.2% over the shot is deliberately near the threshold of notice.
  const settle = interpolate(
    frame,
    [0, Math.max(1, timing.frames - 1)],
    [1, 1.012],
    { easing: EASE.editorial, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill>
      <Ground
        bg={pal.bg}
        fg={pal.fg}
        texture={art.texture}
        kit={kit}
        durationInFrames={timing.frames}
      />
      <AbsoluteFill style={{ scale: settle }}>
        <SafeArea style={{ justifyContent: "center", alignItems: "center" }}>
          {fits.headline ? (
            <TextBlock
              fitted={fits.headline}
              at={0}
              kit={kit}
              color={pal.fg}
              fontFamily={fontFor("statement", art)}
              fontWeight={TYPE.statement.weight}
              align="center"
            />
          ) : null}
        </SafeArea>
      </AbsoluteFill>

      <SafeArea style={{ justifyContent: "flex-end" }}>
        {fits.credit ? (
          <Rise
            at={(fits.headline?.lines.length ?? 1) * kit.stagger + kit.enter}
            dur={kit.enter}
            y={12}
            ease={kit.ease}
          >
            <span
              style={{
                fontFamily: bodyFont(art),
                fontWeight: TYPE.credit.weight,
                fontSize: TYPE.credit.px,
                letterSpacing: `${TYPE.credit.tracking}em`,
                color: pal.muted,
              }}
            >
              {scene.text.credit}
            </span>
          </Rise>
        ) : null}
      </SafeArea>
    </AbsoluteFill>
  );
};

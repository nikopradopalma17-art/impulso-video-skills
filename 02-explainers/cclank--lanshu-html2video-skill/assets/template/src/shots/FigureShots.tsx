/**
 * Figure-led shots.
 *
 * The editorial premise: a figure plus its caption is often the densest thing on
 * a research page — the author already compressed a finding into one sentence and
 * drew the picture for it. So captions are primary content, and these shots push
 * INTO a figure rather than shrinking it to fit; the sources here run 1.4x-2.4x
 * the canvas, so there are real pixels to spend.
 *
 * LAYOUT RULE, learned from a render that violated it: when a figure is not
 * full-bleed, the image is a FLOW child alongside the text, never an absolutely
 * positioned layer beneath it. Mixing an absolute image with flex text put
 * headlines on top of figures; once both are in the same layout pass, overlap
 * becomes impossible to write rather than something to remember.
 *
 * Full-bleed is the one case where the image IS the background, and there the text
 * sits over a scrim deliberately.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { RHYTHM, SLOT_PX, TYPE, cols } from "../lib/design";
import { EASE } from "../lib/easing";
import { isDark, palette, rgba } from "../lib/art";
import { Eyebrow, Ground, Rise, Rule, SafeArea, TextBlock } from "../lib/shots/primitives";
import {
  ContainedImage,
  ImageLayer,
  FigureImage,
  projectPoint,
  useKeyframedViewport,
  type Keyframe,
} from "../lib/shots/KenBurnsImage";
import { resolveMove, type Move } from "../lib/move";
import {
  assertNoOverflow,
  bodyFont,
  emphasisOf,
  fontFor,
  resolveEmphasis,
  useFits,
  type ShotProps,
} from "../lib/scene-context";

/** Callouts are annotations, not headings; 36px keeps them subordinate to the headline. */
const CALLOUT_PX = 36;

/** Keeps a white figure from dissolving into a cream ground. */
const edge = (color: string, w: number) => `inset 0 0 0 ${w / 2}px ${rgba(color, 0.1)}`;

/** One self-contained finding and its image. */
export const FigureReveal: React.FC<ShotProps> = ({
  scene,
  timing,
  art,
  kit,
  assets,
}) => {
  const pal = palette(art);
  const em = resolveEmphasis(scene, timing.frames);
  const callout = emphasisOf(em, "callout");

  const binding = scene.assets[0];
  const asset = binding ? assets.get(binding.ref) : undefined;
  const slot = binding?.slot ?? "full";
  const isFullBleed = slot === "full";
  const isContain = binding?.fit === "contain";
  const flow = SLOT_PX[slot];

  const textWidth = isFullBleed ? cols(8) : flow.w;
  const fits = useFits(
    {
      headline: {
        text: scene.text.headline,
        role: "headline",
        box: { width: textWidth, height: 260 },
        maxLines: 2,
      },
      caption: {
        text: scene.text.caption,
        role: "caption",
        box: { width: textWidth, height: 170 },
        maxLines: 2,
      },
    },
    art,
  );
  assertNoOverflow(fits, scene.id);

  const scrimBase = isDark(pal.bg) ? pal.bg : pal.fg;
  const overColor = isDark(pal.bg) ? pal.fg : pal.bg;

  const image =
    asset && binding ? (
      <FigureImage
        src={asset.src}
        intrinsic={asset.intrinsic}
        dest={isFullBleed ? SLOT_PX.full : { w: flow.w, h: flow.h }}
        move={binding.move as Move}
        fit={binding.fit}
        durationInFrames={timing.frames}
        easing={EASE.editorial}
        radius={isContain ? pal.radius : 0}
        edgeColor={rgba(pal.fg, 0.1)}
        edgeWidth={pal.hairline}
      />
    ) : null;

  const text = (
    <>
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
          at={12}
          kit={kit}
          color={isFullBleed ? overColor : pal.fg}
          fontFamily={fontFor("headline", art)}
          fontWeight={TYPE.headline.weight}
        />
      ) : null}
      {callout ? (
        <Rule
          at={callout.at}
          dur={18}
          width={cols(3)}
          thickness={pal.ruleAccent}
          color={pal.accent}
          ease={kit.ease}
          style={{ marginTop: RHYTHM * 3, marginBottom: RHYTHM * 2 }}
        />
      ) : null}
      {fits.caption ? (
        <TextBlock
          fitted={fits.caption}
          at={12 + kit.enter + kit.stagger}
          kit={kit}
          color={isFullBleed ? rgba(overColor, 0.84) : pal.muted}
          fontFamily={bodyFont(art)}
          fontWeight={TYPE.caption.weight}
          letterSpacing={`${TYPE.caption.tracking}em`}
          style={{ marginTop: callout ? 0 : RHYTHM * 3 }}
        />
      ) : null}
    </>
  );

  if (isFullBleed) {
    return (
      <AbsoluteFill>
        <Ground bg={pal.bg} fg={pal.fg} texture={art.texture} kit={kit} durationInFrames={timing.frames} />
        <AbsoluteFill>{image}</AbsoluteFill>
        <AbsoluteFill
          style={{
            background: `linear-gradient(to top, ${rgba(scrimBase, 0.93)} 0%, ${rgba(scrimBase, 0.74)} 28%, ${rgba(scrimBase, 0)} 60%)`,
          }}
        />
        <SafeArea style={{ justifyContent: "flex-end" }}>{text}</SafeArea>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Ground bg={pal.bg} fg={pal.fg} texture={art.texture} kit={kit} durationInFrames={timing.frames} />
      {/* Centre the image+text GROUP, not their contents: both children are
          `flow.w` wide, so centring the column removes the lopsided dead margin a
          narrow slot leaves on the right while the text stays left-aligned within
          its own box. Left-anchoring the group made a 1240px chart in a 1920px
          frame look accidentally off-centre. */}
      <SafeArea style={{ justifyContent: "center", alignItems: "center" }}>
        <Rise at={0} dur={kit.enter} y={18} ease={kit.ease}>
          <div
            style={{
              position: "relative",
              width: flow.w,
              height: flow.h,
              marginBottom: RHYTHM * 5,
              borderRadius: pal.radius,
              overflow: "hidden",
              boxShadow: isContain ? undefined : edge(pal.fg, pal.hairline),
            }}
          >
            {image}
          </div>
        </Rise>
        <div style={{ width: flow.w }}>{text}</div>
      </SafeArea>
    </AbsoluteFill>
  );
};

/** Two states of one thing. */
export const CompareSplit: React.FC<ShotProps> = ({
  scene,
  timing,
  art,
  kit,
  assets,
}) => {
  const frame = useCurrentFrame();
  const pal = palette(art);
  const em = resolveEmphasis(scene, timing.frames);
  const underline = emphasisOf(em, "underline");
  const items = scene.text.items ?? [];

  const fits = useFits(
    {
      headline: {
        text: scene.text.headline,
        role: "headline",
        box: { width: cols(10), height: 240 },
        maxLines: 2,
      },
      caption: {
        text: scene.text.caption,
        role: "caption",
        box: { width: cols(10), height: 140 },
        maxLines: 2,
      },
    },
    art,
  );
  assertNoOverflow(fits, scene.id);

  const binding = scene.assets[0];
  const asset = binding ? assets.get(binding.ref) : undefined;
  const isContain = binding?.fit === "contain";
  const flow = binding ? (SLOT_PX[binding.slot]) : null;

  const dividerAt = kit.stagger * 2 + kit.enter;
  const dividerP = interpolate(frame, [dividerAt, dividerAt + 20], [0, 1], {
    easing: kit.ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Ground bg={pal.bg} fg={pal.fg} texture={art.texture} kit={kit} durationInFrames={timing.frames} />
      <SafeArea style={{ justifyContent: "center" }}>
        {fits.headline ? (
          <TextBlock
            fitted={fits.headline}
            at={0}
            kit={kit}
            color={pal.fg}
            fontFamily={fontFor("headline", art)}
            fontWeight={TYPE.headline.weight}
          />
        ) : null}

        {underline ? (
          <Rule
            at={underline.at}
            dur={22}
            width={cols(10)}
            thickness={pal.ruleAccent}
            color={pal.accent}
            ease={kit.ease}
            style={{ marginTop: RHYTHM * 2 }}
          />
        ) : null}

        {asset && binding && flow ? (
          <Rise at={kit.stagger} dur={kit.enter} y={18} ease={kit.ease}>
            <div
              style={{
                position: "relative",
                width: flow.w,
                height: flow.h,
                marginTop: RHYTHM * 4,
                borderRadius: pal.radius,
                overflow: "hidden",
                boxShadow: isContain ? undefined : edge(pal.fg, pal.hairline),
              }}
            >
              <FigureImage
                src={asset.src}
                intrinsic={asset.intrinsic}
                dest={{ w: flow.w, h: flow.h }}
                move={binding.move as Move}
                fit={binding.fit}
                durationInFrames={timing.frames}
                radius={isContain ? pal.radius : 0}
                edgeColor={rgba(pal.fg, 0.1)}
                edgeWidth={pal.hairline}
              />
            </div>
          </Rise>
        ) : null}

        <div style={{ display: "flex", gap: 40, marginTop: RHYTHM * 5, position: "relative" }}>
          {items.slice(0, 2).map((item, i) => (
            <Rise
              key={i}
              at={kit.stagger * (i * 2)}
              dur={kit.enter}
              y={22}
              ease={kit.ease}
              style={{ width: cols(6) }}
            >
              <span
                style={{
                  display: "block",
                  fontFamily: bodyFont(art),
                  fontWeight: 600,
                  fontSize: TYPE.label.px,
                  letterSpacing: `${TYPE.label.tracking}em`,
                  color: i === 0 ? pal.muted : pal.accent,
                  marginBottom: RHYTHM * 2,
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  display: "block",
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
          ))}
          {items.length >= 2 ? (
            <div
              style={{
                position: "absolute",
                left: cols(6) + 20 - pal.hairline / 2,
                top: 0,
                width: pal.hairline,
                height: "100%",
                backgroundColor: rgba(pal.fg, 0.2),
                transformOrigin: "center top",
                scale: `1 ${dividerP}`,
              }}
            />
          ) : null}
        </div>

        {fits.caption ? (
          <TextBlock
            fitted={fits.caption}
            at={dividerAt}
            kit={kit}
            color={pal.muted}
            fontFamily={bodyFont(art)}
            fontWeight={TYPE.caption.weight}
            style={{ marginTop: RHYTHM * 4 }}
          />
        ) : null}
      </SafeArea>
    </AbsoluteFill>
  );
};

/**
 * A schematic, walked through one callout at a time.
 *
 * The editorial correction that shaped this shot came from looking at a render,
 * not from reasoning: DO NOT crop into a wide schematic. The first version panned
 * across a 3.28:1 diagram at 55% width, which destroyed the left-to-right flow
 * that WAS the diagram's content, and magnified the figure's own labels until they
 * outweighed the headline. A schematic wants to be shown whole, at the largest size
 * that fits, with attention moved by annotation rather than by camera.
 *
 * So `move: hold` over the full rect is the intended default and the "walk" is the
 * callouts arriving in sequence. Panning stays available — supply `focus` rects —
 * for figures genuinely too large to read at once.
 */
export const DiagramWalk: React.FC<ShotProps> = ({
  scene,
  timing,
  art,
  kit,
  assets,
}) => {
  const frame = useCurrentFrame();
  const pal = palette(art);

  const binding = scene.assets[0];
  const asset = binding ? assets.get(binding.ref) : undefined;
  const slot = binding?.slot ?? "band";
  const isFullBleed = slot === "full";
  const flow = SLOT_PX[slot];
  const dest = isFullBleed ? SLOT_PX.full : { w: flow.w, h: flow.h };
  // A schematic shown whole is the default for this shot; contain makes that
  // literal by letterboxing instead of cropping to the slot's aspect.
  const isContain = binding?.fit === "contain";

  const fits = useFits(
    {
      headline: {
        text: scene.text.headline,
        role: "headline",
        box: { width: cols(9), height: 200 },
        maxLines: 2,
      },
    },
    art,
  );
  assertNoOverflow(fits, scene.id);

  // Keyframes: the move's endpoints, plus one per callout that supplies a focus
  // rect. A callout without `focus` annotates without moving the camera.
  const keyframes: Keyframe[] = React.useMemo(() => {
    if (!asset || !binding) return [];
    const resolved = resolveMove(binding.move as Move, asset.intrinsic, dest);
    const kfs: Keyframe[] = [{ at: 0, rect: resolved.from }];
    for (const c of scene.callouts) {
      if (!c.focus) continue;
      // Land the pan a beat BEFORE the words arrive, so the eye is already where
      // the text is about to point.
      kfs.push({
        at: Math.max(1, Math.round(c.at * (timing.frames - 1)) - kit.enter),
        rect: c.focus,
      });
    }
    kfs.push({ at: Math.max(1, timing.frames - 1), rect: resolved.to });
    return kfs.sort((a, b) => a.at - b.at);
  }, [asset, binding, dest, scene.callouts, timing.frames, kit.enter]);

  const viewport = useKeyframedViewport(
    keyframes.length ? keyframes : [{ at: 0, rect: { x: 0, y: 0, w: 1, h: 1 } }],
    asset?.intrinsic ?? { w: 1920, h: 1080 },
    dest,
    EASE.editorial,
  );

  const activeIndex = scene.callouts.reduce(
    (acc, c, i) => (frame >= c.at * (timing.frames - 1) ? i : acc),
    -1,
  );

  /**
   * `below` places the chips outside the image, under it, with a short leader up
   * to the point they refer to. Chips laid ON the figure covered the figure's own
   * labels — a diagram is already dense with type, so the annotation has to live
   * in the margin the layout reserves for it, not on top of the artwork.
   * Full-bleed has no margin, so there the chips do sit over the image.
   */
  const calloutLayer = (below: boolean) => (
    <>
      {scene.callouts.map((c, i) => {
        const at = Math.round(c.at * (timing.frames - 1));
        const p = projectPoint(c.anchor, viewport.V, dest);
        const isActive = i === activeIndex;
        const enter = interpolate(frame, [at, at + kit.enter], [0, 1], {
          easing: kit.ease,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        // Spent callouts drop back rather than vanish, so the thread of what was
        // already said stays readable. Exactly one is at full strength.
        const strength = isActive ? 1 : 0.42;
        const x = Math.min(Math.max(p.x, 24), dest.w - 24);
        const y = below ? dest.h + RHYTHM * 3 : Math.min(Math.max(p.y, 24), dest.h - 24);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              opacity: enter * strength,
              translate: `-50% ${(1 - enter) * 10}px`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {below ? (
              // Leader from the chip up to the region it names.
              <div
                style={{
                  width: pal.hairline,
                  height: interpolate(frame, [at, at + kit.enter], [0, RHYTHM * 2], {
                    easing: kit.ease,
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  backgroundColor: pal.accent,
                  marginBottom: RHYTHM,
                }}
              />
            ) : (
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  backgroundColor: pal.accent,
                  scale: `${enter}`,
                  marginBottom: RHYTHM,
                }}
              />
            )}
            <span
              style={{
                display: "inline-block",
                fontFamily: bodyFont(art),
                fontWeight: 500,
                fontSize: CALLOUT_PX,
                lineHeight: 1.3,
                // A solid chip in the ground colour rather than a translucent
                // scrim: it reads as an annotation placed on the page, not a veil
                // dropped over the artwork.
                color: pal.fg,
                backgroundColor: pal.bg,
                boxShadow: `0 0 0 ${pal.hairline / 2}px ${rgba(pal.fg, 0.14)}`,
                padding: `${RHYTHM}px ${RHYTHM * 2}px`,
                borderRadius: Math.min(pal.radius, 8),
                whiteSpace: "nowrap",
              }}
            >
              {c.text}
            </span>
          </div>
        );
      })}
    </>
  );

  if (isFullBleed) {
    const scrimBase = isDark(pal.bg) ? pal.bg : pal.fg;
    const overColor = isDark(pal.bg) ? pal.fg : pal.bg;
    return (
      <AbsoluteFill>
        <Ground bg={pal.bg} fg={pal.fg} texture={art.texture} kit={kit} durationInFrames={timing.frames} />
        <AbsoluteFill>
          {asset ? (
            isContain ? (
              <ContainedImage
                  src={asset.src}
                  intrinsic={asset.intrinsic}
                  dest={dest}
                  radius={pal.radius}
                  edgeColor={rgba(pal.fg, 0.1)}
                  edgeWidth={pal.hairline}
                />
            ) : (
              <ImageLayer src={asset.src} viewport={viewport} dest={dest} intrinsic={asset.intrinsic} />
            )
          ) : null}
          {calloutLayer(false)}
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            background: `linear-gradient(to bottom, ${rgba(scrimBase, 0.9)} 0%, ${rgba(scrimBase, 0.5)} 20%, ${rgba(scrimBase, 0)} 42%)`,
          }}
        />
        <SafeArea>
          {scene.text.eyebrow ? (
            <Eyebrow text={scene.text.eyebrow} at={0} kit={kit} color={pal.accent} fontFamily={bodyFont(art)} />
          ) : null}
          {fits.headline ? (
            <TextBlock
              fitted={fits.headline}
              at={kit.stagger}
              kit={kit}
              color={overColor}
              fontFamily={fontFor("headline", art)}
              fontWeight={TYPE.headline.weight}
            />
          ) : null}
        </SafeArea>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Ground bg={pal.bg} fg={pal.fg} texture={art.texture} kit={kit} durationInFrames={timing.frames} />
      {/* flex-start rather than centred: the callout chips hang below the band, so
          the group needs the slack at the bottom of the content box, not around it. */}
      <SafeArea style={{ justifyContent: "flex-start" }}>
        {scene.text.eyebrow ? (
          <Eyebrow text={scene.text.eyebrow} at={0} kit={kit} color={pal.accent} fontFamily={bodyFont(art)} />
        ) : null}
        {fits.headline ? (
          <TextBlock
            fitted={fits.headline}
            at={kit.stagger}
            kit={kit}
            color={pal.fg}
            fontFamily={fontFor("headline", art)}
            fontWeight={TYPE.headline.weight}
            style={{ marginBottom: RHYTHM * 4 }}
          />
        ) : null}
        <Rise at={kit.stagger * 2} dur={kit.enter} y={18} ease={kit.ease}>
          {/* The clip is an inner layer so the chips can sit outside the image. */}
          <div style={{ position: "relative", width: flow.w, height: flow.h }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: pal.radius,
                overflow: "hidden",
                boxShadow: isContain ? undefined : edge(pal.fg, pal.hairline),
              }}
            >
              {asset ? (
                isContain ? (
                  <ContainedImage
                  src={asset.src}
                  intrinsic={asset.intrinsic}
                  dest={dest}
                  radius={pal.radius}
                  edgeColor={rgba(pal.fg, 0.1)}
                  edgeWidth={pal.hairline}
                />
                ) : (
                  <ImageLayer src={asset.src} viewport={viewport} dest={dest} intrinsic={asset.intrinsic} />
                )
              ) : null}
            </div>
            {calloutLayer(true)}
          </div>
        </Rise>
      </SafeArea>
    </AbsoluteFill>
  );
};

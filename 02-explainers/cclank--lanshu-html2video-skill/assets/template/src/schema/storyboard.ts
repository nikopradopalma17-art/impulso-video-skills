/**
 * storyboard.json — the reviewable contract between understanding and rendering.
 *
 * Two design rules run through the whole schema:
 *
 * 1. Everything time-like *inside* a scene is normalised 0..1, never a frame.
 *    Scene durations get re-solved to hit the target runtime, so any authored
 *    frame number would silently desync emphasis, callouts and signature modules.
 *
 * 2. Assets are local, always. Nothing in the render may wait on the network.
 */

import { z } from "zod";
import { SLOT_PX } from "../lib/design";
import { containSize, requiredSourcePx, type Move } from "../lib/move";

const zHex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "expected #rrggbb");
const zNorm = z.number().min(0).max(1);

/**
 * A normalised viewport rect in source-image space. The refine is what makes
 * frame-edge exposure impossible: see lib/move.ts for why containment of the
 * endpoints implies containment of the whole interpolation.
 */
export const zRect = z
  .object({
    x: zNorm,
    y: zNorm,
    w: z.number().min(0.02).max(1),
    h: z.number().min(0.02).max(1),
  })
  .refine((r) => r.x + r.w <= 1.0001 && r.y + r.h <= 1.0001, {
    message: "rect must lie fully inside the source image (overscan rule)",
  });

/** Art direction, harvested from the source site. This is the "骨". */
export const zArt = z.object({
  ground: z.enum(["paper", "ink", "tint"]),
  groundColor: zHex,
  ink: zHex,
  inkMuted: zHex,
  accent: zHex,
  accentAlt: zHex.optional(),
  radius: z.number().min(0).max(48),
  ruleWidth: z.number().min(0).max(6),
  texture: z.enum(["none", "grain", "grid", "paper"]),
  // Independent, because real sites pair them independently. Anthropic sets
  // headings in a sans and body copy in a serif; collapsing this to one toggle
  // loses the contrast that makes their typography recognisable.
  displayFace: z.enum(["serif", "sans"]),
  bodyFace: z.enum(["serif", "sans"]).default("sans"),
  sourceLabel: z.string().max(48),
});
export type Art = z.infer<typeof zArt>;

/** Motion signature, seeded off the source URL. This is the "魂". */
export const zMotion = z.object({
  seed: z.string().min(4),
  pace: z.enum(["staccato", "measured", "languid"]).default("measured"),
  easeFamily: z.enum(["crisp", "editorial", "overshoot"]).default("editorial"),
  panBias: z.enum(["ltr", "rtl", "converge", "settle"]).default("ltr"),
  revealStyle: z
    .enum(["mask-up", "rise", "scale-settle", "clause-cascade"])
    .default("mask-up"),
  // `iris` and `none` ship in @remotion/transitions 4.0.409 even though the
  // remotion-best-practices skill documents neither; verified against the
  // installed dist. `none` is expressed as `cut` here instead.
  transitionVocab: z
    .array(z.enum(["cut", "fade", "wipe", "slide", "flip", "clockWipe", "iris"]))
    .min(1),
  gridEnergy: z.number().min(0).max(1).default(0.3),
});
export type Motion = z.infer<typeof zMotion>;

export const zAsset = z.object({
  id: z.string().min(1),
  src: z
    .string()
    .refine((s) => !/^https?:/i.test(s), {
      message:
        "assets must be local (staticFile). Download them during harvest — the render never waits on the network.",
    }),
  intrinsic: z.object({
    w: z.number().int().positive(),
    h: z.number().int().positive(),
  }),
  role: z.enum(["figure", "diagram", "screenshot", "hero", "logo"]),
  alt: z.string().default(""),
  /** The original figcaption, verbatim and untranslated, kept for provenance. */
  sourceCaption: z.string().default(""),
});
export type Asset = z.infer<typeof zAsset>;

export const zMove = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("rects"), from: zRect, to: zRect }),
  z.object({
    kind: z.literal("push-in"),
    target: zRect,
    amount: z.number().min(1.02).max(1.6).default(1.18),
  }),
  z.object({
    kind: z.literal("pull-out"),
    target: zRect,
    amount: z.number().min(1.02).max(1.6).default(1.18),
  }),
  z.object({
    kind: z.literal("pan"),
    from: zRect,
    to: zRect,
    ease: z.enum(["linear", "settle"]).default("settle"),
  }),
  z.object({ kind: z.literal("hold"), target: zRect }),
]);

export const zEmphasis = z.object({
  /** Normalised position within the scene, so re-solving duration is safe. */
  at: zNorm,
  kind: z.enum([
    "punch",
    "flash",
    "underline",
    "strike",
    "callout",
    "desaturate",
    "rule-sweep",
  ]),
  /** "headline" | "sub" | "line:2" | "item:3" | "callout:1" */
  target: z.string().default("headline"),
});

const zText = z.object({
  eyebrow: z.string().max(24).optional(),
  // 100 rather than 80 because the `quote` shot carries its quotation here, and
  // 80 could not hold a real sentence. The binding limit is still the per-box
  // character budget, which is tighter — see cjk-type.md.
  headline: z.string().max(100).optional(),
  sub: z.string().max(160).optional(),
  caption: z.string().max(200).optional(),
  credit: z.string().max(120).optional(),
  items: z
    .array(z.object({ label: z.string().max(12), text: z.string().max(60) }))
    .max(4)
    .optional(),
  stat: z
    .object({
      value: z.string().max(10),
      unit: z.string().max(8).optional(),
      of: z.string().max(40),
    })
    .optional(),
});
export type SceneText = z.infer<typeof zText>;

export const zSceneAsset = z.object({
  ref: z.string().min(1),
  slot: z.enum(["full", "left", "right", "inset", "band"]).default("full"),
  /**
   * "cover" fills the slot and crops the overflow — right for photographs and for
   * a figure used as a backdrop. "contain" fits the whole image inside the slot,
   * letterboxed by the ground — right for charts, schematics, screenshots and
   * anything whose edges carry meaning. Every slot is 1.78:1 or wider, so a
   * taller-than-16:9 chart under "cover" loses its title and axis labels.
   *
   * `move` is ignored when fit is "contain": there is nothing to pan within.
   */
  fit: z.enum(["cover", "contain"]).default("cover"),
  move: zMove,
});

export const zScene = z
  .object({
    id: z.string().min(1),
    shot: z.enum([
      "title",
      "statement",
      "stat",
      "quote",
      "figure",
      "compare",
      "diagram",
      "caveat",
      "ladder",
      "outro",
    ]),
    /** Dimensionless. The solver converts weights to frames. Never author frames. */
    weight: z.number().min(0.4).max(4),
    text: zText,
    assets: z.array(zSceneAsset).max(2).default([]),
    callouts: z
      .array(
        z.object({
          at: zNorm,
          text: z.string().max(48),
          anchor: z.object({ x: zNorm, y: zNorm }),
          focus: zRect.optional(),
        }),
      )
      .max(4)
      .default([]),
    emphasis: z.array(zEmphasis).max(4).default([]),
    /** --voice only; also the alignment source for burned-in captions. */
    narration: z.string().max(220).optional(),
    transitionOut: z
      .object({
        kind: z.enum([
          "cut",
          "fade",
          "wipe",
          "slide",
          "flip",
          "clockWipe",
          "iris",
        ]),
        frames: z.number().int().min(0).max(30).default(12),
        direction: z
          .enum(["from-left", "from-right", "from-top", "from-bottom"])
          .optional(),
        timing: z.enum(["linear", "spring"]).default("linear"),
      })
      .default({ kind: "fade", frames: 12, timing: "linear" }),
    signature: z
      .object({
        module: z.string().regex(/^[A-Za-z][A-Za-z0-9]*$/),
        params: z
          .record(z.union([z.string(), z.number(), z.boolean()]))
          .default({}),
      })
      .optional(),
  })
  .refine((s) => s.shot !== "diagram" || s.callouts.length >= 2, {
    message: "a diagram shot needs at least 2 callouts, else use figure",
  })
  .refine((s) => s.shot !== "stat" || s.text.stat !== undefined, {
    message: "a stat shot needs text.stat",
  })
  .refine(
    (s) => !["ladder", "compare"].includes(s.shot) || (s.text.items?.length ?? 0) >= 2,
    { message: "ladder and compare shots need at least 2 text.items" },
  );
export type Scene = z.infer<typeof zScene>;

export const zStoryboard = z
  .object({
    version: z.literal(1),
    meta: z.object({
      sourceUrl: z.string().url(),
      sourceTitle: z.string().min(1),
      author: z.string().default(""),
      publishedAt: z.string().default(""),
      lang: z.literal("zh-Hans"),
      /** <=15 "words"; in Chinese that is a hard cap of 40 characters. */
      coreMessage: z.string().max(40),
      arc: z.enum([
        "problem-solution",
        "situation-complication-resolution",
        "what-why-how",
        "past-present-future",
        "claim-evidence-implication",
      ]),
    }),
    target: z.object({
      fps: z.literal(30),
      width: z.literal(1920),
      height: z.literal(1080),
      // Bounds are permissive on purpose. The real constraint on runtime is the
      // per-scene floor, which resolveTimeline enforces against actual content.
      // The upper bound has to clear 口播 mode: narration is slower than reading,
      // so a voice board runs noticeably longer than the same content in music
      // mode — the reference article is 95s read and 148s narrated. In voice mode
      // this field is an assertion about the result rather than a target to solve.
      seconds: z.number().min(15).max(300),
      toleranceFrames: z.number().int().min(0).max(60).default(30),
    }),
    art: zArt,
    motion: zMotion,
    audio: z.object({
      mode: z.enum(["music", "voice"]),
      bed: z.string().optional(),
      bedGain: z.number().min(0).max(1).default(0.34),
      duckTo: z.number().min(0).max(1).default(0.11),
      voiceDir: z.string().optional(),
    }),
    assets: z.array(zAsset),
    scenes: z.array(zScene).min(4).max(14),
  })
  .superRefine((sb, ctx) => {
    const byId = new Map(sb.assets.map((a) => [a.id, a]));

    const dupes = sb.assets.length - byId.size;
    if (dupes > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["assets"],
        message: `duplicate asset ids (${dupes})`,
      });
    }

    const sceneIds = new Set(sb.scenes.map((s) => s.id));
    if (sceneIds.size !== sb.scenes.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scenes"],
        message: "scene ids must be unique",
      });
    }

    sb.scenes.forEach((sc, i) => {
      sc.assets.forEach((a, j) => {
        const asset = byId.get(a.ref);
        if (!asset) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["scenes", i, "assets", j, "ref"],
            message: `unknown asset "${a.ref}"`,
          });
          return;
        }

        // RESOLUTION GUARD. Cropping tighter than the source's real pixels is
        // invisible in a thumbnail and obvious at 1080p, so it fails the build.
        // For "cover" this measures the move AFTER aspect normalisation, which is
        // what actually gets rendered — a rect that looked fine before snapping to
        // the slot's aspect can still demand more pixels than exist. For "contain"
        // there is no crop, so the demand is simply the fitted size.
        const dest = SLOT_PX[a.slot];
        const need =
          a.fit === "contain"
            ? containSize(asset.intrinsic, dest)
            : requiredSourcePx(a.move as Move, asset.intrinsic, dest);
        if (
          need.w > asset.intrinsic.w * 1.02 ||
          need.h > asset.intrinsic.h * 1.02
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["scenes", i, "assets", j],
            message:
              `crop would upscale "${a.ref}": needs ${Math.ceil(need.w)}x${Math.ceil(need.h)}px, ` +
              `source is ${asset.intrinsic.w}x${asset.intrinsic.h}. ` +
              `Widen the crop rect or use a smaller slot than "${a.slot}".`,
          });
        }
      });

      // Callout ordering: they narrate a sequence, so out-of-order reads as a bug.
      for (let k = 1; k < sc.callouts.length; k++) {
        if (sc.callouts[k]!.at <= sc.callouts[k - 1]!.at) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["scenes", i, "callouts", k, "at"],
            message: "callouts must be strictly ordered by `at`",
          });
        }
      }
    });

    // `mode` describes the NARRATION strategy, not whether there is music:
    // "music" means "no voice track". A bed is optional within it, because a
    // silent cut is a legitimate deliverable and forcing a file here would make
    // the schema demand an asset the user may not have licensed.
    if (sb.audio.mode === "voice") {
      const missing = sb.scenes.filter((s) => !s.narration).map((s) => s.id);
      if (missing.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["audio", "mode"],
          message: `voice mode needs narration on every scene; missing: ${missing.join(", ")}`,
        });
      }
    }
  });

export type Storyboard = z.infer<typeof zStoryboard>;

/**
 * Parse with an error that a human can act on.
 *
 * Raw ZodError stringifies to a wall of nested JSON that gets truncated in
 * Remotion's error overlay, which is exactly when you most need to read it. This
 * flattens each issue to `path: message`, so the resolution-guard and
 * readability messages actually reach the person who has to fix the board.
 */
export const parseStoryboard = (input: unknown): Storyboard => {
  const result = zStoryboard.safeParse(input);
  if (result.success) return result.data;
  const lines = result.error.issues.map((i) => {
    const where = i.path.length ? i.path.join(".") : "(root)";
    return `  • ${where}: ${i.message}`;
  });
  throw new Error(
    `storyboard.json is invalid (${result.error.issues.length} problem${result.error.issues.length === 1 ? "" : "s"}):\n${lines.join("\n")}`,
  );
};

/**
 * Font loading.
 *
 * Do NOT route Chinese through @remotion/google-fonts. `NotoSansSC` there
 * exposes 101 subsets x 9 weights, and Chinese does not live in a subset you
 * can name — it is spread across subsets literally called "[21]" .. "[119]".
 * loadFont() creates one FontFace and one delayRender() handle per
 * (style, weight, subset), so loading Chinese "properly" that way means 200+
 * render-blocking handles and 200+ CDN fetches per frame-tab. That is the
 * delayRender blow-up, the nondeterminism and the payload problem at once.
 *
 * Instead: scripts/build-fonts.mjs subsets the faces locally with pyftsubset to
 * exactly the codepoints this storyboard uses (~340 for a typical 85s video,
 * ~45KB per weight vs ~10MB), writes them into public/fonts/, and we load them
 * here with ONE handle and zero network.
 */

import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";

/**
 * Named by what they ARE, not by the role they play. Harvested sites pair these
 * both ways round — Anthropic, for instance, sets headings in a sans and body in
 * a serif — so a FONT_DISPLAY/FONT_BODY naming would have been actively misleading.
 */
export const FONT_SANS = "H2V Sans";
export const FONT_SERIF = "H2V Serif";

type Face = {
  family: string;
  file: string;
  weight: string;
};

/**
 * Two faces, not five: the sources are VARIABLE fonts and pyftsubset preserves
 * the `wght` axis through subsetting (verified: fvar survives as wght 100..900).
 * Declaring a weight RANGE on the FontFace lets every weight the type scale asks
 * for — 400, 500, 600, 700 — come out of one file. Fewer files, fewer awaits,
 * and no risk of one weight silently failing to load and falling back.
 */
const FACES: readonly Face[] = [
  { family: FONT_SANS, file: "fonts/h2v-sans.woff2", weight: "100 900" },
  { family: FONT_SERIF, file: "fonts/h2v-serif.woff2", weight: "100 900" },
];

let loading: Promise<void> | null = null;

/**
 * Idempotent. Resolves once every face is registered and document.fonts is
 * ready, which is the precondition for measureText returning real metrics.
 */
export const waitForFonts = (): Promise<void> => {
  if (loading) return loading;

  const handle = delayRender("html2video: loading subsetted CJK fonts", {
    timeoutInMilliseconds: 60_000,
    retries: 1,
  });

  loading = (async () => {
    await Promise.all(
      FACES.map(async (f) => {
        const face = new FontFace(
          f.family,
          `url(${staticFile(f.file)}) format('woff2')`,
          {
            weight: f.weight,
            style: "normal",
            // `block` so text never paints in a fallback face mid-render.
            display: "block",
            // No unicodeRange on purpose: the subset IS the range. Declaring one
            // would re-introduce the per-range splitting we just eliminated.
          },
        );
        await face.load();
        document.fonts.add(face);
      }),
    );
    await document.fonts.ready;
  })()
    .then(() => {
      continueRender(handle);
    })
    .catch((err) => {
      cancelRender(err);
      throw err;
    });

  return loading;
};

/**
 * Resolve a family from the harvested pairing. Display and body are independent
 * because real sites pair them independently; collapsing them to one toggle threw
 * away the contrast that makes a site's typography recognisable.
 */
export const familyFor = (face: "serif" | "sans"): string =>
  face === "serif" ? FONT_SERIF : FONT_SANS;

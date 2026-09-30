/**
 * Config for the html2video render engine.
 *
 * BROWSER CHOICE — this cost 18 minutes of a render that never produced a frame.
 *
 * The obvious-looking pattern, copied from other local Remotion projects, is to
 * resolve a browser executable yourself and fall back to the system Chrome:
 *
 *     if (existsSync(headlessShell)) { …setBrowserExecutable(headlessShell) }
 *     else { …setBrowserExecutable("/Applications/Google Chrome.app/…") }
 *
 * Do not do that. Pointing Remotion at the system Chrome hangs whenever the user
 * already has Chrome open with a profile — which is essentially always. The new
 * invocation tries to join the running instance instead of starting a fresh one,
 * so Remotion's CDP connection never establishes. Symptom: the process sits at
 * ~0.5% CPU with 0 frames rendered and no error, indefinitely.
 *
 * Worse, setting the executable also makes `npx remotion browser ensure` a no-op
 * ("Has browser at …"), so the reliable browser never gets downloaded.
 *
 * Declaring the MODE and letting Remotion manage the binary is correct: it
 * downloads chrome-headless-shell (~85MB, once) and uses an isolated profile.
 * Set H2V_BROWSER to override for debugging.
 */

import { Config } from "@remotion/cli/config";

/**
 * PNG intermediate frames, not JPEG.
 *
 * `jpeg` is the sensible default for video-footage content and is what other
 * Remotion projects use, but this pipeline renders flat colour fields and fine
 * CJK strokes — exactly the content where JPEG's DCT ringing shows up along
 * glyph edges and where chroma subsampling hurts a 2px accent rule.
 *
 * Measured on scene s4 of the reference board, SSIM against a `remotion still`
 * of the same frame as ground truth:
 *     jpeg  0.9874
 *     png   0.9944      (error roughly halved)
 * for a 6% increase in output size. Worth it; the cost is render time and temp
 * disk, not quality.
 */
Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);

// Generous because calculateMetadata does real I/O (storyboard parse, timing
// solve, crop validation). Nothing in the render waits on the network — that
// invariant is enforced by scripts/lint_render_safety.mjs.
Config.setDelayRenderTimeoutInMilliseconds(120_000);

Config.setChromeMode("headless-shell");
if (process.env.H2V_BROWSER) {
  Config.setBrowserExecutable(process.env.H2V_BROWSER);
}

// swiftshader keeps text and gradient rasterisation consistent across machines,
// which is a precondition for the determinism check.
Config.setChromiumOpenGlRenderer("swiftshader");

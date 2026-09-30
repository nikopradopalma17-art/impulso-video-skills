/**
 * Determinism sandbox. Imported first from Root.tsx, before any component.
 *
 * Remotion renders frames across several browser tabs that share no state, so a
 * non-deterministic value doesn't just make runs differ — it makes frames within
 * one run disagree, which shows up as mid-shot flicker. The usual culprits are
 * Math.random and the clock.
 *
 * These are hard overrides rather than lint rules because a lint rule only covers
 * code we wrote; a transitive dependency calling Math.random would slip past it.
 * Only active while rendering, so Studio keeps normal behaviour for debugging.
 */

import { getRemotionEnvironment, random } from "remotion";

declare global {
  interface Window {
    __h2vSandboxed?: boolean;
  }
}

const install = (): void => {
  if (typeof window === "undefined") return;
  if (window.__h2vSandboxed) return;
  if (!getRemotionEnvironment().isRendering) return;

  let counter = 0;
  // Seeded and monotone: identical for a given tab AND across tabs, because the
  // sequence depends only on call order within a frame render.
  Math.random = () => random(`h2v-sandbox-${counter++}`);

  const FROZEN_EPOCH = 1_700_000_000_000;
  Date.now = () => FROZEN_EPOCH;
  if (typeof performance !== "undefined") {
    performance.now = () => 0;
  }

  window.__h2vSandboxed = true;
};

install();

export {};

#!/usr/bin/env node
/**
 * Static gate over the render engine.
 *
 * Every rule here corresponds to a failure mode of Remotion's rendering model,
 * where frames are produced by parallel browser tabs that share no state:
 *
 *   - CSS animation/transition either doesn't render or flickers between tabs
 *   - unseeded randomness and clock reads differ per tab and per run
 *   - useState/useEffect timing differs per tab
 *   - a remote URL turns a delayRender into a timeout on a slow tab
 *
 * These are heuristics, not proof. The proof is verify_determinism.mjs, which
 * renders the same frames twice in separate processes and compares hashes. This
 * exists because it is far cheaper and catches the mistakes people actually make.
 *
 * Usage: node lint_render_safety.mjs [--dir SRC]
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILL = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const dirFlag = args.indexOf("--dir");
const ROOT = path.resolve(
  dirFlag >= 0 ? args[dirFlag + 1] : path.join(SKILL, "assets/template/src"),
);

/**
 * `allow` lists files where a rule is legitimately needed. WaitForFonts is the
 * one component permitted to use React state: it exists precisely to gate the
 * composition until fonts load, and nothing may measure text before it resolves.
 */
const RULES = [
  {
    id: "css-animation",
    re: /@keyframes|animation\s*:|animation-name|transition\s*:|\banimate-[a-z]/,
    why: "CSS animation/transition does not render in Remotion and flickers across parallel tabs. Drive it from useCurrentFrame() instead.",
  },
  {
    id: "transform-string",
    re: /transform\s*:\s*[`"']/,
    why: "Use individual scale/translate/rotate properties, not a composed transform string — Remotion Studio cannot edit the latter and it composes unpredictably.",
  },
  {
    id: "math-random",
    re: /Math\s*\.\s*random/,
    why: "Nondeterministic per tab. Use random(seed) from remotion.",
    allow: ["lib/sandbox.ts"],
  },
  {
    id: "clock",
    re: /Date\s*\.\s*now|new\s+Date\s*\(\s*\)|performance\s*\.\s*now/,
    why: "Nondeterministic per tab and per run.",
    allow: ["lib/sandbox.ts"],
  },
  {
    id: "react-state",
    re: /\buseState\s*\(|\buseEffect\s*\(|\buseRef\s*\(/,
    why: "Effect and state timing differ per tab. Derive from useCurrentFrame().",
    allow: ["lib/WaitForFonts.tsx"],
  },
  {
    id: "timers",
    re: /setTimeout|setInterval|requestAnimationFrame/,
    why: "Wall-clock timing has no meaning when frames are rendered out of order.",
  },
  {
    id: "remote-url",
    re: /["'`]https?:\/\//,
    why: "The render must never wait on the network. Download at harvest time and reference via staticFile().",
    // Provenance and seed strings are never fetched — they are displayed or hashed.
    // Asset URLs are a separate concern and are rejected by the schema itself
    // (`asset.src` and `audio.bed` both refuse `^https?:`), which is the real gate.
    // This rule's job is to catch a CDN font or image hardcoded into a component.
    skipLine: /\b(sourceUrl|seed|credit|sourceLabel|documentationLink|href)\s*[:=]/,
  },
  {
    id: "network",
    re: /\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/,
    why: "No I/O during rendering; it turns into a delayRender timeout.",
  },
  {
    id: "raw-html",
    re: /dangerouslySetInnerHTML|<style[\s>]/,
    why: "Harvested markup must never reach the render — it carries animation and remote references.",
  },
  {
    id: "fixed-position",
    re: /position\s*:\s*["']fixed["']/,
    why: "Fixed positioning escapes the composition's transform and breaks at non-1x preview scale.",
  },
];

const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|jsx?|mts|mjs)$/.test(entry)) out.push(p);
  }
  return out;
};

const files = walk(ROOT);
let problems = 0;

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const lines = readFileSync(file, "utf8").split("\n");

  for (const rule of RULES) {
    if (rule.allow?.some((a) => rel === a || rel.endsWith(a))) continue;

    lines.forEach((line, i) => {
      // Skip comments: the rules are quoted verbatim in explanatory prose all
      // over this codebase, and flagging documentation would train people to
      // ignore the linter.
      const t = line.trim();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return;
      if (!rule.re.test(line)) return;
      if (rule.skipLine?.test(line)) return;
      problems++;
      console.log(`${rel}:${i + 1}  [${rule.id}]`);
      console.log(`  ${t.slice(0, 110)}`);
      console.log(`  → ${rule.why}\n`);
    });
  }
}

console.log(
  problems === 0
    ? `render-safety: PASS (${files.length} files)`
    : `render-safety: ${problems} problem(s) across ${files.length} files`,
);
process.exit(problems === 0 ? 0 : 1);

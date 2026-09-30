#!/usr/bin/env node
/**
 * Assert every character the storyboard will render has a glyph in the subsetted
 * fonts.
 *
 * The failure this prevents is tofu boxes in the finished MP4 — and it is worth a
 * dedicated check because it is nearly invisible until then. Font subsetting is
 * driven by the storyboard, so the two are normally in sync; they fall out of sync
 * whenever text is edited without re-running build_fonts, which is exactly the
 * kind of step that gets skipped during a quick iteration.
 *
 * Reads the woff2 cmap with fontTools, via the same Python that owns pyftsubset.
 *
 * Usage: node check_glyph_coverage.mjs --storyboard DIR_OR_FILE [--fonts DIR]
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const STUDIO = process.env.H2V_STUDIO || path.join(homedir(), ".cache/html2video/studio");

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};

const sbArg = flag("--storyboard");
if (!sbArg) {
  console.error("--storyboard <dir|file> is required");
  process.exit(2);
}
const sbPath = sbArg.endsWith(".json") ? path.resolve(sbArg) : path.resolve(sbArg, "storyboard.json");
const fontsDir = path.resolve(flag("--fonts", path.join(STUDIO, "public/fonts")));

/**
 * Which Python owns fontTools. `pyftsubset` is a console script, so its shebang
 * names the interpreter that can import the library — the system python3 usually
 * cannot.
 */
const pythonForFontTools = () => {
  try {
    const which = execFileSync("which", ["pyftsubset"], { encoding: "utf8" }).trim();
    const shebang = readFileSync(which, "utf8").split("\n")[0];
    if (shebang.startsWith("#!")) return shebang.slice(2).trim();
  } catch {
    /* fall through */
  }
  return "python3";
};

/**
 * Every string that can reach the screen. Deliberately mirrors the collector in
 * build_fonts.mjs — same keys skipped — so the two agree by construction rather
 * than by both happening to be right.
 */
const SKIP_KEYS = new Set(["src", "sourceUrl", "bed", "voiceDir", "sourceCaption", "seed", "id", "ref"]);
const collect = (node, acc = []) => {
  if (typeof node === "string") acc.push(node);
  else if (Array.isArray(node)) node.forEach((n) => collect(n, acc));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (SKIP_KEYS.has(k)) continue;
      collect(v, acc);
    }
  }
  return acc;
};

const sb = JSON.parse(readFileSync(sbPath, "utf8"));
const text = collect(sb).join("");
const wanted = new Set(
  Array.from(text).filter((c) => c !== "\n" && c !== "\r" && c !== " " && c !== "　"),
);

const faces = ["h2v-sans.woff2", "h2v-serif.woff2"];
const missingFaces = faces.filter((f) => !existsSync(path.join(fontsDir, f)));
if (missingFaces.length) {
  console.error(
    `missing subsetted font(s): ${missingFaces.join(", ")} in ${fontsDir}\n` +
      `run: node scripts/build_fonts.mjs --storyboard ${sbPath} --out ${fontsDir}`,
  );
  process.exit(1);
}

const py = pythonForFontTools();
const script = `
import json, sys
from fontTools.ttLib import TTFont
out = {}
for f in sys.argv[1:]:
    try:
        out[f] = sorted(TTFont(f).getBestCmap().keys())
    except Exception as e:
        out[f] = {"error": str(e)}
print(json.dumps(out))
`;

let cmaps;
try {
  const raw = execFileSync(py, ["-c", script, ...faces.map((f) => path.join(fontsDir, f))], {
    encoding: "utf8",
  });
  cmaps = JSON.parse(raw);
} catch (e) {
  console.error(`could not read font cmaps with ${py}: ${e.message}`);
  console.error("is fontTools importable there? try: pyftsubset --help");
  process.exit(1);
}

let problems = 0;
console.log(`\nchecking ${wanted.size} distinct codepoint(s) against ${faces.length} face(s)\n`);

for (const [file, cps] of Object.entries(cmaps)) {
  const name = path.basename(file);
  if (!Array.isArray(cps)) {
    console.log(`  ${name}: unreadable — ${cps.error}`);
    problems++;
    continue;
  }
  const have = new Set(cps);
  const missing = [...wanted].filter((c) => !have.has(c.codePointAt(0)));
  if (missing.length === 0) {
    console.log(`  ${name.padEnd(20)} ${String(cps.length).padStart(5)} glyphs — full coverage`);
  } else {
    problems++;
    // Both faces are used somewhere in every board (display vs body), so a gap in
    // either is a real risk, not a theoretical one.
    console.log(
      `  ${name.padEnd(20)} ${String(cps.length).padStart(5)} glyphs — MISSING ${missing.length}: ${missing.slice(0, 40).join("")}`,
    );
  }
}

console.log(
  problems === 0
    ? `\nglyph coverage: PASS\n`
    : `\nglyph coverage: FAIL — re-run build_fonts.mjs against the current storyboard\n`,
);
process.exit(problems === 0 ? 0 : 1);
